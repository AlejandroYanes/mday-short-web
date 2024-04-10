/* eslint-disable max-len */
import { type AxiomRequest, withAxiom } from 'next-axiom';
import { sql } from '@vercel/postgres';
import crypto from 'crypto';
import { getPrice } from '@lemonsqueezy/lemonsqueezy.js';

import { env } from 'env';
import { resolvePlan, webhookHasData, webhookHasMeta } from 'utils/lemon';
import {
  notifyOfNewSubscription,
  notifyOfResumedSubscription,
  notifyOfSubscriptionCancellation,
  notifyOfSubscriptionExpiration,
  notifyOfSubscriptionPaused,
  notifyOfSubscriptionUnpaused
} from 'utils/slack';

const secret = env.LEMON_SQUEEZY_SUBSCRIPTION_WEBHOOK_SECRET;

export const POST = withAxiom(async (request: AxiomRequest) => {
  const log = request.log.with({ scope: 'lemon-squeezy', endpoint: '/lemon/hook' });

  const rawBody = await request.text();

  const hmac = crypto.createHmac('sha256', secret);
  const digest = Buffer.from(hmac.update(rawBody).digest('hex'), 'utf8');
  const signature = Buffer.from(
    request.headers.get('X-Signature') ?? '',
    'utf8',
  );

  if (!crypto.timingSafeEqual(digest, signature)) {
    log.error('Invalid signature');
    return new Response('Invalid signature', { status: 400 });
  }

  const event = JSON.parse(rawBody) as unknown;

  // Type guard to check if the object has a 'meta' property.
  if (webhookHasMeta(event) && webhookHasData(event)) {
    const attributes = event.data.attributes;
    const subscriptionId = attributes.first_subscription_item.subscription_id;

    switch (event.meta.event_name) {
      case 'subscription_created': {
        // TODO: add a check for existing subscription before inserting

        const prevSubscription = await sql`SELECT id FROM "Subscription" WHERE id = ${subscriptionId}`;

        if (prevSubscription.rows.length > 0) {
          log.error('Subscription already exists', { workspace: '1' });
          break;
        }

        const variantId = attributes.variant_id;
        const priceId = attributes.first_subscription_item.price_id;
        const priceData = await getPrice(priceId);

        if (priceData.error) {
          log.error('Error fetching price data', {
            event: event.meta.event_name,
            subscription: subscriptionId,
            error: priceData.error,
          });
          break;
        }

        if (!priceData.data) {
          log.error('Price data not found', {
            event: event.meta.event_name,
            subscription: subscriptionId,
          });
          break;
        }

        const customer = attributes.first_subscription_item.customer_id;
        const price = priceData.data.data.attributes.unit_price;
        const plan = resolvePlan(variantId);
        const renewsAt = attributes.renews_at;
        const cardBrand = attributes.first_subscription_item.card_brand;
        const cardDigits = attributes.first_subscription_item.card_last_four;

        await sql`
            INSERT INTO "Subscription" (id, customer, plan, variant, price, status, "workspaceId", "cardBrand", "cardDigits", "renewsAt")
            VALUES (${subscriptionId}, ${customer}, ${plan}, ${variantId}, ${price}, 'active', 1, ${cardBrand}, ${cardDigits}, ${renewsAt})`;

        await notifyOfNewSubscription({ workspace: '1', plan });
        log.info('Subscription created', { workspace: '1' });
      } break;

      case 'subscription_updated': {
        const status = attributes.status as string;
        const renewsAt = attributes.renews_at;
        const endsAt = attributes.ends_at;
        const cardBrand = attributes.first_subscription_item.card_brand;
        const cardDigits = attributes.first_subscription_item.card_last_four;

        await sql`
          UPDATE "Subscription"
          SET status = ${status}, "renewsAt"=${renewsAt}, "endsAt"=${endsAt}, "cardBrand"=${cardBrand}, "cardDigits"=${cardDigits}
          WHERE id = ${subscriptionId}`;
      } break;

      case 'subscription_cancelled': {
        const endsAt = attributes.ends_at!;
        await notifyOfSubscriptionCancellation({ workspace: '1', endsAt });
        log.info('Subscription cancelled', { workspace: '1' });
      } break;

      case 'subscription_resumed': {
        await notifyOfResumedSubscription({ workspace: '1' });
        log.info('Subscription resumed', { workspace: '1' });
      } break;

      case 'subscription_expired': {
        await notifyOfSubscriptionExpiration({ workspace: '1' });
        log.info('Subscription expired', { workspace: '1' });
      } break;

      case 'subscription_paused': {
        await notifyOfSubscriptionPaused({ workspace: '1' });
        log.info('Subscription paused', { workspace: '1' });
      } break;

      case 'subscription_unpaused': {
        await notifyOfSubscriptionUnpaused({ workspace: '1' });
        log.info('Subscription unpaused', { workspace: '1' });
      } break;
    }

    return new Response('OK', { status: 200 });
  }

  log.error('Data invalid');
  return new Response('Data invalid', { status: 400 });
});
