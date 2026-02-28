/**
 * Staff Repository
 * Data access layer for staff operations
 */

import { supabaseServer } from '@/lib/supabase/server';
import { Staff } from '@/types/entities';
import { Database } from '@/types/database.types';

type StaffRow = Database['public']['Tables']['staff']['Row'];
type StaffInsert = Database['public']['Tables']['staff']['Insert'];

/**
 * Convert database row to entity
 */
export function toEntity(row: StaffRow): Staff {
  return {
    id: row.id,
    name: row.name,
    pinHash: row.pin_hash,
    isActive: row.is_active,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

/**
 * Create a new staff member
 */
export async function createStaff(data: { name: string; pinHash: string }): Promise<Staff> {
  const insertData: StaffInsert = {
    name: data.name,
    pin_hash: data.pinHash,
    is_active: true,
  };

  const { data: staff, error } = await supabaseServer
    .from('staff')
    .insert(insertData as any)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create staff: ${error.message}`);
  }

  return toEntity(staff);
}

/**
 * Find staff by ID
 */
export async function findStaffById(id: string): Promise<Staff | null> {
  const { data, error } = await supabaseServer.from('staff').select().eq('id', id).single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to find staff: ${error.message}`);
  }

  return toEntity(data);
}

/**
 * Find active staff by name (for login simulation if needed)
 */
export async function findStaffByName(name: string): Promise<Staff | null> {
  const { data, error } = await supabaseServer
    .from('staff')
    .select()
    .eq('name', name)
    .eq('is_active', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to find staff: ${error.message}`);
  }

  return toEntity(data);
}

/**
 * List all staff members
 */
export async function listStaff(activeOnly: boolean = false): Promise<Staff[]> {
  let query = supabaseServer.from('staff').select().order('created_at', { ascending: false });

  if (activeOnly) {
    query = query.eq('is_active', true);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to list staff: ${error.message}`);
  }

  return data.map(toEntity);
}

/**
 * Update staff member
 */
export async function updateStaff(
  id: string,
  data: { name?: string; pinHash?: string; isActive?: boolean }
): Promise<Staff> {
  const updateData: Partial<StaffRow> = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.pinHash !== undefined) updateData.pin_hash = data.pinHash;
  if (data.isActive !== undefined) updateData.is_active = data.isActive;

  const { data: staff, error } = await supabaseServer
    .from('staff')
    .update(updateData as any)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update staff: ${error.message}`);
  }

  return toEntity(staff);
}

/**
 * Delete staff member
 */
export async function deleteStaff(id: string): Promise<void> {
  const { error } = await supabaseServer.from('staff').delete().eq('id', id);

  if (error) {
    throw new Error(`Failed to delete staff: ${error.message}`);
  }
}

/**
 * Get all active staff (for authentication purposes)
 */
export async function getAllActiveStaff(): Promise<Staff[]> {
  const { data, error } = await supabaseServer
    .from('staff')
    .select()
    .eq('is_active', true)
    .order('name');

  if (error) {
    throw new Error(`Failed to get active staff: ${error.message}`);
  }

  return data.map(toEntity);
}

export { toEntity as toStaffEntity };
