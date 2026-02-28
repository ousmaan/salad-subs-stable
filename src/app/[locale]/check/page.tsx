/**
 * Customer Portal - Check Subscription Status
 * Public page for customers to check their subscription
 */

'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { RedemptionHistoryList } from '@/components/features/redemption/RedemptionHistoryList';
import type { SubscriptionWithCustomer } from '@/types/entities';
import { useFormValidation } from '@/hooks/useFormValidation';

export default function CheckSubscriptionPage() {
  const t = useTranslations();
  const formRef = useRef<HTMLFormElement>(null);
  useFormValidation(formRef);
  const [activationCode, setActivationCode] = useState('');
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');
  const [subscription, setSubscription] = useState<SubscriptionWithCustomer | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubscription(null);
    setSearching(true);

    try {
      const response = await fetch(
        `/api/redemptions/search?query=${encodeURIComponent(activationCode)}`
      );
      const data = await response.json();

      if (response.ok && data.success && data.subscriptions.length > 0) {
        setSubscription(data.subscriptions[0]);
      } else {
        setError(t('activation.notFound'));
      }
    } catch (err) {
      setError(t('error.network'));
    } finally {
      setSearching(false);
    }
  };

  const getStatusBadge = () => {
    if (!subscription) return null;

    const variants: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
      active: 'success',
      pending_payment: 'warning',
      expired: 'danger',
      refunded: 'info',
    };

    const labels: Record<string, string> = {
      active: t('subscription.statusActive'),
      pending_payment: t('subscription.statusPending'),
      expired: t('subscription.statusExpired'),
      refunded: t('subscription.statusRefunded'),
    };

    return (
      <Badge variant={variants[subscription.status]}>
        {labels[subscription.status]}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-secondary-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary-600 mb-2">
            {t('common.appName')}
          </h1>
          <p className="text-secondary-600">
            {t('customer.checkSubscription', { defaultValue: 'تحقق من اشتراكك' })}
          </p>
        </div>

        {/* Search Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>
              {t('redemption.search')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form ref={formRef} onSubmit={handleSearch} className="space-y-4">
              {error && (
                <Alert type="error" onClose={() => setError('')}>
                  {error}
                </Alert>
              )}

              <Input
                label={t('subscription.activationCode')}
                type="text"
                value={activationCode}
                onChange={(e) => setActivationCode(e.target.value)}
                placeholder="XXXXXX"
                required
                maxLength={6}
                autoFocus
              />

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                loading={searching}
              >
                {t('common.search')}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Results */}
        {searching && (
          <div className="flex justify-center py-12">
            <Spinner size="lg" />
          </div>
        )}

        {subscription && (
          <div className="space-y-6">
            {/* Subscription Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{t('subscription.title')}</CardTitle>
                  {getStatusBadge()}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Customer Info */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-secondary-600">{t('customer.name')}</p>
                    <p className="font-bold text-lg">{subscription.customer.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-secondary-600">{t('customer.phone')}</p>
                    <p className="font-bold text-lg">{subscription.customer.phone}</p>
                  </div>
                </div>

                {/* Plan Info */}
                <div className="grid md:grid-cols-3 gap-4 bg-secondary-50 p-4 rounded-lg">
                  <div className="text-center">
                    <p className="text-sm text-secondary-600">{t('subscription.planType')}</p>
                    <p className="font-bold">
                      {subscription.planType === 'biweekly'
                        ? t('customer.biweekly', { defaultValue: 'نصف شهري' })
                        : t('customer.monthly')}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-secondary-600">{t('subscription.totalSalads')}</p>
                    <p className="font-bold text-xl">{subscription.totalSalads}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-secondary-600">
                      {t('subscription.remainingSalads')}
                    </p>
                    <p className="font-bold text-3xl text-primary-600">
                      {subscription.remainingSalads}
                    </p>
                  </div>
                </div>

                {/* Expiry Info */}
                {subscription.expiresAt && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm">
                      <span className="font-medium">{t('subscription.expiresAt')}: </span>
                      {new Date(subscription.expiresAt).toLocaleDateString('ar-SA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Redemption History */}
            <Card>
              <CardHeader>
                <CardTitle>{t('redemption.history')}</CardTitle>
              </CardHeader>
              <CardContent>
                <RedemptionHistoryList subscriptionId={subscription.id} />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
