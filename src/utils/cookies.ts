import { EXCLUDED_DOMAINS } from './domains';

export const MONDAY_WEB_SESSION_COOKIE = 'mls_web_session';
export const VISITOR_ID_COOKIE = 'mls_visitor_id';

interface AccessCookieOptions { slug: string; wslug?: string; domain?: string }

export const VISITOR_ACCESS_COOKIE = (options: AccessCookieOptions) => {
  const { slug, wslug, domain } = options;
  const isCustomDomain = domain && !EXCLUDED_DOMAINS.includes(domain);

  if (isCustomDomain) return `msl_${domain}-${slug}_access`;

  return `msl_${wslug}-${slug}_access`;
}
