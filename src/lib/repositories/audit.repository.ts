/**
 * Audit Log Repository
 * Data access layer for audit logging
 */

import { supabaseServer } from '@/lib/supabase/server';
import { AuditLog, UserType } from '@/types/entities';
import { Database } from '@/types/database.types';

type AuditLogRow = Database['public']['Tables']['audit_logs']['Row'];
type AuditLogInsert = Database['public']['Tables']['audit_logs']['Insert'];

/**
 * Convert database row to entity
 */
function toEntity(row: AuditLogRow): AuditLog {
  return {
    id: row.id,
    userType: row.user_type as UserType,
    userId: row.user_id,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    details: row.details as Record<string, unknown> | null,
    createdAt: new Date(row.created_at),
  };
}

/**
 * Create audit log entry
 */
export async function createAuditLog(data: {
  userType: UserType;
  userId: string;
  action: string;
  entityType: string;
  entityId?: string;
  details?: Record<string, unknown>;
}): Promise<AuditLog> {
  const insertData: AuditLogInsert = {
    user_type: data.userType,
    user_id: data.userId,
    action: data.action,
    entity_type: data.entityType,
    entity_id: data.entityId || null,
    details: (data.details as Database['public']['Tables']['audit_logs']['Insert']['details']) || null,
  };

  const { data: auditLog, error } = await supabaseServer
    .from('audit_logs')
    .insert(insertData)
    .select()
    .single();

  if (error) {
    // Log error but don't throw - audit logging should not break the main flow
    console.error('Failed to create audit log:', error);
    throw new Error(`Failed to create audit log: ${error.message}`);
  }

  return toEntity(auditLog);
}

/**
 * Get audit logs with filters
 */
export async function getAuditLogs(params: {
  userType?: UserType;
  userId?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
  offset?: number;
}): Promise<{ logs: AuditLog[]; total: number }> {
  let query = supabaseServer.from('audit_logs').select('*', { count: 'exact' });

  if (params.userType) {
    query = query.eq('user_type', params.userType);
  }

  if (params.userId) {
    query = query.eq('user_id', params.userId);
  }

  if (params.action) {
    query = query.eq('action', params.action);
  }

  if (params.entityType) {
    query = query.eq('entity_type', params.entityType);
  }

  if (params.entityId) {
    query = query.eq('entity_id', params.entityId);
  }

  if (params.dateFrom) {
    query = query.gte('created_at', params.dateFrom.toISOString());
  }

  if (params.dateTo) {
    query = query.lte('created_at', params.dateTo.toISOString());
  }

  const limit = params.limit || 50;
  const offset = params.offset || 0;

  query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to get audit logs: ${error.message}`);
  }

  return {
    logs: data.map(toEntity),
    total: count || 0,
  };
}

/**
 * Get recent activity for a user
 */
export async function getUserRecentActivity(
  userType: UserType,
  userId: string,
  limit: number = 10
): Promise<AuditLog[]> {
  const { data, error } = await supabaseServer
    .from('audit_logs')
    .select()
    .eq('user_type', userType)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to get user activity: ${error.message}`);
  }

  return data.map(toEntity);
}

/**
 * Get audit logs for specific entity
 */
export async function getEntityAuditLogs(
  entityType: string,
  entityId: string
): Promise<AuditLog[]> {
  const { data, error } = await supabaseServer
    .from('audit_logs')
    .select()
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to get entity audit logs: ${error.message}`);
  }

  return data.map(toEntity);
}

export { toEntity as toAuditLogEntity };
