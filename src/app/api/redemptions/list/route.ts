/**
 * API Route: List all subscriptions for redemption
 * GET /api/redemptions/list?search=query
 */

import { NextRequest, NextResponse } from 'next/server';
import { listAllSubscriptionsForRedemption } from '@/lib/services/redemption.service';
import { ApiError } from '@/types/api.types';

export async function GET(request: NextRequest) {
  try {
    // TEMPORARILY DISABLED FOR TESTING - NO AUTH CHECK

    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('search') || undefined;

    console.log('[API] Listing redemption subscriptions, search:', searchQuery);

    const result = await listAllSubscriptionsForRedemption(searchQuery);

    if (!result.success) {
      const error: ApiError = {
        success: false,
        error: {
          code: 'LIST_FAILED',
          message: result.error || 'Failed to list subscriptions',
        },
      };
      return NextResponse.json(error, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      subscriptions: result.subscriptions,
      total: result.subscriptions?.length || 0,
    });
  } catch (error) {
    console.error('List redemption subscriptions error:', error);
    const apiError: ApiError = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while listing subscriptions',
      },
    };
    return NextResponse.json(apiError, { status: 500 });
  }
}
