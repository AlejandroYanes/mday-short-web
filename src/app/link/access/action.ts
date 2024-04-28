'use server'

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { sql } from '@vercel/postgres';

import type { ShortLink } from 'models/links';
import { VISITOR_ACCESS_COOKIE } from 'utils/cookies';
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
    sendTinyBirdLinkHitEvent({ event: 'link_access_denied', wslug, slug, domain });
    return { access: 'denied' };
  }

  cookies().set(VISITOR_ACCESS_COOKIE({ slug, wslug, domain }), 'granted');

  if (domain) {
    redirect(`/${slug}`);
  }

  redirect(`/${wslug}/${slug}`);
}
