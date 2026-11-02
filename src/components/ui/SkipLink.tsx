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
        'sr-only text-sm font-medium transition-all focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-xl focus:bg-[var(--brand-primary)] focus:px-4 focus:py-2.5 focus:text-white focus:shadow-lg focus:ring-2 focus:ring-[var(--brand-focus)] focus:ring-offset-2 focus:outline-none',
        className
      )}
    >
      {label}
    </a>
  );
}
