'use server'
import { redirect } from 'next/navigation';

import { env } from 'env';

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
