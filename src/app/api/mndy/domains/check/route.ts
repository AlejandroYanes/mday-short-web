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
  const log = req.log.with({ scope: 'domains', endpoint: 'mndy/domains/check', ip: req.ip, method: req.method });
  const headers = resolveCORSHeaders();

  const session = await resolveSession(req);

  if (!session) {
    log.error('Invalid token');
    return new Response(JSON.stringify({ status: 'unauthorized' }), { status: 401, headers });
  }

  if (!session.isPremium) {
    log.error('User is not premium');
    return new Response(JSON.stringify({ status: 'unauthorized' }), { status: 401, headers });
  }

  const body = await req.json();
  const input = validator.safeParse(body);

  if (!input.success) {
    console.log('input.error', input.error);
    log.error('Invalid input', { errors: input.error });
    return new Response(JSON.stringify({ status: 'invalid' }), { status: 400, headers });
  }

  const client = await sql.connect();

  try {
    const { domain } = input.data;

    const domainQuery = await client.sql<{ id: number; name: string; configured: boolean; verified: boolean }>`
      SELECT id, name, configured, verified FROM "Domain"
      WHERE name = ${domain} AND "workspaceId" = ${session.workspace}`;

    if (domainQuery.rows.length === 0) {
      log.error('Domain not found', { domain });
      client.release();
      return new Response(JSON.stringify({ status: 'not_found' }), { status: 404, headers });
    }

    const [configResponse, domainResponse] = await Promise.allSettled([
      fetch(
        `https://api.vercel.com/v6/domains/${domain}/config?teamId=${env.VERCEL_TEAM_ID}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${env.AUTH_BEARER_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      ),
      fetch(
        `https://api.vercel.com/v9/projects/${env.VERCEL_PROJECT_ID}/domains/${domain}?teamId=${env.VERCEL_TEAM_ID}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${env.AUTH_BEARER_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      ),
    ]);

    if (domainResponse.status === 'rejected' || configResponse.status === 'rejected') {
      log.error('Error fetching domain', { domain: domainResponse.status, config: configResponse.status });
      client.release();
      return new Response(JSON.stringify({ status: 'error' }), { status: 500, headers });
    }

    const configJson = await configResponse.value.json();
    const domainJson = await domainResponse.value.json();

    const storedDomain = domainQuery.rows[0]!;

    if (!storedDomain.configured && !configJson.misconfigured) {
      /**
       * Domain was configured since last check
       */
      await client.sql`
        UPDATE "Domain" SET configured = TRUE
        WHERE id = ${storedDomain.id} AND "workspaceId" = ${session.workspace}`;
    }

    if (!storedDomain.verified && domainJson.verified) {
      /**
       * Domain was verified since last check
       */
      await client.sql`
        UPDATE "Domain" SET verified = TRUE
        WHERE id = ${storedDomain.id} AND "workspaceId" = ${session.workspace}`;
    }

    /**
     * If domain is not verified, we try to verify now
     */
    let verificationResponse = null
    if (!domainJson.verified) {
      const verificationRes = await fetch(
        `https://api.vercel.com/v9/projects/${env.VERCEL_PROJECT_ID}/domains/${domain}/verify?teamId=${env.VERCEL_TEAM_ID}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${env.AUTH_BEARER_TOKEN}`,
            'Content-Type': 'application/json',
          },
        }
      );
      verificationResponse = await verificationRes.json()
    }

    if (verificationResponse && verificationResponse.verified) {
      /**
       * Domain was just verified
       */
      await client.sql`
        UPDATE "Domain" SET verified = TRUE
        WHERE id = ${storedDomain.id} AND "workspaceId" = ${session.workspace}`;

      client.release();

      return new Response(
        JSON.stringify({
          configured: !configJson.misconfigured,
          ...verificationResponse,
        }),
        { status: 200, headers },
      );
    }

    client.release();

    return new Response(
      JSON.stringify({
        configured: !configJson.misconfigured,
        ...domainJson,
        ...(verificationResponse ? { verificationResponse } : {}),
      }),
      { status: 200, headers },
    );
  } catch (error) {
    log.error('Error fetching domains', { error });
    client.release();
    return new Response(JSON.stringify({ status: 'error' }), { status: 500, headers });
  }
});

export function OPTIONS() {
  return new Response(null, { status: 204, headers: resolveCORSHeaders() });
}
