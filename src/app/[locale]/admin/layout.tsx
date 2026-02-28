/**
 * Admin Layout with Sidebar Navigation
 */

'use client';

import { use, ReactNode, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/Button';

export default function AdminLayout({
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

  // Check authentication on mount (except for login page)
  useEffect(() => {
    const isLoginPage = pathname.includes('/admin/login');
    if (isLoginPage) {
      // If on login page, render login only
      return;
    }

    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/session', {
          credentials: 'include',
          cache: 'no-store', // Don't cache session checks
        });
        const data = await response.json();

        // Check if authenticated and user type is admin
        if (!data.authenticated || data.user?.type !== 'admin') {
          router.push(`/${locale}/admin/login`);
        }
      } catch {
        router.push(`/${locale}/admin/login`);
      }
    };

    checkAuth();
  }, [pathname, router, locale]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push(`/${locale}/admin/login`);
  };

  const isActive = (path: string) => pathname.includes(path);
  const isLoginPage = pathname.includes('/admin/login');

  const navItems = [
    { path: 'dashboard', label: t('navigation.dashboard'), icon: '📊' },
    { path: 'subscriptions', label: t('navigation.subscriptions'), icon: '📋' },
    { path: 'config', label: t('navigation.settings'), icon: '⚙️' },
    { path: 'staff', label: t('navigation.staff'), icon: '👥' },
  ];

  // If on login page, render without sidebar
  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-secondary-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-e border-secondary-200 flex flex-col">
        <div className="p-6 border-b border-secondary-200">
          <h1 className="text-lg font-bold text-primary-600">{t('admin.title')}</h1>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => router.push(`/${locale}/admin/${item.path}`)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                isActive(item.path)
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-secondary-700 hover:bg-secondary-50'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-secondary-200">
          <Button variant="ghost" size="sm" fullWidth onClick={handleLogout}>
            {t('auth.logout')}
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}
