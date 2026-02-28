/**
 * Logout API Route
 * POST /api/auth/logout
 */

import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.json({ success: true, message: 'تم تسجيل الخروج بنجاح' });

  // Clear session cookies
  res.cookies.delete('session');
  res.cookies.delete('admin_session');

  return res;
}
