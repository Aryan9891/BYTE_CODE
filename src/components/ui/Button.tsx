import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-focus)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 min-h-[44px] min-w-[44px] px-4 py-2 cursor-pointer',
  {
    variants: {
      variant: {
        default: 'bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-accent)] shadow-sm',
        secondary:
          'bg-[var(--bg-muted)] text-[var(--text-primary)] hover:bg-neutral-200 dark:hover:bg-neutral-800',
        outline:
          'border border-neutral-300 dark:border-neutral-700 bg-[var(--bg-surface)] text-[var(--text-primary)] hover:bg-[var(--bg-muted)]',
        ghost: 'text-[var(--text-primary)] hover:bg-[var(--bg-muted)]',
        destructive: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
        link: 'text-[var(--brand-primary)] dark:text-[var(--brand-accent)] underline-offset-4 hover:underline p-0 min-h-0 min-w-0',
        crisis:
          'bg-[var(--crisis-text)] text-white hover:opacity-90 font-semibold shadow-md border-2 border-red-700 dark:border-red-500',
      },
      size: {
        default: 'h-11 px-5 py-2.5',
        sm: 'h-10 rounded-lg px-3.5 text-xs',
        lg: 'h-12 rounded-2xl px-8 text-base',
        icon: 'h-11 w-11 p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
