import { type AxiomRequest, withAxiom } from 'next-axiom';
import { z } from 'zod';
import { sql } from '@vercel/postgres';

import { env } from 'env';
import { WorkspaceRole } from 'models/user-in-workspace';
import { resolveCORSHeaders } from 'utils/api';
import { decryptMessage, openJWT } from 'utils/auth';

const validator = z.object({
  workspace: z.number(),
  email: z.string().email(),
  plan: z.enum(['basic', 'premium']),
  cycle: z.enum(['month', 'year']),
  token: z.string(),
});

export const POST = withAxiom(async (req: AxiomRequest) => {
  const headers = resolveCORSHeaders();
  const log = req.log.with({ scope: 'billing', endpoint: 'mndy/billing/checkout', ip: req.ip, method: req.method });

  const body = await req.json();
  const parsedBody = validator.safeParse(body);

  if (!parsedBody.success) {
    log.error('Invalid input', { error: parsedBody.error.errors, body });
    return new Response(JSON.stringify({ status: 'invalid data' }), { status: 400, headers });
  }

  const { token, email, workspace, plan, cycle } = parsedBody.data;
  const session = await openJWT(token);

  if (!session) {
    log.error('Invalid token');
    return new Response(JSON.stringify({ status: 'unauthorized' }), { status: 401, headers });
  }

  console.log('session', session);
  const isViewOnly = session.dat.is_view_only;

  if (isViewOnly) {
    log.info('View only user');
    return new Response(JSON.stringify({ status: 'view-only' }), { status: 400, headers });
  }

  const ownersQuery = await sql<{ name: string; email: string }>`
    SELECT U.name, U.email
    FROM "User" U
      INNER JOIN "UserInWorkspace" UIW ON U.id = UIW."userId"
    WHERE UIW.role = ${WorkspaceRole.OWNER} AND UIW."workspaceId" = ${workspace}
    ORDER BY U."createdAt"`;

  if (ownersQuery.rows.length === 0) {
    return new Response(JSON.stringify({ status: 'workspace not found' }), { status: 404, headers });
  }

  const owners: { name: string; email: string }[] = [];

  for (const row of ownersQuery.rows) {
    owners.push({
      name: (await decryptMessage(row.name))!,
      email: (await decryptMessage(row.email))!,
    });
  }

  const ownerByEmail = owners.find(owner => owner.email === email);
  const owner = ownerByEmail ?? owners[0]!;

  const checkoutURL = resolveCheckoutURL({ plan, cycle, name: owner.name, email: owner.email });

  return new Response(JSON.stringify({ url: checkoutURL }), { status: 200, headers });
});

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: resolveCORSHeaders() });
}

const basicMonthlyCheckout = env.LEMON_SQUEEZY_BASIC_PLAN_MONTHLY_CHECKOUT;
const basicYearlyCheckout = env.LEMON_SQUEEZY_BASIC_PLAN_YEARLY_CHECKOUT;

const premiumMonthlyCheckout = env.LEMON_SQUEEZY_PREMIUM_PLAN_MONTHLY_CHECKOUT;
const premiumYearlyCheckout = env.LEMON_SQUEEZY_PREMIUM_PLAN_YEARLY_CHECKOUT;

interface CheckoutParams {
  plan: 'basic' | 'premium';
  cycle: 'month' | 'year';
  name: string;
  email: string;
}

function resolveCheckoutURL(params: CheckoutParams) {
  const { plan, cycle, name, email } = params;

  let url;

  if (plan === 'premium') {
    url = cycle === 'month' ? new URL(premiumMonthlyCheckout) : new URL(premiumYearlyCheckout);

    if (cycle === 'month') {
      url.searchParams.append('checkout[discount_code]', env.LEMON_SQUEEZY_MONTHLY_DISCOUNT_CODE);
    } else {
      url.searchParams.append('checkout[discount_code]', env.LEMON_SQUEEZY_YEARLY_DISCOUNT_CODE);
    }

  } else {
    url = cycle === 'month' ? new URL(basicMonthlyCheckout) : new URL(basicYearlyCheckout);
  }

  url.searchParams.append('checkout[email]', email);
  url.searchParams.append('checkout[name]', name);

  return url;
}
