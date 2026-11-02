'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  PhoneCall,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Globe,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import supportSnapshot from '@/data/support-snapshot.json';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useI18n } from '@/lib/i18n';

export default function CrisisPage() {
  const { t } = useI18n();
  const [breathingPhase, setBreathingPhase] = React.useState<'Inhale' | 'Hold' | 'Exhale'>(
    'Inhale'
  );
  const [seconds, setSeconds] = React.useState(4);

  // Gentle breathing cycle timer for calming physiological arousal
  React.useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          setBreathingPhase((currentPhase) => {
            if (currentPhase === 'Inhale') {
              return 'Hold';
            } else if (currentPhase === 'Hold') {
              return 'Exhale';
            } else {
              return 'Inhale';
            }
          });
          return breathingPhase === 'Inhale' ? 4 : breathingPhase === 'Hold' ? 6 : 4;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [breathingPhase]);

  // Priority listings for immediate top display
  const priorityResources = supportSnapshot.filter((res) => res.is_crisis_priority);
  const otherResources = supportSnapshot.filter((res) => !res.is_crisis_priority);

  return (
    <div className="container mx-auto max-w-5xl space-y-8 px-4 py-8 sm:py-12">
      {/* Back button */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
        >
          <ArrowLeft className="h-4 w-4" /> {t('common.backToHome')}
        </Link>
      </div>

      {/* Hero Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-red-300 bg-red-100 px-3 py-1 text-xs font-semibold text-red-800 dark:border-red-800 dark:bg-red-950/70 dark:text-red-300">
          <PhoneCall className="h-3.5 w-3.5 animate-pulse" aria-hidden="true" />
          <span>24/7 Immediate Safety Gateway</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)] sm:text-4xl">
          {t('crisis.title')}
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-[var(--text-secondary)] sm:text-lg">
          {t('crisis.subtitle')}
        </p>
      </div>

      {/* Mandatory Demo Placeholders Banner */}
      <div
        role="alert"
        className="flex items-start gap-3.5 rounded-2xl border-2 border-amber-300 bg-amber-50/90 p-4 text-amber-900 sm:p-5 dark:border-amber-700 dark:bg-amber-950/50 dark:text-amber-200"
      >
        <AlertTriangle
          className="mt-0.5 h-6 w-6 shrink-0 text-amber-600 dark:text-amber-400"
          aria-hidden="true"
        />
        <div className="space-y-1">
          <h2 className="text-sm font-semibold">
            Demo Notice: Institutional Verification Required
          </h2>
          <p className="text-xs leading-relaxed text-amber-800 sm:text-sm dark:text-amber-300">
            {t('crisis.demoWarning')}
          </p>
        </div>
      </div>

      {/* 1. Immediate Crisis Call Targets (RENDERED FIRST ABOVE BREATHING WIDGET) */}
      <section className="space-y-4" aria-labelledby="primary-helplines-heading">
        <h2 id="primary-helplines-heading" className="text-xl font-bold text-[var(--text-primary)]">
          Immediate Emergency & National Helplines
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {priorityResources.map((res) => (
            <Card
              key={res.id}
              className="flex flex-col justify-between border-2 border-red-200 shadow-md transition-all hover:border-red-300 dark:border-red-900/60 dark:hover:border-red-800"
            >
              <CardHeader className="pb-3">
                <div className="mb-1 flex items-center justify-between gap-2">
                  {res.verification_notes?.includes('VERIFY BEFORE LAUNCH') ? (
                    <Badge
                      variant="outline"
                      className="border-amber-300 text-amber-800 dark:text-amber-300"
                    >
                      Pending Verification
                    </Badge>
                  ) : (
                    <Badge variant="verified">
                      <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                      Verified
                    </Badge>
                  )}
                  {res.is_free_toll_free && (
                    <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-400">
                      {t('crisis.freeToll')}
                    </span>
                  )}
                </div>
                <CardTitle className="text-lg text-[var(--text-primary)]">{res.name}</CardTitle>
                <CardDescription className="line-clamp-2 text-xs leading-relaxed">
                  {res.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                <div className="space-y-1.5 text-xs text-[var(--text-secondary)]">
                  <div className="flex items-center gap-1.5">
                    <Clock
                      className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]"
                      aria-hidden="true"
                    />
                    <span>{res.operating_hours}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Globe
                      className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]"
                      aria-hidden="true"
                    />
                    <span className="truncate">
                      {res.languages_supported.slice(0, 4).join(', ')}
                      {res.languages_supported.length > 4 &&
                        ` +${res.languages_supported.length - 4} more`}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href={`tel:${res.phone.replace(/[^0-9+]/g, '')}`}
                    className="flex min-h-[48px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[var(--crisis-text)] px-4 py-3 text-base font-bold text-white shadow-md transition-all hover:opacity-95 focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:outline-none"
                  >
                    <PhoneCall className="h-5 w-5 shrink-0" aria-hidden="true" />
                    <span>Call {res.phone}</span>
                    <span className="sr-only"> ({res.name})</span>
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 2. Additional Specialized & Reference Helplines */}
      {otherResources.length > 0 && (
        <section className="space-y-4 pt-4" aria-labelledby="additional-resources-heading">
          <h2
            id="additional-resources-heading"
            className="text-xl font-bold text-[var(--text-primary)]"
          >
            Specialized & International Support Services
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {otherResources.map((res) => (
              <Card key={res.id} className="flex flex-col justify-between">
                <CardHeader className="pb-2">
                  <div className="mb-1 flex items-center justify-between gap-1">
                    <span className="font-mono text-[10px] text-[var(--text-muted)] uppercase">
                      Region: {res.region_code}
                    </span>
                    <span className="text-[10px] font-medium text-amber-700 dark:text-amber-400">
                      Pending Verification
                    </span>
                  </div>
                  <CardTitle className="text-base">{res.name}</CardTitle>
                  <CardDescription className="line-clamp-2 text-xs">
                    {res.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 pt-0">
                  <p className="text-xs text-[var(--text-secondary)]">
                    <strong>Hours:</strong> {res.operating_hours}
                  </p>
                  <a
                    href={
                      res.sms_or_whatsapp
                        ? `sms:${res.sms_or_whatsapp.replace(/[^0-9+]/g, '')}`
                        : `tel:${res.phone.replace(/[^0-9+]/g, '')}`
                    }
                    className="flex min-h-[44px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-[var(--bg-muted)] px-3 py-2 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-neutral-200 dark:border-neutral-700 dark:hover:bg-neutral-800"
                  >
                    <PhoneCall className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>{res.phone}</span>
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* 3. Interactive Grounding Breathing Tool (PROGRESSIVE ENHANCEMENT - BELOW PHONE NUMBERS) */}
      <Card className="overflow-hidden border-emerald-200 bg-gradient-to-br from-emerald-50/60 to-white dark:border-emerald-900 dark:from-emerald-950/20 dark:to-[var(--bg-surface)]">
        <CardContent className="flex flex-col items-center justify-between gap-6 p-6 sm:p-8 md:flex-row">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              <span>Grounding Exercise</span>
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">
              {t('crisis.breathingTitle')}
            </h2>
            <p className="max-w-md text-sm text-[var(--text-secondary)]">
              {t('crisis.breathingInstruction')}
            </p>
          </div>

          {/* Animated Circle Visualizer - Respects Reduced Motion */}
          <div className="flex flex-col items-center justify-center space-y-2">
            <div
              className="flex h-28 w-28 flex-col items-center justify-center rounded-full border-4 border-emerald-500/80 bg-emerald-100/50 shadow-inner transition-all duration-1000 motion-reduce:transform-none motion-reduce:transition-none dark:bg-emerald-900/30"
              style={{
                transform:
                  breathingPhase === 'Inhale'
                    ? 'scale(1.1)'
                    : breathingPhase === 'Hold'
                      ? 'scale(1.1)'
                      : 'scale(0.95)',
              }}
              aria-live="polite"
              aria-atomic="true"
            >
              <span className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                {breathingPhase}
              </span>
              <span className="font-mono text-xs text-emerald-700 dark:text-emerald-400">
                {seconds}s
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Privacy & Safety Guarantee */}
      <div className="space-y-2 rounded-2xl border border-neutral-200 bg-[var(--bg-surface)] p-6 dark:border-neutral-800">
        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-800 dark:text-emerald-400">
          <ShieldCheck className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span>Strict Confidentiality Assurance</span>
        </div>
        <p className="text-xs leading-relaxed text-[var(--text-secondary)] sm:text-sm">
          {t('crisis.confidentialityNote')}
        </p>
      </div>
    </div>
  );
}
