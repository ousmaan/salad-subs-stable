/**
 * Landing Page - User Type Selection
 */

'use client';

import { use } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const t = useTranslations();
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-600 mb-2">
            {t('common.appName')}
          </h1>
          <p className="text-secondary-600">{t('auth.selectUserType')}</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                {t('auth.staffLogin')}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <svg
                className="w-24 h-24 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => router.push(`/${locale}/staff/login`)}
              >
                {t('auth.staff')}
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle className="text-2xl text-center">
                {t('auth.adminLogin.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <svg
                className="w-24 h-24 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => router.push(`/${locale}/admin/login`)}
              >
                {t('auth.admin')}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Language Switcher */}
        <div className="mt-8 text-center">
          <div className="inline-flex gap-2 bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => router.push('/ar')}
              className={`px-4 py-2 rounded ${
                locale === 'ar'
                  ? 'bg-primary-600 text-white'
                  : 'text-secondary-600 hover:bg-secondary-100'
              }`}
            >
              العربية
            </button>
            <button
              onClick={() => router.push('/en')}
              className={`px-4 py-2 rounded ${
                locale === 'en'
                  ? 'bg-primary-600 text-white'
                  : 'text-secondary-600 hover:bg-secondary-100'
              }`}
            >
              English
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
