import type { NextRequest } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const workspace = searchParams.get('workspace');
  const user = searchParams.get('user');

  if (!workspace || !user) {
    return new Response(JSON.stringify({ status: 'not-found' }), { status: 400 });
  }

  const client = await sql.connect();

  const workspaceQuery = await client.sql`SELECT id FROM "Workspace" WHERE id = ${Number(workspace)}`;

  if (workspaceQuery.rows.length === 0) {
    client.release();
    return new Response(JSON.stringify({ status: 'not-found' }), { status: 200 });
  }

  const userQuery = await client.sql`SELECT id FROM "User" WHERE id = ${Number(user)}`;

  if (userQuery.rows.length === 0) {
    client.release();
    return new Response(JSON.stringify({ status: 'not-found' }), { status: 200 });
  }

  const relationQuery = await client.sql`
        SELECT  FROM "UserInWorkspace"
                WHERE "workspaceId" = ${Number(workspace)} AND "userId" = ${Number(user)}
  `;

  if (relationQuery.rows.length === 0) {
    client.release();
    // User is not related to workspace, it's a possible scenario when a user can be in multiple workspaces
    return new Response(JSON.stringify({ status: 'not-related' }), { status: 200 });
  }

  client.release();
  return new Response(JSON.stringify({ status: 'found' }), { status: 200 });
}
