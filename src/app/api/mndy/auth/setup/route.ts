import type { NextRequest } from 'next/server';
import { sql } from '@vercel/postgres';
import { z } from 'zod';

import { KEBAB_CASE_REGEX } from 'utils/strings';
import { initiateSession } from 'utils/auth';
import { type UserInWorkspace, WorkspaceRole, WorkspaceStatus } from 'models/user-in-workspace';
import type { Workspace } from 'models/workspace';

const validator = z.object({
  workspace: z.object({
    id: z.number(),
    name: z.string().min(1).max(50),
    wslug: z.string().min(1).max(20).regex(KEBAB_CASE_REGEX),
  }),
  user: z.object({
    id: z.number(),
    name: z.string(),
  }),
});

export async function POST(req: NextRequest) {
  const body = await req.json();

  const headers = new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });

  const parsedBody = validator.safeParse(body);

  if (!parsedBody.success) {
    return new Response(JSON.stringify({ status: 'invalid', error: parsedBody.error }), { status: 400, headers });
  }

  const { workspace, user } = parsedBody.data;

  const client = await sql.connect();

  const workspaceQuery = await client.sql<{ id: number; slug: string }>`
    SELECT id, slug FROM "Workspace" WHERE id = ${workspace.id} OR slug = ${workspace.wslug}
  `;

  if (workspaceQuery.rows.length > 0) {
    const workspaceExists = workspaceQuery.rows.find((workspaceData) => workspaceData.id === workspace.id);
    const slugExists = workspaceQuery.rows.find((workspaceData) => workspaceData.slug === workspace.wslug);

    if (workspaceExists) {
      client.release();
      return new Response(JSON.stringify({ status: 'workspace-exists' }), { status: 400, headers });
    }

    if (slugExists) {
      client.release();
      return new Response(JSON.stringify({ status: 'workspace-slug-exists' }), { status: 400, headers });
    }

    // not sure about this, I don't think it's possible to reach this point
    client.release();
    return new Response(JSON.stringify({ status: 'wrong-workspace' }), { status: 400, headers });
  }

  const userQuery = await client.sql`SELECT id FROM "User" WHERE id = ${user.id}`;

  if (userQuery.rows.length === 0) {
    await client.sql`INSERT INTO "User" (id) VALUES (${user.id})`;
  }

  const newWorkspaceQuery = await client.sql<Workspace>`
    INSERT INTO "Workspace" (id, name, slug) VALUES (${workspace.id}, ${workspace.name}, ${workspace.wslug}) RETURNING *;
    `;
  await client.sql<UserInWorkspace>`
    INSERT INTO "UserInWorkspace" ("workspaceId", "userId", role, status)
    VALUES (${workspace.id}, ${user.id}, ${WorkspaceRole.OWNER}, ${WorkspaceStatus.ACTIVE})`;

  client.release();
  const sessionToken = await initiateSession({ workspace: workspace.id, user: user.id, wslug: newWorkspaceQuery.rows[0]!.slug });
  headers.set('Authorization', `Bearer ${sessionToken}`);

  return new Response(JSON.stringify({ status: 'created' }), { status: 200, headers });
}

export async function OPTIONS() {
  const headers = new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });

  return new Response(null, { status: 200, headers });
}
