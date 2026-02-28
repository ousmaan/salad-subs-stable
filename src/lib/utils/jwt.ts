/**
 * JWT Utilities for Secure Session Management
 * Note: For production, use a proper library like jose or jsonwebtoken
 */

import { createHash, randomBytes } from 'crypto';

const SECRET_KEY = process.env.SESSION_SECRET || 'default-secret-change-in-production';

export interface JWTPayload {
  userId: string;
  role: 'staff' | 'admin';
  iat: number; // Issued at
  exp: number; // Expires at
}

/**
 * Simple JWT encoding (base64)
 * For production, use a proper JWT library with HMAC-SHA256
 */
export function encodeJWT(payload: Omit<JWTPayload, 'iat' | 'exp'>, expiresInSeconds: number = 28800): string {
  const now = Math.floor(Date.now() / 1000);
  
  const fullPayload: JWTPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const header = { alg: 'HS256', typ: 'JWT' };
  
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(fullPayload)).toString('base64url');
  
  const signature = createHash('sha256')
    .update(`${encodedHeader}.${encodedPayload}.${SECRET_KEY}`)
    .digest('base64url');

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

/**
 * Decode and verify JWT
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    const [encodedHeader, encodedPayload, signature] = token.split('.');
    
    if (!encodedHeader || !encodedPayload || !signature) {
      return null;
    }

    // Verify signature
    const expectedSignature = createHash('sha256')
      .update(`${encodedHeader}.${encodedPayload}.${SECRET_KEY}`)
      .digest('base64url');

    if (signature !== expectedSignature) {
      return null;
    }

    // Decode payload
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString()) as JWTPayload;

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return null;
    }

    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * Generate CSRF token
 */
export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Verify CSRF token
 */
export function verifyCSRFToken(token: string, expected: string): boolean {
  return token === expected;
}
