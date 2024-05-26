import type { NextRequest } from 'next/server';
import { sql } from '@vercel/postgres';
import { z } from 'zod';

import { resolveCORSHeaders } from 'utils/api';
import { openJWT } from 'utils/auth';
import { getSubscriptionInformation } from 'utils/lemon';

const validator = z.object({
  workspace: z.number(),
  token: z.string(),
});

export async function POST(req: NextRequest) {
  const headers = resolveCORSHeaders();

  const body = await req.json();
  const parsedBody = validator.safeParse(body);

  if (!parsedBody.success) {
    return new Response(JSON.stringify({ status: 'invalid data' }), { status: 400, headers });
  }

  const { token, workspace } = parsedBody.data;
  const session = await openJWT(token);

  if (!session) {
    return new Response(JSON.stringify({ status: 'unauthorized' }), { status: 401, headers });
  }

  const subscriptionQuery = await sql<{ id: string; variant: number; status: string }>`
    SELECT id, status FROM "Subscription" WHERE "workspaceId" = ${workspace} ORDER BY "createdAt" DESC LIMIT 1`;

  const subscription = subscriptionQuery.rows[0];
  const { hasSubscription } = getSubscriptionInformation(subscription);

  return new Response(JSON.stringify({ hasSubscription }), { status: 200, headers });
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: resolveCORSHeaders() });
}
