/**
 * Customer Repository
 * Data access layer for customer operations
 */

import { supabaseServer } from '@/lib/supabase/server';
import { Customer } from '@/types/entities';
import { Database } from '@/types/database.types';

type CustomerRow = Database['public']['Tables']['customers']['Row'];
type CustomerInsert = Database['public']['Tables']['customers']['Insert'];

/**
 * Convert database row to entity
 */
export function toEntity(row: CustomerRow): Customer {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

/**
 * Create a new customer
 */
export async function createCustomer(data: {
  name: string;
  phone: string;
}): Promise<Customer> {
  const insertData: CustomerInsert = {
    name: data.name,
    phone: data.phone,
  };

  const { data: customer, error } = await supabaseServer
    .from('customers')
    .insert(insertData as any)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create customer: ${error.message}`);
  }

  return toEntity(customer);
}

/**
 * Find customer by phone number
 */
export async function findCustomerByPhone(phone: string): Promise<Customer | null> {
  const { data, error } = await supabaseServer
    .from('customers')
    .select()
    .eq('phone', phone)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to find customer: ${error.message}`);
  }

  return toEntity(data);
}

/**
 * Find customer by ID
 */
export async function findCustomerById(id: string): Promise<Customer | null> {
  const { data, error } = await supabaseServer
    .from('customers')
    .select()
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to find customer: ${error.message}`);
  }

  return toEntity(data);
}

/**
 * Search customers by name or phone
 */
export async function searchCustomers(query: string): Promise<Customer[]> {
  const { data, error } = await supabaseServer
    .from('customers')
    .select()
    .or(`name.ilike.%${query}%,phone.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    throw new Error(`Failed to search customers: ${error.message}`);
  }

  return data.map(toEntity);
}

/**
 * List all customers with pagination
 */
export async function listCustomers(
  page: number = 1,
  limit: number = 20
): Promise<{ customers: Customer[]; total: number }> {
  const offset = (page - 1) * limit;

  const [{ data, error }, { count, error: countError }] = await Promise.all([
    supabaseServer.from('customers').select().range(offset, offset + limit - 1).order('created_at', { ascending: false }),
    supabaseServer.from('customers').select('*', { count: 'exact', head: true }),
  ]);

  if (error || countError) {
    throw new Error(`Failed to list customers: ${error?.message || countError?.message}`);
  }

  return {
    customers: data.map(toEntity),
    total: count || 0,
  };
}

/**
 * Update customer information
 */
export async function updateCustomer(
  id: string,
  data: { name?: string; phone?: string }
): Promise<Customer> {
  const { data: customer, error } = await supabaseServer
    .from('customers')
    .update(data as any)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update customer: ${error.message}`);
  }

  return toEntity(customer);
}

/**
 * Delete customer
 */
export async function deleteCustomer(id: string): Promise<void> {
  const { error } = await supabaseServer.from('customers').delete().eq('id', id);

  if (error) {
    throw new Error(`Failed to delete customer: ${error.message}`);
  }
}
