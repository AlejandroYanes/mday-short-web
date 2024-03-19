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

      const client = await sql.connect();
      const links = await client.sql<ShortLink>`
          SELECT id, url, slug, password, "expiresAt"
          FROM "MLS_Link"
          ORDER BY "createdAt"
          OFFSET ${(page - 1) * pageSize}
          LIMIT ${pageSize};
      `;
      const countQuery = await client.sql<{ id: string }>`SELECT id FROM "MLS_Link";`;

      client.release();

      return { results: links.rows, count: countQuery.rowCount };
    }),

  create: protectedProcedure
    .input(z.object({
      url: z.string().url(),
      slug: z.string(),
      password: z.string().nullish(),
      expiresAt: z.string().nullish(),
    }))
    .mutation(async ({ input }) => {
      const { url, slug, password, expiresAt } = input;

      const client = await sql.connect();
      const query = await client.sql<ShortLink>`SELECT slug FROM "MLS_Link" WHERE slug = ${slug};`;

      if (query.rowCount) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'The short name already exists somewhere else.',
        });
      }

      const link = await client.sql<ShortLink>`
        INSERT INTO "MLS_Link" (id, url, slug, password, "expiresAt", "createdAt")
        VALUES (${createId()}, ${url}, ${slug}, ${password}, ${expiresAt}, NOW())
        RETURNING *;
      `;

      client.release();

      return link.rows[0];
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string().cuid2(),
      url: z.string().url(),
      slug: z.string(),
      password: z.string().nullish(),
      expiresAt: z.string().nullish(),
    }))
    .mutation(async ({ input }) => {
      const { id, url, slug, password, expiresAt } = input;

      const client = await sql.connect();

      const linkBySlug = await client.sql<ShortLink>`SELECT id, slug FROM "MLS_Link" WHERE slug = ${slug};`;

      if (linkBySlug.rowCount > 0 && linkBySlug.rows[0]!.id !== id) {
        client.release();
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'The short name already exists somewhere else.',
        });
      }

      const link = await client.sql<ShortLink>`
        UPDATE "MLS_Link" SET url = ${url}, slug = ${slug}, password = ${password}, "expiresAt" = ${expiresAt}
        WHERE id = ${id}
        RETURNING *;
      `;

      if (!link.rowCount) {
        client.release();
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Link not found',
        });
      }

      client.release();

      return link.rows[0];
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().cuid2() }))
    .mutation(async ({ input }) => {
      const { id } = input;

      const query = await sql`DELETE FROM "MLS_Link" WHERE id = ${id} RETURNING *;`;

      if (!query.rowCount) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Link not found',
        });
      }

      return true;
    }),
});
