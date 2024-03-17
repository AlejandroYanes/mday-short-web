interface Props {
  children: any;
}

function Code(props: Props) {
  const { children } = props;
  return (
    <code className="relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm bg-neutral-100 dark:bg-slate-800">
      {children}
    </code>
  );
}

export { Code };
