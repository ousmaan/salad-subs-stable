/**
 * Export Data API Route
 * GET /api/admin/export
 */

import { NextRequest, NextResponse } from 'next/server';
import { exportSubscriptionsToCSV } from '@/lib/services/export.service';
import { ApiError } from '@/types/api.types';
import { SubscriptionStatus, PlanType } from '@/types/entities';

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const adminSession = request.cookies.get('admin_session')?.value;
    if (!adminSession) {
      const error: ApiError = {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'غير مصرح. يتطلب صلاحيات المدير',
        },
      };
      return NextResponse.json(error, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    const status = searchParams.get('status') as SubscriptionStatus | null;
    const planType = searchParams.get('planType') as PlanType | null;
    const dateFrom = searchParams.get('dateFrom')
      ? new Date(searchParams.get('dateFrom')!)
      : undefined;
    const dateTo = searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined;

    const result = await exportSubscriptionsToCSV({
      status: status || undefined,
      planType: planType || undefined,
      dateFrom,
      dateTo,
    });

    if (!result.success || !result.csv) {
      const error: ApiError = {
        success: false,
        error: {
          code: 'EXPORT_FAILED',
          message: result.error || 'فشل التصدير',
        },
      };
      return NextResponse.json(error, { status: 400 });
    }

    // Return CSV file
    return new NextResponse(result.csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${result.filename}"`,
      },
    });
  } catch (error) {
    console.error('Export data error:', error);
    const apiError: ApiError = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'حدث خطأ أثناء التصدير',
      },
    };
    return NextResponse.json(apiError, { status: 500 });
  }
}
