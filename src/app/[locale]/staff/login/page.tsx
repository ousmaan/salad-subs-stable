/**
 * Staff Login Page - TEMPORARILY DISABLED FOR TESTING
 * Auto-redirects to staff interface
 */

'use client';

import { use, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Spinner } from '@/components/ui/Spinner';

export default function StaffLoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const router = useRouter();
  const t = useTranslations('auth');

  useEffect(() => {
    // Auto-redirect to staff interface (no login required during testing)
    // Default to Dispense Salad page
    router.push(`/${locale}/staff/redeem`);
  }, [locale, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="text-center">
        <Spinner size="lg" className="mx-auto mb-4" />
        <p className="text-secondary-600 text-lg">{t('redirectingToStaff')}</p>
      </div>
    </div>
  );
}
