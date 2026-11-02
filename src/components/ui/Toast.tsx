import * as React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ToastBannerProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  onClose?: () => void;
  className?: string;
}

export function ToastBanner({
  type = 'info',
  title,
  message,
  onClose,
  className,
}: ToastBannerProps) {
  const icons = {
    info: <Info className="h-5 w-5 shrink-0 text-blue-600 dark:text-blue-400" />,
    success: <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />,
    warning: <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />,
    error: <AlertCircle className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />,
  };

  const bgStyles = {
    info: 'bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-900',
    success: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-900',
    warning: 'bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-900',
    error: 'bg-red-50 border-red-200 dark:bg-red-950/40 dark:border-red-900',
  };

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex items-start gap-3 rounded-2xl border p-4 text-sm text-[var(--text-primary)] shadow-sm',
        bgStyles[type],
        className
      )}
    >
      {icons[type]}
      <div className="flex-1">
        {title && <p className="mb-0.5 text-sm font-semibold">{title}</p>}
        <p className="text-[var(--text-secondary)]">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="cursor-pointer rounded-md p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
          aria-label="Dismiss message"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
