/**
 * Redemption validation schemas using Zod
 */

import { z } from 'zod';

export const searchRedemptionSchema = z.object({
  query: z.string().min(1, 'الرجاء إدخال رمز التفعيل أو رقم الهاتف أو اسم العميل'),
});

export const dispenseRedemptionSchema = z.object({
  subscriptionId: z.string().uuid('Invalid subscription ID'),
  quantity: z
    .number()
    .int('Quantity must be an integer')
    .min(1, 'Quantity must be at least 1')
    .max(10, 'Maximum 10 salads at once'),
  staffId: z.string().uuid('Invalid staff ID'),
  otpCode: z
    .string()
    .regex(/^\d{4}$/, 'OTP must be exactly 4 digits')
    .length(4, 'OTP must be exactly 4 digits'),
});

export type SearchRedemptionInput = z.infer<typeof searchRedemptionSchema>;
export type DispenseRedemptionInput = z.infer<typeof dispenseRedemptionSchema>;
