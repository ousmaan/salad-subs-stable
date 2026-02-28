/**
 * Get Redemption History API Route
 * GET /api/redemptions/[subscriptionId]/history
 */

import { NextRequest, NextResponse } from 'next/server';
import { getRedemptionHistory } from '@/lib/services/redemption.service';
import { GetRedemptionHistoryResponse, ApiError } from '@/types/api.types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ subscriptionId: string }> }
) {
  try {
    // Await params (Next.js 16 requirement)
    const { subscriptionId } = await params;

    // Check authentication
    const session = request.cookies.get('session')?.value;
    const adminSession = request.cookies.get('admin_session')?.value;

    if (!session && !adminSession) {
      const error: ApiError = {
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'غير مصرح. الرجاء تسجيل الدخول',
        },
      };
      return NextResponse.json(error, { status: 401 });
    }

    const result = await getRedemptionHistory(subscriptionId);

    if (!result.success) {
      const error: ApiError = {
        success: false,
        error: {
          code: 'HISTORY_FAILED',
          message: result.error || 'فشل جلب سجل الاستخدام',
        },
      };
      return NextResponse.json(error, { status: 400 });
    }

    const response = {
      success: true,
      redemptions: result.redemptions || [],
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Get redemption history error:', error);
    const apiError: ApiError = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'حدث خطأ أثناء جلب سجل الاستخدام',
      },
    };
    return NextResponse.json(apiError, { status: 500 });
  }
}
