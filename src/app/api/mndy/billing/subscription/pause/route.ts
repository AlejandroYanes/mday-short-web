import { type AxiomRequest, withAxiom } from 'next-axiom';
import { lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js';
import { sql } from '@vercel/postgres';

import { env } from 'env';
import { resolveCORSHeaders } from 'utils/api';
import { resolveSession } from 'utils/auth';
import { WorkspaceRole } from 'models/user-in-workspace';

lemonSqueezySetup({
  apiKey: env.LEMON_SQUEEZY_API_KEY,
});

export const PATCH = withAxiom(async (req: AxiomRequest) => {
  const headers = resolveCORSHeaders();
  const log = req.log.with({
    scope: 'billing',
    endpoint: 'mndy/billing/subscription/pause',
    ip: req.ip,
    method: req.method,
  });

  const session = await resolveSession(req);

  if (!session || session.role !== WorkspaceRole.OWNER) {
    log.error('Invalid token');
    return new Response(JSON.stringify({ status: 'unauthorized' }), { status: 401, headers });
  }

  const { workspace, user } = session;

  log.with({ workspace, user });

  const subscriptionQuery = await sql`
    SELECT id FROM "Subscription" WHERE "workspaceId" = ${workspace} ORDER BY "createdAt" DESC LIMIT 1
  `;

  if (subscriptionQuery.rows.length === 0) {
    log.error('Subscription not found');
    return new Response(JSON.stringify({ status: 'subscription not found' }), { status: 404, headers });
  }

  const subscriptionId = subscriptionQuery.rows[0]!.id;
  const response = await fetch(`https://api.lemonsqueezy.com/v1/subscriptions/${subscriptionId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${env.LEMON_SQUEEZY_API_KEY}`,
    },
    body: JSON.stringify({
      'data': {
        type: 'subscriptions',
        id: subscriptionId,
        attributes: {
          pause: {
            mode: 'void',
          }
        }
      }
    }),
  });

  if (!response.ok) {
    log.error('Failed to pause subscription', { status: response.status });
    return new Response(JSON.stringify({ status: 'error' }), { status: 400, headers });
  }

  return new Response(JSON.stringify({ status: 'success' }), { status: 200, headers });
});

export function OPTIONS() {
  return new Response(null, { status: 204, headers: resolveCORSHeaders() });
}
