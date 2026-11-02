'use client';

// TODO(M1-AUTH): Integrate counselor role authentication guard
// TODO(M4-CASES): Connect live triage queue and feedback engine
import * as React from 'react';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TierBadge } from '@/components/shared/TierBadge';

export default function CounselorDashboardPage() {
  // Demo suggested check-in records for staff review
  const demoCases = [
    {
      id: 'case_a4f9_tier3',
      pseudoId: 'ps_7f9b8c2d1e0a4f5b',
      tier: 'TIER_3' as const,
      triggerDate: '2026-11-02 08:30 IST',
      corroboration: 'Survey stress +3.1σ corroborated by 3 missed submissions and nocturnal portal visits',
      confidence: 88,
      status: 'OPEN',
    },
    {
      id: 'case_c8e2_tier2',
      pseudoId: 'ps_3a1b4c5d9e8f7a6b',
      tier: 'TIER_2' as const,
      triggerDate: '2026-11-01 16:15 IST',
      corroboration: 'Survey fatigue +2.2σ corroborated by abandoned counselor booking attempts',
      confidence: 76,
      status: 'OPEN',
    },
    {
      id: 'case_e1d4_tier1',
      pseudoId: 'ps_9e8d7c6b5a4f3e2d',
      tier: 'TIER_1' as const,
      triggerDate: '2026-10-31 11:20 IST',
      corroboration: 'Single-signal academic drift (exam week). Capped at Tier 1 per corroboration rule.',
      confidence: 64,
      status: 'WATCH_ONLY',
    },
  ];

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 sm:py-12 space-y-8">
      {/* Title */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="warning">Counselor Workspace</Badge>
          <span className="text-xs text-[var(--text-muted)] font-mono">Milestone 4 Preview</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          Suggested Check-in Triage Queue
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-3xl">
          Authorized psychological staff triage queue. Surfaces consented students with corroborated multi-vector distress signals. The system suggests; human counselors decide outreach.
        </p>
      </div>

      {/* Case Table / Stream */}
      <div className="space-y-4">
        {demoCases.map((item) => (
          <Card key={item.id} className="hover:border-neutral-300 dark:hover:border-neutral-700 transition-all">
            <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2.5">
                  <TierBadge tier={item.tier} size="md" />
                  <span className="text-xs font-mono text-[var(--text-muted)] bg-[var(--bg-muted)] px-2 py-0.5 rounded-md">
                    ID: {item.pseudoId.slice(0, 12)}...
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">{item.triggerDate}</span>
                  <Badge variant="outline" className="text-[10px]">
                    Confidence: {item.confidence}%
                  </Badge>
                </div>
                <p className="text-sm text-[var(--text-primary)] leading-relaxed">
                  {item.corroboration}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end">
                <Button asChild variant="default" size="sm" className="gap-1.5">
                  <Link href={`/counselor/cases/${item.id}`}>
                    <Eye className="w-4 h-4" />
                    <span>Review Case</span>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
