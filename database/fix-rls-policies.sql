-- Fix RLS policies blocking insight generation
-- Run this in Supabase SQL Editor

-- 1. Check current RLS policies on relationship_insights table
SELECT schemaname, tablename, policyname, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'relationship_insights';

-- 2. Drop and recreate RLS policy for relationship_insights to allow service role
DROP POLICY IF EXISTS "Service role can manage insights" ON relationship_insights;

CREATE POLICY "Service role can manage insights" ON relationship_insights
FOR ALL 
TO service_role
USING (true);

-- 3. Ensure service role can insert insights
DROP POLICY IF EXISTS "Service role can insert insights" ON relationship_insights;

CREATE POLICY "Service role can insert insights" ON relationship_insights
FOR INSERT 
TO service_role
WITH CHECK (true);

-- 4. Check if relationship_health_scores table exists and has proper policies
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'relationship_health_scores') THEN
        -- Drop existing restrictive policies
        DROP POLICY IF EXISTS "Users can view own relationship health scores" ON relationship_health_scores;
        DROP POLICY IF EXISTS "Service role can manage health scores" ON relationship_health_scores;
        
        -- Create more permissive policies
        CREATE POLICY "Service role can manage health scores" ON relationship_health_scores
        FOR ALL 
        TO service_role
        USING (true);
        
        CREATE POLICY "Users can view own relationship health scores" ON relationship_health_scores
        FOR SELECT 
        TO authenticated
        USING (user_id = auth.uid());
        
        CREATE POLICY "Users can update own relationship health scores" ON relationship_health_scores
        FOR UPDATE 
        TO authenticated
        USING (user_id = auth.uid());
        
        RAISE NOTICE 'Fixed relationship_health_scores RLS policies';
    ELSE
        RAISE NOTICE 'relationship_health_scores table does not exist';
    END IF;
END $$;

-- 5. Ensure service role has proper permissions on relationship_insights
GRANT ALL ON relationship_insights TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- 6. Check and fix partner_suggestions RLS if needed
DROP POLICY IF EXISTS "Service role can manage partner suggestions" ON partner_suggestions;

CREATE POLICY "Service role can manage partner suggestions" ON partner_suggestions
FOR ALL 
TO service_role
USING (true);

-- 7. Grant permissions on partner_suggestions
GRANT ALL ON partner_suggestions TO service_role;

-- 8. Verification queries
SELECT 'relationship_insights policies:' as table_check;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'relationship_insights';

SELECT 'partner_suggestions policies:' as table_check;  
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'partner_suggestions';

-- Check if relationship_health_scores exists
SELECT 
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'relationship_health_scores') 
        THEN 'relationship_health_scores table EXISTS'
        ELSE 'relationship_health_scores table MISSING'
    END as health_scores_status;

SELECT 'SUCCESS: RLS policies fixed for insight generation' as status;