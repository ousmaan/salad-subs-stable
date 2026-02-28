/**
 * Dispense Salads API Route
 * POST /api/redemptions/dispense
 */

import { NextRequest, NextResponse } from 'next/server';
import { dispenseSalads } from '@/lib/services/redemption.service';
import { dispenseRedemptionSchema } from '@/lib/validators/redemption.validator';
import { DispenseRedemptionResponse, ApiError } from '@/types/api.types';

export async function POST(request: NextRequest) {
  try {
    console.log('[API] Dispense request received');
    
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

    const body = await request.json();
    console.log('[API] Request body:', body);

    // Use a test staff ID for now
    const testStaffId = '00000000-0000-0000-0000-000000000001';

    // Validate input
    const validationResult = dispenseRedemptionSchema.safeParse({
      ...body,
      staffId: testStaffId,
    });

    console.log('[API] Validation result:', validationResult.success ? 'PASSED' : 'FAILED');
    
    if (!validationResult.success) {
      console.log('[API] Validation errors:', validationResult.error.errors);
      const error: ApiError = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: validationResult.error.errors[0].message,
        },
      };
      return NextResponse.json(error, { status: 400 });
    }

    console.log('[API] Calling dispenseSalads service...');
    // Dispense salads
    const result = await dispenseSalads({
      subscriptionId: validationResult.data.subscriptionId,
      quantity: validationResult.data.quantity,
      staffId: testStaffId,
      otpCode: validationResult.data.otpCode,
    });
    console.log('[API] Service result:', result.success ? 'SUCCESS' : 'FAILED', result.error || '');

    if (!result.success || !result.redemption) {
      const error: ApiError = {
        success: false,
        error: {
          code: 'DISPENSE_FAILED',
          message: result.error || 'Failed to dispense salads',
        },
      };
      return NextResponse.json(error, { status: 400 });
    }

    // Get updated subscription
    const { findSubscriptionById } = await import('@/lib/repositories/subscription.repository');
    const subscription = await findSubscriptionById(validationResult.data.subscriptionId);

    const response: DispenseRedemptionResponse = {
      success: true,
      redemption: result.redemption,
      subscription: subscription!,
      remainingSalads: result.remainingSalads!,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Dispense salads error:', error);
    const apiError: ApiError = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while dispensing salads',
      },
    };
    return NextResponse.json(apiError, { status: 500 });
  }
}
