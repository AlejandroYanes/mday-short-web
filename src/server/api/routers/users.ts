import { sql } from '@vercel/postgres';
import { z } from 'zod';

import type { User } from 'models/user';
import { decryptMessage } from 'utils/auth';
import { createTRPCRouter, protectedProcedure } from 'server/api/trpc';

export const usersRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({
      page: z.number().min(1),
      pageSize: z.number(),
      query: z.string().nullish(),
    }))
    .query(async ({ input }) => {
      const { page, pageSize } = input;

      const client = await sql.connect();
      const usersQuery = await client.sql<User & { workspace: string }>`
          SELECT u.id, u.name, u.email, u."createdAt", STRING_AGG(w.name, ', ') AS workspace
          FROM "User" u
          LEFT JOIN "UserInWorkspace" uw ON u.id = uw."userId"
          LEFT JOIN "Workspace" w ON uw."workspaceId" = w.mid
          GROUP BY u.id, u.name, u.email, u."createdAt"
          ORDER BY u."createdAt"
          OFFSET ${(page - 1) * pageSize}
          LIMIT ${pageSize};
      `;
      const countQuery = await client.sql<{ id: number }>`SELECT id FROM "User";`;

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
