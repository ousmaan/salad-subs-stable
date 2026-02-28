/**
 * Admin Configuration Page
 */

'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';
import type { PlanConfig, BusinessConfig } from '@/types/entities';

export default function ConfigPage() {
  const t = useTranslations();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [planConfig, setPlanConfig] = useState<PlanConfig>({
    biweekly: { price: 75, salads: 15, validityDays: 15, gracePeriodDays: 3 },
    monthly: { price: 180, salads: 30, validityDays: 30, gracePeriodDays: 5 },
  });

  const [businessConfig, setBusinessConfig] = useState<BusinessConfig>({
    nameAr: '',
    nameEn: '',
    phone: '',
    address: '',
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/admin/config');
      const data = await response.json();

      if (response.ok && data.success) {
        setPlanConfig(data.planConfig);
        setBusinessConfig(data.businessConfig);
      } else {
        setError(data.error?.message || t('error.general'));
      }
    } catch (err) {
      setError(t('error.network'));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const response = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planConfig, businessConfig }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccess(t('config.settingsSaved'));
      } else {
        setError(data.error?.message || t('config.settingsError'));
      }
    } catch (err) {
      setError(t('error.network'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold text-secondary-900">{t('config.title')}</h1>
      </div>

      {success && <Alert type="success" onClose={() => setSuccess('')}>{success}</Alert>}
      {error && <Alert type="error" onClose={() => setError('')}>{error}</Alert>}

      {/* Plan Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>{t('config.planConfiguration')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Bi-weekly Plan */}
          <div>
            <h3 className="font-medium text-lg mb-3">{t('config.biweeklyPlan', { defaultValue: 'Bi-weekly Plan (15 Days)' })}</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <Input
                label={t('config.price')}
                type="number"
                value={planConfig.biweekly.price}
                onChange={(e) =>
                  setPlanConfig({
                    ...planConfig,
                    biweekly: { ...planConfig.biweekly, price: Number(e.target.value) },
                  })
                }
              />
              <Input
                label={t('config.salads')}
                type="number"
                value={planConfig.biweekly.salads}
                onChange={(e) =>
                  setPlanConfig({
                    ...planConfig,
                    biweekly: { ...planConfig.biweekly, salads: Number(e.target.value) },
                  })
                }
              />
              <Input
                label={t('config.validityDays')}
                type="number"
                value={planConfig.biweekly.validityDays}
                onChange={(e) =>
                  setPlanConfig({
                    ...planConfig,
                    biweekly: { ...planConfig.biweekly, validityDays: Number(e.target.value) },
                  })
                }
              />
              <Input
                label={t('config.gracePeriodDays')}
                type="number"
                value={planConfig.biweekly.gracePeriodDays}
                onChange={(e) =>
                  setPlanConfig({
                    ...planConfig,
                    biweekly: { ...planConfig.biweekly, gracePeriodDays: Number(e.target.value) },
                  })
                }
              />
            </div>
            <div className="mt-4">
              <Input
                label={t('config.daftraItemCode', { defaultValue: 'Daftra Item Code (Barcode)' })}
                type="text"
                value={planConfig.biweekly.daftraItemCode || ''}
                onChange={(e) =>
                  setPlanConfig({
                    ...planConfig,
                    biweekly: { ...planConfig.biweekly, daftraItemCode: e.target.value },
                  })
                }
                placeholder="123456781234567812"
              />
            </div>
          </div>

          {/* Monthly Plan */}
          <div>
            <h3 className="font-medium text-lg mb-3">{t('config.monthlyPlan')}</h3>
            <div className="grid md:grid-cols-4 gap-4">
              <Input
                label={t('config.price')}
                type="number"
                value={planConfig.monthly.price}
                onChange={(e) =>
                  setPlanConfig({
                    ...planConfig,
                    monthly: { ...planConfig.monthly, price: Number(e.target.value) },
                  })
                }
              />
              <Input
                label={t('config.salads')}
                type="number"
                value={planConfig.monthly.salads}
                onChange={(e) =>
                  setPlanConfig({
                    ...planConfig,
                    monthly: { ...planConfig.monthly, salads: Number(e.target.value) },
                  })
                }
              />
              <Input
                label={t('config.validityDays')}
                type="number"
                value={planConfig.monthly.validityDays}
                onChange={(e) =>
                  setPlanConfig({
                    ...planConfig,
                    monthly: { ...planConfig.monthly, validityDays: Number(e.target.value) },
                  })
                }
              />
              <Input
                label={t('config.gracePeriodDays')}
                type="number"
                value={planConfig.monthly.gracePeriodDays}
                onChange={(e) =>
                  setPlanConfig({
                    ...planConfig,
                    monthly: { ...planConfig.monthly, gracePeriodDays: Number(e.target.value) },
                  })
                }
              />
            </div>
            <div className="mt-4">
              <Input
                label={t('config.daftraItemCode', { defaultValue: 'Daftra Item Code (Barcode)' })}
                type="text"
                value={planConfig.monthly.daftraItemCode || ''}
                onChange={(e) =>
                  setPlanConfig({
                    ...planConfig,
                    monthly: { ...planConfig.monthly, daftraItemCode: e.target.value },
                  })
                }
                placeholder="123456781234567813"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Business Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>{t('config.businessInfo')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Input
              label={t('config.businessNameAr')}
              type="text"
              value={businessConfig.nameAr}
              onChange={(e) =>
                setBusinessConfig({ ...businessConfig, nameAr: e.target.value })
              }
            />
            <Input
              label={t('config.businessNameEn')}
              type="text"
              value={businessConfig.nameEn}
              onChange={(e) =>
                setBusinessConfig({ ...businessConfig, nameEn: e.target.value })
              }
            />
          </div>
          <Input
            label={t('config.businessPhone')}
            type="tel"
            value={businessConfig.phone}
            onChange={(e) => setBusinessConfig({ ...businessConfig, phone: e.target.value })}
          />
          <Input
            label={t('config.businessAddress')}
            type="text"
            value={businessConfig.address}
            onChange={(e) => setBusinessConfig({ ...businessConfig, address: e.target.value })}
          />
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button variant="primary" size="lg" fullWidth onClick={handleSave} loading={saving}>
        {t('config.saveSettings')}
      </Button>
    </div>
  );
}
