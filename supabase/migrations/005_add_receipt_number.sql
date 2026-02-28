-- Add receipt_number column to subscriptions table
-- This stores the last 5 digits of the payment receipt (optional, admin-only field)

ALTER TABLE subscriptions
ADD COLUMN receipt_number VARCHAR(5) NULL;

-- Add comment to document the field
COMMENT ON COLUMN subscriptions.receipt_number IS 'Last 5 digits of payment receipt number (optional, admin-only)';

-- Expand subscription_code column from 6 to 7 characters to support XXX-XXX format
ALTER TABLE subscriptions
ALTER COLUMN subscription_code TYPE VARCHAR(7);
