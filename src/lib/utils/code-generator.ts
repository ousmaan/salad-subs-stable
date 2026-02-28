/**
 * Secure code generation utilities
 * Generates unique 6-digit codes for subscriptions and activations
 */

/**
 * Generate a random 6-digit numeric code
 */
export function generateSixDigitCode(): string {
  // Generate random number between 0 and 999999
  const code = Math.floor(Math.random() * 1000000);
  // Pad with leading zeros to ensure 6 digits
  return code.toString().padStart(6, '0');
}

/**
 * Format a 6-digit code as XXX-XXX for easier reading
 */
export function formatSubscriptionId(code: string): string {
  if (code.length !== 6) return code;
  return `${code.slice(0, 3)}-${code.slice(3)}`;
}

/**
 * Generate a cryptographically secure 6-digit code
 * Uses Web Crypto API for better randomness
 */
export function generateSecureCode(): string {
  if (typeof window !== 'undefined' && window.crypto) {
    // Client-side: use Web Crypto API
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    const code = array[0] % 1000000;
    return code.toString().padStart(6, '0');
  } else if (typeof global !== 'undefined' && global.crypto) {
    // Server-side: use Node crypto
    const crypto = global.crypto;
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const code = array[0] % 1000000;
    return code.toString().padStart(6, '0');
  } else {
    // Fallback to Math.random
    return generateSixDigitCode();
  }
}

/**
 * Validate a 6-digit code format
 */
export function isValidSixDigitCode(code: string): boolean {
  return /^\d{6}$/.test(code);
}

/**
 * Generate a cryptographically secure 4-digit OTP code
 * Used for redemption verification
 */
export function generateOTP(): string {
  if (typeof window !== 'undefined' && window.crypto) {
    // Client-side: use Web Crypto API
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    const code = array[0] % 10000;
    return code.toString().padStart(4, '0');
  } else if (typeof global !== 'undefined' && global.crypto) {
    // Server-side: use Node crypto
    const crypto = global.crypto;
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    const code = array[0] % 10000;
    return code.toString().padStart(4, '0');
  } else {
    // Fallback to Math.random
    const code = Math.floor(Math.random() * 10000);
    return code.toString().padStart(4, '0');
  }
}

/**
 * Validate a 4-digit OTP format
 */
export function isValidOTP(otp: string): boolean {
  return /^\d{4}$/.test(otp);
}
