/**
 * Redemption Page - Redesigned with listing + live filtering
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
import type { SubscriptionWithCustomer, SubscriptionStatus } from '@/types/entities';
import { formatPhoneNumber, formatSubscriptionCode } from '@/lib/utils/format';

export default function RedeemPage() {
  const t = useTranslations();
  const [searchQuery, setSearchQuery] = useState('');
  const [allSubscriptions, setAllSubscriptions] = useState<SubscriptionWithCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [dispensing, setDispensing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedSub, setSelectedSub] = useState<SubscriptionWithCustomer | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [otpInput, setOtpInput] = useState('');
  const [showOtpReference, setShowOtpReference] = useState(false);
  const [editingQuantity, setEditingQuantity] = useState(false);

  // Load all subscriptions on mount
  useEffect(() => {
    loadAllSubscriptions();
  }, []);

  const loadAllSubscriptions = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/redemptions/list');
      const data = await response.json();

      if (response.ok && data.success) {
        setAllSubscriptions(data.subscriptions || []);
      } else {
        setError(data.error?.message || 'Failed to load subscriptions');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  // Filter subscriptions based on search query (client-side for instant results)
  const filteredSubscriptions = useMemo(() => {
    if (!searchQuery.trim()) {
      return allSubscriptions;
    }

    const query = searchQuery.toLowerCase().trim();
    return allSubscriptions.filter((sub) => {
      const searchText = [
        sub.customer.name,
        sub.customer.phone,
        sub.subscriptionCode,
        sub.activationCode,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchText.includes(query);
    });
  }, [allSubscriptions, searchQuery]);

  // Group subscriptions by status
  const groupedSubscriptions = useMemo(() => {
    const groups = {
      active: [] as SubscriptionWithCustomer[],
      pending_payment: [] as SubscriptionWithCustomer[],
      expired: [] as SubscriptionWithCustomer[],
      refunded: [] as SubscriptionWithCustomer[],
    };

    filteredSubscriptions.forEach((sub) => {
      if (groups[sub.status as keyof typeof groups]) {
        groups[sub.status as keyof typeof groups].push(sub);
      }
    });

    return groups;
  }, [filteredSubscriptions]);

  const handleDispense = async () => {
    if (!selectedSub) return;

    setError('');
    setSuccess('');
    setDispensing(true);

    try {
      console.log('[Dispense] Request:', {
        subscriptionId: selectedSub.id,
        quantity,
        otpCode: otpInput,
      });

      const response = await fetch('/api/redemptions/dispense', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriptionId: selectedSub.id,
          quantity,
          otpCode: otpInput,
        }),
      });

      const data = await response.json();
      console.log('[Dispense] Response:', data);

      if (response.ok && data.success) {
        setSuccess(`Successfully dispensed ${quantity} salad(s)`);
        setSelectedSub(null);
        setQuantity(1);
        setOtpInput('');
        setShowOtpReference(false);
        setEditingQuantity(false);
        // Reload subscriptions to get updated data
        loadAllSubscriptions();
      } else {
        console.error('[Dispense] Error:', data.error);
        setError(data.error?.message || 'Failed to dispense salads');
      }
    } catch (err) {
      console.error('[Dispense] Exception:', err);
      setError(`Network error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setDispensing(false);
    }
  };

  const getStatusBadge = (status: SubscriptionStatus) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">{t('redemption.active')}</Badge>;
      case 'pending_payment':
        return <Badge variant="warning">{t('redemption.pendingPayment')}</Badge>;
      case 'expired':
        return <Badge variant="error">{t('subscription.statusExpired')}</Badge>;
      case 'refunded':
        return <Badge variant="secondary">{t('subscription.statusRefunded')}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const renderSubscriptionCard = (sub: SubscriptionWithCustomer, clickable = true) => (
    <div
      key={sub.id}
      className={`border rounded-lg p-4 transition-colors ${
        clickable ? 'hover:border-primary-500 cursor-pointer hover:shadow-md' : ''
      } ${sub.status === 'active' && sub.remainingSalads > 0 ? 'border-l-4 border-l-primary-500' : ''}`}
      onClick={() => {
        if (clickable && sub.status === 'active' && sub.remainingSalads > 0) {
          setSelectedSub(sub);
          setShowOtpReference(false);
          setEditingQuantity(false);
          setQuantity(1);
        }
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="font-bold text-lg">{sub.customer.name}</p>
        {getStatusBadge(sub.status)}
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div>
          <span className="text-secondary-600">{t('redemption.phone')}: </span>
          <span className="font-medium" dir="ltr">{formatPhoneNumber(sub.customer.phone)}</span>
        </div>
        <div>
          <span className="text-secondary-600">{t('subscription.code')}: </span>
          <span className="font-mono font-bold text-primary-700">{formatSubscriptionCode(sub.subscriptionCode)}</span>
        </div>
        <div>
          <span className="text-secondary-600">{t('subscription.planType')}: </span>
          <span className="font-medium">
            {sub.planType === 'biweekly' ? t('customer.biweekly', { defaultValue: 'نصف شهري' }) : t('customer.monthly')}
          </span>
        </div>
        <div>
          <span className="text-secondary-600">{t('redemption.remaining')}: </span>
          <span className={`font-bold ${sub.remainingSalads > 0 ? 'text-primary-600' : 'text-secondary-400'}`}>
            {sub.remainingSalads} / {sub.totalSalads}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>{t('redemption.dispenseSalads')}</span>
            {!loading && (
              <span className="text-sm font-normal text-secondary-600">
                {filteredSubscriptions.length === 1 ? t('redemption.subscriptionCount', {count: filteredSubscriptions.length}) : t('redemption.subscriptionCountPlural', {count: filteredSubscriptions.length})}
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

      {/* Subscriptions List by Status */}
      {!loading && !selectedSub && (
        <>
          {/* Active Subscriptions */}
          {groupedSubscriptions.active.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-green-700">
                  {t('redemption.active')} ({groupedSubscriptions.active.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {groupedSubscriptions.active.map((sub) => renderSubscriptionCard(sub, true))}
              </CardContent>
            </Card>
          )}

          {/* Pending Payment */}
          {groupedSubscriptions.pending_payment.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-yellow-700">
                  {t('redemption.pendingPayment')} ({groupedSubscriptions.pending_payment.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {groupedSubscriptions.pending_payment.map((sub) => renderSubscriptionCard(sub, false))}
              </CardContent>
            </Card>
          )}

          {/* Expired */}
          {groupedSubscriptions.expired.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-red-700">
                  {t('subscription.statusExpired')} ({groupedSubscriptions.expired.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {groupedSubscriptions.expired.map((sub) => renderSubscriptionCard(sub, false))}
              </CardContent>
            </Card>
          )}

          {/* Refunded */}
          {groupedSubscriptions.refunded.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-gray-700">
                  Refunded ({groupedSubscriptions.refunded.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {groupedSubscriptions.refunded.map((sub) => renderSubscriptionCard(sub, false))}
              </CardContent>
            </Card>
          )}

          {/* No Results */}
          {filteredSubscriptions.length === 0 && !loading && (
            <Card>
              <CardContent className="text-center py-8 text-secondary-600">
                {t('redemption.noSubscriptionsFound')}
                {searchQuery && ` ${searchQuery}`}
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Dispense Card */}
      {selectedSub && (
        <Card className="border-2 border-primary-500">
          <CardHeader className="bg-primary-50">
            <CardTitle className="text-primary-700">{t('redemption.dispenseSalads')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-secondary-50 p-4 rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-secondary-600">{t('redemption.customerName')}</p>
                  <p className="font-medium text-lg">{selectedSub.customer.name}</p>
                </div>
                <div>
                  <p className="text-sm text-secondary-600">{t('redemption.phone')}</p>
                  <p className="font-medium" dir="ltr">{formatPhoneNumber(selectedSub.customer.phone)}</p>
                </div>
                <div>
                  <p className="text-sm text-secondary-600">{t('redemption.activationCode')}</p>
                  <p className="font-mono font-bold text-lg">{selectedSub.activationCode}</p>
                </div>
                <div>
                  <p className="text-sm text-secondary-600">{t('redemption.remainingSalads')}</p>
                  <p className="font-bold text-3xl text-primary-600">{selectedSub.remainingSalads}</p>
                </div>
              </div>
            </div>

            <div>
              {!editingQuantity ? (
                <div className="bg-gradient-to-br from-primary-50 to-primary-100 border-2 border-primary-400 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold text-primary-700 mb-1">
                        {t('redemption.selectQuantity')}
                      </p>
                      <p className="text-4xl font-bold text-primary-700 tabular-nums">{quantity}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setEditingQuantity(true)}
                      className="bg-white hover:bg-primary-50 border-2 border-primary-400 text-primary-700 font-medium px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2 text-sm"
                    >
                      <span>✏️</span>
                      <span>{t('common.edit')}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-white border-2 border-primary-400 rounded-lg p-3 shadow-lg">
                  <p className="text-xs font-medium text-secondary-600 mb-2 text-center">
                    {t('redemption.selectQuantity')}
                  </p>
                  <div className="flex gap-2 mb-2">
                    {[1, 2, 3, 4, 5].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => {
                          setQuantity(num);
                          setEditingQuantity(false);
                        }}
                        disabled={num > selectedSub.remainingSalads}
                        className={`flex-1 py-2 border-2 rounded-lg font-bold text-base transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed ${
                          quantity === num
                            ? 'border-primary-600 bg-primary-600 text-white shadow-md'
                            : 'border-secondary-300 bg-white text-secondary-700 hover:border-primary-400 hover:bg-primary-50'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingQuantity(false)}
                    className="w-full py-1 text-xs text-secondary-500 hover:text-secondary-700 transition-colors"
                  >
                    {t('common.cancel')}
                  </button>
                </div>
              )}
            </div>

            {/* OTP Input */}
            <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🔒</span>
                  <label className="block text-sm font-bold text-yellow-800">
                    {t('redemption.enterSecurityCode')} *
                  </label>
                </div>
                {selectedSub.otpCode && (
                  <button
                    type="button"
                    onClick={() => {
                      setOtpInput(selectedSub.otpCode || '');
                      setShowOtpReference(true);
                    }}
                    className="text-xs bg-blue-500 hover:bg-blue-600 text-white font-medium px-3 py-1.5 rounded-md transition-colors flex items-center gap-1"
                  >
                    <span>ℹ️</span>
                    <span>{t('redemption.autoFillCode')}</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-secondary-600 mb-3">
                {t('redemption.askCustomerForCode')}
              </p>
              <input
                type="text"
                value={otpInput}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                  setOtpInput(value);
                  if (value !== selectedSub.otpCode) {
                    setShowOtpReference(false);
                  }
                }}
                placeholder={t('redemption.enterFourDigitCode')}
                maxLength={4}
                className="w-full px-3 py-2 border border-secondary-300 rounded-lg text-center text-2xl font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
              {showOtpReference && selectedSub.otpCode && otpInput === selectedSub.otpCode && (
                <p className="text-xs text-blue-600 mt-2 text-center font-medium">
                  ✓ {t('redemption.customerForgotCode')}
                </p>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="lg"
                className="flex-1"
                onClick={() => {
                  setSelectedSub(null);
                  setShowOtpReference(false);
                  setEditingQuantity(false);
                  setQuantity(1);
                }}
                disabled={dispensing}
              >
                {t('redemption.cancel')}
              </Button>
              <Button
                variant="primary"
                size="lg"
                className="flex-1"
                onClick={handleDispense}
                loading={dispensing}
              >
                {t('redemption.dispense')} ({quantity})
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
