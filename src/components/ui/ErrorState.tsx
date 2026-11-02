import * as React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  homeHref?: string;
  className?: string;
}

export function ErrorState({
  title = 'Something unexpected occurred',
  description = 'We encountered a gentle hiccup while loading this information. Please rest assured your data remains completely safe.',
  onRetry,
  homeHref = '/',
  className,
}: ErrorStateProps) {
  return (
    <Card
      className={cn('border-amber-200 px-6 py-12 text-center dark:border-amber-900', className)}
    >
      <CardContent className="mx-auto flex max-w-md flex-col items-center space-y-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400">
          <AlertCircle className="h-7 w-7" aria-hidden="true" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
          <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{description}</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          {onRetry && (
            <Button onClick={onRetry} variant="default" className="gap-2">
              <RefreshCw className="h-4 w-4" /> Try again
            </Button>
          )}
          <Button asChild variant="outline" className="gap-2">
            <Link href={homeHref}>
              <Home className="h-4 w-4" /> Return to Home
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
