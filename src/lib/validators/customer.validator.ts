/**
 * Customer validation schemas using Zod
 */

import { z } from 'zod';

/**
 * Saudi phone number validation
 * Accepts formats:
 * - +966XXXXXXXXX (12 digits with country code)
 * - 05XXXXXXXX (10 digits)
 * - 5XXXXXXXX (9 digits)
 */
const saudiPhoneRegex = /^(\+966|966|0)?5[0-9]{8}$/;

export const customerPhoneSchema = z
  .string()
  .min(1, 'رقم الهاتف مطلوب')
  .regex(saudiPhoneRegex, 'رقم الهاتف غير صحيح. يجب أن يبدأ بـ 05 ويتكون من 10 أرقام');

export const customerNameSchema = z
  .string()
  .min(2, 'الاسم يجب أن يكون حرفين على الأقل')
  .max(100, 'الاسم طويل جداً')
  .regex(/^[\u0600-\u06FFa-zA-Z\s]+$/, 'الاسم يجب أن يحتوي على حروف فقط');

export const createCustomerSchema = z.object({
  name: customerNameSchema,
  phone: customerPhoneSchema,
  planType: z.enum(['biweekly', 'monthly'], {
    errorMap: () => ({ message: 'نوع الاشتراك غير صحيح' }),
  }),
});

export const searchCustomerSchema = z.object({
  query: z.string().min(1, 'الرجاء إدخال رقم الهاتف أو رمز الاشتراك'),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type SearchCustomerInput = z.infer<typeof searchCustomerSchema>;
