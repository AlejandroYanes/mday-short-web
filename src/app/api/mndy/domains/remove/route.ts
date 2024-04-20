import { type AxiomRequest, withAxiom } from 'next-axiom';
import { z } from 'zod';

import { env } from 'env';
import { resolveCORSHeaders } from 'utils/api';
import { resolveSession } from 'utils/auth';
import { DOMAIN_NAME_REGEX } from 'utils/strings';
import { EXCLUDED_DOMAINS } from 'utils/domains';

const validator = z.object({
  domain: z.string()
    .min(1, { message: 'The domain name can not be empty' })
    .regex(DOMAIN_NAME_REGEX, { message: 'The domain name is invalid' }),
});

export const DELETE = withAxiom(async (req: AxiomRequest) => {
  const log = req.log.with({ scope: 'domains', endpoint: 'mndy/domains/remove', ip: req.ip, method: req.method });
  const headers = resolveCORSHeaders();

  const session = resolveSession(req);

  if (!session) {
    log.error('Invalid token');
    return new Response(JSON.stringify({ status: 'unauthorized' }), { status: 401, headers });
  }

  const body = await req.json();
  const input = validator.safeParse(body);

  if (!input.success) {
    log.error('Invalid input', { errors: input.error });
    return new Response(JSON.stringify({ status: 'invalid' }), { status: 400, headers });
  }

  const { domain } = input.data;

  try {
    // not required –> only for this demo to prevent removal of a few restricted domains
    if (EXCLUDED_DOMAINS.includes(domain)) {
      log.error('Forbidden domain removal', { domain });
      return new Response(JSON.stringify({ status: 'forbidden' }), { status: 403, headers });
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
      log.error('Error removing domain', { status: response.status });
      return new Response(JSON.stringify({ status: 'error' }), { status: 500, headers });
    }

    return new Response(JSON.stringify({ status: 'success' }), { status: 200, headers });
  } catch (error) {
    log.error('Error removing domain', { error });
    return new Response(JSON.stringify({ status: 'error' }), { status: 500, headers });

  }
});

export function OPTIONS() {
  return new Response(null, { status: 204, headers: resolveCORSHeaders() });
}
