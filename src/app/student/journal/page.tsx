'use client';

// TODO(M1-AUTH): Integrate student auth and WebCrypto DEK unwrap session
import * as React from 'react';
import { BookOpen } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

export default function JournalPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <EmptyState
        icon={BookOpen}
        milestoneTag="Milestone 2: Student-Private Journal"
        title="Student-Private, Envelope-Encrypted Reflection Journal"
        description="A completely private journal space for your thoughts. Encrypted with AES-256-GCM envelope encryption. Only you hold the decryption capability; counselors, admins, and database operators have zero access. Entries are never parsed by the risk engine without explicit opt-in."
        actionText="Back to Student Portal"
        actionHref="/student"
        secondaryActionText="Privacy Guarantees"
        secondaryActionHref="/settings/privacy"
      />
    </div>
  );
}
