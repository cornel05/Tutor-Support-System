import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60 ring-offset-slate-950',
  {
    variants: {
      variant: {
        default:
          'bg-brand text-white shadow-glow hover:bg-brand-light focus-visible:ring-brand-light',
        secondary:
          'bg-slate-800 text-slate-100 hover:bg-slate-700 focus-visible:ring-slate-600',
        ghost:
          'bg-transparent text-slate-200 hover:bg-slate-800/60 focus-visible:ring-slate-700',
        outline:
          'border border-slate-700 bg-slate-900 hover:bg-slate-800 focus-visible:ring-brand',
        destructive:
          'bg-red-600 text-white shadow hover:bg-red-500 focus-visible:ring-red-400',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
