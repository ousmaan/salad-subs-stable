-- Change 'weekly' plan type to 'biweekly' to match business logic (15-day plans)

-- First, update existing 'weekly' records to 'biweekly' BEFORE changing the constraint
UPDATE subscriptions
SET plan_type = 'biweekly'
WHERE plan_type = 'weekly';

-- Now update the check constraint to use 'biweekly' instead of 'weekly'
ALTER TABLE subscriptions
DROP CONSTRAINT IF EXISTS subscriptions_plan_type_check;

ALTER TABLE subscriptions
ADD CONSTRAINT subscriptions_plan_type_check 
CHECK (plan_type IN ('biweekly', 'monthly'));

-- Update the trigger function to use 'biweekly'
CREATE OR REPLACE FUNCTION calculate_subscription_expiry()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.activated_at IS NOT NULL AND NEW.expires_at IS NULL THEN
        -- Get validity days from config
        DECLARE
            config_value JSONB;
            validity_days INTEGER;
        BEGIN
            SELECT value INTO config_value
            FROM config
            WHERE key = 'plan_config';
            
            IF config_value IS NOT NULL THEN
                validity_days := CASE
                    WHEN NEW.plan_type = 'biweekly' THEN (config_value->'biweekly'->>'validityDays')::INTEGER
                    WHEN NEW.plan_type = 'monthly' THEN (config_value->'monthly'->>'validityDays')::INTEGER
                    ELSE 30
                END;
            ELSE
                -- Default validity days if config not found
                validity_days := CASE
                    WHEN NEW.plan_type = 'biweekly' THEN 15
                    WHEN NEW.plan_type = 'monthly' THEN 30
                    ELSE 30
                END;
            END IF;
            
            NEW.expires_at := NEW.activated_at + (validity_days || ' days')::INTERVAL;
        END;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
