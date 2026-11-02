import * as React from 'react';
import Link from 'next/link';
import { PhoneCall } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CrisisButton({ className }: { className?: string }) {
  return (
    <Link
      href="/crisis"
      className={cn(
        'inline-flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-semibold shadow-md transition-all duration-200',
        'bg-[var(--crisis-text)] text-white hover:opacity-95 focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 focus-visible:outline-none',
        'border-2 border-red-700 dark:border-red-400',
        className
      )}
      aria-label="Get help now: Instant 24/7 crisis and emergency support resources"
      id="crisis-quick-access"
    >
      <PhoneCall className="h-4 w-4 shrink-0 animate-pulse" aria-hidden="true" />
      <span>Get help now</span>
    </Link>
  );
}
