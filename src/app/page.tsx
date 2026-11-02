'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Heart,
  UserCheck,
  Sparkles,
  ArrowRight,
  PhoneCall,
  Lock,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useI18n } from '@/lib/i18n';

export default function LandingPage() {
  const { t } = useI18n();

  return (
    <div className="space-y-16 py-8 sm:py-16">
      {/* 1. Hero Section */}
      <section className="container mx-auto max-w-6xl space-y-6 px-4 text-center sm:px-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-100/80 px-3.5 py-1.5 text-xs font-semibold text-emerald-800 shadow-xs dark:border-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
          <Sparkles
            className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400"
            aria-hidden="true"
          />
          <span>S-12: AI-Based Mental Health Support & Crisis Detection</span>
        </div>

        <h1 className="mx-auto max-w-4xl text-4xl leading-[1.15] font-bold tracking-tight text-[var(--text-primary)] sm:text-5xl lg:text-6xl">
          {t('landing.heroTitle')}
        </h1>

        <p className="mx-auto max-w-2xl text-lg leading-relaxed text-[var(--text-secondary)] sm:text-xl">
          {t('landing.heroSubtitle')}
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
          <Button asChild size="lg" variant="default" className="gap-2 text-base">
            <Link href="/student/check-in">
              <span>{t('landing.ctaStartCheckin')}</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </Button>

          <Button asChild size="lg" variant="outline" className="gap-2 text-base">
            <Link href="/settings/privacy">
              <ShieldCheck className="h-4 w-4" aria-hidden="true" />
              <span>{t('landing.ctaExplorePrivacy')}</span>
            </Link>
          </Button>

          <Button asChild size="lg" variant="crisis" className="gap-2 text-base">
            <Link href="/crisis">
              <PhoneCall className="h-4 w-4" aria-hidden="true" />
              <span>{t('landing.ctaGetHelp')}</span>
            </Link>
          </Button>
        </div>

        {/* Trust Guarantees */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-8 text-xs font-medium text-[var(--text-muted)]">
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-[var(--brand-primary)]" aria-hidden="true" />
            Zero Medical Diagnoses
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Lock className="h-4 w-4 text-[var(--brand-primary)]" aria-hidden="true" />
            Student-Private Envelope Encryption
          </span>
          <span className="inline-flex items-center gap-1.5">
            <EyeOff className="h-4 w-4 text-[var(--brand-primary)]" aria-hidden="true" />
            k-Anonymity Protected (k ≥ 10)
          </span>
        </div>
      </section>

      {/* 2. Non-Negotiable Ethical Promises */}
      <section
        className="container mx-auto max-w-6xl px-4 sm:px-6"
        aria-labelledby="privacy-promises-heading"
      >
        <div className="mb-10 space-y-2 text-center">
          <h2
            id="privacy-promises-heading"
            className="text-2xl font-bold text-[var(--text-primary)] sm:text-3xl"
          >
            {t('landing.promisesTitle')}
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            How Sahayak fundamentally protects students from surveillance and stigma.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Promise 1 */}
          <Card className="border-t-4 border-t-[var(--brand-primary)]">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-[var(--brand-primary)] dark:bg-emerald-950/60 dark:text-[var(--brand-accent)]">
                <Heart className="h-6 w-6" aria-hidden="true" />
              </div>
              <CardTitle className="text-lg">{t('landing.promiseNoDiagnosis')}</CardTitle>
              <CardDescription className="leading-relaxed">
                {t('landing.promiseNoDiagnosisDesc')}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Promise 2 */}
          <Card className="border-t-4 border-t-[var(--tier-1-watch)]">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-[var(--tier-1-watch)] dark:bg-amber-950/60">
                <Lock className="h-6 w-6" aria-hidden="true" />
              </div>
              <CardTitle className="text-lg">{t('landing.promiseConsent')}</CardTitle>
              <CardDescription className="leading-relaxed">
                {t('landing.promiseConsentDesc')}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Promise 3 */}
          <Card className="border-t-4 border-t-[var(--brand-accent)]">
            <CardHeader>
              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">
                <UserCheck className="h-6 w-6" aria-hidden="true" />
              </div>
              <CardTitle className="text-lg">{t('landing.promiseHuman')}</CardTitle>
              <CardDescription className="leading-relaxed">
                {t('landing.promiseHumanDesc')}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* 3. Role Selector Cards (Stakeholder Portals) */}
      <section
        className="container mx-auto max-w-6xl px-4 sm:px-6"
        aria-labelledby="stakeholder-roles-heading"
      >
        <div className="mb-10 space-y-2 text-center">
          <h2
            id="stakeholder-roles-heading"
            className="text-2xl font-bold text-[var(--text-primary)] sm:text-3xl"
          >
            {t('landing.rolesTitle')}
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Interactive portals tailored for students, campus counselors, and institutional
            administrators.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Role: Student */}
          <Card className="flex flex-col justify-between transition-shadow hover:shadow-md">
            <CardHeader>
              <Badge variant="verified" className="mb-2 w-fit">
                Student View
              </Badge>
              <CardTitle className="text-xl">{t('landing.roleStudentTitle')}</CardTitle>
              <CardDescription className="leading-relaxed">
                {t('landing.roleStudentDesc')}
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild variant="default" className="w-full gap-2">
                <Link href="/student">
                  <span>{t('landing.roleStudentAction')}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Role: Counselor */}
          <Card className="flex flex-col justify-between transition-shadow hover:shadow-md">
            <CardHeader>
              <Badge variant="warning" className="mb-2 w-fit">
                Staff View
              </Badge>
              <CardTitle className="text-xl">{t('landing.roleCounselorTitle')}</CardTitle>
              <CardDescription className="leading-relaxed">
                {t('landing.roleCounselorDesc')}
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild variant="outline" className="w-full gap-2">
                <Link href="/counselor">
                  <span>{t('landing.roleCounselorAction')}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Role: Admin */}
          <Card className="flex flex-col justify-between transition-shadow hover:shadow-md">
            <CardHeader>
              <Badge variant="secondary" className="mb-2 w-fit">
                Admin View
              </Badge>
              <CardTitle className="text-xl">{t('landing.roleAdminTitle')}</CardTitle>
              <CardDescription className="leading-relaxed">
                {t('landing.roleAdminDesc')}
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild variant="secondary" className="w-full gap-2">
                <Link href="/admin/analytics">
                  <span>{t('landing.roleAdminAction')}</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>
    </div>
  );
}
