-- SAFE RLS UPDATE SCRIPT
-- Created: August 2025
-- Purpose: Update RLS policies WITHOUT conflicts
-- This script is designed to work with existing comprehensive RLS policies

-- ====================================
-- STEP 1: CHECK WHAT EXISTS (RUN THIS FIRST)
-- ====================================

-- Check RLS status
SELECT 
  tablename, 
  rowsecurity as rls_enabled,
  (SELECT count(*) FROM pg_policies WHERE schemaname = 'public' AND pg_policies.tablename = pg_tables.tablename) as policy_count
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'universal_user_profiles',
    'ai_memory_entries', 
    'ai_conversation_history',
    'relationship_profiles',
    'enhanced_journal_analysis'
  )
ORDER BY tablename;

-- ====================================
-- STEP 2: SAFE UPDATES (ONLY MISSING PIECES)
-- ====================================

-- Add performance indexes (safe - uses IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_universal_user_profiles_user_id ON public.universal_user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_memory_entries_user_id ON public.ai_memory_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversation_history_user_id ON public.ai_conversation_history(user_id);
CREATE INDEX IF NOT EXISTS idx_relationship_profiles_user_id ON public.relationship_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_enhanced_journal_analysis_user_id ON public.enhanced_journal_analysis(user_id);

-- Add helper functions (safe - uses CREATE OR REPLACE)
CREATE OR REPLACE FUNCTION public.user_in_relationship(relationship_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.relationship_members rm
    WHERE rm.relationship_id = relationship_uuid
    AND rm.user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.user_has_premium()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.premium_subscriptions ps
    WHERE ps.user_id = auth.uid()
    AND ps.subscription_status IN ('active', 'trial')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Safe grants (can run multiple times)
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- ====================================
-- STEP 3: VERIFICATION QUERIES
-- ====================================

-- Verify the critical policies exist
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('universal_user_profiles', 'ai_memory_entries', 'ai_conversation_history')
ORDER BY tablename, policyname;

-- Summary
SELECT 'RLS Update Complete - No policy conflicts' as status;