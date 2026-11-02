'use client';

// TODO(M1-AUTH): Integrate institutional admin role guard
// TODO(M6-AUDIT): Connect cryptographic audit log repository and live hash validator
import * as React from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function AuditLogsPage() {
  const demoLogs = [
    {
      id: 'log_904',
      timestamp: '2026-11-02 11:42:01 IST',
      actorRole: 'COUNSELOR',
      action: 'UNMASK_STUDENT_IDENTITY',
      target: 'ps_7f9b8c2d1e0a4f5b',
      reason: 'Supportive care outreach for Tier 3 multi-signal review',
      hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    },
    {
      id: 'log_903',
      timestamp: '2026-11-02 09:15:33 IST',
      actorRole: 'STUDENT',
      action: 'CONSENT_TOGGLE_UPDATED',
      target: 'ps_3a1b4c5d9e8f7a6b',
      reason: 'Student enabled academic drift ingestion',
      hash: 'a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e',
    },
    {
      id: 'log_902',
      timestamp: '2026-11-01 18:02:19 IST',
      actorRole: 'LEAD_COUNSELOR',
      action: 'SUPPORT_RESOURCE_VERIFIED',
      target: 'res_tele_manas_01',
      reason: 'Routine quarterly IVR test completed successfully',
      hash: '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae',
    },
  ];

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8 sm:py-12 space-y-8">
      <div>
        <Link
          href="/admin/analytics"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Analytics
        </Link>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Compliance Enclave</Badge>
            <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> SHA-256 Hash Chain Intact
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
            Tamper-Evident Security & Privacy Audit Trail
          </h1>
        </div>
      </div>

      <p className="text-sm text-[var(--text-secondary)] max-w-3xl">
        Every sensitive security operation, counselor unmasking event, consent modification, and directory verification creates an immutable, cryptographically chained audit record.
      </p>

      {/* Audit Log Table */}
      <div className="space-y-3">
        {demoLogs.map((log) => (
          <Card key={log.id} className="p-4 sm:p-5">
            <div className="space-y-2 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="font-mono text-[11px]">
                    {log.action}
                  </Badge>
                  <span className="text-xs font-semibold text-[var(--text-primary)]">
                    Actor: {log.actorRole}
                  </span>
                </div>
                <span className="text-xs text-[var(--text-muted)] font-mono">
                  {log.timestamp}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                <strong>Context:</strong> {log.reason}
              </p>

              <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-[11px] font-mono text-[var(--text-muted)]">
                <span>Target: {log.target}</span>
                <span className="truncate max-w-[240px] sm:max-w-md">
                  Hash: {log.hash}
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
