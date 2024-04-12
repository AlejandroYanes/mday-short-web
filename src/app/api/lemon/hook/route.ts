/* eslint-disable max-len */
import { type AxiomRequest, withAxiom } from 'next-axiom';
import { sql } from '@vercel/postgres';
import crypto from 'crypto';
import { getPrice, lemonSqueezySetup } from '@lemonsqueezy/lemonsqueezy.js';

import { env } from 'env';
import { WorkspaceRole } from 'models/user-in-workspace';
import { encryptMessage } from 'utils/auth';
import { resolvePlanName, webhookHasData, webhookHasMeta } from 'utils/lemon';
import {
  notifyOfNewSubscription,
  notifyOfResumedSubscription,
  notifyOfSubscriptionCancellation,
  notifyOfSubscriptionExpiration,
  notifyOfSubscriptionPaused,
  notifyOfSubscriptionUnpaused
} from 'utils/slack';

const secret = env.LEMON_SQUEEZY_SUBSCRIPTION_WEBHOOK_SECRET;

lemonSqueezySetup({
  apiKey: env.LEMON_SQUEEZY_API_KEY,
})

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
    const customerEmail = attributes.user_email;

    const client = await sql.connect();

    const workspaceQuery = await client.sql<{ mid: string; name: string }>`
      SELECT W.mid, W.name
      FROM "Workspace" W
        INNER JOIN "UserInWorkspace" UIW ON W.mid = UIW."workspaceId"
        INNER JOIN "User" U ON U.id = UIW."userId"
      WHERE U.email = ${await encryptMessage(customerEmail)} AND UIW."role" = ${WorkspaceRole.OWNER}`;

    if (workspaceQuery.rows.length === 0) {
      log.error('Workspace not found', { email: customerEmail });
      client.release();
      return new Response('Workspace not found', { status: 404 });
    }

    const workspaceId = Number(workspaceQuery.rows[0]!.mid);
    const workspaceName = workspaceQuery.rows[0]!.name;

    log.with({ workspace: workspaceName, event: event.meta.event_name });

    switch (event.meta.event_name) {
      case 'subscription_created': {
        const prevSubscription = await sql`SELECT id FROM "Subscription" WHERE id = ${subscriptionId}`;

        if (prevSubscription.rows.length > 0) {
          log.error('Subscription already exists', { email: customerEmail });
          client.release();
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

        const price = priceData.data.data.attributes.unit_price;
        const customer = attributes.customer_id;
        const renewsAt = attributes.renews_at;
        const cardBrand = attributes.card_brand;
        const cardDigits = attributes.card_last_four;
        const status = attributes.status;

        await sql`
            INSERT INTO "Subscription" (id, customer, variant, price, status, "workspaceId", "cardBrand", "cardDigits", "renewsAt")
            VALUES (${subscriptionId}, ${customer}, ${variantId}, ${price}, ${status}, ${workspaceId}, ${cardBrand}, ${cardDigits}, ${renewsAt})`;

        await notifyOfNewSubscription({ workspace: workspaceName, plan: resolvePlanName(variantId), price });
        log.info('Subscription created');
      } break;

      case 'subscription_updated': {
        const status = attributes.status as string;
        const renewsAt = attributes.renews_at;
        const endsAt = attributes.ends_at;
        const cardBrand = attributes.card_brand;
        const cardDigits = attributes.card_last_four;

        await sql`
          UPDATE "Subscription"
          SET status = ${status}, "renewsAt"=${renewsAt}, "endsAt"=${endsAt}, "cardBrand"=${cardBrand}, "cardDigits"=${cardDigits}
          WHERE id = ${subscriptionId}`;
        log.info('Subscription updated', { status, renewsAt, endsAt });
      } break;

      case 'subscription_cancelled': {
        const endsAt = attributes.ends_at!;
        await notifyOfSubscriptionCancellation({ workspace: workspaceName, endsAt });
        log.info('Subscription cancelled');
      } break;

      case 'subscription_resumed': {
        await notifyOfResumedSubscription({ workspace: workspaceName });
        log.info('Subscription resumed');
      } break;

      case 'subscription_expired': {
        await notifyOfSubscriptionExpiration({ workspace: workspaceName });
        log.info('Subscription expired');
      } break;

      case 'subscription_paused': {
        await notifyOfSubscriptionPaused({ workspace: workspaceName });
        log.info('Subscription paused');
      } break;

      case 'subscription_unpaused': {
        await notifyOfSubscriptionUnpaused({ workspace: workspaceName });
        log.info('Subscription unpaused');
      } break;
    }

    client.release();
    return new Response('OK', { status: 200 });
  }

  log.error('Data invalid');
  return new Response('Data invalid', { status: 400 });
});
