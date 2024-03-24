import type { NextRequest } from 'next/server';
import { sql } from '@vercel/postgres';
import { z } from 'zod';

import type { NewShortLink } from 'models/links';
import { resolveSession } from 'utils/auth';
import { resolveCORSHeaders } from 'utils/api';

const validator = z.object({
  url: z.string(),
  slug: z.string(),
  password: z.string().nullish(),
  expiresAt: z.string().nullish(),
});

export async function POST(req: NextRequest) {
  const headers = resolveCORSHeaders();

  const session = await resolveSession(req);

  if (!session) {
    return new Response(JSON.stringify({ status: 'unauthorized' }), { status: 401, headers });
  }

  const body: NewShortLink = await req.json();
  const parse = validator.safeParse(body);

  if (!parse.success) {
    return new Response(JSON.stringify(parse.error), { status: 400, headers });
  }

  const { url, slug, password, expiresAt } = parse.data;

  const client = await sql.connect();

  const userInWorkspace = await client.sql<{ userId: number }>`
    SELECT "userId" FROM "UserInWorkspace" WHERE "userId" = ${session.user} AND "workspaceId" = ${session.workspace};
  `;

  if (userInWorkspace.rowCount === 0) {
    client.release();
    return new Response(JSON.stringify({ success: false, error: 'incorrect workspace.' }), { status: 400, headers });
  }

  const linkBySlug = await client.sql<NewShortLink>`SELECT slug FROM "Link" WHERE slug = ${slug} AND wslug = ${session.wslug};`;

  if (linkBySlug.rowCount > 0) {
    client.release();
    return new Response(
      JSON.stringify({ success: false, field: 'slug', error: 'The short name already exists.' }),
      { status: 400, headers },
    );
  }

  const query = await client.sql<NewShortLink>`
    INSERT INTO "Link" (url, slug, wslug, password, "expiresAt", "createdAt")
    VALUES (${url}, ${slug}, ${session.wslug}, ${password}, ${expiresAt}, NOW())
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
