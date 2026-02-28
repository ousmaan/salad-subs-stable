/**
 * List Subscriptions API Route
 * GET /api/subscriptions
 */

import { NextRequest, NextResponse } from 'next/server';
import { listSubscriptions } from '@/lib/services/subscription.service';
import { ListSubscriptionsResponse, ApiError } from '@/types/api.types';
import { SubscriptionStatus, PlanType } from '@/types/entities';

export async function GET(request: NextRequest) {
  try {
    // TEMPORARILY DISABLED FOR TESTING - No authentication required
    // const adminSession = request.cookies.get('admin_session')?.value;
    // if (!adminSession) {
    //   const error: ApiError = {
    //     success: false,
    //     error: {
    //       code: 'UNAUTHORIZED',
    //       message: 'غير مصرح. يتطلب صلاحيات المدير',
    //     },
    //   };
    //   return NextResponse.json(error, { status: 401 });
    // }

    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') as SubscriptionStatus | null;
    const planType = searchParams.get('planType') as PlanType | null;
    const search = searchParams.get('search') || undefined;
    const dateFrom = searchParams.get('dateFrom')
      ? new Date(searchParams.get('dateFrom')!)
      : undefined;
    const dateTo = searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined;
    const sortBy = (searchParams.get('sortBy') as 'createdAt' | 'activatedAt' | 'expiresAt') || 'createdAt';
    const sortOrder = (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc';

    const result = await listSubscriptions({
      page,
      limit,
      status: status || undefined,
      planType: planType || undefined,
      search,
      dateFrom,
      dateTo,
      sortBy,
      sortOrder,
    });

    if (!result.success) {
      const error: ApiError = {
        success: false,
        error: {
          code: 'LIST_FAILED',
          message: result.error || 'فشل جلب الاشتراكات',
        },
      };
      return NextResponse.json(error, { status: 400 });
    }

    const response: ListSubscriptionsResponse = {
      success: true,
      subscriptions: result.subscriptions || [],
      total: result.total || 0,
      page,
      limit,
      totalPages: Math.ceil((result.total || 0) / limit),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('List subscriptions error:', error);
    const apiError: ApiError = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'حدث خطأ أثناء جلب الاشتراكات',
      },
    };
    return NextResponse.json(apiError, { status: 500 });
  }
}
