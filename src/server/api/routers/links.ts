import { sql } from '@vercel/postgres';
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
          SELECT id, url, slug, wslug, password, "expiresAt"
          FROM "Link"
          ORDER BY "createdAt"
          OFFSET ${(page - 1) * pageSize}
          LIMIT ${pageSize};
      `;
      const countQuery = await client.sql<{ id: number }>`SELECT id FROM "Link";`;

      client.release();

      return { results: links.rows.map((link) => ({ ...link, id: Number(link.id) })), count: countQuery.rowCount };
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
      const query = await client.sql<ShortLink>`SELECT slug FROM "Link" WHERE slug = ${slug};`;

      if (query.rowCount) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'The short name already exists somewhere else.',
        });
      }

      const link = await client.sql<ShortLink>`
        INSERT INTO "Link" (url, slug, wslug, password, "expiresAt", "createdAt")
        VALUES (${url}, ${slug}, 'devland', ${password}, ${expiresAt}, NOW())
        RETURNING *;
      `;

      client.release();

      return link.rows[0];
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      url: z.string().url(),
      slug: z.string(),
      password: z.string().nullish(),
      expiresAt: z.string().nullish(),
    }))
    .mutation(async ({ input }) => {
      const { id, url, slug, password, expiresAt } = input;

      const client = await sql.connect();

      const linkBySlug = await client.sql<ShortLink>`SELECT id, slug FROM "Link" WHERE slug = ${slug};`;

      if (linkBySlug.rowCount > 0 && linkBySlug.rows[0]!.id !== id) {
        client.release();
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'The short name already exists somewhere else.',
        });
      }

      const link = await client.sql<ShortLink>`
        UPDATE "Link" SET url = ${url}, slug = ${slug}, password = ${password}, "expiresAt" = ${expiresAt}
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
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const { id } = input;

      const query = await sql`DELETE FROM "Link" WHERE id = ${id} RETURNING *;`;

      if (!query.rowCount) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Link not found',
        });
      }

      return true;
    }),
});
