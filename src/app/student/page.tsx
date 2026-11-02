'use client';

// TODO(M1-AUTH): Integrate student role authorization guard
import * as React from 'react';
import { Heart } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

export default function StudentHomePage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12 space-y-6">
      <EmptyState
        icon={Heart}
        milestoneTag="Milestone 2: Surveys & Self-Help Hub"
        title="Student Wellbeing & Reflection Hub"
        description="Welcome to your private wellness space. Once Milestone 2 is active, you will be able to take your weekly pulse checks, view personal baseline trends, practice guided grounding exercises, and write in your private encrypted journal."
        actionText="Take Weekly Check-in (Preview)"
        actionHref="/student/check-in"
        secondaryActionText="Private Journal (Preview)"
        secondaryActionHref="/student/journal"
      />
    </div>
  );
}
