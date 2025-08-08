-- Fix relationship_checkins table - Add missing relationship_type column
-- This column is required by the checkin functionality

-- Add relationship_type column to relationship_checkins table
ALTER TABLE public.relationship_checkins 
ADD COLUMN IF NOT EXISTS relationship_type text 
CHECK (relationship_type = ANY (ARRAY['romantic'::text, 'work'::text, 'family'::text, 'friend'::text, 'other'::text]));

-- Add index for performance on relationship_type queries
CREATE INDEX IF NOT EXISTS idx_relationship_checkins_relationship_type 
ON public.relationship_checkins(relationship_type);

-- Add composite index for common query patterns
CREATE INDEX IF NOT EXISTS idx_relationship_checkins_user_relationship_type 
ON public.relationship_checkins(user_id, relationship_id, relationship_type);

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'relationship_checkins' 
  AND table_schema = 'public'
ORDER BY ordinal_position;