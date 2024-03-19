import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { sql } from '@vercel/postgres';

const validator = z.string().cuid2();

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const headers = new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });

  if (!validator.safeParse(params.id).success) {
    return new Response(JSON.stringify({ error: 'Invalid ID' }), { status: 400, headers });
  }

  const query = await sql`DELETE FROM "MLS_Link" WHERE id = ${params.id} RETURNING *;`;

  if (query.rowCount === 0) {
    return new Response(JSON.stringify({ success: false, error: 'Not Found' }), { status: 404, headers });
  }

  return new Response(JSON.stringify({ success: true }), { status: 200, headers });
}

export async function OPTIONS() {
  const headers = new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });

  return new Response(null, { status: 204, headers });
}
