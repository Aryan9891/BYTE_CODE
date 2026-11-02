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
    <Card className={cn('text-center py-12 px-6 border-amber-200 dark:border-amber-900', className)}>
      <CardContent className="flex flex-col items-center max-w-md mx-auto space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-700 dark:text-amber-400">
          <AlertCircle className="w-7 h-7" aria-hidden="true" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{description}</p>
        </div>
        <div className="flex flex-wrap gap-3 pt-2 justify-center">
          {onRetry && (
            <Button onClick={onRetry} variant="default" className="gap-2">
              <RefreshCw className="w-4 h-4" /> Try again
            </Button>
          )}
          <Button asChild variant="outline" className="gap-2">
            <Link href={homeHref}>
              <Home className="w-4 h-4" /> Return to Home
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
