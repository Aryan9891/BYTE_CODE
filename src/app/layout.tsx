import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { Noto_Sans, Noto_Sans_Devanagari, Noto_Sans_Bengali } from 'next/font/google';
import '@/styles/globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { I18nProvider, Locale } from '@/lib/i18n';
import { SkipLink } from '@/components/ui/SkipLink';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';

const notoSans = Noto_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-sans',
});

const notoDevanagari = Noto_Sans_Devanagari({
  subsets: ['devanagari'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-devanagari',
});

const notoBengali = Noto_Sans_Bengali({
  subsets: ['bengali'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-bengali',
});

export const metadata: Metadata = {
  title: 'Sahayak | Student Wellbeing & Crisis Detection Platform',
  description:
    'A privacy-preserving, non-diagnostic platform identifying early student stress, burnout, and distress signals with verified support connection.',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const rawLocale = cookieStore.get('sahayak_locale')?.value as Locale | undefined;
  const initialLocale: Locale = rawLocale === 'hi' || rawLocale === 'bn' ? rawLocale : 'en';

  return (
    <html
      lang={initialLocale}
      suppressHydrationWarning
      className={`${notoSans.variable} ${notoDevanagari.variable} ${notoBengali.variable}`}
    >
      <body className="flex min-h-screen flex-col font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <I18nProvider initialLocale={initialLocale}>
            <SkipLink targetId="main-content" label="Skip to main content" />
            <Header />
            <main
              id="main-content"
              className="flex-1 pb-20 focus:outline-none sm:pb-0"
              tabIndex={-1}
            >
              {children}
            </main>
            <Footer />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
