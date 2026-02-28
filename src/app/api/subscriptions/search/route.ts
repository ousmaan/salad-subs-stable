/**
 * Search Subscriptions API Route
 * GET /api/subscriptions/search?query=...
 */

import { NextRequest, NextResponse } from 'next/server';
import { searchSubscriptions } from '@/lib/services/subscription.service';
import { SearchSubscriptionResponse, ApiError } from '@/types/api.types';

export async function GET(request: NextRequest) {
  try {
    // TEMPORARILY DISABLED FOR TESTING
    // const session = request.cookies.get('session')?.value;
    // if (!session) {
    //   const error: ApiError = {
    //     success: false,
    //     error: {
    //       code: 'UNAUTHORIZED',
    //       message: 'غير مصرح. الرجاء تسجيل الدخول',
    //     },
    //   };
    //   return NextResponse.json(error, { status: 401 });
    // }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    if (!query) {
      const error: ApiError = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'الرجاء إدخال رمز الاشتراك أو رقم الهاتف',
        },
      };
      return NextResponse.json(error, { status: 400 });
    }

    const result = await searchSubscriptions(query);

    if (!result.success) {
      const error: ApiError = {
        success: false,
        error: {
          code: 'SEARCH_FAILED',
          message: result.error || 'فشل البحث',
        },
      };
      return NextResponse.json(error, { status: 400 });
    }

    const response: SearchSubscriptionResponse = {
      success: true,
      subscriptions: result.subscriptions || [],
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Search subscriptions error:', error);
    const apiError: ApiError = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'حدث خطأ أثناء البحث',
      },
    };
    return NextResponse.json(apiError, { status: 500 });
  }
}
