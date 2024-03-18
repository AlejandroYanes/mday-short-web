import type { NextRequest } from 'next/server';
import { sql } from '@vercel/postgres';
import { createId } from '@paralleldrive/cuid2';
import { z } from 'zod';

import type { NewShortLink } from 'models/links';

const validator = z.object({
  url: z.string(),
  slug: z.string(),
  password: z.string().nullish(),
  expiresAt: z.string().nullish(),
});

export async function POST(req: NextRequest) {
  const body: NewShortLink = await req.json();
  const parse = validator.safeParse(body);

  const headers = new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });

  if (!parse.success) {
    return new Response(JSON.stringify(parse.error), { status: 400, headers });
  }

  const { url, slug, password, expiresAt } = parse.data;
  const query = await sql<NewShortLink>`
    INSERT INTO "MLS_Link" (id, url, slug, password, "expiresAt", "createdAt")
    VALUES (${createId()}, ${url}, ${slug}, ${password}, ${expiresAt}, NOW())
    RETURNING *;
  `;

  return new Response(JSON.stringify(query.rows[0]), { status: 201, headers });
}

export async function OPTIONS() {
  const headers = new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });

  return new Response(null, { status: 204, headers });
}
