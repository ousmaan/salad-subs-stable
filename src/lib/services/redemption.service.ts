/**
 * Redemption Service
 * Business logic for salad redemption operations
 */

import {
  createRedemption as createRedemptionRepo,
  getRedemptionsBySubscriptionId,
} from '@/lib/repositories/redemption.repository';
import {
  findSubscriptionById,
  findSubscriptionByActivationCode,
  updateSubscription,
  searchSubscriptionsByPhone,
  listAllSubscriptionsForRedemption as listAllSubscriptionsForRedemptionRepo,
} from '@/lib/repositories/subscription.repository';
import { searchCustomers } from '@/lib/repositories/customer.repository';
import { createAuditLog } from '@/lib/repositories/audit.repository';
import {
  Redemption,
  SubscriptionWithCustomer,
  SubscriptionStatus,
  UserType,
} from '@/types/entities';
import { multiFieldSearch } from '@/lib/utils/search';

/**
 * Search for active subscriptions for redemption
 */
export async function searchActiveSubscriptions(query: string): Promise<{
  success: boolean;
  subscriptions?: SubscriptionWithCustomer[];
  error?: string;
}> {
  try {
    let subscriptions: SubscriptionWithCustomer[] = [];

    // Trim and normalize query
    const normalizedQuery = query.trim();

    console.log('[Redemption Search] Query:', normalizedQuery);

    if (!normalizedQuery) {
      return {
        success: true,
        subscriptions: [],
      };
    }

    // Check if query is a 6-character code (activation code or subscription code)
    // Matches: ACT001, SUB001, or 6-digit numbers like 123456
    if (/^[A-Z0-9]{6}$/i.test(normalizedQuery)) {
      console.log('[Redemption Search] Searching by activation code:', normalizedQuery);
      const subscription = await findSubscriptionByActivationCode(normalizedQuery);
      console.log('[Redemption Search] Activation code result:', subscription ? 'Found' : 'Not found');
      
      if (subscription && subscription.status === SubscriptionStatus.ACTIVE && subscription.remainingSalads > 0) {
        subscriptions = [subscription];
      } else if (subscription) {
        console.log('[Redemption Search] Subscription found but not active or no salads remaining. Status:', subscription.status, 'Remaining:', subscription.remainingSalads);
      }
    } else {
      // Search by phone or customer name
      console.log('[Redemption Search] Searching by phone:', normalizedQuery);
      const phoneResults = await searchSubscriptionsByPhone(normalizedQuery);
      console.log('[Redemption Search] Phone results count:', phoneResults?.length || 0);
      
      // Filter for active subscriptions only
      subscriptions = (phoneResults || []).filter(
        (sub) => sub.status === SubscriptionStatus.ACTIVE && sub.remainingSalads > 0
      );
      console.log('[Redemption Search] Active subscriptions after phone filter:', subscriptions.length);

      // If no results by phone, try searching customers by name
      if (subscriptions.length === 0) {
        console.log('[Redemption Search] No phone results, searching customers by name:', normalizedQuery);
        const customers = await searchCustomers(normalizedQuery);
        console.log('[Redemption Search] Customers found by name:', customers?.length || 0);
        
        // Get subscriptions for found customers
        for (const customer of customers) {
          console.log('[Redemption Search] Getting subscriptions for customer:', customer.name, customer.phone);
          const customerSubs = await searchSubscriptionsByPhone(customer.phone);
          const activeSubs = (customerSubs || []).filter(
            (sub) => sub.status === SubscriptionStatus.ACTIVE && sub.remainingSalads > 0
          );
          console.log('[Redemption Search] Active subs for customer:', activeSubs.length);
          subscriptions.push(...activeSubs);
        }
      }
    }

    console.log('[Redemption Search] Total subscriptions before expiry check:', subscriptions.length);

    // Check for expired subscriptions and update status
    const validSubscriptions: SubscriptionWithCustomer[] = [];
    for (const subscription of subscriptions) {
      if (subscription.expiresAt && new Date() > subscription.expiresAt) {
        console.log('[Redemption Search] Subscription expired, updating:', subscription.id);
        // Update to expired
        await updateSubscription(subscription.id, {
          status: SubscriptionStatus.EXPIRED,
        });
      } else {
        validSubscriptions.push(subscription);
      }
    }

    console.log('[Redemption Search] Final valid subscriptions:', validSubscriptions.length);

    return {
      success: true,
      subscriptions: validSubscriptions,
    };
  } catch (error) {
    console.error('Search active subscriptions error:', error);
    return {
      success: false,
      error: 'An error occurred while searching',
    };
  }
}

/**
 * Dispense salads and create redemption record
 */
export async function dispenseSalads(data: {
  subscriptionId: string;
  quantity: number;
  staffId: string;
  otpCode: string;
}): Promise<{
  success: boolean;
  redemption?: Redemption;
  remainingSalads?: number;
  error?: string;
}> {
  try {
    console.log('[Dispense Service] Starting dispense:', data);
    
    // Validate subscription
    const subscription = await findSubscriptionById(data.subscriptionId);
    console.log('[Dispense Service] Subscription found:', subscription ? 'Yes' : 'No');

    if (!subscription) {
      console.log('[Dispense Service] Error: Subscription not found');
      return {
        success: false,
        error: 'Subscription not found',
      };
    }

    console.log('[Dispense Service] Subscription status:', subscription.status);
    console.log('[Dispense Service] Subscription OTP:', subscription.otpCode);
    console.log('[Dispense Service] Provided OTP:', data.otpCode);

    if (subscription.status !== SubscriptionStatus.ACTIVE) {
      console.log('[Dispense Service] Error: Subscription not active');
      return {
        success: false,
        error: 'Subscription is not active',
      };
    }

    // Verify OTP code
    if (!subscription.otpCode || subscription.otpCode !== data.otpCode) {
      console.log('[Dispense Service] Error: OTP mismatch');
      console.log('[Dispense Service] Expected:', subscription.otpCode);
      console.log('[Dispense Service] Got:', data.otpCode);
      return {
        success: false,
        error: '❌ Invalid security code. Please ask the customer for their 4-digit code from the activation receipt.',
      };
    }

    console.log('[Dispense Service] OTP verified successfully!');

    // Check if expired
    if (subscription.expiresAt && new Date() > subscription.expiresAt) {
      console.log('[Dispense Service] Error: Subscription expired');
      // Update to expired
      await updateSubscription(data.subscriptionId, {
        status: SubscriptionStatus.EXPIRED,
      });

      return {
        success: false,
        error: 'Subscription has expired',
      };
    }

    // Check if enough salads remaining
    if (subscription.remainingSalads < data.quantity) {
      console.log('[Dispense Service] Error: Insufficient salads');
      return {
        success: false,
        error: `Insufficient salads remaining. Available: ${subscription.remainingSalads}`,
      };
    }

    console.log('[Dispense Service] Creating redemption record...');
    // Create redemption record
    const redemption = await createRedemptionRepo({
      subscriptionId: data.subscriptionId,
      staffId: data.staffId,
      quantity: data.quantity,
    });
    console.log('[Dispense Service] Redemption created:', redemption.id);

    // Update subscription remaining salads
    const newRemaining = subscription.remainingSalads - data.quantity;
    console.log('[Dispense Service] Updating remaining salads to:', newRemaining);
    const updatedSubscription = await updateSubscription(data.subscriptionId, {
      remainingSalads: newRemaining,
    });
    console.log('[Dispense Service] Subscription updated successfully');

    // Create audit log (skip if using test staff ID)
    if (data.staffId !== '00000000-0000-0000-0000-000000000001') {
      await createAuditLog({
        userType: UserType.STAFF,
        userId: data.staffId,
        action: 'salad_dispensed',
        entityType: 'redemption',
        entityId: redemption.id,
        details: {
          subscriptionId: data.subscriptionId,
          activationCode: subscription.activationCode,
          quantity: data.quantity,
          remainingSalads: newRemaining,
        },
      });
    }

    return {
      success: true,
      redemption,
      remainingSalads: newRemaining,
    };
  } catch (error) {
    console.error('[Dispense Service] EXCEPTION:', error);
    return {
      success: false,
      error: `An error occurred while dispensing salads: ${error instanceof Error ? error.message : 'Unknown'}`,
    };
  }
}

/**
 * Get redemption history for a subscription
 */
export async function getRedemptionHistory(subscriptionId: string): Promise<{
  success: boolean;
  redemptions?: Array<{
    id: string;
    quantity: number;
    redeemedAt: Date;
    staffName: string;
  }>;
  error?: string;
}> {
  try {
    const redemptions = await getRedemptionsBySubscriptionId(subscriptionId);

    const formattedRedemptions = redemptions.map((redemption) => ({
      id: redemption.id,
      quantity: redemption.quantity,
      redeemedAt: redemption.redeemedAt,
      staffName: redemption.staff.name,
    }));

    return {
      success: true,
      redemptions: formattedRedemptions,
    };
  } catch (error) {
    console.error('Get redemption history error:', error);
    return {
      success: false,
      error: 'حدث خطأ أثناء جلب سجل الاستخدام',
    };
  }
}

/**
 * Validate redemption request
 */
export async function validateRedemptionRequest(data: {
  subscriptionId: string;
  quantity: number;
}): Promise<{
  valid: boolean;
  error?: string;
  subscription?: SubscriptionWithCustomer;
}> {
  try {
    const subscription = await findSubscriptionById(data.subscriptionId);

    if (!subscription) {
      return {
        valid: false,
        error: 'الاشتراك غير موجود',
      };
    }

    if (subscription.status !== SubscriptionStatus.ACTIVE) {
      return {
        valid: false,
        error: 'الاشتراك غير نشط',
      };
    }

    if (subscription.expiresAt && new Date() > subscription.expiresAt) {
      return {
        valid: false,
        error: 'الاشتراك منتهي الصلاحية',
      };
    }

    if (subscription.remainingSalads < data.quantity) {
      return {
        valid: false,
        error: `الكمية المتبقية غير كافية. المتبقي: ${subscription.remainingSalads}`,
      };
    }

    if (data.quantity < 1 || data.quantity > 10) {
      return {
        valid: false,
        error: 'الكمية يجب أن تكون بين 1 و 10',
      };
    }

    return {
      valid: true,
    };
  } catch (error) {
    console.error('Validate redemption error:', error);
    return {
      valid: false,
      error: 'حدث خطأ أثناء التحقق من الطلب',
    };
  }
}

/**
 * List all subscriptions with smart search filtering
 * Returns all subscriptions sorted by priority, optionally filtered by search query
 */
export async function listAllSubscriptionsForRedemption(searchQuery?: string): Promise<{
  success: boolean;
  subscriptions?: SubscriptionWithCustomer[];
  error?: string;
}> {
  try {
    console.log('[Redemption Service] Listing all subscriptions, search query:', searchQuery || 'none');

    // Get all subscriptions from repository
    const allSubscriptions = await listAllSubscriptionsForRedemptionRepo();
    
    console.log('[Redemption Service] Total subscriptions fetched:', allSubscriptions.length);

    // If no search query, return all
    if (!searchQuery || searchQuery.trim() === '') {
      return {
        success: true,
        subscriptions: allSubscriptions,
      };
    }

    // Apply smart search filtering
    const query = searchQuery.trim();
    const filteredSubscriptions = allSubscriptions.filter((sub) => {
      // Search across multiple fields
      const searchFields = [
        sub.customer.name,
        sub.customer.phone,
        sub.subscriptionCode,
        sub.activationCode,
      ];

      return multiFieldSearch(query, searchFields);
    });

    console.log('[Redemption Service] Filtered subscriptions:', filteredSubscriptions.length);

    return {
      success: true,
      subscriptions: filteredSubscriptions,
    };
  } catch (error) {
    console.error('List subscriptions for redemption error:', error);
    return {
      success: false,
      error: 'An error occurred while listing subscriptions',
    };
  }
}
