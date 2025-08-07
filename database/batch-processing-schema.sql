-- RelationshipOS Phase 4: Daily Batch Processing Schema Updates
-- Run this in Supabase SQL Editor to add batch processing capabilities

-- Step 1: Add batch tracking to journal_entries
ALTER TABLE journal_entries 
ADD COLUMN IF NOT EXISTS personal_insights_generated BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS ready_for_batch_processing BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS batch_processed_at TIMESTAMP NULL;

-- Step 2: Add batch tracking to partner_suggestions  
ALTER TABLE partner_suggestions
ADD COLUMN IF NOT EXISTS batch_date DATE NULL,
ADD COLUMN IF NOT EXISTS batch_id UUID NULL;

-- Step 3: Create batch processing log table
CREATE TABLE IF NOT EXISTS batch_processing_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_date DATE NOT NULL,
  relationship_id UUID REFERENCES relationships(id),
  entries_processed INTEGER DEFAULT 0,
  suggestions_generated INTEGER DEFAULT 0,
  processing_status TEXT DEFAULT 'completed' CHECK (processing_status IN ('running', 'completed', 'failed')),
  error_message TEXT NULL,
  processing_started_at TIMESTAMP DEFAULT NOW(),
  processing_completed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Step 4: Create index for efficient batch queries
CREATE INDEX IF NOT EXISTS idx_journal_entries_batch_ready 
ON journal_entries (ready_for_batch_processing, batch_processed_at, created_at);

CREATE INDEX IF NOT EXISTS idx_partner_suggestions_batch_date 
ON partner_suggestions (batch_date, relationship_id);

CREATE INDEX IF NOT EXISTS idx_batch_processing_log_date 
ON batch_processing_log (batch_date, processing_status);

-- Step 5: Mark existing journal entries as having personal insights generated
-- (Since they were generated immediately in the old system)
UPDATE journal_entries 
SET personal_insights_generated = TRUE 
WHERE personal_insights_generated IS NULL OR personal_insights_generated = FALSE;

-- Step 6: Mark existing partner suggestions with batch dates based on creation date
-- (Retroactively organize existing suggestions)
UPDATE partner_suggestions 
SET batch_date = DATE(created_at)
WHERE batch_date IS NULL;

-- Step 7: Create helper function to get unprocessed journals for batching
CREATE OR REPLACE FUNCTION get_journals_ready_for_batch(target_date DATE)
RETURNS TABLE (
  journal_id UUID,
  user_id UUID,
  content TEXT,
  relationship_id UUID,
  mood_score INTEGER,
  created_at TIMESTAMP
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    je.id as journal_id,
    je.user_id,
    je.content,
    je.relationship_id,
    je.mood_score,
    je.created_at
  FROM journal_entries je
  WHERE 
    DATE(je.created_at) = target_date
    AND je.ready_for_batch_processing = TRUE
    AND je.batch_processed_at IS NULL
    AND je.personal_insights_generated = TRUE  -- Only process journals that have personal insights
  ORDER BY je.created_at ASC;
END;
$$;

-- Step 8: Create helper function to mark journals as batch processed
CREATE OR REPLACE FUNCTION mark_journals_batch_processed(journal_ids UUID[], batch_timestamp TIMESTAMP)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE journal_entries 
  SET 
    batch_processed_at = batch_timestamp,
    ready_for_batch_processing = FALSE
  WHERE id = ANY(journal_ids);
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;

-- Step 9: Row Level Security (RLS) for new table
-- Enable RLS on batch_processing_log
ALTER TABLE batch_processing_log ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view batch logs for their relationships
CREATE POLICY "Users can view batch logs for their relationships" ON batch_processing_log
FOR SELECT 
TO authenticated
USING (
  relationship_id IN (
    SELECT rm.relationship_id 
    FROM relationship_members rm 
    WHERE rm.user_id = auth.uid()
  )
);

-- Policy: Service role can manage all batch logs (for batch processing)
CREATE POLICY "Service role can manage batch logs" ON batch_processing_log
FOR ALL 
TO service_role
USING (true);

-- Step 10: Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON batch_processing_log TO authenticated;
GRANT ALL ON batch_processing_log TO service_role;

-- Verification queries (run these to check the schema updates worked)
/*
-- Check that new columns were added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'journal_entries' AND column_name IN ('personal_insights_generated', 'ready_for_batch_processing', 'batch_processed_at');

SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'partner_suggestions' AND column_name IN ('batch_date', 'batch_id');

-- Check that the new table was created
SELECT table_name FROM information_schema.tables WHERE table_name = 'batch_processing_log';

-- Test the helper function
SELECT * FROM get_journals_ready_for_batch('2025-08-07'::DATE);
*/

-- Success! Schema is ready for Phase 4 batch processing system.