import { sql } from '@vercel/postgres';
import { createId } from '@paralleldrive/cuid2';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

import type { ShortLink } from 'models/links';
import { createTRPCRouter, protectedProcedure } from 'server/api/trpc';

export const linkRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({
      page: z.number().min(1),
      pageSize: z.number(),
      query: z.string().nullish(),
    }))
    .query(async ({ input }) => {
      const { page, pageSize } = input;
      const links = await sql<ShortLink>`
          SELECT id, url, slug, password, "expiresAt", "createdAt"
          FROM "MLS_Link"
          ORDER BY "createdAt" DESC
          OFFSET ${(page - 1) * pageSize}
          LIMIT ${pageSize};
      `;

      return { results: links.rows, count: links.rowCount };
    }),

  create: protectedProcedure
    .input(z.object({
      url: z.string(),
      slug: z.string(),
      password: z.string().nullish(),
      expiresAt: z.string().nullish(),
    }))
    .mutation(async ({ input }) => {
      const { url, slug, password, expiresAt } = input;
      const link = await sql<ShortLink>`
        INSERT INTO "MLS_Link" (id, url, slug, password, "expiresAt", "createdAt")
        VALUES (${createId()}, ${url}, ${slug}, ${password}, ${expiresAt}, NOW())
        RETURNING *;
      `;

      return link.rows[0];
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      url: z.string(),
      slug: z.string(),
      password: z.string().nullish(),
      expiresAt: z.string().nullish(),
    }))
    .mutation(async ({ input }) => {
      const { id, url, slug, password, expiresAt } = input;

      const prevLink = await sql<ShortLink>`SELECT id FROM "MLS_Link" WHERE id = ${id}`;

      if (!prevLink.rowCount) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Link not found',
        });
      }

      const link = await sql<ShortLink>`
        UPDATE "MLS_Link" SET url = ${url}, slug = ${slug}, password = ${password}, "expiresAt" = ${expiresAt}
        WHERE id = ${id}
        RETURNING *;
      `;

      return link.rows[0];
    }),
});
