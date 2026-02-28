/**
 * Refund Subscription API Route
 * POST /api/subscriptions/[id]/refund
 */

import { NextRequest, NextResponse } from 'next/server';
import { refundSubscription } from '@/lib/services/subscription.service';
import { refundSubscriptionSchema } from '@/lib/validators/subscription.validator';
import { RefundSubscriptionResponse, ApiError } from '@/types/api.types';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params (Next.js 16 requirement)
    const { id } = await params;

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

    const body = await request.json();

    // Validate input
    const validationResult = refundSubscriptionSchema.safeParse({
      ...body,
      subscriptionId: id,
    });

    if (!validationResult.success) {
      const error: ApiError = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: validationResult.error.errors[0].message,
          details: validationResult.error.errors,
        },
      };
      return NextResponse.json(error, { status: 400 });
    }

    // Process refund
    const result = await refundSubscription({
      subscriptionId: id,
      adminId: adminSession,
      reason: validationResult.data.reason,
      partialRefund: validationResult.data.partialRefund,
    });

    if (!result.success || !result.subscription) {
      const error: ApiError = {
        success: false,
        error: {
          code: 'REFUND_FAILED',
          message: result.error || 'فشل معالجة الاسترجاع',
        },
      };
      return NextResponse.json(error, { status: 400 });
    }

    const response: RefundSubscriptionResponse = {
      success: true,
      subscription: result.subscription,
      refundAmount: result.refundAmount!,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Refund subscription error:', error);
    const apiError: ApiError = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'حدث خطأ أثناء معالجة الاسترجاع',
      },
    };
    return NextResponse.json(apiError, { status: 500 });
  }
}
