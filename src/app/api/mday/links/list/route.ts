import { sql } from '@vercel/postgres';

import type { ShortLink } from 'models/links';
import { resolveSession } from 'utils/auth';

export async function GET() {
  const session = await resolveSession();

  if (!session) {
    return new Response(JSON.stringify({ status: 'unauthorized' }), { status: 401 });
  }

  const query = await sql<ShortLink>`SELECT id, url, slug, password, "expiresAt" FROM "Link" ORDER BY "createdAt";`;
  const headers = new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  return new Response(JSON.stringify({ results: query.rows }), {
    headers,
  });
}

