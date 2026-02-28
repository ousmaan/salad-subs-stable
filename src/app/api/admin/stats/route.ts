/**
 * Admin Dashboard Statistics API Route
 * GET /api/admin/stats
 */

import { NextRequest, NextResponse } from 'next/server';
import { getDashboardStats, getRevenueTrends, getSubscriptionTrends } from '@/lib/services/analytics.service';
import { GetStatsResponse, ApiError } from '@/types/api.types';

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

    // Get all statistics
    const [statsResult, revenueResult, subscriptionResult] = await Promise.all([
      getDashboardStats(),
      getRevenueTrends(7),
      getSubscriptionTrends(30),
    ]);

    if (!statsResult.success || !revenueResult.success || !subscriptionResult.success) {
      const error: ApiError = {
        success: false,
        error: {
          code: 'STATS_FAILED',
          message: 'فشل جلب الإحصائيات',
        },
      };
      return NextResponse.json(error, { status: 400 });
    }

    const response: GetStatsResponse = {
      success: true,
      stats: statsResult.stats!,
      revenueTrends: revenueResult.trends!,
      subscriptionTrends: subscriptionResult.trends!,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Get admin stats error:', error);
    const apiError: ApiError = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'حدث خطأ أثناء جلب الإحصائيات',
      },
    };
    return NextResponse.json(apiError, { status: 500 });
  }
}
