import { type AxiomRequest, withAxiom } from 'next-axiom';
import { sql } from '@vercel/postgres';

import { resolveCORSHeaders } from 'utils/api';
import { resolveSession } from 'utils/auth';

export const GET = withAxiom(async (req: AxiomRequest) => {
  const log = req.log.with({ scope: 'domains', endpoint: 'mndy/domains/list', ip: req.ip, method: req.method });
  const headers = resolveCORSHeaders();

  const session = await resolveSession(req);

  if (!session) {
    log.error('Invalid token');
    return new Response(JSON.stringify({ status: 'unauthorized' }), { status: 401, headers });
  }

  try {
    const domainsQuery = await sql<{ id: number; name: string }>`
      SELECT id, name FROM "Domain" WHERE "workspaceId" = ${session.workspace} ORDER BY "updatedAt" DESC`;

    return new Response(JSON.stringify(domainsQuery.rows), { status: 200, headers });
  } catch (error) {
    log.error('Error fetching domains', { error });
    return new Response(JSON.stringify({ status: 'error' }), { status: 500, headers });
  }

});

export function OPTIONS() {
  return new Response(null, { status: 204, headers: resolveCORSHeaders() });
}
