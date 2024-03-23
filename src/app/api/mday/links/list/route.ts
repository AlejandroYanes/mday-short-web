import type { NextRequest } from 'next/server';
import { sql } from '@vercel/postgres';

import type { ShortLink } from 'models/links';
import { resolveSession } from 'utils/auth';

export async function GET(req: NextRequest) {
  const headers = new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });

  const session = await resolveSession(req);

  if (!session) {
    return new Response(JSON.stringify({ status: 'unauthorized' }), { status: 401, headers });
  }

  const query = await sql<ShortLink>`
    SELECT id, url, wslug, slug, password, "expiresAt"
    FROM "Link"
    WHERE wslug = ${session.wslug}
    ORDER BY "createdAt";`;
  return new Response(JSON.stringify({ results: query.rows }), { status: 200, headers });
}

export async function OPTIONS() {
  const headers = new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });

  return new Response(null, { status: 204, headers });
}

