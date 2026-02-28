/**
 * Activate Subscription API Route
 * POST /api/subscriptions/activate
 */

import { NextRequest, NextResponse } from 'next/server';
import { activateSubscription } from '@/lib/services/subscription.service';
import { activateSubscriptionSchema } from '@/lib/validators/subscription.validator';
import { ActivateSubscriptionResponse, ApiError } from '@/types/api.types';

export async function POST(request: NextRequest) {
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

    const testStaffId = '00000000-0000-0000-0000-000000000001';

    const body = await request.json();

    // Validate input
    const validationResult = activateSubscriptionSchema.safeParse(body);
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

    // Activate subscription
    const result = await activateSubscription({
      subscriptionId: validationResult.data.subscriptionId,
      staffId: testStaffId,
      receiptNumber: validationResult.data.receiptNumber,
    });

    if (!result.success || !result.subscription || !result.activationCode) {
      const error: ApiError = {
        success: false,
        error: {
          code: 'ACTIVATION_FAILED',
          message: result.error || 'فشل تفعيل الاشتراك',
        },
      };
      return NextResponse.json(error, { status: 400 });
    }

    const response: ActivateSubscriptionResponse = {
      success: true,
      subscription: result.subscription,
      activationCode: result.activationCode,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Activate subscription error:', error);
    const apiError: ApiError = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'حدث خطأ أثناء تفعيل الاشتراك',
      },
    };
    return NextResponse.json(apiError, { status: 500 });
  }
}
