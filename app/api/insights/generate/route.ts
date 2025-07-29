// Enhanced Grok API with relationship context
// Replace your existing app/api/insights/generate/route.ts with this enhanced version

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  console.log('🔍 Starting enhanced Grok insights generation with relationship context...')
  
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('❌ Auth error:', authError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    console.log('✅ User found:', user.id)

    // Get user's relationships and partner data
    console.log('🔍 Fetching relationship context...')
    const relationshipContext = await getRelationshipContext(supabase, user.id)
    
    // Get user's onboarding responses for rich context
    console.log('🔍 Fetching onboarding data...')
    const { data: onboardingData } = await supabase
      .from('enhanced_onboarding_responses')  // ← CORRECT TABLE
      .select('*')  // ← Get all fields, not just 'responses'
      .eq('user_id', user.id)
      .single()

    // Get user's recent activity data
    console.log('🔍 Fetching user activity data...')
    const [journalResponse, checkinResponse] = await Promise.all([
      supabase
        .from('journal_entries')
        .select('mood_score, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10),
      
      supabase
        .from('daily_checkins')
        .select('connection_score, mood_score, created_at, gratitude_note, challenge_note, relationship_id')
        .eq('user_id', user.id)
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

    // Analyze patterns from user data with relationship context
    const patterns = analyzePatterns(journals, checkins, relationshipContext, onboarding)
    console.log('📊 Patterns analyzed with relationship context:', patterns)
    
    // Generate insights using enhanced Grok with relationship awareness
    console.log('🤖 Generating relationship-aware Grok insights...')
    const insights = await generateRelationshipAwareInsights(patterns, onboarding, relationshipContext, user.id)
    console.log('💡 Enhanced Grok insights generated:', insights.length)
    
    // Save insights to database with relationship context
    console.log('🔍 Saving insights to database...')
    const savedInsights = []
    
    for (const insight of insights) {
      console.log('💾 Saving insight:', insight.title)
      
      const { data, error } = await supabase
        .from('relationship_insights')
        .insert([{
          relationship_id: insight.relationship_id || null,
          generated_for_user: user.id,
          insight_type: insight.type,
          title: insight.title,
          description: insight.description,
          priority: insight.priority,
          is_read: false
        }])
        .select()

      if (error) {
        console.error('❌ Error saving insight:', error)
      } else if (data && data[0]) {
        console.log('✅ Insight saved:', data[0].id)
        savedInsights.push(data[0])
      }
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

  const relationshipAwarePrompt = `You are an expert relationship coach AI analyzing user data to provide personalized insights. Based on the following relationship context and patterns, generate 2-4 specific, actionable insights that consider their relationship status and partner dynamics.

USER & RELATIONSHIP CONTEXT:
- Relationship stage: ${context.relationshipStage}
- Has active partnership: ${context.hasActivePartnership}
- Partner count: ${context.partnerCount}
- Relationship types: ${context.relationshipTypes?.join(', ') || 'none'}
- Communication style: ${context.conflictStyle} conflict approach, ${context.stressResponse} when stressed
- Shows love through: ${context.loveLanguageGive?.join(' and ') || 'unknown'}
- Receives love through: ${context.loveLanguageReceive?.join(' and ') || 'unknown'}
- Primary goals: ${context.relationshipGoals?.join(', ') || 'general improvement'}
${context.additionalGoals ? `- Additional focus: ${context.additionalGoals}` : ''}

CURRENT PATTERNS & ACTIVITY:
- Overall connection score: ${context.avgConnectionScore}/10 (recent trend: ${context.trend > 0 ? 'improving' : context.trend < 0 ? 'declining' : 'stable'})
- Relationship-specific connection: ${context.avgRelationshipConnection ? `${context.avgRelationshipConnection}/10` : 'not tracked'}
- Average mood: ${context.avgMoodFromCheckins}/10
- Relationship check-ins: ${context.relationshipCheckinsCount} | Solo check-ins: ${context.soloCheckinsCount}
- Recent gratitudes: ${context.recentGratitudes?.length || 0} noted
- Recent challenges: ${context.recentChallenges?.length || 0} noted
- Total activity: ${context.totalActivity} entries

RELATIONSHIP STAGE GUIDANCE:
${context.relationshipStage === 'single' ? '- Focus on self-development and preparing for future relationships' : ''}
${context.relationshipStage === 'new' ? '- Focus on building trust, establishing communication patterns, and learning about each other' : ''}
${context.relationshipStage === 'developing' ? '- Focus on deepening intimacy, navigating conflicts constructively, and aligning future goals' : ''}
${context.relationshipStage === 'established' ? '- Focus on maintaining connection, managing routine, and continuing growth together' : ''}
${context.relationshipStage === 'longterm' ? '- Focus on rekindling romance, navigating life changes, and celebrating your journey together' : ''}

Generate personalized insights that:
1. Consider their specific relationship stage and partnership status
2. Reference their communication style and love languages
3. Address their stated relationship goals
4. Are actionable and specific (not generic advice)
5. Consider their current patterns and mood trends
6. If they have partners, suggest ways to strengthen the partnership
7. If they're single, focus on self-development and relationship readiness

Return only a JSON array of 2-4 insights with this exact structure:
[
  {
    "type": "suggestion|appreciation|milestone|pattern",
    "priority": "high|medium|low", 
    "title": "Brief descriptive title",
    "description": "Specific actionable insight considering their relationship status and preferences",
    "relationship_id": null
  }
]`

  try {
    console.log('🤖 Calling enhanced xAI Grok API with relationship context...')
    
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
            content: 'You are a professional relationship coach with expertise in couples therapy, attachment theory, and relationship dynamics. Always respond with valid JSON only. Be specific and reference the user\'s relationship stage, communication style, and love languages in your insights.'
          },
          {
            role: 'user',
            content: relationshipAwarePrompt
          }
        ],
        model: 'grok-4',
        temperature: 0.8,
        max_tokens: 1200,
        stream: false
      }),
    })

    console.log('📡 Enhanced API Response status:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Enhanced Grok API error response:', errorText)
      throw new Error(`Enhanced Grok API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    console.log('🤖 Enhanced Grok API response received successfully')
    
    if (data.choices && data.choices[0] && data.choices[0].message) {
      const content = data.choices[0].message.content.trim()
      console.log('📝 Raw enhanced Grok response:', content.substring(0, 300) + '...')
      
      try {
        // Clean and parse the response
        let jsonContent = content
        if (content.includes('```json')) {
          jsonContent = content.split('```json')[1].split('```')[0].trim()
        } else if (content.includes('```')) {
          jsonContent = content.split('```')[1].split('```')[0].trim()
        } else if (content.includes('[')) {
          const startIndex = content.indexOf('[')
          const endIndex = content.lastIndexOf(']') + 1
          jsonContent = content.substring(startIndex, endIndex)
        }
        
        console.log('🔧 Cleaned enhanced JSON content:', jsonContent.substring(0, 200) + '...')
        
        const insights = JSON.parse(jsonContent)
        
        if (Array.isArray(insights) && insights.length > 0) {
          console.log('✅ Successfully parsed', insights.length, 'enhanced relationship-aware insights')
          return insights.slice(0, 4).map((insight: any) => ({
            type: insight.type || 'suggestion',
            priority: insight.priority || 'medium',
            title: insight.title || 'Relationship Insight',
            description: insight.description || 'Continue building your relationship.',
            relationship_id: insight.relationship_id || null,
            category: 'enhanced-grok-4-generated'
          }))
        } else {
          console.log('⚠️ Enhanced parsed response is not a valid array:', insights)
          return null
        }
      } catch (parseError) {
        console.error('❌ Failed to parse enhanced Grok JSON response:', parseError)
        return extractInsightsFromText(content)
      }
    } else {
      console.error('❌ Unexpected enhanced API response structure:', data)
      return null
    }
    
  } catch (error) {
    console.error('❌ Enhanced Grok API call failed:', error)
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
  console.log('🔧 Generating enhanced relationship-aware rule-based insights')
  
  const insights = []

  // Single vs partnered insights
  if (!patterns.hasActivePartnership) {
    // Single person insights
    if (patterns.avgMoodFromCheckins >= 7 && patterns.gratitudeCount > 0) {
      insights.push({
        type: 'appreciation',
        priority: 'medium',
        title: 'Building Relationship Readiness',
        description: `Your positive mood (${patterns.avgMoodFromCheckins}/10) and gratitude practice are excellent foundations for future relationships. Consider reflecting on what qualities you'd want in a partner and what you bring to a relationship.`,
        relationship_id: null,
        category: 'enhanced-rule-based'
      })
    }

    if (onboarding.relationshipGoals?.includes('communication')) {
      insights.push({
        type: 'suggestion',
        priority: 'high',
        title: 'Communication Skills Development',
        description: `Since you want to improve communication and prefer ${onboarding.conflictStyle || 'thoughtful'} approaches to conflict, consider practicing active listening and expressing needs clearly. These skills will serve you well in future relationships.`,
        relationship_id: null,
        category: 'enhanced-rule-based'
      })
    }
  } else {
    // Partnered insights
    const relationshipStageAdvice = getStageSpecificAdvice(patterns.relationshipStage, onboarding)
    if (relationshipStageAdvice) {
      insights.push(relationshipStageAdvice)
    }

    // Connection score insights for partners
    if (patterns.avgRelationshipConnection && patterns.avgRelationshipConnection < 6) {
      const loveLanguage = onboarding.loveLanguageReceive?.[0] || 'quality time'
      insights.push({
        type: 'suggestion',
        priority: 'high',
        title: 'Strengthening Partnership Connection',
        description: `Your relationship connection score (${patterns.avgRelationshipConnection}/10) suggests room for improvement. Since your partner's love language includes ${loveLanguage.replace('_', ' ')}, try focusing on that area this week.`,
        relationship_id: relationshipContext.relationships[0]?.id || null,
        category: 'enhanced-rule-based'
      })
    }

    // Trend-based partner insights
    if (patterns.trend > 1.5) {
      insights.push({
        type: 'appreciation',
        priority: 'medium',
        title: 'Partnership Momentum',
        description: `Your relationship is on a positive trajectory! Your connection scores are improving. This is a great time to plan something special together or discuss future goals as a couple.`,
        relationship_id: relationshipContext.relationships[0]?.id || null,
        category: 'enhanced-rule-based'
      })
    }
  }

  // Ensure we always have at least one insight
  if (insights.length === 0) {
    insights.push({
      type: 'suggestion',
      priority: 'medium',
      title: patterns.hasActivePartnership ? 'Continue Your Partnership Journey' : 'Continue Your Personal Growth',
      description: patterns.hasActivePartnership 
        ? 'You\'re building great habits with regular check-ins. Keep focusing on communication and connection with your partner.'
        : 'You\'re developing excellent self-awareness through journaling and check-ins. This emotional intelligence will serve you well in all relationships.',
      relationship_id: patterns.hasActivePartnership ? relationshipContext.relationships[0]?.id || null : null,
      category: 'enhanced-rule-based'
    })
  }

  console.log('🔧 Generated', insights.length, 'enhanced relationship-aware rule-based insights')
  return insights.slice(0, 4)
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