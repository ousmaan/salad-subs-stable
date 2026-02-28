/**
 * Config Repository
 * Data access layer for system configuration
 */

import { supabaseServer } from '@/lib/supabase/server';
import { Config, PlanConfig, BusinessConfig } from '@/types/entities';
import { Database } from '@/types/database.types';

type ConfigRow = Database['public']['Tables']['config']['Row'];

/**
 * Convert database row to entity
 */
function toEntity(row: ConfigRow): Config {
  return {
    key: row.key,
    value: row.value as Record<string, unknown>,
    description: row.description,
    updatedAt: new Date(row.updated_at),
  };
}

/**
 * Get config value by key
 */
export async function getConfig<T = unknown>(key: string): Promise<T | null> {
  const { data, error } = await supabaseServer.from('config').select().eq('key', key).single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to get config: ${error.message}`);
  }

  return data.value as T;
}

/**
 * Set config value
 */
export async function setConfig(
  key: string,
  value: unknown,
  description?: string
): Promise<void> {
  const { error } = await supabaseServer
    .from('config')
    .upsert({
      key,
      value: value as any,
      description: description || null,
    } as any)
    .eq('key', key);

  if (error) {
    throw new Error(`Failed to set config: ${error.message}`);
  }
}

/**
 * Get all config entries
 */
export async function getAllConfig(): Promise<Config[]> {
  const { data, error } = await supabaseServer.from('config').select().order('key');

  if (error) {
    throw new Error(`Failed to get all config: ${error.message}`);
  }

  return data.map(toEntity);
}

/**
 * Get plan configuration
 */
export async function getPlanConfig(): Promise<PlanConfig> {
  const config = await getConfig<PlanConfig>('plan_config');

  if (!config) {
    // Return default plan config
    return {
      biweekly: {
        price: 75,
        salads: 15,
        validityDays: 15,
        gracePeriodDays: 3,
      },
      monthly: {
        price: 180,
        salads: 30,
        validityDays: 30,
        gracePeriodDays: 5,
      },
    };
  }

  return config;
}

/**
 * Update plan configuration
 */
export async function updatePlanConfig(planConfig: Partial<PlanConfig>): Promise<void> {
  const currentConfig = await getPlanConfig();
  const updatedConfig = {
    biweekly: { ...currentConfig.biweekly, ...planConfig.biweekly },
    monthly: { ...currentConfig.monthly, ...planConfig.monthly },
  };

  await setConfig('plan_config', updatedConfig, 'Subscription plan configurations');
}

/**
 * Get business configuration
 */
export async function getBusinessConfig(): Promise<BusinessConfig> {
  const config = await getConfig<BusinessConfig>('business_config');

  if (!config) {
    // Return default business config
    return {
      nameAr: 'كشك السلطة',
      nameEn: 'Salad Stall',
      phone: '+966XXXXXXXXX',
      address: 'العنوان هنا',
    };
  }

  return config;
}

/**
 * Update business configuration
 */
export async function updateBusinessConfig(
  businessConfig: Partial<BusinessConfig>
): Promise<void> {
  const currentConfig = await getBusinessConfig();
  const updatedConfig = { ...currentConfig, ...businessConfig };

  await setConfig(
    'business_config',
    updatedConfig,
    'Business information for invoices and receipts'
  );
}

/**
 * Delete config entry
 */
export async function deleteConfig(key: string): Promise<void> {
  const { error } = await supabaseServer.from('config').delete().eq('key', key);

  if (error) {
    throw new Error(`Failed to delete config: ${error.message}`);
  }
}
