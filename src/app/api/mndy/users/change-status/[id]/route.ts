import { withAxiom, type AxiomRequest } from 'next-axiom';
import { sql } from '@vercel/postgres';
import { z } from 'zod';

import { WorkspaceRole, WorkspaceStatus } from 'models/user-in-workspace';
import { resolveSession } from 'utils/auth';
import { resolveCORSHeaders } from 'utils/api';

const validator = z.object({
  status: z.enum([WorkspaceStatus.ACTIVE, WorkspaceStatus.INACTIVE]),
});

export const PATCH = withAxiom(async (req: AxiomRequest, { params }: { params: { id: number } }) => {
  const headers = resolveCORSHeaders();
  const log = req.log.with({ scope: 'user', endpoint: 'mndy/users/change-status', ip: req.ip, method: req.method });

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

  const { status } = input.data;

  const deleteQuery = await sql`
    UPDATE "UserInWorkspace" SET status = ${status}
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

  log.info('Status changed', { target: params.id, user: session.user, workspace: session.workspace });

  return new Response(JSON.stringify({ status: 'success' }), { status: 200, headers });
});

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: resolveCORSHeaders() });
}
