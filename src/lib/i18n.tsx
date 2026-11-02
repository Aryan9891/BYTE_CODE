'use client';

import React, { createContext, useContext, useState } from 'react';
import en from '@/messages/en.json';
import hi from '@/messages/hi.json';
import bn from '@/messages/bn.json';

export type Locale = 'en' | 'hi' | 'bn';

type Messages = typeof en;

export const dictionaries: Record<Locale, Messages> = {
  en,
  hi: hi as unknown as Messages,
  bn: bn as unknown as Messages,
};

export function getTranslation(
  locale: Locale,
  path: string,
  params?: Record<string, string | number>
): string {
  const keys = path.split('.');
  let current: unknown = dictionaries[locale] || dictionaries.en;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      // Fallback to English
      let fallback: unknown = dictionaries.en;
      for (const fbKey of keys) {
        if (fallback && typeof fallback === 'object' && fbKey in fallback) {
          fallback = (fallback as Record<string, unknown>)[fbKey];
        } else {
          return path;
        }
      }
      current = fallback;
      break;
    }
  }

  if (typeof current !== 'string') {
    return path;
  }

  let result = current;
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      result = result.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    }
  }

  return result;
}

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (path: string, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nContextType | null>(null);

export function I18nProvider({
  children,
  initialLocale = 'en',
}: {
  children: React.ReactNode;
  initialLocale?: Locale;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    if (typeof document !== 'undefined') {
      document.cookie = `sahayak_locale=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
      try {
        localStorage.setItem('sahayak_locale', newLocale);
      } catch {
        // Safe fallback if local storage is restricted
      }
      document.documentElement.lang = newLocale;
    }
  };

  const t = (path: string, params?: Record<string, string | number>): string => {
    return getTranslation(locale, path, params);
  };

  return <I18nContext.Provider value={{ locale, setLocale, t }}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
