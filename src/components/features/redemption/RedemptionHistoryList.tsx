/**
 * Redemption History List Component
 * Displays redemption history for a subscription
 */

'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Spinner } from '@/components/ui/Spinner';
import { Alert } from '@/components/ui/Alert';
import { formatDateTime } from '@/lib/utils/date';

interface RedemptionHistoryItem {
  id: string;
  quantity: number;
  redeemedAt: Date;
  staffName: string;
}

interface RedemptionHistoryListProps {
  subscriptionId: string;
}

export function RedemptionHistoryList({ subscriptionId }: RedemptionHistoryListProps) {
  const t = useTranslations();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<RedemptionHistoryItem[]>([]);

  useEffect(() => {
    fetchHistory();
  }, [subscriptionId]);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`/api/redemptions/${subscriptionId}/history`);
      const data = await response.json();

      if (response.ok && data.success) {
        setHistory(data.redemptions);
      } else {
        setError(data.error?.message || t('error.general'));
      }
    } catch (err) {
      setError(t('error.network'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Spinner size="md" />
      </div>
    );
  }

  if (error) {
    return <Alert type="error">{error}</Alert>;
  }

  if (history.length === 0) {
    return (
      <p className="text-center text-secondary-600 py-4">{t('redemption.noHistory')}</p>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="font-medium text-secondary-900 mb-3">{t('redemption.history')}</h3>
      <div className="space-y-2">
        {history.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg"
          >
            <div>
              <p className="font-medium">
                {item.quantity} × {t('redemption.dispensed')}
              </p>
              <p className="text-sm text-secondary-600">
                {t('common.by', { defaultValue: 'By' })}: {item.staffName}
              </p>
            </div>
            <p className="text-sm text-secondary-600">
              {formatDateTime(item.redeemedAt, 'ar')}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
