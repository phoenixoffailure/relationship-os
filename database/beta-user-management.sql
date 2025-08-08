-- Beta User Premium Management Scripts
-- Collection of useful queries for managing beta premium users

-- ===== QUICK BETA USER SETUP =====

-- 1. FIND USER IDs BY EMAIL (run this first)
SELECT 
  id as user_id,
  email,
  created_at,
  email_confirmed_at
FROM auth.users 
WHERE email ILIKE '%your-domain%'  -- Replace with your actual domain/email pattern
ORDER BY created_at DESC;

-- 2. GRANT PREMIUM ACCESS TO SPECIFIC USER (replace with actual user ID)
INSERT INTO premium_subscriptions (
  user_id,
  subscription_status,
  plan_type,
  current_period_start,
  current_period_end
) VALUES (
  'REPLACE-WITH-USER-ID',  -- Get this from query above
  'active',
  'premium_yearly',
  NOW(),
  NOW() + INTERVAL '1 year'
) ON CONFLICT (user_id) DO UPDATE SET
  subscription_status = 'active',
  plan_type = 'premium_yearly',
  current_period_start = NOW(),
  current_period_end = NOW() + INTERVAL '1 year',
  updated_at = NOW();

-- ===== BETA USER MANAGEMENT =====

-- 3. VIEW ALL PREMIUM USERS
SELECT 
  ps.user_id,
  u.email,
  ps.subscription_status,
  ps.plan_type,
  ps.current_period_start,
  ps.current_period_end,
  ps.trial_ends_at,
  CASE 
    WHEN ps.current_period_end > NOW() THEN 'Active'
    ELSE 'Expired'
  END as access_status
FROM premium_subscriptions ps
JOIN auth.users u ON ps.user_id = u.id
ORDER BY ps.created_at DESC;

-- 4. GRANT TRIAL ACCESS (7 days)
INSERT INTO premium_subscriptions (
  user_id,
  subscription_status,
  plan_type,
  trial_ends_at
) VALUES (
  'REPLACE-WITH-USER-ID',
  'trial',
  'premium_trial',
  NOW() + INTERVAL '7 days'
) ON CONFLICT (user_id) DO UPDATE SET
  subscription_status = 'trial',
  plan_type = 'premium_trial',
  trial_ends_at = NOW() + INTERVAL '7 days',
  updated_at = NOW();

-- 5. EXTEND PREMIUM ACCESS (add 30 days to current end date)
UPDATE premium_subscriptions 
SET 
  current_period_end = COALESCE(current_period_end, NOW()) + INTERVAL '30 days',
  updated_at = NOW()
WHERE user_id = 'REPLACE-WITH-USER-ID';

-- 6. REVOKE PREMIUM ACCESS
UPDATE premium_subscriptions 
SET 
  subscription_status = 'expired',
  current_period_end = NOW(),
  updated_at = NOW()
WHERE user_id = 'REPLACE-WITH-USER-ID';

-- 7. DELETE PREMIUM SUBSCRIPTION ENTIRELY
DELETE FROM premium_subscriptions 
WHERE user_id = 'REPLACE-WITH-USER-ID';

-- ===== BULK OPERATIONS =====

-- 8. GRANT PREMIUM TO MULTIPLE USERS BY EMAIL PATTERN
INSERT INTO premium_subscriptions (user_id, subscription_status, plan_type, current_period_start, current_period_end)
SELECT 
  u.id,
  'active',
  'premium_yearly',
  NOW(),
  NOW() + INTERVAL '1 year'
FROM auth.users u 
WHERE u.email ILIKE '%@yourdomain.com'  -- Replace with your domain
ON CONFLICT (user_id) DO UPDATE SET
  subscription_status = 'active',
  plan_type = 'premium_yearly',
  current_period_start = NOW(),
  current_period_end = NOW() + INTERVAL '1 year',
  updated_at = NOW();

-- 9. VIEW PREMIUM ANALYTICS USAGE
SELECT 
  pa.analysis_type,
  COUNT(*) as analysis_count,
  COUNT(DISTINCT pa.user_id) as unique_users,
  AVG(pa.confidence_score) as avg_confidence,
  MIN(pa.generated_at) as first_analysis,
  MAX(pa.generated_at) as latest_analysis
FROM premium_analyses pa
WHERE pa.generated_at >= NOW() - INTERVAL '30 days'
GROUP BY pa.analysis_type
ORDER BY analysis_count DESC;

-- 10. CLEANUP EXPIRED ANALYSES (manual cleanup)
DELETE FROM premium_analyses WHERE expires_at < NOW();
DELETE FROM firo_compatibility_results WHERE expires_at < NOW();
DELETE FROM communication_analysis_results WHERE expires_at < NOW();
DELETE FROM relationship_trend_analysis WHERE expires_at < NOW();

-- ===== TROUBLESHOOTING =====

-- 11. CHECK USER'S PREMIUM STATUS AND RELATIONSHIPS
SELECT 
  u.email,
  ps.subscription_status,
  ps.plan_type,
  ps.current_period_end,
  COUNT(rm.relationship_id) as relationship_count
FROM auth.users u
LEFT JOIN premium_subscriptions ps ON u.id = ps.user_id
LEFT JOIN relationship_members rm ON u.id = rm.user_id
WHERE u.id = 'REPLACE-WITH-USER-ID'
GROUP BY u.email, ps.subscription_status, ps.plan_type, ps.current_period_end;

-- 12. VIEW USER'S FIRO PROFILE (needed for compatibility analysis)
SELECT 
  u.email,
  up.inclusion_need,
  up.control_need,
  up.affection_need,
  up.attachment_style,
  up.communication_directness,
  up.communication_assertiveness
FROM auth.users u
JOIN universal_user_profiles up ON u.id = up.user_id
WHERE u.id = 'REPLACE-WITH-USER-ID';

-- ===== USEFUL FOR DEVELOPMENT =====

-- 13. RESET ALL PREMIUM DATA (BE CAREFUL!)
-- Uncomment only if you need to reset everything
-- DELETE FROM premium_analyses;
-- DELETE FROM firo_compatibility_results;
-- DELETE FROM communication_analysis_results;  
-- DELETE FROM relationship_trend_analysis;
-- DELETE FROM premium_subscriptions;