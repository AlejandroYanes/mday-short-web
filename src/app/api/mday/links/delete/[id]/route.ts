import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { sql } from '@vercel/postgres';

const validator = z.number();

export async function DELETE(_req: NextRequest, { params }: { params: { id: number } }) {
  const headers = new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });

  if (!validator.safeParse(Number(params.id)).success) {
    return new Response(JSON.stringify({ error: 'Invalid ID' }), { status: 400, headers });
  }

  const query = await sql`DELETE FROM "Link" WHERE id = ${params.id} RETURNING *;`;

  if (query.rowCount === 0) {
    return new Response(
      JSON.stringify({ success: false, field: 'not-found', error: 'The link could not be found.' }),
      { status: 404, headers },
    );
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
