import * as React from 'react';
import Link from 'next/link';
import { LucideIcon, Compass } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  milestoneTag?: string;
  actionText?: string;
  actionHref?: string;
  secondaryActionText?: string;
  secondaryActionHref?: string;
  className?: string;
}

export function EmptyState({
  icon: Icon = Compass,
  title,
  description,
  milestoneTag,
  actionText,
  actionHref,
  secondaryActionText,
  secondaryActionHref,
  className,
}: EmptyStateProps) {
  return (
    <Card className={cn('px-6 py-12 text-center', className)}>
      <CardContent className="mx-auto flex max-w-md flex-col items-center space-y-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--bg-muted)] text-[var(--brand-primary)] dark:text-[var(--brand-accent)]">
          <Icon className="h-7 w-7" aria-hidden="true" />
        </div>
        {milestoneTag && (
          <span className="rounded-full border border-neutral-300 bg-neutral-100 px-3 py-1 text-xs font-semibold text-[var(--text-secondary)] dark:border-neutral-700 dark:bg-neutral-800">
            {milestoneTag}
          </span>
        )}
        <div className="space-y-1.5">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
          <p className="text-sm leading-relaxed text-[var(--text-secondary)]">{description}</p>
        </div>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          {actionText && actionHref && (
            <Button asChild variant="default">
              <Link href={actionHref}>{actionText}</Link>
            </Button>
          )}
          {secondaryActionText && secondaryActionHref && (
            <Button asChild variant="outline">
              <Link href={secondaryActionHref}>{secondaryActionText}</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
