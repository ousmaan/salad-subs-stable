/**
 * Configuration API Route
 * GET/PUT /api/admin/config
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getPlanConfig,
  getBusinessConfig,
  updatePlanConfig,
  updateBusinessConfig,
} from '@/lib/repositories/config.repository';
import { GetConfigResponse, UpdateConfigResponse, ApiError } from '@/types/api.types';

export async function GET(request: NextRequest) {
  try {
    // Check authentication (staff or admin can view config)
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

    const [planConfig, businessConfig] = await Promise.all([
      getPlanConfig(),
      getBusinessConfig(),
    ]);

    const response: GetConfigResponse = {
      success: true,
      planConfig,
      businessConfig,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Get config error:', error);
    const apiError: ApiError = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'حدث خطأ أثناء جلب الإعدادات',
      },
    };
    return NextResponse.json(apiError, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check admin authentication (only admin can update config)
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

    // Update configs
    if (body.planConfig) {
      await updatePlanConfig(body.planConfig);
    }

    if (body.businessConfig) {
      await updateBusinessConfig(body.businessConfig);
    }

    const [planConfig, businessConfig] = await Promise.all([
      getPlanConfig(),
      getBusinessConfig(),
    ]);

    const response: UpdateConfigResponse = {
      success: true,
      planConfig,
      businessConfig,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Update config error:', error);
    const apiError: ApiError = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'حدث خطأ أثناء حفظ الإعدادات',
      },
    };
    return NextResponse.json(apiError, { status: 500 });
  }
}
