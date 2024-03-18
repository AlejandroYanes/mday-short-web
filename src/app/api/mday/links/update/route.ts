import type { NextRequest } from 'next/server';
import { sql } from '@vercel/postgres';
import { z } from 'zod';

import type { NewShortLink } from 'models/links';

const validator = z.object({
  id: z.string().cuid2(),
  url: z.string(),
  slug: z.string(),
  password: z.string().nullish(),
  expiresAt: z.string().nullish(),
});

export async function PUT(req: NextRequest) {
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
    UPDATE "MLS_Link" SET url = ${url}, slug = ${slug}, password = ${password}, "expiresAt" = ${expiresAt}
    WHERE id = ${parse.data.id}
    RETURNING *;
  `;

  return new Response(JSON.stringify(query.rows[0]), { status: 200, headers });
}

export async function OPTIONS() {
  const headers = new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });

  return new Response(null, { status: 204, headers });
}
