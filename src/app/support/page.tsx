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

  const filtered = selectedRegion === 'ALL'
    ? supportSnapshot
    : supportSnapshot.filter((r) => r.region_code === selectedRegion || r.region_code === 'IN');

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 sm:py-12 space-y-8">
      {/* Title */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="verified">Verified Support Directory</Badge>
          <span className="text-xs text-[var(--text-muted)] font-mono">Milestone 5 Data Layer</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          Campus, National & Regional Support Directory
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-secondary)] max-w-2xl">
          All listings are verified on a strict 90-day cycle by campus psychological staff. Dial directly or reach out confidentially.
        </p>
      </div>

      {/* Region Filter Buttons */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs font-semibold text-[var(--text-muted)] mr-2">Filter Region:</span>
        {['ALL', 'CAMPUS', 'IN', 'US'].map((region) => (
          <Button
            key={region}
            variant={selectedRegion === region ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedRegion(region)}
          >
            {region === 'ALL' ? 'All Regions' : region === 'CAMPUS' ? 'On-Campus Desk' : region === 'IN' ? 'India (National)' : 'International / US'}
          </Button>
        ))}
      </div>

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((res) => (
          <Card key={res.id} className="flex flex-col justify-between">
            <CardHeader>
              <div className="flex items-center justify-between gap-2 mb-1">
                <Badge variant={res.is_crisis_priority ? 'destructive' : 'secondary'}>
                  {res.category.replace('_', ' ')}
                </Badge>
                <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                  VERIFY BEFORE LAUNCH
                </span>
              </div>
              <CardTitle className="text-lg">{res.name}</CardTitle>
              <CardDescription className="text-xs line-clamp-2">
                {res.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-0">
              <div className="space-y-1.5 text-xs text-[var(--text-secondary)]">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                  <span>{res.operating_hours}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[var(--text-muted)] shrink-0" />
                  <span className="truncate">{res.languages_supported.join(', ')}</span>
                </div>
                <div className="text-[11px] text-[var(--text-muted)] pt-1 border-t border-neutral-100 dark:border-neutral-800">
                  Verified by: <strong>{res.verified_by}</strong> on {res.verified_on.slice(0, 10)}
                </div>
              </div>

              <a
                href={res.phone.startsWith('Text') ? 'sms:741741' : `tel:${res.phone.replace(/[^0-9+]/g, '')}`}
                className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-sm font-semibold bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-accent)] transition-colors min-h-[44px]"
              >
                <PhoneCall className="w-4 h-4" />
                <span>Call {res.phone}</span>
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
