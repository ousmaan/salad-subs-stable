/**
 * Number and currency formatting utilities
 */

export type Locale = 'ar' | 'en';

/**
 * Format currency with locale support
 */
export function formatCurrency(amount: number, locale: Locale = 'ar', currency: string = 'SAR'): string {
  const formatter = new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatter.format(amount);
}

/**
 * Format number with locale support
 */
export function formatNumber(value: number, locale: Locale = 'ar'): string {
  const formatter = new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US');
  return formatter.format(value);
}

/**
 * Format percentage
 */
export function formatPercentage(value: number, locale: Locale = 'ar', decimals: number = 1): string {
  const formatter = new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return formatter.format(value / 100);
}

/**
 * Strip country code from phone number
 * Removes +966 or 966 prefix and returns local format starting with 0
 */
export function stripCountryCode(phone: string): string {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');

  // If starts with 966 (Saudi country code)
  if (cleaned.startsWith('966')) {
    // Return with leading 0: 966501234567 -> 0501234567
    return '0' + cleaned.slice(3);
  }

  // If starts with 5 (missing leading 0)
  if (cleaned.length === 9 && cleaned.startsWith('5')) {
    return '0' + cleaned;
  }

  // Already in correct format or unknown format
  return cleaned;
}

/**
 * Format phone number for display: 050 123 4567
 * Always strips country code and formats as 3-3-4 digits
 */
export function formatPhoneNumber(phone: string | null | undefined): string {
  if (!phone) return '';
  
  // First strip any country code
  const cleaned = stripCountryCode(phone).replace(/\D/g, '');

  // Format as 050 123 4567 (3-3-4 digits)
  if (cleaned.length === 10 && cleaned.startsWith('0')) {
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`;
  }

  // Return as-is if format not recognized
  return phone;
}

/**
 * Normalize phone number for database storage
 * Returns phone in format: 0501234567 (no spaces, no country code)
 */
export function normalizePhoneNumber(phone: string): string {
  if (!phone) return '';
  return stripCountryCode(phone).replace(/\D/g, '');
}

/**
 * Convert Western Arabic numerals to Eastern Arabic numerals
 */
export function toEasternArabicNumerals(value: string | number): string {
  const westernToEastern: Record<string, string> = {
    '0': '٠',
    '1': '١',
    '2': '٢',
    '3': '٣',
    '4': '٤',
    '5': '٥',
    '6': '٦',
    '7': '٧',
    '8': '٨',
    '9': '٩',
  };

  return String(value).replace(/[0-9]/g, (digit) => westernToEastern[digit] || digit);
}

/**
 * Convert Eastern Arabic numerals to Western Arabic numerals
 */
export function toWesternArabicNumerals(value: string): string {
  const easternToWestern: Record<string, string> = {
    '٠': '0',
    '١': '1',
    '٢': '2',
    '٣': '3',
    '٤': '4',
    '٥': '5',
    '٦': '6',
    '٧': '7',
    '٨': '8',
    '٩': '9',
  };

  return value.replace(/[٠-٩]/g, (digit) => easternToWestern[digit] || digit);
}

/**
 * Format subscription code with hyphen for readability
 */
export function formatSubscriptionCode(code: string): string {
  if (!code) return '';
  
  // Remove any existing formatting
  const cleaned = code.replace(/[^0-9]/g, '');
  
  // Format: XXX-XXX (e.g., 123-456)
  if (cleaned.length === 6) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
  }
  return code;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number, locale: Locale = 'ar'): string {
  const units = locale === 'ar' 
    ? ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت']
    : ['B', 'KB', 'MB', 'GB'];

  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}
