/**
 * Customer Service
 * Business logic for customer management
 */

import {
  createCustomer as createCustomerRepo,
  findCustomerByPhone,
  searchCustomers as searchCustomersRepo,
} from '@/lib/repositories/customer.repository';
import { Customer } from '@/types/entities';

/**
 * Register a new customer
 * Checks for duplicate phone numbers before creating
 */
export async function registerCustomer(data: {
  name: string;
  phone: string;
}): Promise<{
  success: boolean;
  customer?: Customer;
  error?: string;
}> {
  try {
    // Normalize phone number
    const normalizedPhone = normalizePhoneNumber(data.phone);

    // Check if customer with this phone already exists
    const existingCustomer = await findCustomerByPhone(normalizedPhone);

    if (existingCustomer) {
      return {
        success: false,
        error: 'رقم الهاتف مسجل مسبقاً',
      };
    }

    // Create new customer
    const customer = await createCustomerRepo({
      name: data.name,
      phone: normalizedPhone,
    });

    return {
      success: true,
      customer,
    };
  } catch (error) {
    console.error('Customer registration error:', error);
    return {
      success: false,
      error: 'حدث خطأ أثناء تسجيل العميل',
    };
  }
}

/**
 * Get or create customer by phone
 * If customer exists, return existing; otherwise create new
 */
export async function getOrCreateCustomer(data: {
  name: string;
  phone: string;
}): Promise<{
  success: boolean;
  customer?: Customer;
  isNew?: boolean;
  error?: string;
}> {
  try {
    const normalizedPhone = normalizePhoneNumber(data.phone);

    // Try to find existing customer
    let customer = await findCustomerByPhone(normalizedPhone);

    if (customer) {
      return {
        success: true,
        customer,
        isNew: false,
      };
    }

    // Create new customer
    customer = await createCustomerRepo({
      name: data.name,
      phone: normalizedPhone,
    });

    return {
      success: true,
      customer,
      isNew: true,
    };
  } catch (error) {
    console.error('Get or create customer error:', error);
    return {
      success: false,
      error: 'حدث خطأ أثناء معالجة بيانات العميل',
    };
  }
}

/**
 * Search for customers
 */
export async function searchCustomers(query: string): Promise<{
  success: boolean;
  customers?: Customer[];
  error?: string;
}> {
  try {
    const customers = await searchCustomersRepo(query);

    return {
      success: true,
      customers,
    };
  } catch (error) {
    console.error('Customer search error:', error);
    return {
      success: false,
      error: 'حدث خطأ أثناء البحث',
    };
  }
}

/**
 * Normalize phone number to a consistent format
 * Converts to format: +966XXXXXXXXX
 */
function normalizePhoneNumber(phone: string): string {
  // Remove all non-digit characters
  let normalized = phone.replace(/\D/g, '');

  // Handle different formats
  if (normalized.startsWith('966')) {
    // Already has country code
    normalized = `+${normalized}`;
  } else if (normalized.startsWith('05')) {
    // Local format: 05XXXXXXXX
    normalized = `+966${normalized.slice(1)}`;
  } else if (normalized.startsWith('5')) {
    // Short format: 5XXXXXXXX
    normalized = `+966${normalized}`;
  } else if (normalized.length === 9) {
    // 9 digits, assume it's without leading 0
    normalized = `+966${normalized}`;
  }

  return normalized;
}

/**
 * Validate Saudi phone number format
 */
export function isValidSaudiPhone(phone: string): boolean {
  const normalized = phone.replace(/\D/g, '');
  
  // Check if it matches Saudi phone patterns
  if (normalized.length === 12 && normalized.startsWith('966')) {
    return normalized[3] === '5';
  } else if (normalized.length === 10 && normalized.startsWith('05')) {
    return true;
  } else if (normalized.length === 9 && normalized.startsWith('5')) {
    return true;
  }

  return false;
}
