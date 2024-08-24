import type { NextRequest } from 'next/server';
import { NextResponse, userAgent } from 'next/server';
import { cookies, headers } from 'next/headers';
import { sql } from '@vercel/postgres';
import { nanoid } from 'nanoid';

import type { ShortLink } from 'models/links';
import { VISITOR_ACCESS_COOKIE, VISITOR_ID_COOKIE } from 'utils/cookies';
import { EXCLUDED_DOMAINS } from 'utils/domains';
import { type LinkEventData, sendTinyBirdLinkHitEvent } from 'utils/tiny-bird';

export const config = {
  matcher: [
    // eslint-disable-next-line max-len
    '/((?!api|_next/static|_next/image|_vercel|logo|illustrations|screenshots|favicon.ico|favicon.png|service.worker.js|service-worker.js|monday-app-association.json|how-to-use|link|pricing|privacy-policy|signin|terms-of-service|links|users|plans).*)',
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

  const pathsToIgnore = ['/'];
  if (pathsToIgnore.includes(url.pathname)) {
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

  const visitorCookie = cookies().get(VISITOR_ID_COOKIE);
  const visitorId = visitorCookie?.value || nanoid();

  const eventData: Omit<LinkEventData, 'event'> = {
    slug,
    wslug: wslug || '-',
    domain,
    visitor_id: visitorId,
    user_agent: headers().get('user-agent') ?? 'bot',
    location: {
      country: req.geo?.country,
      city: req.geo?.city,
      region: req.geo?.region,
    },
    device: {
      type: device.type,
      vendor: device.vendor,
      model: device.model,
    },
  };

  if (!query.rows[0]) {
    sendTinyBirdLinkHitEvent({ event: 'link_not_found', ...eventData });
    url.pathname = '/link/not-found';
    return NextResponse.rewrite(url);
  }

  sendTinyBirdLinkHitEvent({ event: 'link_hit', ...eventData });

  const link = query.rows[0] as ShortLink;

  if (link.password) {
    sendTinyBirdLinkHitEvent({ event: 'link_access_check', ...eventData });
    const access = cookies().get(VISITOR_ACCESS_COOKIE({ slug, wslug, domain }))?.value;

    if (access !== 'granted') {
      await sendTinyBirdLinkHitEvent({ event: 'link_access_granted', ...eventData });
      url.pathname = '/link/access';

      if (wslug) url.searchParams.set('wslug', wslug);

      url.searchParams.set('slug', slug);
      return NextResponse.redirect(url);
    }
  }

  if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
    sendTinyBirdLinkHitEvent({ event: 'link_expired', ...eventData });
    url.pathname = '/link/expired';
    return NextResponse.rewrite(url);
  }

  sendTinyBirdLinkHitEvent({ event: 'link_view', ...eventData,  });

  const res = NextResponse.redirect(link.url);

  if (!visitorCookie) {
    res.cookies.set(VISITOR_ID_COOKIE, visitorId, {
      sameSite: 'strict',
    });
  }

  return res;
}
