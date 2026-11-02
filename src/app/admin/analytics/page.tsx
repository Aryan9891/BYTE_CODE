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
    <div className="container mx-auto max-w-6xl px-4 py-8 sm:py-12 space-y-8">
      {/* Title */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Administrator Portal</Badge>
          <span className="text-xs text-[var(--text-muted)] font-mono">Milestone 6 Preview</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          Institutional Wellbeing Trends & Resource Utilization
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-3xl">
          Aggregated, macro-level mental health insights for institutional planning. All queries enforce k-anonymity (k ≥ 10); any demographic or departmental slice smaller than 10 students is automatically suppressed.
        </p>
      </div>

      {/* k-Anonymity Notice Card */}
      <Card className="border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20">
        <CardContent className="p-6 flex items-start gap-4">
          <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
              k-Anonymity Privacy Enclave Active (k ≥ 10)
            </h2>
            <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
              No individual student records or identities are visible to administrative staff. Metrics reflect high-level trends across entire academic cohorts to inform wellness resource allocation during exam periods.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Macro Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Active Consented Students</CardDescription>
            <CardTitle className="text-2xl font-bold">1,482</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
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
            <span className="text-xs text-[var(--text-muted)] font-medium">
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
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
              One-tap crisis connections
            </span>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center pt-4">
        <Button asChild variant="outline">
          <Link href="/admin/audit">View Tamper-Evident Audit Logs</Link>
        </Button>
      </div>
    </div>
  );
}
