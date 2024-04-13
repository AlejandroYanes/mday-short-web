import { type AxiomRequest, withAxiom } from 'next-axiom';
import { sql } from '@vercel/postgres';
import { getSubscription, lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js';

import { env } from 'env';
import { WorkspaceRole } from 'models/user-in-workspace';
import { resolveCORSHeaders } from 'utils/api';
import { resolveSession } from 'utils/auth';

lemonSqueezySetup({
  apiKey: env.LEMON_SQUEEZY_API_KEY,
});

export const GET = withAxiom(async (req: AxiomRequest) => {
  const headers = resolveCORSHeaders();
  const log = req.log.with({ scope: 'billing', endpoint: 'mndy/billing/portal', ip: req.ip, method: req.method });

  const session = await resolveSession(req);

  if (!session || session.role !== WorkspaceRole.OWNER) {
    log.error('Invalid token');
    return new Response(JSON.stringify({ status: 'unauthorized' }), { status: 401, headers });
  }

  const { workspace, user } = session;

  log.with({ workspace, user });

  const subscriptionQuery = await sql`SELECT id FROM "Subscription" WHERE "workspaceId" = ${workspace}`;

  if (subscriptionQuery.rows.length === 0) {
    log.error('Subscription not found');
    return new Response(JSON.stringify({ status: 'subscription not found' }), { status: 404, headers });
  }

  const subscriptionId = subscriptionQuery.rows[0]!.id;
  const subscriptionResponse = await getSubscription(subscriptionId);

  if (subscriptionResponse.error || !subscriptionResponse.data) {
    log.error('Failed to get subscription', { error: subscriptionResponse.error});
    return new Response(JSON.stringify({ status: 'error' }), { status: 400, headers });
  }

  log.info('User opened customer portal');
  const subscription = subscriptionResponse.data.data;

  return new Response(
    JSON.stringify({ url: subscription.attributes.urls.customer_portal }),
    { status: 200, headers },
  );
});

export function OPTIONS() {
  return new Response(null, { status: 204, headers: resolveCORSHeaders() });
}
