/**
 * Admin Repository
 * Data access layer for admin operations
 */

import { supabaseServer } from '@/lib/supabase/server';
import { Admin } from '@/types/entities';
import { Database } from '@/types/database.types';

type AdminRow = Database['public']['Tables']['admins']['Row'];
type AdminInsert = Database['public']['Tables']['admins']['Insert'];

/**
 * Convert database row to entity
 */
function toEntity(row: AdminRow): Admin {
  return {
    id: row.id,
    username: row.username,
    passwordHash: row.password_hash,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

/**
 * Create a new admin
 */
export async function createAdmin(data: {
  username: string;
  passwordHash: string;
}): Promise<Admin> {
  const insertData: AdminInsert = {
    username: data.username,
    password_hash: data.passwordHash,
  };

  const { data: admin, error } = await supabaseServer
    .from('admins')
    .insert(insertData as any)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create admin: ${error.message}`);
  }

  return toEntity(admin);
}

/**
 * Find admin by username
 */
export async function findAdminByUsername(username: string): Promise<Admin | null> {
  const { data, error } = await supabaseServer
    .from('admins')
    .select()
    .eq('username', username)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to find admin: ${error.message}`);
  }

  return toEntity(data);
}

/**
 * Find admin by ID
 */
export async function findAdminById(id: string): Promise<Admin | null> {
  const { data, error } = await supabaseServer.from('admins').select().eq('id', id).single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to find admin: ${error.message}`);
  }

  return toEntity(data);
}

/**
 * List all admins
 */
export async function listAdmins(): Promise<Admin[]> {
  const { data, error } = await supabaseServer
    .from('admins')
    .select()
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to list admins: ${error.message}`);
  }

  return data.map(toEntity);
}

/**
 * Update admin
 */
export async function updateAdmin(
  id: string,
  data: { username?: string; passwordHash?: string }
): Promise<Admin> {
  const updateData: Partial<AdminRow> = {};

  if (data.username !== undefined) updateData.username = data.username;
  if (data.passwordHash !== undefined) updateData.password_hash = data.passwordHash;

  const { data: admin, error } = await supabaseServer
    .from('admins')
    .update(updateData as any)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update admin: ${error.message}`);
  }

  return toEntity(admin);
}

/**
 * Delete admin
 */
export async function deleteAdmin(id: string): Promise<void> {
  const { error } = await supabaseServer.from('admins').delete().eq('id', id);

  if (error) {
    throw new Error(`Failed to delete admin: ${error.message}`);
  }
}

export { toEntity as toAdminEntity };
