import type { NextRequest } from 'next/server';
import { sql } from '@vercel/postgres';
import { z } from 'zod';

import { WorkspaceRole } from 'models/user-in-workspace';
import { resolveSession } from 'utils/auth';
import { resolveCORSHeaders } from 'utils/api';

const validator = z.object({
  role: z.enum([WorkspaceRole.OWNER, WorkspaceRole.USER, WorkspaceRole.GUEST]),
});

export async function PATCH(req: NextRequest, { params }: { params: { id: number } }) {
  const headers = resolveCORSHeaders();

  const session = await resolveSession(req);

  if (!session || session.role !== WorkspaceRole.OWNER) {
    return new Response(JSON.stringify({ status: 'unauthorized' }), { status: 401, headers });
  }

  const body = await req.json();
  const input = validator.safeParse(body);

  if (!input.success) {
    return new Response(JSON.stringify({ status: 'invalid' }), { status: 400, headers });
  }

  const client = await sql.connect();

  const userQuery = await client.sql<{ role: string }>`
    SELECT role FROM "UserInWorkspace" WHERE "userId" = ${session.user} AND "workspaceId" = ${session.workspace}
  `;

  if (!userQuery.rows[0] || userQuery.rows[0].role !== WorkspaceRole.OWNER) {
    client.release();
    return new Response(JSON.stringify({ status: 'unauthorized' }), { status: 401, headers });
  }

  const { role } = input.data;

  await client.sql`
    UPDATE "UserInWorkspace" SET role = ${role}
    WHERE "userId" = ${params.id} AND "workspaceId" = ${session.workspace}
  `;

  client.release();
  return new Response(JSON.stringify({ status: 'success' }), { status: 200, headers });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: resolveCORSHeaders() });
}
