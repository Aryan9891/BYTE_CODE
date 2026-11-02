'use client';

// TODO(M5-SUPPORT): Connect dynamic verified directory CMS and real-time filters
import * as React from 'react';
import { PhoneCall, Clock, Globe } from 'lucide-react';
import supportSnapshot from '@/data/support-snapshot.json';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function SupportDirectoryPage() {
  const [selectedRegion, setSelectedRegion] = React.useState<string>('ALL');

  const filtered =
    selectedRegion === 'ALL'
      ? supportSnapshot
      : supportSnapshot.filter((r) => r.region_code === selectedRegion || r.region_code === 'IN');

  return (
    <div className="container mx-auto max-w-5xl space-y-8 px-4 py-8 sm:py-12">
      {/* Title */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="verified">Verified Support Directory</Badge>
          <span className="font-mono text-xs text-[var(--text-muted)]">Milestone 5 Data Layer</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          Campus, National & Regional Support Directory
        </h1>
        <p className="max-w-2xl text-sm text-[var(--text-secondary)] sm:text-base">
          All listings are verified on a strict 90-day cycle by campus psychological staff. Dial
          directly or reach out confidentially.
        </p>
      </div>

      {/* Region Filter Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-2 text-xs font-semibold text-[var(--text-muted)]">Filter Region:</span>
        {['ALL', 'CAMPUS', 'IN', 'US'].map((region) => (
          <Button
            key={region}
            variant={selectedRegion === region ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedRegion(region)}
          >
            {region === 'ALL'
              ? 'All Regions'
              : region === 'CAMPUS'
                ? 'On-Campus Desk'
                : region === 'IN'
                  ? 'India (National)'
                  : 'International / US'}
          </Button>
        ))}
      </div>

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {filtered.map((res) => (
          <Card key={res.id} className="flex flex-col justify-between">
            <CardHeader>
              <div className="mb-1 flex items-center justify-between gap-2">
                <Badge variant={res.is_crisis_priority ? 'destructive' : 'secondary'}>
                  {res.category.replace('_', ' ')}
                </Badge>
                <span className="text-[11px] font-medium text-amber-700 dark:text-amber-400">
                  VERIFY BEFORE LAUNCH
                </span>
              </div>
              <CardTitle className="text-lg">{res.name}</CardTitle>
              <CardDescription className="line-clamp-2 text-xs">{res.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="space-y-1.5 text-xs text-[var(--text-secondary)]">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" />
                  <span>{res.operating_hours}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Globe className="h-3.5 w-3.5 shrink-0 text-[var(--text-muted)]" />
                  <span className="truncate">{res.languages_supported.join(', ')}</span>
                </div>
                <div className="border-t border-neutral-100 pt-1 text-[11px] text-[var(--text-muted)] dark:border-neutral-800">
                  Verified by: <strong>{res.verified_by}</strong> on {res.verified_on.slice(0, 10)}
                </div>
              </div>

              <a
                href={
                  res.sms_or_whatsapp
                    ? `sms:${res.sms_or_whatsapp.replace(/[^0-9+]/g, '')}`
                    : `tel:${res.phone.replace(/[^0-9+]/g, '')}`
                }
                className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl bg-[var(--brand-primary)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--brand-accent)]"
              >
                <PhoneCall className="h-4 w-4" />
                <span>Call {res.phone}</span>
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
