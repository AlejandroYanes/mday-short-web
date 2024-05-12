import { type AxiomRequest, withAxiom } from 'next-axiom';
import { sql } from '@vercel/postgres';
import { z } from 'zod';

import { env } from 'env';
import { resolveCORSHeaders } from 'utils/api';
import { resolveSession } from 'utils/auth';
import { DOMAIN_NAME_REGEX } from 'utils/strings';
import { EXCLUDED_DOMAINS } from 'utils/domains';
import { tql } from 'utils/tql';

const validator = z.object({
  domain: z.string()
    .min(1, { message: 'The domain name can not be empty' })
    .regex(DOMAIN_NAME_REGEX, { message: 'The domain name is invalid' }),
});

export const DELETE = withAxiom(async (req: AxiomRequest) => {
  const log = req.log.with({ scope: 'domains', endpoint: 'mndy/domains/delete', ip: req.ip, method: req.method });
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
    log.error('Invalid input', { errors: input.error });
    return new Response(JSON.stringify({ status: 'invalid' }), { status: 400, headers });
  }

  const { domain } = input.data;
  const client = await sql.connect();

  try {
    if (EXCLUDED_DOMAINS.includes(domain)) {
      log.error('Forbidden domain removal', { domain });
      return new Response(JSON.stringify({ status: 'forbidden' }), { status: 403, headers });
    }

    const domainQuery = await client.sql<{ id: number; name: string }>`
      SELECT id, name
      FROM "Domain"
      WHERE name = ${domain} AND "workspaceId" = ${session.workspace}`;

    if (domainQuery.rows.length === 0) {
      client.release();
      log.error('Domain not found', { domain });
      return new Response(JSON.stringify({ status: 'not_found' }), { status: 404, headers });
    }

    const response = await fetch(
      `https://api.vercel.com/v9/projects/${env.VERCEL_PROJECT_ID}/domains/${domain}?teamId=${env.VERCEL_TEAM_ID}`,
      {
        headers: {
          Authorization: `Bearer ${env.AUTH_BEARER_TOKEN}`,
        },
        method: 'DELETE',
      }
    );

    if (!response.ok) {
      client.release();
      log.error('Error removing domain', { status: response.status });
      return new Response(JSON.stringify({ status: 'error' }), { status: 500, headers });
    }

    const linksQuery = await client.sql<{ id: number }>`SELECT id FROM "Link" WHERE "domain" = ${domainQuery.rows[0]!.name}`;

    if (linksQuery.rows.length > 0) {
      const linkIds = linksQuery.rows.map((row) => row.id);
      const [query, params] = tql.query`UPDATE "Link" SET domain = NULL WHERE id IN ${tql.LIST(linkIds)}`;
      await client.query(query, params);
    }

    await sql`DELETE FROM "Domain" WHERE id = ${domainQuery.rows[0]!.id}`;

    return new Response(JSON.stringify({ status: 'success' }), { status: 200, headers });
  } catch (error) {
    log.error('Error removing domain', { error });
    return new Response(JSON.stringify({ status: 'error' }), { status: 500, headers });

  }
});

export function OPTIONS() {
  return new Response(null, { status: 204, headers: resolveCORSHeaders() });
}
