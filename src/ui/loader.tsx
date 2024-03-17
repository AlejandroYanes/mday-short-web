/* eslint-disable max-len */
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from './helpers';

const outerVariants = cva(
  'inline-block relative flex flex-col justify-center items-center',
  {
    variants: {
      size: {
        md: 'w-20 h-20',
        sm: 'w-10 h-10',
        xs: 'w-5 h-5',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

const innerVariants = cva(
  'box-border block absolute border-solid border-t-emerald-500',
  {
    variants: {
      size: {
        md: 'w-16 h-16 border-8',
        sm: 'w-8 h-8 border-4',
        xs: 'w-4 h-4 border-2',
      },
      color: {
        red: 'border-t-red-500',
        orange: 'border-t-orange-500',
        amber: 'border-t-amber-500',
        yellow: 'border-t-yellow-500',
        lime: 'border-t-lime-500',
        green: 'border-t-green-500',
        emerald: 'border-t-emerald-500',
        teal: 'border-t-teal-500',
        cyan: 'border-t-cyan-500',
        sky: 'border-t-sky-500',
        blue: 'border-t-blue-500',
        indigo: 'border-t-indigo-500',
        violet: 'border-t-violet-500',
        purple: 'border-t-purple-500',
        fuchsia: 'border-t-fuchsia-500',
        pink: 'border-t-pink-500',
        rose: 'border-t-rose-500',
        black: 'border-t-slate-950',
        white: 'border-t-white',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

interface Props extends VariantProps<typeof innerVariants> {
  className?: string;
  innerClassName?: string;
}

export function Loader(props: Props) {
  const { className, innerClassName, size, color } = props;
  return (
    <div className={cn(outerVariants({ size }), 'lds-ring', className)}>
      <div className={cn(innerVariants({ size, color }), innerClassName)}></div>
      <div className={cn(innerVariants({ size, color }), innerClassName)}></div>
      <div className={cn(innerVariants({ size, color }), innerClassName)}></div>
      <div className={cn(innerVariants({ size, color }), innerClassName)}></div>
    </div>
  );
}
