import type { Metadata } from 'next';
import { Noto_Sans } from 'next/font/google';
import '@/styles/globals.css';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { I18nProvider } from '@/lib/i18n';
import { SkipLink } from '@/components/ui/SkipLink';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';

const notoSans = Noto_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Sahayak | Student Wellbeing & Crisis Detection Platform',
  description:
    'A privacy-preserving, non-diagnostic platform identifying early student stress, burnout, and distress signals with verified support connection.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={notoSans.variable}>
      <body className="min-h-screen flex flex-col font-sans antialiased selection:bg-emerald-100 selection:text-emerald-900">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <I18nProvider>
            <SkipLink targetId="main-content" label="Skip to main content" />
            <Header />
            <main id="main-content" className="flex-1 focus:outline-none" tabIndex={-1}>
              {children}
            </main>
            <Footer />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
