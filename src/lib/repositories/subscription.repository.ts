/**
 * Subscription Repository
 * Data access layer for subscription operations
 */

import { supabaseServer } from '@/lib/supabase/server';
import { Subscription, SubscriptionWithCustomer, SubscriptionStatus, PlanType } from '@/types/entities';
import { Database } from '@/types/database.types';
import { toEntity as toCustomerEntity } from './customer.repository';

type SubscriptionRow = Database['public']['Tables']['subscriptions']['Row'];
type SubscriptionInsert = Database['public']['Tables']['subscriptions']['Insert'];
type SubscriptionUpdate = Database['public']['Tables']['subscriptions']['Update'];

/**
 * Convert database row to entity
 */
function toEntity(row: SubscriptionRow): Subscription {
  return {
    id: row.id,
    customerId: row.customer_id,
    subscriptionCode: row.subscription_code,
    activationCode: row.activation_code,
    receiptNumber: row.receipt_number || null,
    planType: row.plan_type as PlanType,
    price: Number(row.price),
    totalSalads: row.total_salads,
    remainingSalads: row.remaining_salads,
    status: row.status as SubscriptionStatus,
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
  };
}

/**
 * Create a new subscription
 */
export async function createSubscription(data: {
  customerId: string;
  subscriptionCode: string;
  planType: PlanType;
  price: number;
  totalSalads: number;
}): Promise<Subscription> {
  const insertData: SubscriptionInsert = {
    customer_id: data.customerId,
    subscription_code: data.subscriptionCode,
    plan_type: data.planType,
    price: data.price,
    total_salads: data.totalSalads,
    remaining_salads: data.totalSalads,
    status: 'pending_payment',
  };

  const { data: subscription, error } = await supabaseServer
    .from('subscriptions')
    .insert(insertData as any)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create subscription: ${error.message}`);
  }

  return toEntity(subscription);
}

/**
 * Find subscription by ID
 */
export async function findSubscriptionById(id: string): Promise<Subscription | null> {
  const { data, error } = await supabaseServer
    .from('subscriptions')
    .select()
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to find subscription: ${error.message}`);
  }

  return toEntity(data);
}

/**
 * Find subscription by subscription code
 */
export async function findSubscriptionByCode(code: string): Promise<SubscriptionWithCustomer | null> {
  const { data, error } = await supabaseServer
    .from('subscriptions')
    .select('*, customers(*)')
    .eq('subscription_code', code)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to find subscription: ${error.message}`);
  }

  const subscription = toEntity(data);
  const customer = toCustomerEntity(data.customers);

  return { ...subscription, customer };
}

/**
 * Find subscription by activation code
 */
export async function findSubscriptionByActivationCode(
  code: string
): Promise<SubscriptionWithCustomer | null> {
  console.log('[Repository] findSubscriptionByActivationCode called with code:', code);
  
  const { data, error } = await supabaseServer
    .from('subscriptions')
    .select('*, customers(*)')
    .eq('activation_code', code)
    .single();

  console.log('[Repository] Activation code query result - error:', error?.code, 'found:', !!data);

  if (error) {
    if (error.code === 'PGRST116') {
      console.log('[Repository] No subscription found with activation code:', code);
      return null;
    }
    console.error('[Repository] Supabase error:', error);
    throw new Error(`Failed to find subscription: ${error.message}`);
  }

  const subscription = toEntity(data);
  const customer = toCustomerEntity(data.customers);

  console.log('[Repository] Found subscription:', subscription.id, 'status:', subscription.status);

  return { ...subscription, customer };
}

/**
 * Find subscriptions by customer ID
 */
export async function findSubscriptionsByCustomerId(customerId: string): Promise<Subscription[]> {
  const { data, error } = await supabaseServer
    .from('subscriptions')
    .select()
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to find subscriptions: ${error.message}`);
  }

  return data.map(toEntity);
}

/**
 * Get subscription with customer data by ID
 */
export async function getSubscriptionWithCustomer(id: string): Promise<SubscriptionWithCustomer | null> {
  const { data, error } = await supabaseServer
    .from('subscriptions')
    .select('*, customers(*)')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to get subscription: ${error.message}`);
  }

  const subscription = toEntity(data);
  const customer = toCustomerEntity(data.customers);

  return { ...subscription, customer };
}

/**
 * Search subscriptions by customer phone
 */
export async function searchSubscriptionsByPhone(phone: string): Promise<SubscriptionWithCustomer[]> {
  console.log('[Repository] searchSubscriptionsByPhone called with phone:', phone);
  
  const { data, error } = await supabaseServer
    .from('subscriptions')
    .select('*, customers!inner(*)')
    .eq('customers.phone', phone)
    .order('created_at', { ascending: false });

  console.log('[Repository] Supabase query result - error:', error, 'data count:', data?.length || 0);

  if (error) {
    console.error('[Repository] Supabase error:', error);
    throw new Error(`Failed to search subscriptions: ${error.message}`);
  }

  if (!data || data.length === 0) {
    console.log('[Repository] No data found for phone:', phone);
    return [];
  }

  console.log('[Repository] Found', data.length, 'subscriptions for phone:', phone);

  return data.map((row) => {
    const subscription = toEntity(row);
    const customer = toCustomerEntity(row.customers);
    return { ...subscription, customer };
  });
}

/**
 * Update subscription
 */
export async function updateSubscription(
  id: string,
  data: Partial<{
    activationCode: string;
    receiptNumber: string;
    otpCode: string;
    otpGeneratedAt: Date;
    status: SubscriptionStatus;
    remainingSalads: number;
    paymentConfirmedAt: Date;
    activatedAt: Date;
    expiresAt: Date;
    refundedAt: Date;
    refundAmount: number;
    refundReason: string;
  }>
): Promise<Subscription> {
  const updateData: SubscriptionUpdate = {};

  if (data.activationCode !== undefined) updateData.activation_code = data.activationCode;
  if (data.receiptNumber !== undefined) updateData.receipt_number = data.receiptNumber;
  if (data.otpCode !== undefined) updateData.otp_code = data.otpCode;
  if (data.otpGeneratedAt !== undefined) updateData.otp_generated_at = data.otpGeneratedAt.toISOString();
  if (data.status !== undefined) updateData.status = data.status;
  if (data.remainingSalads !== undefined) updateData.remaining_salads = data.remainingSalads;
  if (data.paymentConfirmedAt !== undefined)
    updateData.payment_confirmed_at = data.paymentConfirmedAt.toISOString();
  if (data.activatedAt !== undefined) updateData.activated_at = data.activatedAt.toISOString();
  if (data.expiresAt !== undefined) updateData.expires_at = data.expiresAt.toISOString();
  if (data.refundedAt !== undefined) updateData.refunded_at = data.refundedAt.toISOString();
  if (data.refundAmount !== undefined) updateData.refund_amount = data.refundAmount;
  if (data.refundReason !== undefined) updateData.refund_reason = data.refundReason;

  const { data: subscription, error } = await supabaseServer
    .from('subscriptions')
    .update(updateData as any)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update subscription: ${error.message}`);
  }

  return toEntity(subscription);
}

/**
 * List subscriptions with filters and pagination
 */
export async function listSubscriptions(params: {
  page?: number;
  limit?: number;
  status?: SubscriptionStatus;
  planType?: PlanType;
  search?: string;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: 'createdAt' | 'activatedAt' | 'expiresAt';
  sortOrder?: 'asc' | 'desc';
}): Promise<{ subscriptions: SubscriptionWithCustomer[]; total: number }> {
  const page = params.page || 1;
  const limit = params.limit || 20;
  const offset = (page - 1) * limit;

  let query = supabaseServer.from('subscriptions').select('*, customers(*)', { count: 'exact' });

  // Apply filters
  if (params.status) {
    query = query.eq('status', params.status);
  }

  if (params.planType) {
    query = query.eq('plan_type', params.planType);
  }

  if (params.search) {
    query = query.or(
      `subscription_code.ilike.%${params.search}%,activation_code.ilike.%${params.search}%`
    );
  }

  if (params.dateFrom) {
    query = query.gte('created_at', params.dateFrom.toISOString());
  }

  if (params.dateTo) {
    query = query.lte('created_at', params.dateTo.toISOString());
  }

  // Apply sorting
  const sortField = params.sortBy === 'activatedAt' ? 'activated_at' : 
                    params.sortBy === 'expiresAt' ? 'expires_at' : 'created_at';
  const sortOrder = params.sortOrder === 'asc';

  query = query.order(sortField, { ascending: sortOrder }).range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to list subscriptions: ${error.message}`);
  }

  const subscriptions = data.map((row) => {
    const subscription = toEntity(row);
    const customer = toCustomerEntity(row.customers);
    return { ...subscription, customer };
  });

  return {
    subscriptions,
    total: count || 0,
  };
}

/**
 * List all subscriptions with customers for redemption interface
 * Sorted by priority: active (with salads) > pending_payment > expired > refunded
 */
export async function listAllSubscriptionsForRedemption(): Promise<SubscriptionWithCustomer[]> {
  const { data, error } = await supabaseServer
    .from('subscriptions')
    .select('*, customers(*)')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to list subscriptions: ${error.message}`);
  }

  if (!data || data.length === 0) {
    return [];
  }

  const subscriptions = data.map((row) => {
    const subscription = toEntity(row);
    const customer = toCustomerEntity(row.customers);
    return { ...subscription, customer };
  });

  // Sort by status priority
  const statusPriority: Record<SubscriptionStatus, number> = {
    active: 1,
    pending_payment: 2,
    expired: 3,
    refunded: 4,
  };

  return subscriptions.sort((a, b) => {
    const priorityDiff = statusPriority[a.status] - statusPriority[b.status];
    if (priorityDiff !== 0) return priorityDiff;

    // Within same status, active subscriptions with more salads come first
    if (a.status === 'active' && b.status === 'active') {
      return b.remainingSalads - a.remainingSalads;
    }

    // Otherwise sort by creation date (newest first)
    return b.createdAt.getTime() - a.createdAt.getTime();
  });
}

/**
 * Get subscriptions count by status
 */
export async function getSubscriptionCountsByStatus(): Promise<
  Record<SubscriptionStatus, number>
> {
  const { data, error } = await supabaseServer
    .from('subscriptions')
    .select('status')
    .then(async (result) => {
      if (result.error) throw result.error;
      
      const counts: Record<string, number> = {};
      result.data.forEach((row) => {
        counts[row.status] = (counts[row.status] || 0) + 1;
      });
      
      return {
        data: counts,
        error: null,
      };
    });

  if (error) {
    throw new Error(`Failed to get subscription counts: ${error.message}`);
  }

  return {
    pending_payment: data.pending_payment || 0,
    active: data.active || 0,
    expired: data.expired || 0,
    refunded: data.refunded || 0,
  };
}

export { toEntity as toSubscriptionEntity };
