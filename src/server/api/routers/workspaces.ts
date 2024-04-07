import { sql } from '@vercel/postgres';

import { createTRPCRouter, protectedProcedure } from 'server/api/trpc';

export const workspacesRouter = createTRPCRouter({
  list: protectedProcedure
    .query(async () => {
      const query = await sql`SELECT id, name, slug FROM "Workspace" WHERE slug != 'dland';`;
      return query.rows;
    }),
});
