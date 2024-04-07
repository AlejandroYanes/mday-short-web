import { env } from 'env';

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

export function notifyOfNewSignup(data: Payload) {
  return sendNotification(
    env.SLACK_USERS_CHANNEL,
    { text: `A user just installed the app:\n*${data.name}*\n*${data.email}*` }
  );
}

export function notifyOfDeletedAccount(data: Payload) {
  return sendNotification(
    env.SLACK_USERS_CHANNEL,
    { text: `A user just removed the app:\n*${data.name}*\n*${data.email}*` }
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
