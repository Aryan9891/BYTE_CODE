'use client';

import * as React from 'react';
import { Languages } from 'lucide-react';
import { useI18n, type Locale } from '@/lib/i18n';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';

export function LanguageSwitcher({ className }: { className?: string }) {
  const { locale, setLocale, t } = useI18n();

  return (
    <div className={className}>
      <Select
        value={locale}
        onValueChange={(val: string) => setLocale(val as Locale)}
      >
        <SelectTrigger
          className="h-10 w-[140px] rounded-xl text-xs font-medium"
          aria-label={t('common.language.select')}
        >
          <div className="flex items-center gap-1.5">
            <Languages className="w-3.5 h-3.5 opacity-70 shrink-0" aria-hidden="true" />
            <SelectValue />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">English</SelectItem>
          <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
          <SelectItem value="bn">বাংলা (Bengali)</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
