import { withAxiom, type AxiomRequest } from 'next-axiom';
import { sql } from '@vercel/postgres';
import { z } from 'zod';

import { WorkspaceRole, WorkspaceStatus } from 'models/user-in-workspace';
import { resolveCORSHeaders } from 'utils/api';
import { encryptMessage, resolveSession } from 'utils/auth';

const validator = z.object({
  name: z.string()
    .min(2, { message: 'The name must have at least 2 characters' })
    .max(50, { message: 'The name can not have more than 50 characters' }),
  email: z.string()
    .min(1, { message: 'The email can not be empty' })
    .email({ message: 'Please use a valid email' }),
  role: z.enum([WorkspaceRole.USER, WorkspaceRole.OWNER, WorkspaceRole.GUEST]),
});

export const POST = withAxiom(async (req: AxiomRequest) => {
  const headers = resolveCORSHeaders();
  const log = req.log.with({ scope: 'user', endpoint: 'mndy/users/invite', ip: req.ip, method: req.method });

  const session = await resolveSession(req);

  if (!session || session.role !== WorkspaceRole.OWNER) {
    log.error('Invalid session', { role: session?.role });
    return new Response(JSON.stringify({ status: 'unauthorized' }), { status: 401, headers });
  }

  const body = await req.json();
  const input = validator.safeParse(body);

  if (!input.success) {
    log.error('Invalid input', { body, error: input.error.errors });
    return new Response(
      JSON.stringify({ status: 'invalid', error: input.error.errors }),
      { status: 400, headers },
    );
  }

  const { name, email, role } = input.data;
  let userId: number;

  const client = await sql.connect();

  const userQuery = await client.sql<{ id: number }>`SELECT id FROM "User" WHERE email = ${await encryptMessage(email)}`;

  if (userQuery.rows[0]) {
    userId = Number(userQuery.rows[0].id);
  } else {
    const userInsertQuery = await client.sql<{ id: number }>`
        INSERT INTO "User" (name, email)
        VALUES (${await encryptMessage(name)}, ${await encryptMessage(email)})
        RETURNING id`;
    userId = userInsertQuery.rows[0]!.id;
  }

  const relationQuery = await client.sql<{ userId: string }>`
    SELECT "userId"
    FROM "UserInWorkspace"
    WHERE "userId" = ${userId} AND "workspaceId" = ${session.workspace}
  `;

  if (relationQuery.rows[0]) {
    log.error('User already in workspace', { target: userId, user: session.user, workspace: session.workspace });

    return new Response(
      JSON.stringify({ status: 'invalid', error: 'The user is already in the workspace' }),
      { status: 400, headers },
    );
  }

  await client.sql`
    INSERT INTO "UserInWorkspace" ("workspaceId", "userId", role, status)
    VALUES (${session.workspace}, ${userId}, ${role}, ${WorkspaceStatus.INVITED})
  `;

  client.release();

  log.info('User invited', { target: userId, user: session.user, workspace: session.workspace });

  return new Response(JSON.stringify({ status: 'success' }), { status: 200, headers });
});

export function OPTIONS() {
  return new Response(null, { status: 204, headers: resolveCORSHeaders() });
}
