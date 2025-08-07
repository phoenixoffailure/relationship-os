-- Quick fix for RLS blocking insight generation
-- Run this in Supabase SQL Editor

-- 1. Temporarily disable the trigger that's causing the issue
DROP TRIGGER IF EXISTS update_health_on_insight ON relationship_insights;

-- 2. Fix the RLS policy on relationship_health_scores table
DROP POLICY IF EXISTS "Service role can manage health scores" ON relationship_health_scores;

CREATE POLICY "Service role can manage health scores" ON relationship_health_scores
FOR ALL 
TO service_role
USING (true);

-- 3. Also ensure service role can insert/update health scores
GRANT ALL ON relationship_health_scores TO service_role;

-- 4. Re-create the trigger with proper permissions (function runs as definer)
CREATE OR REPLACE FUNCTION update_relationship_health_score()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER  -- This makes it run with creator's permissions
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
    AND read_status = 'unread'
    AND dashboard_dismissed = FALSE;
  
  -- Count unread suggestions
  SELECT COUNT(*) INTO v_unread_suggestions
  FROM partner_suggestions
  WHERE 
    relationship_id = NEW.relationship_id
    AND read_status = 'unread'
    AND dashboard_dismissed = FALSE;
  
  -- Update or insert health score record
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
    75, -- Default score
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

-- 5. Re-create the trigger
CREATE TRIGGER update_health_on_insight
AFTER INSERT ON relationship_insights
FOR EACH ROW
EXECUTE FUNCTION update_relationship_health_score();

SELECT 'SUCCESS: RLS fixed and trigger updated with proper permissions' as status;