-- Migration: Add OTP field for redemption verification
-- Date: 2026-02-26
-- Description: Add 4-digit OTP code for customer verification during salad redemption

-- Add OTP columns to subscriptions table
ALTER TABLE subscriptions
ADD COLUMN otp_code VARCHAR(4),
ADD COLUMN otp_generated_at TIMESTAMPTZ;

-- Add index for OTP lookup
CREATE INDEX idx_subscriptions_otp_code ON subscriptions(otp_code) WHERE otp_code IS NOT NULL;

-- Add comment
COMMENT ON COLUMN subscriptions.otp_code IS '4-digit OTP code for redemption verification, generated on activation';
COMMENT ON COLUMN subscriptions.otp_generated_at IS 'Timestamp when OTP was generated';
