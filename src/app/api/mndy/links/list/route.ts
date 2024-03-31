import { withAxiom, type AxiomRequest } from 'next-axiom';
import { sql } from '@vercel/postgres';

import type { ShortLink } from 'models/links';
import { resolveSession } from 'utils/auth';
import { resolveCORSHeaders } from 'utils/api';

export const GET = withAxiom(async (req: AxiomRequest) => {
  const headers = resolveCORSHeaders();
  const log = req.log.with({ scope: 'links', endpoint: 'mndy/links/list', ip: req.ip, method: req.method });

  const session = await resolveSession(req);

  if (!session) {
    log.error('Invalid session');
    return new Response(JSON.stringify({ status: 'unauthorized' }), { status: 401, headers });
  }

  const query = await sql<ShortLink>`
    SELECT id, url, wslug, slug, password, "expiresAt"
    FROM "Link"
    WHERE wslug = ${session.wslug}
    ORDER BY "createdAt";`;

  log.info('Links fetched', { workspace: session.workspace, user: session.user, count: query.rowCount });
  return new Response(
    JSON.stringify({ results: query.rows.map((link) => ({ ...link, id: Number(link.id) })) }),
    { status: 200, headers },
  );
});

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: resolveCORSHeaders() });
}

