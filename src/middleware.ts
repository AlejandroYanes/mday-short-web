import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { sql } from '@vercel/postgres';

import type { ShortLink } from 'models/links';
import { VISITOR_ACCESS_COOKIE } from 'utils/cookies';
import { updateSession } from 'utils/auth';

export const config = {
  matcher: [
    '/visit/:slug',
    '/api/mday/links/:path*',
  ],
}

export async function middleware(req: NextRequest) {
  console.log('req.nextUrl.pathname', req.nextUrl.pathname);
  if (req.nextUrl.pathname.startsWith('/api/mday/links') && req.method !== 'OPTIONS') {
    return updateSession(req);
  }

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
  const slug = req.nextUrl.pathname.split('/')[2];
  const url = req.nextUrl.clone();

  if (!slug) {
    url.pathname = '/link/not-found';
    return NextResponse.redirect(url);
  }

  const query = await sql`SELECT url, password, "expiresAt" from "Link" WHERE slug = ${slug}`;
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
  // return NextResponse.rewrite(linkedUrl);

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
