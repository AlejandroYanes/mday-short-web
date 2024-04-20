import { type AxiomRequest, withAxiom } from 'next-axiom';

import { env } from 'env';
import { resolveCORSHeaders } from 'utils/api';
import { resolveSession } from 'utils/auth';

export const GET = withAxiom(async (req: AxiomRequest) => {
  const log = req.log.with({ scope: 'billing', endpoint: 'mndy/domains/check', ip: req.ip, method: req.method });
  const headers = resolveCORSHeaders();

  const session = resolveSession(req);

  if (!session) {
    log.error('Invalid token');
    return new Response(JSON.stringify({ status: 'unauthorized' }), { status: 401, headers });
  }

  try {
    const domain = req.nextUrl.searchParams.get('domain');

    if (!domain) {
      log.error('Invalid domain');
      return new Response(JSON.stringify({ status: 'error' }), { status: 400, headers });
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
    ])

    if (domainResponse.status === 'rejected' || configResponse.status === 'rejected') {
      log.error('Error fetching domain', { status: domainResponse.status });
      return new Response(JSON.stringify({ status: 'error' }), { status: 500, headers });
    }

    const configJson = await configResponse.value.json();
    const domainJson = await domainResponse.value.json();

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
      )
      verificationResponse = await verificationRes.json()
    }

    if (verificationResponse && verificationResponse.verified) {
      /**
       * Domain was just verified
       */
      return new Response(JSON.stringify({
        configured: !configJson.misconfigured,
        ...verificationResponse,
      }), { status: 200, headers });
    }

    return new Response(JSON.stringify({
      configured: !configJson.misconfigured,
      ...domainJson,
      ...(verificationResponse ? { verificationResponse } : {}),
    }), { status: 200, headers });
  } catch (error) {
    log.error('Error fetching domains', { error });
    return new Response(JSON.stringify({ status: 'error' }), { status: 500, headers });
  }
});

export function OPTIONS() {
  return new Response(null, { status: 204, headers: resolveCORSHeaders() });
}
