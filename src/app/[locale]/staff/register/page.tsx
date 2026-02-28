/**
 * Customer Registration Page
 */

'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Modal } from '@/components/ui/Modal';
import { PaymentSlipPrintDigital } from '@/components/features/print/PaymentSlipPrintDigital';
import { PaymentSlipPrintThermal } from '@/components/features/print/PaymentSlipPrintThermal';
import type { Customer, Subscription, PlanConfig } from '@/types/entities';
import { normalizePhoneNumber, formatPhoneNumber, formatSubscriptionCode } from '@/lib/utils/format';
import { useFormValidation } from '@/hooks/useFormValidation';

export default function RegisterPage() {
  const t = useTranslations();
  const formRef = useRef<HTMLFormElement>(null);
  useFormValidation(formRef);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [planType, setPlanType] = useState<'biweekly' | 'monthly'>('monthly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<{
    customer: Customer;
    subscription: Subscription;
  } | null>(null);
  const [showDigitalModal, setShowDigitalModal] = useState(false);
  const [showThermalModal, setShowThermalModal] = useState(false);
  const [planConfig, setPlanConfig] = useState<PlanConfig | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      // Normalize phone number (strip country code, remove spaces)
      const normalizedPhone = normalizePhoneNumber(phone);

      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone: normalizedPhone, planType }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(true);
        setSubscriptionData({
          customer: data.customer,
          subscription: data.subscription,
        });
        
        // Fetch plan config for Daftra code
        const configResponse = await fetch('/api/admin/config');
        const configData = await configResponse.json();
        if (configResponse.ok && configData.success) {
          setPlanConfig(configData.planConfig);
        }
        
        // Reset form
        setName('');
        setPhone('');
      } else {
        setError(data.error?.message || t('customer.registrationError'));
      }
    } catch (err) {
      setError(t('error.network'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{t('customer.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          {success && subscriptionData && (
            <Alert type="success" className="mb-4">
              <div>
                <p className="font-bold mb-2">{t('customer.registrationSuccess')}</p>
                <p className="text-3xl font-mono font-bold text-primary-700">{formatSubscriptionCode(subscriptionData.subscription.subscriptionCode)}</p>
                <div className="flex gap-2 mt-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setShowDigitalModal(true)}
                    className="flex-1"
                  >
                    📄 {t('paymentSlip.digitalPreview', { defaultValue: 'Digital Preview' })}
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setShowThermalModal(true)}
                    className="flex-1"
                  >
                    🖨️ {t('paymentSlip.thermalPrint', { defaultValue: 'Print Receipt' })}
                  </Button>
                </div>
              </div>
            </Alert>
          )}

          {error && (
            <Alert type="error" onClose={() => setError('')} className="mb-4">
              {error}
            </Alert>
          )}

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            <Input
              label={t('customer.name')}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('customer.namePlaceholder')}
              required
            />

            <Input
              label={t('customer.phone')}
              type="tel"
              value={phone}
              onChange={(e) => {
                const input = e.target.value;
                // Remove all non-digit characters
                const digitsOnly = input.replace(/\D/g, '');
                // Format as user types (3-3-4)
                if (digitsOnly.length <= 10) {
                  setPhone(formatPhoneNumber(digitsOnly));
                }
              }}
              placeholder={t('customer.phonePlaceholder')}
              required
              dir="ltr"
              className="text-left"
            />

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                {t('customer.planType')} *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPlanType('biweekly')}
                  className={`p-4 border-2 rounded-lg font-medium transition-colors ${
                    planType === 'biweekly'
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-secondary-300 hover:border-primary-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="font-bold">{t('customer.biweekly', { defaultValue: 'نصف شهري' })}</div>
                    <div className="text-2xl font-bold mt-2">299 {t('common.sar', { defaultValue: 'ريال' })}</div>
                    <div className="text-sm text-secondary-600 mt-1">15 {t('subscription.meals')} {t('subscription.for')} 20 {t('subscription.days')}</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setPlanType('monthly')}
                  className={`p-4 border-2 rounded-lg font-medium transition-colors ${
                    planType === 'monthly'
                      ? 'border-primary-600 bg-primary-50 text-primary-700'
                      : 'border-secondary-300 hover:border-primary-300'
                  }`}
                >
                  <div className="text-center">
                    <div className="font-bold">{t('customer.monthly')}</div>
                    <div className="text-2xl font-bold mt-2">499 {t('common.sar', { defaultValue: 'ریال' })}</div>
                    <div className="text-sm text-secondary-600 mt-1">30 {t('subscription.meals')} {t('subscription.for')} 40 {t('subscription.days')}</div>
                  </div>
                </button>
              </div>
            </div>

            <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
              {t('customer.register')}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Digital Preview Modal */}
      {subscriptionData && showDigitalModal && planConfig && (
        <Modal
          isOpen={showDigitalModal}
          onClose={() => setShowDigitalModal(false)}
          title={t('paymentSlip.digitalPreview', { defaultValue: 'Digital Preview' })}
          size="lg"
        >
          <PaymentSlipPrintDigital
            customer={subscriptionData.customer}
            subscription={subscriptionData.subscription}
            businessName={t('common.appName')}
            businessPhone={t('config.businessPhone', { defaultValue: '+966XXXXXXXXX' })}
            daftraItemCode={
              subscriptionData.subscription.planType === 'biweekly' 
                ? planConfig.biweekly.daftraItemCode 
                : planConfig.monthly.daftraItemCode
            }
            onClose={() => {
              setShowDigitalModal(false);
              setSuccess(false);
              setSubscriptionData(null);
            }}
          />
        </Modal>
      )}

      {/* Thermal Print Modal */}
      {subscriptionData && showThermalModal && planConfig && (
        <PaymentSlipPrintThermal
          customer={subscriptionData.customer}
          subscription={subscriptionData.subscription}
          businessName={t('common.appName')}
          businessPhone={t('config.businessPhone', { defaultValue: '+966XXXXXXXXX' })}
          daftraItemCode={
            subscriptionData.subscription.planType === 'biweekly' 
              ? planConfig.biweekly.daftraItemCode 
              : planConfig.monthly.daftraItemCode
          }
          onClose={() => {
            setShowThermalModal(false);
            setSuccess(false);
            setSubscriptionData(null);
          }}
        />
      )}
    </div>
  );
}
