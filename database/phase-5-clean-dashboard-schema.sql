-- RelationshipOS Phase 5: Clean Dashboard Schema Updates
-- Run this in Supabase SQL Editor to add read/unread states and pillar tracking

-- Step 1: Add read/unread state and pillar type to relationship_insights
ALTER TABLE relationship_insights 
ADD COLUMN IF NOT EXISTS read_status TEXT DEFAULT 'unread' 
  CHECK (read_status IN ('unread', 'read', 'acknowledged')),
ADD COLUMN IF NOT EXISTS read_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS dashboard_dismissed BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS pillar_type TEXT 
  CHECK (pillar_type IN ('pattern', 'growth', 'appreciation', 'milestone')),
ADD COLUMN IF NOT EXISTS relevance_score INTEGER DEFAULT 0 CHECK (relevance_score >= 0 AND relevance_score <= 100),
ADD COLUMN IF NOT EXISTS psychological_factors JSONB; -- Tracks which FIRO/attachment factors influenced this

-- Step 2: Add read/unread state to partner_suggestions  
ALTER TABLE partner_suggestions
ADD COLUMN IF NOT EXISTS read_status TEXT DEFAULT 'unread'
  CHECK (read_status IN ('unread', 'read', 'acknowledged')),
ADD COLUMN IF NOT EXISTS read_at TIMESTAMP NULL,
ADD COLUMN IF NOT EXISTS dashboard_dismissed BOOLEAN DEFAULT FALSE;

-- Step 3: Create indexes for fast unread queries
CREATE INDEX IF NOT EXISTS idx_insights_unread 
ON relationship_insights (generated_for_user, read_status, created_at DESC)
WHERE read_status = 'unread' AND dashboard_dismissed = FALSE;

CREATE INDEX IF NOT EXISTS idx_suggestions_unread
ON partner_suggestions (recipient_user_id, read_status, created_at DESC)
WHERE read_status = 'unread' AND dashboard_dismissed = FALSE;

-- Step 4: Create index for pillar type queries
CREATE INDEX IF NOT EXISTS idx_insights_pillar_type
ON relationship_insights (pillar_type, relevance_score DESC)
WHERE relevance_score > 70;

-- Step 5: Add relationship health tracking for dashboard cards
CREATE TABLE IF NOT EXISTS relationship_health_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_id UUID REFERENCES relationships(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  health_score INTEGER NOT NULL CHECK (health_score >= 0 AND health_score <= 100),
  trend TEXT CHECK (trend IN ('improving', 'stable', 'declining')),
  last_activity TIMESTAMP DEFAULT NOW(),
  unread_insights_count INTEGER DEFAULT 0,
  unread_suggestions_count INTEGER DEFAULT 0,
  calculated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(relationship_id, user_id)
);

-- Step 6: Create function to mark insights as read
CREATE OR REPLACE FUNCTION mark_insight_as_read(insight_id UUID, user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE relationship_insights
  SET 
    read_status = 'read',
    read_at = NOW()
  WHERE 
    id = insight_id 
    AND generated_for_user = user_id
    AND read_status = 'unread';
  
  RETURN FOUND;
END;
$$;

-- Step 7: Create function to dismiss insight from dashboard
CREATE OR REPLACE FUNCTION dismiss_insight_from_dashboard(insight_id UUID, user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE relationship_insights
  SET 
    dashboard_dismissed = TRUE
  WHERE 
    id = insight_id 
    AND generated_for_user = user_id;
  
  RETURN FOUND;
END;
$$;

-- Step 8: Create function to get unread dashboard insights
CREATE OR REPLACE FUNCTION get_unread_dashboard_insights(
  p_user_id UUID,
  p_hours_ago INTEGER DEFAULT 48,
  p_max_per_relationship INTEGER DEFAULT 2
)
RETURNS TABLE (
  id UUID,
  relationship_id UUID,
  title TEXT,
  description TEXT,
  insight_type TEXT,
  pillar_type TEXT,
  priority TEXT,
  relevance_score INTEGER,
  created_at TIMESTAMP
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  WITH ranked_insights AS (
    SELECT 
      ri.id,
      ri.relationship_id,
      ri.title,
      ri.description,
      ri.insight_type,
      ri.pillar_type,
      ri.priority,
      ri.relevance_score,
      ri.created_at,
      ROW_NUMBER() OVER (
        PARTITION BY ri.relationship_id 
        ORDER BY 
          CASE ri.priority 
            WHEN 'high' THEN 1 
            WHEN 'medium' THEN 2 
            ELSE 3 
          END,
          ri.relevance_score DESC,
          ri.created_at DESC
      ) as rn
    FROM relationship_insights ri
    WHERE 
      ri.generated_for_user = p_user_id
      AND ri.read_status = 'unread'
      AND ri.dashboard_dismissed = FALSE
      AND ri.created_at >= NOW() - INTERVAL '1 hour' * p_hours_ago
      AND (ri.relevance_score IS NULL OR ri.relevance_score > 70)
  )
  SELECT 
    id,
    relationship_id,
    title,
    description,
    insight_type,
    pillar_type,
    priority,
    relevance_score,
    created_at
  FROM ranked_insights
  WHERE rn <= p_max_per_relationship
  ORDER BY 
    CASE priority 
      WHEN 'high' THEN 1 
      WHEN 'medium' THEN 2 
      ELSE 3 
    END,
    created_at DESC;
END;
$$;

-- Step 9: Auto-cleanup old unread insights (older than 7 days)
CREATE OR REPLACE FUNCTION auto_cleanup_old_insights()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Mark insights older than 7 days as read
  UPDATE relationship_insights
  SET 
    read_status = 'read',
    read_at = NOW()
  WHERE 
    read_status = 'unread'
    AND created_at < NOW() - INTERVAL '7 days';
  
  -- Same for partner suggestions
  UPDATE partner_suggestions
  SET 
    read_status = 'read',
    read_at = NOW()
  WHERE 
    read_status = 'unread'
    AND created_at < NOW() - INTERVAL '7 days';
END;
$$;

-- Step 10: Create trigger to update relationship health scores
CREATE OR REPLACE FUNCTION update_relationship_health_score()
RETURNS TRIGGER
LANGUAGE plpgsql
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
    75, -- Default, should be calculated based on actual data
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

-- Create trigger for insights
CREATE TRIGGER update_health_on_insight
AFTER INSERT ON relationship_insights
FOR EACH ROW
EXECUTE FUNCTION update_relationship_health_score();

-- Step 11: Row Level Security for new table
ALTER TABLE relationship_health_scores ENABLE ROW LEVEL SECURITY;

-- Users can view their own relationship health scores
CREATE POLICY "Users can view own relationship health scores" ON relationship_health_scores
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

-- Service role can manage all health scores
CREATE POLICY "Service role can manage health scores" ON relationship_health_scores
FOR ALL 
TO service_role
USING (true);

-- Step 12: Grant permissions
GRANT SELECT, INSERT, UPDATE ON relationship_health_scores TO authenticated;
GRANT ALL ON relationship_health_scores TO service_role;

-- Verification queries
/*
-- Check new columns were added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'relationship_insights' 
AND column_name IN ('read_status', 'pillar_type', 'relevance_score');

-- Test unread insights function
SELECT * FROM get_unread_dashboard_insights('user-uuid-here', 48, 2);

-- Check relationship health scores
SELECT * FROM relationship_health_scores;
*/

-- Success! Database is ready for Phase 5 clean dashboard with smart 4-pillar insights.