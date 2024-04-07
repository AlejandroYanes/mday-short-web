import { Resend } from 'resend';

import { env } from 'env';
import { notifyOfFailedEmail } from './slack';

const resend = new Resend(env.RESEND_API_KEY);
// const URL = env.PLATFORM_URL || `https://${process.env.VERCEL_URL}`;

interface Payload {
  to: string;
  from?: string;
  subject: string;
  body: JSX.Element | string;
}

export async function sendEmail(payload: Payload) {
  const { error, data } = await resend.emails.send({
    from: payload.from || 'Mndy <contat@mndy.link>',
    to: payload.to,
    subject: payload.subject,
    react: payload.body,
  });

  if (error) {
    console.log(`❌ Error sending email to ${payload.to}: ${error.message}`);
    await notifyOfFailedEmail({ email: payload.to });
    // throw new Error(error.message);
    return null;
  }

  return data;
}
