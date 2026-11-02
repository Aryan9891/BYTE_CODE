'use client';

import * as React from 'react';
import {
  PhoneCall,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Checkbox } from '@/components/ui/Checkbox';
import { Switch } from '@/components/ui/Switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup';
import { Progress } from '@/components/ui/Progress';
import { Skeleton } from '@/components/ui/Skeleton';
import { ToastBanner } from '@/components/ui/Toast';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { TierBadge } from '@/components/shared/TierBadge';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';

export function DesignSystemShowcase() {
  const [progressVal] = React.useState(65);
  const [switchVal, setSwitchVal] = React.useState(true);
  const [checkboxVal, setCheckboxVal] = React.useState(true);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 sm:py-12 space-y-12">
      {/* Title */}
      <div className="space-y-2 pb-6 border-b border-neutral-200 dark:border-neutral-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-neutral-300 dark:border-neutral-700">Dev Only</Badge>
            <span className="text-xs text-[var(--text-muted)] font-mono">docs/DESIGN_SYSTEM.md</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          Sahayak Trauma-Informed Design System
        </h1>
        <p className="text-sm text-[var(--text-secondary)] max-w-3xl">
          Visual showcase of tokens, accessible interactive primitives, state variations, and non-stigmatizing tier badges.
        </p>
      </div>

      {/* 1. Color Palette Tokens */}
      <section className="space-y-4" aria-labelledby="colors-heading">
        <h2 id="colors-heading" className="text-xl font-bold text-[var(--text-primary)]">
          1. Color Tokens & Semantic Roles
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 text-xs">
          <div className="space-y-1.5 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-[var(--bg-surface)]">
            <div className="h-10 rounded-lg bg-[var(--brand-primary)]" />
            <p className="font-semibold">Brand Primary</p>
            <p className="text-[var(--text-muted)]">--brand-primary</p>
          </div>
          <div className="space-y-1.5 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-[var(--bg-surface)]">
            <div className="h-10 rounded-lg bg-[var(--brand-accent)]" />
            <p className="font-semibold">Brand Accent</p>
            <p className="text-[var(--text-muted)]">--brand-accent</p>
          </div>
          <div className="space-y-1.5 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-[var(--bg-surface)]">
            <div className="h-10 rounded-lg bg-[var(--tier-0-thriving)]" />
            <p className="font-semibold">Tier 0 Thriving</p>
            <p className="text-[var(--text-muted)]">--tier-0-thriving</p>
          </div>
          <div className="space-y-1.5 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-[var(--bg-surface)]">
            <div className="h-10 rounded-lg bg-[var(--tier-1-watch)]" />
            <p className="font-semibold">Tier 1 Watch</p>
            <p className="text-[var(--text-muted)]">--tier-1-watch</p>
          </div>
          <div className="space-y-1.5 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-[var(--bg-surface)]">
            <div className="h-10 rounded-lg bg-[var(--tier-2-suggested)]" />
            <p className="font-semibold">Tier 2 Suggested</p>
            <p className="text-[var(--text-muted)]">--tier-2-suggested</p>
          </div>
          <div className="space-y-1.5 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-[var(--bg-surface)]">
            <div className="h-10 rounded-lg bg-[var(--tier-3-priority)]" />
            <p className="font-semibold">Tier 3 Priority</p>
            <p className="text-[var(--text-muted)]">--tier-3-priority</p>
          </div>
        </div>
      </section>

      {/* 2. Counselor TierBadges */}
      <section className="space-y-4" aria-labelledby="tier-badges-heading">
        <h2 id="tier-badges-heading" className="text-xl font-bold text-[var(--text-primary)]">
          2. Counselor Triage Tier Badges (Staff Views ONLY)
        </h2>
        <p className="text-xs text-[var(--text-secondary)]">
          Must use icon + text + color (never color alone). Never displayed as labels to students.
        </p>
        <div className="flex flex-wrap items-center gap-4 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-[var(--bg-surface)]">
          <TierBadge tier="TIER_0" size="sm" />
          <TierBadge tier="TIER_0" size="md" />
          <TierBadge tier="TIER_1" size="md" />
          <TierBadge tier="TIER_2" size="md" />
          <TierBadge tier="TIER_3" size="md" />
          <TierBadge tier="TIER_3" size="lg" />
        </div>
      </section>

      {/* 3. Button Variants & States */}
      <section className="space-y-4" aria-labelledby="buttons-heading">
        <h2 id="buttons-heading" className="text-xl font-bold text-[var(--text-primary)]">
          3. Button Variants & States (Min 44px Tap Targets)
        </h2>
        <div className="flex flex-wrap items-center gap-3 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-[var(--bg-surface)]">
          <Button variant="default">Primary Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Text Link</Button>
          <Button variant="crisis" className="gap-2">
            <PhoneCall className="w-4 h-4" /> Crisis Emergency
          </Button>
          <Button variant="default" disabled>Disabled State</Button>
          <Button variant="default" size="sm">Small (40px)</Button>
          <Button variant="default" size="lg">Large (48px)</Button>
        </div>
      </section>

      {/* 4. Form Primitives */}
      <section className="space-y-4" aria-labelledby="forms-heading">
        <h2 id="forms-heading" className="text-xl font-bold text-[var(--text-primary)]">
          4. Accessible Form Primitives
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-[var(--bg-surface)]">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="demo-input" className="text-xs font-semibold">Standard Input Field</label>
              <Input id="demo-input" placeholder="Type a reflection or search term..." />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="demo-textarea" className="text-xs font-semibold">Reflection Textarea</label>
              <Textarea id="demo-textarea" placeholder="Encrypted private journal entry..." />
            </div>
          </div>

          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <label htmlFor="demo-switch" className="text-sm font-medium">Accessible Switch Toggle</label>
              <Switch id="demo-switch" checked={switchVal} onCheckedChange={setSwitchVal} />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox id="demo-checkbox" checked={checkboxVal} onCheckedChange={(val) => setCheckboxVal(!!val)} />
              <label htmlFor="demo-checkbox" className="text-sm font-medium cursor-pointer">
                Affirmative Consent Checkbox
              </label>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold">Radio Group Options</span>
              <RadioGroup defaultValue="opt2">
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="opt1" id="r1" />
                  <label htmlFor="r1" className="text-sm cursor-pointer">Several days</label>
                </div>
                <div className="flex items-center gap-2">
                  <RadioGroupItem value="opt2" id="r2" />
                  <label htmlFor="r2" className="text-sm cursor-pointer">More than half the days</label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Feedback, Modals & Banners */}
      <section className="space-y-4" aria-labelledby="modals-heading">
        <h2 id="modals-heading" className="text-xl font-bold text-[var(--text-primary)]">
          5. Feedback States, Banners & Dialogs
        </h2>
        <div className="space-y-4">
          <ToastBanner
            type="info"
            title="Privacy Guard Active"
            message="Your survey responses are evaluated strictly against your personal baseline."
          />
          <ToastBanner
            type="warning"
            title="Demo Placeholders"
            message="Support directory phone numbers must be institutionally verified prior to live launch."
          />

          <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-[var(--bg-surface)] flex flex-wrap items-center gap-4">
            {/* Interactive Accessible Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">Open Accessible Modal Dialog</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Accessible Radix Dialog</DialogTitle>
                  <DialogDescription>
                    This modal traps focus, supports screen readers with aria-describedby, and automatically closes on Escape.
                  </DialogDescription>
                </DialogHeader>
                <p className="text-sm text-[var(--text-secondary)] py-2">
                  Testing modal accessibility guarantees zero focus traps for keyboard users.
                </p>
                <DialogFooter>
                  <Button variant="default">Understood</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Progress indicator */}
            <div className="w-48 space-y-1">
              <div className="flex justify-between text-xs text-[var(--text-muted)]">
                <span>Weekly Pulse</span>
                <span>{progressVal}%</span>
              </div>
              <Progress value={progressVal} aria-label="Weekly pulse check-in completion progress" />
            </div>

            {/* Skeleton */}
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full" />
              <div className="space-y-1.5">
                <Skeleton className="w-24 h-3.5" />
                <Skeleton className="w-16 h-3" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Empty & Error States */}
      <section className="space-y-4" aria-labelledby="empty-states-heading">
        <h2 id="empty-states-heading" className="text-xl font-bold text-[var(--text-primary)]">
          6. Calm Empty & Error State Patterns
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <EmptyState
            icon={Sparkles}
            milestoneTag="Milestone Preview"
            title="Calm Empty State"
            description="Designed with gentle encouragement, transparent next steps, and zero shame."
            actionText="Sample Action"
            actionHref="/student"
          />
          <ErrorState
            title="Non-Alarming Error State"
            description="Reassures the user that their data is completely safe and offers a clear path to retry."
            onRetry={() => {}}
          />
        </div>
      </section>
    </div>
  );
}

