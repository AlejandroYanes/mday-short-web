import type { NextRequest } from 'next/server';
import { sql } from '@vercel/postgres';

import type { MondayEvent } from 'models/monday';
import { resolveCORSHeaders } from 'utils/api';
import { notifyOfDeletedAccount, notifyOfNewSignup } from 'utils/slack';

export function OPTIONS() {
  return new Response(null, { status: 204, headers: resolveCORSHeaders() });
}

export async function POST(req: NextRequest) {
  const event: MondayEvent = await req.json();

  if (!event) {
    return new Response(null, { status: 400, headers: resolveCORSHeaders() });
  }

  const { type, data } = event;
  const client = await sql.connect();

  try {
    switch (type) {
      case 'install': {
        await notifyOfNewSignup({ name: data.user_name, email: data.user_email });
        return new Response(null, { status: 200, headers: resolveCORSHeaders() });
      }
      case 'uninstall': {
        const { user_email } = data;

        const userQuery = await client.sql<{ id: number }>`
          SELECT id FROM "User" WHERE email = ${user_email}
       `;

        if (!userQuery.rows.length) {
          return new Response(null, { status: 404, headers: resolveCORSHeaders() });
        }

        const { id } = userQuery.rows[0]!;

        await client.sql`DELETE FROM "User" WHERE id = ${id}`;
        await client.sql`DELETE FROM "UserInWorkspace" WHERE userId = ${id}`;

        client.release();
        await notifyOfDeletedAccount({ name: data.user_name, email: data.user_email });
        return new Response(null, { status: 200, headers: resolveCORSHeaders() });
      }
      default:
        return new Response(null, { status: 200, headers: resolveCORSHeaders() });
    }
  } catch (error) {
    client.release();
    console.log('❌ Error processing webhook event: ', error);
    return new Response(null, { status: 500, headers: resolveCORSHeaders() });
  }
}
