import { env } from 'env';
import { formatDate } from './dates';

function sendNotification(channel: string, body: any) {
  return fetch(channel, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

interface Payload {
  name: string;
  email: string;
}

const isLocalServer = env.NODE_ENV === 'development';

export function notifyOfNewInstall(data: Payload) {
  return sendNotification(
    env.SLACK_USERS_CHANNEL,
    { text: `A user just installed the app:\n*${data.name}*\n*${data.email}*` }
  );
}

export function notifyOfUninstall(data: Payload) {
  return sendNotification(
    env.SLACK_USERS_CHANNEL,
    { text: `A user just removed the app:\n*${data.name}*\n*${data.email}*` }
  );
}

export function notifyOfNewSignup(data: Payload) {
  return sendNotification(
    env.SLACK_USERS_CHANNEL,
    { text: `A user just created an account:\n*${data.name}*\n*${data.email}*` }
  );
}

interface SetupPayload {
  workspace: string;
  wslug: string;
}

export function notifyOfNewSetup(data: SetupPayload) {
  return sendNotification(
    env.SLACK_USERS_CHANNEL,
    { text: `A new Workspace was created:\n*${data.workspace} (${data.wslug})*` }
  );
}

interface EmailPayload {
  email: string;
}

export function notifyOfFailedEmail(data: EmailPayload) {
  return sendNotification(
    env.SLACK_EMAILS_CHANNEL,
    {
      text: `An email for this user has failed to send.\n*${data.email}*`,
    },
  );
}

interface SubscriptionPayload {
  workspace: string;
}

interface NewSetupPayload extends SubscriptionPayload {
  plan: string;
  price: number;
}

export function notifyOfNewSubscription(data: NewSetupPayload) {
  return sendNotification(
    env.SLACK_SUBSCRIPTIONS_CHANNEL,
    {
      // eslint-disable-next-line max-len
      text: `A new subscription was created:\n*Workspace: ${data.workspace}*\n*Plan: ${data.plan} - $${data.price / 100}* ${isLocalServer ? '(Test mode)' : ''}`,
    },
  );
}

export function notifyOfSubscriptionPaused(data: SubscriptionPayload) {
  return sendNotification(
    env.SLACK_SUBSCRIPTIONS_CHANNEL,
    {
      text: `The subscription for this Workspace was paused.\n*${data.workspace}*`,
    },
  );
}

export function notifyOfSubscriptionUnpaused(data: SubscriptionPayload) {
  return sendNotification(
    env.SLACK_SUBSCRIPTIONS_CHANNEL,
    {
      text: `The subscription for this Workspace was un-paused.\n*${data.workspace}*`,
    },
  );
}

export function notifyOfResumedSubscription(data: SubscriptionPayload) {
  return sendNotification(
    env.SLACK_SUBSCRIPTIONS_CHANNEL,
    {
      text: `The subscription for this Workspace was resumed:\n*${data.workspace}*`,
    },
  );
}

interface SoftCancellationPayload extends SubscriptionPayload {
  endsAt: string;
}

export function notifyOfSubscriptionCancellation(data: SoftCancellationPayload) {
  return sendNotification(
    env.SLACK_SUBSCRIPTIONS_CHANNEL,
    {
      text: `The subscription for this Workspace was set to end:\n*${data.workspace} - ${formatDate(data.endsAt)}*`,
    },
  );
}

export function notifyOfSubscriptionExpiration(data: SubscriptionPayload) {
  return sendNotification(
    env.SLACK_SUBSCRIPTIONS_CHANNEL,
    {
      text: `The subscription for this Workspace expired:\n*${data.workspace}*`,
    },
  );
}
