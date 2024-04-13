import { withAxiom, type AxiomRequest } from 'next-axiom';
import { sql } from '@vercel/postgres';
import { z } from 'zod';

import { WorkspaceRole, WorkspaceStatus } from 'models/user-in-workspace';
import { openJWT, initiateSession, encryptMessage } from 'utils/auth';
import { resolveCORSHeaders } from 'utils/api';
import { sendEmailsToOwners } from 'utils/resend';

const validator = z.object({
  workspace: z.number(),
  name: z.string(),
  email: z.string().email(),
  token: z.string(),
});

export const  POST = withAxiom(async (req: AxiomRequest) => {
  const headers = resolveCORSHeaders();
  const log = req.log.with({ scope: 'user', endpoint: 'mndy/auth/check', ip: req.ip, method: req.method });

  const body = await req.json();
  const input = validator.safeParse(body);

  if (!input.success) {
    log.error('Invalid input', { error: input.error.errors, body  });
    return new Response(
      JSON.stringify({ status: 'invalid', error: input.error.errors }),
      { status: 400, headers },
    );
  }

  const { workspace, name, email, token } = input.data;

  const session = await openJWT(token);

  if (!session) {
    log.error('Invalid token');
    return new Response(JSON.stringify({ status: 'unauthorized' }), { status: 401, headers });
  }

  const isViewOnly = session.dat.is_view_only;

  if (isViewOnly) {
    log.info('View-only user');
    return new Response(JSON.stringify({ status: 'view-only' }), { status: 200, headers });
  }

  const client = await sql.connect();

  try {
    const workspaceQuery = await client.sql<{ id: number; slug: string }>`
    SELECT id, slug FROM "Workspace" WHERE mid = ${workspace}`;

    if (workspaceQuery.rows.length === 0) {
      // workspace does not exist & needs to be created
      client.release();
      log.error('Workspace not found', { workspace });
      return new Response(JSON.stringify({ status: 'not-found' }), { status: 200, headers });
    }

    const subscriptionQuery = await client.sql<{ id: number }>`
    SELECT id FROM "Subscription" WHERE "workspaceId" = ${workspace} AND status = 'active'`;

    const hasSubscription = subscriptionQuery.rows.length > 0;

    const userQuery = await client.sql<{ id: number; name: string }>`
    SELECT id, name FROM "User" WHERE email = ${await encryptMessage(email)}`;

    if (userQuery.rows.length === 0) {
      // workspace exists, but user does not,
      // so we need to create a new user and create join req for the workspace
      const newUserQuery = await client.sql<{ id: string; name: string }>`
        INSERT INTO "User" (name, email)
        VALUES (${await encryptMessage(name)}, ${await encryptMessage(email)}) RETURNING id, name`;

      const newUser = newUserQuery.rows[0]!;
      const newUserId = Number(newUser.id);

      await client.sql`
        INSERT INTO "UserInWorkspace" ("workspaceId", "userId", role, status)
        VALUES (${workspace}, ${newUserId}, ${WorkspaceRole.USER}, ${WorkspaceStatus.PENDING})`;

      await sendEmailsToOwners(client, log, {
        workspace,
        user: name,
      });

      client.release();

      log.info('User created', { user: newUserId, workspace });

      // the status changes if there is a subscription
      return new Response(
        JSON.stringify({ status: hasSubscription ? 'pending' : 'needs-billing' }),
        { status: 200, headers },
      );
    }

    const user = userQuery.rows[0]!;
    const userId = Number(user.id);

    const relationQuery = await client.sql<{ role: string; status: string }>`
      SELECT role, status FROM "UserInWorkspace"
      WHERE "workspaceId" = ${workspace} AND "userId" = ${userId}
    `;

    if (relationQuery.rows.length === 0) {
      // user exists, but is not in the workspace, so a join request is created
      await client.sql`
        INSERT INTO "UserInWorkspace" ("workspaceId", "userId", role, status)
        VALUES (${workspace}, ${userId}, ${WorkspaceRole.USER}, ${WorkspaceStatus.PENDING})`;

      await sendEmailsToOwners(client, log, {
        workspace,
        user: name,
      });

      client.release();
      log.info('User added to workspace', { user, workspace });

      // the status changes if there is a subscription
      return new Response(
        JSON.stringify({ status: hasSubscription ? 'pending' : 'needs-billing' }),
        { status: 200, headers },
      );
    }

    client.release();

    if (!hasSubscription) {
      return new Response(
        JSON.stringify({ status: 'needs-billing' }),
        { status: 200, headers },
      );
    }

    const relation = relationQuery.rows[0]!;

    if (relation.status === WorkspaceStatus.PENDING) {
      log.info('User already requested to join', { user, workspace });
      return new Response(JSON.stringify({ status: 'pending' }), { status: 200, headers });
    }

    if (relation.status === WorkspaceStatus.INVITED) {
      log.info('User already invited', { user, workspace });
      return new Response(JSON.stringify({ status: 'invited' }), { status: 200, headers });
    }

    if (relation.status === WorkspaceStatus.INACTIVE) {
      log.info('User is inactive', { user, workspace });
      return new Response(JSON.stringify({ status: 'inactive' }), { status: 200, headers });
    }

    log.info('User authenticated', { user, workspace });

    const sessionToken = await initiateSession({
      workspace,
      user: userId,
      wslug: workspaceQuery.rows[0]!.slug,
      role: relationQuery.rows[0]!.role as WorkspaceRole,
    });

    return new Response(
      JSON.stringify({ status: 'found', sessionToken, role: relationQuery.rows[0]!.role }),
      { status: 200, headers },
    );
  } catch (error: any) {
    client.release();
    log.error('Error checking user', { error: error.message });
    return new Response(JSON.stringify({ status: 'error' }), { status: 500, headers });

  }
});

export async function OPTIONS() {
  const headers = resolveCORSHeaders();

  return new Response(null, { status: 200, headers });
}
