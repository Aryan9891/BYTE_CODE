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
  const [breathingPhase, setBreathingPhase] = React.useState<'Inhale' | 'Hold' | 'Exhale'>('Inhale');
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
    <div className="container mx-auto max-w-5xl px-4 py-8 sm:py-12 space-y-8">
      {/* Back button */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> {t('common.backToHome')}
        </Link>
      </div>

      {/* Hero Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 dark:bg-red-950/70 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 text-xs font-semibold">
          <PhoneCall className="w-3.5 h-3.5 animate-pulse" aria-hidden="true" />
          <span>24/7 Immediate Safety Gateway</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-[var(--text-primary)]">
          {t('crisis.title')}
        </h1>
        <p className="text-base sm:text-lg text-[var(--text-secondary)] max-w-2xl leading-relaxed">
          {t('crisis.subtitle')}
        </p>
      </div>

      {/* Mandatory Demo Placeholders Banner */}
      <div
        role="alert"
        className="rounded-2xl border-2 border-amber-300 dark:border-amber-700 bg-amber-50/90 dark:bg-amber-950/50 p-4 sm:p-5 flex items-start gap-3.5 text-amber-900 dark:text-amber-200"
      >
        <AlertTriangle className="w-6 h-6 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" aria-hidden="true" />
        <div className="space-y-1">
          <h2 className="text-sm font-semibold">Demo Notice: Institutional Verification Required</h2>
          <p className="text-xs sm:text-sm leading-relaxed text-amber-800 dark:text-amber-300">
            {t('crisis.demoWarning')}
          </p>
        </div>
      </div>

      {/* Interactive Grounding Breathing Tool */}
      <Card className="border-emerald-200 dark:border-emerald-900 bg-gradient-to-br from-emerald-50/60 to-white dark:from-emerald-950/20 dark:to-[var(--bg-surface)] overflow-hidden">
        <CardContent className="p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              <span>Grounding Exercise</span>
            </div>
            <h2 className="text-xl font-bold text-[var(--text-primary)]">{t('crisis.breathingTitle')}</h2>
            <p className="text-sm text-[var(--text-secondary)] max-w-md">
              {t('crisis.breathingInstruction')}
            </p>
          </div>

          {/* Animated Circle Visualizer */}
          <div className="flex flex-col items-center justify-center space-y-2">
            <div
              className="w-28 h-28 rounded-full border-4 border-emerald-500/80 flex flex-col items-center justify-center transition-all duration-1000 shadow-inner bg-emerald-100/50 dark:bg-emerald-900/30"
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
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-mono">
                {seconds}s
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Immediate Crisis Call Targets */}
      <section className="space-y-4" aria-labelledby="primary-helplines-heading">
        <h2 id="primary-helplines-heading" className="text-xl font-bold text-[var(--text-primary)]">
          Immediate Emergency & National Helplines
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {priorityResources.map((res) => (
            <Card
              key={res.id}
              className="border-2 border-red-200 dark:border-red-900/60 shadow-md hover:border-red-300 dark:hover:border-red-800 transition-all flex flex-col justify-between"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <Badge variant="verified">
                    {res.region_code === 'CAMPUS' ? 'Campus Support' : 'National Service'}
                  </Badge>
                  {res.is_free_toll_free && (
                    <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      {t('crisis.freeToll')}
                    </span>
                  )}
                </div>
                <CardTitle className="text-lg text-[var(--text-primary)]">{res.name}</CardTitle>
                <CardDescription className="text-xs leading-relaxed line-clamp-2">
                  {res.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                <div className="space-y-1.5 text-xs text-[var(--text-secondary)]">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" aria-hidden="true" />
                    <span>{res.operating_hours}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" aria-hidden="true" />
                    <span className="truncate">
                      {res.languages_supported.slice(0, 4).join(', ')}
                      {res.languages_supported.length > 4 && ` +${res.languages_supported.length - 4} more`}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <a
                    href={`tel:${res.phone.replace(/[^0-9+]/g, '')}`}
                    className="w-full flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-base font-bold bg-[var(--crisis-text)] text-white hover:opacity-95 shadow-md transition-all cursor-pointer min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
                  >
                    <PhoneCall className="w-5 h-5 shrink-0" aria-hidden="true" />
                    <span>Call {res.phone}</span>
                    <span className="sr-only"> ({res.name})</span>
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Additional Specialized & Reference Helplines */}
      {otherResources.length > 0 && (
        <section className="space-y-4 pt-4" aria-labelledby="additional-resources-heading">
          <h2 id="additional-resources-heading" className="text-xl font-bold text-[var(--text-primary)]">
            Specialized & International Support Services
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherResources.map((res) => (
              <Card key={res.id} className="flex flex-col justify-between">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-mono text-[var(--text-muted)] uppercase">
                      Region: {res.region_code}
                    </span>
                    <span className="text-[10px] text-amber-700 dark:text-amber-400 font-medium">
                      VERIFY BEFORE LAUNCH
                    </span>
                  </div>
                  <CardTitle className="text-base">{res.name}</CardTitle>
                  <CardDescription className="text-xs line-clamp-2">
                    {res.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <p className="text-xs text-[var(--text-secondary)]">
                    <strong>Hours:</strong> {res.operating_hours}
                  </p>
                  <a
                    href={
                      res.sms_or_whatsapp
                        ? `sms:${res.sms_or_whatsapp.replace(/[^0-9+]/g, '')}`
                        : `tel:${res.phone.replace(/[^0-9+]/g, '')}`
                    }
                    className="w-full flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-sm font-semibold border border-neutral-300 dark:border-neutral-700 bg-[var(--bg-muted)] hover:bg-neutral-200 dark:hover:bg-neutral-800 text-[var(--text-primary)] transition-colors min-h-[44px] cursor-pointer"
                  >
                    <PhoneCall className="w-4 h-4 shrink-0" aria-hidden="true" />
                    <span>{res.phone}</span>
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Privacy & Safety Guarantee */}
      <div className="rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-[var(--bg-surface)] p-6 space-y-2">
        <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-semibold text-sm">
          <ShieldCheck className="w-5 h-5 shrink-0" aria-hidden="true" />
          <span>Strict Confidentiality Assurance</span>
        </div>
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
          {t('crisis.confidentialityNote')}
        </p>
      </div>
    </div>
  );
}
