import type { NextRequest } from 'next/server';
import { sql } from '@vercel/postgres';
import { z } from 'zod';

import { WorkspaceRole, WorkspaceStatus } from 'models/user-in-workspace';
import { initiateSession } from 'utils/auth';
import { resolveCORSHeaders } from 'utils/api';

const validator = z.object({
  workspace: z.number(),
  user: z.number(),
  name: z.string(),
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  const body = await req.json();

  const headers = resolveCORSHeaders();

  if (!body?.workspace || !body?.user) {
    return new Response(JSON.stringify({ status: 'not-found' }), { status: 400, headers });
  }

  const input = validator.safeParse(body);

  if (!input.success) {
    return new Response(JSON.stringify({ status: 'invalid', error: input.error }), { status: 400, headers });
  }

  const { workspace, user, name, email } = input.data;
  const client = await sql.connect();

  const workspaceQuery = await client.sql<{ id: number; slug: string }>`SELECT id, slug FROM "Workspace" WHERE id = ${workspace}`;

  if (workspaceQuery.rows.length === 0) {
    client.release();
    return new Response(JSON.stringify({ status: 'not-found' }), { status: 200, headers });
  }

  const userQuery = await client.sql`SELECT id FROM "User" WHERE id = ${user}`;

  if (userQuery.rows.length === 0) {
    // workspace exists, but user does not, so we need to create a new user and create join req for the workspace
    await client.sql`INSERT INTO "User" (id, name, email) VALUES (${user}, ${name}, ${email})`;
    await client.sql`
        INSERT INTO "UserInWorkspace" ("workspaceId", "userId", role, status)
        VALUES (${workspace}, ${user}, ${WorkspaceRole.USER}, ${WorkspaceStatus.PENDING})`;
    client.release();

    return new Response(JSON.stringify({ status: 'pending' }), { status: 200, headers });
  }

  const relationQuery = await client.sql<{ role: string; status: string }>`
    SELECT role, status FROM "UserInWorkspace"
    WHERE "workspaceId" = ${workspace} AND "userId" = ${user}
  `;

  if (relationQuery.rows.length === 0) {
    // user exists, but is not in the workspace, so a join request is created
    await client.sql`
        INSERT INTO "UserInWorkspace" ("workspaceId", "userId", role, status)
        VALUES (${workspace}, ${user}, ${WorkspaceRole.USER}, ${WorkspaceStatus.PENDING})`;
    client.release();
    return new Response(JSON.stringify({ status: 'pending' }), { status: 200, headers });
  }

  client.release();

  const relation = relationQuery.rows[0]!;

  if (relation.status === WorkspaceStatus.PENDING) {
    return new Response(JSON.stringify({ status: 'pending' }), { status: 200, headers });
  }

  if (relation.status === WorkspaceStatus.INVITED) {
    return new Response(JSON.stringify({ status: 'invited' }), { status: 200, headers });
  }

  const sessionToken = await initiateSession({
    workspace,
    user,
    wslug: workspaceQuery.rows[0]!.slug,
    role: relationQuery.rows[0]!.role as WorkspaceRole,
  });
  return new Response(
    JSON.stringify({ status: 'found', sessionToken, role: relationQuery.rows[0]!.role }),
    { status: 200, headers },
  );
}

export async function OPTIONS() {
  const headers = resolveCORSHeaders();

  return new Response(null, { status: 200, headers });
}
