import Link from 'next/link';
import { ArrowLeft, Compass } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="container mx-auto max-w-xl px-4 py-20 text-center space-y-6">
      <div className="mx-auto w-14 h-14 rounded-full bg-[var(--bg-muted)] flex items-center justify-center text-[var(--text-muted)]">
        <Compass className="w-8 h-8" aria-hidden="true" />
      </div>
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--text-primary)]">
          404 - Page Not Found
        </h1>
        <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed">
          The page you requested is not available. Please return safely to the home page or access crisis support.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Button asChild variant="default">
          <Link href="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Return Home
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/crisis">
            Crisis Support
          </Link>
        </Button>
      </div>
    </div>
  );
}

