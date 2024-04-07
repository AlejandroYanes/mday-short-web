import { sql } from '@vercel/postgres';
import { z } from 'zod';

import type { User } from 'models/user';
import { decryptMessage } from 'utils/auth';
import { tql } from 'utils/tql';
import { createTRPCRouter, protectedProcedure } from 'server/api/trpc';

export const usersRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({
      page: z.number().min(1),
      pageSize: z.number(),
      wslug: z.string(),
    }))
    .query(async ({ input }) => {
      const { page, pageSize, wslug } = input;

      const client = await sql.connect();

      const filterQuery = wslug === 'all' ? tql.fragment`` : tql.fragment`w.slug = ${wslug}`;

      const hasFilters = wslug !== 'all';

      const whereClause = hasFilters ? tql.fragment`WHERE ${filterQuery}` : tql.fragment``;

      const [usersQ, usersP] = tql.query`
          SELECT u.id, u.name, u.email, u."createdAt", STRING_AGG(w.name, ', ') AS workspace
          FROM "User" u
          LEFT JOIN "UserInWorkspace" uw ON u.id = uw."userId"
          LEFT JOIN "Workspace" w ON uw."workspaceId" = w.mid
          ${whereClause}
          GROUP BY u.id, u.name, u.email, u."createdAt"
          ORDER BY u."createdAt"
          OFFSET ${(page - 1) * pageSize}
          LIMIT ${pageSize};
      `;

      const usersQuery = await client.query<User & { workspace: string }>(usersQ, usersP);

      const [countQ, countP] = tql.query`
          SELECT u.id
          FROM "User" u
          LEFT JOIN "UserInWorkspace" uw ON u.id = uw."userId"
          LEFT JOIN "Workspace" w ON uw."workspaceId" = w.mid
          ${whereClause}
          GROUP BY u.id, u.name, u.email, u."createdAt"
          ORDER BY u."createdAt"`
      const countQuery = await client.query<{ id: number }>(countQ, countP);

      client.release();

      const transformedUsers = [];

      for (const user of usersQuery.rows) {
        transformedUsers.push({
          ...user,
          id: Number(user.id),
          name: await decryptMessage(user.name),
          email: await decryptMessage(user.email),
        });
      }

      return {
        results: transformedUsers,
        count: countQuery.rowCount,
      };
    }),
});
