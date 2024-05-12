import { withAxiom, type AxiomRequest } from 'next-axiom';
import { sql } from '@vercel/postgres';
import { z } from 'zod';

import { WorkspaceStatus } from 'models/user-in-workspace';
import { resolveCORSHeaders } from 'utils/api';
import { openJWT, initiateSession, encryptMessage } from 'utils/auth';
import { getSubscriptionInformation } from 'utils/lemon';

const validator = z.object({
  workspace: z.number(),
  email: z.string().email(),
  token: z.string(),
});

export const POST = withAxiom(async (req: AxiomRequest) => {
  const headers = resolveCORSHeaders();
  const log = req.log.with({ scope: 'user', endpoint: 'mndy/users/join', ip: req.ip, method: req.method });

  const body = await req.json();
  const input = validator.safeParse(body);

  if (!input.success) {
    log.error('Invalid input', { body, error: input.error.errors });
    return new Response(
      JSON.stringify({ status: 'invalid', error: input.error.errors }),
      { status: 400, headers },
    );
  }

  const { workspace, email, token } = input.data;

  const session = await openJWT(token);

  if (!session) {
    log.error('Invalid session');
    return new Response(JSON.stringify({ status: 'unauthorized' }), { status: 401, headers });
  }

  const client = await sql.connect();

  const workspaceQuery = await client.sql<{ id: string; slug: string }>`
    SELECT id, slug FROM "Workspace" WHERE mid = ${workspace}`;

  if (workspaceQuery.rows.length === 0) {
    client.release();
    log.error('Workspace not found', { workspace });
    return new Response(JSON.stringify({ status: 'not-found' }), { status: 404, headers });
  }

  const subscriptionQuery = await client.sql<{ id: number; variant: number; status: string }>`
      SELECT id, variant, status FROM "Subscription" WHERE "workspaceId" = ${workspace} AND status = 'active'`;

  const subscription = subscriptionQuery.rows[0];
  const { hasSubscription, isPremium, isFreeTrial } = getSubscriptionInformation(subscription);

  if (!hasSubscription) {
    client.release();
    log.error('No active subscription', { workspace });
    return new Response(JSON.stringify({ status: 'needs-billing' }), { status: 400, headers });
  }

  const userQuery = await client.sql<{ id: number }>`
    SELECT id FROM "User" WHERE email = ${await encryptMessage(email)}`;

  if (userQuery.rows.length === 0) {
    client.release();
    log.error('User not found', { email });
    return new Response(JSON.stringify({ status: 'not-found' }), { status: 404, headers });
  }

  const userId = userQuery.rows[0]!.id;

  const relationQuery = await client.sql<{ role: string; status: string }>`
    SELECT role, status FROM "UserInWorkspace"
    WHERE "workspaceId" = ${workspace} AND "userId" = ${userId}`;

  if (relationQuery.rows.length === 0) {
    client.release();
    log.error('Invitation not found', { workspace, user: userId });
    return new Response(JSON.stringify({ status: 'not-found' }), { status: 404, headers });
  }

  await client.sql<{ role: string }>`
    UPDATE "UserInWorkspace" SET status = ${WorkspaceStatus.ACTIVE}
    WHERE "workspaceId" = ${workspace} AND "userId" = ${userId}
    RETURNING role`;

  client.release();

  log.info('User joined', { user: userId, workspace });

  const sessionToken = await initiateSession({
    workspace,
    wslug: workspaceQuery.rows[0]!.slug,
    user: userId,
    role: relationQuery.rows[0]!.role,
    isPremium,
    isFreeTrial,
  });

  return new Response(
    JSON.stringify({
      status: 'success',
      sessionToken,
      role: relationQuery.rows[0]!.role,
      isPremium,
      isFreeTrial,
    }),
    { status: 200, headers },
  );
});

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: resolveCORSHeaders() });
}
