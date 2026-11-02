'use client';

// TODO(M1-AUTH): Integrate student auth and survey consent validation
import * as React from 'react';
import { ClipboardList } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

export default function CheckInSurveyPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <EmptyState
        icon={ClipboardList}
        milestoneTag="Milestone 2: Pulse Surveys"
        title="Weekly Pulse Check Survey"
        description="A gentle 2-minute voluntary reflection instrument adapted from validated scales (PHQ-style, GAD-style, and Burnout items). Responses are evaluated strictly against your personal baseline and never yield a medical diagnosis."
        actionText="Back to Student Portal"
        actionHref="/student"
        secondaryActionText="View Privacy Settings"
        secondaryActionHref="/settings/privacy"
      />
    </div>
  );
}
