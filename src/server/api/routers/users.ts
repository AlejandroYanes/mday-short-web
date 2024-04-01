import { sql } from '@vercel/postgres';
import { z } from 'zod';

import type { User } from 'models/user';
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
          SELECT U.id, U.name, U.email, U."createdAt", W.name AS "workspace"
          FROM "User" U JOIN "UserInWorkspace" UIW ON U.id = UIW."userId" JOIN "Workspace" W ON UIW."workspaceId" = W.id
          ORDER BY "createdAt"
          OFFSET ${(page - 1) * pageSize}
          LIMIT ${pageSize};
      `;
      const countQuery = await client.sql<{ id: number }>`SELECT id FROM "User";`;

      client.release();

      return {
        results: usersQuery.rows.map((user) => ({ ...user, id: Number(user.id) })),
        count: countQuery.rowCount,
      };
    }),
});
