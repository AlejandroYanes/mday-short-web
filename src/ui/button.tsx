import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from './helpers';

const buttonVariants = cva(
  // eslint-disable-next-line max-len
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background',
  {
    variants: {
      variant: {
        default: 'bg-emerald-600 text-white hover:bg-emerald-600/90',
        black: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive:
          'bg-red-600 text-white hover:bg-red-600/90',
        'destructive-outline':
          'border border-red-600 text-red-600 hover:border-red-600/90 hover:text-red-600/90 hover:bg-red-600/5',
        outline:
          'border border-neutral-900 dark:border-neutral-100 hover:bg-accent hover:text-accent-foreground',
        'outline-ghost':
          'border border-input dark:border-slate-500 hover:bg-accent hover:text-accent-foreground',
        secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 dark:hover:bg-secondary',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'underline-offset-4 hover:underline text-primary',
        undecorated: '',
      },
      size: {
        default: 'h-10 py-3 px-5 text-md',
        sm: 'h-8 px-3 rounded-md text-sm',
        lg: 'h-11 py-4 px-8 rounded-md text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  component?: React.ElementType;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, component = 'button', ...props }, ref) => {
    const Comp = component;
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
