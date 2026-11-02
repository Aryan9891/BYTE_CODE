'use client';

// TODO(M1-AUTH): Connect live user consent database records and data scrubbing API
import * as React from 'react';
import { Trash2, Download } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

export default function PrivacySettingsPage() {
  const [consents, setConsents] = React.useState({
    surveys: true,
    academic: false,
    helpSeeking: true,
    counselorTriage: false,
    journalSignals: false,
  });

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 sm:py-12 space-y-8">
      {/* Title */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="verified">Privacy Center</Badge>
          <span className="text-xs text-[var(--text-muted)] font-mono">Milestone 1 Preview</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          Granular Consent & Data Control Center
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl">
          You are the sole owner of your data under the DPDP Act 2023. Toggle off any feature at any time to instantly cease processing and scrub records.
        </p>
      </div>

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
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-neutral-100 dark:border-neutral-800">
            <div className="space-y-1">
              <label htmlFor="consent-surveys" className="text-sm font-semibold text-[var(--text-primary)] cursor-pointer">
                1. Voluntary Pulse Surveys
              </label>
              <p className="text-xs text-[var(--text-secondary)]">
                Allows Sahayak to store and evaluate your non-diagnostic weekly check-in reflections against your personal baseline.
              </p>
            </div>
            <Switch
              id="consent-surveys"
              checked={consents.surveys}
              onCheckedChange={(checked) => setConsents({ ...consents, surveys: checked })}
            />
          </div>

          {/* Toggle 2: Academic */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-neutral-100 dark:border-neutral-800">
            <div className="space-y-1">
              <label htmlFor="consent-academic" className="text-sm font-semibold text-[var(--text-primary)] cursor-pointer">
                2. Academic Drift Indicators
              </label>
              <p className="text-xs text-[var(--text-secondary)]">
                Ingests submission delays and attendance variance to corroborate distress trends against your personal baseline.
              </p>
            </div>
            <Switch
              id="consent-academic"
              checked={consents.academic}
              onCheckedChange={(checked) => setConsents({ ...consents, academic: checked })}
            />
          </div>

          {/* Toggle 3: Help-Seeking */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-neutral-100 dark:border-neutral-800">
            <div className="space-y-1">
              <label htmlFor="consent-help-seeking" className="text-sm font-semibold text-[var(--text-primary)] cursor-pointer">
                3. Help-Seeking Patterns
              </label>
              <p className="text-xs text-[var(--text-secondary)]">
                Recognizes abandoned counselor booking attempts and nocturnal crisis resource queries as corroborating signals.
              </p>
            </div>
            <Switch
              id="consent-help-seeking"
              checked={consents.helpSeeking}
              onCheckedChange={(checked) => setConsents({ ...consents, helpSeeking: checked })}
            />
          </div>

          {/* Toggle 4: Counselor Triage */}
          <div className="flex items-start justify-between gap-4 pb-4 border-b border-neutral-100 dark:border-neutral-800">
            <div className="space-y-1">
              <label htmlFor="consent-counselor-triage" className="text-sm font-semibold text-[var(--text-primary)] cursor-pointer">
                4. Counselor Check-in Suggestions
              </label>
              <p className="text-xs text-[var(--text-secondary)]">
                Allows the system to surface a pseudonymous check-in suggestion in the counselor triage queue when Tier 2 or 3 is corroborated.
              </p>
            </div>
            <Switch
              id="consent-counselor-triage"
              checked={consents.counselorTriage}
              onCheckedChange={(checked) => setConsents({ ...consents, counselorTriage: checked })}
            />
          </div>

          {/* Toggle 5: Journal Signals (Default OFF) */}
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <label htmlFor="consent-journal-signals" className="text-sm font-semibold text-[var(--text-primary)] cursor-pointer">
                5. Journal Text Analysis (Strictly Default OFF)
              </label>
              <p className="text-xs text-[var(--text-secondary)]">
                By default, your private journal is completely isolated from the risk engine. Toggle on ONLY if you explicitly want AI reflection prompts.
              </p>
            </div>
            <Switch
              id="consent-journal-signals"
              checked={consents.journalSignals}
              onCheckedChange={(checked) => setConsents({ ...consents, journalSignals: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Data Export & Danger Zone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Download className="w-4 h-4 text-[var(--brand-primary)]" /> Export My Data Archive
            </CardTitle>
            <CardDescription className="text-xs">
              Download a machine-readable JSON archive of all survey submissions, pseudonym records, and journal entries.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full">
              Export Data (JSON)
            </Button>
          </CardFooter>
        </Card>

        {/* Delete All Danger Zone */}
        <Card className="border-red-200 dark:border-red-900/60 bg-red-50/30 dark:bg-red-950/20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-red-800 dark:text-red-300">
              <Trash2 className="w-4 h-4 text-red-600" /> Irrevocable Data Erasure
            </CardTitle>
            <CardDescription className="text-xs text-red-900/70 dark:text-red-300/70">
              Permanently purges all surveys, telemetry, pseudonymous tokens, and private journals. This action cannot be reversed.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="destructive" size="sm" className="w-full">
              Delete All My Data
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
