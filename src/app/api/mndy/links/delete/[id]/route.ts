import { withAxiom, type AxiomRequest } from 'next-axiom';
import { z } from 'zod';
import { sql } from '@vercel/postgres';

import { resolveSession } from 'utils/auth';
import { resolveCORSHeaders } from 'utils/api';

const validator = z.number();

export const DELETE = withAxiom(async (req: AxiomRequest, { params }: { params: { id: number } }) => {
  const headers = resolveCORSHeaders();
  const log = req.log.with({ scope: 'links', endpoint: 'mndy/links/delete', ip: req.ip, method: req.method });

  const session = await resolveSession(req);

  if (!session) {
    log.error('Invalid session');
    return new Response(JSON.stringify({ status: 'unauthorized' }), { status: 401 });
  }

  if (!validator.safeParse(Number(params.id)).success) {
    log.error('Invalid link ID', { id: params.id });
    return new Response(JSON.stringify({ error: 'Invalid link ID' }), { status: 400, headers });
  }

  const query = await sql`
    DELETE FROM "Link"
           WHERE id = ${params.id} AND wslug = ${session.wslug}
           RETURNING *;`;

  if (query.rowCount === 0) {
    log.error('Link not found', { id: params.id });
    return new Response(
      JSON.stringify({ success: false, field: 'not-found', error: 'The link could not be found.' }),
      { status: 404, headers },
    );
  }

  log.info('Link deleted', { id: params.id });
  return new Response(JSON.stringify({ success: true }), { status: 200, headers });
});

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: resolveCORSHeaders() });
}
