import type { Subscription, SubscriptionInvoice } from '@lemonsqueezy/lemonsqueezy.js';

import { type Plan, planToVariantMap } from 'models/lemon';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function webhookHasMeta(obj: unknown): obj is {
  meta: {
    event_name: string;
    webhook_id: string;
  };
} {
  return (
    isObject(obj) &&
    isObject(obj.meta) &&
    typeof obj.meta.event_name === 'string'
  );

}

export function webhookHasSubscriptionData(obj: unknown): obj is { data: Subscription['data'] } {
  return (
    isObject(obj) &&
    'data' in obj &&
    isObject(obj.data) &&
    obj.data.type === 'subscriptions' &&
    'attributes' in obj.data
  );
}

export function webhookHasInvoiceData(obj: unknown): obj is { data: SubscriptionInvoice['data'] } {
  return (
    isObject(obj) &&
    'data' in obj &&
    isObject(obj.data) &&
    obj.data.type === 'subscription-invoices' &&
    'attributes' in obj.data
  );
}

export function resolvePlanName(variantId: number) {
  for (const key of Object.keys(planToVariantMap)) {
    const plan = planToVariantMap[key as Plan];
    const variants = Object.keys(plan.variants);
    if (variants.includes(`${variantId}`)) {
      return plan.name;
    }
  }

  return 'N/A';
}

export function resolvePlanCycle(variantId: number) {
  for (const key of Object.keys(planToVariantMap)) {
    const plan = planToVariantMap[key as Plan];
    const variants = Object.keys(plan.variants);
    if (variants.includes(`${variantId}`)) {
      return plan.variants[`${variantId}`]!.cycle;
    }
  }

  return 'N/A';

}

export function isPremiumPlan(variantId: number) {
  const premiumVariants = planToVariantMap.premium.variants;
  return Object.keys(premiumVariants).includes(`${variantId}`);
}

export function getSubscriptionInformation(subscription: { variant: number; status: string } | undefined) {
  const allowedStatuses = ['active', 'on_trial', 'past_due', 'paused', 'canceled'];
  const hasSubscription = !!subscription && allowedStatuses.includes(subscription.status);
  const isPremium = hasSubscription && isPremiumPlan(subscription.variant);
  const isFreeTrial = hasSubscription && subscription.status === 'on_trial';

  return {
    hasSubscription,
    isPremium,
    isFreeTrial,
  };
}
