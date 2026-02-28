/**
 * Redemption Repository
 * Data access layer for redemption operations
 */

import { supabaseServer } from '@/lib/supabase/server';
import { Redemption, RedemptionWithDetails } from '@/types/entities';
import { Database } from '@/types/database.types';
import { toSubscriptionEntity } from './subscription.repository';
import { toStaffEntity } from './staff.repository';

type RedemptionRow = Database['public']['Tables']['redemptions']['Row'];
type RedemptionInsert = Database['public']['Tables']['redemptions']['Insert'];

/**
 * Convert database row to entity
 */
function toEntity(row: RedemptionRow): Redemption {
  return {
    id: row.id,
    subscriptionId: row.subscription_id,
    staffId: row.staff_id,
    quantity: row.quantity,
    redeemedAt: new Date(row.redeemed_at),
    createdAt: new Date(row.created_at),
  };
}

/**
 * Create a new redemption
 */
export async function createRedemption(data: {
  subscriptionId: string;
  staffId: string;
  quantity: number;
}): Promise<Redemption> {
  const insertData: RedemptionInsert = {
    subscription_id: data.subscriptionId,
    staff_id: data.staffId,
    quantity: data.quantity,
  };

  // @ts-ignore - Supabase type generation issue


  const { data: redemption, error } = await supabaseServer
    .from('redemptions')
    .insert(insertData as any)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create redemption: ${error.message}`);
  }

  return toEntity(redemption);
}

/**
 * Get redemptions by subscription ID
 */
export async function getRedemptionsBySubscriptionId(
  subscriptionId: string
): Promise<RedemptionWithDetails[]> {
  const { data, error } = await supabaseServer
    .from('redemptions')
    .select('*, staff(*), subscriptions(*, customers(*))')
    .eq('subscription_id', subscriptionId)
    .order('redeemed_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to get redemptions: ${error.message}`);
  }

  return data.map((row) => {
    const redemption = toEntity(row);
    const staff = toStaffEntity(row.staff);
    const subscription = toSubscriptionEntity(row.subscriptions);
    return { ...redemption, staff, subscription };
  });
}

/**
 * Get today's redemptions count
 */
export async function getTodayRedemptionsCount(): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data, error } = await supabaseServer
    .from('redemptions')
    .select('quantity')
    .gte('redeemed_at', today.toISOString());

  if (error) {
    throw new Error(`Failed to get today's redemptions: ${error.message}`);
  }

  return data.reduce((sum, row) => sum + row.quantity, 0);
}

/**
 * Get redemptions statistics for date range
 */
export async function getRedemptionStats(dateFrom: Date, dateTo: Date): Promise<{
  totalRedemptions: number;
  totalQuantity: number;
}> {
  const { data, error } = await supabaseServer
    .from('redemptions')
    .select('quantity')
    .gte('redeemed_at', dateFrom.toISOString())
    .lte('redeemed_at', dateTo.toISOString());

  if (error) {
    throw new Error(`Failed to get redemption stats: ${error.message}`);
  }

  return {
    totalRedemptions: data.length,
    totalQuantity: data.reduce((sum, row) => sum + row.quantity, 0),
  };
}

export { toEntity as toRedemptionEntity };
