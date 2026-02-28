/**
 * API Request and Response Types
 * Type-safe API contracts for all endpoints
 */

import {
  Customer,
  Subscription,
  SubscriptionWithCustomer,
  Redemption,
  RedemptionWithDetails,
  Staff,
  DashboardStats,
  RevenueTrend,
  SubscriptionTrend,
  PlanConfig,
  BusinessConfig,
  PlanType,
  SubscriptionStatus,
} from './entities';

// ============================================================================
// Authentication API Types
// ============================================================================

export interface StaffLoginRequest {
  pin: string;
}

export interface AdminLoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  success: true;
  user: {
    id: string;
    name?: string;
    username?: string;
    type: 'staff' | 'admin';
  };
  sessionToken: string;
}

export interface SessionResponse {
  authenticated: boolean;
  user: {
    id: string;
    name?: string;
    username?: string;
    type: 'staff' | 'admin';
  } | null;
}

// ============================================================================
// Customer API Types
// ============================================================================

export interface CreateCustomerRequest {
  name: string;
  phone: string;
  planType: PlanType;
}

export interface CreateCustomerResponse {
  success: true;
  customer: Customer;
  subscription: Subscription;
  paymentSlip: {
    subscriptionCode: string;
    amount: number;
    barcode: string;
  };
}

// ============================================================================
// Subscription API Types
// ============================================================================

export interface SearchSubscriptionRequest {
  query: string; // subscription code or phone number
}

export interface SearchSubscriptionResponse {
  success: true;
  subscriptions: SubscriptionWithCustomer[];
}

export interface ActivateSubscriptionRequest {
  subscriptionId: string;
  paymentConfirmed: boolean;
}

export interface ActivateSubscriptionResponse {
  success: true;
  subscription: Subscription;
  activationCode: string;
}

export interface RefundSubscriptionRequest {
  subscriptionId: string;
  reason: string;
  partialRefund?: boolean;
}

export interface RefundSubscriptionResponse {
  success: true;
  subscription: Subscription;
  refundAmount: number;
}

export interface ListSubscriptionsRequest {
  page?: number;
  limit?: number;
  status?: SubscriptionStatus;
  planType?: PlanType;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'createdAt' | 'activatedAt' | 'expiresAt';
  sortOrder?: 'asc' | 'desc';
}

export interface ListSubscriptionsResponse {
  success: true;
  subscriptions: SubscriptionWithCustomer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================================================
// Redemption API Types
// ============================================================================

export interface SearchRedemptionRequest {
  query: string; // activation code, phone, or customer name
}

export interface SearchRedemptionResponse {
  success: true;
  subscriptions: SubscriptionWithCustomer[];
}

export interface DispenseRedemptionRequest {
  subscriptionId: string;
  quantity: number;
  staffId: string;
}

export interface DispenseRedemptionResponse {
  success: true;
  redemption: Redemption;
  subscription: Subscription;
  remainingSalads: number;
}

export interface GetRedemptionHistoryResponse {
  success: true;
  redemptions: RedemptionWithDetails[];
}

// ============================================================================
// Admin API Types
// ============================================================================

export interface GetStatsResponse {
  success: true;
  stats: DashboardStats;
  revenueTrends: RevenueTrend[];
  subscriptionTrends: SubscriptionTrend[];
}

export interface ExportDataRequest {
  format: 'csv' | 'excel';
  status?: SubscriptionStatus;
  planType?: PlanType;
  dateFrom?: string;
  dateTo?: string;
}

export interface ExportDataResponse {
  success: true;
  data: string; // CSV or base64 encoded Excel
  filename: string;
}

export interface GetConfigResponse {
  success: true;
  planConfig: PlanConfig;
  businessConfig: BusinessConfig;
}

export interface UpdateConfigRequest {
  planConfig?: Partial<PlanConfig>;
  businessConfig?: Partial<BusinessConfig>;
}

export interface UpdateConfigResponse {
  success: true;
  planConfig: PlanConfig;
  businessConfig: BusinessConfig;
}

export interface ListStaffResponse {
  success: true;
  staff: Omit<Staff, 'pinHash'>[];
}

export interface CreateStaffRequest {
  name: string;
  pin: string;
}

export interface CreateStaffResponse {
  success: true;
  staff: Omit<Staff, 'pinHash'>;
}

export interface DeleteStaffRequest {
  staffId: string;
}

export interface DeleteStaffResponse {
  success: true;
  message: string;
}

// ============================================================================
// Error Response Types
// ============================================================================

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

export type ApiResponse<T> = T | ApiError;

// Type guards
export function isApiError(response: unknown): response is ApiError {
  return (
    typeof response === 'object' &&
    response !== null &&
    'success' in response &&
    response.success === false &&
    'error' in response
  );
}

export function isApiSuccess<T>(response: ApiResponse<T>): response is T {
  return !isApiError(response);
}
