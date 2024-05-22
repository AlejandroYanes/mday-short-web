import { Resend } from 'resend';
import type { VercelPoolClient } from '@vercel/postgres';
import type { Logger } from 'next-axiom';

import { env } from 'env';
import { notifyOfFailedEmail } from './slack';
import { WorkspaceRole } from '../models/user-in-workspace';
import { decryptMessage } from './auth';

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
    return { success: false, email: payload.to, message: error.message };
  }

  return { success: true, id: data?.id, email: payload.to };
}

interface OwnersEmailsPayload {
  workspace: number;
  user: string;
}

export async function sendEmailsToOwners(
  client: VercelPoolClient,
  log: Logger,
  payload: OwnersEmailsPayload
) {
  const { workspace, user } = payload;

  try {
    const ownersQuery = await client.sql<{ email: string; name: string; workspaceName: string }>`
      SELECT U.email, U.name, W.name as "workspaceName"
      FROM "User" U INNER JOIN "UserInWorkspace" UIW ON UIW."userId" = U.id
                    INNER JOIN "Workspace" W ON W.mid = UIW."workspaceId"
      WHERE UIW."workspaceId" = ${workspace} AND role = ${WorkspaceRole.OWNER}`;

    const owners: { email: string; name: string; workspaceName: string }[] = [];

    for (const owner of ownersQuery.rows) {
      owners.push({
        email: (await decryptMessage(owner.email))!,
        name: (await decryptMessage(owner.name))!,
        workspaceName: owner.workspaceName,
      });
    }

    const emailPromises = owners.map(({ email, name, workspaceName }) => sendEmail({
      to: email,
      subject: 'New user awaiting approval.',
      body: (
        <div>
          <p>Hello {name},</p>
          <br/>
          <p>
            {user} is awaiting your approval to join the
            {/* eslint-disable-next-line react/no-unescaped-entities */}
            "{workspaceName}" workspace for Mndy.
          </p>
          <br/>
          <br/>
          <br/>
          <br/>
          <br/>
          <br/>
          <p>
            Best,
            <br/>
            The Mndy Team
          </p>
        </div>
      ),
    }));

    const emailResults = await Promise.allSettled(emailPromises);
    const emailErrors = emailResults.filter((result) => (
      result.status !== 'fulfilled' || result.value.success === false
    ));

    if (emailErrors.length > 0) {
      console.log('Failed to send join request emails', emailErrors);
      log.error('Failed to send join request emails', { emailErrors, workspace });
    }
  } catch (error: any) {
    console.log('Failed to send join request emails', error);
    log.error('Failed to send join request emails', { workspace, error: error.message });
  }
}

interface InviteEmailPayload {
  to: string;
  name: string;
  workspaceName: string;
}

export async function sendInviteEmail(payload: InviteEmailPayload) {
  return sendEmail({
    to: payload.to,
    subject: 'You have been invited to join a workspace',
    body: (
      <div>
        <p>Hello {payload.name},</p>
        <br/>
        <p>
          {/* eslint-disable-next-line react/no-unescaped-entities */}
          You have been invited to join the "{payload.workspaceName}" workspace for Mndy.
        </p>
        <br/>
        <br/>
        <br/>
        <p>
          Best,
          <br/>
          The Mndy Team
        </p>
      </div>
    ),
  });
}

interface FollowupEmailPayload {
  to: string;
  name: string;
}

export async function sendSignupFollowupEmail(payload: FollowupEmailPayload) {
  return sendEmail({
    to: payload.to,
    subject: 'Welcome to Mndy!',
    body: (
      <div>
        <p>Hello {payload.name}!</p>
        <p>Thank you for signing up! {`We're`} excited to have you on board.</p>
        <p>
          We’d love to hear about you and your goals for using Mndy.
          Your feedback is invaluable to us and helps us improve the tool to better meet your needs.
          <br/>
          <br/>
          Could you take a moment to let us know:
          <ul>
            <li>What features are you most excited to use?</li>
            <li>What features you’d like to see in the future?</li>
            <li>Any questions you might have?</li>
          </ul>
          <br/>
          Feel free to reply to this email with your thoughts or any questions you might have.
          We’re here to help and ensure you get the most out of our tool.
        </p>
        <br/>
        <br/>
        <p>
          Best,
          <br/>
          The Mndy Team
        </p>
      </div>
    ),
  });
}
