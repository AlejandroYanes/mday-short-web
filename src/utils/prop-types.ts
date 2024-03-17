export function asyncComponent<T, R>(fn: (arg: T) => Promise<R>): (arg: T) => R {
  return fn as (arg: T) => R;
}

type negateAttributes<T> = {
  [TP in keyof T]?: never;
};

export type inferOppositeExcludingType<T, R> = (
  (T & negateAttributes<R>) | (R & negateAttributes<T>)
);

export type SimpleComponent<P = any> = (props: P) => JSX.Element | null;

export type AsyncComponent<P = any> = (props: P) => Promise<JSX.Element | null>;
