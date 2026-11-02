'use client';

// TODO(M1-AUTH): Integrate counselor role guard
// TODO(M4-CASES): Integrate live audited identity unmasking and feedback rating
import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, UserCheck, ThumbsUp, ThumbsDown, Lock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { TierBadge } from '@/components/shared/TierBadge';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/Dialog';
import { Input } from '@/components/ui/Input';

export default function CaseDetailPage({ params: _params }: { params: Promise<{ id: string }> }) {
  const [unmasked, setUnmasked] = React.useState(false);
  const [reason, setReason] = React.useState('');
  const [feedback, setFeedback] = React.useState<string | null>(null);

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 sm:py-12 space-y-8">
      <div>
        <Link
          href="/counselor"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Counselor Queue
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <TierBadge tier="TIER_3" size="lg" />
            <span className="text-xs font-mono text-[var(--text-muted)] bg-[var(--bg-muted)] px-2.5 py-1 rounded-md">
              ps_7f9b8c2d1e0a4f5b
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">
            Suggested Check-in Review
          </h1>
        </div>

        {/* Feedback Widget */}
        <div className="flex items-center gap-2 bg-[var(--bg-muted)] p-2 rounded-xl border border-neutral-200 dark:border-neutral-800">
          <span className="text-xs text-[var(--text-muted)] font-medium mr-1">Alert Quality:</span>
          <Button
            size="sm"
            variant={feedback === 'useful' ? 'default' : 'ghost'}
            className="h-8 px-2.5 text-xs gap-1"
            onClick={() => setFeedback('useful')}
          >
            <ThumbsUp className="w-3.5 h-3.5" /> Actionable
          </Button>
          <Button
            size="sm"
            variant={feedback === 'noise' ? 'secondary' : 'ghost'}
            className="h-8 px-2.5 text-xs gap-1"
            onClick={() => setFeedback('noise')}
          >
            <ThumbsDown className="w-3.5 h-3.5" /> False Alarm
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
          <div className="p-4 rounded-xl bg-[var(--bg-muted)] space-y-2 text-sm">
            <p className="font-semibold text-[var(--text-primary)]">
              Multi-Domain Signals Observed:
            </p>
            <ul className="list-disc list-inside space-y-1 text-[var(--text-secondary)] text-xs sm:text-sm">
              <li>
                <strong>Survey Vector:</strong> Self-reported exhaustion score elevated (+3.1σ vs personal 30-day baseline).
              </li>
              <li>
                <strong>Academic Drift:</strong> 3 consecutive assignments submitted past deadline; attendance dropped 22% in last 10 days.
              </li>
              <li>
                <strong>Help-Seeking Behavior:</strong> 2 abandoned counselor appointment booking attempts and repeated midnight resource views.
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Identity Unmasking Dialog & Outreach */}
      <Card className="border-amber-200 dark:border-amber-900/60 bg-amber-50/20 dark:bg-amber-950/10">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-600" /> Student Identity & Outreach Channel
          </CardTitle>
          <CardDescription className="text-xs">
            Student identity is cryptographically masked by default. Revealing contact details is logged in the permanent tamper-evident audit trail.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {unmasked ? (
            <div className="p-4 rounded-xl bg-white dark:bg-neutral-900 border border-emerald-300 dark:border-emerald-800 space-y-2 text-sm">
              <Badge variant="verified">Identity Unmasked & Logged</Badge>
              <p><strong>Student Name:</strong> Ananya Sharma (Demo Synthetic Profile)</p>
              <p><strong>Campus Email:</strong> ananya.s@campus.edu</p>
              <p><strong>Department:</strong> Computer Science (Year 3)</p>
              <p className="text-xs text-[var(--text-muted)] pt-2 border-t">
                Audit Record Created: SHA-256 chained log entry #84920
              </p>
            </div>
          ) : (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="default" className="gap-2">
                  <UserCheck className="w-4 h-4" /> Request Student Contact Info (Audited)
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Legitimate Care Outreach</DialogTitle>
                  <DialogDescription>
                    Per institutional ethics policy, revealing a student&apos;s identity requires documenting a supportive care purpose. This action is permanently recorded in the immutable audit log.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3 py-2">
                  <label htmlFor="outreach-reason" className="text-xs font-semibold text-[var(--text-primary)]">
                    Care Outreach Purpose:
                  </label>
                  <Input
                    id="outreach-reason"
                    placeholder="e.g. Reaching out with gentle wellness check-in invitation"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  />
                </div>
                <DialogFooter>
                  <Button
                    variant="default"
                    disabled={!reason.trim()}
                    onClick={() => setUnmasked(true)}
                  >
                    Confirm & Record in Audit Log
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
