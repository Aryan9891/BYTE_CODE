'use client';

import * as React from 'react';
import Link from 'next/link';
import { ShieldCheck, PhoneCall } from 'lucide-react';
import { useI18n } from '@/lib/i18n';

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="w-full border-t border-neutral-200/80 dark:border-neutral-800 bg-[var(--bg-muted)]/50 py-10 pb-24 sm:pb-10 mt-auto">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Mission */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-[var(--brand-primary)] dark:text-[var(--brand-accent)]">
                {t('common.appName')}
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 font-medium">
                Ethical Architecture
              </span>
            </div>
            <p className="text-sm text-[var(--text-secondary)] max-w-md leading-relaxed">
              {t('common.appTagline')}
            </p>
            <p className="text-xs text-[var(--text-muted)] flex items-center gap-1.5 pt-1">
              <ShieldCheck className="w-4 h-4 text-[var(--brand-primary)] shrink-0" aria-hidden="true" />
              <span>{t('common.privacyGuaranteed')}</span>
            </p>
          </div>

          {/* Col 2: Stakeholder Views */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Stakeholder Portals
            </h4>
            <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
              <li>
                <Link href="/student" className="hover:text-[var(--text-primary)] transition-colors">
                  {t('nav.student')}
                </Link>
              </li>
              <li>
                <Link href="/counselor" className="hover:text-[var(--text-primary)] transition-colors">
                  {t('nav.counselor')}
                </Link>
              </li>
              <li>
                <Link href="/admin/analytics" className="hover:text-[var(--text-primary)] transition-colors">
                  {t('nav.admin')}
                </Link>
              </li>
              <li>
                <Link href="/design-system" className="hover:text-[var(--text-primary)] transition-colors text-xs text-[var(--text-muted)]">
                  Design System Showcase (Dev)
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Support & Legal */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Safety & Governance
            </h4>
            <ul className="space-y-2 text-sm text-[var(--text-secondary)]">
              <li>
                <Link href="/crisis" className="hover:text-[var(--crisis-text)] font-semibold transition-colors flex items-center gap-1.5 text-red-700 dark:text-red-400">
                  <PhoneCall className="w-3.5 h-3.5" /> 24/7 Crisis Safety Page
                </Link>
              </li>
              <li>
                <Link href="/support" className="hover:text-[var(--text-primary)] transition-colors">
                  {t('nav.support')}
                </Link>
              </li>
              <li>
                <Link href="/settings/privacy" className="hover:text-[var(--text-primary)] transition-colors">
                  {t('nav.privacy')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-6 border-t border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[var(--text-muted)]">
          <p>© {new Date().getFullYear()} Sahayak. Dedicated to student health, privacy, and compassion.</p>
          <p className="text-center sm:text-right">
            S-12: AI-Based Mental Health Support and Crisis Detection • Built with Next.js 15
          </p>
        </div>
      </div>


    </footer>
  );
}
