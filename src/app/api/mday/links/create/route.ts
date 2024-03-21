import type { NextRequest } from 'next/server';
import { sql } from '@vercel/postgres';
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

  const client = await sql.connect();

  const linkBySlug = await client.sql<NewShortLink>`SELECT slug FROM "Link" WHERE slug = ${slug};`;

  if (linkBySlug.rowCount > 0) {
    client.release();
    return new Response(
      JSON.stringify({ success: false, field: 'slug', error: 'The short name already exists somewhere else.' }),
      { status: 400, headers },
    );
  }

  const query = await client.sql<NewShortLink>`
    INSERT INTO "Link" (url, slug, wslug, password, "expiresAt", "createdAt")
    VALUES (${url}, ${slug}, 'devland', ${password}, ${expiresAt}, NOW())
    RETURNING *;
  `;

  client.release();

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
