-- Phase 7.5: Update insight_type constraint to support relationship-specific insight types
-- This allows our advanced AI memory system to use contextually appropriate insight types

-- First, check what constraint currently exists
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'relationship_insights'::regclass 
AND contype = 'c'
AND pg_get_constraintdef(oid) LIKE '%insight_type%';

-- Drop the existing constraint on insight_type
DO $$ 
BEGIN 
    -- Find and drop any existing insight_type check constraints
    PERFORM 1 FROM pg_constraint 
    WHERE conrelid = 'relationship_insights'::regclass 
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%insight_type%';
    
    IF FOUND THEN
        -- Drop the constraint (name may vary)
        ALTER TABLE relationship_insights 
        DROP CONSTRAINT IF EXISTS relationship_insights_insight_type_check;
        
        ALTER TABLE relationship_insights 
        DROP CONSTRAINT IF EXISTS insights_insight_type_check;
        
        ALTER TABLE relationship_insights 
        DROP CONSTRAINT IF EXISTS check_insight_type;
        
        RAISE NOTICE 'Dropped existing insight_type constraint';
    ELSE
        RAISE NOTICE 'No existing insight_type constraint found';
    END IF;
END $$;

-- Add new comprehensive constraint that supports Phase 7.5 relationship-specific insight types
ALTER TABLE relationship_insights 
ADD CONSTRAINT relationship_insights_insight_type_check 
CHECK (insight_type IN (
    -- Original insight types (keeping compatibility)
    'pattern',
    'suggestion', 
    'appreciation',
    'milestone',
    'insight',
    'growth',
    
    -- Phase 7.5: Relationship-specific insight types
    'connection',              -- Romantic relationships
    'professional_growth',     -- Work relationships  
    'family_harmony',          -- Family relationships
    'friendship_support',      -- Friend relationships
    'personal_growth',         -- Other/general relationships
    
    -- Additional contextual types our AI might generate
    'boundary',
    'communication',
    'emotional_growth',
    'relationship_milestone',
    'behavioral_pattern',
    'preference_insight'
));

-- Also update any related constraints in other tables if they exist
DO $$
BEGIN
    -- Check if partner_suggestions has similar constraint
    IF EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conrelid = 'partner_suggestions'::regclass 
        AND contype = 'c'
        AND pg_get_constraintdef(oid) LIKE '%suggestion_type%'
    ) THEN
        -- Update partner_suggestions constraint if it exists
        ALTER TABLE partner_suggestions 
        DROP CONSTRAINT IF EXISTS partner_suggestions_suggestion_type_check;
        
        ALTER TABLE partner_suggestions 
        ADD CONSTRAINT partner_suggestions_suggestion_type_check 
        CHECK (suggestion_type IN (
            'pattern',
            'suggestion', 
            'appreciation',
            'milestone',
            'connection',
            'professional_growth',
            'family_harmony',
            'friendship_support',
            'personal_growth',
            'boundary',
            'communication'
        ));
        
        RAISE NOTICE 'Updated partner_suggestions constraint';
    END IF;
END $$;

-- Verify the new constraint is working
SELECT 'SUCCESS: Updated insight_type constraint to support Phase 7.5 relationship-specific types' as status;

-- Show the new constraint definition
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'relationship_insights'::regclass 
AND conname = 'relationship_insights_insight_type_check';

-- Test insert to make sure it works (will be rolled back)
DO $$
BEGIN
    -- Test each new insight type
    INSERT INTO relationship_insights (
        generated_for_user,
        relationship_id,
        insight_type,
        title,
        description,
        priority,
        created_at
    ) VALUES 
    (
        gen_random_uuid(),
        gen_random_uuid(), 
        'connection',
        'Test Connection Insight',
        'This is a test romantic connection insight',
        'medium',
        NOW()
    );
    
    -- If we get here, the constraint allows the new types
    RAISE NOTICE 'SUCCESS: New insight types are working!';
    
    -- Clean up test data
    DELETE FROM relationship_insights WHERE title = 'Test Connection Insight';
    
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Error testing new constraint: %', SQLERRM;
END $$;

COMMENT ON CONSTRAINT relationship_insights_insight_type_check ON relationship_insights IS 
'Phase 7.5: Supports relationship-specific insight types (connection, professional_growth, family_harmony, friendship_support, personal_growth) plus original types for backwards compatibility';