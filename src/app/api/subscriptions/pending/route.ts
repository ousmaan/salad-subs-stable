/**
 * API Route: List pending payment subscriptions
 * GET /api/subscriptions/pending?search=query
 */

import { NextRequest, NextResponse } from 'next/server';
import { ApiError } from '@/types/api.types';
import { supabaseServer } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const searchQuery = searchParams.get('search') || '';

    console.log('[API] Listing pending subscriptions, search:', searchQuery);

    // Build query for pending subscriptions with customers
    let query = supabaseServer
      .from('subscriptions')
      .select('*, customers(*)')
      .eq('status', 'pending_payment')
      .order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('[API] Database error:', error);
      const apiError: ApiError = {
        success: false,
        error: {
          code: 'DATABASE_ERROR',
          message: 'Failed to fetch subscriptions',
        },
      };
      return NextResponse.json(apiError, { status: 500 });
    }

    // Map to proper format
    const subscriptions = (data || []).map((row: any) => ({
      id: row.id,
      customerId: row.customer_id,
      subscriptionCode: row.subscription_code,
      activationCode: row.activation_code,
      planType: row.plan_type,
      price: Number(row.price),
      totalSalads: row.total_salads,
      remainingSalads: row.remaining_salads,
      status: row.status,
      paymentConfirmedAt: row.payment_confirmed_at ? new Date(row.payment_confirmed_at) : null,
      activatedAt: row.activated_at ? new Date(row.activated_at) : null,
      expiresAt: row.expires_at ? new Date(row.expires_at) : null,
      refundedAt: row.refunded_at ? new Date(row.refunded_at) : null,
      refundAmount: row.refund_amount ? Number(row.refund_amount) : null,
      refundReason: row.refund_reason,
      otpCode: row.otp_code || null,
      otpGeneratedAt: row.otp_generated_at ? new Date(row.otp_generated_at) : null,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      customer: {
        id: row.customers.id,
        name: row.customers.name,
        phone: row.customers.phone,
        createdAt: new Date(row.customers.created_at),
        updatedAt: new Date(row.customers.updated_at),
      },
    }));

    // Client-side filtering will handle search
    console.log('[API] Found pending subscriptions:', subscriptions.length);

    return NextResponse.json({
      success: true,
      subscriptions,
      total: subscriptions.length,
    });
  } catch (error) {
    console.error('[API] Error:', error);
    const apiError: ApiError = {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An error occurred while fetching subscriptions',
      },
    };
    return NextResponse.json(apiError, { status: 500 });
  }
}
