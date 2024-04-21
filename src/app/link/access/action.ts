'use server'

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { sql } from '@vercel/postgres';

import type { ShortLink } from 'models/links';
import { VISITOR_ACCESS_COOKIE } from 'utils/cookies';

export async function validatePassword(data: FormData) {
  const domain = data.has('domain') ? data.get('domain') as string : undefined;
  const wslug = data.has('wslug') ? data.get('wslug') as string : undefined;
  const slug = data.get('slug') as string;
  const password = data.get('password') as string;

  const link = await sql<ShortLink>`SELECT * FROM "Link" WHERE slug = ${slug} AND password = ${password}`;

  if (link.rowCount === 0) {
    redirect(`/link/access?wslug=${wslug}&slug=${slug}&access=denied`);
  }

  cookies().set(VISITOR_ACCESS_COOKIE({ slug, wslug, domain }), 'granted');
  redirect(`/${wslug}/${slug}`);
}
