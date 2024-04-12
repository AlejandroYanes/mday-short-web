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

export function webhookHasData(obj: unknown): obj is {
  data: {
    attributes: Record<string, unknown> & {
      first_subscription_item: {
        id: number;
        subscription_id: number;
        price_id: number;
      };
      customer_id: number;
      product_id: number;
      variant_id: number;
      user_name: string;
      user_email: string;
      status: string;
      card_brand: string;
      card_last_four: string;
      renews_at: string;
      ends_at: string | null;
    };
    id: string;
  };
} {
  return (
    isObject(obj) &&
    'data' in obj &&
    isObject(obj.data) &&
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

export function resolvePlanPrice(variantId: number) {
  for (const key of Object.keys(planToVariantMap)) {
    const plan = planToVariantMap[key as Plan];
    const variants = Object.keys(plan.variants);
    if (variants.includes(`${variantId}`)) {
      return plan.variants[`${variantId}`];
    }
  }

  return 'N/A';
}
