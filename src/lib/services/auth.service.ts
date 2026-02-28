/**
 * Authentication Service
 * Business logic for staff and admin authentication
 */

import bcrypt from 'bcryptjs';
import { findStaffById, getAllActiveStaff } from '@/lib/repositories/staff.repository';
import { findAdminByUsername, findAdminById } from '@/lib/repositories/admin.repository';
import { Staff, Admin } from '@/types/entities';
import { decodeJWT } from '@/lib/utils/jwt';

const BCRYPT_ROUNDS = 10;

/**
 * Hash a password or PIN
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * Verify a password or PIN against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Authenticate staff member with PIN
 */
export async function authenticateStaff(pin: string): Promise<{
  success: boolean;
  staff?: Omit<Staff, 'pinHash'>;
  error?: string;
}> {
  try {
    // Get all active staff members
    const allStaff = await getAllActiveStaff();

    // Find staff member with matching PIN
    for (const staffMember of allStaff) {
      const isValid = await verifyPassword(pin, staffMember.pinHash);
      
      if (isValid) {
        // Remove sensitive data
        const { pinHash, ...staffWithoutHash } = staffMember;
        
        return {
          success: true,
          staff: staffWithoutHash,
        };
      }
    }

    return {
      success: false,
      error: 'الرقم السري غير صحيح',
    };
  } catch (error) {
    console.error('Staff authentication error:', error);
    return {
      success: false,
      error: 'حدث خطأ أثناء تسجيل الدخول',
    };
  }
}

/**
 * Authenticate admin with username and password
 */
export async function authenticateAdmin(
  username: string,
  password: string
): Promise<{
  success: boolean;
  admin?: Omit<Admin, 'passwordHash'>;
  error?: string;
}> {
  try {
    const admin = await findAdminByUsername(username);

    if (!admin) {
      return {
        success: false,
        error: 'اسم المستخدم أو كلمة المرور غير صحيحة',
      };
    }

    const isValid = await verifyPassword(password, admin.passwordHash);

    if (!isValid) {
      return {
        success: false,
        error: 'اسم المستخدم أو كلمة المرور غير صحيحة',
      };
    }

    // Remove sensitive data
    const { passwordHash, ...adminWithoutHash } = admin;

    return {
      success: true,
      admin: adminWithoutHash,
    };
  } catch (error) {
    console.error('Admin authentication error:', error);
    return {
      success: false,
      error: 'حدث خطأ أثناء تسجيل الدخول',
    };
  }
}

/**
 * Validate staff session (now with JWT)
 */
export async function validateStaffSession(token: string): Promise<boolean> {
  try {
    const payload = decodeJWT(token);
    if (!payload || payload.role !== 'staff') {
      return false;
    }

    const staff = await findStaffById(payload.userId);
    return staff !== null && staff.isActive;
  } catch (error) {
    console.error('Staff session validation error:', error);
    return false;
  }
}

/**
 * Validate admin session (now with JWT)
 */
export async function validateAdminSession(token: string): Promise<boolean> {
  try {
    const payload = decodeJWT(token);
    if (!payload || payload.role !== 'admin') {
      return false;
    }

    const admin = await findAdminById(payload.userId);
    return admin !== null;
  } catch (error) {
    console.error('Admin session validation error:', error);
    return false;
  }
}

/**
 * Get user ID from token
 */
export async function getUserIdFromToken(token: string): Promise<string | null> {
  try {
    const payload = decodeJWT(token);
    return payload ? payload.userId : null;
  } catch (error) {
    return null;
  }
}
