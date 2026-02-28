/**
 * Search Active Subscriptions for Redemption API Route
 * GET /api/redemptions/search?query=...
 */

import { NextRequest, NextResponse } from 'next/server';
import { searchActiveSubscriptions } from '@/lib/services/redemption.service';
import { SearchRedemptionResponse, ApiError } from '@/types/api.types';

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
          message: 'Please enter activation code, phone number, or customer name',
        },
      };
      return NextResponse.json(error, { status: 400 });
    }

    const result = await searchActiveSubscriptions(query);

    if (!result.success) {
      const error: ApiError = {
        success: false,
        error: {
          code: 'SEARCH_FAILED',
          message: result.error || 'Search failed',
        },
      };
      return NextResponse.json(error, { status: 400 });
    }

    const response: SearchRedemptionResponse = {
      success: true,
      subscriptions: result.subscriptions || [],
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Search active subscriptions error:', error);
    const apiError: ApiError = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while searching',
      },
    };
    return NextResponse.json(apiError, { status: 500 });
  }
}
