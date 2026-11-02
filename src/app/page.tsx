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
      <section className="container mx-auto max-w-6xl px-4 sm:px-6 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
          <span>S-12: AI-Based Mental Health Support & Crisis Detection</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[var(--text-primary)] max-w-4xl mx-auto leading-[1.15]">
          {t('landing.heroTitle')}
        </h1>

        <p className="text-lg sm:text-xl text-[var(--text-secondary)] max-w-2xl mx-auto leading-relaxed">
          {t('landing.heroSubtitle')}
        </p>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4">
          <Button asChild size="lg" variant="default" className="gap-2 text-base">
            <Link href="/student/check-in">
              <span>{t('landing.ctaStartCheckin')}</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </Button>

          <Button asChild size="lg" variant="outline" className="gap-2 text-base">
            <Link href="/settings/privacy">
              <ShieldCheck className="w-4 h-4" aria-hidden="true" />
              <span>{t('landing.ctaExplorePrivacy')}</span>
            </Link>
          </Button>

          <Button asChild size="lg" variant="crisis" className="gap-2 text-base">
            <Link href="/crisis">
              <PhoneCall className="w-4 h-4" aria-hidden="true" />
              <span>{t('landing.ctaGetHelp')}</span>
            </Link>
          </Button>
        </div>

        {/* Trust Guarantees */}
        <div className="pt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-[var(--text-muted)] font-medium">
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[var(--brand-primary)]" aria-hidden="true" />
            Zero Medical Diagnoses
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Lock className="w-4 h-4 text-[var(--brand-primary)]" aria-hidden="true" />
            Student-Private Envelope Encryption
          </span>
          <span className="inline-flex items-center gap-1.5">
            <EyeOff className="w-4 h-4 text-[var(--brand-primary)]" aria-hidden="true" />
            k-Anonymity Protected (k ≥ 10)
          </span>
        </div>
      </section>

      {/* 2. Non-Negotiable Ethical Promises */}
      <section className="container mx-auto max-w-6xl px-4 sm:px-6" aria-labelledby="privacy-promises-heading">
        <div className="text-center space-y-2 mb-10">
          <h2 id="privacy-promises-heading" className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            {t('landing.promisesTitle')}
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            How Sahayak fundamentally protects students from surveillance and stigma.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Promise 1 */}
          <Card className="border-t-4 border-t-[var(--brand-primary)]">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-[var(--brand-primary)] dark:text-[var(--brand-accent)] flex items-center justify-center mb-2">
                <Heart className="w-6 h-6" aria-hidden="true" />
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
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-[var(--tier-1-watch)] flex items-center justify-center mb-2">
                <Lock className="w-6 h-6" aria-hidden="true" />
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
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center mb-2">
                <UserCheck className="w-6 h-6" aria-hidden="true" />
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
      <section className="container mx-auto max-w-6xl px-4 sm:px-6" aria-labelledby="stakeholder-roles-heading">
        <div className="text-center space-y-2 mb-10">
          <h2 id="stakeholder-roles-heading" className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)]">
            {t('landing.rolesTitle')}
          </h2>
          <p className="text-sm text-[var(--text-secondary)]">
            Interactive portals tailored for students, campus counselors, and institutional administrators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Role: Student */}
          <Card className="flex flex-col justify-between hover:shadow-md transition-shadow">
            <CardHeader>
              <Badge variant="verified" className="w-fit mb-2">Student View</Badge>
              <CardTitle className="text-xl">{t('landing.roleStudentTitle')}</CardTitle>
              <CardDescription className="leading-relaxed">
                {t('landing.roleStudentDesc')}
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild variant="default" className="w-full gap-2">
                <Link href="/student">
                  <span>{t('landing.roleStudentAction')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Role: Counselor */}
          <Card className="flex flex-col justify-between hover:shadow-md transition-shadow">
            <CardHeader>
              <Badge variant="warning" className="w-fit mb-2">Staff View</Badge>
              <CardTitle className="text-xl">{t('landing.roleCounselorTitle')}</CardTitle>
              <CardDescription className="leading-relaxed">
                {t('landing.roleCounselorDesc')}
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild variant="outline" className="w-full gap-2">
                <Link href="/counselor">
                  <span>{t('landing.roleCounselorAction')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Role: Admin */}
          <Card className="flex flex-col justify-between hover:shadow-md transition-shadow">
            <CardHeader>
              <Badge variant="secondary" className="w-fit mb-2">Admin View</Badge>
              <CardTitle className="text-xl">{t('landing.roleAdminTitle')}</CardTitle>
              <CardDescription className="leading-relaxed">
                {t('landing.roleAdminDesc')}
              </CardDescription>
            </CardHeader>
            <CardFooter>
              <Button asChild variant="secondary" className="w-full gap-2">
                <Link href="/admin/analytics">
                  <span>{t('landing.roleAdminAction')}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </section>
    </div>
  );
}
