'use client';

import * as React from 'react';
import Link from 'next/link';
import { ShieldCheck, PhoneCall } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="mt-auto w-full border-t border-neutral-200/80 bg-[var(--bg-muted)]/50 py-10 pb-24 sm:pb-10 dark:border-neutral-800">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Col 1: Mission */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-[var(--brand-primary)] dark:text-[var(--brand-accent)]">
                {t('common.appName')}
              </span>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
                Ethical Architecture
              </span>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-[var(--text-secondary)]">
              {t('common.appTagline')}
            </p>
            <p className="flex items-center gap-1.5 pt-1 text-xs text-[var(--text-muted)]">
              <ShieldCheck
                className="h-4 w-4 shrink-0 text-[var(--brand-primary)]"
                aria-hidden="true"
              />
              <span>{t('common.privacyGuaranteed')}</span>
            </p>
          </div>

          {/* Col 2: Stakeholder Views */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold tracking-wider text-[var(--text-muted)] uppercase">
              Stakeholder Portals
            </h4>
            <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
              <li>
                <Link
                  href="/student"
                  className="transition-colors hover:text-[var(--text-primary)]"
                >
                  {t('nav.student')}
                </Link>
              </li>
              <li>
                <Link
                  href="/counselor"
                  className="transition-colors hover:text-[var(--text-primary)]"
                >
                  {t('nav.counselor')}
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/analytics"
                  className="transition-colors hover:text-[var(--text-primary)]"
                >
                  {t('nav.admin')}
                </Link>
              </li>
              <li>
                <Link
                  href="/design-system"
                  className="text-xs text-[var(--text-muted)] transition-colors hover:text-[var(--text-primary)]"
                >
                  Design System Showcase (Dev)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Support & Legal */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold tracking-wider text-[var(--text-muted)] uppercase">
              Safety & Governance
            </h4>
            <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
              <li>
                <Link
                  href="/crisis"
                  className="flex items-center gap-1.5 font-semibold text-red-700 transition-colors hover:text-[var(--crisis-text)] dark:text-red-400"
                >
                  <PhoneCall className="h-3.5 w-3.5" /> 24/7 Crisis Safety Page
                </Link>
              </li>
              <li>
                <Link
                  href="/support"
                  className="transition-colors hover:text-[var(--text-primary)]"
                >
                  {t('nav.support')}
                </Link>
              </li>
              <li>
                <Link
                  href="/settings/privacy"
                  className="transition-colors hover:text-[var(--text-primary)]"
                >
                  {t('nav.privacy')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-neutral-200 pt-6 text-xs text-[var(--text-muted)] sm:flex-row dark:border-neutral-800">
          <p>
            © {new Date().getFullYear()} Sahayak. Dedicated to student health, privacy, and
            compassion.
          </p>
          <p className="text-center sm:text-right">
            S-12: AI-Based Mental Health Support and Crisis Detection • Built with Next.js 15
          </p>
        </div>
      </div>
    </footer>
  );
}
