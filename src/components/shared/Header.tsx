'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Heart, Menu, X } from 'lucide-react';
import { CrisisButton } from '@/components/shared/CrisisButton';
import { ThemeToggle } from '@/components/shared/ThemeToggle';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
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
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200/80 dark:border-neutral-800 bg-[var(--bg-primary)]">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2.5 font-bold text-lg text-[var(--text-primary)] hover:opacity-90 transition-opacity"
        >
          <div className="w-9 h-9 rounded-xl bg-[var(--brand-primary)] text-white flex items-center justify-center shadow-xs">
            <Heart className="w-5 h-5 fill-white" aria-hidden="true" />
          </div>
          <div className="flex flex-col">
            <span className="leading-tight tracking-tight font-bold text-[var(--brand-primary)] dark:text-[var(--brand-accent)] text-lg">
              {t('common.appName')}
            </span>
            <span className="text-[10px] text-[var(--text-muted)] font-normal hidden sm:inline">
              Student Wellbeing Platform
            </span>
          </div>
        </Link>

        {/* Actions container with Mobile Emergency Dock (Tab 3 in DOM order) */}
        <div className="order-3 flex items-center gap-2">
          <div id="mobile-emergency-dock" className="flex items-center">
            <CrisisButton className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 min-h-[44px]" />
          </div>
          <LanguageSwitcher className="hidden sm:block" />
          <ThemeToggle />

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden p-2 rounded-xl text-[var(--text-primary)] hover:bg-[var(--bg-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--brand-focus)] min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            aria-label={mobileOpen ? t('common.close') : t('common.menu')}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Desktop Navigation (Tab 4+) */}
        <nav className="hidden lg:flex order-2 items-center gap-1" aria-label="Main Navigation">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'px-3.5 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-[var(--bg-muted)]',
                  isActive
                    ? 'text-[var(--brand-primary)] dark:text-[var(--brand-accent)] font-semibold bg-[var(--bg-muted)]'
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
        <div className="lg:hidden border-b border-neutral-200 dark:border-neutral-800 bg-[var(--bg-surface)] px-4 py-4 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-800">
            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              {t('common.menu')}
            </span>
          </div>
          <nav className="flex flex-col space-y-1" aria-label="Mobile Navigation">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--text-primary)] hover:bg-[var(--bg-muted)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="pt-2 flex items-center justify-between sm:hidden border-t border-neutral-100 dark:border-neutral-800">
            <span className="text-xs text-[var(--text-muted)]">Language:</span>
            <LanguageSwitcher />
          </div>
        </div>
      )}
    </header>
  );
}
