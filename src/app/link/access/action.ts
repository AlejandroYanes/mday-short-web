'use server'

import { redirect } from 'next/navigation';
import { cookies, headers } from 'next/headers';
import { sql } from '@vercel/postgres';
import { nanoid } from 'nanoid';

import type { ShortLink } from 'models/links';
import { VISITOR_ACCESS_COOKIE, VISITOR_ID_COOKIE } from 'utils/cookies';
import { sendTinyBirdLinkHitEvent } from 'utils/tiny-bird';

interface AccessPayload {
  domain?: string;
  wslug?: string;
  slug: string;
  password: string;
}

export async function validatePassword(data: AccessPayload) {
  const { domain, wslug, slug, password } = data;

  let linkQuery;

  if (domain) {
    linkQuery = await sql<ShortLink>`SELECT * FROM "Link" WHERE slug = ${slug} AND domain = ${domain} AND password = ${password}`;
  } else {
    linkQuery = await sql<ShortLink>`SELECT * FROM "Link" WHERE slug = ${slug} AND wslug = ${wslug} AND password = ${password}`;
  }

  if (linkQuery.rowCount === 0) {
    const visitorCookie = cookies().get(VISITOR_ID_COOKIE);
    const visitorId = visitorCookie?.value || nanoid();

    if (!visitorCookie) {
      cookies().set(VISITOR_ID_COOKIE, visitorId, { sameSite: 'strict' });
    }

    sendTinyBirdLinkHitEvent({
      event: 'link_access_denied',
      visitor_id: visitorId,
      wslug,
      slug,
      domain,
      user_agent: headers().get('user-agent') ?? undefined,
    });
    return { access: 'denied' };
  }

  cookies().set(VISITOR_ACCESS_COOKIE({ slug, wslug, domain }), 'granted');

  if (domain) {
    redirect(`/${slug}`);
  }

  redirect(`/${wslug}/${slug}`);
}
