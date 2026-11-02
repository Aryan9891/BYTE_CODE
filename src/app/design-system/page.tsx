import { notFound } from 'next/navigation';
import { env } from '@/lib/env';
import { DesignSystemShowcase } from './showcase';

export const dynamic = 'force-dynamic';

export default function DesignSystemPage() {
  const isProduction = process.env.NODE_ENV === 'production';
  const isShowcaseExplicitlyEnabled = env.ENABLE_DESIGN_SYSTEM_SHOWCASE;

  if (isProduction && !isShowcaseExplicitlyEnabled) {
    notFound();
  }

  return <DesignSystemShowcase />;
}
