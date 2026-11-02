'use client';

// TODO(M1-AUTH): Integrate student auth and onboarding session guard
import * as React from 'react';
import { UserCheck } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

export default function OnboardingPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <EmptyState
        icon={UserCheck}
        milestoneTag="Milestone 1: Auth & Consent"
        title="Student Onboarding & Granular Consent Center"
        description="This flow allows students to review and configure their four independent consent toggles (Surveys, Academic Drift, Help-Seeking Patterns, Counselor Triage) with full plain-language transparency and zero dark patterns."
        actionText="Explore Privacy Center"
        actionHref="/settings/privacy"
        secondaryActionText="Go to Student Portal"
        secondaryActionHref="/student"
      />
    </div>
  );
}
