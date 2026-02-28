/**
 * Payment Slip Print - Thermal Printer Version (80mm)
 * Optimized for thermal receipt printers
 * Based on POS app receipt design
 */

import { useRef, useEffect } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import type { Customer, Subscription } from '@/types/entities';
import { formatPhoneNumber } from '@/lib/utils/format';
import JsBarcode from 'jsbarcode';

interface PaymentSlipPrintThermalProps {
  customer: Customer;
  subscription: Subscription;
  businessName: string;
  businessPhone: string;
  daftraItemCode?: string;
  onClose?: () => void;
}

export function PaymentSlipPrintThermal({
  customer,
  subscription,
  businessName,
  businessPhone,
  daftraItemCode,
  onClose,
}: PaymentSlipPrintThermalProps) {
  const t = useTranslations();
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `payment-slip-${subscription.subscriptionCode}`,
  });

  // Format date and time
  const now = new Date();
  const dateStr = now.toLocaleDateString('ar-SA');
  const timeStr = now.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });

  // Generate barcode after component mounts
  useEffect(() => {
    if (daftraItemCode) {
      const barcodeElement = document.getElementById(`barcode-${subscription.subscriptionCode}`);
      if (barcodeElement) {
        JsBarcode(barcodeElement, daftraItemCode, {
          format: 'CODE128',
          width: 2,
          height: 50,
          displayValue: false,
          margin: 0,
        });
      }
    }
  }, [daftraItemCode, subscription.subscriptionCode]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Preview */}
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4 text-center">{t('paymentSlip.thermalPreview', { defaultValue: 'Thermal Receipt Preview' })}</h2>
          
          {/* Receipt Container */}
          <div 
            ref={printRef} 
            className="bg-white"
            style={{ 
              width: '80mm',
              margin: '0 auto',
              fontFamily: 'Cairo, Arial, sans-serif',
            }}
          >
            <style>
              {`
                @media print {
                  @page {
                    size: 80mm auto;
                    margin: 0;
                  }
                  body {
                    margin: 0;
                    padding: 0;
                  }
                  .receipt-container {
                    width: 74mm;
                    margin: 3mm;
                    font-family: 'Cairo', Arial, sans-serif;
                  }
                  .no-print {
                    display: none !important;
                  }
                }
              `}
            </style>

            <div className="receipt-container" style={{ maxWidth: '74mm', margin: '0 auto', padding: '8px' }}>
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                <div style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>
                  ★ {businessName} ★
                </div>
                <div style={{ fontSize: '11px', color: '#666' }}>
                  لكل ما تنتجه الحقول
                </div>
              </div>

              {/* Border */}
              <div style={{ borderTop: '2px dashed #000', margin: '8px 0' }}></div>

              {/* Date & Time */}
              <div style={{ fontSize: '10px', marginBottom: '8px', textAlign: 'center' }}>
                <div>{dateStr} - {timeStr}</div>
              </div>

              {/* Title */}
              <div style={{ textAlign: 'center', fontSize: '14px', fontWeight: 'bold', margin: '8px 0' }}>
                {t('paymentSlip.title')}
              </div>

              {/* Border */}
              <div style={{ borderTop: '2px dashed #000', margin: '8px 0' }}></div>

              {/* Customer Info */}
              <div style={{ fontSize: '12px', marginBottom: '8px' }}>
                <div style={{ marginBottom: '4px' }}>
                  <span style={{ fontWeight: 'bold' }}>{t('customer.name')}:</span> {customer.name}
                </div>
                <div style={{ marginBottom: '4px', direction: 'ltr', textAlign: 'right' }}>
                  <span style={{ fontWeight: 'bold', direction: 'rtl' }}>{t('customer.phone')}:</span> {formatPhoneNumber(customer.phone)}
                </div>
              </div>

              {/* Border */}
              <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>

              {/* Subscription Details */}
              <div style={{ fontSize: '12px', marginBottom: '8px' }}>
                <div style={{ marginBottom: '4px' }}>
                  <span style={{ fontWeight: 'bold' }}>{t('subscription.planType')}:</span>{' '}
                  {subscription.planType === 'biweekly' ? t('customer.biweekly', { defaultValue: 'نصف شهري' }) : t('customer.monthly')}
                </div>
                <div style={{ marginBottom: '4px' }}>
                  <span style={{ fontWeight: 'bold' }}>{t('subscription.totalSalads')}:</span> {subscription.totalSalads}
                </div>
              </div>

              {/* Border */}
              <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>

              {/* Subscription Code */}
              <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                <div style={{ fontSize: '10px', color: '#666', marginBottom: '4px' }}>
                  {t('subscription.code')}
                </div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', fontFamily: 'monospace', letterSpacing: '2px' }}>
                  {subscription.subscriptionCode.slice(0, 3)}-{subscription.subscriptionCode.slice(3)}
                </div>
              </div>

              {/* Barcode */}
              {daftraItemCode && (
                <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                  <svg id={`barcode-${subscription.subscriptionCode}`}></svg>
                  <div style={{ fontSize: '9px', marginTop: '2px', fontFamily: 'monospace' }}>
                    {daftraItemCode}
                  </div>
                </div>
              )}

              {/* Border */}
              <div style={{ borderTop: '2px dashed #000', margin: '8px 0' }}></div>

              {/* Total */}
              <div style={{ fontSize: '16px', fontWeight: 'bold', textAlign: 'center', margin: '8px 0' }}>
                <div>{t('subscription.total')}: {subscription.price} {t('common.sar', { defaultValue: 'ريال' })}</div>
              </div>

              {/* Border */}
              <div style={{ borderTop: '2px dashed #000', margin: '8px 0' }}></div>

              {/* Instructions */}
              <div style={{ fontSize: '10px', textAlign: 'center', margin: '8px 0', lineHeight: '1.4' }}>
                {t('paymentSlip.showToCashier')}
              </div>

              {/* Footer */}
              <div style={{ fontSize: '10px', textAlign: 'center', margin: '12px 0 8px 0' }}>
                ❤️ شكراً لزيارتكم ❤️
              </div>

              {/* Business Phone */}
              <div style={{ fontSize: '9px', textAlign: 'center', color: '#666' }}>
                {businessPhone}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="p-4 border-t flex gap-3 no-print">
          <Button variant="secondary" onClick={onClose} className="flex-1">
            {t('common.close')}
          </Button>
          <Button variant="primary" onClick={handlePrint} className="flex-1">
            🖨️ {t('common.print')}
          </Button>
        </div>
      </div>

    </div>
  );
}
