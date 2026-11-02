'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, Menu, X } from 'lucide-react';
import { CrisisButton } from '@/components/shared/CrisisButton';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { DemoRoleSwitcher } from '@/components/dev/DemoRoleSwitcher';
import { useI18n } from '@/lib/i18n';
import { cn } from '@/lib/utils';

export function Header() {
  const pathname = usePathname();
  const { t } = useI18n();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const navLinks = [
    { href: '/student', label: t('nav.student') },
    { href: '/counselor', label: t('nav.counselor') },
    { href: '/admin/analytics', label: t('nav.admin') },
    { href: '/support', label: t('nav.support') },
    { href: '/settings/privacy', label: t('nav.privacy') },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200/80 bg-[var(--bg-primary)] dark:border-neutral-800">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2.5 text-lg font-bold text-[var(--text-primary)] transition-opacity hover:opacity-90"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--brand-primary)] text-white shadow-xs">
            <Heart className="h-5 w-5 fill-white" aria-hidden="true" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg leading-tight font-bold tracking-tight text-[var(--brand-primary)] dark:text-[var(--brand-accent)]">
              {t('common.appName')}
            </span>
            <span className="hidden text-[10px] font-normal text-[var(--text-muted)] sm:inline">
              Student Wellbeing Platform
            </span>
          </div>
        </Link>

        {/* Actions container with Mobile Emergency Dock (Tab 3 in DOM order) */}
        <div className="order-3 flex items-center gap-2">
          <div id="mobile-emergency-dock" className="flex items-center">
            <CrisisButton className="min-h-[44px] px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm" />
          </div>
          <LanguageSwitcher className="hidden sm:block" />
          <ThemeToggle />
          <DemoRoleSwitcher />

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex min-h-[44px] min-w-[44px] cursor-pointer items-center justify-center rounded-xl p-2 text-[var(--text-primary)] hover:bg-[var(--bg-muted)] focus:ring-2 focus:ring-[var(--brand-focus)] focus:outline-none lg:hidden"
            aria-label={mobileOpen ? t('common.close') : t('common.menu')}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Desktop Navigation (Tab 4+) */}
        <nav className="order-2 hidden items-center gap-1 lg:flex" aria-label="Main Navigation">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'rounded-xl px-3.5 py-2 text-sm font-medium transition-colors hover:bg-[var(--bg-muted)]',
                  isActive
                    ? 'bg-[var(--bg-muted)] font-semibold text-[var(--brand-primary)] dark:text-[var(--brand-accent)]'
                    : 'text-[var(--text-secondary)]'
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="space-y-3 border-b border-neutral-200 bg-[var(--bg-surface)] px-4 py-4 lg:hidden dark:border-neutral-800">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-2 dark:border-neutral-800">
            <span className="text-xs font-semibold tracking-wider text-[var(--text-muted)] uppercase">
              {t('common.menu')}
            </span>
          </div>
          <nav className="flex flex-col space-y-1" aria-label="Mobile Navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-muted)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center justify-between border-t border-neutral-100 pt-2 sm:hidden dark:border-neutral-800">
            <span className="text-xs text-[var(--text-muted)]">Language:</span>
            <LanguageSwitcher />
          </div>
        </div>
      )}
    </header>
  );
}
