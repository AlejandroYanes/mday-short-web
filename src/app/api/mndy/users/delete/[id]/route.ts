import { withAxiom, type AxiomRequest } from 'next-axiom';
import { sql } from '@vercel/postgres';

import { WorkspaceRole } from 'models/user-in-workspace';
import { resolveCORSHeaders } from 'utils/api';
import { resolveSession } from 'utils/auth';

export const DELETE = withAxiom(async (req: AxiomRequest, { params }: { params: { id: number } }) => {
  const headers = resolveCORSHeaders();
  const log = req.log.with({ scope: 'user', endpoint: 'mndy/users/delete', ip: req.ip, method: req.method });

  const session = await resolveSession(req);

  if (!session || session.role !== WorkspaceRole.OWNER) {
    log.error('Invalid session', { role: session?.role });
    return new Response(JSON.stringify({ status: 'unauthorized' }), { status: 401, headers });
  }

  const deleteQuery = await sql`
    DELETE FROM "UserInWorkspace"
    WHERE "userId" = ${params.id} AND "workspaceId" = ${session.workspace}
    RETURNING *
  `;

  if (deleteQuery.rowCount === 0) {
    log.error('User not found', { target: params.id, user: session.user, workspace: session.workspace });

    return new Response(
      JSON.stringify({ success: false, field: 'not-found', error: 'The user could not be found.' }),
      { status: 404, headers },
    );
  }

  log.info('User deleted', { target: params.id, user: session.user, workspace: session.workspace });

  return new Response(JSON.stringify({ success: true }), { status: 200, headers });
})

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: resolveCORSHeaders() });
}
