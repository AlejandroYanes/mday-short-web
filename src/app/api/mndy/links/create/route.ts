import { withAxiom, type AxiomRequest } from 'next-axiom';
import { sql } from '@vercel/postgres';
import { z } from 'zod';

import type { NewShortLink } from 'models/links';
import { resolveSession } from 'utils/auth';
import { resolveCORSHeaders } from 'utils/api';
import { KEBAB_CASE_REGEX } from 'utils/strings';

const validator = z.object({
  url: z.string().min(1, { message: 'The url can not be empty' }).url({ message: 'The url is invalid' }),
  slug: z.string().min(1, { message: 'The short name can not be empty' }).regex(KEBAB_CASE_REGEX, { message: 'The short name is invalid' }),
  password: z.string().nullish(),
  expiresAt: z.string().nullish(),
});

export const POST = withAxiom(async (req: AxiomRequest) => {
  const headers = resolveCORSHeaders();
  const log = req.log.with({ scope: 'links', endpoint: 'mndy/link/create', ip: req.ip, method: req.method });

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

  const userInWorkspace = await client.sql<{ userId: number }>`
    SELECT "userId" FROM "UserInWorkspace" WHERE "userId" = ${session.user} AND "workspaceId" = ${session.workspace};
  `;

  if (userInWorkspace.rowCount === 0) {
    client.release();
    log.error('User not in workspace', { user: session.user, workspace: session.workspace });
    return new Response(JSON.stringify({ success: false, error: 'incorrect workspace.' }), { status: 400, headers });
  }

  const linkBySlug = await client.sql<NewShortLink>`SELECT slug FROM "Link" WHERE slug = ${slug} AND wslug = ${session.wslug};`;

  if (linkBySlug.rowCount > 0) {
    client.release();
    log.error('Short link already exists', { slug, user: session.user, workspace: session.workspace });
    return new Response(
      JSON.stringify({ success: false, field: 'slug', error: 'The short name already exists.' }),
      { status: 400, headers },
    );
  }

  const query = await client.sql<NewShortLink>`
    INSERT INTO "Link" (url, slug, wslug, password, "expiresAt", "createdAt")
    VALUES (${url}, ${slug}, ${session.wslug}, ${password}, ${expiresAt}, NOW())
    RETURNING *;
  `;

  client.release();

  log.info('Short link created', { user: session.user, workspace: session.workspace, link: query.rows[0] });

  return new Response(JSON.stringify(query.rows[0]), { status: 201, headers });
});

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: resolveCORSHeaders() });
}
