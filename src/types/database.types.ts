/**
 * Supabase Database Types
 * Auto-generated types matching the database schema
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string;
          name: string;
          phone: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          phone: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          phone?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          customer_id: string;
          subscription_code: string;
          activation_code: string | null;
          receipt_number: string | null;
          plan_type: 'biweekly' | 'monthly';
          price: number;
          total_salads: number;
          remaining_salads: number;
          status: 'pending_payment' | 'active' | 'expired' | 'refunded';
          payment_confirmed_at: string | null;
          activated_at: string | null;
          expires_at: string | null;
          refunded_at: string | null;
          refund_amount: number | null;
          refund_reason: string | null;
          otp_code: string | null;
          otp_generated_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          customer_id: string;
          subscription_code: string;
          activation_code?: string | null;
          receipt_number?: string | null;
          plan_type: 'biweekly' | 'monthly';
          price: number;
          total_salads: number;
          remaining_salads: number;
          status?: 'pending_payment' | 'active' | 'expired' | 'refunded';
          payment_confirmed_at?: string | null;
          activated_at?: string | null;
          expires_at?: string | null;
          refunded_at?: string | null;
          refund_amount?: number | null;
          refund_reason?: string | null;
          otp_code?: string | null;
          otp_generated_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          customer_id?: string;
          subscription_code?: string;
          activation_code?: string | null;
          receipt_number?: string | null;
          plan_type?: 'biweekly' | 'monthly';
          price?: number;
          total_salads?: number;
          remaining_salads?: number;
          status?: 'pending_payment' | 'active' | 'expired' | 'refunded';
          payment_confirmed_at?: string | null;
          activated_at?: string | null;
          expires_at?: string | null;
          refunded_at?: string | null;
          refund_amount?: number | null;
          refund_reason?: string | null;
          otp_code?: string | null;
          otp_generated_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      redemptions: {
        Row: {
          id: string;
          subscription_id: string;
          staff_id: string;
          quantity: number;
          redeemed_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          subscription_id: string;
          staff_id: string;
          quantity: number;
          redeemed_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          subscription_id?: string;
          staff_id?: string;
          quantity?: number;
          redeemed_at?: string;
          created_at?: string;
        };
      };
      staff: {
        Row: {
          id: string;
          name: string;
          pin_hash: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          pin_hash: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          pin_hash?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      admins: {
        Row: {
          id: string;
          username: string;
          password_hash: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          username: string;
          password_hash: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          password_hash?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      config: {
        Row: {
          key: string;
          value: Json;
          description: string | null;
          updated_at: string;
        };
        Insert: {
          key: string;
          value: Json;
          description?: string | null;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: Json;
          description?: string | null;
          updated_at?: string;
        };
      };
      audit_logs: {
        Row: {
          id: string;
          user_type: 'staff' | 'admin';
          user_id: string;
          action: string;
          entity_type: string;
          entity_id: string | null;
          details: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_type: 'staff' | 'admin';
          user_id: string;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          details?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_type?: 'staff' | 'admin';
          user_id?: string;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          details?: Json | null;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
