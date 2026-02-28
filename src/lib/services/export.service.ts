/**
 * Export Service
 * Business logic for data export (CSV/Excel)
 */

import { listSubscriptions } from '@/lib/repositories/subscription.repository';
import { SubscriptionStatus, PlanType } from '@/types/entities';
import { formatDate, formatDateTime } from '@/lib/utils/date';
import { formatCurrency } from '@/lib/utils/format';

/**
 * Export subscriptions to CSV
 */
export async function exportSubscriptionsToCSV(params: {
  status?: SubscriptionStatus;
  planType?: PlanType;
  dateFrom?: Date;
  dateTo?: Date;
}): Promise<{
  success: boolean;
  csv?: string;
  filename?: string;
  error?: string;
}> {
  try {
    // Get all subscriptions matching filters
    const result = await listSubscriptions({
      ...params,
      page: 1,
      limit: 10000, // Get all matching records
    });

    if (!result.subscriptions) {
      return {
        success: false,
        error: 'فشل في جلب البيانات',
      };
    }

    // CSV Headers
    const headers = [
      'رقم الاشتراك',
      'رمز الاشتراك',
      'رمز التفعيل',
      'اسم العميل',
      'رقم الهاتف',
      'نوع الخطة',
      'السعر',
      'إجمالي السلطات',
      'السلطات المتبقية',
      'الحالة',
      'تاريخ الإنشاء',
      'تاريخ التفعيل',
      'تاريخ الانتهاء',
    ];

    // Convert subscriptions to CSV rows
    const rows = result.subscriptions.map((sub) => [
      sub.id,
      sub.subscriptionCode,
      sub.activationCode || '',
      sub.customer.name,
      sub.customer.phone,
      sub.planType === 'biweekly' ? 'نصف شهري' : 'شهري',
      sub.price.toString(),
      sub.totalSalads.toString(),
      sub.remainingSalads.toString(),
      getStatusLabel(sub.status),
      formatDate(sub.createdAt, 'ar'),
      sub.activatedAt ? formatDate(sub.activatedAt, 'ar') : '',
      sub.expiresAt ? formatDate(sub.expiresAt, 'ar') : '',
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    // Add BOM for UTF-8 encoding (for proper Arabic display in Excel)
    const csv = '\uFEFF' + csvContent;

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `subscriptions_${timestamp}.csv`;

    return {
      success: true,
      csv,
      filename,
    };
  } catch (error) {
    console.error('Export to CSV error:', error);
    return {
      success: false,
      error: 'حدث خطأ أثناء التصدير',
    };
  }
}

/**
 * Get status label in Arabic
 */
function getStatusLabel(status: SubscriptionStatus): string {
  const labels: Record<SubscriptionStatus, string> = {
    pending_payment: 'في انتظار الدفع',
    active: 'نشط',
    expired: 'منتهي',
    refunded: 'مسترجع',
  };

  return labels[status] || status;
}

/**
 * Export subscriptions summary for admin
 */
export async function exportSubscriptionsSummary(): Promise<{
  success: boolean;
  summary?: string;
  filename?: string;
  error?: string;
}> {
  try {
    const result = await listSubscriptions({
      page: 1,
      limit: 10000,
    });

    if (!result.subscriptions) {
      return {
        success: false,
        error: 'فشل في جلب البيانات',
      };
    }

    const subs = result.subscriptions;

    // Calculate summary statistics
    const totalSubscriptions = subs.length;
    const activeCount = subs.filter((s) => s.status === SubscriptionStatus.ACTIVE).length;
    const expiredCount = subs.filter((s) => s.status === SubscriptionStatus.EXPIRED).length;
    const pendingCount = subs.filter((s) => s.status === SubscriptionStatus.PENDING_PAYMENT).length;
    const refundedCount = subs.filter((s) => s.status === SubscriptionStatus.REFUNDED).length;

    const totalRevenue = subs
      .filter((s) => s.status !== SubscriptionStatus.PENDING_PAYMENT)
      .reduce((sum, s) => sum + s.price, 0);

    const totalRefunded = subs
      .filter((s) => s.status === SubscriptionStatus.REFUNDED)
      .reduce((sum, s) => sum + (s.refundAmount || 0), 0);

    const biweeklyCount = subs.filter((s) => s.planType === PlanType.BIWEEKLY).length;
    const monthlyCount = subs.filter((s) => s.planType === PlanType.MONTHLY).length;

    // Create summary text
    const summary = `
ملخص الاشتراكات
================

إجمالي الاشتراكات: ${totalSubscriptions}

حسب الحالة:
- نشط: ${activeCount}
- في انتظار الدفع: ${pendingCount}
- منتهي: ${expiredCount}
- مسترجع: ${refundedCount}

حسب النوع:
- نصف شهري: ${biweeklyCount}
- شهري: ${monthlyCount}

الإيرادات:
- إجمالي الإيرادات: ${formatCurrency(totalRevenue, 'ar')}
- إجمالي المستردات: ${formatCurrency(totalRefunded, 'ar')}
- صافي الإيرادات: ${formatCurrency(totalRevenue - totalRefunded, 'ar')}

تاريخ التقرير: ${formatDateTime(new Date(), 'ar')}
    `.trim();

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `summary_${timestamp}.txt`;

    return {
      success: true,
      summary,
      filename,
    };
  } catch (error) {
    console.error('Export summary error:', error);
    return {
      success: false,
      error: 'حدث خطأ أثناء إنشاء الملخص',
    };
  }
}
