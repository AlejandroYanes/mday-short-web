'use server'
import { redirect } from 'next/navigation';
import { sql } from '@vercel/postgres';
import { getSubscription, lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js';

import { env } from 'env';

const basicMonthlyCheckout = env.LEMON_SQUEEZY_BASIC_PLAN_MONTHLY_CHECKOUT;
const basicYearlyCheckout = env.LEMON_SQUEEZY_BASIC_PLAN_YEARLY_CHECKOUT;

const premiumMonthlyCheckout = env.LEMON_SQUEEZY_PREMIUM_PLAN_MONTHLY_CHECKOUT;
const premiumYearlyCheckout = env.LEMON_SQUEEZY_PREMIUM_PLAN_YEARLY_CHECKOUT;

lemonSqueezySetup({
  apiKey: env.LEMON_SQUEEZY_API_KEY,
});

interface CheckoutParams {
  plan: 'basic' | 'premium';
  cycle: 'month' | 'year';
  name: string;
  email: string;
}

export async function startCheckout(params: CheckoutParams) {
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

  redirect(url.toString());
}

export async function openCustomerPortal() {
  const workspaceId = 1;
  const subscriptionQuery = await sql`SELECT id FROM "Subscription" WHERE "workspaceId" = ${workspaceId}`;

  if (subscriptionQuery.rows.length === 0) {
    return { status: 404, error: 'Subscription not found' };
  }

  const subscriptionId = subscriptionQuery.rows[0]!.id;
  const subscriptionResponse = await getSubscription(subscriptionId);

  if (subscriptionResponse.error || !subscriptionResponse.data) {
    return { status: 400, error: subscriptionResponse.error };
  }

  const subscription = subscriptionResponse.data.data;

  redirect(subscription.attributes.urls.customer_portal);
}
