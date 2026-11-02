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
    <Card className={cn('text-center py-12 px-6', className)}>
      <CardContent className="flex flex-col items-center max-w-md mx-auto space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-[var(--bg-muted)] flex items-center justify-center text-[var(--brand-primary)] dark:text-[var(--brand-accent)]">
          <Icon className="w-7 h-7" aria-hidden="true" />
        </div>
        {milestoneTag && (
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-[var(--text-secondary)] border border-neutral-300 dark:border-neutral-700">
            {milestoneTag}
          </span>
        )}
        <div className="space-y-1.5">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{description}</p>
        </div>
        <div className="flex flex-wrap gap-3 pt-2 justify-center">
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
