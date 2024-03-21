import type { NextRequest } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const workspace = searchParams.get('workspace');
  const user = searchParams.get('user');

  const headers = new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });

  if (!workspace || !user) {
    return new Response(JSON.stringify({ status: 'not-found' }), { status: 400, headers });
  }

  const client = await sql.connect();

  const workspaceQuery = await client.sql`SELECT id FROM "Workspace" WHERE id = ${Number(workspace)}`;

  if (workspaceQuery.rows.length === 0) {
    client.release();
    return new Response(JSON.stringify({ status: 'not-found' }), { status: 200, headers });
  }

  const userQuery = await client.sql`SELECT id FROM "User" WHERE id = ${Number(user)}`;

  if (userQuery.rows.length === 0) {
    client.release();
    return new Response(JSON.stringify({ status: 'not-found' }), { status: 200, headers });
  }

  const relationQuery = await client.sql`
        SELECT  FROM "UserInWorkspace"
                WHERE "workspaceId" = ${Number(workspace)} AND "userId" = ${Number(user)}
  `;

  if (relationQuery.rows.length === 0) {
    client.release();
    // User is not related to workspace,
    // it's a possible scenario when a user can be in multiple workspaces
    return new Response(JSON.stringify({ status: 'not-related' }), { status: 200, headers });
  }

  client.release();
  return new Response(JSON.stringify({ status: 'found' }), { status: 200, headers });
}
