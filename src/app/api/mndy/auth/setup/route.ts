import type { NextRequest } from 'next/server';
import { sql } from '@vercel/postgres';
import { z } from 'zod';

import type { Workspace } from 'models/workspace';
import { type UserInWorkspace, WorkspaceRole, WorkspaceStatus } from 'models/user-in-workspace';
import { KEBAB_CASE_REGEX } from 'utils/strings';
import { initiateSession } from 'utils/auth';
import { resolveCORSHeaders } from 'utils/api';

const validator = z.object({
  workspace: z.object({
    id: z.number(),
    name: z.string().min(1).max(50),
    wslug: z.string().min(1).max(20).regex(KEBAB_CASE_REGEX),
  }),
  user: z.object({
    name: z.string(),
    email: z.string().email(),
  }),
});

export async function POST(req: NextRequest) {
  const body = await req.json();

  const headers = resolveCORSHeaders();

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

  const userQuery = await client.sql<{ id: number }>`SELECT id FROM "User" WHERE email = ${user.email}`;
  let userId;

  if (userQuery.rows.length === 0) {
    const newUserQuery = await client.sql<{ id: number }>`
        INSERT INTO "User" (name, email) VALUES (${user.name}, ${user.email}) RETURNING id`;
    userId = newUserQuery.rows[0]!.id;
  } else {
    userId = userQuery.rows[0]!.id;
  }

  const newWorkspaceQuery = await client.sql<Workspace>`
    INSERT INTO "Workspace" (id, name, slug) VALUES (${workspace.id}, ${workspace.name}, ${workspace.wslug}) RETURNING *;
    `;
  await client.sql<UserInWorkspace>`
    INSERT INTO "UserInWorkspace" ("workspaceId", "userId", role, status)
    VALUES (${workspace.id}, ${userId}, ${WorkspaceRole.OWNER}, ${WorkspaceStatus.ACTIVE})`;

  client.release();

  const sessionToken = await initiateSession({
    workspace: workspace.id,
    user: userId,
    wslug: newWorkspaceQuery.rows[0]!.slug,
    role: WorkspaceRole.OWNER,
  });
  return new Response(
    JSON.stringify({ status: 'created', sessionToken, role: WorkspaceRole.OWNER }),
    { status: 200, headers },
  );
}

export async function OPTIONS() {
  const headers = resolveCORSHeaders();

  return new Response(null, { status: 200, headers });
}
