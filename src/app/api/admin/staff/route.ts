/**
 * Staff Management API Route
 * GET/POST/DELETE /api/admin/staff
 */

import { NextRequest, NextResponse } from 'next/server';
import { listStaff, createStaff, deleteStaff } from '@/lib/repositories/staff.repository';
import { hashPassword } from '@/lib/services/auth.service';
import { createStaffSchema } from '@/lib/validators/auth.validator';
import { ListStaffResponse, CreateStaffResponse, DeleteStaffResponse, ApiError } from '@/types/api.types';

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

    const staffList = await listStaff();

    // Remove sensitive data
    const sanitizedStaff = staffList.map(({ pinHash, ...staff }) => staff);

    const response: ListStaffResponse = {
      success: true,
      staff: sanitizedStaff,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('List staff error:', error);
    const apiError: ApiError = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'حدث خطأ أثناء جلب قائمة الموظفين',
      },
    };
    return NextResponse.json(apiError, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();

    // Validate input
    const validationResult = createStaffSchema.safeParse(body);
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

    // Hash PIN
    const pinHash = await hashPassword(validationResult.data.pin);

    // Create staff member
    const newStaff = await createStaff({
      name: validationResult.data.name,
      pinHash,
    });

    // Remove sensitive data
    const { pinHash: _, ...sanitizedStaff } = newStaff;

    const response: CreateStaffResponse = {
      success: true,
      staff: sanitizedStaff,
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Create staff error:', error);
    const apiError: ApiError = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'حدث خطأ أثناء إنشاء الموظف',
      },
    };
    return NextResponse.json(apiError, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const staffId = searchParams.get('staffId');

    if (!staffId) {
      const error: ApiError = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'معرف الموظف مطلوب',
        },
      };
      return NextResponse.json(error, { status: 400 });
    }

    await deleteStaff(staffId);

    const response: DeleteStaffResponse = {
      success: true,
      message: 'تم حذف الموظف بنجاح',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Delete staff error:', error);
    const apiError: ApiError = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'حدث خطأ أثناء حذف الموظف',
      },
    };
    return NextResponse.json(apiError, { status: 500 });
  }
}
