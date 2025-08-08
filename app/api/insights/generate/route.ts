// Phase 7.1: Universal Relationship OS - True AI Behavioral Differentiation
// Enhanced insights generation with relationship-specific AI personalities

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getPillarConfig, formatPillarTitle } from '@/lib/insights/pillar-helpers'
import { 
  RelationshipType,
  adaptPromptForRelationshipType,
  getRelationshipConfig,
  detectRelationshipType,
  getAppropriateInsightTypes,
  validateSuggestionForRelationshipType,
  adjustLoveLanguageForRelationshipType
} from '@/lib/ai/relationship-type-intelligence'
import { 
  contextManager,
  detectContextFromJournalEntry,
  generateContextAwarePromptModifier
} from '@/lib/ai/multi-relationship-context-switcher'
// Phase 7.1: New imports for personality-driven AI
import { getAIPersonality, buildPersonalityPrompt } from '@/lib/ai/personalities'
import { filterContent, validateResponseRequirements } from '@/lib/ai/content-filters'
import { buildInsightsPrompt, UserPsychologicalProfile, RelationshipContext } from '@/lib/ai/prompt-builder'

// Phase 5: Smart 4-Pillar types
type PillarType = 'pattern' | 'growth' | 'appreciation' | 'milestone'

interface PillarScore {
  pillar: PillarType
  score: number
  relevantContent: string
}

export async function POST(request: Request) {
  console.log('🔍 Phase 5: Starting smart 4-pillar insight generation with relationship context...')
  
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch (error) {
              console.log('Cookie setting error (can be ignored):', error)
            }
          },
        },
      }
    )
    
    // Get current user
    console.log('🔍 Getting user...')
    let user_id = null
    try {
      const body = await request.json()
      user_id = body.user_id
            console.log('📥 Received user_id from request:', user_id)
    } catch (error) {
      // No body sent - this is fine, we'll fallback to auth
      console.log('📝 No body sent, falling back to auth...')
    }

    if (user_id) {
      console.log('✅ Using user_id from request:', user_id)
    } else {
      // Fallback to original auth method
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user || user.id === 'null') {
        console.error('❌ Auth fallback failed:', authError)
        return NextResponse.json({ 
          error: 'No valid user_id provided and auth failed',
          details: 'This endpoint requires user_id in request body for server-to-server calls'
        }, { status: 401 })
      }
      
      user_id = user.id
      console.log('✅ Using user_id from auth:', user_id)
    }
    
    console.log('✅ User ID received:', user_id)

    // Get user's relationships and partner data
    console.log('🔍 Fetching relationship context...')
    const relationshipContext = await getRelationshipContext(supabase, user_id)
    
    // 🎯 PHASE 3: Get user's relationships for context detection
    console.log('🔍 Fetching user relationships for Phase 3 context switching...')
    const { data: userRelationships, error: relationshipsError } = await supabase
      .from('relationship_members')
      .select(`
        relationship_id,
        relationships (
          id,
          name,
          relationship_type
        )
      `)
      .eq('user_id', user_id)
    
    const relationships = userRelationships?.map((r: any) => ({
      id: r.relationships.id,
      name: r.relationships.name,
      relationship_type: r.relationships.relationship_type as RelationshipType
    })) || []
    
    console.log('📊 Found user relationships for Phase 3:', relationships.length)
    
    // Validate that user_id is a valid UUID before proceeding
    if (!user_id || user_id === 'null' || user_id === 'undefined') {
      console.error('❌ Invalid user_id:', user_id)
      return NextResponse.json({ error: 'Valid user ID required' }, { status: 400 })
    }

        // Final validation - ensure user_id is a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(user_id)) {
      console.error('❌ Invalid UUID format for user_id:', user_id)
      return NextResponse.json({ 
        error: 'Invalid user_id format',
        details: 'user_id must be a valid UUID'
      }, { status: 400 })
    }

    console.log('✅ Valid user_id confirmed:', user_id)

    // Get user's onboarding responses for rich context
console.log('🔍 Fetching universal user profile (v2.0)...')
const { data: universalProfile, error: profileError } = await supabase
  .from('universal_user_profiles')  // ✅ NEW TABLE
  .select('*')
  .eq('user_id', user_id)
  .single()

console.log('🔍 Fetching relationship profiles (v2.0)...')
const { data: relationshipProfiles, error: relProfileError } = await supabase
  .from('relationship_profiles')  // ✅ NEW TABLE
  .select('*')
  .eq('user_id', user_id)

console.log('🔍 Fetching recent journal analysis (v2.0)...')
const { data: recentAnalysis, error: analysisError } = await supabase
  .from('enhanced_journal_analysis')  // ✅ NEW TABLE - Connect to recent AI analysis
  .select('*')
  .eq('user_id', user_id)
  .order('created_at', { ascending: false })
  .limit(5)

    // Get user's recent activity data
    console.log('🔍 Fetching user activity data...')
    const [journalResponse, checkinResponse] = await Promise.all([
      supabase
        .from('journal_entries')
        .select('mood_score, created_at, content')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false })
        .limit(10),
      
      supabase
        .from('daily_checkins')
        .select('connection_score, mood_score, created_at, gratitude_note, challenge_note, relationship_id')
        .eq('user_id', user_id)
        .order('created_at', { ascending: false })
        .limit(14)
    ])

    if (journalResponse.error || checkinResponse.error) {
      console.error('❌ Database errors:', { 
        journal: journalResponse.error, 
        checkin: checkinResponse.error 
      })
      return NextResponse.json({ error: 'Database query failed' }, { status: 500 })
    }

    const journals = journalResponse.data || []
    const checkins = checkinResponse.data || []
    const onboardingData = {
  // FIRO Theory data (from universal_user_profiles)
  inclusion_need: universalProfile?.inclusion_need || 5,
  control_need: universalProfile?.control_need || 5,
  affection_need: universalProfile?.affection_need || 5,
  
  // Attachment & Communication data
  attachment_style: universalProfile?.attachment_style || 'secure',
  communication_directness: universalProfile?.communication_directness || 5,
  communication_assertiveness: universalProfile?.communication_assertiveness || 5,
  support_preference: universalProfile?.support_preference || 'balanced',
  conflict_style: universalProfile?.conflict_style || 'collaborative',
  
  // Relationship-specific context (from relationship_profiles)
  relationship_profiles: relationshipProfiles || [],
  
  // Recent AI insights (from enhanced_journal_analysis) 
  recent_analysis: recentAnalysis || [],
  
  // Debug info
  data_source: 'v2.0_universal_profiles',
  profile_found: !!universalProfile,
  relationship_profiles_count: relationshipProfiles?.length || 0,
  recent_analysis_count: recentAnalysis?.length || 0
}

console.log('🔍 V2.0 Profile Integration:', {
  universal_profile_found: !!universalProfile,
  relationship_profiles: relationshipProfiles?.length || 0,
  recent_analysis: recentAnalysis?.length || 0,
  attachment_style: onboardingData.attachment_style,
  communication_style: `directness:${onboardingData.communication_directness}/assertiveness:${onboardingData.communication_assertiveness}`,
  firo_needs: `inclusion:${onboardingData.inclusion_need}/control:${onboardingData.control_need}/affection:${onboardingData.affection_need}`
})
    //Auth
    const { data: { user } } = await supabase.auth.getUser()
    console.log('🔍 DEBUG auth.uid():', user?.id)

    // Analyze patterns from user data with relationship context
    const patterns = analyzePatterns(journals, checkins, relationshipContext, onboardingData)
    console.log('📊 Patterns analyzed with relationship context:', patterns)
    
    // 🎯 PHASE 3: Determine relationship context for insights
    let primaryRelationshipType: RelationshipType = 'other'
    let primaryRelationshipId: string | null = null
    
    if (relationships.length > 0) {
      // If user has only one relationship, use that
      if (relationships.length === 1) {
        primaryRelationshipType = relationships[0].relationship_type
        primaryRelationshipId = relationships[0].id
        console.log('🎯 Using single relationship context:', primaryRelationshipType)
      } else {
        // Multiple relationships - try to detect from recent journal entries
        const { data: recentJournals } = await supabase
          .from('journal_entries')
          .select('content, relationship_id')
          .eq('user_id', user_id)
          .order('created_at', { ascending: false })
          .limit(5)
        
        // Try to detect context from recent journals
        for (const journal of recentJournals || []) {
          if (journal.relationship_id) {
            const relationship = relationships.find(r => r.id === journal.relationship_id)
            if (relationship) {
              primaryRelationshipType = relationship.relationship_type
              primaryRelationshipId = relationship.id
              console.log('🎯 Detected relationship context from journal:', primaryRelationshipType)
              break
            }
          }
        }
        
        // If still no context, use most active relationship (first one for now)
        if (primaryRelationshipType === 'other' && relationships.length > 0) {
          primaryRelationshipType = relationships[0].relationship_type
          primaryRelationshipId = relationships[0].id
          console.log('🎯 Using primary relationship context:', primaryRelationshipType)
        }
      }
    }
    
    // Update context manager
    if (primaryRelationshipId && relationships.length > 0) {
      const relationship = relationships.find(r => r.id === primaryRelationshipId)
      if (relationship) {
        contextManager.updateCurrentContext(
          user_id,
          relationship.id,
          relationship.relationship_type,
          relationship.name
        )
      }
    }
    
    // Phase 5: Score 4 pillars for smart selection
    console.log('📊 Phase 5: Scoring pillars for smart selection...')
    const pillarScores = await scorePillars(
      journals,
      checkins,
      onboardingData,
      primaryRelationshipType
    )
    
    console.log('📊 Pillar scores:', pillarScores.map(p => `${p.pillar}: ${p.score}`))
    
    // Select top 1-2 pillars with score > 70
    const selectedPillars = pillarScores
      .filter(p => p.score > 70)
      .sort((a, b) => b.score - a.score)
      .slice(0, 2)
    
    if (selectedPillars.length === 0) {
      console.log('⚠️ No pillars met relevance threshold, selecting top pillar')
      selectedPillars.push(pillarScores[0])
    }
    
    console.log('✅ Selected pillars:', selectedPillars.map(p => p.pillar))

    // Generate insights using PHASE 5 smart pillar system + PHASE 3 relationship-aware system
    console.log('🤖 Generating PHASE 5 smart insights with relationship context...')
    const insights = await generateRelationshipAwareInsights(
      patterns, 
      onboardingData, 
      relationshipContext, 
      user_id,
      primaryRelationshipType,
      primaryRelationshipId,
      relationships,
      selectedPillars // Phase 5: Pass selected pillars
    )
    console.log('💡 Enhanced Grok insights generated:', insights.length)
    
    // Save insights to database with relationship context
    console.log('🔍 Saving insights to database...')
    let savedInsights: any[] = []
    
    for (const insight of insights) {
      console.log('💾 Saving insight:', insight.title)

            const { title, description, type, priority, relationship_id } = insight
            const pillar_type = (insight as any).pillar_type || 'appreciation'
            const relevance_score = (insight as any).relevance_score || 80
            const psychological_factors = (insight as any).psychological_factors || {}

      if (
        typeof title !== 'string' ||
        typeof description !== 'string' ||
        typeof type !== 'string' ||
        !title.trim() ||
        !description.trim() ||
        !type.trim()
      ) {
        console.warn('⚠️ Skipping insight due to missing required fields:', {
          title,
          description,
          type,
        })
        continue
      }

      
      const { data, error } = await supabase
        .from('relationship_insights')
        .insert([
          {
            relationship_id: relationship_id || null,
            generated_for_user: user_id,
            insight_type: type,
            pillar_type: pillar_type, // Phase 5: Add pillar type
            title,
            description,
            priority,
            relevance_score: relevance_score, // Phase 5: Add relevance score
            psychological_factors: psychological_factors, // Phase 5: Add psychological factors
            read_status: 'unread', // Phase 5: Use new read state system
            dashboard_dismissed: false, // Phase 5: Not dismissed by default
            is_read: false, // Keep for backward compatibility
          },
        ])
        .select()

      if (error) {
        console.error('❌ Error saving insight:', error)
      } else if (data && data[0]) {
        console.log('✅ Insight saved:', data[0].id)
        savedInsights.push(data[0])
      }
    }

    // Fallback: if no insights were saved, generate basic fallback suggestions
    if (savedInsights.length === 0) {
      console.log('⚠️ No insights saved to database, generating basic fallback insights...')
      const fallbackInsights = generateBasicFallbackInsights(patterns, onboardingData)
      for (const insight of fallbackInsights) {
        const { title, description, type, priority, relationship_id } = insight
        const pillar_type = (insight as any).pillar_type || 'appreciation'
        const relevance_score = (insight as any).relevance_score || 75
        const psychological_factors = (insight as any).psychological_factors || {}
        const { data, error } = await supabase
          .from('relationship_insights')
          .insert([
            {
              relationship_id: relationship_id || null,
              generated_for_user: user_id,
              insight_type: type,
              pillar_type: pillar_type, // Phase 5: Add pillar type
              title,
              description,
              priority,
              relevance_score: relevance_score, // Phase 5: Add relevance score
              psychological_factors: psychological_factors, // Phase 5: Add psychological factors
              read_status: 'unread', // Phase 5: Use new read state system
              dashboard_dismissed: false, // Phase 5: Not dismissed by default
              is_read: false, // Keep for backward compatibility
            },
          ])
          .select()
        if (!error && data && data[0]) {
          savedInsights.push(data[0])
        }
      }
      console.log('✅ Fallback insights generated and saved:', savedInsights.length)
    }

    console.log('✅ Enhanced relationship-aware insights generation complete:', savedInsights.length, 'saved')

    return NextResponse.json({
      success: true,
      insights: savedInsights,
      patterns,
      relationshipContext: {
        hasPartners: relationshipContext.relationships.length > 0,
        partnerCount: relationshipContext.partners.length
      },
      debug: {
        journalCount: journals.length,
        checkinCount: checkins.length,
        relationshipCount: relationshipContext.relationships.length,
        hasOnboarding: !!onboardingData,
        insightsGenerated: insights.length,
        insightsSaved: savedInsights.length
      }
    })

  } catch (error) {
    console.error('❌ Unexpected error in enhanced insights generation:', error)
    return NextResponse.json(
      { 
        error: 'Failed to generate insights', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

async function getRelationshipContext(supabase: any, userId: string) {
  console.log('🔍 Loading relationship context for user:', userId)
  
  try {
    // Get user's relationships
    const { data: relationshipData, error: relationshipError } = await supabase
      .from('relationship_members')
      .select(`
        relationship_id,
        role,
        joined_at,
        relationships (
          id,
          name,
          relationship_type,
          created_by,
          created_at
        )
      `)
      .eq('user_id', userId)

    if (relationshipError) {
      console.error('❌ Error loading relationships:', relationshipError)
      return { relationships: [], partners: [], partnerOnboarding: [] }
    }

    const relationships = relationshipData || []
    console.log('📊 Found relationships:', relationships.length)

    // Get partners in these relationships
    const relationshipIds = relationships.map((r: any) => r.relationship_id)
    const partners: any[] = []
    const partnerOnboarding: any[] = []

    if (relationshipIds.length > 0) {
      // Get partner members (excluding current user)
      const { data: partnerData, error: partnerError } = await supabase
        .from('relationship_members')
        .select(`
          user_id,
          relationship_id,
          role,
          joined_at,
          users (
            id,
            email,
            full_name
          )
        `)
        .in('relationship_id', relationshipIds)
        .neq('user_id', userId)

      if (!partnerError && partnerData) {
        partners.push(...partnerData)
        console.log('👥 Found partners:', partners.length)

        // Get partner onboarding data (for relationship compatibility insights)
        const partnerIds = partners.map(p => p.user_id)
        if (partnerIds.length > 0) {
          const { data: partnerOnboardingData } = await supabase
            .from('onboarding_responses')
            .select('user_id, responses')
            .in('user_id', partnerIds)

          if (partnerOnboardingData) {
            partnerOnboarding.push(...partnerOnboardingData)
            console.log('📝 Found partner onboarding data:', partnerOnboarding.length)
          }
        }
      }
    }

    return {
      relationships: relationships.map((r: any) => r.relationships),
      partners,
      partnerOnboarding
    }
  } catch (error) {
    console.error('❌ Error in getRelationshipContext:', error)
    return { relationships: [], partners: [], partnerOnboarding: [] }
  }
}

function analyzePatterns(journals: any[], checkins: any[], relationshipContext: any, onboarding: any) {
  console.log('📊 Analyzing patterns with relationship context')
  
  // Basic pattern analysis (existing logic)
  const avgMoodFromJournals = journals.length > 0 
    ? journals.reduce((sum, j) => sum + (j.mood_score || 5), 0) / journals.length 
    : 5

  const avgConnectionScore = checkins.length > 0
    ? checkins.reduce((sum, c) => sum + (c.connection_score || 5), 0) / checkins.length
    : 5

  const avgMoodFromCheckins = checkins.length > 0
    ? checkins.reduce((sum, c) => sum + (c.mood_score || 5), 0) / checkins.length
    : 5

  // Relationship-specific analysis
  const relationshipCheckins = checkins.filter(c => c.relationship_id)
  const soloCheckins = checkins.filter(c => !c.relationship_id)

  const avgRelationshipConnection = relationshipCheckins.length > 0
    ? relationshipCheckins.reduce((sum, c) => sum + (c.connection_score || 5), 0) / relationshipCheckins.length
    : null

  // Trend analysis (last 7 days vs previous 7 days)
  const recent = checkins.slice(0, 7)
  const previous = checkins.slice(7, 14)
  
  const recentAvg = recent.length > 0 
    ? recent.reduce((sum, c) => sum + (c.connection_score || 5), 0) / recent.length 
    : avgConnectionScore
    
  const previousAvg = previous.length > 0 
    ? previous.reduce((sum, c) => sum + (c.connection_score || 5), 0) / previous.length 
    : avgConnectionScore

  const trend = recentAvg - previousAvg

  // Gratitude/challenge analysis
  const gratitudeCount = checkins.filter(c => c.gratitude_note?.trim()).length
  const challengeCount = checkins.filter(c => c.challenge_note?.trim()).length

  const recentGratitudes = checkins
    .filter(c => c.gratitude_note?.trim())
    .slice(0, 3)
    .map(c => c.gratitude_note)

  const recentChallenges = checkins
    .filter(c => c.challenge_note?.trim())
    .slice(0, 3)
    .map(c => c.challenge_note)

  // Relationship-specific patterns
  const relationshipStage = getRelationshipStage(relationshipContext, onboarding)
  const hasActivePartnership = relationshipContext.relationships.length > 0
  const partnerCompatibility = { hasData: relationshipContext.partnerOnboarding.length > 0 }

  const patterns = {
    // Basic patterns
    avgMoodFromJournals: Math.round(avgMoodFromJournals * 10) / 10,
    avgConnectionScore: Math.round(avgConnectionScore * 10) / 10,
    avgMoodFromCheckins: Math.round(avgMoodFromCheckins * 10) / 10,
    trend: Math.round(trend * 10) / 10,
    gratitudeCount,
    challengeCount,
    totalJournals: journals.length,
    totalCheckins: checkins.length,
    recentActivity: recent.length,
    recentGratitudes,
    recentChallenges,

    // Relationship-specific patterns
    hasActivePartnership,
    relationshipStage,
    avgRelationshipConnection: avgRelationshipConnection ? Math.round(avgRelationshipConnection * 10) / 10 : null,
    relationshipCheckinsCount: relationshipCheckins.length,
    soloCheckinsCount: soloCheckins.length,
    partnerCompatibility,
    relationshipTypes: relationshipContext.relationships.map((r: any) => r.relationship_type),
    partnerCount: relationshipContext.partners.length
  }

  console.log('📊 Enhanced patterns with relationship context:', patterns)
  return patterns
}

function validatePillarType(type: string): string {
  const validTypes = ['pattern', 'suggestion', 'appreciation', 'milestone']
  return validTypes.includes(type) ? type : 'suggestion'
}

// STEP 2: Replace the getRelationshipStage function in app/api/insights/generate/route.ts
// Replace the getRelationshipStage function in app/api/insights/generate/route.ts

function getRelationshipStage(relationshipContext: any, onboarding: any) {
  if (relationshipContext.relationships.length === 0) return 'single'
  
  console.log('🔍 Calculating relationship stage...')
  
  // Priority order for calculating relationship age:
  // 1. Use anniversary_date from enhanced_onboarding_responses (most accurate)
  // 2. Use relationship_duration_years if available
  // 3. Fall back to created_at (for new users without anniversary data)
  
  let monthsOld = 0;
  let stageSource = 'unknown';
  
  // Check if we have enhanced onboarding data with anniversary
  const onboardingData = onboarding; // Use the passed onboarding data directly
  
console.log('🔍 Onboarding data check:', {
  hasOnboardingData: !!onboardingData,
  anniversaryDate: onboardingData?.anniversary_date,      // ← Correct field name
  durationYears: onboardingData?.relationship_duration_years  // ← Correct field name
});

if (onboardingData?.anniversary_date) {
  // Use the actual anniversary date (MOST ACCURATE)
  const anniversaryDate = new Date(onboardingData.anniversary_date);
  monthsOld = (new Date().getTime() - anniversaryDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
  stageSource = 'anniversary_date';
  console.log('🎯 Using anniversary date for relationship stage:', {
    anniversaryDate: anniversaryDate.toISOString(),
    monthsOld: monthsOld,
    yearsOld: Math.round(monthsOld / 12 * 10) / 10
  });
  
} else if (onboardingData?.relationship_duration_years) {
  // Use manually entered duration (SECOND CHOICE)
  monthsOld = onboardingData.relationship_duration_years * 12;
  stageSource = 'manual_duration';
  console.log('🎯 Using manual duration for relationship stage:', {
    durationYears: onboardingData.relationship_duration_years,
    monthsOld: monthsOld
  });
  }
  
  // Determine stage based on age
  let stage = 'new';
  if (monthsOld < 6) {
    stage = 'new';
  } else if (monthsOld < 24) {
    stage = 'developing';
  } else if (monthsOld < 60) {
    stage = 'established';
  } else {
    stage = 'longterm';
  }
  
  console.log('✅ Relationship stage calculated:', {
    stage: stage,
    monthsOld: Math.round(monthsOld * 10) / 10,
    yearsOld: Math.round(monthsOld / 12 * 10) / 10,
    source: stageSource
  });
  
  return stage;
}

async function generateRelationshipAwareInsights(
  patterns: any, 
  onboarding: any, 
  relationshipContext: any, 
  userId: string,
  primaryRelationshipType: RelationshipType = 'other',
  primaryRelationshipId: string | null = null,
  allRelationships: Array<{id: string, name: string, relationship_type: RelationshipType}> = [],
  selectedPillars: PillarScore[] = [] // Phase 5: Add selected pillars parameter
) {
  console.log('🎯 PHASE 3: Calling relationship-type aware Grok API...')
  console.log('🎯 Primary relationship type:', primaryRelationshipType)
  
  // 🎯 PHASE 3: Create relationship-type aware context
  const context = buildPhase3ContextForGrok(
    patterns, 
    onboarding, 
    relationshipContext, 
    primaryRelationshipType,
    primaryRelationshipId,
    allRelationships,
    userId
  )
  
  try {
    // Call Grok 4 API with PHASE 3 relationship-type awareness
    // Phase 7.1: Use new personality-aware Grok API
    const grokResponse = await callPhase7PersonalityGrokAPI(context, primaryRelationshipType)
    
    if (grokResponse && grokResponse.length > 0) {
      console.log('✅ PHASE 3 Grok returned', grokResponse.length, 'relationship-type aware insights')
      return grokResponse
    } else {
      console.log('⚠️ Phase 3 Grok API returned no insights, falling back to relationship-type aware rule-based')
      return generatePhase3RuleBasedInsights(patterns, onboarding, relationshipContext, primaryRelationshipType)
    }
    
  } catch (error) {
    console.error('❌ Phase 3 Grok API error, falling back to relationship-type aware rule-based:', error)
    return generatePhase3RuleBasedInsights(patterns, onboarding, relationshipContext, primaryRelationshipType)
  }
}

function buildEnhancedContextForGrok(patterns: any, onboarding: any, relationshipContext: any) {
  const context = {
    // User context - FIXED to match actual database schema
    relationshipType: 'couple', // Default since you have relationships
    relationshipDuration: onboarding?.relationship_duration_years || 'unknown',
    livingTogether: true, // Assume true for established relationships
    conflictStyle: onboarding?.conflict_approach || 'unknown',
    stressResponse: onboarding?.stress_response || 'unknown',
    loveLanguageGive: onboarding?.love_language_ranking || [],
    loveLanguageReceive: onboarding?.love_language_ranking || [],
    relationshipGoals: onboarding?.primary_goals || [],
    additionalGoals: onboarding?.specific_challenges || '',
    sharingPreference: onboarding?.expression_directness || 'general',
    communicationStyle: onboarding?.communication_style || 'unknown',
    
    // Current patterns
    avgConnectionScore: patterns.avgConnectionScore,
    avgMoodFromCheckins: patterns.avgMoodFromCheckins,
    trend: patterns.trend,
    gratitudeCount: patterns.gratitudeCount,
    challengeCount: patterns.challengeCount,
    recentGratitudes: patterns.recentGratitudes || [],
    recentChallenges: patterns.recentChallenges || [],
    totalActivity: patterns.totalCheckins + patterns.totalJournals,

    // Relationship-specific context
    hasActivePartnership: patterns.hasActivePartnership,
    relationshipStage: patterns.relationshipStage,
    avgRelationshipConnection: patterns.avgRelationshipConnection,
    relationshipCheckinsCount: patterns.relationshipCheckinsCount,
    soloCheckinsCount: patterns.soloCheckinsCount,
    partnerCount: patterns.partnerCount,
    relationshipTypes: patterns.relationshipTypes,
    partnerCompatibility: patterns.partnerCompatibility
  }
  
  console.log('📋 Built enhanced context with relationship data for Grok:', Object.keys(context))
  console.log('🔍 DEBUG: Onboarding values being used:', {
    communicationStyle: onboarding?.communication_style,
    conflictApproach: onboarding?.conflict_approach,
    loveLanguages: onboarding?.love_language_ranking,
    anniversaryDate: onboarding?.anniversary_date,
    relationshipDuration: onboarding?.relationship_duration_years
  })
  return context
}

async function callEnhancedGrokAPI(context: any) {
  if (!process.env.XAI_API_KEY) {
    console.log('⚠️ No XAI_API_KEY found, skipping Grok API call')
    return null
  }

  function validateAndStructureInsights(insights: any[]) {
  const requiredTypes = ['pattern', 'suggestion', 'appreciation']
  const structuredInsights = []
  
  // Ensure we have one of each required type
  for (const requiredType of requiredTypes) {
    const insight = insights.find(i => i.type === requiredType)
    if (insight) {
      structuredInsights.push(insight)
    } else {
      // Generate fallback if missing
      console.log(`⚠️ Missing ${requiredType} insight, adding fallback`)
      structuredInsights.push(generateFallbackInsight(requiredType))
    }
  }
  
  // Add milestone if present and valid
  const milestoneInsight = insights.find(i => i.type === 'milestone')
  if (milestoneInsight && milestoneInsight.description.length > 50) {
    structuredInsights.push(milestoneInsight)
  }
  
  console.log('🎯 Structured insights distribution:', {
    pattern: structuredInsights.filter(i => i.type === 'pattern').length,
    suggestion: structuredInsights.filter(i => i.type === 'suggestion').length, 
    appreciation: structuredInsights.filter(i => i.type === 'appreciation').length,
    milestone: structuredInsights.filter(i => i.type === 'milestone').length
  })
  
  return structuredInsights
}

function generateFallbackInsight(type: string) {
  const fallbacks = {
    pattern: {
      type: 'pattern',
      priority: 'medium',
      title: 'Relationship Engagement Pattern',
      description: 'Your consistent use of this relationship tracking tool shows a pattern of intentional relationship investment. This proactive approach to relationship health is a positive indicator.'
    },
    suggestion: {
      type: 'suggestion', 
      priority: 'medium',
      title: 'Continue Building Connection',
      description: 'Focus on one small act of connection today - whether it\'s a thoughtful text, a moment of physical affection, or simply asking how your partner\'s day went.'
    },
    appreciation: {
      type: 'appreciation',
      priority: 'low', 
      title: 'Growth Mindset Recognition',
      description: 'Your commitment to relationship growth through tracking and reflection demonstrates emotional maturity and genuine care for your relationship\'s wellbeing.'
    }
  }
  
  return fallbacks[type as keyof typeof fallbacks] || fallbacks.suggestion
}

  // Professional caring therapist prompt for consistent insight generation
  const therapeuticInsightPrompt = `You are a warm, caring relationship therapist who provides professional insights to help people improve their connections. You offer supportive guidance based on relationship psychology while maintaining a friendly, approachable tone.

Here's what you know about this person:
- Connection and belonging are very important to them - relationships matter deeply
- They appreciate having input and influence in situations while being collaborative
- They communicate directly and value honest, straightforward feedback
- They sometimes experience internal conflict in relationships - approach this with gentle understanding
- They're working on their ${context.relationshipType || 'romantic'} relationship

RECENT GRATITUDES they specifically mentioned:
${context.recentGratitudes?.map((g: string) => `"${g}"`).join('\n') || 'None shared recently'}

RECENT CHALLENGES they're facing:
${context.recentChallenges?.map((c: string) => `"${c}"`).join('\n') || 'None mentioned recently'}

CURRENT SITUATION:
- Recent journal analysis showed ${context.avgMoodFromJournals ? `mood averaging ${context.avgMoodFromJournals}/10` : 'mixed feelings'}
- They've been staying engaged with their relationship growth (${context.gratitudeCount || 0} gratitudes, ${context.challengeCount || 0} challenges recently)
- ${context.hasActivePartnership ? 'They have an active partnership' : 'They\'re working on relationships'}

PROFESSIONAL THERAPEUTIC STYLE - Communicate like a warm therapist who:
✅ Uses "I notice..." or "This suggests..." for professional observations
✅ References specific behaviors they mentioned, not raw data
✅ Validates their experience with professional warmth
✅ Provides clear, actionable guidance they can understand
✅ Uses natural, friendly language without being overly casual
✅ Offers practical ideas that respect their direct communication style

❌ NEVER use:
- Pet names like "darling," "sweetheart," "honey"
- Personal reactions like "I'm so touched" or "I love that you"
- Raw scores or metrics ("8/10," "inclusion need 8," etc.)
- Clinical jargon or overly formal language
- Overly familiar phrases that cross professional boundaries

INSIGHT TYPES TO GENERATE:
1. PATTERN insight: Professional observation about their relationship patterns (warm therapeutic insight)
2. SUGGESTION insight: Evidence-based recommendation for their specific situation (supportive guidance)
3. APPRECIATION insight: Recognition of their positive efforts (professional validation with warmth)
4. MILESTONE insight: Only if there's genuine progress to acknowledge (warm professional recognition)

Each insight should:
- Reference specific behaviors or experiences they shared
- Feel relevant and personally meaningful to their situation
- Provide actionable steps that fit their direct communication style
- Come from a place of professional care and expertise

Return valid JSON array with exactly 3-4 insights:
[
  {
    "type": "pattern",
    "priority": "high|medium|low", 
    "title": "Relationship Pattern Insight",
    "description": "Warm, professional observation about their relationship patterns. Start with 'I notice...' or 'This suggests...' and reference specific things they shared. Validate their experience professionally.",
    "relationship_id": null
  },
  {
    "type": "suggestion",
    "priority": "high|medium|low",
    "title": "Growth Opportunity",
    "description": "Practical, supportive recommendation based on their specific situation. Use clear language like 'Consider trying...' or 'Research shows...' that fits their direct communication style.",
    "relationship_id": null
  },
  {
    "type": "appreciation", 
    "priority": "medium|low",
    "title": "Positive Recognition",
    "description": "Warm professional acknowledgment of their efforts. Reference specific positive behaviors with phrases like 'Your commitment to...' or 'This approach shows...'",
    "relationship_id": null
  },
  {
    "type": "milestone",
    "priority": "low", 
    "title": "Progress Recognition",
    "description": "Only include if there's genuine progress to acknowledge. Use warm but professional language about their relationship development.",
    "relationship_id": null
  }
]

Only include the milestone insight if there is genuine progress to celebrate - skip it otherwise.`

  try {
    console.log('🤖 Calling warm friend Grok API with personal context...')
    
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'You are a warm, professional relationship therapist who provides caring insights to help people improve their connections. You maintain a friendly, supportive tone while offering professional guidance based on relationship psychology. Always generate exactly 1 pattern + 1 suggestion + 1 appreciation insight, plus 1 optional milestone. Respond with valid JSON only.'
          },
          {
            role: 'user',
            content: therapeuticInsightPrompt
          }
        ],
        model: 'grok-4',
        temperature: 0.7,
        max_tokens: 1000,
        stream: false
      }),
    })

    if (!response.ok) {
      throw new Error(`Warm Friend Grok API error: ${response.status}`)
    }

    const data = await response.json()
    
    if (data.choices?.[0]?.message?.content) {
      const content = data.choices[0].message.content.trim()
      
      try {
        let jsonContent = content
        if (content.includes('```json')) {
          jsonContent = content.split('```json')[1].split('```')[0].trim()
        } else if (content.includes('[')) {
          const startIndex = content.indexOf('[')
          const endIndex = content.lastIndexOf(']') + 1
          jsonContent = content.substring(startIndex, endIndex)
        }
        
        const insights = JSON.parse(jsonContent)
        
        if (Array.isArray(insights) && insights.length >= 3) {
          console.log('✅ Generated warm friend insights:', insights.length)
          
          // Validate structure: ensure we have pattern, suggestion, appreciation
          const processedInsights = validateAndStructureInsights(insights)
          
          return processedInsights.map((insight: any) => ({
            type: validatePillarType(insight.type),
            priority: insight.priority || 'medium',
            title: insight.title || 'Personal Growth Insight',
            description: insight.description || 'Continue developing your relationship skills.',
            relationship_id: insight.relationship_id || null,
            category: 'warm-friend-grok-generated'
          }))
        }
      } catch (parseError) {
        console.error('❌ Failed to parse warm friend Grok response:', parseError)
        return null
      }
    }
    
    return null
    
  } catch (error) {
    console.error('❌ Warm Friend Grok API call failed:', error)
    throw error
  }
}


function extractInsightsFromText(content: string) {
  const insights = []
  
  if (content.length > 50) {
    insights.push({
      type: 'suggestion',
      priority: 'medium',
      title: 'Enhanced Relationship Insight',
      description: content.substring(0, 300) + (content.length > 300 ? '...' : ''),
      relationship_id: null,
      category: 'enhanced-grok-4-text'
    })
  }
  
  return insights.length > 0 ? insights : null
}

function generateEnhancedRelationshipInsights(patterns: any, onboarding: any, relationshipContext: any) {
  console.log('🔧 Generating Warm Friend Grok rule-based insights')
  
  const insights = []

  // 1. PATTERN INSIGHT - Always generate
  insights.push(generatePatternInsight(patterns, onboarding, relationshipContext))
  
  // 2. ACTION INSIGHT - Always generate  
  insights.push(generateActionInsight(patterns, onboarding, relationshipContext))
  
  // 3. WINS INSIGHT - Always generate
  insights.push(generateWinsInsight(patterns, onboarding, relationshipContext))
  
  // 4. MILESTONE INSIGHT - Only if applicable
  const milestoneInsight = generateMilestoneInsight(patterns, onboarding, relationshipContext)
  if (milestoneInsight) {
    insights.push(milestoneInsight)
  }

  console.log('🔧 Generated structured insights:', {
    total: insights.length,
    types: insights.map(i => i.type)
  })
  
  return insights
}

/**
 * Generate a small set of generic fallback insights when no AI‑powered or structured
 * insights are available. These suggestions are intentionally broad but still
 * personalized based on the user’s primary love language. They give the
 * customer something actionable rather than leaving their dashboard empty.
 */
function generateBasicFallbackInsights(patterns: any, onboarding: any) {
  const primaryLoveLanguage = onboarding?.love_language_ranking?.[0] || 'quality_time'
  const fallbackInsights: any[] = []

  // Normalize love language for messaging
  const prettyLoveLang = primaryLoveLanguage.replace(/_/g, ' ')

  // Generic encouragement pattern insight
  fallbackInsights.push({
    type: 'pattern',
    priority: 'medium',
    title: 'Keep Showing Up',
    description: `We didn’t have quite enough data to identify detailed patterns yet, but just by being here and reflecting you’re already investing in your wellbeing. Keep journaling and checking in — over time you’ll see clearer trends emerge.`,
    relationship_id: null,
    category: 'fallback'
  })

  // Action oriented suggestion based on love language
  fallbackInsights.push({
    type: 'suggestion',
    priority: 'medium',
    title: `A Simple Act of ${prettyLoveLang.charAt(0).toUpperCase() + prettyLoveLang.slice(1)}`,
    description: `Even without detailed insights, you can create connection by leaning into ${prettyLoveLang}. Try one small gesture today — maybe spend a few quality minutes with someone you care about or offer yourself the same kindness and presence.`,
    relationship_id: null,
    category: 'fallback'
  })

  // Appreciation/wins to reinforce progress
  fallbackInsights.push({
    type: 'appreciation',
    priority: 'low',
    title: 'Acknowledge Your Effort',
    description: `Taking time to reflect shows courage and self‑compassion. Celebrate this commitment to yourself — it’s the first step toward deeper connection with others.`,
    relationship_id: null,
    category: 'fallback'
  })

  return fallbackInsights
}

function getLoveLanguageAction(loveLanguage: string): string {
  const actions = {
    physical_touch: 'Plan more hugs, hand-holding, or physical affection moments.',
    quality_time: 'Schedule uninterrupted one-on-one time or meaningful conversations.',
    words_of_affirmation: 'Practice giving specific compliments and expressing appreciation verbally.',
    acts_of_service: 'Look for ways to help with tasks or do something thoughtful.',
    receiving_gifts: 'Consider small, meaningful tokens of appreciation or surprise gestures.'
  }
  return actions[loveLanguage as keyof typeof actions] || 'Focus on expressing care in meaningful ways.'
}

// REPLACE/ADD these specific insight generators:
function generatePatternInsight(patterns: any, onboarding: any, relationshipContext: any) {
  const connectionTrend = patterns.trend > 0 ? 'improving' : patterns.trend < 0 ? 'declining' : 'stable'
  const activityLevel = patterns.totalActivity > 10 ? 'high' : patterns.totalActivity > 5 ? 'moderate' : 'emerging'
  
  return {
    type: 'pattern',
    priority: patterns.avgConnectionScore < 6 ? 'high' : 'medium',
    title: `${connectionTrend.charAt(0).toUpperCase() + connectionTrend.slice(1)} Connection Pattern`,
    description: `You’re noticing ${connectionTrend} connection patterns with an average connection score around ${patterns.avgConnectionScore}/10. ${
      patterns.hasActivePartnership
        ? `In your ${patterns.relationshipStage} relationship you’ve logged ${patterns.relationshipCheckinsCount} couple check‑ins and ${patterns.soloCheckinsCount} personal reflections, which paints a picture of how you’re showing up together and separately.`
        : `You’ve made ${patterns.totalActivity} reflections so far, which is a great start to building self‑awareness.`
    } It’s normal to have ups and downs – keep staying curious about what feels good and what might need extra care.`,
    relationship_id: patterns.hasActivePartnership ? relationshipContext.relationships[0]?.id || null : null,
    category: 'structured-rule-based'
  }
}

function generateActionInsight(patterns: any, onboarding: any, relationshipContext: any) {
  const primaryLoveLanguage = onboarding?.love_language_ranking?.[0] || 'quality_time'
  const communicationStyle = onboarding?.communication_style || 'thoughtful'
  
  if (patterns.hasActivePartnership) {
    return {
      type: 'suggestion',
      priority: patterns.avgConnectionScore < 6 ? 'high' : 'medium',
      title: `Deepen Your Bond Through ${primaryLoveLanguage.replace('_', ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}`,
      description: `Think about carving out intentional ${primaryLoveLanguage.replace('_', ' ')} moments. Maybe plan a cosy date or share a simple activity you both enjoy. Communicating in a ${communicationStyle} way helps both of you feel heard and appreciated. ${getLoveLanguageAction(primaryLoveLanguage)}`,
      relationship_id: relationshipContext.relationships[0]?.id || null,
      category: 'structured-rule-based'
    }
  } else {
    return {
      type: 'suggestion',
      priority: 'medium', 
      title: 'Prepare for Meaningful Connection',
      description: `Practising your ${primaryLoveLanguage.replace('_', ' ')} expression and refining your ${communicationStyle} communication style will prepare you for healthy connection. ${getLoveLanguageAction(primaryLoveLanguage)} These self‑awareness habits build a strong foundation for future relationships.`,
      relationship_id: null,
      category: 'structured-rule-based'
    }
  }
}

function generateWinsInsight(patterns: any, onboarding: any, relationshipContext: any) {
  // Find the best positive pattern to celebrate
  const positives = []
  
  if (patterns.gratitudeCount > 0) {
    positives.push(`${patterns.gratitudeCount} gratitude practices`)
  }
  if (patterns.avgMoodFromCheckins >= 7) {
    positives.push(`maintaining ${patterns.avgMoodFromCheckins}/10 mood scores`)
  }
  if (patterns.totalActivity >= 5) {
    positives.push(`consistent engagement with ${patterns.totalActivity} total entries`)
  }
  if (patterns.trend > 0) {
    positives.push('improving connection trends')
  }
  
  const mainPositive = positives[0] || 'commitment to relationship growth'
  
  return {
    type: 'appreciation',
    priority: 'medium',
    title: 'Celebrate Your Wins', 
    description: `Take a moment to appreciate all the good you’re doing — your ${mainPositive}${positives.length > 1 ? ` and ${positives[1]}` : ''} show that your efforts are paying off. ${
      patterns.hasActivePartnership
        ? 'This positive energy is strengthening your relationship foundation and creating lasting positive patterns.'
        : 'These habits of emotional wellness and self‑awareness will serve you exceptionally well in current and future relationships.'
    } Keep leaning into what feels good.`,
    relationship_id: patterns.hasActivePartnership ? relationshipContext.relationships[0]?.id || null : null,
    category: 'structured-rule-based'
  }
}

function generateMilestoneInsight(patterns: any, onboarding: any, relationshipContext: any) {
  // Only generate if there's a genuine milestone to celebrate
  if (patterns.totalActivity >= 15) {
    return {
      type: 'milestone',
      priority: 'low',
      title: 'You Hit a Big Milestone',
      description: `What an achievement! You’ve logged ${patterns.totalActivity} entries. This level of consistent engagement shows real dedication to growth. ${patterns.hasActivePartnership ? 'Your partnership is soaking up the benefits of your attention and care.' : 'This dedication builds a strong foundation for future relationships.'}`,
      relationship_id: patterns.hasActivePartnership ? relationshipContext.relationships[0]?.id || null : null,
      category: 'structured-rule-based'
    }
  }
  
  if (patterns.trend > 2) {
    return {
      type: 'milestone',
      priority: 'low', 
      title: 'Connection Improvement Milestone',
      description: `Wow! Your connection scores have improved significantly (trend: +${patterns.trend.toFixed(1)}). This shows that your efforts are creating real positive change. Celebrate how far you’ve come and keep building on this momentum.`,
      relationship_id: patterns.hasActivePartnership ? relationshipContext.relationships[0]?.id || null : null,
      category: 'structured-rule-based'
    }
  }
  
  // No milestone if no significant progress
  return null
}

function getStageSpecificAdvice(stage: string, onboarding: any) {
  const loveLanguageGive = onboarding.loveLanguageGive?.[0] || 'words'
  const conflictStyle = onboarding.conflictStyle || 'thoughtful'

  switch (stage) {
    case 'new':
      return {
        type: 'suggestion',
        priority: 'high',
        title: 'New Relationship Foundation',
        description: `In this exciting new phase, focus on building trust and open communication. Since you prefer ${conflictStyle} approaches to conflict and show love through ${loveLanguageGive.replace('_', ' ')}, share these preferences with your partner to build understanding.`,
        relationship_id: null,
        category: 'stage-specific'
      }
    case 'developing':
      return {
        type: 'pattern',
        priority: 'medium',
        title: 'Deepening Your Bond',
        description: `Your relationship is developing beautifully. This is the perfect time to deepen intimacy and navigate your first challenges together. Practice using your ${conflictStyle} conflict style constructively.`,
        relationship_id: null,
        category: 'stage-specific'
      }
    case 'established':
      return {
        type: 'suggestion',
        priority: 'medium',
        title: 'Maintaining Connection',
        description: `In established relationships, it's important to keep growing together. Consider planning regular date nights and continue expressing love through ${loveLanguageGive.replace('_', ' ')} as you both evolve.`,
        relationship_id: null,
        category: 'stage-specific'
      }
    case 'longterm':
      return {
        type: 'appreciation',
        priority: 'medium',
        title: 'Celebrating Your Journey',
        description: `Your long-term relationship is a testament to your commitment. Focus on rekindling romance and celebrating how far you've come together. Your ${conflictStyle} approach to challenges has served you well.`,
        relationship_id: null,
        category: 'stage-specific'
      }
    default:
      return null
  }
}

// ========================================
// 🎯 PHASE 3: RELATIONSHIP-TYPE AWARE FUNCTIONS
// ========================================

function buildPhase3ContextForGrok(
  patterns: any, 
  onboarding: any, 
  relationshipContext: any, 
  primaryRelationshipType: RelationshipType,
  primaryRelationshipId: string | null,
  allRelationships: Array<{id: string, name: string, relationship_type: RelationshipType}>,
  userId: string
) {
  // Get relationship configuration for primary relationship type
  const relationshipConfig = getRelationshipConfig(primaryRelationshipType)
  
  // Build context with relationship-type awareness
  const context = {
    // 🎯 PHASE 3: Relationship type information
    primaryRelationshipType,
    relationshipConfig: {
      displayName: relationshipConfig.displayName,
      emotionalIntensity: relationshipConfig.emotionalIntensity,
      boundaries: relationshipConfig.boundaries,
      toneProfile: relationshipConfig.toneProfile,
      samplePhrases: relationshipConfig.samplePhrases
    },
    
    // User context from v2.0 psychological data
    relationshipType: primaryRelationshipType, // For backward compatibility
    relationshipDuration: onboarding?.relationship_duration_years || 'unknown',
    conflictStyle: onboarding?.conflict_approach || 'unknown',
    stressResponse: onboarding?.stress_response || 'unknown',
    loveLanguageGive: onboarding?.love_language_ranking || [],
    loveLanguageReceive: onboarding?.love_language_ranking || [],
    relationshipGoals: onboarding?.primary_goals || [],
    sharingPreference: onboarding?.expression_directness || 'general',
    communicationStyle: onboarding?.communication_style || 'unknown',
    
    // Current patterns
    avgConnectionScore: patterns.avgConnectionScore,
    avgMoodFromCheckins: patterns.avgMoodFromCheckins,
    trend: patterns.trend,
    gratitudeCount: patterns.gratitudeCount,
    challengeCount: patterns.challengeCount,
    recentGratitudes: patterns.recentGratitudes || [],
    recentChallenges: patterns.recentChallenges || [],
    totalActivity: patterns.totalCheckins + patterns.totalJournals,

    // Multi-relationship context
    hasMultipleRelationships: allRelationships.length > 1,
    allRelationshipTypes: allRelationships.map(r => r.relationship_type),
    relationshipStage: patterns.relationshipStage,
    hasActivePartnership: patterns.hasActivePartnership,
    
    // User ID for memory system
    userId: userId,
    primaryRelationshipId: primaryRelationshipId
  }
  
  console.log('🎯 Built Phase 3 context:', {
    primaryType: primaryRelationshipType,
    emotionalIntensity: relationshipConfig.emotionalIntensity,
    boundaries: Object.keys(relationshipConfig.boundaries).filter(k => relationshipConfig.boundaries[k as keyof typeof relationshipConfig.boundaries]),
    multipleRelationships: context.hasMultipleRelationships
  })
  
  return context
}

// Phase 7.5: Memory-enhanced Grok API with context awareness
async function callPhase7PersonalityGrokAPI(context: any, relationshipType: RelationshipType) {
  if (!process.env.XAI_API_KEY) {
    console.log('⚠️ No XAI_API_KEY found, trying Phase 7.5 context-aware memory system...')
    // Use memory-based AI even without API key
    return await tryMemoryBasedInsights(context, relationshipType, context.userId || '')
  }

  // Build user psychological profile
  const userPsychProfile: UserPsychologicalProfile = {
    firoNeeds: {
      inclusion: context.inclusionNeed || 8,
      control: context.controlNeed || 7,
      affection: context.affectionNeed || 8
    },
    attachmentStyle: context.attachmentStyle || 'disorganized',
    communicationStyle: {
      directness: context.communicationDirectness || 'direct',
      assertiveness: context.communicationAssertiveness || 'assertive'
    },
    loveLanguages: context.loveLanguages || ['quality_time', 'words_of_affirmation']
  }

  // Build relationship context
  const relationshipContext: RelationshipContext = {
    relationshipId: context.primaryRelationshipId || '',
    relationshipType: relationshipType,
    relationshipName: context.relationshipName || `${relationshipType} relationship`,
    partnerName: context.partnerName || 'their connection',
    relationshipLength: context.relationshipLength,
    currentChallenges: context.recentChallenges || [],
    recentPositives: context.recentGratitudes || []
  }

  // Create journal content summary for insights
  const journalContentSummary = `
RECENT ACTIVITY SUMMARY:
- Recent gratitudes: ${context.recentGratitudes?.join('; ') || 'None shared recently'}  
- Recent challenges: ${context.recentChallenges?.join('; ') || 'None mentioned recently'}
- Average mood: ${context.avgMoodFromCheckins || 'mixed'}/10
- Relationship engagement: ${context.gratitudeCount || 0} gratitudes, ${context.challengeCount || 0} challenges
- Partnership status: ${context.hasActivePartnership ? 'Active partnership' : 'Working on relationships'}
`

  // Phase 7.5: Skip memory-first approach, go straight to API if available
  // Memory will be used as context within the API call, not as a replacement
  
  // Use new personality-based prompt builder
  const personalityPrompt = buildInsightsPrompt(
    relationshipType,
    journalContentSummary,
    userPsychProfile,
    relationshipContext
  )

  // Get AI personality for system message
  const personality = getAIPersonality(relationshipType)

  try {
    console.log(`🎯 Phase 7.5: Calling Memory-Enhanced Personality Grok API for ${relationshipType} relationship...`)
    console.log(`📋 Using AI Role: ${personality.role}`)
    
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: `${personality.systemPrompt}

CRITICAL: You are a ${personality.role}. You must maintain this professional role and personality consistently. Never provide guidance outside your specialty area.

RESPONSE FORMAT: Always respond with valid JSON array only - no markdown, no explanations, just the JSON array.

JSON FORMAT REQUIRED:
[
  {
    "type": "pattern",
    "priority": "high|medium|low",
    "title": "Brief insight title",
    "description": "2-3 paragraph insight matching your ${personality.role} expertise and ${personality.communicationStyle.tone} tone"
  }
]`
          },
          {
            role: 'user', 
            content: personalityPrompt
          }
        ],
        model: 'grok-4',
        temperature: 0.7,
        max_tokens: 1500,
        stream: false
      }),
    })

    if (!response.ok) {
      throw new Error(`Phase 7.5 Memory-Enhanced Grok API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    
    if (data.choices?.[0]?.message?.content) {
      const content = data.choices[0].message.content.trim()
      
      try {
        // Clean JSON extraction
        let jsonContent = content
        if (content.includes('```json')) {
          jsonContent = content.split('```json')[1].split('```')[0].trim()
        } else if (content.includes('[')) {
          const startIndex = content.indexOf('[')
          const endIndex = content.lastIndexOf(']') + 1
          jsonContent = content.substring(startIndex, endIndex)
        }
        
        const insights = JSON.parse(jsonContent)
        
        if (Array.isArray(insights) && insights.length >= 3) {
          console.log(`✅ Generated ${insights.length} memory-enhanced personality-aware insights for ${relationshipType}`)
          
          // Phase 7.5: Enhanced validation with memory integration
          const validatedInsights = []
          
          for (const insight of insights) {
            // Content filtering validation
            const contentValidation = filterContent(insight.description || '', relationshipType)
            
            if (!contentValidation.isValid) {
              console.warn(`⚠️ Phase 7.5: Filtered inappropriate content for ${relationshipType}: ${contentValidation.violations.join(', ')}`)
              continue
            }

            // Response requirements validation
            const requirementValidation = validateResponseRequirements(insight.description || '', relationshipType)
            
            if (!requirementValidation.hasRequiredElements) {
              console.warn(`⚠️ Phase 7.5: Insight missing required elements for ${personality.role}: ${requirementValidation.missingElements.join(', ')}`)
              // Continue but note - in production might want to reject or enhance
            }

            // Legacy validation (keep for compatibility)
            const legacyValidation = validateSuggestionForRelationshipType(
              insight.description || '',
              relationshipType
            )
            
            if (!legacyValidation.isValid) {
              console.warn(`⚠️ Phase 7.5: Failed legacy validation: ${legacyValidation.reason}`)
              continue
            }

            validatedInsights.push({
              type: validatePillarType(insight.type),
              priority: insight.priority || 'medium',
              title: insight.title || `${personality.role} Insight`,
              description: contentValidation.filteredContent || insight.description,
              relationship_id: context.primaryRelationshipId,
              category: `phase75-${relationshipType}-memory-enhanced`
            })
          }
          
          console.log(`✅ Phase 7.5: Validated ${validatedInsights.length}/${insights.length} memory-enhanced insights for ${relationshipType}`)
          return validatedInsights
        }
      } catch (parseError) {
        console.error('❌ Phase 7.5: Failed to parse Memory-Enhanced Grok response:', parseError)
        console.error('Raw content:', content)
        return null
      }
    }
    
    return null
    
  } catch (error) {
    console.error('❌ Phase 7.5: Memory-Enhanced Grok API call failed, trying memory fallback:', error)
    return await tryMemoryBasedInsights(context, relationshipType, context.userId || '')
  }
}

// Phase 8: Memory-enhanced insights using database-connected memory system
async function tryMemoryBasedInsights(context: any, relationshipType: RelationshipType, userId: string) {
  try {
    console.log('🧠 Phase 8: Using database-connected memory system for insights...')
    console.log('🔍 User ID for memory system:', userId)
    
    // Import memory integration functions
    const { loadRelationshipMemories, buildMemoryContext, storeMemory } = await import('@/lib/ai/memory-integration')
    const { getAIPersonality } = await import('@/lib/ai/personalities')
    
    // Get supabase client for memory access
    const { createServerClient } = await import('@supabase/ssr')
    const { cookies } = await import('next/headers')
    
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch (error) {
              // Ignore cookie errors in API routes
            }
          },
        },
      }
    )
    
    // Load relationship memories
    const memoryContext = await loadRelationshipMemories(
      supabase,
      userId,
      context.primaryRelationshipId,
      15 // Load 15 most relevant memories
    )
    
    // Build memory-enhanced context
    const memoryPromptAddition = buildMemoryContext(memoryContext, relationshipType)
    
    // Generate rule-based insights enhanced with memory
    const memoryEnhancedInsights = []
    
    // Pattern insight based on memory
    if (memoryContext.importantPatterns.length > 0) {
      const pattern = memoryContext.importantPatterns[0]
      memoryEnhancedInsights.push({
        type: 'pattern',
        priority: 'high',
        title: `Observed Pattern in ${relationshipType} Relationship`,
        description: `${pattern.content}\\n\\nBased on your previous interactions, this pattern suggests focusing on ${getRelationshipSpecificAdvice(relationshipType, pattern.emotional_tone)}.`,
        relationship_id: context.primaryRelationshipId,
        category: `phase8-${relationshipType}-memory-pattern`
      })
    }
    
    // Context-based insight using memory
    if (context.recentGratitudes && context.recentGratitudes.length > 0) {
      const advice = getPersonalityAppropriateAdvice(relationshipType, context, memoryContext)
      memoryEnhancedInsights.push({
        type: 'appreciation',
        priority: 'medium',
        title: `${relationshipType.charAt(0).toUpperCase() + relationshipType.slice(1)} Appreciation Insight`,
        description: advice,
        relationship_id: context.primaryRelationshipId,
        category: `phase8-${relationshipType}-memory-context`
      })
    }
    
    // Store new memories about this interaction
    if (userId && context.primaryRelationshipId) {
      await storeMemory(supabase, userId, {
        relationshipId: context.primaryRelationshipId,
        relationshipType: relationshipType,
        entryType: 'insight',
        content: `Generated memory-enhanced insights based on recent activity patterns`,
        context: { 
          gratitudeCount: context.recentGratitudes?.length || 0,
          challengeCount: context.recentChallenges?.length || 0,
          mood: context.avgMoodFromCheckins
        },
        importance: 'medium',
        emotionalTone: context.avgMoodFromCheckins > 6 ? 'positive' : 'neutral',
        tags: ['insight_generation', relationshipType]
      })
    }
    
    console.log(`✅ Generated ${memoryEnhancedInsights.length} memory-enhanced insights for ${relationshipType}`)
    return memoryEnhancedInsights

  } catch (error) {
    console.error('❌ Memory-based insights failed:', error)
    
    // Fallback to simple rule-based insights
    const fallbackInsights = [{
      type: 'pattern',
      priority: 'medium',
      title: `${relationshipType.charAt(0).toUpperCase() + relationshipType.slice(1)} Insight`,
      description: `Based on your recent activity, continue focusing on positive communication and connection in your ${relationshipType} relationship.`,
      relationship_id: context.primaryRelationshipId,
      category: `phase8-${relationshipType}-fallback`
    }]
    
    return fallbackInsights
  }
}

// Helper functions for memory-enhanced insights
function getRelationshipSpecificAdvice(relationshipType: RelationshipType, emotionalTone: string) {
  switch (relationshipType) {
    case 'romantic':
      return emotionalTone === 'positive' ? 'building on this positive momentum with deeper intimacy' : 'gentle communication to address underlying concerns'
    case 'work':
      return emotionalTone === 'positive' ? 'maintaining professional collaboration while respecting boundaries' : 'clear, professional communication to resolve workplace issues'
    case 'family':
      return emotionalTone === 'positive' ? 'strengthening family bonds while respecting individual boundaries' : 'diplomatic communication that honors family relationships'
    case 'friend':
      return emotionalTone === 'positive' ? 'enjoying shared activities and mutual support' : 'honest but supportive conversation about friendship needs'
    default:
      return 'maintaining healthy communication and mutual respect'
  }
}

function getPersonalityAppropriateAdvice(relationshipType: RelationshipType, context: any, memoryContext: any) {
  const recentGratitude = context.recentGratitudes?.[0] || 'positive interactions'
  
  switch (relationshipType) {
    case 'romantic':
      return `Your recent appreciation for "${recentGratitude}" shows the deep care in your relationship. Consider expressing this gratitude directly to your partner - it strengthens emotional connection and intimacy. ${memoryContext.preferences.length > 0 ? `Based on what I remember about your preferences, this aligns with your values.` : ''}`
    case 'work':
      return `Your recognition of "${recentGratitude}" demonstrates professional awareness. Consider acknowledging this contribution in an appropriate professional setting - it builds positive workplace relationships while maintaining boundaries.`
    case 'family':
      return `Your gratitude for "${recentGratitude}" reflects the value you place on family connections. Sharing this appreciation can strengthen family bonds while respecting each person's individual space and perspective.`
    case 'friend':
      return `Your appreciation for "${recentGratitude}" shows how much this friendship means to you! Consider letting your friend know - genuine appreciation is the foundation of lasting friendships.`
    default:
      return `Your recognition of "${recentGratitude}" shows positive relationship awareness. Consider expressing this appreciation in a way that's appropriate for your relationship dynamic.`
  }
}

function generatePhase3BasePrompt(context: any, config: any): string {
  return `You're talking to someone you really care about about their ${config.displayName.toLowerCase()} relationship. Based on what they've shared recently, offer ${config.emotionalIntensity} intensity insights that respect the boundaries and expectations of this relationship type.

Here's what you know about them:
- They value connection deeply and like being included
- They prefer having some say in how things go, but they're not controlling about it
- They communicate directly and assertively - they appreciate honest, straightforward feedback
- They have some internal conflict in relationships - be gentle and understanding about relationship struggles
- This is their ${context.primaryRelationshipType} relationship

RECENT GRATITUDES they specifically mentioned:
${context.recentGratitudes?.map((g: string) => `"${g}"`).join('\n') || 'None shared recently'}

RECENT CHALLENGES they're facing:
${context.recentChallenges?.map((c: string) => `"${c}"`).join('\n') || 'None mentioned recently'}

CURRENT SITUATION:
- Recent mood averaging ${context.avgMoodFromCheckins || 'mixed'}/10
- They've been staying engaged with their relationship growth (${context.gratitudeCount || 0} gratitudes, ${context.challengeCount || 0} challenges recently)
- ${context.hasActivePartnership ? 'They have an active partnership' : 'They\'re working on relationships'}

RELATIONSHIP-SPECIFIC GUIDANCE:
- Emotional intensity: ${config.emotionalIntensity}
- Appropriate tone: ${config.samplePhrases.greeting}
- Validation style: ${config.samplePhrases.validation}
- Suggestion style: ${config.samplePhrases.suggestion}
- Appreciation style: ${config.samplePhrases.appreciation}

INSIGHT TYPES TO GENERATE:
1. PATTERN insight: Something you noticed about their recent sharing (${config.emotionalIntensity} intensity observation)
2. SUGGESTION insight: Practical idea based on their specific challenges (respectful of ${context.primaryRelationshipType} boundaries)
3. APPRECIATION insight: Acknowledge something positive they're doing (appropriate for ${context.primaryRelationshipType} context)
4. MILESTONE insight: Only if there's genuine progress to celebrate

Each insight should:
- Reference something specific they mentioned
- Feel personal and relevant to their ${context.primaryRelationshipType} relationship
- Respect ${context.primaryRelationshipType} boundaries and expectations
- Sound like advice from someone who understands this relationship type

Return valid JSON array with exactly 3-4 insights:
[
  {
    "type": "pattern",
    "priority": "high|medium|low", 
    "title": "Relationship-appropriate title",
    "description": "Warm, appropriate observation that respects ${context.primaryRelationshipType} relationship boundaries",
    "relationship_id": null
  }
]`
}

function generatePhase3RuleBasedInsights(
  patterns: any, 
  onboarding: any, 
  relationshipContext: any, 
  relationshipType: RelationshipType
) {
  console.log('🎯 Generating Phase 3 rule-based insights for:', relationshipType)
  
  const config = getRelationshipConfig(relationshipType)
  const appropriateTypes = getAppropriateInsightTypes(relationshipType)
  const insights = []

  // Generate pattern insight (always appropriate)
  insights.push(generatePhase3PatternInsight(patterns, config, relationshipType))
  
  // Generate suggestion insight if appropriate
  if (appropriateTypes.suggestion) {
    insights.push(generatePhase3SuggestionInsight(patterns, onboarding, config, relationshipType))
  }
  
  // Generate appreciation insight if appropriate
  if (appropriateTypes.appreciation) {
    insights.push(generatePhase3AppreciationInsight(patterns, config, relationshipType))
  }
  
  // Generate milestone insight if appropriate and warranted
  if (appropriateTypes.milestone && patterns.totalActivity >= 15) {
    insights.push(generatePhase3MilestoneInsight(patterns, config, relationshipType))
  }

  console.log(`✅ Generated ${insights.length} Phase 3 rule-based insights for ${relationshipType}`)
  
  return insights
}

function generatePhase3PatternInsight(patterns: any, config: any, relationshipType: RelationshipType) {
  const connectionTrend = patterns.trend > 0 ? 'improving' : patterns.trend < 0 ? 'declining' : 'stable'
  
  const descriptions = {
    romantic: `I notice your connection patterns are ${connectionTrend} with an average score around ${patterns.avgConnectionScore}/10. Your intimate relationship shows ${patterns.relationshipCheckinsCount} couple reflections and ${patterns.soloCheckinsCount} personal ones - this balance of togetherness and individual growth is really healthy for romantic partnerships.`,
    
    family: `I see ${connectionTrend} patterns in your family dynamics with connection scores around ${patterns.avgConnectionScore}/10. Family relationships can be complex, and your ${patterns.totalActivity} reflections show real commitment to understanding these important bonds.`,
    
    friend: `Your friendship patterns show ${connectionTrend} connection trends averaging ${patterns.avgConnectionScore}/10. It's awesome that you're putting ${patterns.totalActivity} entries worth of thought into your friendships - that level of intentionality is rare and valuable.`,
    
    work: `Your professional relationship patterns indicate ${connectionTrend} dynamics with scores around ${patterns.avgConnectionScore}/10. Your ${patterns.totalActivity} workplace relationship reflections demonstrate strong professional development awareness.`,
    
    other: `I notice ${connectionTrend} connection patterns with an average score of ${patterns.avgConnectionScore}/10. Your ${patterns.totalActivity} reflections show thoughtful investment in this relationship.`
  }
  
  return {
    type: 'pattern',
    priority: patterns.avgConnectionScore < 6 ? 'high' : 'medium',
    title: `${connectionTrend.charAt(0).toUpperCase() + connectionTrend.slice(1)} ${config.displayName} Pattern`,
    description: descriptions[relationshipType],
    relationship_id: null,
    category: `phase3-${relationshipType}-rule-based`
  }
}

function generatePhase3SuggestionInsight(patterns: any, onboarding: any, config: any, relationshipType: RelationshipType) {
  const primaryLoveLanguage = onboarding?.love_language_ranking?.[0] || 'quality_time'
  const adjustedLanguage = adjustLoveLanguageForRelationshipType(primaryLoveLanguage, relationshipType)
  
  const suggestions = {
    romantic: `Think about creating special moments focused on ${adjustedLanguage}. Maybe plan something intimate and meaningful that shows how much you care about your connection together.`,
    
    family: `Consider reaching out with ${adjustedLanguage} in mind. Family relationships thrive when we show care while respecting boundaries - maybe a thoughtful check-in or gesture that honors your family bond.`,
    
    friend: `What if you planned something fun around ${adjustedLanguage}? Friendships grow through shared experiences and genuine care without pressure - keep it light and enjoyable.`,
    
    work: `Focus on ${adjustedLanguage} within professional boundaries. Strong workplace relationships are built on mutual respect, clear communication, and collaborative support.`,
    
    other: `Consider expressing care through ${adjustedLanguage} in a way that feels authentic for this relationship. Every connection benefits from thoughtful attention and appropriate care.`
  }
  
  return {
    type: 'suggestion',
    priority: patterns.avgConnectionScore < 6 ? 'high' : 'medium',
    title: `Strengthen Your ${config.displayName} Bond`,
    description: suggestions[relationshipType],
    relationship_id: null,
    category: `phase3-${relationshipType}-rule-based`
  }
}

function generatePhase3AppreciationInsight(patterns: any, config: any, relationshipType: RelationshipType) {
  const appreciations = {
    romantic: `The way you're showing up for your romantic relationship is beautiful. Your ${patterns.gratitudeCount} gratitude practices and commitment to growth shows real love and dedication to your partner.`,
    
    family: `Your thoughtful approach to family relationships is admirable. Working on family dynamics takes courage and wisdom - your ${patterns.totalActivity} reflections show genuine care for these important bonds.`,
    
    friend: `Your friends are so lucky to have someone who thinks this deeply about friendships! Your ${patterns.gratitudeCount} gratitude moments and ongoing reflection show what a thoughtful friend you are.`,
    
    work: `Your commitment to maintaining positive professional relationships is commendable. Your ${patterns.totalActivity} workplace reflections demonstrate strong emotional intelligence and career wisdom.`,
    
    other: `Your intentionality about this relationship is really valuable. Taking time for ${patterns.totalActivity} reflections shows genuine care and commitment to healthy connections.`
  }
  
  return {
    type: 'appreciation',
    priority: 'medium',
    title: `Celebrate Your ${config.displayName} Growth`,
    description: appreciations[relationshipType],
    relationship_id: null,
    category: `phase3-${relationshipType}-rule-based`
  }
}

function generatePhase3MilestoneInsight(patterns: any, config: any, relationshipType: RelationshipType) {
  const milestones = {
    romantic: `What an incredible milestone! You've logged ${patterns.totalActivity} entries about your romantic relationship. This level of dedication and reflection is creating a foundation for lasting love and intimacy.`,
    
    family: `This is worth celebrating! Your ${patterns.totalActivity} family relationship reflections represent real commitment to healthy family dynamics. This emotional work strengthens your entire family system.`,
    
    friend: `Wow, ${patterns.totalActivity} entries about friendship - that's awesome! Your dedication to being a thoughtful friend is creating stronger, more meaningful connections that will last.`,
    
    work: `Professional milestone achieved! Your ${patterns.totalActivity} workplace relationship reflections demonstrate exceptional emotional intelligence and leadership development.`,
    
    other: `Milestone reached! Your ${patterns.totalActivity} reflections about this relationship show remarkable commitment to healthy connections and personal growth.`
  }
  
  return {
    type: 'milestone',
    priority: 'low',
    title: `${config.displayName} Milestone Achieved`,
    description: milestones[relationshipType],
    relationship_id: null,
    category: `phase3-${relationshipType}-rule-based`
  }
}

// Phase 5: Score each pillar's relevance based on current context
async function scorePillars(
  journals: any[],
  checkins: any[],
  profile: any,
  relationshipType: RelationshipType
): Promise<PillarScore[]> {
  
  const scores: PillarScore[] = []
  
  // Analyze content for patterns, issues, and achievements
  // Combine journal content and checkin notes for analysis
  const journalContent = journals?.map(j => j.content || '').filter(Boolean).join(' ') || ''
  const checkinContent = checkins?.map(c => 
    `${c.gratitude_note || ''} ${c.challenge_note || ''}`
  ).filter(Boolean).join(' ') || ''
  const recentContent = `${journalContent} ${checkinContent}`
  
  const recentMoods = journals?.map(j => j.mood_score).filter(Boolean) || []
  const avgMood = recentMoods.length > 0 ? 
    recentMoods.reduce((a, b) => a + b, 0) / recentMoods.length : 5
  
  // Pattern Recognition Scoring
  let patternScore = 0
  let patternContent = ''
  
  // Check for repetitive themes or behaviors
  if (recentContent && (recentContent.includes('again') || recentContent.includes('always') || recentContent.includes('never'))) {
    patternScore += 40
    patternContent = 'Behavioral patterns found'
  }
  
  // Check for mood patterns
  if (recentMoods.length > 3) {
    const moodVariance = Math.max(...recentMoods) - Math.min(...recentMoods)
    if (moodVariance > 3) {
      patternScore += 30
      patternContent += ' Mood fluctuation pattern'
    }
  }
  
  // Fallback: If no content, use activity patterns
  if (patternScore === 0) {
    if (checkins?.length > 5 || journals?.length > 3) {
      patternScore = 75 // Default score for consistent activity
      patternContent = 'Consistent engagement pattern'
    }
  }
  
  scores.push({
    pillar: 'pattern',
    score: Math.min(patternScore, 100),
    relevantContent: patternContent || 'Regular activity patterns'
  })
  
  // Growth Suggestions Scoring
  let growthScore = 0
  let growthContent = ''
  
  // Check for challenges or struggles
  if (recentContent && recentContent.match(/struggle|difficult|hard|challenge|problem|issue/gi)) {
    growthScore += 40
    growthContent = 'Challenges present, growth opportunity identified'
  }
  
  // Check for questions or uncertainty
  if (recentContent && (recentContent.includes('?') || recentContent.match(/don't know|unsure|confused/gi))) {
    growthScore += 30
    growthContent += ' Seeking guidance'
  }
  
  // Check if stuck in patterns (high FIRO needs not being met)
  if (profile?.inclusion_need > 7 && recentContent && recentContent.match(/alone|isolated|disconnected/gi)) {
    growthScore += 30
    growthContent += ' Inclusion needs unmet'
  }
  
  // Fallback: Always some growth opportunity
  if (growthScore === 0) {
    growthScore = 70 // Default score for growth opportunities
    growthContent = 'Continuous growth opportunities available'
  }
  
  scores.push({
    pillar: 'growth',
    score: Math.min(growthScore, 100),
    relevantContent: growthContent || 'Growth and development focus'
  })
  
  // Appreciation/Context Scoring
  let appreciationScore = 0
  let appreciationContent = ''
  
  // Check for self-criticism
  if (recentContent && recentContent.match(/should have|failed|mistake|wrong|bad at/gi)) {
    appreciationScore += 50
    appreciationContent = 'Self-criticism detected, reframing needed'
  }
  
  // Check for unrecognized efforts
  if (recentContent && recentContent.match(/tried|effort|worked on|attempted/gi)) {
    appreciationScore += 30
    appreciationContent += ' Efforts need acknowledgment'
  }
  
  // Fallback: Always appreciate engagement
  if (appreciationScore === 0) {
    appreciationScore = 80 // Default score for appreciation
    appreciationContent = 'Engagement and commitment deserve recognition'
  }
  
  scores.push({
    pillar: 'appreciation',
    score: Math.min(appreciationScore, 100),
    relevantContent: appreciationContent || 'Positive reinforcement opportunity'
  })
  
  // Milestone Celebrations Scoring
  let milestoneScore = 0
  let milestoneContent = ''
  
  // Check for achievements or progress
  if (recentContent && recentContent.match(/finally|achieved|succeeded|managed to|proud|happy|better/gi)) {
    milestoneScore += 60
    milestoneContent = 'Achievement detected'
  }
  
  // Check for relationship progress
  if (recentContent && recentContent.match(/closer|connected|understood|breakthrough|progress/gi)) {
    milestoneScore += 40
    milestoneContent += ' Relationship progress made'
  }
  
  // Check for consistency milestones
  if (milestoneScore === 0 && (checkins?.length >= 7 || journals?.length >= 5)) {
    milestoneScore = 50 // Milestone for consistent tracking
    milestoneContent = 'Consistency milestone'
  }
  
  scores.push({
    pillar: 'milestone',
    score: Math.min(milestoneScore, 100),
    relevantContent: milestoneContent || 'Progress tracking'
  })
  
  console.log('📊 Pillar scoring complete:', scores.map(s => `${s.pillar}: ${s.score}`))
  
  return scores
}