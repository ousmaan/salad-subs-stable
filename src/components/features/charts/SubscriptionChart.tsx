/**
 * Subscription Chart Component
 * Bar/Area chart showing subscription trends by plan type
 */

'use client';

import { useTranslations } from 'next-intl';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { SubscriptionTrend } from '@/types/entities';

interface SubscriptionChartProps {
  data: SubscriptionTrend[];
  locale?: 'ar' | 'en';
}

export function SubscriptionChart({ data, locale = 'ar' }: SubscriptionChartProps) {
  const t = useTranslations();

  const formattedData = data.map((item) => ({
    date: new Date(item.date).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
      month: 'short',
      day: 'numeric',
    }),
    weekly: item.weekly,
    monthly: item.monthly,
    total: item.total,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={formattedData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
          }}
        />
        <Legend />
        <Area
          type="monotone"
          dataKey="weekly"
          stackId="1"
          stroke="#3b82f6"
          fill="#3b82f6"
          name={t('customer.weekly')}
        />
        <Area
          type="monotone"
          dataKey="monthly"
          stackId="1"
          stroke="#8b5cf6"
          fill="#8b5cf6"
          name={t('customer.monthly')}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
