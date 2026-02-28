/**
 * Staff Login API Route
 * POST /api/auth/staff/login
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateStaff } from '@/lib/services/auth.service';
import { staffLoginSchema } from '@/lib/validators/auth.validator';
import { AuthResponse, ApiError } from '@/types/api.types';
import { withLoginRateLimit } from '@/lib/middleware/ratelimit';
import { encodeJWT } from '@/lib/utils/jwt';

export async function POST(request: NextRequest) {
  return withLoginRateLimit(request, async (req) => {
  try {
    const body = await request.json();

    // Validate input
    const validationResult = staffLoginSchema.safeParse(body);
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

    // Authenticate staff
    const result = await authenticateStaff(validationResult.data.pin);

    if (!result.success || !result.staff) {
      const error: ApiError = {
        success: false,
        error: {
          code: 'AUTHENTICATION_FAILED',
          message: result.error || 'الرقم السري غير صحيح',
        },
      };
      return NextResponse.json(error, { status: 401 });
    }

    // Create JWT token
    const token = encodeJWT(
      {
        userId: result.staff.id,
        role: 'staff',
      },
      60 * 60 * 8 // 8 hours
    );

    // Create session response
    const response: AuthResponse = {
      success: true,
      user: {
        id: result.staff.id,
        name: result.staff.name,
        type: 'staff',
      },
      sessionToken: token,
    };

    // Set session cookie
    const res = NextResponse.json(response);
    res.cookies.set('session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 8, // 8 hours
      path: '/',
    });

    return res;
  } catch (error) {
    console.error('Staff login error:', error);
    const apiError: ApiError = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'حدث خطأ أثناء تسجيل الدخول',
      },
    };
    return NextResponse.json(apiError, { status: 500 });
  }
  });
}
