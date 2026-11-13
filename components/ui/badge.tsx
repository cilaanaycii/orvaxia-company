import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-brand-slate focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-brand-navy text-white hover:bg-brand-navy/90',
        brand:
          'border-brand-lavender/35 bg-brand-surface text-brand-navy',
        brandNavy:
          'border-transparent bg-brand-navy text-white',
        brandSlate:
          'border-transparent bg-brand-slate text-white',
        brandPeach:
          'border-brand-peach/40 bg-brand-peach/20 text-brand-navy',
        brandYellow:
          'border-brand-yellow/60 bg-brand-yellow/30 text-brand-navy',
        brandLavender:
          'border-brand-lavender/40 bg-brand-lavender/25 text-brand-navy',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-rose-600 text-white hover:bg-rose-700',
        outline: 'text-foreground border-slate-200',
        success:
          'border-emerald-200 bg-emerald-50 text-emerald-800',
        warning:
          'border-amber-200 bg-amber-50 text-amber-900',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
