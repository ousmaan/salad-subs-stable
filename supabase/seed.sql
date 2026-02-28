-- Seed Data for Salad Stall Subscription System
-- Run this AFTER running all migrations (001, 002, 003)

-- Clear existing data (in correct order due to foreign keys)
TRUNCATE TABLE redemptions, subscriptions, customers, staff, admins CASCADE;

-- Insert test admin
-- Password: Admin123
INSERT INTO admins (id, username, password_hash, created_at, updated_at)
VALUES (
    '10000000-0000-0000-0000-000000000001',
    'admin',
    '$2a$10$jdVDm2.NE2Ac59lujb2O6.Zu/MuZgOhicuoyeBavL.4WvqFXUbiNW',
    NOW(),
    NOW()
);

-- Insert test staff member
-- PIN: 1234
INSERT INTO staff (id, name, pin_hash, is_active, created_at, updated_at)
VALUES (
    '20000000-0000-0000-0000-000000000001',
    'موظف افتراضي',
    '$2a$10$GgmDDkwv1TapaagD0XcIOOMTpXZIOJmmbSCLOM0Q2vihhSmMuHVE2',
    TRUE,
    NOW(),
    NOW()
);

-- Insert test customers
INSERT INTO customers (id, name, phone, created_at, updated_at)
VALUES 
    ('30000000-0000-0000-0000-000000000001', 'أحمد محمد', '0501234567', NOW(), NOW()),
    ('30000000-0000-0000-0000-000000000002', 'فاطمة علي', '0509876543', NOW(), NOW()),
    ('30000000-0000-0000-0000-000000000003', 'John Smith', '0551234567', NOW(), NOW());

-- Insert test subscriptions
INSERT INTO subscriptions (
    id, customer_id, plan_type, subscription_code, activation_code, 
    total_salads, remaining_salads, price, status, 
    activated_at, expires_at, created_at, updated_at
)
VALUES 
    -- Active subscription
    (
        '40000000-0000-0000-0000-000000000001',
        '30000000-0000-0000-0000-000000000001',
        'monthly',
        'SUB001',
        'ACT001',
        30,
        25,
        300.00,
        'active',
        NOW(),
        NOW() + INTERVAL '30 days',
        NOW(),
        NOW()
    ),
    -- Pending subscription (not activated yet)
    (
        '40000000-0000-0000-0000-000000000002',
        '30000000-0000-0000-0000-000000000002',
        'weekly',
        'SUB002',
        'ACT002',
        7,
        7,
        80.00,
        'pending_payment',
        NULL,
        NULL,
        NOW(),
        NOW()
    ),
    -- Expired subscription
    (
        '40000000-0000-0000-0000-000000000003',
        '30000000-0000-0000-0000-000000000003',
        'monthly',
        'SUB003',
        'ACT003',
        30,
        0,
        300.00,
        'expired',
        NOW() - INTERVAL '35 days',
        NOW() - INTERVAL '5 days',
        NOW() - INTERVAL '35 days',
        NOW()
    );

-- Insert test redemptions
INSERT INTO redemptions (
    id, subscription_id, staff_id, quantity,
    redeemed_at, created_at
)
VALUES 
    (
        '50000000-0000-0000-0000-000000000001',
        '40000000-0000-0000-0000-000000000001',
        '20000000-0000-0000-0000-000000000001',
        1,
        NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '2 days'
    ),
    (
        '50000000-0000-0000-0000-000000000002',
        '40000000-0000-0000-0000-000000000001',
        '20000000-0000-0000-0000-000000000001',
        1,
        NOW() - INTERVAL '1 day',
        NOW() - INTERVAL '1 day'
    );

-- Verify data
SELECT 'Admins' AS table_name, COUNT(*) AS count FROM admins
UNION ALL
SELECT 'Staff', COUNT(*) FROM staff
UNION ALL
SELECT 'Customers', COUNT(*) FROM customers
UNION ALL
SELECT 'Subscriptions', COUNT(*) FROM subscriptions
UNION ALL
SELECT 'Redemptions', COUNT(*) FROM redemptions;
