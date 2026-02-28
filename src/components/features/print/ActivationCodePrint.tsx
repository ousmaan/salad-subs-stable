/**
 * Activation Code Print Component
 * Professional printable activation code receipt
 */

'use client';

import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { QRCodeDisplay } from '@/components/features/barcode/QRCodeDisplay';
import { formatPhoneNumber } from '@/lib/utils/format';
import type { SubscriptionWithCustomer } from '@/types/entities';

interface ActivationCodePrintProps {
  subscription: SubscriptionWithCustomer;
  activationCode: string;
  businessName: string;
  onClose?: () => void;
}

export function ActivationCodePrint({
  subscription,
  activationCode,
  businessName,
  onClose,
}: ActivationCodePrintProps) {
  const t = useTranslations();
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Activation-Code-${activationCode}`,
  });

  const planName = subscription.planType === 'biweekly' ? t('customer.biweekly', { defaultValue: 'نصف شهري' }) : t('customer.monthly');

  return (
    <div className="space-y-4">
      {/* Print Preview */}
      <div
        ref={componentRef}
        className="bg-white p-8 rounded-lg border-2 border-green-500 print:border-0"
      >
        {/* Header */}
        <div className="text-center mb-6 pb-4 border-b-2 border-green-500">
          <h1 className="text-3xl font-bold text-green-600 mb-2">{businessName}</h1>
          <h2 className="text-xl font-bold mt-2">{t('activation.activationCodeTitle')}</h2>
        </div>

        {/* Customer Info */}
        <div className="mb-6 space-y-2">
          <div>
            <p className="text-sm text-secondary-600">{t('customer.name')}</p>
            <p className="font-bold text-lg">{subscription.customer.name}</p>
          </div>
          <div>
            <p className="text-sm text-secondary-600">{t('customer.phone')}</p>
            <p className="font-bold text-lg">{formatPhoneNumber(subscription.customer.phone)}</p>
          </div>
        </div>

        {/* Activation Code - Large Display */}
        <div className="mb-6 bg-green-50 border-4 border-green-500 rounded-lg p-8 text-center">
          <p className="text-sm text-secondary-600 mb-2">{t('subscription.activationCode')}</p>
          <p className="font-mono font-bold text-6xl text-green-600 tracking-wider">
            {activationCode}
          </p>
        </div>

        {/* OTP Code - Security Verification */}
        {subscription.otpCode && (
          <div className="mb-6 bg-yellow-50 border-4 border-yellow-500 rounded-lg p-6 text-center">
            <p className="text-sm font-bold text-yellow-800 mb-3">
              🔒 Security Code for Redemption
            </p>
            <p className="text-xs text-secondary-600 mb-2">
              Customer must provide this 4-digit code when redeeming salads
            </p>
            <p className="font-mono font-bold text-5xl text-yellow-600 tracking-widest">
              {subscription.otpCode}
            </p>
            <p className="text-xs text-red-600 font-bold mt-3">
              ⚠️ Keep this code private - Required for every redemption
            </p>
          </div>
        )}

        {/* QR Code */}
        <div className="mb-6 text-center">
          <QRCodeDisplay value={activationCode} size={200} className="mx-auto" />
        </div>

        {/* Subscription Info */}
        <div className="mb-6 bg-secondary-50 p-4 rounded-lg">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-secondary-600">{t('subscription.planType')}</p>
              <p className="font-bold">{planName}</p>
            </div>
            <div>
              <p className="text-sm text-secondary-600">{t('subscription.totalSalads')}</p>
              <p className="font-bold text-xl text-primary-600">{subscription.totalSalads}</p>
            </div>
            <div>
              <p className="text-sm text-secondary-600">{t('subscription.expiresAt')}</p>
              <p className="font-bold">
                {subscription.expiresAt
                  ? new Date(subscription.expiresAt).toLocaleDateString('ar-SA', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                  : '-'}
              </p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mb-6 bg-green-50 border-2 border-green-300 rounded-lg p-4">
          <h3 className="font-bold mb-2 text-green-800">
            {t('activation.activationCodeMessage')}
          </h3>
          <p className="text-secondary-700">
            {t('activation.giveToCustomer', { defaultValue: 'قدم هذا الرمز للعميل' })}
          </p>
        </div>

        {/* Footer */}
        <div className="text-center pt-4 border-t-2 border-green-500">
          <p className="text-lg font-bold text-green-600">{t('paymentSlip.thankYou')}</p>
          <p className="text-sm text-secondary-600 mt-2">
            {new Date().toLocaleDateString('ar-SA', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 print:hidden">
        <Button variant="primary" size="lg" onClick={handlePrint} className="flex-1">
          {t('common.print')}
        </Button>
        {onClose && (
          <Button variant="secondary" size="lg" onClick={onClose} className="flex-1">
            {t('common.close')}
          </Button>
        )}
      </div>
    </div>
  );
}
