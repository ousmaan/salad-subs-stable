/**
 * Refund Modal Component
 * Process full or partial refunds for subscriptions
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import type { SubscriptionWithCustomer } from '@/types/entities';
import { formatSubscriptionCode } from '@/lib/utils/format';

interface RefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: SubscriptionWithCustomer;
  onSuccess: () => void;
}

export function RefundModal({ isOpen, onClose, subscription, onSuccess }: RefundModalProps) {
  const t = useTranslations('validation');
  const tCommon = useTranslations();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Set custom validation message
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const handleInvalid = (e: Event) => {
      e.preventDefault();
      if (textarea.validity.valueMissing) {
        textarea.setCustomValidity(t('required'));
      }
      textarea.reportValidity();
    };

    const handleInput = () => {
      textarea.setCustomValidity('');
    };

    textarea.addEventListener('invalid', handleInvalid);
    textarea.addEventListener('input', handleInput);

    return () => {
      textarea.removeEventListener('invalid', handleInvalid);
      textarea.removeEventListener('input', handleInput);
    };
  }, [t]);
  const [reason, setReason] = useState('');
  const [refundType, setRefundType] = useState<'full' | 'partial'>('full');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const usedSalads = subscription.totalSalads - subscription.remainingSalads;
  // Calculate refund amounts for display
  const pricePerSalad = subscription.price / subscription.totalSalads;
  const partialRefundAmount = Math.round(subscription.remainingSalads * pricePerSalad * 100) / 100;

  const handleSubmit = async () => {
    // Validate using HTML5 validation
    if (textareaRef.current && !textareaRef.current.checkValidity()) {
      textareaRef.current.reportValidity();
      return;
    }

    if (!reason.trim()) {
      setError(t('required'));
      return;
    }

    setError('');
    setProcessing(true);

    try {
      const response = await fetch(`/api/subscriptions/${subscription.id}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reason: reason.trim(),
          partialRefund: refundType === 'partial',
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        onSuccess();
        onClose();
        setReason('');
      } else {
        setError(data.error?.message || tCommon('subscription.refundError'));
      }
    } catch (err) {
      setError(tCommon('error.network'));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={tCommon('refund.title')} size="lg">
      <div className="space-y-4">
        {error && (
          <Alert type="error" onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Subscription Info */}
        <div className="bg-secondary-50 p-4 rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-secondary-600">{tCommon('customer.name')}</p>
              <p className="font-medium">{subscription.customer.name}</p>
            </div>
            <div>
              <p className="text-sm text-secondary-600">{tCommon('subscription.code')}</p>
              <p className="font-mono text-lg font-bold text-primary-700">{formatSubscriptionCode(subscription.subscriptionCode)}</p>
            </div>
            <div>
              <p className="text-sm text-secondary-600">{tCommon('refund.originalAmount')}</p>
              <p className="font-bold">{subscription.price} SAR</p>
            </div>
            <div>
              <p className="text-sm text-secondary-600">{tCommon('subscription.status')}</p>
              <p className="font-medium">{subscription.status}</p>
            </div>
          </div>
        </div>

        {/* Refund Type Selection */}
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            {tCommon('refund.refundType')}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setRefundType('full')}
              className={`p-4 border-2 rounded-lg font-medium transition-colors ${
                refundType === 'full'
                  ? 'border-primary-600 bg-primary-50 text-primary-700'
                  : 'border-secondary-300 hover:border-primary-300'
              }`}
            >
              <p className="font-bold">{tCommon('refund.fullRefund')}</p>
              <p className="text-2xl font-bold mt-1">{subscription.price} SAR</p>
            </button>
            <button
              type="button"
              onClick={() => setRefundType('partial')}
              disabled={subscription.remainingSalads === 0}
              className={`p-4 border-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                refundType === 'partial'
                  ? 'border-primary-600 bg-primary-50 text-primary-700'
                  : 'border-secondary-300 hover:border-primary-300'
              }`}
            >
              <p className="font-bold">{tCommon('refund.partialRefund')}</p>
              <p className="text-2xl font-bold mt-1">{partialRefundAmount} SAR</p>
            </button>
          </div>
        </div>

        {/* Calculation Details */}
        {refundType === 'partial' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
            <p>
              {tCommon('refund.usedSalads')}: {usedSalads}
            </p>
            <p>
              {tCommon('refund.unusedSalads')}: {subscription.remainingSalads}
            </p>
            <p className="font-bold mt-1">
              {tCommon('refund.refundAmount')}: {partialRefundAmount} SAR
            </p>
          </div>
        )}

        {/* Reason Input */}
        <div>
          <label className="block text-sm font-medium text-secondary-700 mb-2">
            {tCommon('refund.reason')} *
          </label>
          <textarea
            ref={textareaRef}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={tCommon('refund.reasonPlaceholder')}
            rows={4}
            className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            required
          />
        </div>

        {/* Warning */}
        <Alert type="warning">
          <div>
            <p className="font-bold">{tCommon('refund.refundWarning')}</p>
            <p className="text-sm mt-1">{tCommon('refund.refundConfirmation')}</p>
          </div>
        </Alert>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="secondary" size="lg" onClick={onClose} className="flex-1">
            {tCommon('common.cancel')}
          </Button>
          <Button
            variant="danger"
            size="lg"
            onClick={handleSubmit}
            loading={processing}
            className="flex-1"
          >
            {tCommon('refund.confirmRefund')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
