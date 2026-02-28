/**
 * Customer Registration API Route
 * POST /api/customers
 */

import { NextRequest, NextResponse } from 'next/server';
import { getOrCreateCustomer } from '@/lib/services/customer.service';
import { createSubscription } from '@/lib/services/subscription.service';
import { createCustomerSchema } from '@/lib/validators/customer.validator';
import { CreateCustomerResponse, ApiError } from '@/types/api.types';
import { listCustomers } from '@/lib/repositories/customer.repository';
import { PlanType } from '@/types/entities';

/**
 * GET /api/customers - List all customers
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    const result = await listCustomers(page, limit);

    return NextResponse.json({
      success: true,
      customers: result.customers,
      total: result.total,
      page,
      limit,
    });
  } catch (error) {
    console.error('List customers error:', error);
    const apiError: ApiError = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'حدث خطأ أثناء جلب العملاء',
      },
    };
    return NextResponse.json(apiError, { status: 500 });
  }
}

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

    const body = await request.json();

    // Validate input
    const validationResult = createCustomerSchema.safeParse(body);
    if (!validationResult.success) {
      const error: ApiError = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: validationResult.error.errors[0].message,
        },
      };
      return NextResponse.json(error, { status: 400 });
    }

    const { name, phone, planType } = validationResult.data;

    // Get or create customer
    const customerResult = await getOrCreateCustomer({ name, phone });

    if (!customerResult.success || !customerResult.customer) {
      const error: ApiError = {
        success: false,
        error: {
          code: 'CUSTOMER_CREATION_FAILED',
          message: customerResult.error || 'فشل إنشاء العميل',
        },
      };
      return NextResponse.json(error, { status: 400 });
    }

    // Create subscription
    const subscriptionResult = await createSubscription({
      customerId: customerResult.customer.id,
      planType: planType as PlanType,
    });

    if (!subscriptionResult.success || !subscriptionResult.subscription) {
      const error: ApiError = {
        success: false,
        error: {
          code: 'SUBSCRIPTION_CREATION_FAILED',
          message: subscriptionResult.error || 'فشل إنشاء الاشتراك',
        },
      };
      return NextResponse.json(error, { status: 400 });
    }

    // Generate barcode (handle server-side generation gracefully)
    let barcode = '';
    try {
      // For server-side, we'll send the code and generate on client
      barcode = subscriptionResult.subscription.subscriptionCode;
    } catch (barcodeError) {
      console.error('Barcode generation error:', barcodeError);
      // Continue without barcode
    }

    const response: CreateCustomerResponse = {
      success: true,
      customer: customerResult.customer,
      subscription: subscriptionResult.subscription,
      paymentSlip: {
        subscriptionCode: subscriptionResult.subscription.subscriptionCode,
        amount: subscriptionResult.subscription.price,
        barcode,
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Customer registration error:', error);
    const apiError: ApiError = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'حدث خطأ أثناء تسجيل العميل',
      },
    };
    return NextResponse.json(apiError, { status: 500 });
  }
}
