-- ============================================================================
-- Salad Stall Subscription System - Functions and Triggers
-- Migration: 003_functions_triggers.sql
-- Description: Database functions for code generation and audit triggers
-- ============================================================================

-- ============================================================================
-- CODE GENERATION FUNCTIONS
-- ============================================================================

-- Generate unique 6-digit subscription code
CREATE OR REPLACE FUNCTION generate_subscription_code()
RETURNS VARCHAR(6) AS $$
DECLARE
    new_code VARCHAR(6);
    code_exists BOOLEAN;
BEGIN
    LOOP
        -- Generate random 6-digit number
        new_code := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
        
        -- Check if code already exists
        SELECT EXISTS(
            SELECT 1 FROM subscriptions WHERE subscription_code = new_code
        ) INTO code_exists;
        
        -- Exit loop if code is unique
        EXIT WHEN NOT code_exists;
    END LOOP;
    
    RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Generate unique 6-digit activation code
CREATE OR REPLACE FUNCTION generate_activation_code()
RETURNS VARCHAR(6) AS $$
DECLARE
    new_code VARCHAR(6);
    code_exists BOOLEAN;
BEGIN
    LOOP
        -- Generate random 6-digit number
        new_code := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
        
        -- Check if code already exists
        SELECT EXISTS(
            SELECT 1 FROM subscriptions WHERE activation_code = new_code
        ) INTO code_exists;
        
        -- Exit loop if code is unique
        EXIT WHEN NOT code_exists;
    END LOOP;
    
    RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- AUTOMATIC SUBSCRIPTION CODE TRIGGER
-- ============================================================================

CREATE OR REPLACE FUNCTION set_subscription_code()
RETURNS TRIGGER AS $$
BEGIN
    -- Only set code if not provided
    IF NEW.subscription_code IS NULL OR NEW.subscription_code = '' THEN
        NEW.subscription_code := generate_subscription_code();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_subscription_code
    BEFORE INSERT ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION set_subscription_code();

-- ============================================================================
-- AUTOMATIC EXPIRY DATE CALCULATION
-- ============================================================================

CREATE OR REPLACE FUNCTION calculate_expiry_date()
RETURNS TRIGGER AS $$
DECLARE
    duration_days INTEGER;
BEGIN
    -- Only calculate when subscription is activated
    IF NEW.status = 'active' AND OLD.status != 'active' THEN
        -- Get duration from config based on plan type
        SELECT 
            CASE 
                WHEN NEW.plan_type = 'weekly' THEN 
                    (value->>'durationDays')::INTEGER
                WHEN NEW.plan_type = 'monthly' THEN 
                    (value->>'durationDays')::INTEGER
                ELSE 7 -- Default to 7 days if not found
            END INTO duration_days
        FROM config
        WHERE key = 'plan_config';
        
        -- If config not found, use defaults
        IF duration_days IS NULL THEN
            duration_days := CASE 
                WHEN NEW.plan_type = 'weekly' THEN 7
                WHEN NEW.plan_type = 'monthly' THEN 30
                ELSE 7
            END;
        END IF;
        
        -- Set expiry date
        NEW.expires_at := NEW.activated_at + (duration_days || ' days')::INTERVAL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_expiry_date
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION calculate_expiry_date();

-- ============================================================================
-- AUDIT LOG TRIGGER FOR CRITICAL OPERATIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION log_subscription_changes()
RETURNS TRIGGER AS $$
DECLARE
    current_user_id UUID;
    current_user_type VARCHAR(20);
BEGIN
    -- Get current user context (this would be set by the application)
    current_user_id := auth.uid();
    
    -- Determine user type
    IF EXISTS(SELECT 1 FROM admins WHERE id = current_user_id) THEN
        current_user_type := 'admin';
    ELSIF EXISTS(SELECT 1 FROM staff WHERE id = current_user_id) THEN
        current_user_type := 'staff';
    ELSE
        current_user_type := 'system';
    END IF;
    
    -- Log activation
    IF TG_OP = 'UPDATE' AND NEW.status = 'active' AND OLD.status != 'active' THEN
        INSERT INTO audit_logs (user_type, user_id, action, entity_type, entity_id, details)
        VALUES (
            current_user_type,
            current_user_id,
            'subscription_activated',
            'subscription',
            NEW.id,
            jsonb_build_object(
                'subscription_code', NEW.subscription_code,
                'activation_code', NEW.activation_code,
                'plan_type', NEW.plan_type,
                'price', NEW.price
            )
        );
    END IF;
    
    -- Log refund
    IF TG_OP = 'UPDATE' AND NEW.status = 'refunded' AND OLD.status != 'refunded' THEN
        INSERT INTO audit_logs (user_type, user_id, action, entity_type, entity_id, details)
        VALUES (
            current_user_type,
            current_user_id,
            'subscription_refunded',
            'subscription',
            NEW.id,
            jsonb_build_object(
                'subscription_code', NEW.subscription_code,
                'refund_amount', NEW.refund_amount,
                'refund_reason', NEW.refund_reason,
                'original_price', OLD.price
            )
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_subscription_changes
    AFTER UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION log_subscription_changes();

-- ============================================================================
-- AUDIT LOG TRIGGER FOR REDEMPTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION log_redemption()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_logs (user_type, user_id, action, entity_type, entity_id, details)
    VALUES (
        'staff',
        NEW.staff_id,
        'salad_dispensed',
        'redemption',
        NEW.id,
        jsonb_build_object(
            'subscription_id', NEW.subscription_id,
            'quantity', NEW.quantity,
            'redeemed_at', NEW.redeemed_at
        )
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_redemption
    AFTER INSERT ON redemptions
    FOR EACH ROW
    EXECUTE FUNCTION log_redemption();

-- ============================================================================
-- AUTOMATIC EXPIRY STATUS UPDATE FUNCTION
-- ============================================================================

-- Function to check and update expired subscriptions
CREATE OR REPLACE FUNCTION update_expired_subscriptions()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE subscriptions
    SET status = 'expired'
    WHERE status = 'active'
    AND expires_at < NOW()
    AND remaining_salads > 0;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- This function can be called periodically via a cron job or manually

-- ============================================================================
-- STATISTICS FUNCTIONS
-- ============================================================================

-- Get dashboard statistics
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS TABLE (
    active_subscriptions BIGINT,
    pending_activations BIGINT,
    today_redemptions BIGINT,
    total_revenue NUMERIC,
    weekly_revenue NUMERIC,
    monthly_revenue NUMERIC
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*) FROM subscriptions WHERE status = 'active'),
        (SELECT COUNT(*) FROM subscriptions WHERE status = 'pending_payment'),
        (SELECT COALESCE(SUM(quantity), 0) FROM redemptions WHERE DATE(redeemed_at) = CURRENT_DATE),
        (SELECT COALESCE(SUM(price), 0) FROM subscriptions WHERE status IN ('active', 'expired')),
        (SELECT COALESCE(SUM(price), 0) FROM subscriptions WHERE status IN ('active', 'expired') AND activated_at >= NOW() - INTERVAL '7 days'),
        (SELECT COALESCE(SUM(price), 0) FROM subscriptions WHERE status IN ('active', 'expired') AND activated_at >= NOW() - INTERVAL '30 days');
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================
COMMENT ON FUNCTION generate_subscription_code() IS 'Generates a unique 6-digit subscription code';
COMMENT ON FUNCTION generate_activation_code() IS 'Generates a unique 6-digit activation code';
COMMENT ON FUNCTION update_expired_subscriptions() IS 'Updates active subscriptions that have passed their expiry date to expired status';
COMMENT ON FUNCTION get_dashboard_stats() IS 'Returns current dashboard statistics';
