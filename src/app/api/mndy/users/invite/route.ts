import type { NextRequest } from 'next/server';
import { sql } from '@vercel/postgres';
import { z } from 'zod';

import { WorkspaceRole, WorkspaceStatus } from 'models/user-in-workspace';
import { resolveCORSHeaders } from 'utils/api';
import { resolveSession } from 'utils/auth';

const validator = z.object({
  name: z.string()
    .min(2, { message: 'The name must have at least 2 characters' })
    .max(50, { message: 'The name can not have more than 50 characters' }),
  email: z.string()
    .min(1, { message: 'The email can not be empty' })
    .email({ message: 'Please use a valid email' }),
  role: z.enum([WorkspaceRole.USER, WorkspaceRole.OWNER, WorkspaceRole.GUEST]),
});

export async function POST(req: NextRequest) {
  const headers = resolveCORSHeaders();
  const session = await resolveSession(req);

  if (!session || session.role !== WorkspaceRole.OWNER) {
    return new Response(JSON.stringify({ status: 'unauthorized' }), { status: 401, headers });
  }

  const body = await req.json();
  const input = validator.safeParse(body);

  if (!input.success) {
    return new Response(
      JSON.stringify({ status: 'invalid', error: input.error.errors }),
      { status: 400, headers },
    );
  }

  const client = await sql.connect();

  const actorQuery = await client.sql<{ role: string }>`
    SELECT role FROM "UserInWorkspace" WHERE "userId" = ${session.user} AND "workspaceId" = ${session.workspace}
  `;

  if (!actorQuery.rows[0] || actorQuery.rows[0].role !== WorkspaceRole.OWNER) {
    client.release();
    return new Response(JSON.stringify({ status: 'unauthorized' }), { status: 401, headers });
  }

  const { name, email, role } = input.data;
  let userId: number;

  const userQuery = await client.sql<{ id: number }>`SELECT id FROM "User" WHERE email = ${email}`;

  if (userQuery.rows[0]) {
    userId = Number(userQuery.rows[0].id);
  } else {
    const userInsertQuery = await client.sql<{ id: number }>`
        INSERT INTO "User" (name, email)
        VALUES (${name}, ${email})
        RETURNING id`;
    userId = userInsertQuery.rows[0]!.id;
  }

  await client.sql`
    INSERT INTO "UserInWorkspace" ("workspaceId", "userId", role, status)
    VALUES (${session.workspace}, ${userId}, ${role}, ${WorkspaceStatus.INVITED})
  `;

  client.release();
  return new Response(JSON.stringify({ status: 'success' }), { status: 200, headers });
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: resolveCORSHeaders() });
}
