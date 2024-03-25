import type { NextRequest } from 'next/server';
import { sql } from '@vercel/postgres';
import { z } from 'zod';

import { WorkspaceStatus } from 'models/user-in-workspace';
import { resolveCORSHeaders } from 'utils/api';
import { decrypt, initiateSession } from 'utils/auth';

const validator = z.object({
  workspace: z.number(),
  email: z.string().email(),
  token: z.string(),
});

export async function POST(req: NextRequest) {
  const headers = resolveCORSHeaders();

  const body = await req.json();
  const input = validator.safeParse(body);

  if (!input.success) {
    return new Response(
      JSON.stringify({ status: 'invalid', error: input.error.errors }),
      { status: 400, headers },
    );
  }

  const { workspace, email, token } = input.data;

  const session = await decrypt(token);

  if (!session) {
    return new Response(JSON.stringify({ status: 'unauthorized' }), { status: 401, headers });
  }

  const client = await sql.connect();

  const workspaceQuery = await client.sql<{ id: number; slug: string }>`
    SELECT id, slug FROM "Workspace" WHERE id = ${workspace}`;

  if (workspaceQuery.rows.length === 0) {
    client.release();
    return new Response(JSON.stringify({ status: 'not-found' }), { status: 404, headers });
  }

  const userQuery = await client.sql<{ id: number }>`
    SELECT id FROM "User" WHERE email = ${email}`;

  if (userQuery.rows.length === 0) {
    client.release();
    return new Response(JSON.stringify({ status: 'not-found' }), { status: 404, headers });
  }

  const userId = userQuery.rows[0]!.id;

  const relationQuery = await client.sql<{ role: string; status: string }>`
    SELECT role, status FROM "UserInWorkspace"
    WHERE "workspaceId" = ${workspace} AND "userId" = ${userId}`;

  if (relationQuery.rows.length === 0) {
    client.release();
    return new Response(JSON.stringify({ status: 'not-found' }), { status: 404, headers });
  }

  await client.sql<{ role: string }>`
    UPDATE "UserInWorkspace" SET status = ${WorkspaceStatus.ACTIVE}
    WHERE "workspaceId" = ${workspace} AND "userId" = ${userId}
    RETURNING role`;

  client.release();

  const sessionToken = await initiateSession({
    workspace,
    wslug: workspaceQuery.rows[0]!.slug,
    user: userId,
    role: relationQuery.rows[0]!.role,
  });

  return new Response(
    JSON.stringify({ status: 'success', sessionToken, role: relationQuery.rows[0]!.role }),
    { status: 200, headers },
  );
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: resolveCORSHeaders() });
}
