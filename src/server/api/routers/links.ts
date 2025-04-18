import { sql } from '@vercel/postgres';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';

import type { ShortLink } from 'models/links';
import { KEBAB_CASE_REGEX } from 'utils/strings';
import { tql } from 'utils/tql';
import { createTRPCRouter, protectedProcedure } from 'server/api/trpc';

export const linkRouter = createTRPCRouter({
  list: protectedProcedure
    .input(z.object({
      page: z.number().min(1),
      pageSize: z.number(),
      search: z.string().nullish(),
      wslug: z.string(),
    }))
    .query(async ({ input }) => {
      const { page, pageSize, search, wslug } = input;

      const client = await sql.connect();

      const filterQuery = wslug === 'all' ? tql.fragment`` : tql.fragment`wslug = ${wslug}`;

      const searchQuery = search ? tql.fragment`slug ILIKE ${`%${search}%`}` : tql.fragment``;

      const andQuery = wslug !== 'all' && search ? tql.fragment`AND` : tql.fragment``;

      const hasFilters = wslug !== 'all' || !!search;

      const whereClause = hasFilters ? tql.fragment`WHERE ${filterQuery} ${andQuery} ${searchQuery}` : tql.fragment``;

      const [listQ, listP] = tql.query`
        SELECT id, url, slug, wslug, password, "expiresAt"
        FROM "Link" ${whereClause}
        ORDER BY "createdAt"
        OFFSET ${(page - 1) * pageSize}
        LIMIT ${pageSize};`;

      const links = await client.query<ShortLink>(listQ, listP);

      const [whereQ, whereP] = tql.query`SELECT id FROM "Link" ${whereClause}`;
      const countQuery = await client.query<{ id: number }>(whereQ, whereP);

      client.release();

      return {
        results: links.rows.map((link) => ({ ...link, id: Number(link.id) })),
        count: countQuery.rowCount,
      };
    }),

  create: protectedProcedure
    .input(z.object({
      url: z.string().url(),
      slug: z.string().min(1).regex(KEBAB_CASE_REGEX),
      password: z.string().nullish(),
      expiresAt: z.string().nullish(),
    }))
    .mutation(async ({ ctx: { session }, input }) => {
      const { url, slug, password, expiresAt } = input;

      const client = await sql.connect();
      const query = await client.sql<ShortLink>`
        SELECT slug FROM "Link"
        WHERE wslug = ${session.wslug} AND slug = ${slug};`;

      if (query.rowCount) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'The short name already exists somewhere else.',
        });
      }

      const link = await client.sql<ShortLink>`
        INSERT INTO "Link" (url, slug, wslug, password, "expiresAt", "createdAt")
        VALUES (${url}, ${slug}, ${session.wslug}, ${password}, ${expiresAt}, NOW())
        RETURNING *;
      `;

      client.release();

      return link.rows[0];
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      url: z.string().url(),
      slug: z.string().min(1).regex(KEBAB_CASE_REGEX),
      password: z.string().nullish(),
      expiresAt: z.string().nullish(),
    }))
    .mutation(async ({ ctx: { session }, input }) => {
      const { id, url, slug, password, expiresAt } = input;

      const client = await sql.connect();

      const linkBySlug = await client.sql<ShortLink>`
        SELECT id, slug FROM "Link"
        WHERE slug = ${slug} AND wslug = ${session.wslug};`;

      if (linkBySlug.rowCount > 0 && Number(linkBySlug.rows[0]!.id) !== id) {
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
    .mutation(async ({ ctx: { session }, input }) => {
      const { id } = input;

      const query = await sql`DELETE FROM "Link" WHERE id = ${id} AND wslug = ${session.wslug} RETURNING *;`;

      if (!query.rowCount) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Link not found',
        });
      }

      return true;
    }),
});
