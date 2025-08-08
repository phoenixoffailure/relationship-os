-- Fix relationship_health_scores table - Add missing columns for Phase 7.2
-- The API expects these columns but they don't exist in the current schema

-- Add missing columns to relationship_health_scores table
ALTER TABLE public.relationship_health_scores 
ADD COLUMN IF NOT EXISTS relationship_type text 
CHECK (relationship_type = ANY (ARRAY['romantic'::text, 'work'::text, 'family'::text, 'friend'::text, 'other'::text]));

ALTER TABLE public.relationship_health_scores 
ADD COLUMN IF NOT EXISTS metric_scores jsonb DEFAULT '{}'::jsonb;

ALTER TABLE public.relationship_health_scores 
ADD COLUMN IF NOT EXISTS trend_data jsonb DEFAULT '{}'::jsonb;

ALTER TABLE public.relationship_health_scores 
ADD COLUMN IF NOT EXISTS calculation_date timestamp with time zone DEFAULT now();

ALTER TABLE public.relationship_health_scores 
ADD COLUMN IF NOT EXISTS checkins_analyzed integer DEFAULT 0;

-- Add indexes for performance on new columns
CREATE INDEX IF NOT EXISTS idx_relationship_health_scores_relationship_type 
ON public.relationship_health_scores(relationship_type);

CREATE INDEX IF NOT EXISTS idx_relationship_health_scores_calculation_date 
ON public.relationship_health_scores(calculation_date);

-- Add composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_relationship_health_scores_user_relationship_type 
ON public.relationship_health_scores(user_id, relationship_id, relationship_type);

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'relationship_health_scores' 
  AND table_schema = 'public'
ORDER BY ordinal_position;