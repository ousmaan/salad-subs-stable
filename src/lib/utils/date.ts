/**
 * Date formatting utilities with bilingual support
 */

import { format, formatDistance, addDays, addMonths, isAfter, isBefore, parseISO } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

export type Locale = 'ar' | 'en';

const localeMap = {
  ar: ar,
  en: enUS,
};

/**
 * Format date based on locale
 */
export function formatDate(date: Date | string, locale: Locale = 'ar', formatStr: string = 'PPP'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr, { locale: localeMap[locale] });
}

/**
 * Format date and time
 */
export function formatDateTime(date: Date | string, locale: Locale = 'ar'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'PPP p', { locale: localeMap[locale] });
}

/**
 * Format date in short format (e.g., 12/31/2023)
 */
export function formatDateShort(date: Date | string, locale: Locale = 'ar'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'P', { locale: localeMap[locale] });
}

/**
 * Format relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(date: Date | string, locale: Locale = 'ar'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistance(dateObj, new Date(), {
    addSuffix: true,
    locale: localeMap[locale],
  });
}

/**
 * Calculate expiry date based on plan type and config
 * Total expiry = validityDays + gracePeriodDays
 */
export function calculateExpiryDate(
  startDate: Date, 
  validityDays: number, 
  gracePeriodDays: number
): Date {
  const totalDays = validityDays + gracePeriodDays;
  return addDays(startDate, totalDays);
}

/**
 * Check if subscription is expired
 */
export function isExpired(expiryDate: Date | string): boolean {
  const dateObj = typeof expiryDate === 'string' ? parseISO(expiryDate) : expiryDate;
  return isBefore(dateObj, new Date());
}

/**
 * Check if subscription is about to expire (within 3 days)
 */
export function isExpiringSoon(expiryDate: Date | string): boolean {
  const dateObj = typeof expiryDate === 'string' ? parseISO(expiryDate) : expiryDate;
  const threeDaysFromNow = addDays(new Date(), 3);
  return isBefore(dateObj, threeDaysFromNow) && isAfter(dateObj, new Date());
}

/**
 * Get days remaining until expiry
 */
export function getDaysRemaining(expiryDate: Date | string): number {
  const dateObj = typeof expiryDate === 'string' ? parseISO(expiryDate) : expiryDate;
  const now = new Date();
  const diffTime = dateObj.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

/**
 * Format duration in days
 */
export function formatDuration(days: number, locale: Locale = 'ar'): string {
  if (locale === 'ar') {
    if (days === 1) return 'يوم واحد';
    if (days === 2) return 'يومان';
    if (days <= 10) return `${days} أيام`;
    return `${days} يوماً`;
  } else {
    if (days === 1) return '1 day';
    return `${days} days`;
  }
}
