/**
 * Authentication validation schemas using Zod
 */

import { z } from 'zod';

/**
 * Staff PIN validation
 * Must be 4-6 digits
 */
export const staffPinSchema = z
  .string()
  .min(4, 'الرقم السري يجب أن يكون 4 أرقام على الأقل')
  .max(6, 'الرقم السري يجب أن يكون 6 أرقام كحد أقصى')
  .regex(/^\d+$/, 'الرقم السري يجب أن يحتوي على أرقام فقط');

/**
 * Admin password validation
 * Minimum 8 characters, must contain uppercase, lowercase, number
 */
export const adminPasswordSchema = z
  .string()
  .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
  .regex(/[A-Z]/, 'كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل')
  .regex(/[a-z]/, 'كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل')
  .regex(/[0-9]/, 'كلمة المرور يجب أن تحتوي على رقم واحد على الأقل');

export const staffLoginSchema = z.object({
  pin: staffPinSchema,
});

export const adminLoginSchema = z.object({
  username: z
    .string()
    .min(3, 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل')
    .max(50, 'اسم المستخدم طويل جداً')
    .regex(/^[a-zA-Z0-9_]+$/, 'اسم المستخدم يجب أن يحتوي على حروف وأرقام فقط'),
  password: adminPasswordSchema,
});

export const createStaffSchema = z.object({
  name: z
    .string()
    .min(2, 'الاسم يجب أن يكون حرفين على الأقل')
    .max(100, 'الاسم طويل جداً'),
  pin: staffPinSchema,
});

export type StaffLoginInput = z.infer<typeof staffLoginSchema>;
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type CreateStaffInput = z.infer<typeof createStaffSchema>;
