/**
 * Rate Limiting Middleware
 * Prevents brute force attacks and API abuse
 */

import { NextRequest, NextResponse } from 'next/server';
import { ApiError } from '@/types/api.types';

interface RateLimitEntry {
  count: number;
  resetAt: number;
  blockedUntil?: number;
}

// In-memory store (use Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetAt < now && (!entry.blockedUntil || entry.blockedUntil < now)) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  blockDurationMs?: number;
}

/**
 * Default rate limit configs
 */
export const RATE_LIMITS = {
  LOGIN: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 30 * 60 * 1000, // 30 minutes block after exceeding
  },
  API_GENERAL: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
  },
  API_MUTATION: {
    maxRequests: 30,
    windowMs: 60 * 1000, // 1 minute
  },
};

/**
 * Get client identifier (IP address)
 */
function getClientId(request: NextRequest): string {
  // Try to get real IP from headers (Vercel, Cloudflare)
  const forwardedFor = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }

  // Fallback to a generic identifier
  return 'unknown';
}

/**
 * Check rate limit for a client
 */
export function checkRateLimit(
  clientId: string,
  config: RateLimitConfig
): { allowed: boolean; remaining: number; resetAt: number; blockedUntil?: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(clientId);

  // Check if blocked
  if (entry?.blockedUntil && entry.blockedUntil > now) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
      blockedUntil: entry.blockedUntil,
    };
  }

  // Initialize or reset if window expired
  if (!entry || entry.resetAt < now) {
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + config.windowMs,
    };
    rateLimitStore.set(clientId, newEntry);
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt: newEntry.resetAt,
    };
  }

  // Increment count
  entry.count++;

  // Check if exceeded
  if (entry.count > config.maxRequests) {
    if (config.blockDurationMs) {
      entry.blockedUntil = now + config.blockDurationMs;
    }
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
      blockedUntil: entry.blockedUntil,
    };
  }

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Rate limit middleware wrapper
 */
export async function withRateLimit(
  request: NextRequest,
  config: RateLimitConfig,
  handler: (request: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  const clientId = getClientId(request);
  const result = checkRateLimit(clientId, config);

  if (!result.allowed) {
    const error: ApiError = {
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: result.blockedUntil
          ? 'تم حظرك مؤقتاً بسبب كثرة المحاولات. الرجاء المحاولة لاحقاً'
          : 'عدد كبير جداً من الطلبات. الرجاء الانتظار والمحاولة مرة أخرى',
        details: {
          resetAt: new Date(result.resetAt).toISOString(),
          blockedUntil: result.blockedUntil
            ? new Date(result.blockedUntil).toISOString()
            : undefined,
        },
      },
    };

    const response = NextResponse.json(error, { status: 429 });
    response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
    response.headers.set('X-RateLimit-Reset', result.resetAt.toString());
    if (result.blockedUntil) {
      response.headers.set('Retry-After', Math.ceil((result.blockedUntil - Date.now()) / 1000).toString());
    }

    return response;
  }

  // Call handler
  const response = await handler(request);

  // Add rate limit headers
  response.headers.set('X-RateLimit-Limit', config.maxRequests.toString());
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
  response.headers.set('X-RateLimit-Reset', result.resetAt.toString());

  return response;
}

/**
 * Login rate limiter
 */
export async function withLoginRateLimit(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  return withRateLimit(request, RATE_LIMITS.LOGIN, handler);
}

/**
 * General API rate limiter
 */
export async function withApiRateLimit(
  request: NextRequest,
  handler: (request: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  return withRateLimit(request, RATE_LIMITS.API_GENERAL, handler);
}
