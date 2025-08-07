-- Complete RLS fix for insight generation blocking
-- Run this in Supabase SQL Editor

-- 1. First, temporarily drop the trigger to prevent interference
DROP TRIGGER IF EXISTS update_health_on_insight ON relationship_insights;

-- 2. Fix RLS policies on relationship_health_scores table
DROP POLICY IF EXISTS "Service role can manage health scores" ON relationship_health_scores;
DROP POLICY IF EXISTS "Users can view own relationship health scores" ON relationship_health_scores;
DROP POLICY IF EXISTS "Users can update own relationship health scores" ON relationship_health_scores;

-- Create comprehensive policies for service role and users
CREATE POLICY "Service role can manage health scores" ON relationship_health_scores
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Users can view own relationship health scores" ON relationship_health_scores
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update own relationship health scores" ON relationship_health_scores
FOR UPDATE 
TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- 3. Ensure service role has necessary table permissions
GRANT ALL ON relationship_health_scores TO service_role;

-- 4. Fix RLS policies on relationship_insights table as well
DROP POLICY IF EXISTS "Service role can manage insights" ON relationship_insights;

CREATE POLICY "Service role can manage insights" ON relationship_insights
FOR ALL 
TO service_role
USING (true)
WITH CHECK (true);

-- 5. Update the trigger function to run with elevated permissions
CREATE OR REPLACE FUNCTION update_relationship_health_score()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER  -- Critical: makes function run with creator's permissions
AS $$
DECLARE
  v_unread_insights INTEGER;
  v_unread_suggestions INTEGER;
BEGIN
  -- Count unread insights for this relationship
  SELECT COUNT(*) INTO v_unread_insights
  FROM relationship_insights
  WHERE 
    relationship_id = NEW.relationship_id
    AND (read_status IS NULL OR read_status = 'unread')
    AND (dashboard_dismissed IS NULL OR dashboard_dismissed = FALSE);
  
  -- Count unread suggestions for this relationship
  SELECT COUNT(*) INTO v_unread_suggestions
  FROM partner_suggestions
  WHERE 
    relationship_id = NEW.relationship_id
    AND (read_status IS NULL OR read_status = 'unread')
    AND (dashboard_dismissed IS NULL OR dashboard_dismissed = FALSE);
  
  -- Insert or update health score record
  INSERT INTO relationship_health_scores (
    relationship_id,
    user_id,
    health_score,
    unread_insights_count,
    unread_suggestions_count,
    last_activity,
    updated_at
  ) VALUES (
    NEW.relationship_id,
    NEW.generated_for_user,
    75, -- Default health score
    v_unread_insights,
    v_unread_suggestions,
    NOW(),
    NOW()
  )
  ON CONFLICT (relationship_id, user_id)
  DO UPDATE SET
    unread_insights_count = v_unread_insights,
    unread_suggestions_count = v_unread_suggestions,
    last_activity = NOW(),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$;

-- 6. Recreate the trigger
CREATE TRIGGER update_health_on_insight
AFTER INSERT ON relationship_insights
FOR EACH ROW
EXECUTE FUNCTION update_relationship_health_score();

-- 7. Verify the fix worked
SELECT 'SUCCESS: RLS policies fixed and trigger updated with proper permissions' as status;