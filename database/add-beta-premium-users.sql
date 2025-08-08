-- Manual Premium Beta User Setup
-- Use this to add premium subscriptions for beta testing
-- Run this in Supabase SQL Editor

-- STEP 1: First, get the user IDs for you and your wife
-- Run this query to find user IDs by email:
SELECT 
  id,
  email,
  created_at
FROM auth.users 
WHERE email IN (
  'your-email@domain.com',    -- Replace with your actual email
  'wife-email@domain.com'     -- Replace with your wife's actual email
);

-- STEP 2: Add premium subscriptions (replace the UUIDs with actual user IDs from step 1)
-- Example for you (replace USER_ID_1 with actual UUID):
INSERT INTO premium_subscriptions (
  user_id,
  subscription_status,
  plan_type,
  current_period_start,
  current_period_end,
  trial_ends_at
) VALUES (
  'USER_ID_1',  -- Replace with your actual user ID
  'active',     -- Active premium subscription
  'premium_yearly',
  NOW(),
  NOW() + INTERVAL '1 year',  -- 1 year access
  NULL
) ON CONFLICT (user_id) DO UPDATE SET
  subscription_status = 'active',
  plan_type = 'premium_yearly',
  current_period_start = NOW(),
  current_period_end = NOW() + INTERVAL '1 year',
  updated_at = NOW();

-- Example for your wife (replace USER_ID_2 with actual UUID):
INSERT INTO premium_subscriptions (
  user_id,
  subscription_status,
  plan_type,
  current_period_start,
  current_period_end,
  trial_ends_at
) VALUES (
  'USER_ID_2',  -- Replace with your wife's actual user ID
  'active',     -- Active premium subscription
  'premium_yearly',
  NOW(),
  NOW() + INTERVAL '1 year',  -- 1 year access
  NULL
) ON CONFLICT (user_id) DO UPDATE SET
  subscription_status = 'active',
  plan_type = 'premium_yearly',
  current_period_start = NOW(),
  current_period_end = NOW() + INTERVAL '1 year',
  updated_at = NOW();

-- STEP 3: Verify the subscriptions were added
SELECT 
  ps.user_id,
  u.email,
  ps.subscription_status,
  ps.plan_type,
  ps.current_period_end,
  ps.created_at
FROM premium_subscriptions ps
JOIN auth.users u ON ps.user_id = u.id
ORDER BY ps.created_at DESC;

-- SUCCESS MESSAGE
SELECT 'SUCCESS: Premium subscriptions added for beta users!' as status;