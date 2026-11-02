'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Lock,
  AlertCircle,
  HeartHandshake,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { Badge } from '@/components/ui/Badge';
import { Progress } from '@/components/ui/Progress';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = React.useState<number>(1);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string | null>(null);

  const [toggles, setToggles] = React.useState({
    consent_surveys: true,
    consent_academic: false,
    consent_help_seeking: true,
    consent_counselor_triage: false,
    consent_journal_signals: false,
    emergency_escalation_acknowledged: true,
  });

  async function handleComplete() {
    setIsSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toggles,
          reason: 'ONBOARDING_INITIAL_SELECTION',
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save your privacy selections. Please try again.');
      }

      router.push('/student');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An unexpected error occurred.';
      setError(message);
      setIsSubmitting(false);
    }
  }

  const progressPercentage = (step / 4) * 100;

  return (
    <div className="container mx-auto max-w-3xl space-y-6 px-4 py-8 sm:py-12">
      {/* Progress header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-medium text-[var(--text-muted)]">
          <span>
            Step {step} of 4:{' '}
            {step === 1
              ? 'Welcome & Architecture'
              : step === 2
                ? 'Granular Signals'
                : step === 3
                  ? 'Safety & Policy'
                  : 'Review & Consent'}
          </span>
          <span>{progressPercentage}% Complete</span>
        </div>
        <Progress value={progressPercentage} className="h-2" aria-label="Onboarding Progress" />
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200"
        >
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Step 1: Welcome & Trust Architecture */}
      {step === 1 && (
        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="verified">Privacy by Design</Badge>
              <Badge variant="outline">DPDP Act 2023</Badge>
            </div>
            <CardTitle className="text-2xl font-bold">Welcome to Sahayak</CardTitle>
            <CardDescription className="text-base">
              A student-first, non-diagnostic wellbeing platform. Before collecting a single signal,
              here is our strict architectural pledge:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-[var(--text-secondary)]">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5 rounded-xl border border-neutral-100 bg-[var(--bg-muted)] p-4 dark:border-neutral-800">
                <div className="flex items-center gap-2 font-semibold text-[var(--text-primary)]">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  No Medical Diagnosis
                </div>
                <p className="text-xs">
                  We never assign clinical labels. We compute gentle check-in suggestions based
                  purely on drift from your own baseline.
                </p>
              </div>

              <div className="space-y-1.5 rounded-xl border border-neutral-100 bg-[var(--bg-muted)] p-4 dark:border-neutral-800">
                <div className="flex items-center gap-2 font-semibold text-[var(--text-primary)]">
                  <Lock className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  Envelope Encryption
                </div>
                <p className="text-xs">
                  Your private journal entries are encrypted with your personal key. Counselors,
                  admins, and engineers cannot read them.
                </p>
              </div>

              <div className="space-y-1.5 rounded-xl border border-neutral-100 bg-[var(--bg-muted)] p-4 dark:border-neutral-800">
                <div className="flex items-center gap-2 font-semibold text-[var(--text-primary)]">
                  <HeartHandshake className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  Granular & Revocable
                </div>
                <p className="text-xs">
                  Every data source has an independent toggle. Turning off a toggle immediately
                  halts ingestion and deletes active signals.
                </p>
              </div>

              <div className="space-y-1.5 rounded-xl border border-neutral-100 bg-[var(--bg-muted)] p-4 dark:border-neutral-800">
                <div className="flex items-center gap-2 font-semibold text-[var(--text-primary)]">
                  <CheckCircle2 className="h-4 w-4 text-teal-600 dark:text-teal-400" />
                  Audit Immature Ledger
                </div>
                <p className="text-xs">
                  Every authorization check and unmasking event is logged to a tamper-evident
                  SHA-256 hash-chained ledger.
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t border-neutral-100 pt-4 dark:border-neutral-800">
            <span className="text-xs text-[var(--text-muted)]">Age requirement: 18+</span>
            <Button onClick={() => setStep(2)} className="gap-2">
              Next: Configure Signals <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 2: Granular Signals */}
      {step === 2 && (
        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Choose Your Data Signals</CardTitle>
            <CardDescription>
              Each signal operates independently. Turn on only what you are comfortable sharing:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* 1. Surveys */}
            <div className="flex items-start justify-between gap-4 border-b border-neutral-100 pb-4 dark:border-neutral-800">
              <div className="space-y-1">
                <label
                  htmlFor="t-surveys"
                  className="cursor-pointer text-sm font-semibold text-[var(--text-primary)]"
                >
                  1. Voluntary Weekly Check-In Surveys
                </label>
                <p className="text-xs text-[var(--text-secondary)]">
                  Brief, non-clinical reflections adapted from validated instruments to track
                  self-reported stress trends.
                </p>
              </div>
              <Switch
                id="t-surveys"
                checked={toggles.consent_surveys}
                onCheckedChange={(c) => setToggles({ ...toggles, consent_surveys: c })}
              />
            </div>

            {/* 2. Academic Drift */}
            <div className="flex items-start justify-between gap-4 border-b border-neutral-100 pb-4 dark:border-neutral-800">
              <div className="space-y-1">
                <label
                  htmlFor="t-academic"
                  className="cursor-pointer text-sm font-semibold text-[var(--text-primary)]"
                >
                  2. Academic Pattern Indicators (LMS Signals)
                </label>
                <p className="text-xs text-[var(--text-secondary)]">
                  Evaluates submission delay trends and attendance deviations solely relative to
                  your own historical baseline.
                </p>
              </div>
              <Switch
                id="t-academic"
                checked={toggles.consent_academic}
                onCheckedChange={(c) => setToggles({ ...toggles, consent_academic: c })}
              />
            </div>

            {/* 3. Help Seeking */}
            <div className="flex items-start justify-between gap-4 border-b border-neutral-100 pb-4 dark:border-neutral-800">
              <div className="space-y-1">
                <label
                  htmlFor="t-help"
                  className="cursor-pointer text-sm font-semibold text-[var(--text-primary)]"
                >
                  3. Help-Seeking Patterns
                </label>
                <p className="text-xs text-[var(--text-secondary)]">
                  Recognizes late-night crisis page views and abandoned counselor booking attempts
                  as corroborating signals.
                </p>
              </div>
              <Switch
                id="t-help"
                checked={toggles.consent_help_seeking}
                onCheckedChange={(c) => setToggles({ ...toggles, consent_help_seeking: c })}
              />
            </div>

            {/* 4. Counselor Triage */}
            <div className="flex items-start justify-between gap-4 border-b border-neutral-100 pb-4 dark:border-neutral-800">
              <div className="space-y-1">
                <label
                  htmlFor="t-triage"
                  className="cursor-pointer text-sm font-semibold text-[var(--text-primary)]"
                >
                  4. Counselor Check-In Suggestions
                </label>
                <p className="text-xs text-[var(--text-secondary)]">
                  Permits your pseudonymous case to appear in the campus counselor queue only if
                  corroborated signals reach Tier 2 or Tier 3.
                </p>
              </div>
              <Switch
                id="t-triage"
                checked={toggles.consent_counselor_triage}
                onCheckedChange={(c) => setToggles({ ...toggles, consent_counselor_triage: c })}
              />
            </div>

            {/* 5. Journal Signals */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="t-journal"
                    className="cursor-pointer text-sm font-semibold text-[var(--text-primary)]"
                  >
                    5. Private Journal Analysis
                  </label>
                  <Badge variant="outline" className="text-[10px]">
                    Strictly Opt-In
                  </Badge>
                </div>
                <p className="text-xs text-[var(--text-secondary)]">
                  Default is OFF. If enabled, client-decrypted text extracts high-level emotion
                  indicators. Your raw entries remain private.
                </p>
              </div>
              <Switch
                id="t-journal"
                checked={toggles.consent_journal_signals}
                onCheckedChange={(c) => setToggles({ ...toggles, consent_journal_signals: c })}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t border-neutral-100 pt-4 dark:border-neutral-800">
            <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button onClick={() => setStep(3)} className="gap-2">
              Next: Safety Policy <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 3: Safety & Emergency Policy */}
      {step === 3 && (
        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Emergency & Escalation Policy</CardTitle>
            <CardDescription>
              Clear boundaries on automated contact and immediate crisis access.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-[var(--text-secondary)]">
            <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50/60 p-4 text-amber-900 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-200">
              <div className="flex items-center gap-2 text-sm font-semibold">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                Zero Automated Dispatch by Default
              </div>
              <p className="text-xs leading-relaxed">
                Sahayak will <strong>NEVER</strong> automatically contact your emergency contacts,
                family, or campus security without your explicit affirmative action, except where
                mandated by documented legal institutional policy (which is locked OFF by default in
                this campus deployment).
              </p>
            </div>

            <div className="space-y-2 rounded-xl border border-neutral-200 bg-[var(--bg-muted)] p-4 dark:border-neutral-800">
              <div className="text-sm font-semibold text-[var(--text-primary)]">
                Immediate Crisis Path Always Open
              </div>
              <p className="text-xs leading-relaxed">
                If you ever experience acute distress or thoughts of self-harm, tap{' '}
                <strong>Get help now</strong> on any screen. Immediate verified hotlines
                (Tele-MANAS, KIRAN, 112) are directly callable 24/7 without authentication,
                tracking, or delay.
              </p>
            </div>

            <div className="flex items-start gap-3 pt-2">
              <Switch
                id="t-ack"
                checked={toggles.emergency_escalation_acknowledged}
                onCheckedChange={(c) =>
                  setToggles({ ...toggles, emergency_escalation_acknowledged: c })
                }
              />
              <label
                htmlFor="t-ack"
                className="cursor-pointer text-xs font-medium text-[var(--text-primary)]"
              >
                I understand the emergency escalation framework and know that immediate crisis
                support is always accessible on every screen.
              </label>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t border-neutral-100 pt-4 dark:border-neutral-800">
            <Button variant="outline" onClick={() => setStep(2)} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button
              onClick={() => setStep(4)}
              disabled={!toggles.emergency_escalation_acknowledged}
              className="gap-2"
            >
              Next: Review & Confirm <ArrowRight className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 4: Review & Consent Confirmation */}
      {step === 4 && (
        <Card className="border-neutral-200 dark:border-neutral-800">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Review Your Privacy Configuration</CardTitle>
            <CardDescription>
              Confirm your affirmative selections. You can update or revoke these anytime in Privacy
              Settings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 rounded-xl border border-neutral-200 bg-[var(--bg-muted)] p-4 text-sm dark:border-neutral-800">
              <div className="flex items-center justify-between py-1">
                <span className="font-medium text-[var(--text-primary)]">
                  Voluntary Pulse Surveys:
                </span>
                <Badge variant={toggles.consent_surveys ? 'verified' : 'secondary'}>
                  {toggles.consent_surveys ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <div className="flex items-center justify-between border-t border-neutral-200 py-1 dark:border-neutral-800">
                <span className="font-medium text-[var(--text-primary)]">
                  Academic Pattern Drift:
                </span>
                <Badge variant={toggles.consent_academic ? 'verified' : 'secondary'}>
                  {toggles.consent_academic ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <div className="flex items-center justify-between border-t border-neutral-200 py-1 dark:border-neutral-800">
                <span className="font-medium text-[var(--text-primary)]">
                  Help-Seeking Patterns:
                </span>
                <Badge variant={toggles.consent_help_seeking ? 'verified' : 'secondary'}>
                  {toggles.consent_help_seeking ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <div className="flex items-center justify-between border-t border-neutral-200 py-1 dark:border-neutral-800">
                <span className="font-medium text-[var(--text-primary)]">
                  Counselor Check-In Suggestions:
                </span>
                <Badge variant={toggles.consent_counselor_triage ? 'verified' : 'secondary'}>
                  {toggles.consent_counselor_triage ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <div className="flex items-center justify-between border-t border-neutral-200 py-1 dark:border-neutral-800">
                <span className="font-medium text-[var(--text-primary)]">
                  Private Journal Analysis:
                </span>
                <Badge variant={toggles.consent_journal_signals ? 'verified' : 'secondary'}>
                  {toggles.consent_journal_signals ? 'Enabled' : 'Disabled (Protected)'}
                </Badge>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-[var(--text-muted)]">
              By confirming, your choices will be recorded to your immutable consent ledger.
              Anonymized IP hash is captured solely for compliance verification under the DPDP Act
              2023.
            </p>
          </CardContent>
          <CardFooter className="flex justify-between border-t border-neutral-100 pt-4 dark:border-neutral-800">
            <Button variant="outline" onClick={() => setStep(3)} className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            <Button
              onClick={handleComplete}
              disabled={isSubmitting}
              className="gap-2 bg-emerald-800 font-semibold text-white hover:bg-emerald-900"
            >
              {isSubmitting ? 'Recording Consent...' : 'Complete Onboarding'}{' '}
              <CheckCircle2 className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
