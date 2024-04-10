import { env } from '../env';

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function webhookHasMeta(obj: unknown): obj is {
  meta: {
    event_name: string;
    custom_data: {
      user_id: string;
    };
  };
} {
  return (
    isObject(obj) &&
    isObject(obj.meta) &&
    typeof obj.meta.event_name === 'string' &&
    isObject(obj.meta.custom_data) &&
    typeof obj.meta.custom_data.user_id === 'string'
  );

}

export function webhookHasData(obj: unknown): obj is {
  data: {
    attributes: Record<string, unknown> & {
      first_subscription_item: {
        id: number;
        subscription_id: number;
        customer_id: number;
        product_id: number;
        price_id: number;
        is_usage_based: boolean;
        card_brand: string;
        card_last_four: string;
      };
      variant_id: number;
      status: string;
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

export function resolvePlan(variantId: number) {
  const basicPlanVariants = [
    Number(env.LEMON_SQUEEZY_BASIC_PLAN_MONTHLY_VARIANT),
    Number(env.LEMON_SQUEEZY_BASIC_PLAN_YEARLY_VARIANT),
  ];
  const premiumPlanVariants = [
    Number(env.LEMON_SQUEEZY_PREMIUM_PLAN_MONTHLY_VARIANT),
    Number(env.LEMON_SQUEEZY_PREMIUM_PLAN_YEARLY_VARIANT),
  ];

  if (basicPlanVariants.includes(variantId)) {
    return 'Basic';
  } else if (premiumPlanVariants.includes(variantId)) {
    return 'Premium';
  }
  return 'N/A';
}
