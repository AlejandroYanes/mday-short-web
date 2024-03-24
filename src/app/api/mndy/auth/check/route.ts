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
});

export async function POST(req: NextRequest) {
  const body = await req.json();

  const headers = resolveCORSHeaders();

  if (!body?.workspace || !body?.user) {
    return new Response(JSON.stringify({ status: 'not-found' }), { status: 400, headers });
  }

  const parsedBody = validator.safeParse(body);

  if (!parsedBody.success) {
    return new Response(JSON.stringify({ status: 'invalid', error: parsedBody.error }), { status: 400, headers });
  }

  const { workspace, user, name } = parsedBody.data;
  const client = await sql.connect();

  const workspaceQuery = await client.sql<{ id: number; slug: string }>`SELECT id, slug FROM "Workspace" WHERE id = ${workspace}`;

  if (workspaceQuery.rows.length === 0) {
    client.release();
    return new Response(JSON.stringify({ status: 'not-found' }), { status: 200, headers });
  }

  const userQuery = await client.sql`SELECT id FROM "User" WHERE id = ${user}`;

  if (userQuery.rows.length === 0) {
    // workspace exists, but user does not, so we need to create a new user and add it to the workspace
    // TODO: change this to be a request flow, where the user requests to join the workspace
    //       and the workspace owner can accept or reject the request.
    //       This will prevent attackers from adding users (or themselves) to workspaces without permission.
    await client.sql`INSERT INTO "User" (id, name) VALUES (${user}, ${name})`;
    await client.sql`
        INSERT INTO "UserInWorkspace" ("workspaceId", "userId", role, status)
        VALUES (${workspace}, ${user}, ${WorkspaceRole.USER}, ${WorkspaceStatus.ACTIVE})`;
    client.release();

    const sessionToken = await initiateSession({ workspace, user, wslug: workspaceQuery.rows[0]!.slug, role: WorkspaceRole.USER });
    headers.set('Authorization', `Bearer ${sessionToken}`);

    return new Response(JSON.stringify({ status: 'found' }), { status: 200, headers });
  }

  const relationQuery = await client.sql<{ role: string }>`
    SELECT role FROM "UserInWorkspace"
    WHERE "workspaceId" = ${workspace} AND "userId" = ${user}
  `;

  if (relationQuery.rows.length === 0) {
    client.release();
    // User is not related to workspace,
    // it's a possible scenario when a user can be in multiple workspaces
    // TODO: add a request flow to join a workspace
    return new Response(JSON.stringify({ status: 'not-related' }), { status: 200, headers });
  }

  client.release();

  const sessionToken = await initiateSession({
    workspace,
    user,
    wslug: workspaceQuery.rows[0]!.slug,
    role: relationQuery.rows[0]!.role as WorkspaceRole,
  });
  return new Response(JSON.stringify({ status: 'found', sessionToken }), { status: 200, headers });
}

export async function OPTIONS() {
  const headers = resolveCORSHeaders();

  return new Response(null, { status: 200, headers });
}
