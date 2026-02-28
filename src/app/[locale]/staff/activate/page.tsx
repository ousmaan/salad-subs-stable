/**
 * Subscription Activation Page
 */

'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { ActivationCodePrint } from '@/components/features/print/ActivationCodePrint';
import type { SubscriptionWithCustomer } from '@/types/entities';
import { formatPhoneNumber, formatSubscriptionCode } from '@/lib/utils/format';

export default function ActivatePage() {
  const t = useTranslations();
  const [searchQuery, setSearchQuery] = useState('');
  const [allSubscriptions, setAllSubscriptions] = useState<SubscriptionWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedSubscription, setSelectedSubscription] = useState<SubscriptionWithCustomer | null>(null);
  const [activatedSubscription, setActivatedSubscription] = useState<SubscriptionWithCustomer | null>(null);
  const [activationCode, setActivationCode] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [showActivationModal, setShowActivationModal] = useState(false);

  const loadPendingSubscriptions = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/subscriptions/pending');
      const data = await response.json();

      if (response.ok && data.success) {
        setAllSubscriptions(data.subscriptions || []);
      } else {
        setError(data.error?.message || t('redemption.failedToLoad'));
      }
    } catch (err) {
      setError(t('redemption.networkError'));
    } finally {
      setLoading(false);
    }
  };

  // Load all pending subscriptions on mount
  useEffect(() => {
    loadPendingSubscriptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter subscriptions based on search query (client-side for instant results)
  const filteredSubscriptions = useMemo(() => {
    console.log('[Activate] Filtering subscriptions, query:', searchQuery);
    if (!searchQuery.trim()) {
      return allSubscriptions;
    }

    const query = searchQuery.toLowerCase().trim();
    return allSubscriptions.filter((sub) => {
      const searchText = [
        sub.customer?.name || '',
        sub.customer?.phone || '',
        sub.subscriptionCode || '',
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchText.includes(query);
    });
  }, [allSubscriptions, searchQuery]);

  const openActivationModal = (subscription: SubscriptionWithCustomer) => {
    setSelectedSubscription(subscription);
    setReceiptNumber('');
    setShowActivationModal(true);
  };

  const handleActivate = async () => {
    if (!selectedSubscription) return;
    
    console.log('[Activate] Starting activation for:', selectedSubscription.id);
    setError('');
    setSuccess('');
    setActivating(true);

    try {
      const response = await fetch('/api/subscriptions/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: selectedSubscription.id,
          paymentConfirmed: true,
          receiptNumber: receiptNumber || undefined,
        }),
      });

      console.log('[Activate] Response status:', response.status);
      const data = await response.json();
      console.log('[Activate] Response data:', data);

      if (response.ok && data.success) {
        console.log('[Activate] Success! Activation code:', data.activationCode);
        setActivationCode(data.activationCode);
        setActivatedSubscription(data.subscription);
        setSelectedSubscription(null);
        setShowActivationModal(false);
        setReceiptNumber('');
        setSuccess(t('redemption.activatedSuccessfully'));
        // Reload to remove from pending list
        loadPendingSubscriptions();
      } else {
        console.error('[Activate] Activation failed:', data.error);
        setError(data.error?.message || t('redemption.failedToLoad'));
      }
    } catch (err) {
      console.error('[Activate] Exception:', err);
      setError(t('redemption.networkError'));
    } finally {
      setActivating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{t('activation.activateSubscriptions')}</span>
            {!loading && (
              <span className="text-sm font-normal text-secondary-600">
                {t('activation.pendingPaymentCount', {count: filteredSubscriptions.length})}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert type="error" onClose={() => setError('')} className="mb-4">
              {error}
            </Alert>
          )}

          {success && (
            <Alert type="success" onClose={() => setSuccess('')} className="mb-4">
              {success}
            </Alert>
          )}

          <Input
            label={t('redemption.searchByNamePhoneCode')}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('redemption.typeToFilter')}
            className="mb-4"
          />

          {loading && (
            <div className="flex justify-center py-8">
              <Spinner size="lg" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Subscriptions List */}
      {!loading && !activationCode && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-orange-700">
              {t('redemption.pendingPayment')} ({filteredSubscriptions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredSubscriptions.map((sub) => (
              <div
                key={sub.id}
                className="border-2 border-orange-300 rounded-lg p-4 bg-orange-50"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="font-bold text-lg">{sub.customer.name}</p>
                    <p className="text-sm text-secondary-600" dir="ltr">
                      {formatPhoneNumber(sub.customer.phone)}
                    </p>
                  </div>
                  <Badge variant="warning">{t('redemption.pendingPayment')}</Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-3 mb-3 text-sm">
                  <div>
                    <p className="text-secondary-600">{t('activation.plan')}</p>
                    <p className="font-medium">
                      {sub.planType === 'biweekly' ? t('customer.biweekly', { defaultValue: 'نصف شهري' }) : t('customer.monthly')}
                    </p>
                  </div>
                  <div>
                    <p className="text-secondary-600">{t('activation.salads')}</p>
                    <p className="font-bold text-primary-600">{sub.totalSalads}</p>
                  </div>
                  <div>
                    <p className="text-secondary-600">{t('activation.price')}</p>
                    <p className="font-bold text-primary-600">{sub.price} {t('common.currency')}</p>
                  </div>
                </div>

                <div className="mb-3 text-sm">
                  <p className="text-secondary-600">{t('activation.subscriptionCode')}</p>
                  <p className="font-mono text-xl font-bold text-primary-700">{formatSubscriptionCode(sub.subscriptionCode)}</p>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  fullWidth
                  onClick={() => openActivationModal(sub)}
                  disabled={activating}
                >
                  {t('activation.paymentConfirmed')}
                </Button>
              </div>
            ))}

            {filteredSubscriptions.length === 0 && !loading && (
              <div className="text-center py-8 text-secondary-600">
                {t('redemption.noSubscriptionsFound')}
                {searchQuery && ` ${searchQuery}`}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Activation Modal */}
      {showActivationModal && selectedSubscription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>{t('activation.confirmPayment')}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-secondary-600 mb-1">{t('customer.name')}</p>
                <p className="font-medium">{selectedSubscription.customer.name}</p>
              </div>
              <div>
                <p className="text-sm text-secondary-600 mb-1">{t('subscription.subscriptionCode')}</p>
                <p className="font-mono font-bold text-primary-700">{formatSubscriptionCode(selectedSubscription.subscriptionCode)}</p>
              </div>
              <div>
                <p className="text-sm text-secondary-600 mb-1">{t('activation.price')}</p>
                <p className="font-bold text-primary-600">{selectedSubscription.price} {t('common.currency')}</p>
              </div>
              
              <Input
                label={t('activation.receiptNumber')}
                placeholder={t('activation.receiptNumberPlaceholder')}
                type="text"
                maxLength={5}
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value.replace(/\D/g, ''))}
                helperText={t('activation.receiptNumberHelper')}
              />

              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  fullWidth
                  onClick={() => {
                    setShowActivationModal(false);
                    setReceiptNumber('');
                  }}
                  disabled={activating}
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleActivate}
                  loading={activating}
                  disabled={activating}
                >
                  {t('activation.confirm')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Activation Receipt with OTP */}
      {activationCode && activatedSubscription && (
        <ActivationCodePrint
          subscription={activatedSubscription}
          activationCode={activationCode}
          businessName={t('common.appName')}
          onClose={() => {
            setActivationCode('');
            setActivatedSubscription(null);
            setSearchQuery('');
          }}
        />
      )}
    </div>
  );
}
