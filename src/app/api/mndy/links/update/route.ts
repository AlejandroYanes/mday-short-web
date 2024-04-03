import { withAxiom, type AxiomRequest } from 'next-axiom';
import { sql } from '@vercel/postgres';
import { z } from 'zod';

import type { NewShortLink } from 'models/links';
import { resolveSession } from 'utils/auth';
import { resolveCORSHeaders } from 'utils/api';
import { KEBAB_CASE_REGEX } from 'utils/strings';

const validator = z.object({
  id: z.number(),
  url: z.string().min(1, { message: 'The url can not be empty' }).url({ message: 'The url is invalid' }),
  slug: z.string().min(1, { message: 'The short name can not be empty' }).regex(KEBAB_CASE_REGEX, { message: 'The short name is invalid' }),
  password: z.string().nullish(),
  expiresAt: z.string().nullish(),
});

export const PUT = withAxiom(async (req: AxiomRequest) => {
  const headers = resolveCORSHeaders();
  const log = req.log.with({ scope: 'links', endpoint: 'mndy/links/update', ip: req.ip, method: req.method });

  const session = await resolveSession(req);

  if (!session) {
    log.error('Invalid session');
    return new Response(JSON.stringify({ status: 'unauthorized' }), { status: 401, headers });
  }

  const body: NewShortLink = await req.json();
  const parse = validator.safeParse(body);

  if (!parse.success) {
    log.error('Invalid input', { user: session.user, workspace: session.workspace, error: parse.error.errors, body });
    return new Response(JSON.stringify(parse.error), { status: 400, headers });
  }

  const { url, slug, password, expiresAt } = parse.data;

  const client = await sql.connect();

  const linkBySlug = await client.sql<{ id: string }>`
    SELECT id FROM "Link" WHERE slug = ${slug} AND wslug = ${session.wslug};
   `;

  if (linkBySlug.rowCount > 0 && Number(linkBySlug.rows[0]!.id) !== parse.data.id) {
    client.release();

    log.error('Short link already exists', { slug, user: session.user, workspace: session.workspace });

    return new Response(
      JSON.stringify({ success: false, field: 'slug', error: 'The short name already exists.' }),
      { status: 400, headers },
    );
  }

  const query = await client.sql<NewShortLink>`
    UPDATE "Link" SET url = ${url}, slug = ${slug}, password = ${password}, "expiresAt" = ${expiresAt}
    WHERE id = ${parse.data.id} AND wslug = ${session.wslug}
    RETURNING *;
  `;

  if (query.rowCount === 0) {
    client.release();

    log.error('Link not found', { id: parse.data.id });

    return new Response(
      JSON.stringify({ success: false, field: 'not-found', error: 'The link could not be found.' }),
      { status: 404, headers },
    );
  }

  client.release();

  log.info('Short link updated', {
    user: session.user,
    workspace: session.workspace,
    id: parse.data.id,
    link: query.rows[0]!.slug,
  });

  return new Response(JSON.stringify(query.rows[0]), { status: 200, headers });
});

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: resolveCORSHeaders() });
}
