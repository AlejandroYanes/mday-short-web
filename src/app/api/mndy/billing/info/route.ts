import { type AxiomRequest, withAxiom } from 'next-axiom';
import { sql } from '@vercel/postgres';

import type { BillingInfo } from 'models/subscription';
import { resolveCORSHeaders } from 'utils/api';
import { decryptMessage, resolveSession } from 'utils/auth';

export const GET = withAxiom(async (req: AxiomRequest) => {
  const headers = resolveCORSHeaders();
  const log = req.log.with({ scope: 'billing', endpoint: 'mndy/billing/info', ip: req.ip, method: req.method });

  const session = await resolveSession(req);

  if (!session) {
    log.error('Invalid token');
    return new Response(JSON.stringify({ status: 'unauthorized' }), { status: 401, headers });
  }

  const { workspace } = session;

  log.with({ workspace });

  const billingInfoQuery = await sql<BillingInfo>`
    SELECT "customerName", "customerEmail", "cardBrand", "cardDigits", "renewsAt", price, variant, status
    FROM "Subscription" WHERE "workspaceId" = ${workspace}`;

  const billingInfo = billingInfoQuery.rows[0];

  if (!billingInfo) {
    log.error('No billing info found');
    return new Response(JSON.stringify({ status: 'not_found' }), { status: 404, headers });
  }

  log.info('Querying billing info');
  billingInfo.customerName = (await decryptMessage(billingInfo.customerName))!;
  billingInfo.customerEmail = (await decryptMessage(billingInfo.customerEmail))!;

  return new Response(JSON.stringify(billingInfo), { status: 200, headers });
});

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: resolveCORSHeaders() });
}
