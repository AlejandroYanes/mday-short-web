import type { NextRequest } from 'next/server';
import { sql } from '@vercel/postgres';

import type { ExtendedUser } from 'models/user';
import { WorkspaceRole } from 'models/user-in-workspace';
import { resolveSession } from 'utils/auth';
import { resolveCORSHeaders } from 'utils/api';

export async function GET(req: NextRequest) {
  const headers = resolveCORSHeaders();

  const session = await resolveSession(req);

  if (!session || session.role !== WorkspaceRole.OWNER) {
    return new Response(JSON.stringify({ status: 'unauthorized' }), { status: 401, headers });
  }

  const query = await sql<ExtendedUser>`
    SELECT U.id, U.name, U.email, UW.role, UW.status
    FROM "User" U INNER JOIN "UserInWorkspace" UW ON U.id = UW."userId" INNER JOIN "Workspace" W on UW."workspaceId" = W.id
    WHERE W.slug = ${session.wslug} ORDER BY U."createdAt"
  `;
  return new Response(JSON.stringify({ results: query.rows.map((user) => ({ ...user, id: Number(user.id) } )) }), { status: 200, headers });
}

export async function OPTIONS() {
  const headers = resolveCORSHeaders();

  return new Response(null, { status: 204, headers });
}

