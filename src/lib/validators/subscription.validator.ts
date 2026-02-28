/**
 * Subscription validation schemas using Zod
 */

import { z } from 'zod';

export const subscriptionCodeSchema = z
  .string()
  .length(6, 'رمز الاشتراك يجب أن يكون 6 أرقام')
  .regex(/^\d{6}$/, 'رمز الاشتراك يجب أن يحتوي على أرقام فقط');

export const activationCodeSchema = z
  .string()
  .length(6, 'رمز التفعيل يجب أن يكون 6 أرقام')
  .regex(/^\d{6}$/, 'رمز التفعيل يجب أن يحتوي على أرقام فقط');

export const searchSubscriptionSchema = z.object({
  query: z.string().min(1, 'الرجاء إدخال رمز الاشتراك أو رقم الهاتف'),
});

export const activateSubscriptionSchema = z.object({
  subscriptionId: z.string().uuid('معرف الاشتراك غير صحيح'),
  paymentConfirmed: z.boolean(),
  receiptNumber: z.string().length(5, 'رقم الإيصال يجب أن يكون 5 أرقام').regex(/^\d{5}$/, 'رقم الإيصال يجب أن يحتوي على أرقام فقط').optional(),
});

export const refundSubscriptionSchema = z.object({
  subscriptionId: z.string().uuid('معرف الاشتراك غير صحيح'),
  reason: z
    .string()
    .min(5, 'سبب الاسترجاع يجب أن يكون 5 أحرف على الأقل')
    .max(500, 'سبب الاسترجاع طويل جداً'),
  partialRefund: z.boolean().optional(),
});

export const listSubscriptionsSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20),
  status: z.enum(['pending_payment', 'active', 'expired', 'refunded']).optional(),
  planType: z.enum(['biweekly', 'monthly']).optional(),
  search: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  sortBy: z.enum(['createdAt', 'activatedAt', 'expiresAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export type SearchSubscriptionInput = z.infer<typeof searchSubscriptionSchema>;
export type ActivateSubscriptionInput = z.infer<typeof activateSubscriptionSchema>;
export type RefundSubscriptionInput = z.infer<typeof refundSubscriptionSchema>;
export type ListSubscriptionsInput = z.infer<typeof listSubscriptionsSchema>;
