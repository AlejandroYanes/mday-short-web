import { type AxiomRequest, withAxiom } from 'next-axiom';
import { sql } from '@vercel/postgres';

import type { Invoice } from 'models/invoice';
import { resolveCORSHeaders } from 'utils/api';
import { resolveSession } from 'utils/auth';

export const GET = withAxiom(async (req: AxiomRequest) => {
  const log = req.log.with({ scope: 'billing', endpoint: 'mndy/billing/invoices', ip: req.ip, method: req.method });
  const headers = resolveCORSHeaders();

  const session = await resolveSession(req);

  if (!session) {
    log.error('Invalid token');
    return new Response(JSON.stringify({ status: 'unauthorized' }), { status: 401, headers });
  }

  const { workspace } = session;

  log.with({ workspace });

  const subscriptionQuery = await sql<{ id: number }>`SELECT id FROM "Subscription" WHERE "workspaceId" = ${workspace}`;

  if (!subscriptionQuery.rows[0]) {
    log.error('No subscription found');
    return new Response(JSON.stringify({ status: 'not_found' }), { status: 404, headers });
  }

  const subscriptionId = subscriptionQuery.rows[0].id;

  const invoicesQuery = await sql<Invoice>`
    SELECT "id", "createdAt", "cardBrand", "cardDigits", total, discount, status, url
    FROM "Invoice" WHERE "subscriptionId" = ${subscriptionId}`;

  const invoices = invoicesQuery.rows;

  log.info('Querying invoices');
  return new Response(JSON.stringify(invoices), { status: 200, headers });
});

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: resolveCORSHeaders() });
}
