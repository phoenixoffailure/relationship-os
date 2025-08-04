// Enhanced Grok API with relationship context
// Replace your existing app/api/insights/generate/route.ts with this enhanced version

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { getPillarConfig, formatPillarTitle } from '@/lib/insights/pillar-helpers'

export async function POST(request: Request) {
  console.log('🔍 Starting enhanced Grok insights generation with relationship context...')
  
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
    console.log('🔍 Fetching onboarding data...')
    const { data: onboardingData } = await supabase
      .from('enhanced_onboarding_responses')  // ← CORRECT TABLE
      .select('*')  // ← Get all fields, not just 'responses'
      .eq('user_id', user_id)
      .single()

    // Get user's recent activity data
    console.log('🔍 Fetching user activity data...')
    const [journalResponse, checkinResponse] = await Promise.all([
      supabase
        .from('journal_entries')
        .select('mood_score, created_at')
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
    const onboarding = onboardingData || {}

    console.log('📈 Data summary:', {
      journals: journals.length,
      checkins: checkins.length,
      relationships: relationshipContext.relationships.length,
      hasOnboarding: !!onboardingData
    })
    //Auth
    const { data: { user } } = await supabase.auth.getUser()
    console.log('🔍 DEBUG auth.uid():', user?.id)

    // Analyze patterns from user data with relationship context
    const patterns = analyzePatterns(journals, checkins, relationshipContext, onboarding)
    console.log('📊 Patterns analyzed with relationship context:', patterns)
    
    // Generate insights using enhanced Grok with relationship awareness
    console.log('🤖 Generating relationship-aware Grok insights...')
    const insights = await generateRelationshipAwareInsights(patterns, onboarding, relationshipContext, user_id)
    console.log('💡 Enhanced Grok insights generated:', insights.length)
    
    // Save insights to database with relationship context
    console.log('🔍 Saving insights to database...')
    let savedInsights: any[] = []
    
    for (const insight of insights) {
      console.log('💾 Saving insight:', insight.title)

            const { title, description, type, priority, relationship_id } = insight

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
            title,
            description,
            priority,
            is_read: false,
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
      const fallbackInsights = generateBasicFallbackInsights(patterns, onboarding)
      for (const insight of fallbackInsights) {
        const { title, description, type, priority, relationship_id } = insight
        const { data, error } = await supabase
          .from('relationship_insights')
          .insert([
            {
              relationship_id: relationship_id || null,
              generated_for_user: user_id,
              insight_type: type,
              title,
              description,
              priority,
              is_read: false,
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

async function generateRelationshipAwareInsights(patterns: any, onboarding: any, relationshipContext: any, userId: string) {
  console.log('🤖 Calling enhanced Grok API with relationship context...')
  
  // Create rich context for Grok including relationship data
  const context = buildEnhancedContextForGrok(patterns, onboarding, relationshipContext)
  
  try {
    // Call Grok 4 API with enhanced context
    const grokResponse = await callEnhancedGrokAPI(context)
    
    if (grokResponse && grokResponse.length > 0) {
      console.log('✅ Enhanced Grok returned', grokResponse.length, 'relationship-aware insights')
      return grokResponse
    } else {
      console.log('⚠️ Grok API returned no insights, falling back to enhanced rule-based')
      return generateEnhancedRelationshipInsights(patterns, onboarding, relationshipContext)
    }
    
  } catch (error) {
    console.error('❌ Enhanced Grok API error, falling back to relationship-aware rule-based:', error)
    return generateEnhancedRelationshipInsights(patterns, onboarding, relationshipContext)
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

  // Structured 3+1 prompt for consistent insight generation
  const structuredPrompt = `You are an expert relationship coach AI. Generate exactly 3 core insights plus 1 optional milestone insight based on the user's data.

USER & RELATIONSHIP CONTEXT:
- Relationship stage: ${context.relationshipStage}
- Partnership status: ${context.hasActivePartnership ? 'Partnered' : 'Single'}
- Communication style: ${context.conflictStyle} conflict approach
- Love languages: Give ${context.loveLanguageGive?.join(' & ') || 'unknown'} | Receive ${context.loveLanguageReceive?.join(' & ') || 'unknown'}
- Connection score: ${context.avgConnectionScore}/10 (trend: ${context.trend > 0 ? 'improving' : context.trend < 0 ? 'declining' : 'stable'})
- Mood: ${context.avgMoodFromCheckins}/10
- Activity: ${context.totalActivity} entries, ${context.gratitudeCount} gratitudes, ${context.challengeCount} challenges

REQUIRED STRUCTURE - Generate exactly these 3 insights + 1 optional:

1. PATTERN INSIGHT (type: "pattern") - REQUIRED
   - Analyze their relationship data patterns and trends
   - Reference their connection scores, mood trends, or behavioral patterns
   - Focus on "what's happening" - objective observation

2. ACTION INSIGHT (type: "suggestion") - REQUIRED  
   - Specific actionable step for improvement
   - Reference their love languages and communication style
   - Focus on "what to do" - concrete next steps

3. WINS INSIGHT (type: "appreciation") - REQUIRED
   - Recognize positive patterns and strengths
   - Celebrate what's working well in their relationship/personal growth
   - Focus on "what's working" - positive reinforcement

4. MILESTONE INSIGHT (type: "milestone") - ONLY IF APPLICABLE
   - Include ONLY if they have significant progress to celebrate
   - Examples: consistent tracking, improvement trends, relationship anniversaries
   - Skip this if no clear milestone exists

Generate insights that consider their ${context.relationshipStage} relationship stage and ${context.hasActivePartnership ? 'partnered' : 'single'} status.

Return valid JSON array with exactly 3-4 insights:
[
  {
    "type": "pattern",
    "priority": "high|medium|low",
    "title": "Brief pattern analysis title",
    "description": "Data-driven insight about their relationship patterns",
    "relationship_id": null
  },
  {
    "type": "suggestion", 
    "priority": "high|medium|low",
    "title": "Specific action step title",
    "description": "Actionable recommendation considering their context",
    "relationship_id": null
  },
  {
    "type": "appreciation",
    "priority": "medium|low",
    "title": "Positive recognition title", 
    "description": "Celebration of their strengths and positive patterns",
    "relationship_id": null
  },
  {
    "type": "milestone",
    "priority": "low",
    "title": "Progress celebration title",
    "description": "Recognition of significant progress or achievement",
    "relationship_id": null
  }
]

Only include the milestone insight if there is genuine progress to celebrate.`

  try {
    console.log('🤖 Calling structured 3+1 pillar Grok API...')
    
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
            content: 'You are a professional relationship coach specializing in structured insight delivery. Always generate exactly 1 pattern + 1 action + 1 wins insight, plus 1 optional milestone. Respond with valid JSON only.'
          },
          {
            role: 'user',
            content: structuredPrompt
          }
        ],
        model: 'grok-4',
        temperature: 0.7,
        max_tokens: 1000,
        stream: false
      }),
    })

    if (!response.ok) {
      throw new Error(`Structured Grok API error: ${response.status}`)
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
          console.log('✅ Generated structured 3+1 insights:', insights.length)
          
          // Validate structure: ensure we have pattern, suggestion, appreciation
          const processedInsights = validateAndStructureInsights(insights)
          
          return processedInsights.map((insight: any) => ({
            type: validatePillarType(insight.type),
            priority: insight.priority || 'medium',
            title: insight.title || 'Personal Growth Insight',
            description: insight.description || 'Continue developing your relationship skills.',
            relationship_id: insight.relationship_id || null,
            category: 'structured-grok-generated'
          }))
        }
      } catch (parseError) {
        console.error('❌ Failed to parse structured Grok response:', parseError)
        return null
      }
    }
    
    return null
    
  } catch (error) {
    console.error('❌ Structured Grok API call failed:', error)
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
  console.log('🔧 Generating structured 3+1 rule-based insights')
  
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