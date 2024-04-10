import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    // Vercel storage
    POSTGRES_URL: z.string().url(),
    POSTGRES_PRISMA_URL: z.string().url(),
    POSTGRES_URL_NO_SSL: z.string().url(),
    POSTGRES_URL_NON_POOLING: z.string().url(),
    POSTGRES_USER: z.string(),
    POSTGRES_HOST: z.string(),
    POSTGRES_PASSWORD: z.string(),
    POSTGRES_DATABASE: z.string(),
    // Monday.com API keys
    MONDAY_CLIENT_ID: z.string(),
    MONDAY_CLIENT_SECRET: z.string(),
    // Slack
    SLACK_USERS_CHANNEL: z.string().url(),
    SLACK_EMAILS_CHANNEL: z.string().url(),
    SLACK_SUBSCRIPTIONS_CHANNEL: z.string().url(),
    // Resend
    RESEND_API_KEY: z.string(),
    // Lemon Squeezy
    LEMON_SQUEEZY_BASIC_PLAN_MONTHLY_VARIANT: z.string(),
    LEMON_SQUEEZY_BASIC_PLAN_YEARLY_VARIANT: z.string(),
    LEMON_SQUEEZY_PREMIUM_PLAN_MONTHLY_VARIANT: z.string(),
    LEMON_SQUEEZY_PREMIUM_PLAN_YEARLY_VARIANT: z.string(),

    LEMON_SQUEEZY_BASIC_PLAN_MONTHLY_CHECKOUT: z.string(),
    LEMON_SQUEEZY_BASIC_PLAN_YEARLY_CHECKOUT: z.string(),
    LEMON_SQUEEZY_PREMIUM_PLAN_MONTHLY_CHECKOUT: z.string(),
    LEMON_SQUEEZY_PREMIUM_PLAN_YEARLY_CHECKOUT: z.string(),

    LEMON_SQUEEZY_MONTHLY_DISCOUNT_CODE: z.string(),
    LEMON_SQUEEZY_YEARLY_DISCOUNT_CODE: z.string(),

    LEMON_SQUEEZY_SUBSCRIPTION_WEBHOOK_SECRET: z.string(),
    // Platform
    PLATFORM_URL: z.string().url(),
    PLATFORM_PASSWORD: z.string(),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_AXIOM_DATASET: z.string(),
    NEXT_PUBLIC_AXIOM_TOKEN: z.string(),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    POSTGRES_URL: process.env.POSTGRES_URL,
    POSTGRES_PRISMA_URL: process.env.POSTGRES_PRISMA_URL,
    POSTGRES_URL_NO_SSL: process.env.POSTGRES_URL_NO_SSL,
    POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING,
    POSTGRES_USER: process.env.POSTGRES_USER,
    POSTGRES_HOST: process.env.POSTGRES_HOST,
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
    POSTGRES_DATABASE: process.env.POSTGRES_DATABASE,

    NODE_ENV: process.env.NODE_ENV,

    MONDAY_CLIENT_ID: process.env.MONDAY_CLIENT_ID,
    MONDAY_CLIENT_SECRET: process.env.MONDAY_CLIENT_SECRET,

    SLACK_USERS_CHANNEL: process.env.SLACK_USERS_CHANNEL,
    SLACK_EMAILS_CHANNEL: process.env.SLACK_EMAILS_CHANNEL,
    SLACK_SUBSCRIPTIONS_CHANNEL: process.env.SLACK_SUBSCRIPTIONS_CHANNEL,

    RESEND_API_KEY: process.env.RESEND_API_KEY,

    LEMON_SQUEEZY_BASIC_PLAN_MONTHLY_VARIANT: process.env.LEMON_SQUEEZY_BASIC_PLAN_MONTHLY_VARIANT,
    LEMON_SQUEEZY_BASIC_PLAN_YEARLY_VARIANT: process.env.LEMON_SQUEEZY_BASIC_PLAN_YEARLY_VARIANT,
    LEMON_SQUEEZY_PREMIUM_PLAN_MONTHLY_VARIANT: process.env.LEMON_SQUEEZY_PREMIUM_PLAN_MONTHLY_VARIANT,
    LEMON_SQUEEZY_PREMIUM_PLAN_YEARLY_VARIANT: process.env.LEMON_SQUEEZY_PREMIUM_PLAN_YEARLY_VARIANT,

    LEMON_SQUEEZY_BASIC_PLAN_MONTHLY_CHECKOUT: process.env.LEMON_SQUEEZY_BASIC_PLAN_MONTHLY_CHECKOUT,
    LEMON_SQUEEZY_BASIC_PLAN_YEARLY_CHECKOUT: process.env.LEMON_SQUEEZY_BASIC_PLAN_YEARLY_CHECKOUT,
    LEMON_SQUEEZY_PREMIUM_PLAN_MONTHLY_CHECKOUT: process.env.LEMON_SQUEEZY_PREMIUM_PLAN_MONTHLY_CHECKOUT,
    LEMON_SQUEEZY_PREMIUM_PLAN_YEARLY_CHECKOUT: process.env.LEMON_SQUEEZY_PREMIUM_PLAN_YEARLY_CHECKOUT,

    LEMON_SQUEEZY_MONTHLY_DISCOUNT_CODE: process.env.LEMON_SQUEEZY_MONTHLY_DISCOUNT_CODE,
    LEMON_SQUEEZY_YEARLY_DISCOUNT_CODE: process.env.LEMON_SQUEEZY_YEARLY_DISCOUNT_CODE,

    LEMON_SQUEEZY_SUBSCRIPTION_WEBHOOK_SECRET: process.env.LEMON_SQUEEZY_SUBSCRIPTION_WEBHOOK_SECRET,

    PLATFORM_URL: process.env.PLATFORM_URL,
    PLATFORM_PASSWORD: process.env.PLATFORM_PASSWORD,

    NEXT_PUBLIC_AXIOM_DATASET: process.env.NEXT_PUBLIC_AXIOM_DATASET,
    NEXT_PUBLIC_AXIOM_TOKEN: process.env.NEXT_PUBLIC_AXIOM_TOKEN,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined.
   * `SOME_VAR: z.string()` and `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
