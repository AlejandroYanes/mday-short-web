import type { NextRequest } from 'next/server';
import { sql } from '@vercel/postgres';
import { z } from 'zod';

import type { NewShortLink, ShortLink } from 'models/links';
import { resolveSession } from 'utils/auth';

const validator = z.object({
  id: z.number(),
  url: z.string(),
  slug: z.string(),
  password: z.string().nullish(),
  expiresAt: z.string().nullish(),
});

export async function PUT(req: NextRequest) {
  const session = await resolveSession(req);

  if (!session) {
    return new Response(JSON.stringify({ status: 'unauthorized' }), { status: 401 });
  }

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

  const linkBySlug = await client.sql<ShortLink>`
    SELECT slug FROM "Link" WHERE slug = ${slug} AND wslug = ${session.wslug};
   `;

  if (linkBySlug.rowCount > 0 && linkBySlug.rows[0]!.id !== parse.data.id) {
    client.release();
    return new Response(
      JSON.stringify({ success: false, field: 'slug', error: 'The short name already exists.' }),
      { status: 400, headers },
    );
  }

  const query = await client.sql<NewShortLink>`
    UPDATE "Link" SET url = ${url}, slug = ${slug}, password = ${password}, "expiresAt" = ${expiresAt}
    WHERE id = ${parse.data.id} AND wslug = ${session.wslug}
    RETURNING *;
  `;

  if (query.rowCount === 0) {
    client.release();
    return new Response(
      JSON.stringify({ success: false, field: 'not-found', error: 'The link could not be found.' }),
      { status: 404, headers },
    );
  }

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
