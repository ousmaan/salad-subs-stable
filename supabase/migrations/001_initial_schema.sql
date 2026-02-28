-- ============================================================================
-- Salad Stall Subscription System - Initial Database Schema
-- Migration: 001_initial_schema.sql
-- Description: Create all tables with constraints, indexes, and foreign keys
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CUSTOMERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes for customers
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_created_at ON customers(created_at DESC);

-- ============================================================================
-- SUBSCRIPTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    subscription_code VARCHAR(6) NOT NULL UNIQUE,
    activation_code VARCHAR(6) UNIQUE,
    plan_type VARCHAR(20) NOT NULL CHECK (plan_type IN ('weekly', 'monthly')),
    price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
    total_salads INTEGER NOT NULL CHECK (total_salads > 0),
    remaining_salads INTEGER NOT NULL CHECK (remaining_salads >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'pending_payment' 
        CHECK (status IN ('pending_payment', 'active', 'expired', 'refunded')),
    payment_confirmed_at TIMESTAMP WITH TIME ZONE,
    activated_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    refunded_at TIMESTAMP WITH TIME ZONE,
    refund_amount DECIMAL(10, 2) CHECK (refund_amount >= 0),
    refund_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    
    -- Ensure remaining_salads doesn't exceed total_salads
    CONSTRAINT check_remaining_salads CHECK (remaining_salads <= total_salads),
    
    -- Ensure activation_code exists when status is active
    CONSTRAINT check_activation_code CHECK (
        (status = 'active' AND activation_code IS NOT NULL) OR 
        (status != 'active')
    ),
    
    -- Ensure refund fields are set when status is refunded
    CONSTRAINT check_refund_data CHECK (
        (status = 'refunded' AND refunded_at IS NOT NULL AND refund_amount IS NOT NULL) OR 
        (status != 'refunded')
    )
);

-- Indexes for subscriptions
CREATE INDEX idx_subscriptions_customer_id ON subscriptions(customer_id);
CREATE INDEX idx_subscriptions_subscription_code ON subscriptions(subscription_code);
CREATE INDEX idx_subscriptions_activation_code ON subscriptions(activation_code) WHERE activation_code IS NOT NULL;
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_plan_type ON subscriptions(plan_type);
CREATE INDEX idx_subscriptions_expires_at ON subscriptions(expires_at) WHERE expires_at IS NOT NULL;
CREATE INDEX idx_subscriptions_created_at ON subscriptions(created_at DESC);

-- ============================================================================
-- STAFF TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    pin_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes for staff
CREATE INDEX idx_staff_is_active ON staff(is_active);

-- ============================================================================
-- REDEMPTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS redemptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    redeemed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes for redemptions
CREATE INDEX idx_redemptions_subscription_id ON redemptions(subscription_id);
CREATE INDEX idx_redemptions_staff_id ON redemptions(staff_id);
CREATE INDEX idx_redemptions_redeemed_at ON redemptions(redeemed_at DESC);

-- ============================================================================
-- ADMINS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS admins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes for admins
CREATE INDEX idx_admins_username ON admins(username);

-- ============================================================================
-- CONFIG TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS config (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- ============================================================================
-- AUDIT_LOGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('staff', 'admin')),
    user_id UUID NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Indexes for audit_logs
CREATE INDEX idx_audit_logs_user_type_user_id ON audit_logs(user_type, user_id);
CREATE INDEX idx_audit_logs_entity_type_entity_id ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);

-- ============================================================================
-- UPDATED_AT TRIGGER FUNCTION
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to relevant tables
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_updated_at BEFORE UPDATE ON staff
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admins_updated_at BEFORE UPDATE ON admins
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_config_updated_at BEFORE UPDATE ON config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================
COMMENT ON TABLE customers IS 'Stores customer information';
COMMENT ON TABLE subscriptions IS 'Stores subscription plans and their status';
COMMENT ON TABLE redemptions IS 'Tracks salad redemptions from subscriptions';
COMMENT ON TABLE staff IS 'Staff members who can process transactions';
COMMENT ON TABLE admins IS 'Admin users with full system access';
COMMENT ON TABLE config IS 'System configuration key-value store';
COMMENT ON TABLE audit_logs IS 'Audit trail for all critical operations';
