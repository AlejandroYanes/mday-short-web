'use server'

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { sql } from '@vercel/postgres';

import type { ShortLink } from 'models/links';

export async function validatePassword(data: FormData) {
  const slug = data.get('slug') as string;
  const password = data.get('password') as string;

  const link = await sql<ShortLink>`SELECT * FROM "MLS_Link" WHERE slug = ${slug} AND password = ${password}`;

  if (link.rowCount === 0) {
    redirect(`/link/access?slug=${slug}&access=denied`);
  }

  cookies().set(`mls_${slug}_access`, 'granted');
  redirect(`/visit/${slug}?access=granted`);
}
