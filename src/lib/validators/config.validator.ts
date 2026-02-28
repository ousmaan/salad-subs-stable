/**
 * Configuration Validation Schemas
 */

import { z } from 'zod';

export const planConfigSchema = z.object({
  weekly: z.object({
    price: z.number().min(1, 'السعر يجب أن يكون أكبر من 0').max(10000, 'السعر مرتفع جداً'),
    salads: z.number().int().min(1, 'عدد السلطات يجب أن يكون على الأقل 1').max(100),
    durationDays: z.number().int().min(1).max(365),
  }),
  monthly: z.object({
    price: z.number().min(1, 'السعر يجب أن يكون أكبر من 0').max(10000, 'السعر مرتفع جداً'),
    salads: z.number().int().min(1, 'عدد السلطات يجب أن يكون على الأقل 1').max(100),
    durationDays: z.number().int().min(1).max(365),
  }),
});

export const businessConfigSchema = z.object({
  nameAr: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل').max(100),
  nameEn: z.string().min(2, 'Name must be at least 2 characters').max(100),
  phone: z.string().min(10, 'رقم الهاتف غير صحيح').max(20),
  address: z.string().min(5, 'العنوان قصير جداً').max(500),
});

export const updateConfigSchema = z.object({
  planConfig: planConfigSchema.partial().optional(),
  businessConfig: businessConfigSchema.partial().optional(),
});

export type PlanConfigInput = z.infer<typeof planConfigSchema>;
export type BusinessConfigInput = z.infer<typeof businessConfigSchema>;
export type UpdateConfigInput = z.infer<typeof updateConfigSchema>;
