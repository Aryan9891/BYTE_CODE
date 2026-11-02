import { cookies } from 'next/headers';
import { Locale, getTranslation } from './i18n';

export async function getServerLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const rawLocale = cookieStore.get('sahayak_locale')?.value;
  if (rawLocale === 'hi' || rawLocale === 'bn') {
    return rawLocale;
  }
  return 'en';
}

export async function getServerTranslator() {
  const locale = await getServerLocale();
  return {
    locale,
    t: (path: string, params?: Record<string, string | number>) =>
      getTranslation(locale, path, params),
  };
}
