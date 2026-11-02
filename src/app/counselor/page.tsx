'use client';

import * as React from 'react';
import Link from 'next/link';
import { Eye, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TierBadge } from '@/components/shared/TierBadge';

export interface TriageCase {
  id: string;
  student_pseudo_id: string;
  tier: 'TIER_0' | 'TIER_1' | 'TIER_2' | 'TIER_3';
  confidence_score: number;
  plain_language_reasons: string[];
  corroboration_details: Record<string, unknown>;
  status: string;
  opened_at: string;
  feedback?: {
    rating: string;
    notes?: string;
    submitted_at: string;
  } | null;
}

export default function CounselorDashboardPage() {
  const [cases, setCases] = React.useState<TriageCase[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchCases = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/counselor/cases');
      if (!res.ok) {
        throw new Error(`Failed to load triage cases (${res.status})`);
      }
      const data = await res.json();
      if (data.success && Array.isArray(data.cases)) {
        setCases(data.cases);
      } else {
        setCases([]);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Network error loading cases';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void fetchCases();
  }, [fetchCases]);

  return (
    <div className="container mx-auto max-w-6xl space-y-8 px-4 py-8 sm:py-12">
      {/* Title & Governance Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Badge variant="warning">Counselor Workspace</Badge>
          <span className="font-mono text-xs text-[var(--text-muted)]">Triage Queue</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          Suggested Check-in Triage Queue
        </h1>
        <p className="max-w-3xl text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
          Authorized psychological staff workspace. Surfaces consented students with corroborated
          multi-vector distress signals. The system suggests; human counselors decide outreach.
        </p>

        {/* Ethical Governance Notice */}
        <div className="flex items-start gap-2.5 rounded-xl border border-sky-200 bg-sky-50/40 p-3.5 text-xs text-[var(--text-secondary)] sm:text-sm dark:border-sky-900/60 dark:bg-sky-950/20">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-sky-600 dark:text-sky-400" />
          <div>
            <strong className="font-semibold text-[var(--text-primary)]">
              Zero-Diagnosis Invariant:
            </strong>{' '}
            All suggestions represent mathematical baseline deviations from voluntary signals, never
            psychiatric diagnoses. Student real identities remain cryptographically masked until
            explicit, audited outreach authorization.
          </div>
        </div>
      </div>

      {/* Action / Refresh bar */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-[var(--text-muted)]">
          {cases.length} active suggested check-in{cases.length === 1 ? '' : 's'} in queue
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => void fetchCases()}
          disabled={loading}
          className="h-8 gap-1.5 text-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Case Stream */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <Card key={n} className="animate-pulse">
              <CardContent className="h-28 rounded-xl bg-[var(--bg-muted)]/50 p-6" />
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="border-red-200 dark:border-red-900/50">
          <CardContent className="space-y-2 p-6 text-center">
            <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
            <Button size="sm" variant="outline" onClick={() => void fetchCases()}>
              Retry
            </Button>
          </CardContent>
        </Card>
      ) : cases.length === 0 ? (
        <Card>
          <CardContent className="space-y-3 p-12 text-center">
            <Sparkles className="mx-auto h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)]">Triage Queue Clear</h3>
            <p className="mx-auto max-w-md text-xs text-[var(--text-muted)] sm:text-sm">
              No active student distress alerts requiring counselor review at this time. All passive
              signals and check-ins are within expected personal baselines.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {cases.map((item) => (
            <Card
              key={item.id}
              className="transition-all hover:border-neutral-300 dark:hover:border-neutral-700"
            >
              <CardContent className="flex flex-col items-start justify-between gap-4 p-6 md:flex-row md:items-center">
                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <TierBadge tier={item.tier} size="md" />
                    <span className="rounded-md bg-[var(--bg-muted)] px-2 py-0.5 font-mono text-xs text-[var(--text-muted)]">
                      ID: {item.student_pseudo_id.slice(0, 14)}...
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">
                      Opened: {new Date(item.opened_at).toLocaleDateString()}
                    </span>
                    <Badge variant="outline" className="text-[10px]">
                      Confidence: {item.confidence_score}%
                    </Badge>
                    {item.feedback && (
                      <Badge variant="verified" className="text-[10px]">
                        Feedback: {item.feedback.rating.replace(/_/g, ' ')}
                      </Badge>
                    )}
                  </div>

                  <div className="space-y-1">
                    {item.plain_language_reasons.map((reason, idx) => (
                      <p key={idx} className="text-sm leading-relaxed text-[var(--text-primary)]">
                        • {reason}
                      </p>
                    ))}
                  </div>
                </div>

                <div className="flex w-full shrink-0 items-center justify-end gap-2 md:w-auto">
                  <Button asChild variant="default" size="sm" className="gap-1.5">
                    <Link href={`/counselor/cases/${item.id}`}>
                      <Eye className="h-4 w-4" />
                      <span>Review Case</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
