/**
 * Business Entity Types
 * Domain models representing business logic entities
 */

export enum SubscriptionStatus {
  PENDING_PAYMENT = 'pending_payment',
  ACTIVE = 'active',
  EXPIRED = 'expired',
  REFUNDED = 'refunded',
}

export enum PlanType {
  BIWEEKLY = 'biweekly',
  MONTHLY = 'monthly',
}

export enum UserType {
  STAFF = 'staff',
  ADMIN = 'admin',
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Subscription {
  id: string;
  customerId: string;
  subscriptionCode: string;
  activationCode: string | null;
  receiptNumber: string | null; // Last 5 digits of payment receipt (optional, admin-only)
  planType: PlanType;
  price: number;
  totalSalads: number;
  remainingSalads: number;
  status: SubscriptionStatus;
  paymentConfirmedAt: Date | null;
  activatedAt: Date | null;
  expiresAt: Date | null;
  refundedAt: Date | null;
  refundAmount: number | null;
  refundReason: string | null;
  otpCode: string | null; // 4-digit OTP for redemption verification
  otpGeneratedAt: Date | null; // When OTP was generated
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionWithCustomer extends Subscription {
  customer: Customer;
}

export interface Redemption {
  id: string;
  subscriptionId: string;
  staffId: string;
  quantity: number;
  redeemedAt: Date;
  createdAt: Date;
}

export interface RedemptionWithDetails extends Redemption {
  staff: Staff;
  subscription: Subscription;
}

export interface Staff {
  id: string;
  name: string;
  pinHash: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Admin {
  id: string;
  username: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Config {
  key: string;
  value: ConfigValue;
  description: string | null;
  updatedAt: Date;
}

export type ConfigValue = string | number | boolean | Record<string, unknown>;

export interface PlanConfig {
  biweekly: {
    price: number;
    salads: number;
    validityDays: number;
    gracePeriodDays: number;
    daftraItemCode?: string;
  };
  monthly: {
    price: number;
    salads: number;
    validityDays: number;
    gracePeriodDays: number;
    daftraItemCode?: string;
  };
}

export interface BusinessConfig {
  nameAr: string;
  nameEn: string;
  phone: string;
  address: string;
}

export interface AuditLog {
  id: string;
  userType: UserType;
  userId: string;
  action: string;
  entityType: string;
  entityId: string | null;
  details: Record<string, unknown> | null;
  createdAt: Date;
}

export interface DashboardStats {
  activeSubscriptions: number;
  pendingActivations: number;
  todayRedemptions: number;
  totalRevenue: number;
  weeklyRevenue: number;
  monthlyRevenue: number;
  revenueChange: number; // percentage change
  subscriptionsByStatus: {
    pending_payment: number;
    active: number;
    expired: number;
    refunded: number;
  };
}

export interface RevenueTrend {
  date: string;
  revenue: number;
  subscriptions: number;
}

export interface SubscriptionTrend {
  date: string;
  weekly: number;
  monthly: number;
  total: number;
}
