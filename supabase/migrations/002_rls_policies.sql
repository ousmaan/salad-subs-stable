-- ============================================================================
-- Salad Stall Subscription System - Row Level Security Policies
-- Migration: 002_rls_policies.sql
-- Description: Implement RLS policies for staff and admin access control
-- ============================================================================

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY ON ALL TABLES
-- ============================================================================
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE config ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- HELPER FUNCTIONS FOR RLS
-- ============================================================================

-- Check if current user is an active staff member
CREATE OR REPLACE FUNCTION is_staff()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM staff
        WHERE id = auth.uid()
        AND is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if current user is an admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM admins
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- CUSTOMERS TABLE POLICIES
-- ============================================================================

-- Staff and admins can view all customers
CREATE POLICY "Staff and admins can view customers"
    ON customers FOR SELECT
    USING (is_staff() OR is_admin());

-- Staff and admins can insert customers
CREATE POLICY "Staff and admins can insert customers"
    ON customers FOR INSERT
    WITH CHECK (is_staff() OR is_admin());

-- Only admins can update customers
CREATE POLICY "Only admins can update customers"
    ON customers FOR UPDATE
    USING (is_admin());

-- Only admins can delete customers
CREATE POLICY "Only admins can delete customers"
    ON customers FOR DELETE
    USING (is_admin());

-- ============================================================================
-- SUBSCRIPTIONS TABLE POLICIES
-- ============================================================================

-- Staff and admins can view all subscriptions
CREATE POLICY "Staff and admins can view subscriptions"
    ON subscriptions FOR SELECT
    USING (is_staff() OR is_admin());

-- Staff and admins can insert subscriptions
CREATE POLICY "Staff and admins can insert subscriptions"
    ON subscriptions FOR INSERT
    WITH CHECK (is_staff() OR is_admin());

-- Staff can update subscriptions (for activation and redemption)
-- Admins can update any subscription
CREATE POLICY "Staff and admins can update subscriptions"
    ON subscriptions FOR UPDATE
    USING (is_staff() OR is_admin());

-- Only admins can delete subscriptions
CREATE POLICY "Only admins can delete subscriptions"
    ON subscriptions FOR DELETE
    USING (is_admin());

-- ============================================================================
-- REDEMPTIONS TABLE POLICIES
-- ============================================================================

-- Staff and admins can view all redemptions
CREATE POLICY "Staff and admins can view redemptions"
    ON redemptions FOR SELECT
    USING (is_staff() OR is_admin());

-- Staff and admins can insert redemptions
CREATE POLICY "Staff and admins can insert redemptions"
    ON redemptions FOR INSERT
    WITH CHECK (is_staff() OR is_admin());

-- Only admins can update redemptions
CREATE POLICY "Only admins can update redemptions"
    ON redemptions FOR UPDATE
    USING (is_admin());

-- Only admins can delete redemptions
CREATE POLICY "Only admins can delete redemptions"
    ON redemptions FOR DELETE
    USING (is_admin());

-- ============================================================================
-- STAFF TABLE POLICIES
-- ============================================================================

-- Staff can view their own record, admins can view all
CREATE POLICY "Staff can view own record, admins can view all"
    ON staff FOR SELECT
    USING (
        (is_staff() AND id = auth.uid()) OR 
        is_admin()
    );

-- Only admins can insert staff
CREATE POLICY "Only admins can insert staff"
    ON staff FOR INSERT
    WITH CHECK (is_admin());

-- Only admins can update staff
CREATE POLICY "Only admins can update staff"
    ON staff FOR UPDATE
    USING (is_admin());

-- Only admins can delete staff
CREATE POLICY "Only admins can delete staff"
    ON staff FOR DELETE
    USING (is_admin());

-- ============================================================================
-- ADMINS TABLE POLICIES
-- ============================================================================

-- Admins can view all admin records
CREATE POLICY "Admins can view all admins"
    ON admins FOR SELECT
    USING (is_admin());

-- Admins can insert new admins
CREATE POLICY "Admins can insert admins"
    ON admins FOR INSERT
    WITH CHECK (is_admin());

-- Admins can update admin records
CREATE POLICY "Admins can update admins"
    ON admins FOR UPDATE
    USING (is_admin());

-- Admins can delete admin records (except themselves)
CREATE POLICY "Admins can delete other admins"
    ON admins FOR DELETE
    USING (is_admin() AND id != auth.uid());

-- ============================================================================
-- CONFIG TABLE POLICIES
-- ============================================================================

-- Staff and admins can view config
CREATE POLICY "Staff and admins can view config"
    ON config FOR SELECT
    USING (is_staff() OR is_admin());

-- Only admins can insert config
CREATE POLICY "Only admins can insert config"
    ON config FOR INSERT
    WITH CHECK (is_admin());

-- Only admins can update config
CREATE POLICY "Only admins can update config"
    ON config FOR UPDATE
    USING (is_admin());

-- Only admins can delete config
CREATE POLICY "Only admins can delete config"
    ON config FOR DELETE
    USING (is_admin());

-- ============================================================================
-- AUDIT_LOGS TABLE POLICIES
-- ============================================================================

-- Staff and admins can view all audit logs
CREATE POLICY "Staff and admins can view audit logs"
    ON audit_logs FOR SELECT
    USING (is_staff() OR is_admin());

-- Staff and admins can insert audit logs
CREATE POLICY "Staff and admins can insert audit logs"
    ON audit_logs FOR INSERT
    WITH CHECK (is_staff() OR is_admin());

-- No one can update audit logs (immutable)
CREATE POLICY "No one can update audit logs"
    ON audit_logs FOR UPDATE
    USING (FALSE);

-- Only admins can delete audit logs
CREATE POLICY "Only admins can delete audit logs"
    ON audit_logs FOR DELETE
    USING (is_admin());
