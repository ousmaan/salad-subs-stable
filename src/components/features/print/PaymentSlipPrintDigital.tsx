/**
 * Payment Slip Print Component
 * Professional printable payment slip with barcode
 */

'use client';

import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import { BarcodeDisplay } from '@/components/features/barcode/BarcodeDisplay';
import type { Customer, Subscription } from '@/types/entities';
import { formatSubscriptionCode, formatPhoneNumber } from '@/lib/utils/format';

interface PaymentSlipPrintProps {
  customer: Customer;
  subscription: Subscription;
  businessName: string;
  businessPhone?: string;
  daftraItemCode?: string;
  onClose?: () => void;
}

/**
 * Digital version - for screen preview and PDF export
 * Archived from original PaymentSlipPrint.tsx
 * Use PaymentSlipPrintThermal.tsx for actual thermal printer (80mm)
 */
export function PaymentSlipPrintDigital({
  customer,
  subscription,
  businessName,
  businessPhone,
  daftraItemCode,
  onClose,
}: PaymentSlipPrintProps) {
  const t = useTranslations();
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Payment-Slip-${subscription.subscriptionCode}`,
  });

  const planName = subscription.planType === 'biweekly' ? t('customer.biweekly', { defaultValue: 'نصف شهري' }) : t('customer.monthly');
  
  // Debug: Check what barcode value we're using
  console.log('Daftra Item Code:', daftraItemCode);
  console.log('Subscription Code:', subscription.subscriptionCode);
  console.log('Barcode Value:', daftraItemCode || subscription.subscriptionCode);

  return (
    <div className="space-y-4">
      {/* Print Preview */}
      <div
        ref={componentRef}
        className="bg-white p-8 rounded-lg border-2 border-secondary-200 print:border-0"
      >
        {/* Header */}
        <div className="text-center mb-6 pb-4 border-b-2 border-secondary-300">
          <h1 className="text-3xl font-bold text-primary-600 mb-2">{businessName}</h1>
          {businessPhone && <p className="text-secondary-600">{businessPhone}</p>}
          <h2 className="text-xl font-bold mt-4">{t('paymentSlip.title')}</h2>
        </div>

        {/* Customer Info */}
        <div className="mb-6 space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-secondary-600">{t('customer.name')}</p>
              <p className="font-bold text-lg">{customer.name}</p>
            </div>
            <div>
              <p className="text-sm text-secondary-600">{t('customer.phone')}</p>
              <p className="font-bold text-lg" dir="ltr" style={{ textAlign: 'right' }}>{formatPhoneNumber(customer.phone)}</p>
            </div>
          </div>
        </div>

        {/* Subscription Details */}
        <div className="mb-6 bg-secondary-50 p-4 rounded-lg">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-secondary-600">{t('subscription.planType')}</p>
              <p className="font-bold text-lg">{planName}</p>
            </div>
            <div>
              <p className="text-sm text-secondary-600">{t('subscription.price')}</p>
              <p className="font-bold text-2xl text-primary-600">
                {subscription.price} {t('common.currency', { defaultValue: 'SAR' })}
              </p>
            </div>
            <div>
              <p className="text-sm text-secondary-600">{t('subscription.totalSalads')}</p>
              <p className="font-bold text-lg">{subscription.totalSalads}</p>
            </div>
            <div>
              <p className="text-sm text-secondary-600">{t('subscription.code')}</p>
              <p className="font-mono font-bold text-3xl text-primary-600 tracking-wider">
                {formatSubscriptionCode(subscription.subscriptionCode)}
              </p>
            </div>
          </div>
        </div>

        {/* Barcode */}
        <div className="mb-6 text-center">
          <p className="text-sm text-secondary-600 mb-2">{t('paymentSlip.scanToPay')}</p>
          <BarcodeDisplay
            value={daftraItemCode || subscription.subscriptionCode}
            width={2}
            height={60}
            displayValue={true}
            className="mx-auto"
          />
        </div>

        {/* Instructions */}
        <div className="mb-6 bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
          <h3 className="font-bold mb-3">{t('paymentSlip.instructions')}</h3>
          <ol className="list-decimal list-inside space-y-2">
            <li>{t('paymentSlip.instruction1')}</li>
            <li>{t('paymentSlip.instruction2')}</li>
            <li>{t('paymentSlip.instruction3')}</li>
          </ol>
        </div>

        {/* Footer */}
        <div className="text-center pt-4 border-t-2 border-secondary-300">
          <p className="text-lg font-bold text-primary-600">{t('paymentSlip.thankYou')}</p>
          <p className="text-sm text-secondary-600 mt-2">
            {new Date().toLocaleDateString('ar-SA', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
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
