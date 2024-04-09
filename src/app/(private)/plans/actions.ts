'use server'
import { redirect } from 'next/navigation';

import { env } from 'env';

const basicMonthlyPlan = env.LEMON_SQUEEZY_BASIC_PLAN_MONTHLY_VARIANT;
const basicYearlyPlan = env.LEMON_SQUEEZY_BASIC_PLAN_YEARLY_VARIANT;

const premiumMonthlyPlan = env.LEMON_SQUEEZY_PREMIUM_PLAN_MONTHLY_VARIANT;
const premiumYearlyPlan = env.LEMON_SQUEEZY_PREMIUM_PLAN_YEARLY_VARIANT;

export async function startCheckout(plan: 'basic' | 'premium', cycle: 'month' | 'year') {
  let url;

  if (plan === 'premium') {
    url = cycle === 'month' ? new URL(premiumMonthlyPlan) : new URL(premiumYearlyPlan);

    if (cycle === 'month') {
      url.searchParams.append('checkout[discount_code]', env.LEMON_SQUEEZY_MONTHLY_DISCOUNT_CODE);
    } else {
      url.searchParams.append('checkout[discount_code]', env.LEMON_SQUEEZY_YEARLY_DISCOUNT_CODE);
    }

  } else {
    url = cycle === 'month' ? new URL(basicMonthlyPlan) : new URL(basicYearlyPlan);
  }

  url.searchParams.append('checkout[email]', 'hello@example.com');
  url.searchParams.append('checkout[name]', 'Luke Skywalker');

  redirect(url.toString());
}
