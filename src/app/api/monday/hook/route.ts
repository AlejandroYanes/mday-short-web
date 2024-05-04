import { type AxiomRequest, withAxiom } from 'next-axiom';
import { sql } from '@vercel/postgres';

import type { MondayEvent } from 'models/monday';
import { resolveCORSHeaders } from 'utils/api';
import { notifyOfUninstall, notifyOfNewInstall } from 'utils/slack';

export function OPTIONS() {
  return new Response(null, { status: 204, headers: resolveCORSHeaders() });
}

export const  POST = withAxiom( async (req: AxiomRequest) => {
  const log = req.log.with({ scope: 'monday', endpoint: 'monday/hook', ip: req.ip, method: req.method });
  const headers = resolveCORSHeaders();
  const event: MondayEvent = await req.json();

  if (!event) {
    return new Response(null, { status: 400, headers });
  }

  const { type, data } = event;
  const client = await sql.connect();

  try {
    switch (type) {
      case 'install': {
        log.info('New install', { name: data.user_name, email: data.user_email });
        await notifyOfNewInstall({ name: data.user_name, email: data.user_email });
        return new Response(null, { status: 200, headers });
      }
      case 'uninstall': {
        const { user_email } = data;

        const userQuery = await client.sql<{ id: number }>`
          SELECT id FROM "User" WHERE email = ${user_email}
       `;

        if (!userQuery.rows.length) {
          return new Response(null, { status: 404, headers });
        }

        const { id } = userQuery.rows[0]!;

        await client.sql`DELETE FROM "User" WHERE id = ${id}`;
        await client.sql`DELETE FROM "UserInWorkspace" WHERE userId = ${id}`;

        client.release();
        log.info('App uninstalled', { name: data.user_name, email: data.user_email });
        await notifyOfUninstall({ name: data.user_name, email: data.user_email });
        return new Response(null, { status: 200, headers });
      }
      default:
        return new Response(null, { status: 200, headers });
    }
  } catch (error) {
    client.release();
    log.error('Error processing webhook event', { error })
    return new Response(null, { status: 500, headers });
  }
})
