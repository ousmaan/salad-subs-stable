/**
 * Session Validation API Route
 * GET /api/auth/session
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateStaffSession, validateAdminSession, getUserIdFromToken } from '@/lib/services/auth.service';
import { findStaffById } from '@/lib/repositories/staff.repository';
import { findAdminById } from '@/lib/repositories/admin.repository';
import { SessionResponse } from '@/types/api.types';

export async function GET(request: NextRequest) {
  try {
    const staffSession = request.cookies.get('session')?.value;
    const adminSession = request.cookies.get('admin_session')?.value;

    // Check staff session
    if (staffSession) {
      const isValid = await validateStaffSession(staffSession);
      if (isValid) {
        const userId = await getUserIdFromToken(staffSession);
        if (userId) {
          const staff = await findStaffById(userId);
          if (staff) {
            const response: SessionResponse = {
              authenticated: true,
              user: {
                id: staff.id,
                name: staff.name,
                type: 'staff',
              },
            };
            return NextResponse.json(response);
          }
        }
      }
    }

    // Check admin session
    if (adminSession) {
      const isValid = await validateAdminSession(adminSession);
      if (isValid) {
        const userId = await getUserIdFromToken(adminSession);
        if (userId) {
          const admin = await findAdminById(userId);
          if (admin) {
            const response: SessionResponse = {
              authenticated: true,
              user: {
                id: admin.id,
                username: admin.username,
                type: 'admin',
              },
            };
            return NextResponse.json(response);
          }
        }
      }
    }

    // No valid session
    const response: SessionResponse = {
      authenticated: false,
      user: null,
    };
    return NextResponse.json(response);
  } catch (error) {
    console.error('Session validation error:', error);
    const response: SessionResponse = {
      authenticated: false,
      user: null,
    };
    return NextResponse.json(response);
  }
}
