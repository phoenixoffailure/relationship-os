-- Fix ambiguous column references in database functions
-- Run this in Supabase SQL Editor

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
      ri.id::UUID,
      ri.relationship_id::UUID,
      ri.title::TEXT,
      ri.description::TEXT,
      ri.insight_type::TEXT,
      ri.pillar_type::TEXT,
      ri.priority::TEXT,
      ri.relevance_score::INTEGER,
      ri.created_at::TIMESTAMP,
      ROW_NUMBER() OVER (
        PARTITION BY ri.relationship_id 
        ORDER BY 
          CASE ri.priority 
            WHEN 'high' THEN 1 
            WHEN 'medium' THEN 2 
            ELSE 3 
          END,
          ri.relevance_score DESC NULLS LAST,
          ri.created_at DESC
      ) as rn
    FROM relationship_insights ri
    WHERE 
      ri.generated_for_user = p_user_id
      AND (ri.read_status IS NULL OR ri.read_status = 'unread')
      AND (ri.dashboard_dismissed IS NULL OR ri.dashboard_dismissed = FALSE)
      AND ri.created_at >= NOW() - INTERVAL '1 hour' * p_hours_ago
      AND (ri.relevance_score IS NULL OR ri.relevance_score > 70)
  )
  SELECT 
    ranked_insights.id,
    ranked_insights.relationship_id,
    ranked_insights.title,
    ranked_insights.description,
    ranked_insights.insight_type,
    ranked_insights.pillar_type,
    ranked_insights.priority,
    ranked_insights.relevance_score,
    ranked_insights.created_at
  FROM ranked_insights
  WHERE ranked_insights.rn <= p_max_per_relationship
  ORDER BY 
    CASE ranked_insights.priority 
      WHEN 'high' THEN 1 
      WHEN 'medium' THEN 2 
      ELSE 3 
    END,
    ranked_insights.created_at DESC;
END;
$$;

-- Success message
SELECT 'Database function fixed successfully!' as status;