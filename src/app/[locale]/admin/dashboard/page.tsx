/**
 * Admin Dashboard Page
 */

'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import type { DashboardStats } from '@/types/entities';

export default function DashboardPage() {
  const t = useTranslations();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      const data = await response.json();

      if (response.ok && data.success) {
        setStats(data.stats);
      } else {
        setError(data.error?.message || t('error.general'));
      }
    } catch (err) {
      setError(t('error.network'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <Alert type="error">{error}</Alert>;
  }

  if (!stats) {
    return <Alert type="error">{t('error.general')}</Alert>;
  }

  const statCards = [
    {
      title: t('dashboard.activeSubscriptions'),
      value: stats.activeSubscriptions,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
    {
      title: t('dashboard.pendingActivations'),
      value: stats.pendingActivations,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
    },
    {
      title: t('dashboard.todayRedemptions'),
      value: stats.todayRedemptions,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: t('dashboard.totalRevenue'),
      value: `${stats.totalRevenue} SAR`,
      color: 'text-primary-600',
      bg: 'bg-primary-50',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">{t('dashboard.title')}</h1>
        <p className="text-secondary-600">{t('dashboard.statistics')}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className={stat.bg}>
            <CardContent className="p-6">
              <p className="text-sm text-secondary-600 mb-1">{stat.title}</p>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* By Status */}
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.byStatus')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-secondary-600">{t('subscription.statusPending')}</p>
              <p className="text-2xl font-bold text-yellow-600">
                {stats.subscriptionsByStatus.pending_payment}
              </p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-secondary-600">{t('subscription.statusActive')}</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.subscriptionsByStatus.active}
              </p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-secondary-600">{t('subscription.statusExpired')}</p>
              <p className="text-2xl font-bold text-red-600">
                {stats.subscriptionsByStatus.expired}
              </p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-secondary-600">{t('subscription.statusRefunded')}</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.subscriptionsByStatus.refunded}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Revenue Info */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.weeklyRevenue')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary-600">{stats.weeklyRevenue} SAR</p>
            <p className="text-sm text-secondary-600 mt-1">{t('dashboard.last7Days')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.monthlyRevenue')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary-600">{stats.monthlyRevenue} SAR</p>
            <p className="text-sm text-secondary-600 mt-1">{t('dashboard.last30Days')}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
