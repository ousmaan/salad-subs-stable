/**
 * Staff Layout with Navigation
 */

'use client';

import { use, ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export default function StaffLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = use(params);
  const t = useTranslations();
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push(`/${locale}`);
  };

  const isActive = (path: string) => pathname.includes(path);

  return (
    <div className="min-h-screen bg-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-primary-600">{t('common.appName')}</h1>
            {/* Back to POS button - temporarily disabled */}
            {/* <a
              href="http://localhost:8080"
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium"
            >
              <span>{t('navigation.backToPOS', { defaultValue: 'نقطة البيع' })}</span>
              <span>→</span>
            </a> */}
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b border-secondary-200">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            <button
              onClick={() => router.push(`/${locale}/staff/register`)}
              className={`px-4 py-3 font-medium whitespace-nowrap border-b-2 transition-colors ${
                isActive('/register')
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-secondary-600 hover:text-primary-600'
              }`}
            >
              {t('navigation.register')}
            </button>
            <button
              onClick={() => router.push(`/${locale}/staff/activate`)}
              className={`px-4 py-3 font-medium whitespace-nowrap border-b-2 transition-colors ${
                isActive('/activate')
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-secondary-600 hover:text-primary-600'
              }`}
            >
              {t('navigation.activate')}
            </button>
            <button
              onClick={() => router.push(`/${locale}/staff/redeem`)}
              className={`px-4 py-3 font-medium whitespace-nowrap border-b-2 transition-colors ${
                isActive('/redeem')
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-secondary-600 hover:text-primary-600'
              }`}
            >
              {t('navigation.redeem')}
            </button>
            <button
              onClick={() => router.push(`/${locale}/staff/subscriptions`)}
              className={`px-4 py-3 font-medium whitespace-nowrap border-b-2 transition-colors ${
                isActive('/subscriptions')
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-secondary-600 hover:text-primary-600'
              }`}
            >
              {t('customer.allCustomers')}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
