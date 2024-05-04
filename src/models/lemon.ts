import { env } from '../env';

export type Plan = 'basic' | 'premium';

export const planToVariantMap: {
  [key in Plan]: {
    name: string;
    variants: {
      [variant: string]: {
        price: number;
        cycle: 'month' | 'year';
      };
    };
  };
} = {
  basic: {
    name: 'Basic',
    variants: {
      [env.LEMON_SQUEEZY_BASIC_PLAN_MONTHLY_VARIANT]: {
        price: 8,
        cycle: 'month',
      },
      [env.LEMON_SQUEEZY_BASIC_PLAN_YEARLY_VARIANT]: {
        price: 80,
        cycle: 'year',

      },
    },
  },
  premium: {
    name: 'Premium',
    variants: {
      [env.LEMON_SQUEEZY_PREMIUM_PLAN_MONTHLY_VARIANT]: {
        price: 12,
        cycle: 'month',

      },
      [env.LEMON_SQUEEZY_PREMIUM_PLAN_YEARLY_VARIANT]: {
        price: 120,
        cycle: 'year',
      },
    },
  },
};
