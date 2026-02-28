/**
 * Authentication Middleware
 * Centralized authentication and authorization logic
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateStaffSession, validateAdminSession } from '@/lib/services/auth.service';
import { ApiError } from '@/types/api.types';

export type UserRole = 'staff' | 'admin';

export interface AuthContext {
  userId: string;
  role: UserRole;
}

/**
 * Extract and validate session from request
 */
export async function getAuthContext(request: NextRequest): Promise<AuthContext | null> {
  // Check staff session
  const staffSession = request.cookies.get('session')?.value;
  if (staffSession) {
    const isValid = await validateStaffSession(staffSession);
    if (isValid) {
      return {
        userId: staffSession,
        role: 'staff',
      };
    }
  }

  // Check admin session
  const adminSession = request.cookies.get('admin_session')?.value;
  if (adminSession) {
    const isValid = await validateAdminSession(adminSession);
    if (isValid) {
      return {
        userId: adminSession,
        role: 'admin',
      };
    }
  }

  return null;
}

/**
 * Require authentication (staff or admin)
 */
export async function requireAuth(
  request: NextRequest,
  handler: (request: NextRequest, auth: AuthContext) => Promise<NextResponse>
): Promise<NextResponse> {
  const auth = await getAuthContext(request);

  if (!auth) {
    const error: ApiError = {
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'غير مصرح. الرجاء تسجيل الدخول',
      },
    };
    return NextResponse.json(error, { status: 401 });
  }

  return handler(request, auth);
}

/**
 * Require admin authentication
 */
export async function requireAdmin(
  request: NextRequest,
  handler: (request: NextRequest, auth: AuthContext) => Promise<NextResponse>
): Promise<NextResponse> {
  const auth = await getAuthContext(request);

  if (!auth) {
    const error: ApiError = {
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'غير مصرح. الرجاء تسجيل الدخول',
      },
    };
    return NextResponse.json(error, { status: 401 });
  }

  if (auth.role !== 'admin') {
    const error: ApiError = {
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'غير مصرح. يتطلب صلاحيات المدير',
      },
    };
    return NextResponse.json(error, { status: 403 });
  }

  return handler(request, auth);
}

/**
 * Require staff authentication
 */
export async function requireStaff(
  request: NextRequest,
  handler: (request: NextRequest, auth: AuthContext) => Promise<NextResponse>
): Promise<NextResponse> {
  const auth = await getAuthContext(request);

  if (!auth) {
    const error: ApiError = {
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'غير مصرح. الرجاء تسجيل الدخول',
      },
    };
    return NextResponse.json(error, { status: 401 });
  }

  if (auth.role !== 'staff' && auth.role !== 'admin') {
    const error: ApiError = {
      success: false,
      error: {
        code: 'FORBIDDEN',
        message: 'غير مصرح. يتطلب صلاحيات الموظف',
      },
    };
    return NextResponse.json(error, { status: 403 });
  }

  return handler(request, auth);
}
