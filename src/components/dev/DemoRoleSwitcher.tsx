'use client';

import React, { useState, useEffect } from 'react';
import { UserCheck, Shield, GraduationCap } from 'lucide-react';

export function DemoRoleSwitcher() {
  const [currentRole, setCurrentRole] = useState<string>('STUDENT');
  const [isDev, setIsDev] = useState<boolean>(false);

  useEffect(() => {
    // Only mount in non-production environments
    if (process.env.NODE_ENV !== 'production') {
      setIsDev(true);
      // Read current role from document.cookie
      const match = document.cookie.match(/sahayak_demo_role=([^;]+)/);
      if (match && match[1]) {
        setCurrentRole(match[1]);
      }
    }
  }, []);

  if (!isDev) {
    return null;
  }

  async function switchRole(newRole: string) {
    try {
      const res = await fetch('/api/dev/demo-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        setCurrentRole(newRole);
        window.location.reload();
      }
    } catch {
      // Ignored in dev
    }
  }

  return (
    <div
      role="region"
      aria-label="Developer Persona Switcher"
      className="hidden items-center gap-1.5 rounded-full border border-amber-300 bg-amber-50/80 px-2.5 py-1 text-xs text-amber-900 md:flex dark:border-amber-700 dark:bg-amber-950/40 dark:text-amber-200"
    >
      <span className="text-[11px] font-semibold tracking-wider text-amber-700 uppercase dark:text-amber-400">
        Demo Persona:
      </span>
      <button
        type="button"
        onClick={() => switchRole('STUDENT')}
        className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors ${
          currentRole === 'STUDENT'
            ? 'bg-amber-600 text-white shadow-xs'
            : 'text-amber-800 hover:bg-amber-200/50 dark:text-amber-300 dark:hover:bg-amber-900/50'
        }`}
      >
        <GraduationCap className="h-3 w-3" />
        Student
      </button>
      <button
        type="button"
        onClick={() => switchRole('COUNSELOR')}
        className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors ${
          currentRole === 'COUNSELOR'
            ? 'bg-emerald-600 text-white shadow-xs'
            : 'text-emerald-800 hover:bg-emerald-200/50 dark:text-emerald-300 dark:hover:bg-emerald-900/50'
        }`}
      >
        <UserCheck className="h-3 w-3" />
        Counselor
      </button>
      <button
        type="button"
        onClick={() => switchRole('ADMIN')}
        className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors ${
          currentRole === 'ADMIN'
            ? 'bg-purple-600 text-white shadow-xs'
            : 'text-purple-800 hover:bg-purple-200/50 dark:text-purple-300 dark:hover:bg-purple-900/50'
        }`}
      >
        <Shield className="h-3 w-3" />
        Admin
      </button>
    </div>
  );
}
