-- Phase 8: SAFE RLS Policy Management
-- Updated: August 2025
-- Purpose: Manage RLS policies without conflicts
-- IMPORTANT: This script does NOT create policies that already exist

-- ====================================
-- ANALYSIS: CURRENT RLS STATE
-- ====================================
/*
 * From Comprehensive-rls-implementation.json analysis:
 * - 1212 lines of existing RLS policies
 * - universal_user_profiles: Multiple policies exist
 * - ai_memory_entries: User + service role policies exist  
 * - ai_conversation_history: User + service role policies exist
 * - Most tables already have comprehensive policies
 * 
 * CONCLUSION: RLS system is already operational and comprehensive
 */

-- ====================================
-- STEP 1: VERIFICATION QUERIES (RUN FIRST)
-- ====================================

-- Check which tables have RLS enabled
SELECT 
  tablename, 
  rowsecurity as rls_enabled
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

-- Check existing policies on key tables
SELECT 
  tablename,
  COUNT(*) as policy_count,
  ARRAY_AGG(DISTINCT cmd) as commands_covered
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN (
    'universal_user_profiles',
    'ai_memory_entries',
    'ai_conversation_history'
  )
GROUP BY tablename
ORDER BY tablename;

-- ====================================
-- STEP 2: SAFE ADDITIONS ONLY
-- ====================================

-- Enable RLS only if not already enabled
DO $$
BEGIN
  -- Check each table individually and enable only if needed
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'universal_user_profiles' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE public.universal_user_profiles ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'ai_memory_entries' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE public.ai_memory_entries ENABLE ROW LEVEL SECURITY;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'ai_conversation_history' 
    AND rowsecurity = true
  ) THEN
    ALTER TABLE public.ai_conversation_history ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- ====================================
-- STEP 3: PERFORMANCE INDEXES (SAFE)
-- ====================================

-- Add performance indexes for RLS queries (safe with IF NOT EXISTS)
CREATE INDEX IF NOT EXISTS idx_universal_user_profiles_user_id 
ON public.universal_user_profiles(user_id);

CREATE INDEX IF NOT EXISTS idx_ai_memory_entries_user_id 
ON public.ai_memory_entries(user_id);

CREATE INDEX IF NOT EXISTS idx_ai_memory_entries_relationship_id 
ON public.ai_memory_entries(relationship_id);

CREATE INDEX IF NOT EXISTS idx_ai_conversation_history_user_id 
ON public.ai_conversation_history(user_id);

CREATE INDEX IF NOT EXISTS idx_relationship_profiles_user_id 
ON public.relationship_profiles(user_id);

CREATE INDEX IF NOT EXISTS idx_relationship_profiles_relationship_id 
ON public.relationship_profiles(relationship_id);

-- ====================================
-- STEP 4: HELPER FUNCTIONS (SAFE)
-- ====================================

-- Helper function for relationship membership (safe with CREATE OR REPLACE)
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

-- Helper function for premium access (safe with CREATE OR REPLACE)  
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

-- ====================================
-- STEP 5: SERVICE ROLE GRANTS (SAFE)
-- ====================================

-- Grant service role access (safe to run multiple times)
GRANT USAGE ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- ====================================
-- STEP 6: FINAL VERIFICATION
-- ====================================

-- Verify critical policies exist (should show existing policies)
SELECT 
  'Verification: Existing RLS Policies' as check_type,
  tablename,
  policyname,
  cmd,
  CASE 
    WHEN policyname LIKE '%service%role%' THEN 'Service Role Policy'
    WHEN policyname LIKE '%own%' THEN 'User Access Policy'
    ELSE 'Other Policy'
  END as policy_type
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('universal_user_profiles', 'ai_memory_entries', 'ai_conversation_history')
ORDER BY tablename, policy_type, policyname;

-- Summary message
SELECT 'Phase 8 RLS Update Complete - No conflicts created' as status;