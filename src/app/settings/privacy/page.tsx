'use client';

import * as React from 'react';
import { Trash2, Download, AlertTriangle, CheckCircle2 } from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/Dialog';

export default function PrivacySettingsPage() {
  const [consents, setConsents] = React.useState({
    consent_surveys: true,
    consent_academic: false,
    consent_help_seeking: true,
    consent_counselor_triage: false,
    consent_journal_signals: false,
    emergency_escalation_acknowledged: true,
  });

  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [saveStatus, setSaveStatus] = React.useState<string | null>(null);
  const [shredModalOpen, setShredModalOpen] = React.useState<boolean>(false);
  const [isShredding, setIsShredding] = React.useState<boolean>(false);
  const [shredSuccess, setShredSuccess] = React.useState<boolean>(false);

  React.useEffect(() => {
    async function loadConsent() {
      try {
        const res = await fetch('/api/consent');
        if (res.ok) {
          const data = await res.json();
          if (data.consent) {
            setConsents(data.consent);
          }
        }
      } catch {
        // Fallback to default state in preview
      } finally {
        setIsLoading(false);
      }
    }
    loadConsent();
  }, []);

  async function updateToggle(key: string, value: boolean) {
    const updated = { ...consents, [key]: value };
    setConsents(updated);
    setSaveStatus('Saving changes...');

    try {
      const res = await fetch('/api/consent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toggles: { [key]: value },
          reason: value ? `USER_ENABLED_${key.toUpperCase()}` : `USER_REVOKED_${key.toUpperCase()}`,
        }),
      });

      if (res.ok) {
        setSaveStatus('Preferences saved to immutable ledger');
        setTimeout(() => setSaveStatus(null), 3000);
      } else {
        setSaveStatus('Failed to save preference');
      }
    } catch {
      setSaveStatus('Network error updating preference');
    }
  }

  async function handleCryptoShred() {
    setIsShredding(true);
    try {
      const res = await fetch('/api/consent/crypto-shred', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Student initiated cryptographic key erasure' }),
      });

      if (res.ok) {
        setShredSuccess(true);
        setShredModalOpen(false);
        setConsents({
          consent_surveys: false,
          consent_academic: false,
          consent_help_seeking: false,
          consent_counselor_triage: false,
          consent_journal_signals: false,
          emergency_escalation_acknowledged: false,
        });
      }
    } catch {
      // Ignored
    } finally {
      setIsShredding(false);
    }
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-8 px-4 py-8 sm:py-12">
      {/* Title */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="verified">Privacy Center</Badge>
          <span className="font-mono text-xs text-[var(--text-muted)]">
            DPDP Act 2023 Compliant
          </span>
          {saveStatus && (
            <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" /> {saveStatus}
            </span>
          )}
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          Granular Consent & Data Control Center
        </h1>
        <p className="max-w-2xl text-sm text-[var(--text-secondary)] sm:text-base">
          You are the sole owner of your data. Toggle off any feature at any time to instantly cease
          processing.
        </p>
      </div>

      {shredSuccess && (
        <div
          role="alert"
          className="space-y-1 rounded-xl border border-emerald-300 bg-emerald-50 p-4 text-sm text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200"
        >
          <div className="flex items-center gap-2 font-semibold">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Cryptographic Shredding Complete
          </div>
          <p className="text-xs">
            Your personal encryption keys have been physically destroyed. All encrypted reflections
            are now mathematically unrecoverable, and your consent toggles have been completely
            revoked.
          </p>
        </div>
      )}

      {/* Consent Toggles Card */}
      <Card>
        <CardHeader>
          <CardTitle>Independent Consent Toggles</CardTitle>
          <CardDescription>
            Each signal category requires your affirmative opt-in. There are no bundled permissions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Toggle 1: Surveys */}
          <div className="flex items-start justify-between gap-4 border-b border-neutral-100 pb-4 dark:border-neutral-800">
            <div className="space-y-1">
              <label
                htmlFor="consent-surveys"
                className="cursor-pointer text-sm font-semibold text-[var(--text-primary)]"
              >
                1. Voluntary Pulse Surveys
              </label>
              <p className="text-xs text-[var(--text-secondary)]">
                Allows Sahayak to evaluate your non-diagnostic weekly check-in reflections against
                your personal baseline.
              </p>
            </div>
            <Switch
              id="consent-surveys"
              checked={consents.consent_surveys}
              disabled={isLoading || shredSuccess}
              onCheckedChange={(checked) => updateToggle('consent_surveys', checked)}
            />
          </div>

          {/* Toggle 2: Academic */}
          <div className="flex items-start justify-between gap-4 border-b border-neutral-100 pb-4 dark:border-neutral-800">
            <div className="space-y-1">
              <label
                htmlFor="consent-academic"
                className="cursor-pointer text-sm font-semibold text-[var(--text-primary)]"
              >
                2. Academic Drift Indicators
              </label>
              <p className="text-xs text-[var(--text-secondary)]">
                Ingests submission delays and attendance variance to corroborate distress trends
                against your personal baseline.
              </p>
            </div>
            <Switch
              id="consent-academic"
              checked={consents.consent_academic}
              disabled={isLoading || shredSuccess}
              onCheckedChange={(checked) => updateToggle('consent_academic', checked)}
            />
          </div>

          {/* Toggle 3: Help-Seeking */}
          <div className="flex items-start justify-between gap-4 border-b border-neutral-100 pb-4 dark:border-neutral-800">
            <div className="space-y-1">
              <label
                htmlFor="consent-help-seeking"
                className="cursor-pointer text-sm font-semibold text-[var(--text-primary)]"
              >
                3. Help-Seeking Patterns
              </label>
              <p className="text-xs text-[var(--text-secondary)]">
                Recognizes abandoned counselor booking attempts and nocturnal crisis resource
                queries as corroborating signals.
              </p>
            </div>
            <Switch
              id="consent-help-seeking"
              checked={consents.consent_help_seeking}
              disabled={isLoading || shredSuccess}
              onCheckedChange={(checked) => updateToggle('consent_help_seeking', checked)}
            />
          </div>

          {/* Toggle 4: Counselor Triage */}
          <div className="flex items-start justify-between gap-4 border-b border-neutral-100 pb-4 dark:border-neutral-800">
            <div className="space-y-1">
              <label
                htmlFor="consent-counselor-triage"
                className="cursor-pointer text-sm font-semibold text-[var(--text-primary)]"
              >
                4. Counselor Check-in Suggestions
              </label>
              <p className="text-xs text-[var(--text-secondary)]">
                Allows campus counselors to see a tiered check-in suggestion if corroborated signals
                indicate Tier 2 or Tier 3 distress.
              </p>
            </div>
            <Switch
              id="consent-counselor-triage"
              checked={consents.consent_counselor_triage}
              disabled={isLoading || shredSuccess}
              onCheckedChange={(checked) => updateToggle('consent_counselor_triage', checked)}
            />
          </div>

          {/* Toggle 5: Journal Signals */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <label
                  htmlFor="consent-journal-signals"
                  className="cursor-pointer text-sm font-semibold text-[var(--text-primary)]"
                >
                  5. Private Journal Reflection Signals
                </label>
                <Badge variant="outline" className="text-[10px]">
                  Strictly Opt-In
                </Badge>
              </div>
              <p className="text-xs text-[var(--text-secondary)]">
                Default FALSE. Even when enabled, journal entries remain envelope-encrypted and
                never accessible to staff or third parties.
              </p>
            </div>
            <Switch
              id="consent-journal-signals"
              checked={consents.consent_journal_signals}
              disabled={isLoading || shredSuccess}
              onCheckedChange={(checked) => updateToggle('consent_journal_signals', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Sovereignty & Portability */}
      <div className="grid gap-6 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Download className="h-5 w-5 text-[var(--brand-primary)]" />
              <CardTitle className="text-base">Download Personal Archive</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Export a complete, portable copy of all your check-in history, consent audit events,
              and signals in JSON format.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <a
              href="/api/consent/export"
              download
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-neutral-300 bg-[var(--bg-surface)] px-4 text-sm font-semibold text-[var(--text-primary)] transition-colors hover:bg-[var(--bg-muted)] dark:border-neutral-700"
            >
              <Download className="h-4 w-4" /> Download JSON Archive
            </a>
          </CardFooter>
        </Card>

        <Card className="border-red-200 dark:border-red-950/60">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
              <CardTitle className="text-base text-red-700 dark:text-red-400">
                Cryptographic Shredding
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Permanently destroy your personal Data Encryption Key (DEK). All stored encrypted
              journals become instantly and permanently unrecoverable.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button
              variant="destructive"
              className="w-full gap-2"
              disabled={shredSuccess}
              onClick={() => setShredModalOpen(true)}
            >
              <Trash2 className="h-4 w-4" /> Delete My Data (Crypto-Shred)
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Confirmation Dialog for Crypto-Shredding */}
      <Dialog open={shredModalOpen} onOpenChange={setShredModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader className="space-y-2">
            <div className="flex items-center gap-2 font-bold text-red-600 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
              <DialogTitle>Confirm Cryptographic Shredding</DialogTitle>
            </div>
            <DialogDescription className="space-y-2 text-xs leading-relaxed text-[var(--text-secondary)]">
              <p>
                This action is <strong>physically irreversible</strong>.
              </p>
              <p>
                Sahayak will purge your personal encryption key from the database. Because all your
                private journals and sensitive reflections are envelope-encrypted with AES-256-GCM,
                destroying this key makes them mathematically impossible to decrypt by
                anyone—including system administrators.
              </p>
              <p>
                All consent toggles will immediately be revoked, and an audit record will confirm
                your right-to-be-forgotten execution.
              </p>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 pt-4 sm:gap-0">
            <Button variant="outline" onClick={() => setShredModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={isShredding}
              onClick={handleCryptoShred}
              className="gap-2"
            >
              {isShredding ? 'Shredding Keys...' : 'Permanently Shred My Keys'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
