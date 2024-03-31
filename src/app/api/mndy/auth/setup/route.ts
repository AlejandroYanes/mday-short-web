import { withAxiom, type AxiomRequest } from 'next-axiom';
import { sql } from '@vercel/postgres';
import { z } from 'zod';

import type { Workspace } from 'models/workspace';
import { type UserInWorkspace, WorkspaceRole, WorkspaceStatus } from 'models/user-in-workspace';
import { KEBAB_CASE_REGEX } from 'utils/strings';
import { decrypt, initiateSession } from 'utils/auth';
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
  token: z.string(),
});

export const POST = withAxiom(async(req: AxiomRequest) => {
  const headers = resolveCORSHeaders();
  const log = req.log.with({ scope: 'user', endpoint: 'mndy/auth/setup', ip: req.ip, method: req.method });

  const body = await req.json();
  const parsedBody = validator.safeParse(body);

  if (!parsedBody.success) {
    log.error('Invalid input', { error: parsedBody.error.errors, body });
    return new Response(JSON.stringify({ status: 'invalid', error: parsedBody.error }), { status: 400, headers });
  }

  const { workspace, user, token } = parsedBody.data;

  const session = await decrypt(token);

  if (!session) {
    log.error('Invalid token');
    return new Response(JSON.stringify({ status: 'unauthorized' }), { status: 401, headers });
  }

  const client = await sql.connect();

  const workspaceQuery = await client.sql<{ id: number; slug: string }>`
    SELECT id, slug FROM "Workspace" WHERE mid = ${workspace.id} OR slug = ${workspace.wslug}
  `;

  if (workspaceQuery.rows.length > 0) {
    const workspaceExists = workspaceQuery.rows.find((workspaceData) => workspaceData.id === workspace.id);
    const slugExists = workspaceQuery.rows.find((workspaceData) => workspaceData.slug === workspace.wslug);

    if (workspaceExists) {
      client.release();
      log.error('Workspace already exists', { workspace });
      return new Response(JSON.stringify({ status: 'workspace-exists' }), { status: 400, headers });
    }

    if (slugExists) {
      client.release();
      log.error('Workspace slug already exists', { workspace });
      return new Response(JSON.stringify({ status: 'workspace-slug-exists' }), { status: 400, headers });
    }

    // not sure about this, I don't think it's possible to reach this point
    client.release();
    log.error('Wrong workspace', { workspace });
    return new Response(JSON.stringify({ status: 'wrong-workspace' }), { status: 400, headers });
  }

  const userQuery = await client.sql<{ id: string }>`SELECT id FROM "User" WHERE email = ${user.email}`;
  let userId;

  if (userQuery.rows.length === 0) {
    const newUserQuery = await client.sql<{ id: number }>`
        INSERT INTO "User" (name, email) VALUES (${user.name}, ${user.email}) RETURNING id`;
    userId = Number(newUserQuery.rows[0]!.id);
  } else {
    userId = Number(userQuery.rows[0]!.id);
  }

  const newWorkspaceQuery = await client.sql<Workspace>`
    INSERT INTO "Workspace" (mid, name, slug) VALUES (${workspace.id}, ${workspace.name}, ${workspace.wslug}) RETURNING *;
    `;
  await client.sql<UserInWorkspace>`
    INSERT INTO "UserInWorkspace" ("workspaceId", "userId", role, status)
    VALUES (${workspace.id}, ${userId}, ${WorkspaceRole.OWNER}, ${WorkspaceStatus.ACTIVE})`;

  client.release();

  log.info('Workspace created', {
    workspace: Number(newWorkspaceQuery.rows[0]!.id),
    wslug: newWorkspaceQuery.rows[0]!.slug,
    user: userId,
  });

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
});

export async function OPTIONS() {
  return new Response(null, { status: 200, headers:resolveCORSHeaders() });
}
