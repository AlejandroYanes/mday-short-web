import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { sql } from '@vercel/postgres';

import type { ShortLink } from 'models/links';
import { VISITOR_ACCESS_COOKIE } from 'utils/cookies';

export const config = {
  matcher: [
    '/v/:wslug/:slug*',
    // TODO: this is a list of Monday.com paths that can not be handled by this middleware
    //       this would allow for url masking but the form it's protected with CORS
    //       might be worth to add a UI options and let users toggle it on/off
    // '/embed/:mid*',
    // '/forms/:mid*',
    // '/cdn-cgi/:path*',
  ],
}

export async function middleware(req: NextRequest) {
  // const visitorCookie = req.cookies.get(VISITOR_ID_COOKIE);
  // const visitorId = visitorCookie?.value || createId();

  // const { isBot, device } = userAgent(req);
  // if (!isBot) {
  //   await recordEvent({
  //     id: createId(),
  //     experiment: LANDING_PAGE_EXPERIMENT,
  //     variant,
  //     event: 'view',
  //     visitorId,
  //     country: req.geo?.country,
  //     region: req.geo?.region,
  //     device: device.type,
  //   });
  // }

  // TODO: these are the Monday.com paths that can not be handled by this middleware
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

  const wslug = req.nextUrl.pathname.split('/')[2];
  const slug = req.nextUrl.pathname.split('/')[3];
  const url = req.nextUrl.clone();

  if (!wslug || !slug) {
    url.pathname = '/link/not-found';
    return NextResponse.redirect(url);
  }

  const query = await sql`SELECT url, password, "expiresAt" from "Link" WHERE slug = ${slug} AND wslug = ${wslug};`;
  const link = query.rows[0] as ShortLink;

  if (!query.rowCount) {
    url.pathname = '/link/not-found';
    return NextResponse.rewrite(url);
  }

  if (link.password) {
    const access = cookies().get(VISITOR_ACCESS_COOKIE(slug))?.value;

    if (access !== 'granted') {
      url.pathname = '/link/access';
      url.searchParams.set('slug', slug);
      return NextResponse.redirect(url);
    }
  }

  if (link.expiresAt && new Date(link.expiresAt) < new Date()) {
    url.pathname = '/link/expired';
    return NextResponse.rewrite(url);
  }

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
