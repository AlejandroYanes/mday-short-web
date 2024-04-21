import { type AxiomRequest, withAxiom } from 'next-axiom';
import { sql } from '@vercel/postgres';
import { z } from 'zod';

import { env } from 'env';
import { resolveCORSHeaders } from 'utils/api';
import { resolveSession } from 'utils/auth';
import { DOMAIN_NAME_REGEX } from 'utils/strings';

const validator = z.object({
  domain: z.string()
    .min(1, { message: 'The domain name can not be empty' })
    .regex(DOMAIN_NAME_REGEX, { message: 'The domain name is invalid' }),
});

export const POST = withAxiom(async (req: AxiomRequest) => {
  const log = req.log.with({ scope: 'domains', endpoint: 'mndy/domains/add', ip: req.ip, method: req.method });
  const headers = resolveCORSHeaders();

  const session = await resolveSession(req);

  if (!session) {
    log.error('Invalid token');
    return new Response(JSON.stringify({ status: 'unauthorized' }), { status: 401, headers });
  }

  const body = await req.json();
  const input = validator.safeParse(body);

  if (!input.success) {
    log.error('Invalid input', { errors: input.error });
    return new Response(JSON.stringify({ status: 'error' }), { status: 400, headers });
  }

  const { domain } = input.data;

  try {
    const response = await fetch(
      `https://api.vercel.com/v9/projects/${env.VERCEL_PROJECT_ID}/domains?teamId=${env.VERCEL_TEAM_ID}`,
      {
        body: JSON.stringify({ name: domain }),
        headers: {
          Authorization: `Bearer ${env.AUTH_BEARER_TOKEN}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
      }
    );

    const data = await response.json();

    if (data.error?.code == 'forbidden') {
      log.error('Failed to add domain', { code: 'forbidden', error: data.error })
      return new Response(JSON.stringify({ status: 'forbidden' }), { status: 403, headers });
    }

    if (data.error?.code == 'domain_taken') {
      log.error('Failed to add domain', { code: 'domain_taken', error: data.error })
      return new Response(JSON.stringify({ status: 'domain_taken' }), { status: 409, headers });
    }

    if (data.error?.code === 'domain_already_in_use') {
      log.error('Failed to add domain', { code: 'domain_already_in_use', error: data.error })
      return new Response(JSON.stringify({ status: 'domain_already_in_use' }), { status: 409, headers });
    }

    await sql`INSERT INTO "Domain" (name, "workspaceId") VALUES (${domain}, ${session.workspace})`;

    return new Response(JSON.stringify({ status: 'success' }), { status: 200, headers });
  } catch (error) {
    log.error('Failed to add domain', { error });
    return new Response(JSON.stringify({ status: 'error' }), { status: 500, headers });
  }
});

export function OPTIONS() {
  return new Response(null, { status: 204, headers: resolveCORSHeaders() });
}
