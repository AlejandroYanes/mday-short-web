export const MONDAY_WEB_SESSION_COOKIE = 'mls_web_session';

interface CookieOptions { slug: string; wslug?: string; domain?: string }

export const VISITOR_ACCESS_COOKIE = (options: CookieOptions) => {
  const { slug, wslug, domain } = options;

  if (domain) return `msl_${domain}-${slug}_access`;

  return `msl_${wslug}-${slug}_access`;
}
