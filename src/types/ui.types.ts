/**
 * UI Component Types
 * Props and state types for React components
 */

import { ReactNode } from 'react';
import { SubscriptionStatus, PlanType } from './entities';

// ============================================================================
// Common UI Types
// ============================================================================

export type Locale = 'ar' | 'en';

export type Direction = 'rtl' | 'ltr';

export interface LocaleConfig {
  locale: Locale;
  dir: Direction;
}

// ============================================================================
// Button Component Types
// ============================================================================

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  className?: string;
}

// ============================================================================
// Input Component Types
// ============================================================================

export interface InputProps {
  label: string;
  name: string;
  type?: 'text' | 'number' | 'tel' | 'password' | 'email';
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  autoFocus?: boolean;
  maxLength?: number;
  className?: string;
}

// ============================================================================
// Select Component Types
// ============================================================================

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  error?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
}

// ============================================================================
// Modal Component Types
// ============================================================================

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlayClick?: boolean;
}

// ============================================================================
// Alert Component Types
// ============================================================================

export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface AlertProps {
  type: AlertType;
  message: string;
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
}

// ============================================================================
// Badge Component Types
// ============================================================================

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface BadgeProps {
  children: ReactNode;
  variant: BadgeVariant;
  size?: 'sm' | 'md' | 'lg';
}

// ============================================================================
// Table Component Types
// ============================================================================

export interface TableColumn<T> {
  key: string;
  header: string;
  render: (item: T) => ReactNode;
  sortable?: boolean;
  width?: string;
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string) => void;
}

// ============================================================================
// Form State Types
// ============================================================================

export interface FormState<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
}

export interface FormHandlers<T> {
  handleChange: (field: keyof T, value: unknown) => void;
  handleBlur: (field: keyof T) => void;
  handleSubmit: (e: React.FormEvent) => void;
  resetForm: () => void;
  setFieldError: (field: keyof T, error: string) => void;
}

// ============================================================================
// Status Badge Mapping
// ============================================================================

export const statusBadgeVariant: Record<SubscriptionStatus, BadgeVariant> = {
  [SubscriptionStatus.PENDING_PAYMENT]: 'warning',
  [SubscriptionStatus.ACTIVE]: 'success',
  [SubscriptionStatus.EXPIRED]: 'danger',
  [SubscriptionStatus.REFUNDED]: 'info',
};

// ============================================================================
// Plan Type Display
// ============================================================================

export interface PlanTypeDisplay {
  labelAr: string;
  labelEn: string;
  color: string;
}

export const planTypeDisplay: Record<PlanType, PlanTypeDisplay> = {
  [PlanType.WEEKLY]: {
    labelAr: 'أسبوعي',
    labelEn: 'Weekly',
    color: 'blue',
  },
  [PlanType.MONTHLY]: {
    labelAr: 'شهري',
    labelEn: 'Monthly',
    color: 'purple',
  },
};

// ============================================================================
// Loading States
// ============================================================================

export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

export interface ErrorState {
  hasError: boolean;
  message?: string;
  code?: string;
}

// ============================================================================
// Pagination Types
// ============================================================================

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}
