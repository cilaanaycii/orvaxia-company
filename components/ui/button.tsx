import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold transition-all duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-slate focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 disabled:active:scale-100 select-none',
  {
    variants: {
      variant: {
        default: 'bg-brand-navy text-white hover:bg-brand-slate shadow-sm',
        brand: 'bg-brand-navy text-white hover:bg-brand-slate shadow-sm',
        brandSlate: 'bg-brand-slate text-white hover:bg-brand-navy shadow-sm',
        brandOutline:
          'border border-brand-lavender/40 bg-white text-brand-navy hover:bg-brand-surface hover:border-brand-slate shadow-xs',
        brandSecondary:
          'border border-brand-lavender/30 bg-brand-surface text-brand-navy hover:bg-brand-lavender/20',
        destructive:
          'bg-rose-600 text-white hover:bg-rose-700 shadow-sm',
        outline:
          'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900',
        secondary:
          'bg-brand-surface text-brand-navy hover:bg-brand-surface/80',
        ghost: 'hover:bg-brand-surface hover:text-brand-navy',
        link: 'text-brand-slate underline-offset-4 hover:underline active:scale-100',
      },
      size: {
        default: 'h-11 px-5 py-2.5 text-sm',
        sm: 'h-9 px-3.5 text-xs rounded-lg',
        lg: 'h-12 px-7 text-base rounded-2xl',
        pill: 'h-11 px-6 rounded-full text-xs tracking-wide uppercase font-bold',
        pillSm: 'h-8 px-4 rounded-full text-[11px] font-semibold',
        pillLg: 'h-12 px-8 rounded-full text-sm tracking-wide font-bold',
        icon: 'h-10 w-10 rounded-xl',
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
