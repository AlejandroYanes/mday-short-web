import { type AxiomRequest, withAxiom } from 'next-axiom';

import { env } from 'env';
import type { Domain } from 'models/domain';
import { resolveCORSHeaders } from 'utils/api';
import { resolveSession } from 'utils/auth';

export const GET = withAxiom(async (req: AxiomRequest) => {
  const log = req.log.with({ scope: 'billing', endpoint: 'mndy/domains/list', ip: req.ip, method: req.method });
  const headers = resolveCORSHeaders();

  const session = resolveSession(req);

  if (!session) {
    log.error('Invalid token');
    return new Response(JSON.stringify({ status: 'unauthorized' }), { status: 401, headers });
  }

  try {
    const response = await fetch(
      `https://api.vercel.com/v9/projects/${env.VERCEL_PROJECT_ID}/domains?teamId=${env.VERCEL_TEAM_ID}&limit=50`,
      {
        headers: {
          Authorization: `Bearer ${env.AUTH_BEARER_TOKEN}`,
          'Content-Type': 'application/json',
        },
        method: 'GET',
      }
    );

    if (!response.ok) {
      log.error('Error fetching domains', { status: response.status });
      return new Response(JSON.stringify({ status: 'error' }), { status: 500, headers });
    }

    const json = await response.json();
    const domains: Domain[] = json.domains;

    const excludeDomains = ['mday-short-web.vercel.app', 'www.mndy.link', 'mndy.link'];
    // not required –> only for this demo to prevent removal of the demo's domain
    const filteredDomains = domains.filter(
      (domain) => !excludeDomains.includes(domain.name)
    )

    // filteredDomains.sort((d1, d2) => d1.createdAt - d2.createdAt);
    filteredDomains.sort((d1, d2) => d2.updatedAt - d1.updatedAt);

    return new Response(JSON.stringify(filteredDomains), { status: 200, headers });
  } catch (error) {
    log.error('Error fetching domains', { error });
    return new Response(JSON.stringify({ status: 'error' }), { status: 500, headers });
  }

});

export function OPTIONS() {
  return new Response(null, { status: 204, headers: resolveCORSHeaders() });
}
