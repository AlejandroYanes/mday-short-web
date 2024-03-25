import type { NextRequest } from 'next/server';
import { sql } from '@vercel/postgres';

import { WorkspaceRole } from 'models/user-in-workspace';
import { resolveCORSHeaders } from 'utils/api';
import { resolveSession } from 'utils/auth';

export async function DELETE(req: NextRequest, { params }: { params: { id: number } }) {
  const headers = resolveCORSHeaders();
  const session = await resolveSession(req);

  if (!session || session.role !== WorkspaceRole.OWNER) {
    return new Response(JSON.stringify({ status: 'unauthorized' }), { status: 401, headers });
  }

  const client = await sql.connect();

  const deleteQuery = await client.sql`
    DELETE FROM "UserInWorkspace"
    WHERE "userId" = ${params.id} AND "workspaceId" = ${session.workspace}
    RETURNING *
  `;

  if (deleteQuery.rowCount === 0) {
    return new Response(
      JSON.stringify({ success: false, field: 'not-found', error: 'The user could not be found.' }),
      { status: 404, headers },
    );
  }

  client.release();
  return new Response(JSON.stringify({ success: true }), { status: 200, headers });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: resolveCORSHeaders() });
}
