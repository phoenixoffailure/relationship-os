-- Phase 6A Premium Analytics Database Schema
-- Run this in Supabase SQL Editor

-- 1. Premium subscriptions management
CREATE TABLE IF NOT EXISTS premium_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_status TEXT NOT NULL CHECK (subscription_status IN ('active', 'cancelled', 'expired', 'trial')),
  plan_type TEXT NOT NULL CHECK (plan_type IN ('premium_monthly', 'premium_yearly', 'premium_trial')),
  stripe_subscription_id TEXT UNIQUE,
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  trial_ends_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(user_id) -- One subscription per user for MVP
);

-- 2. Premium analytics results storage
CREATE TABLE IF NOT EXISTS premium_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  relationship_id UUID REFERENCES relationships(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL CHECK (analysis_type IN ('firo_compatibility', 'communication_style', 'relationship_trends')),
  results JSONB NOT NULL,
  confidence_score FLOAT NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 100),
  research_citations TEXT[] DEFAULT '{}',
  limitations TEXT,
  generated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '90 days') -- Auto-expire for privacy
);

-- 3. FIRO compatibility analysis cache
CREATE TABLE IF NOT EXISTS firo_compatibility_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_id UUID REFERENCES relationships(id) ON DELETE CASCADE,
  user1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- FIRO scores for both users (cached for performance)
  user1_inclusion INTEGER NOT NULL CHECK (user1_inclusion >= 1 AND user1_inclusion <= 9),
  user1_control INTEGER NOT NULL CHECK (user1_control >= 1 AND user1_control <= 9),
  user1_affection INTEGER NOT NULL CHECK (user1_affection >= 1 AND user1_affection <= 9),
  
  user2_inclusion INTEGER NOT NULL CHECK (user2_inclusion >= 1 AND user2_inclusion <= 9),
  user2_control INTEGER NOT NULL CHECK (user2_control >= 1 AND user2_control <= 9),
  user2_affection INTEGER NOT NULL CHECK (user2_affection >= 1 AND user2_affection <= 9),
  
  -- Calculated compatibility scores (research-backed algorithm)
  inclusion_compatibility_score INTEGER NOT NULL CHECK (inclusion_compatibility_score >= 0 AND inclusion_compatibility_score <= 100),
  control_compatibility_score INTEGER NOT NULL CHECK (control_compatibility_score >= 0 AND control_compatibility_score <= 100),
  affection_compatibility_score INTEGER NOT NULL CHECK (affection_compatibility_score >= 0 AND affection_compatibility_score <= 100),
  overall_compatibility_score INTEGER NOT NULL CHECK (overall_compatibility_score >= 0 AND overall_compatibility_score <= 100),
  
  confidence_level FLOAT NOT NULL CHECK (confidence_level >= 0 AND confidence_level <= 100),
  generated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '30 days'), -- Refresh monthly
  
  -- Constraints
  UNIQUE(relationship_id), -- One analysis per relationship
  CHECK(user1_id != user2_id) -- Can't analyze compatibility with yourself
);

-- 4. Communication analysis results
CREATE TABLE IF NOT EXISTS communication_analysis_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  relationship_id UUID REFERENCES relationships(id) ON DELETE CASCADE,
  
  -- Communication style scores (0-100)
  directness_score INTEGER NOT NULL CHECK (directness_score >= 0 AND directness_score <= 100),
  assertiveness_score INTEGER NOT NULL CHECK (assertiveness_score >= 0 AND assertiveness_score <= 100),
  emotional_expression_score INTEGER NOT NULL CHECK (emotional_expression_score >= 0 AND emotional_expression_score <= 100),
  
  -- Thomas-Kilmann conflict style
  conflict_style TEXT NOT NULL CHECK (conflict_style IN ('competing', 'accommodating', 'avoiding', 'compromising', 'collaborating')),
  
  -- Analysis metadata
  journal_entries_analyzed INTEGER NOT NULL CHECK (journal_entries_analyzed >= 10), -- Minimum for confidence
  confidence_level FLOAT NOT NULL CHECK (confidence_level >= 0 AND confidence_level <= 100),
  communication_patterns JSONB, -- Store detected patterns for reference
  
  generated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '60 days'), -- Refresh every 2 months
  
  -- Constraints
  UNIQUE(user_id, relationship_id) -- One analysis per user per relationship
);

-- 5. Relationship health trend analysis
CREATE TABLE IF NOT EXISTS relationship_trend_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  relationship_id UUID REFERENCES relationships(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Trend data (based on journal mood scores, gratitude frequency, etc)
  satisfaction_trend_slope FLOAT NOT NULL, -- Positive = improving, negative = declining
  stability_score INTEGER NOT NULL CHECK (stability_score >= 0 AND stability_score <= 100),
  trend_direction TEXT NOT NULL CHECK (trend_direction IN ('improving', 'stable', 'declining')),
  
  -- Research-backed indicators
  positive_patterns TEXT[] DEFAULT '{}', -- Array of detected positive patterns
  risk_factors TEXT[] DEFAULT '{}', -- Array of detected risk factors
  gottman_indicators JSONB, -- Gottman research-based indicators
  
  -- Analysis metadata
  data_points_analyzed INTEGER NOT NULL CHECK (data_points_analyzed >= 30), -- Minimum 30 days
  confidence_level FLOAT NOT NULL CHECK (confidence_level >= 0 AND confidence_level <= 100),
  analysis_period_days INTEGER NOT NULL CHECK (analysis_period_days >= 30),
  
  generated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '30 days'), -- Monthly refresh for trends
  
  -- Constraints
  UNIQUE(relationship_id, user_id) -- One trend analysis per user per relationship
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS premium_analyses_user_type_idx ON premium_analyses (user_id, analysis_type);
CREATE INDEX IF NOT EXISTS premium_analyses_relationship_type_idx ON premium_analyses (relationship_id, analysis_type);
CREATE INDEX IF NOT EXISTS premium_analyses_generated_at_idx ON premium_analyses (generated_at);

CREATE INDEX IF NOT EXISTS communication_analysis_user_idx ON communication_analysis_results (user_id);
CREATE INDEX IF NOT EXISTS communication_analysis_relationship_idx ON communication_analysis_results (relationship_id);

CREATE INDEX IF NOT EXISTS trend_analysis_relationship_idx ON relationship_trend_analysis (relationship_id);
CREATE INDEX IF NOT EXISTS trend_analysis_generated_at_idx ON relationship_trend_analysis (generated_at);

-- 6. Row Level Security Policies

-- Premium subscriptions - users can only see their own
ALTER TABLE premium_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own premium subscription" ON premium_subscriptions
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Service role can manage premium subscriptions" ON premium_subscriptions
FOR ALL 
TO service_role
USING (true);

-- Premium analyses - users can only see their own
ALTER TABLE premium_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own premium analyses" ON premium_analyses
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Service role can manage premium analyses" ON premium_analyses
FOR ALL 
TO service_role
USING (true);

-- FIRO compatibility - users can see analyses for their relationships
ALTER TABLE firo_compatibility_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view compatibility for their relationships" ON firo_compatibility_results
FOR SELECT 
TO authenticated
USING (user1_id = auth.uid() OR user2_id = auth.uid());

CREATE POLICY "Service role can manage FIRO compatibility" ON firo_compatibility_results
FOR ALL 
TO service_role
USING (true);

-- Communication analysis - users can see their own analyses
ALTER TABLE communication_analysis_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own communication analysis" ON communication_analysis_results
FOR SELECT 
TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Service role can manage communication analysis" ON communication_analysis_results
FOR ALL 
TO service_role
USING (true);

-- Relationship trends - users can see trends for their relationships
ALTER TABLE relationship_trend_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view trends for their relationships" ON relationship_trend_analysis
FOR SELECT 
TO authenticated
USING (
  relationship_id IN (
    SELECT r.id FROM relationships r 
    JOIN relationship_members rm ON r.id = rm.relationship_id 
    WHERE rm.user_id = auth.uid()
  )
);

CREATE POLICY "Service role can manage relationship trends" ON relationship_trend_analysis
FOR ALL 
TO service_role
USING (true);

-- 7. Automatic cleanup function for expired analyses
CREATE OR REPLACE FUNCTION cleanup_expired_premium_analyses()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Delete expired premium analyses
  DELETE FROM premium_analyses WHERE expires_at < NOW();
  
  -- Delete expired FIRO compatibility results
  DELETE FROM firo_compatibility_results WHERE expires_at < NOW();
  
  -- Delete expired communication analyses
  DELETE FROM communication_analysis_results WHERE expires_at < NOW();
  
  -- Delete expired trend analyses
  DELETE FROM relationship_trend_analysis WHERE expires_at < NOW();
  
  RAISE NOTICE 'Expired premium analyses cleaned up at %', NOW();
END;
$$;

-- 8. Grant necessary permissions
GRANT ALL ON premium_subscriptions TO service_role;
GRANT ALL ON premium_analyses TO service_role;
GRANT ALL ON firo_compatibility_results TO service_role;
GRANT ALL ON communication_analysis_results TO service_role;
GRANT ALL ON relationship_trend_analysis TO service_role;

-- 9. Success message
SELECT 'SUCCESS: Phase 6A Premium Analytics database schema created successfully!' as status,
       'Tables created: premium_subscriptions, premium_analyses, firo_compatibility_results, communication_analysis_results, relationship_trend_analysis' as details;