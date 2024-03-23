import type { NextRequest } from 'next/server';
import { sql } from '@vercel/postgres';
import { z } from 'zod';

import { KEBAB_CASE_REGEX } from 'utils/strings';
import { initiateSession } from 'utils/auth';
import { WorkspaceRole, WorkspaceStatus } from 'models/user-in-workspace';
import { Workspace } from 'models/workspace';

const validator = z.object({
  workspace: z.number(),
  user: z.number(),
  name: z.string().min(1).max(50),
  wslug: z.string().min(1).max(20).regex(KEBAB_CASE_REGEX),
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

  const { workspace, user, name, wslug } = parsedBody.data;

  const workspaceId = Number(workspace);
  const userId = Number(user);

  const client = await sql.connect();

  const workspaceQuery = await client.sql<{ id: number; slug: string }>`
    SELECT id, slug FROM "Workspace" WHERE id = ${workspaceId} OR slug = ${wslug}
  `;

  if (workspaceQuery.rows.length > 0) {
    const workspaceExists = workspaceQuery.rows.find((workspaceData) => workspaceData.id === workspaceId);
    const slugExists = workspaceQuery.rows.find((workspaceData) => workspaceData.slug === wslug);

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

  const userQuery = await client.sql`SELECT id FROM "User" WHERE id = ${userId}`;

  if (userQuery.rows.length === 0) {
    await client.sql`INSERT INTO "User" (id) VALUES (${userId})`;
  }

  const newWorkspaceQuery = await client.sql<Workspace>`
    INSERT INTO "Workspace" (id, name, slug) VALUES (${workspaceId}, ${name}, ${wslug}) RETURNING *;
    `;
  await client.sql`
    INSERT INTO "UserInWorkspace" ("workspaceId", "userId", role, status)
    VALUES (${workspaceId}, ${userId}, ${WorkspaceRole.OWNER}, ${WorkspaceStatus.ACTIVE})`;

  client.release();
  const sessionToken = await initiateSession({ workspace, user, wslug: newWorkspaceQuery.rows[0]!.slug });
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
