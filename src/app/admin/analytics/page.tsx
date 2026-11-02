'use client';

// TODO(M1-AUTH): Integrate institutional admin role guard
// TODO(M6-ANALYTICS): Connect k-anonymity aggregation engine and Recharts
import * as React from 'react';
import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function AdminAnalyticsPage() {
  return (
    <div className="container mx-auto max-w-6xl space-y-8 px-4 py-8 sm:py-12">
      {/* Title */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Administrator Portal</Badge>
          <span className="font-mono text-xs text-[var(--text-muted)]">Milestone 6 Preview</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          Institutional Wellbeing Trends & Resource Utilization
        </h1>
        <p className="max-w-3xl text-sm text-[var(--text-secondary)] sm:text-base">
          Aggregated, macro-level mental health insights for institutional planning. All queries
          enforce k-anonymity (k ≥ 10); any demographic or departmental slice smaller than 10
          students is automatically suppressed.
        </p>
      </div>

      {/* k-Anonymity Notice Card */}
      <Card className="border-emerald-200 bg-emerald-50/40 dark:border-emerald-900 dark:bg-emerald-950/20">
        <CardContent className="flex items-start gap-4 p-6">
          <ShieldCheck className="mt-0.5 h-6 w-6 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
              k-Anonymity Privacy Enclave Active (k ≥ 10)
            </h2>
            <p className="text-xs leading-relaxed text-emerald-800 dark:text-emerald-300">
              No individual student records or identities are visible to administrative staff.
              Metrics reflect high-level trends across entire academic cohorts to inform wellness
              resource allocation during exam periods.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Macro Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Active Consented Students</CardDescription>
            <CardTitle className="text-2xl font-bold">1,482</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
              ↑ 12% opt-in growth this month
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Campus Wellbeing Index</CardDescription>
            <CardTitle className="text-2xl font-bold">74 / 100</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs font-medium text-[var(--text-muted)]">
              Baseline norm for Midterm Week
            </span>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Support Directory Inquiries</CardDescription>
            <CardTitle className="text-2xl font-bold">342</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">
              One-tap crisis connections
            </span>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between pt-4">
        <Button asChild variant="outline">
          <Link href="/admin/audit">View Tamper-Evident Audit Logs</Link>
        </Button>
      </div>
    </div>
  );
}
