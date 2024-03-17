// eslint-disable-next-line max-len
export type inferPrismaModelFromQuery<Q extends (...args: any) => Promise<any>> = Awaited<ReturnType<Q>>;
