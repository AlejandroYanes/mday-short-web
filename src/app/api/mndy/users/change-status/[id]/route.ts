import type { NextRequest } from 'next/server';
import { sql } from '@vercel/postgres';
import { z } from 'zod';

import { WorkspaceRole, WorkspaceStatus } from 'models/user-in-workspace';
import { resolveSession } from 'utils/auth';
import { resolveCORSHeaders } from 'utils/api';

const validator = z.object({
  status: z.enum([WorkspaceStatus.ACTIVE, WorkspaceStatus.INACTIVE]),
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
    return new Response(
      JSON.stringify({ status: 'invalid', error: input.error.errors }),
      { status: 400, headers },
    );
  }

  const { status } = input.data;
  const client = await sql.connect();

  await client.sql`
    UPDATE "UserInWorkspace" SET status = ${status}
    WHERE "userId" = ${params.id} AND "workspaceId" = ${session.workspace}
  `;

  client.release();
  return new Response(JSON.stringify({ status: 'success' }), { status: 200, headers });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: resolveCORSHeaders() });
}
