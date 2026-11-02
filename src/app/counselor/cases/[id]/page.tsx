'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  UserCheck,
  ThumbsUp,
  ThumbsDown,
  Lock,
  ShieldCheck,
  AlertCircle,
  Clock,
  Info,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
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

interface CaseDetail {
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

interface UnmaskedIdentity {
  student_pseudo_id: string;
  full_name: string;
  email: string;
  department: string | null;
  cohort_year: string | null;
  unmasked_at: string;
  unmasked_by: string;
  audit_entry_id: string;
}

export default function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [caseId, setCaseId] = React.useState<string>('');
  const [caseData, setCaseData] = React.useState<CaseDetail | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Unmasking state
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [reason, setReason] = React.useState('');
  const [unmasking, setUnmasking] = React.useState(false);
  const [unmaskError, setUnmaskError] = React.useState<string | null>(null);
  const [unmasked, setUnmasked] = React.useState<UnmaskedIdentity | null>(null);

  // Feedback state
  const [submittingFeedback, setSubmittingFeedback] = React.useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = React.useState<string | null>(null);

  // Resolve params
  React.useEffect(() => {
    void params.then((p) => setCaseId(p.id));
  }, [params]);

  // Fetch case detail
  const fetchCase = React.useCallback(async (id: string) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/counselor/cases/${id}`);
      if (!res.ok) {
        throw new Error(`Failed to load case (${res.status})`);
      }
      const data = await res.json();
      if (data.success && data.case) {
        setCaseData(data.case);
      } else {
        throw new Error('Case not found');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error loading case';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (caseId) {
      void fetchCase(caseId);
    }
  }, [caseId, fetchCase]);

  // Handle unmasking
  const handleUnmask = async () => {
    if (!caseId || reason.trim().length < 10) return;
    setUnmasking(true);
    setUnmaskError(null);
    try {
      const res = await fetch(`/api/counselor/cases/${caseId}/unmask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: reason.trim() }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Identity unmasking request rejected');
      }
      setUnmasked(data.unmasked);
      setDialogOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unmasking failed';
      setUnmaskError(msg);
    } finally {
      setUnmasking(false);
    }
  };

  // Handle alert quality feedback
  const handleFeedback = async (rating: 'APPROPRIATE_TIMELY' | 'FALSE_ALARM_NOISE') => {
    if (!caseId || submittingFeedback) return;
    setSubmittingFeedback(true);
    setFeedbackSuccess(null);
    try {
      const res = await fetch(`/api/counselor/cases/${caseId}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit feedback');
      }
      setFeedbackSuccess(rating === 'APPROPRIATE_TIMELY' ? 'Actionable' : 'False Alarm');
      if (caseData) {
        setCaseData({
          ...caseData,
          feedback: {
            rating,
            submitted_at: new Date().toISOString(),
          },
        });
      }
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl animate-pulse space-y-6 px-4 py-8 sm:py-12">
        <div className="h-6 w-36 rounded-md bg-[var(--bg-muted)]" />
        <div className="h-10 w-3/4 rounded-md bg-[var(--bg-muted)]" />
        <div className="h-48 rounded-xl bg-[var(--bg-muted)]" />
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="container mx-auto max-w-4xl space-y-6 px-4 py-8 sm:py-12">
        <Link
          href="/counselor"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Counselor Queue
        </Link>
        <Card className="border-red-200 dark:border-red-900/50">
          <CardContent className="space-y-3 p-8 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-red-600 dark:text-red-400" />
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">
              {error || 'Case Not Found'}
            </h2>
            <p className="text-xs text-[var(--text-muted)] sm:text-sm">
              The requested triage case could not be retrieved from the database.
            </p>
            <Button size="sm" variant="outline" asChild>
              <Link href="/counselor">Return to Queue</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentFeedback = feedbackSuccess || (caseData.feedback ? caseData.feedback.rating : null);

  return (
    <div className="container mx-auto max-w-4xl space-y-8 px-4 py-8 sm:py-12">
      {/* Back button */}
      <div>
        <Link
          href="/counselor"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Counselor Queue
        </Link>
      </div>

      {/* Case Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <TierBadge tier={caseData.tier} size="lg" />
            <span className="rounded-md bg-[var(--bg-muted)] px-2.5 py-1 font-mono text-xs text-[var(--text-muted)]">
              {caseData.student_pseudo_id}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Suggested Check-in Review
          </h1>
          <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" /> Opened:{' '}
              {new Date(caseData.opened_at).toLocaleString()}
            </span>
            <span>•</span>
            <Badge variant="outline" className="text-[10px]">
              Confidence: {caseData.confidence_score}%
            </Badge>
          </div>
        </div>

        {/* Alert Quality Feedback Widget */}
        <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-[var(--bg-muted)] p-2 dark:border-neutral-800">
          <span className="mr-1 text-xs font-medium text-[var(--text-muted)]">Alert Quality:</span>
          <Button
            size="sm"
            variant={
              currentFeedback === 'APPROPRIATE_TIMELY' || currentFeedback === 'Actionable'
                ? 'default'
                : 'ghost'
            }
            className="h-8 gap-1 px-2.5 text-xs"
            disabled={submittingFeedback}
            onClick={() => void handleFeedback('APPROPRIATE_TIMELY')}
          >
            <ThumbsUp className="h-3.5 w-3.5" /> Actionable
          </Button>
          <Button
            size="sm"
            variant={
              currentFeedback === 'FALSE_ALARM_NOISE' || currentFeedback === 'False Alarm'
                ? 'secondary'
                : 'ghost'
            }
            className="h-8 gap-1 px-2.5 text-xs"
            disabled={submittingFeedback}
            onClick={() => void handleFeedback('FALSE_ALARM_NOISE')}
          >
            <ThumbsDown className="h-3.5 w-3.5" /> False Alarm
          </Button>
        </div>
      </div>

      {/* Signal Corroboration Card */}
      <Card>
        <CardHeader>
          <CardTitle>Plain-Language Signal Corroboration</CardTitle>
          <CardDescription>
            Deterministic breakdown of personal baseline shifts across independent dimensions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2 rounded-xl bg-[var(--bg-muted)] p-4 text-sm">
            <p className="font-semibold text-[var(--text-primary)]">
              Multi-Domain Signals Observed:
            </p>
            {caseData.plain_language_reasons && caseData.plain_language_reasons.length > 0 ? (
              <ul className="list-inside list-disc space-y-1.5 text-xs text-[var(--text-secondary)] sm:text-sm">
                {caseData.plain_language_reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-[var(--text-muted)] italic">
                Signals consistent with personal baseline.
              </p>
            )}
          </div>

          <div className="flex items-start gap-2 rounded-xl border border-neutral-200 bg-[var(--bg-surface)] p-3.5 text-xs text-[var(--text-muted)] dark:border-neutral-800">
            <Info className="mt-0.5 h-4 w-4 shrink-0 text-[var(--text-muted)]" />
            <span>
              <strong>Clinical Guardrail:</strong> Signals detect relative drift from the
              student&apos;s own rolling baseline. They do not constitute a medical or clinical
              psychiatric assessment.
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Identity Unmasking Dialog & Outreach Card */}
      <Card className="border-amber-200 bg-amber-50/20 dark:border-amber-900/60 dark:bg-amber-950/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Lock className="h-4 w-4 text-amber-600 dark:text-amber-400" /> Student Identity &
            Outreach Channel
          </CardTitle>
          <CardDescription className="text-xs">
            Student identity is cryptographically masked by default. Revealing contact details is
            gated by student consent, Tier 2/3 status, and is logged in the permanent tamper-evident
            audit trail.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {unmasked ? (
            <div className="space-y-3 rounded-xl border border-emerald-300 bg-white p-5 text-sm dark:border-emerald-800 dark:bg-neutral-900">
              <div className="flex items-center gap-2">
                <Badge variant="verified">Identity Unmasked & Logged</Badge>
                <span className="text-xs text-[var(--text-muted)]">
                  Authorized at {new Date(unmasked.unmasked_at).toLocaleTimeString()}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2 sm:text-sm">
                <p>
                  <strong>Student Name:</strong> {unmasked.full_name}
                </p>
                <p>
                  <strong>Campus Email:</strong> {unmasked.email}
                </p>
                <p>
                  <strong>Department:</strong> {unmasked.department || 'General'}
                </p>
                <p>
                  <strong>Cohort Year:</strong> {unmasked.cohort_year || 'Undergraduate'}
                </p>
              </div>
              <div className="flex items-center gap-1.5 border-t border-neutral-200 pt-3 text-xs text-[var(--text-muted)] dark:border-neutral-800">
                <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>
                  Audit Record Created: Chained log entry #{unmasked.audit_entry_id} (Immutable)
                </span>
              </div>
            </div>
          ) : (
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="default" className="gap-2">
                  <UserCheck className="h-4 w-4" /> Request Student Contact Info (Audited)
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Legitimate Care Outreach</DialogTitle>
                  <DialogDescription>
                    Per institutional ethics policy, revealing a student&apos;s identity requires
                    documenting a supportive care purpose. This action is permanently recorded in
                    the immutable audit log.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-3 py-2">
                  <label
                    htmlFor="outreach-reason"
                    className="block text-xs font-semibold text-[var(--text-primary)]"
                  >
                    Clinical Care Justification (Minimum 10 characters):
                  </label>
                  <textarea
                    id="outreach-reason"
                    rows={3}
                    placeholder="e.g., Reaching out with gentle wellness check-in invitation per Tier 3 distress protocol"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full rounded-md border border-neutral-300 bg-white p-2.5 text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--focus-ring)] focus:outline-none dark:border-neutral-700 dark:bg-neutral-900"
                  />
                  <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                    <span>
                      {reason.trim().length >= 10 ? (
                        <span className="font-medium text-emerald-600 dark:text-emerald-400">
                          ✓ Requirement met ({reason.trim().length} chars)
                        </span>
                      ) : (
                        <span>{reason.trim().length} / 10 characters minimum</span>
                      )}
                    </span>
                    <span>Required for audit accountability</span>
                  </div>

                  {unmaskError && (
                    <div className="flex items-start gap-1.5 rounded-lg border border-red-200 bg-red-50 p-2.5 text-xs text-red-600 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
                      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>{unmaskError}</span>
                    </div>
                  )}
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDialogOpen(false);
                      setUnmaskError(null);
                    }}
                    disabled={unmasking}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="default"
                    disabled={reason.trim().length < 10 || unmasking}
                    onClick={() => void handleUnmask()}
                  >
                    {unmasking
                      ? 'Recording Audit & Decrypting...'
                      : 'Confirm & Record in Audit Log'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
