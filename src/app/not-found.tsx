import Link from 'next/link';
import { ArrowLeft, Compass } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="container mx-auto max-w-xl space-y-6 px-4 py-20 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--bg-muted)] text-[var(--text-muted)]">
        <Compass className="h-8 w-8" aria-hidden="true" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          404 - Page Not Found
        </h1>
        <p className="text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
          The page you requested is not available. Please return safely to the home page or access
          crisis support.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Button asChild variant="default">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Return Home
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/crisis">Crisis Support</Link>
        </Button>
      </div>
    </div>
  );
}
