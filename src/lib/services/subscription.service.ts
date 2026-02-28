/**
 * Subscription Service
 * Business logic for subscription management
 */

import {
  createSubscription as createSubscriptionRepo,
  findSubscriptionById,
  findSubscriptionByCode,
  findSubscriptionByActivationCode,
  updateSubscription,
  listSubscriptions as listSubscriptionsRepo,
  searchSubscriptionsByPhone,
  getSubscriptionWithCustomer,
} from '@/lib/repositories/subscription.repository';
import { getPlanConfig } from '@/lib/repositories/config.repository';
import { createAuditLog } from '@/lib/repositories/audit.repository';
import { generateSecureCode, generateOTP, formatSubscriptionId } from '@/lib/utils/code-generator';
import {
  Subscription,
  SubscriptionWithCustomer,
  PlanType,
  SubscriptionStatus,
  UserType,
} from '@/types/entities';

/**
 * Create a new subscription
 */
export async function createSubscription(data: {
  customerId: string;
  planType: PlanType;
}): Promise<{
  success: boolean;
  subscription?: Subscription;
  error?: string;
}> {
  try {
    // Get plan configuration
    const planConfig = await getPlanConfig();
    const plan = planConfig[data.planType];

    // Generate unique subscription code (6-digit numeric formatted as XXX-XXX)
    let subscriptionCode: string;
    let isUnique = false;

    while (!isUnique) {
      const rawCode = generateSecureCode(); // 6-digit numeric code
      subscriptionCode = formatSubscriptionId(rawCode); // Format as XXX-XXX
      const existing = await findSubscriptionByCode(subscriptionCode);
      isUnique = existing === null;
    }

    // Create subscription
    const subscription = await createSubscriptionRepo({
      customerId: data.customerId,
      subscriptionCode: subscriptionCode!,
      planType: data.planType,
      price: plan.price,
      totalSalads: plan.salads,
    });

    return {
      success: true,
      subscription,
    };
  } catch (error) {
    console.error('Create subscription error:', error);
    return {
      success: false,
      error: 'حدث خطأ أثناء إنشاء الاشتراك',
    };
  }
}

/**
 * Activate a subscription after payment confirmation
 */
export async function activateSubscription(data: {
  subscriptionId: string;
  staffId: string;
  receiptNumber?: string;
}): Promise<{
  success: boolean;
  subscription?: Subscription;
  activationCode?: string;
  error?: string;
}> {
  try {
    const subscription = await findSubscriptionById(data.subscriptionId);

    if (!subscription) {
      return {
        success: false,
        error: 'الاشتراك غير موجود',
      };
    }

    if (subscription.status !== SubscriptionStatus.PENDING_PAYMENT) {
      return {
        success: false,
        error: 'الاشتراك تم تفعيله مسبقاً أو غير صالح',
      };
    }

    // Generate unique activation code
    let activationCode: string = '';
    let isUnique = false;
    let attempts = 0;
    const maxAttempts = 100;

    console.log('[Activation] Generating activation code...');
    while (!isUnique && attempts < maxAttempts) {
      activationCode = generateSecureCode();
      console.log('[Activation] Trying code:', activationCode, 'attempt:', attempts + 1);
      const existing = await findSubscriptionByActivationCode(activationCode);
      isUnique = existing === null;
      attempts++;
    }
    
    if (!isUnique) {
      throw new Error('Failed to generate unique activation code after 100 attempts');
    }
    
    console.log('[Activation] Activation code generated:', activationCode);

    // Generate 4-digit OTP for redemption verification
    const otpCode = generateOTP();
    console.log('[Activation] OTP generated:', otpCode);

    // Get plan config for expiry calculation
    const planConfig = await getPlanConfig();
    const plan = planConfig[subscription.planType];

    const now = new Date();
    const expiresAt = new Date(now);
    // Total expiry = validityDays + gracePeriodDays
    const totalDays = plan.validityDays + plan.gracePeriodDays;
    expiresAt.setDate(expiresAt.getDate() + totalDays);

    console.log('[Activation] Updating subscription with OTP and receipt number...');
    // Update subscription to active with OTP and optional receipt number
    const updatedSubscription = await updateSubscription(data.subscriptionId, {
      activationCode: activationCode!,
      otpCode: otpCode,
      otpGeneratedAt: now,
      receiptNumber: data.receiptNumber,
      status: SubscriptionStatus.ACTIVE,
      paymentConfirmedAt: now,
      activatedAt: now,
      expiresAt: expiresAt,
    });
    console.log('[Activation] Subscription updated successfully');

    // Create audit log (skip if using test staff ID)
    if (data.staffId !== '00000000-0000-0000-0000-000000000001') {
      await createAuditLog({
        userType: UserType.STAFF,
        userId: data.staffId,
        action: 'subscription_activated',
        entityType: 'subscription',
        entityId: data.subscriptionId,
        details: {
          subscriptionCode: subscription.subscriptionCode,
          activationCode: activationCode!,
          planType: subscription.planType,
          price: subscription.price,
        },
      });
    } else {
      console.log('[Activation] Skipping audit log (test mode)');
    }

    // Fetch subscription with customer data for the response
    const subscriptionWithCustomer = await getSubscriptionWithCustomer(data.subscriptionId);
    if (!subscriptionWithCustomer) {
      throw new Error('Failed to fetch updated subscription');
    }

    return {
      success: true,
      subscription: subscriptionWithCustomer,
      activationCode: activationCode!,
    };
  } catch (error) {
    console.error('[Activation] Error:', error);
    return {
      success: false,
      error: `Failed to activate subscription: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }
}

/**
 * Process subscription refund
 */
export async function refundSubscription(data: {
  subscriptionId: string;
  adminId: string;
  reason: string;
  partialRefund?: boolean;
}): Promise<{
  success: boolean;
  subscription?: Subscription;
  refundAmount?: number;
  error?: string;
}> {
  try {
    const subscription = await findSubscriptionById(data.subscriptionId);

    if (!subscription) {
      return {
        success: false,
        error: 'الاشتراك غير موجود',
      };
    }

    if (subscription.status === SubscriptionStatus.REFUNDED) {
      return {
        success: false,
        error: 'تم استرجاع المبلغ مسبقاً',
      };
    }

    if (subscription.status === SubscriptionStatus.PENDING_PAYMENT) {
      return {
        success: false,
        error: 'لا يمكن استرجاع اشتراك غير مدفوع',
      };
    }

    // Calculate refund amount
    let refundAmount: number;

    if (data.partialRefund && subscription.status === SubscriptionStatus.ACTIVE) {
      // Partial refund based on unused salads
      const usedSalads = subscription.totalSalads - subscription.remainingSalads;
      const pricePerSalad = subscription.price / subscription.totalSalads;
      refundAmount = Math.round(subscription.remainingSalads * pricePerSalad * 100) / 100;
    } else {
      // Full refund
      refundAmount = subscription.price;
    }

    // Update subscription
    const updatedSubscription = await updateSubscription(data.subscriptionId, {
      status: SubscriptionStatus.REFUNDED,
      refundedAt: new Date(),
      refundAmount,
      refundReason: data.reason,
    });

    // Create audit log
    await createAuditLog({
      userType: UserType.ADMIN,
      userId: data.adminId,
      action: 'subscription_refunded',
      entityType: 'subscription',
      entityId: data.subscriptionId,
      details: {
        subscriptionCode: subscription.subscriptionCode,
        originalPrice: subscription.price,
        refundAmount,
        refundReason: data.reason,
        partialRefund: data.partialRefund,
      },
    });

    return {
      success: true,
      subscription: updatedSubscription,
      refundAmount,
    };
  } catch (error) {
    console.error('Refund subscription error:', error);
    return {
      success: false,
      error: 'حدث خطأ أثناء معالجة الاسترجاع',
    };
  }
}

/**
 * Search subscriptions by code or phone
 */
export async function searchSubscriptions(query: string): Promise<{
  success: boolean;
  subscriptions?: SubscriptionWithCustomer[];
  error?: string;
}> {
  try {
    let subscriptions: SubscriptionWithCustomer[] = [];

    // Trim and normalize query
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      return {
        success: true,
        subscriptions: [],
      };
    }

    // Check if query is a 6-character code (SUB001, ACT001, etc.)
    if (/^[A-Z0-9]{6}$/i.test(normalizedQuery)) {
      // Try subscription code first
      const subByCode = await findSubscriptionByCode(normalizedQuery);
      if (subByCode) {
        subscriptions = [subByCode];
      } else {
        // Try activation code
        const subByActivation = await findSubscriptionByActivationCode(normalizedQuery);
        if (subByActivation) {
          subscriptions = [subByActivation];
        }
      }
    } else {
      // Search by phone
      subscriptions = await searchSubscriptionsByPhone(normalizedQuery);
    }

    return {
      success: true,
      subscriptions: subscriptions || [],
    };
  } catch (error) {
    console.error('Search subscriptions error:', error);
    return {
      success: false,
      error: 'حدث خطأ أثناء البحث',
    };
  }
}

/**
 * List subscriptions with filters
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
}): Promise<{
  success: boolean;
  subscriptions?: SubscriptionWithCustomer[];
  total?: number;
  error?: string;
}> {
  try {
    const result = await listSubscriptionsRepo(params);

    return {
      success: true,
      subscriptions: result.subscriptions,
      total: result.total,
    };
  } catch (error) {
    console.error('List subscriptions error:', error);
    return {
      success: false,
      error: 'حدث خطأ أثناء جلب الاشتراكات',
    };
  }
}

/**
 * Check if subscription is expired and update status if needed
 */
export async function checkAndUpdateExpiredStatus(
  subscriptionId: string
): Promise<Subscription | null> {
  try {
    const subscription = await findSubscriptionById(subscriptionId);

    if (!subscription) {
      return null;
    }

    // Check if active and expired
    if (
      subscription.status === SubscriptionStatus.ACTIVE &&
      subscription.expiresAt &&
      new Date() > subscription.expiresAt
    ) {
      return await updateSubscription(subscriptionId, {
        status: SubscriptionStatus.EXPIRED,
      });
    }

    return subscription;
  } catch (error) {
    console.error('Check expired status error:', error);
    return null;
  }
}
