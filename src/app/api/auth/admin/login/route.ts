/**
 * Admin Login API Route
 * POST /api/auth/admin/login
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateAdmin } from '@/lib/services/auth.service';
import { adminLoginSchema } from '@/lib/validators/auth.validator';
import { AuthResponse, ApiError } from '@/types/api.types';
import { withLoginRateLimit } from '@/lib/middleware/ratelimit';
import { encodeJWT } from '@/lib/utils/jwt';

export async function POST(request: NextRequest) {
  return withLoginRateLimit(request, async (req) => {
    try {
      const body = await req.json();

    // Validate input
    const validationResult = adminLoginSchema.safeParse(body);
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

    // Authenticate admin
    const result = await authenticateAdmin(
      validationResult.data.username,
      validationResult.data.password
    );

    if (!result.success || !result.admin) {
      const error: ApiError = {
        success: false,
        error: {
          code: 'AUTHENTICATION_FAILED',
          message: result.error || 'اسم المستخدم أو كلمة المرور غير صحيحة',
        },
      };
      return NextResponse.json(error, { status: 401 });
    }

    // Create JWT token
    const token = encodeJWT(
      {
        userId: result.admin.id,
        role: 'admin',
      },
      60 * 60 * 8 // 8 hours
    );

    // Create session response
    const response: AuthResponse = {
      success: true,
      user: {
        id: result.admin.id,
        username: result.admin.username,
        type: 'admin',
      },
      sessionToken: token,
    };

    // Set session cookie with long expiration for persistent login
    const res = NextResponse.json(response);
    res.cookies.set('admin_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days - persistent until manual logout
      path: '/',
    });

    return res;
    } catch (error) {
      console.error('Admin login error:', error);
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
