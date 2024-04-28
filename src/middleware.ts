import type { NextRequest } from 'next/server';
import { NextResponse, userAgent } from 'next/server';
import { cookies } from 'next/headers';
import { sql } from '@vercel/postgres';

import type { ShortLink } from 'models/links';
import { VISITOR_ACCESS_COOKIE } from 'utils/cookies';
import { EXCLUDED_DOMAINS } from 'utils/domains';
import { type LinkEventData, sendTinyBirdLinkHitEvent } from 'utils/tiny-bird';

export const config = {
  matcher: [
    // '/v(.*)',
    // eslint-disable-next-line max-len
    '/((?!api|_next/static|_next/image|_vercel|logo|illustrations|screenshots|favicon.ico|monday-app-association.json|how-to-use|link|pricing|privacy-policy|signin|terms-of-service|links|users|plans).*)',
    // TODO: this is a list of Monday.com paths that can not be handled by this middleware
    //       this would allow for url masking but the form it's protected with CORS
    //       might be worth to add a UI option and let users toggle it on/off
    // '/embed/:mid*',
    // '/forms/:mid*',
    // '/cdn-cgi/:path*',
  ],
}

export async function middleware(req: NextRequest) {
  // TODO: these are the Monday.com paths that can not be handled by this middleware.
  //      Maybe I could add a check for domain
  // if (req.nextUrl.pathname.startsWith('/embed')) {
  //   // re-route the req to https://view.monday.com
  //   const mid = req.nextUrl.pathname.split('/')[2];
  //   const url = new URL(`https://view.monday.com/embed/${mid}`);
  //   return NextResponse.redirect(url);
  // }
  //
  // if (req.nextUrl.pathname.startsWith('/forms')) {
  //   // re-route the req to https://forms.monday.com/forms
  //   const mid = req.nextUrl.pathname.split('/')[2];
  //   const url = new URL(`https://forms.monday.com/forms/${mid}`);
  //   return NextResponse.redirect(url);
  // }
  //
  // if (req.nextUrl.pathname.startsWith('/cdn-cgi')) {
  //   // re-route the req to https://forms.monday.com/cdn-cgi
  //   const path = req.nextUrl.pathname.split('/').slice(2).join('/');
  //   const url = new URL(`https://forms.monday.com/${path}`);
  //   return NextResponse.redirect(url);
  // }

  const url = req.nextUrl.clone();

  if (req.nextUrl.pathname === '/' || req.nextUrl.pathname === '/service.worker.js') {
    return NextResponse.next();
  }

  const domain = req.nextUrl.hostname;
  let wslug;
  let slug;
  let query;

  if (!EXCLUDED_DOMAINS.includes(domain)) {
    slug = req.nextUrl.pathname.split('/')[1];

    if (!slug) {
      url.pathname = '/link/not-found';
      return NextResponse.rewrite(url);
    }

    query = await sql<{ url: string; password: string; expiresAt: string }>`
      SELECT url, password, "expiresAt" from "Link" WHERE slug = ${slug} AND domain = ${domain};`;
  } else {
    wslug = req.nextUrl.pathname.split('/')[1];
    slug = req.nextUrl.pathname.split('/')[2];

    if (!wslug || !slug) {
      url.pathname = '/link/not-found';
      return NextResponse.rewrite(url);
    }

    query = await sql<{ url: string; password: string; expiresAt: string }>`
      SELECT url, password, "expiresAt" from "Link" WHERE slug = ${slug} AND wslug = ${wslug};`;
  }

  const { device } = userAgent(req);

  const payload: LinkEventData['payload'] = {
    country: req.geo?.country,
    region: req.geo?.region,
    device: device,
  };

  sendTinyBirdLinkHitEvent({ event: 'link_hit', wslug, slug, domain, payload });

  if (!query.rows[0]) {
    sendTinyBirdLinkHitEvent({ event: 'link_not_found', wslug, slug, domain, payload });
    url.pathname = '/link/not-found';
    return NextResponse.rewrite(url);
  }

  const link = query.rows[0] as ShortLink;

  if (link.password) {
    sendTinyBirdLinkHitEvent({ event: 'link_access_check', wslug, slug, domain, payload });
    const access = cookies().get(VISITOR_ACCESS_COOKIE({ slug, wslug, domain }))?.value;

    if (access !== 'granted') {
      await sendTinyBirdLinkHitEvent({ event: 'link_access_granted', wslug, slug, domain, payload });
      url.pathname = '/link/access';

      if (wslug) url.searchParams.set('wslug', wslug);

      url.searchParams.set('slug', slug);
      return NextResponse.redirect(url);
    }
  }

  if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
    sendTinyBirdLinkHitEvent({ event: 'link_expired', wslug, slug, domain, payload });
    url.pathname = '/link/expired';
    return NextResponse.rewrite(url);
  }

  sendTinyBirdLinkHitEvent({ event: 'link_view', wslug, slug, domain, payload,  });

  return NextResponse.redirect(link.url);
  // return NextResponse.rewrite(link.url);

  // if (variant !== 'default') {
  //   url.pathname = `/x/${variant}`;
  // }

  // if (!variantCookie) {
  //   res.cookies.set(LANDING_PAGE_EXPERIMENT_COOKIE, variant, {
  //     sameSite: 'strict',
  //   });
  // }
  //
  // if (!visitorCookie) {
  //   res.cookies.set(VISITOR_ID_COOKIE, visitorId, {
  //     sameSite: 'strict',
  //   });
  // }
}
