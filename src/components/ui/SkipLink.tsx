import * as React from 'react';
import { cn } from '@/lib/utils';

export function SkipLink({
  targetId = 'main-content',
  label = 'Skip to main content',
  className,
}: {
  targetId?: string;
  label?: string;
  className?: string;
}) {
  return (
    <a
      href={`#${targetId}`}
      className={cn(
        'sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2.5 focus:bg-[var(--brand-primary)] focus:text-white focus:rounded-xl focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--brand-focus)] font-medium text-sm transition-all',
        className
      )}
    >
      {label}
    </a>
  );
}
