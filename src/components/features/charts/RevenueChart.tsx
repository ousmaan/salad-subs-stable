/**
 * Revenue Chart Component
 * Line chart showing revenue trends over time
 */

'use client';

import { useTranslations } from 'next-intl';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { RevenueTrend } from '@/types/entities';

interface RevenueChartProps {
  data: RevenueTrend[];
  locale?: 'ar' | 'en';
}

export function RevenueChart({ data, locale = 'ar' }: RevenueChartProps) {
  const t = useTranslations();

  const formattedData = data.map((item) => ({
    date: new Date(item.date).toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
      month: 'short',
      day: 'numeric',
    }),
    revenue: item.revenue,
    subscriptions: item.subscriptions,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={formattedData}>
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
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#16a34a"
          strokeWidth={2}
          name={t('dashboard.totalRevenue')}
        />
        <Line
          type="monotone"
          dataKey="subscriptions"
          stroke="#3b82f6"
          strokeWidth={2}
          name={t('navigation.subscriptions')}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
