/**
 * Staff Subscriptions Management Page
 */

'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import type { SubscriptionWithCustomer, SubscriptionStatus } from '@/types/entities';
import { formatPhoneNumber, formatSubscriptionCode } from '@/lib/utils/format';

export default function StaffSubscriptionsPage() {
  const t = useTranslations();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithCustomer[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<SubscriptionStatus | 'all'>('all');

  useEffect(() => {
    fetchSubscriptions();
  }, [statusFilter]);

  const fetchSubscriptions = async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/subscriptions?${params.toString()}`);
      const data = await response.json();

      if (response.ok && data.success) {
        setSubscriptions(data.subscriptions);
      } else {
        setError(data.error?.message || t('error.general'));
      }
    } catch (err) {
      setError(t('error.network'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: SubscriptionStatus) => {
    const variants: Record<SubscriptionStatus, 'success' | 'warning' | 'danger' | 'info'> = {
      active: 'success',
      pending_payment: 'warning',
      expired: 'danger',
      refunded: 'info',
    };

    const labels: Record<SubscriptionStatus, string> = {
      active: t('subscription.statusActive'),
      pending_payment: t('subscription.statusPending'),
      expired: t('subscription.statusExpired'),
      refunded: t('subscription.statusRefunded'),
    };

    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  const filteredSubscriptions = subscriptions.filter((sub) =>
    search
      ? sub.customer.name.toLowerCase().includes(search.toLowerCase()) ||
        sub.customer.phone.includes(search) ||
        sub.subscriptionCode.includes(search) ||
        (sub.activationCode && sub.activationCode.includes(search))
      : true
  );

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                label={t('common.search')}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t('subscription.searchPlaceholder')}
              />
            </div>
            <div className="flex gap-2 items-end flex-wrap">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  statusFilter === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200'
                }`}
              >
                {t('common.selectAll', { defaultValue: 'All' })}
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  statusFilter === 'active'
                    ? 'bg-green-600 text-white'
                    : 'bg-green-50 text-green-700 hover:bg-green-100'
                }`}
              >
                {t('subscription.statusActive')}
              </button>
              <button
                onClick={() => setStatusFilter('pending_payment')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  statusFilter === 'pending_payment'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                }`}
              >
                {t('subscription.statusPending')}
              </button>
              <button
                onClick={() => setStatusFilter('expired')}
                className={`px-4 py-2 rounded-lg font-medium ${
                  statusFilter === 'expired'
                    ? 'bg-red-600 text-white'
                    : 'bg-red-50 text-red-700 hover:bg-red-100'
                }`}
              >
                {t('subscription.statusExpired')}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {t('subscription.title')} ({filteredSubscriptions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <Alert type="error">{error}</Alert>
          ) : filteredSubscriptions.length === 0 ? (
            <p className="text-center text-secondary-600 py-8">{t('subscription.noSubscriptions')}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-secondary-200">
                    <th className="text-start p-3 text-sm font-medium text-secondary-600">
                      {t('customer.name')}
                    </th>
                    <th className="text-center p-3 text-sm font-medium text-secondary-600">
                      {t('customer.phone')}
                    </th>
                    <th className="text-start p-3 text-sm font-medium text-secondary-600">
                      {t('subscription.code')}
                    </th>
                    <th className="text-start p-3 text-sm font-medium text-secondary-600">
                      {t('subscription.planType')}
                    </th>
                    <th className="text-start p-3 text-sm font-medium text-secondary-600">
                      {t('subscription.remainingSalads')}
                    </th>
                    <th className="text-start p-3 text-sm font-medium text-secondary-600">
                      {t('subscription.status')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubscriptions.map((sub) => (
                    <tr key={sub.id} className="border-b border-secondary-100 hover:bg-secondary-50">
                      <td className="p-3">{sub.customer.name}</td>
                      <td className="p-3 text-center" dir="ltr">{formatPhoneNumber(sub.customer.phone)}</td>
                      <td className="p-3 font-mono text-lg font-bold text-primary-700">{formatSubscriptionCode(sub.subscriptionCode)}</td>
                      <td className="p-3">
                        <Badge variant="info">
                          {sub.planType === 'biweekly' ? t('customer.biweekly', { defaultValue: 'نصف شهري' }) : t('customer.monthly')}
                        </Badge>
                      </td>
                      <td className="p-3 font-bold text-primary-600">
                        {sub.remainingSalads}/{sub.totalSalads}
                      </td>
                      <td className="p-3">{getStatusBadge(sub.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
