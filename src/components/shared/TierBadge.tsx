import * as React from 'react';
import { CheckCircle2, Eye, HeartHandshake, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type RiskTier = 'TIER_0' | 'TIER_1' | 'TIER_2' | 'TIER_3';

export interface TierBadgeProps {
  tier: RiskTier;
  showIcon?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * TierBadge
 *
 * NOTE FOR ENGINEERS:
 * This component is intended for Counselor / Wellbeing Staff triage views ONLY.
 * It must NEVER be shown to students as a psychological label or score.
 */
export function TierBadge({ tier, showIcon = true, className, size = 'md' }: TierBadgeProps) {
  const configs = {
    TIER_0: {
      label: 'Tier 0: Thriving',
      description: 'Within baseline variance',
      icon: CheckCircle2,
      style:
        'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800',
    },
    TIER_1: {
      label: 'Tier 1: Watch',
      description: 'Single-signal mild drift',
      icon: Eye,
      style:
        'bg-amber-50 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
    },
    TIER_2: {
      label: 'Tier 2: Check-in Suggested',
      description: 'Corroborated 2+ signal drift',
      icon: HeartHandshake,
      style:
        'bg-orange-50 text-orange-900 border-orange-300 dark:bg-orange-950/60 dark:text-orange-300 dark:border-orange-800',
    },
    TIER_3: {
      label: 'Tier 3: Priority Review',
      description: 'Significant multi-signal or acute',
      icon: AlertCircle,
      style:
        'bg-red-50 text-red-900 border-red-300 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800',
    },
  };

  const current = configs[tier] || configs.TIER_0;
  const Icon = current.icon;

  const sizeClasses = {
    sm: 'text-xs px-2.5 py-0.5 gap-1.5',
    md: 'text-xs px-3 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-4 py-1.5 gap-2 font-medium',
  };

  const iconSizes = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-4.5 h-4.5',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border shadow-xs transition-colors',
        current.style,
        sizeClasses[size],
        className
      )}
      title={`Staff Context: ${current.description}`}
      aria-label={`Counselor Triage ${current.label}`}
    >
      {showIcon && <Icon className={cn(iconSizes[size], 'shrink-0')} aria-hidden="true" />}
      <span>{current.label}</span>
    </span>
  );
}
