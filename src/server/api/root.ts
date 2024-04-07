import { linkRouter } from 'server/api/routers/links';
import { createTRPCRouter } from 'server/api/trpc';
import { usersRouter } from './routers/users';
import { workspacesRouter } from './routers/workspaces';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  link: linkRouter,
  users: usersRouter,
  workspaces: workspacesRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
