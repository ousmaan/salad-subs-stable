/**
 * Export Button Component
 * Trigger data export with filters
 */

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/Button';
import type { SubscriptionStatus, PlanType } from '@/types/entities';

interface ExportButtonProps {
  status?: SubscriptionStatus;
  planType?: PlanType;
  dateFrom?: string;
  dateTo?: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function ExportButton({
  status,
  planType,
  dateFrom,
  dateTo,
  onSuccess,
  onError,
}: ExportButtonProps) {
  const t = useTranslations();
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);

    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (planType) params.append('planType', planType);
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);

      const response = await fetch(`/api/admin/export?${params.toString()}`);

      if (response.ok) {
        // Get filename from headers or use default
        const contentDisposition = response.headers.get('Content-Disposition');
        const filenameMatch = contentDisposition?.match(/filename="?(.+)"?/);
        const filename = filenameMatch ? filenameMatch[1] : 'subscriptions.csv';

        // Get CSV content
        const csvContent = await response.text();

        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        onSuccess?.();
      } else {
        const error = await response.json();
        onError?.(error.error?.message || t('export.exportError'));
      }
    } catch (err) {
      onError?.(t('error.network'));
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button
      variant="secondary"
      size="md"
      onClick={handleExport}
      loading={exporting}
      disabled={exporting}
    >
      <svg
        className="w-5 h-5 me-2"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
      {t('export.exportNow')}
    </Button>
  );
}
