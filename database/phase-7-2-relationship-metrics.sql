-- database/phase-7-2-relationship-metrics.sql
-- Phase 7.2: Relationship-Specific Metrics & Features Database Schema
-- New tables for relationship-specific metrics instead of universal romantic ones

-- First, add relationship_type column to the relationships table if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'relationships' AND column_name = 'relationship_type') THEN
        ALTER TABLE public.relationships 
        ADD COLUMN relationship_type TEXT DEFAULT 'romantic' 
        CHECK (relationship_type IN ('romantic', 'work', 'family', 'friend', 'other'));
        
        -- Update existing relationships to have a default type (since most existing ones are romantic)
        UPDATE public.relationships 
        SET relationship_type = 'romantic' 
        WHERE relationship_type IS NULL;
        
        -- Make the column NOT NULL after setting defaults
        ALTER TABLE public.relationships 
        ALTER COLUMN relationship_type SET NOT NULL;
        
        RAISE NOTICE 'Added relationship_type column to relationships table';
    ELSE
        RAISE NOTICE 'relationship_type column already exists';
    END IF;
END $$;

-- Table for relationship-specific check-ins
CREATE TABLE IF NOT EXISTS public.relationship_checkins (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    relationship_id UUID REFERENCES public.relationships(id) ON DELETE CASCADE NOT NULL,
    metric_values JSONB NOT NULL DEFAULT '{}', -- Stores all metric scores (e.g., {"connection_score": 8, "intimacy_score": 7})
    text_responses JSONB NOT NULL DEFAULT '{}', -- Stores text responses (e.g., {"gratitude_note": "...", "challenge_note": "..."})
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Table for calculated relationship health scores
CREATE TABLE IF NOT EXISTS public.relationship_health_scores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    relationship_id UUID REFERENCES public.relationships(id) ON DELETE CASCADE NOT NULL,
    health_score INTEGER NOT NULL CHECK (health_score >= 0 AND health_score <= 100),
    metric_scores JSONB NOT NULL DEFAULT '{}', -- Current average scores for each metric
    trend_data JSONB NOT NULL DEFAULT '{}', -- Trend information (up/down/stable) for each metric
    calculation_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    checkins_analyzed INTEGER DEFAULT 0 NOT NULL, -- Number of check-ins used in calculation
    -- Ensure one score record per user per relationship
    UNIQUE(user_id, relationship_id)
);

-- Table for relationship-specific language preferences (replaces universal love languages)
CREATE TABLE IF NOT EXISTS public.relationship_language_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    relationship_id UUID REFERENCES public.relationships(id) ON DELETE CASCADE NOT NULL,
    language_rankings TEXT[] NOT NULL DEFAULT '{}', -- Ordered list of preferred languages for this relationship type
    giving_preferences TEXT[] NOT NULL DEFAULT '{}', -- How they prefer to give in this relationship type
    receiving_preferences TEXT[] NOT NULL DEFAULT '{}', -- How they prefer to receive in this relationship type
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    -- Ensure one preference record per user per relationship
    UNIQUE(user_id, relationship_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_relationship_checkins_user_relationship ON public.relationship_checkins(user_id, relationship_id);
CREATE INDEX IF NOT EXISTS idx_relationship_checkins_recent ON public.relationship_checkins(user_id, relationship_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_relationship_health_scores_user ON public.relationship_health_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_relationship_health_scores_relationship ON public.relationship_health_scores(relationship_id);

CREATE INDEX IF NOT EXISTS idx_relationship_language_preferences_user ON public.relationship_language_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_relationship_language_preferences_relationship ON public.relationship_language_preferences(relationship_id);

-- Row Level Security (RLS) Policies

-- relationship_checkins policies
ALTER TABLE public.relationship_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own relationship check-ins"
    ON public.relationship_checkins
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own relationship check-ins"
    ON public.relationship_checkins
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own relationship check-ins"
    ON public.relationship_checkins
    FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own relationship check-ins"
    ON public.relationship_checkins
    FOR DELETE
    USING (auth.uid() = user_id);

-- relationship_health_scores policies
ALTER TABLE public.relationship_health_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own relationship health scores"
    ON public.relationship_health_scores
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "System can insert/update relationship health scores"
    ON public.relationship_health_scores
    FOR INSERT
    WITH CHECK (true); -- Allow system to insert scores

CREATE POLICY "System can update relationship health scores"
    ON public.relationship_health_scores
    FOR UPDATE
    USING (true); -- Allow system to update scores

-- relationship_language_preferences policies  
ALTER TABLE public.relationship_language_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own relationship language preferences"
    ON public.relationship_language_preferences
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Grant necessary permissions for service role
GRANT ALL ON public.relationship_checkins TO service_role;
GRANT ALL ON public.relationship_health_scores TO service_role;
GRANT ALL ON public.relationship_language_preferences TO service_role;

-- Grant read permissions for authenticated users
GRANT SELECT ON public.relationship_checkins TO authenticated;
GRANT SELECT ON public.relationship_health_scores TO authenticated;
GRANT SELECT ON public.relationship_language_preferences TO authenticated;

-- Grant insert/update permissions for authenticated users on their own data
GRANT INSERT, UPDATE ON public.relationship_checkins TO authenticated;
GRANT INSERT, UPDATE ON public.relationship_language_preferences TO authenticated;

-- Updated trigger functions for updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
DROP TRIGGER IF EXISTS handle_relationship_checkins_updated_at ON public.relationship_checkins;
CREATE TRIGGER handle_relationship_checkins_updated_at
    BEFORE UPDATE ON public.relationship_checkins
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS handle_relationship_language_preferences_updated_at ON public.relationship_language_preferences;
CREATE TRIGGER handle_relationship_language_preferences_updated_at
    BEFORE UPDATE ON public.relationship_language_preferences
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Insert sample data for development/testing (optional)
-- This shows the structure but won't run without valid user/relationship IDs

/*
-- Example relationship-specific check-in data:
INSERT INTO public.relationship_checkins (user_id, relationship_id, relationship_type, metric_values, text_responses) VALUES 
(
    '00000000-0000-0000-0000-000000000000', -- Replace with actual user_id
    '11111111-1111-1111-1111-111111111111', -- Replace with actual relationship_id  
    'romantic',
    '{"connection_score": 8, "intimacy_score": 7, "future_alignment": 9}',
    '{"gratitude_note": "Grateful for our deep conversation last night", "challenge_note": "Working on spending more quality time together"}'
),
(
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-2222-2222-222222222222', 
    'work',
    '{"professional_rapport": 7, "collaboration_effectiveness": 8, "boundary_health": 9}',
    '{"work_gratitude": "Great collaboration on the project", "work_challenges": "Need clearer communication on deadlines"}'
);

-- Example relationship language preferences:
INSERT INTO public.relationship_language_preferences (user_id, relationship_id, relationship_type, language_rankings, giving_preferences, receiving_preferences) VALUES
(
    '00000000-0000-0000-0000-000000000000',
    '11111111-1111-1111-1111-111111111111',
    'romantic',
    '["words_of_affirmation", "quality_time", "physical_touch", "acts_of_service", "receiving_gifts"]',
    '["acts_of_service", "words_of_affirmation"]',
    '["words_of_affirmation", "quality_time"]'
),
(
    '00000000-0000-0000-0000-000000000000',
    '22222222-2222-2222-2222-222222222222',
    'work', 
    '["collaborative_support", "public_recognition", "professional_development", "constructive_feedback", "autonomy_respect"]',
    '["collaborative_support", "constructive_feedback"]',
    '["public_recognition", "professional_development"]'
);
*/

-- Comments explaining the new system:
COMMENT ON TABLE public.relationship_checkins IS 'Phase 7.2: Relationship-specific check-ins replacing universal romantic metrics. Each relationship type has its own appropriate metrics.';

COMMENT ON TABLE public.relationship_health_scores IS 'Phase 7.2: Calculated health scores specific to relationship type (romantic rapport vs work collaboration vs family harmony).';

COMMENT ON TABLE public.relationship_language_preferences IS 'Phase 7.2: Relationship-specific language preferences replacing universal love languages (work appreciation languages, family support languages, etc.).';

COMMENT ON COLUMN public.relationship_checkins.metric_values IS 'JSONB storing relationship-type-specific metrics. Romantic: {connection_score, intimacy_score}. Work: {professional_rapport, collaboration_effectiveness}. Family: {family_harmony, boundary_respect}. Friend: {friendship_satisfaction, social_energy}.';

COMMENT ON COLUMN public.relationship_language_preferences.language_rankings IS 'Ordered preferences for relationship-type-specific languages. Romantic uses traditional love languages. Work uses professional appreciation languages. Family uses support languages. Friends use connection languages.';