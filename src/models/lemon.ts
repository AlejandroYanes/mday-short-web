import { env } from '../env';

export type Plan = 'basic' | 'premium';

export const planToVariantMap: {
  [key in Plan]: {
    name: string;
    variants: {
      [variant: string]: number;
    };
  };
} = {
  basic: {
    name: 'Basic',
    variants: {
      [env.LEMON_SQUEEZY_BASIC_PLAN_MONTHLY_VARIANT]: 8,
      [env.LEMON_SQUEEZY_BASIC_PLAN_YEARLY_VARIANT]: 80,
    },
  },
  premium: {
    name: 'Premium',
    variants: {
      [env.LEMON_SQUEEZY_PREMIUM_PLAN_MONTHLY_VARIANT]: 12,
      [env.LEMON_SQUEEZY_PREMIUM_PLAN_YEARLY_VARIANT]: 120,
    },
  },
};
