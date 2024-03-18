import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { sql } from '@vercel/postgres';

import type { ShortLink } from 'models/links';

const validator = z.string().cuid2();

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.pathname.split('/').pop();

  const headers = new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });

  if (!validator.safeParse(id).success) {
    return new Response(JSON.stringify({ error: 'Invalid ID' }), { status: 400, headers });
  }

  const query = await sql<ShortLink>`DELETE FROM "MLS_Link" WHERE id = ${id};`;
  if (query.rowCount === 0) {
    return new Response(JSON.stringify({ error: 'Not Found' }), { status: 404, headers });
  }

  return new Response(JSON.stringify(query.rows[0]), { status: 204, headers });
}

export async function OPTIONS() {
  const headers = new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });

  return new Response(null, { status: 204, headers });
}
