// app/api/onboarding/generate-profile/route.ts - ENHANCED DEBUGGING VERSION
// Adds comprehensive debugging to see exactly what's happening

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Keep all your existing interfaces exactly as they are...
interface OnboardingResponses {
  id: string
  user_id: string
  session_id: string
  love_language_ranking: string[]
  love_language_scores: Record<string, number>
  love_language_examples: Record<string, string>
  communication_style: string
  conflict_approach: string
  stress_response: string
  expression_preferences: Record<string, number>
  communication_timing: string[]
  intimacy_priorities: Record<string, number>
  intimacy_enhancers: string[]
  intimacy_barriers: string[]
  connection_frequency: Record<string, string>
  primary_goals: string[]
  goal_timeline: string
  specific_challenges: string
  relationship_values: string[]
  success_metrics: string
  expression_directness: string
  expression_frequency: string
  preferred_methods: string[]
  need_categories_difficulty: Record<string, number>
  partner_reading_ability: number
  successful_communication_example: string
  communication_barriers: string[]
  completed_at: string | null
  version: number
  ai_processing_status: string
  created_at: string
  updated_at: string
  ai_profile_data: Record<string, any> | null
}

interface GenerateProfileRequest {
  responseId: string
  userId: string
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  let requestData: any

  try {
    requestData = await request.json()
    const { responseId, userId } = requestData

    if (!responseId || !userId) {
      return NextResponse.json({ 
        error: 'Missing responseId or userId' 
      }, { status: 400 })
    }
    
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { 
        cookies: { 
          get: (name: string) => cookieStore.get(name)?.value 
        } 
      }
    )

    console.log('🔍 Looking for responseId:', responseId)
    console.log('🔍 Looking for userId:', userId)
    console.log('🔗 Using Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 50) + '...')
    console.log('🔑 Using ANON key (first 10 chars):', process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 10) + '...')

    let responses: any = null

    // Enhanced Strategy 1: Get by exact responseId with more debugging
    console.log('🔍 Strategy 1: Trying exact responseId match...')
    const { data: exactMatches, error: exactError, count: exactCount } = await supabase
      .from('enhanced_onboarding_responses')
      .select('*', { count: 'exact' })
      .eq('id', responseId)
      .limit(1)

    console.log('📊 Strategy 1 detailed result:', {
      error: exactError?.message || 'none',
      errorCode: exactError?.code || 'none',
      rowCount: exactMatches?.length || 0,
      totalCount: exactCount || 0,
      hasData: !!exactMatches,
      firstRowExists: exactMatches && exactMatches.length > 0
    })

    if (!exactError && exactMatches && exactMatches.length > 0) {
      console.log('✅ Strategy 1 SUCCESS - Found exact responseId match')
      console.log('📊 Found record details:', {
        id: exactMatches[0].id,
        user_id: exactMatches[0].user_id,
        completed_at: exactMatches[0].completed_at,
        ai_processing_status: exactMatches[0].ai_processing_status,
        hasLoveLanguages: (exactMatches[0].love_language_ranking || []).length > 0
      })
      responses = exactMatches[0]
    } else {
      console.log('❌ Strategy 1 FAILED - No exact match found')
      
      // Enhanced Strategy 2: Get most recent for user with debugging
      console.log('🔍 Strategy 2: Trying user fallback...')
      const { data: userMatches, error: userError, count: userCount } = await supabase
        .from('enhanced_onboarding_responses')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .not('completed_at', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(5) // Get more to see what's available

      console.log('📊 Strategy 2 detailed result:', {
        error: userError?.message || 'none',
        errorCode: userError?.code || 'none',
        rowCount: userMatches?.length || 0,
        totalCount: userCount || 0,
        hasData: !!userMatches,
        allRecords: userMatches?.map(r => ({
          id: r.id.substring(0, 8) + '...',
          completed_at: r.completed_at,
          created_at: r.created_at
        })) || []
      })

      if (!userError && userMatches && userMatches.length > 0) {
        console.log('✅ Strategy 2 SUCCESS - Found user records')
        responses = userMatches[0] // Use most recent
      } else {
        console.log('❌ Strategy 2 FAILED - No user records found')
        
        // Enhanced Strategy 3: Check ANY records for this user (even incomplete)
        console.log('🔍 Strategy 3: Trying ANY records for user...')
        const { data: anyMatches, error: anyError, count: anyCount } = await supabase
          .from('enhanced_onboarding_responses')
          .select('*', { count: 'exact' })
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(5)

        console.log('📊 Strategy 3 detailed result:', {
          error: anyError?.message || 'none',
          errorCode: anyError?.code || 'none',
          rowCount: anyMatches?.length || 0,
          totalCount: anyCount || 0,
          hasData: !!anyMatches,
          allRecords: anyMatches?.map(r => ({
            id: r.id.substring(0, 8) + '...',
            completed_at: r.completed_at || 'null',
            created_at: r.created_at,
            user_id_match: r.user_id === userId
          })) || []
        })

        if (!anyError && anyMatches && anyMatches.length > 0) {
          console.log('✅ Strategy 3 SUCCESS - Found user records (including incomplete)')
          responses = anyMatches[0]
        } else {
          console.log('❌ Strategy 3 FAILED - Absolutely no records for this user')
          
          // Final Debug: Check what's actually in the table
          console.log('🔍 FINAL DEBUG: Checking table contents...')
          const { data: tableData, error: tableError, count: tableCount } = await supabase
            .from('enhanced_onboarding_responses')
            .select('id, user_id, created_at, completed_at', { count: 'exact' })
            .order('created_at', { ascending: false })
            .limit(10)

          console.log('📊 Table contents analysis:', {
            error: tableError?.message || 'none',
            totalRecordsInTable: tableCount || 0,
            recentRecords: tableData?.map(r => ({
              id: r.id.substring(0, 8) + '...',
              user_id: r.user_id.substring(0, 8) + '...',
              created_at: r.created_at,
              completed_at: r.completed_at || 'null',
              isOurUser: r.user_id === userId,
              isOurResponse: r.id === responseId
            })) || []
          })

          // Check if our specific IDs exist at all
          const { data: specificCheck, error: specificError } = await supabase
            .from('enhanced_onboarding_responses')
            .select('id, user_id, created_at')
            .or(`id.eq.${responseId},user_id.eq.${userId}`)

          console.log('🔍 Specific ID existence check:', {
            error: specificError?.message || 'none',
            foundRecords: specificCheck?.length || 0,
            matches: specificCheck?.map(r => ({
              id: r.id,
              user_id: r.user_id,
              matchesRequestedResponse: r.id === responseId,
              matchesRequestedUser: r.user_id === userId
            })) || []
          })

          return NextResponse.json({ 
            error: 'No onboarding data found',
            details: `No onboarding responses found for user ${userId} or response ${responseId}`,
            debug: {
              requestedResponseId: responseId,
              requestedUserId: userId,
              tableHasRecords: (tableCount || 0) > 0,
              totalRecordsInTable: tableCount || 0,
              specificMatches: specificCheck?.length || 0,
              strategies: {
                exactMatch: { error: exactError?.message, found: (exactMatches?.length || 0) > 0 },
                userFallback: { error: userError?.message, found: (userMatches?.length || 0) > 0 },
                anyUserRecord: { error: anyError?.message, found: (anyMatches?.length || 0) > 0 }
              }
            }
          }, { status: 404 })
        }
      }
    }

    if (!responses) {
      return NextResponse.json({ 
        error: 'No valid onboarding data found after all strategies' 
      }, { status: 404 })
    }

    console.log('🎉 SUCCESS: Found response data!')
    console.log('📊 Using response:', {
      id: responses.id,
      user_id: responses.user_id,
      completed_at: responses.completed_at,
      ai_processing_status: responses.ai_processing_status,
      created_at: responses.created_at
    })

    // Update processing status
    console.log('🔄 Updating processing status for:', responses.id)
    const { error: updateError } = await supabase
      .from('enhanced_onboarding_responses')
      .update({ ai_processing_status: 'processing' })
      .eq('id', responses.id)

    if (updateError) {
      console.warn('⚠️ Could not update processing status:', updateError.message)
    } else {
      console.log('✅ Processing status updated successfully')
    }

    // Validate we have meaningful data
    const hasData = responses.love_language_ranking?.length > 0 || 
                   responses.communication_style !== '' ||
                   Object.keys(responses.love_language_scores || {}).length > 0

    console.log('📊 Data validation:', {
      hasLoveLanguageRanking: (responses.love_language_ranking?.length || 0) > 0,
      hasCommunicationStyle: responses.communication_style !== '',
      hasLoveLanguageScores: Object.keys(responses.love_language_scores || {}).length > 0,
      overallHasData: hasData
    })

    if (!hasData) {
      console.warn('⚠️ Found response but no meaningful data')
      return NextResponse.json({ 
        error: 'Onboarding response exists but contains no data',
        details: 'The onboarding response was found but appears to be empty',
        debug: {
          responseId: responses.id,
          hasLoveLanguages: (responses.love_language_ranking?.length || 0) > 0,
          hasCommunicationStyle: responses.communication_style !== '',
          hasScores: Object.keys(responses.love_language_scores || {}).length > 0,
          allFields: Object.keys(responses)
        }
      }, { status: 422 })
    }

    // Add this right after "Data verified successfully"
    console.log('🔍 VERIFICATION: Can we read what we just wrote?')
        const { data: immediateRead, error: readError } = await supabase
        .from('enhanced_onboarding_responses')
        .select('id, user_id, created_at')
        .limit(5)

    console.log('📊 Immediate read test:', {
        error: readError?.message || 'none',
        count: immediateRead?.length || 0,
        records: immediateRead?.map(r => ({ id: r.id.substring(0, 8) + '...', user_id: r.user_id.substring(0, 8) + '...' })) || []
        })

    console.log('📊 Processing response with data:', {
      id: responses.id,
      loveLanguages: responses.love_language_ranking?.length || 0,
      communicationStyle: responses.communication_style || 'none',
      completedAt: responses.completed_at
    })

    // Generate AI-powered profile analysis
    console.log('🤖 Generating AI profile...')
    const profileData = await generateEnhancedProfile(responses)
    console.log('✅ AI profile generated successfully')

    // Save the generated profile back to the database
    try {
      console.log('💾 Saving profile data to database...')
      const { error: saveError } = await supabase
        .from('enhanced_onboarding_responses')
        .update({
          ai_profile_data: profileData,
          ai_processing_status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', responses.id)

      if (saveError) {
        console.error('❌ Failed to save profile:', saveError.message)
        throw new Error(`Failed to save profile data: ${saveError.message}`)
      }

      console.log('✅ Profile data saved successfully')
      
    } catch (saveError) {
      console.error('❌ Save error:', saveError)
      
      // Update status to failed but don't throw - we still generated the profile
      await supabase
        .from('enhanced_onboarding_responses')
        .update({ ai_processing_status: 'failed' })
        .eq('id', responses.id)
        
      throw saveError
    }

    return NextResponse.json({ 
      success: true, 
      profile: profileData,
      message: 'Profile generated and saved successfully',
      debug: {
        processedResponseId: responses.id,
        originalRequestId: responseId,
        strategyUsed: responses.id === responseId ? 'exact_match' : 'fallback',
        dataPointsProcessed: {
          loveLanguages: responses.love_language_ranking?.length || 0,
          communicationStyle: !!responses.communication_style,
          intimacyPriorities: Object.keys(responses.intimacy_priorities || {}).length,
          goals: responses.primary_goals?.length || 0
        }
      }
    })

  } catch (error) {
    console.error('❌ Generate profile error:', error)
    
    return NextResponse.json({ 
      error: 'Profile generation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}


// AI Profile Generation - Updated to work with flat structure
async function generateEnhancedProfile(responses: OnboardingResponses): Promise<Record<string, any>> {
  const loveLanguageProfile = generateLoveLanguageProfile(responses)
  const communicationProfile = generateCommunicationProfile(responses)
  const intimacyProfile = generateIntimacyProfile(responses)
  const goalProfile = generateGoalProfile(responses)
  const needExpressionProfile = generateNeedExpressionProfile(responses)
  
  const aiSummary = generateAISummary({
    loveLanguageProfile,
    communicationProfile,
    intimacyProfile,
    goalProfile,
    needExpressionProfile
  })

  const completenessScore = calculateCompletenessScore(responses)
  const confidenceScore = calculateConfidenceScore(responses)

  return {
    love_language_profile: loveLanguageProfile,
    communication_profile: communicationProfile,
    intimacy_profile: intimacyProfile,
    goal_profile: goalProfile,
    need_expression_profile: needExpressionProfile,
    ai_summary: aiSummary,
    completeness_score: completenessScore,
    confidence_score: confidenceScore,
    generated_at: new Date().toISOString(),
    source_response_id: responses.id
  }
}

function generateLoveLanguageProfile(responses: OnboardingResponses): Record<string, any> {
  const rankings = responses.love_language_ranking || []
  const scores = responses.love_language_scores || {}
  const examples = responses.love_language_examples || {}

  const aiInsights: string[] = []
  
  const primary = rankings[0] || 'quality_time'
  const primaryScore = scores[primary] || 0
  
  if (primaryScore >= 8) {
    aiInsights.push(`Strongly resonates with ${primary.replace(/_/g, ' ')} - this is critical for feeling loved`)
  }
  
  const secondary = rankings[1] || 'words_of_affirmation'
  const gap = (scores[primary] || 0) - (scores[secondary] || 0)
  
  if (gap <= 2) {
    aiInsights.push(`Values both ${primary.replace(/_/g, ' ')} and ${secondary.replace(/_/g, ' ')} equally`)
  }

  if (examples.mostMeaningful && examples.mostMeaningful.length > 50) {
    aiInsights.push("Provided detailed meaningful love example - values specificity")
  }

  return {
    primary,
    secondary,
    scores,
    personalizedExamples: examples,
    aiInsights,
    partnerGuidance: generateLoveLanguagePartnerGuidance(primary, secondary, examples)
  }
}

function generateLoveLanguagePartnerGuidance(primary: string, secondary: string, examples: Record<string, string>): string[] {
  const guidance: string[] = []
  
  switch (primary) {
    case 'words_of_affirmation':
      guidance.push("Focus on specific, genuine compliments and verbal appreciation")
      guidance.push("Express gratitude for both big and small things they do")
      break
    case 'quality_time':
      guidance.push("Prioritize undivided attention during conversations")
      guidance.push("Plan regular one-on-one activities without distractions")
      break
    case 'physical_touch':
      guidance.push("Increase casual physical affection throughout the day")
      guidance.push("Be mindful of their need for physical closeness during stress")
      break
    case 'acts_of_service':
      guidance.push("Notice and help with tasks that matter to them")
      guidance.push("Take initiative on household responsibilities")
      break
    case 'receiving_gifts':
      guidance.push("Focus on thoughtful, personal gifts rather than expensive ones")
      guidance.push("Remember important dates and celebrate with meaningful tokens")
      break
  }

  if (examples.mostMeaningful && examples.mostMeaningful.length > 20) {
    guidance.push("They value personal, thoughtful gestures based on their examples")
  }

  return guidance
}

function generateCommunicationProfile(responses: OnboardingResponses): Record<string, any> {
  const aiInsights: string[] = []
  
  const style = responses.communication_style || 'thoughtful_diplomatic'
  const conflictStyle = responses.conflict_approach || 'seek_compromise'
  const stressResponse = responses.stress_response || 'seek_support'
  
  if (conflictStyle === 'need_time_process') {
    aiInsights.push("Needs processing time before difficult conversations - avoid pressuring for immediate resolution")
  }
  
  if (stressResponse === 'need_space') {
    aiInsights.push("When stressed, requires alone time before being receptive to support")
  }

  const timing = responses.communication_timing || []
  if (timing.includes('when_calm')) {
    aiInsights.push("Conversations are most effective when both partners are calm")
  }

  return {
    style,
    conflictStyle,
    stressResponse,
    preferences: responses.expression_preferences || {},
    optimalTiming: timing,
    aiInsights,
    partnerGuidance: generateCommunicationPartnerGuidance(style, conflictStyle, stressResponse, timing)
  }
}

function generateCommunicationPartnerGuidance(style: string, conflictStyle: string, stressResponse: string, timing: string[]): string[] {
  const guidance: string[] = []
  
  if (conflictStyle === 'need_time_process') {
    guidance.push("Give them space to process before expecting responses to difficult topics")
    guidance.push("Say 'Let's talk about this when you're ready' instead of pushing for immediate discussion")
  }

  if (stressResponse === 'need_space') {
    guidance.push("When they're stressed, offer support but respect their need for alone time")
    guidance.push("Check in gently rather than overwhelming with questions")
  }

  if (timing.includes('evening')) {
    guidance.push("Evening conversations tend to be most effective for deeper topics")
  }

  return guidance
}

function generateIntimacyProfile(responses: OnboardingResponses): Record<string, any> {
  const priorities = responses.intimacy_priorities || {}
  const enhancers = responses.intimacy_enhancers || []
  const barriers = responses.intimacy_barriers || []
  
  const aiInsights: string[] = []
  
  const priorityEntries = Object.entries(priorities).sort(([,a], [,b]) => (b as number) - (a as number))
  const topPriority = priorityEntries[0]
  
  if (topPriority) {
    aiInsights.push(`${topPriority[0]} intimacy is their highest priority (${topPriority[1]}/10)`)
  }

  if (barriers.includes('distractions')) {
    aiInsights.push("Technology distractions significantly impact their sense of connection")
  }

  return {
    priorities,
    enhancers,
    barriers,
    frequencies: responses.connection_frequency || {},
    aiInsights,
    partnerGuidance: generateIntimacyPartnerGuidance(priorities, enhancers, barriers)
  }
}

function generateIntimacyPartnerGuidance(priorities: Record<string, number>, enhancers: string[], barriers: string[]): string[] {
  const guidance: string[] = []
  
  const priorityEntries = Object.entries(priorities).sort(([,a], [,b]) => (b as number) - (a as number))
  const topPriority = priorityEntries[0]
  
  if (topPriority) {
    switch (topPriority[0]) {
      case 'emotional':
        guidance.push("Focus on sharing feelings and being vulnerable with them")
        break
      case 'physical':
        guidance.push("Prioritize physical affection and intimate touch")
        break
      case 'intellectual':
        guidance.push("Engage in deep, meaningful conversations about ideas and topics they care about")
        break
    }
  }

  if (enhancers.includes('undivided_attention')) {
    guidance.push("Put away phones and give complete attention during intimate moments")
  }
  
  if (enhancers.includes('vulnerability')) {
    guidance.push("Share your own vulnerabilities and feelings to deepen connection")
  }

  if (barriers.includes('distractions')) {
    guidance.push("Create phone-free zones for intimate conversations and connection time")
  }

  return guidance
}

function generateGoalProfile(responses: OnboardingResponses): Record<string, any> {
  const goals = responses.primary_goals || []
  const timeline = responses.goal_timeline || '6_months'
  const challenges = responses.specific_challenges || ''
  
  const aiInsights: string[] = []
  
  if (goals.includes('improve_communication')) {
    aiInsights.push("Communication improvement is a priority - focus on listening and expression skills")
  }
  
  if (goals.includes('deepen_intimacy')) {
    aiInsights.push("Ready for deeper intimacy work - emotional vulnerability will be key")
  }

  return {
    primaryGoals: goals,
    timeline,
    challenges,
    values: responses.relationship_values || [],
    successVision: responses.success_metrics || '',
    aiInsights
  }
}

function generateNeedExpressionProfile(responses: OnboardingResponses): Record<string, any> {
  const directness = responses.expression_directness || 'somewhat_direct'
  const partnerReadingAbility = responses.partner_reading_ability || 5
  const barriers = responses.communication_barriers || []
  
  const aiInsights: string[] = []
  let suggestionStrategy = 'balanced'

  if (directness === 'very_indirect' && partnerReadingAbility <= 5) {
    suggestionStrategy = 'very_direct'
    aiInsights.push("Partner needs very direct suggestions since user communicates indirectly")
  } else if (directness === 'very_direct' && partnerReadingAbility >= 7) {
    suggestionStrategy = 'gentle_subtle'
    aiInsights.push("Partner is good at reading cues, suggestions can be more subtle")
  }

  if (barriers.includes('fear_rejection')) {
    aiInsights.push("User fears rejection when expressing needs - partner should be extra supportive")
  }

  if (barriers.includes('dont_want_burden')) {
    aiInsights.push("User doesn't want to be a burden - frame suggestions as mutual benefits")
  }

  return {
    style: {
      directness,
      frequency: responses.expression_frequency || 'when_necessary',
      preferredMethods: responses.preferred_methods || []
    },
    categoryDifficulty: responses.need_categories_difficulty || {},
    partnerAwareness: {
      currentLevel: partnerReadingAbility,
      successfulExample: responses.successful_communication_example || ''
    },
    communicationBarriers: barriers,
    aiInsights,
    suggestionStrategy
  }
}

function generateAISummary(profiles: Record<string, any>): Record<string, any> {
  const keyInsights: string[] = []
  const strengthAreas: string[] = []
  const improvementAreas: string[] = []
  
  // Extract key insights from each profile
  if (profiles.loveLanguageProfile?.aiInsights) {
    keyInsights.push(...profiles.loveLanguageProfile.aiInsights)
  }
  if (profiles.communicationProfile?.aiInsights) {
    keyInsights.push(...profiles.communicationProfile.aiInsights)
  }
  if (profiles.intimacyProfile?.aiInsights) {
    keyInsights.push(...profiles.intimacyProfile.aiInsights)
  }
  if (profiles.needExpressionProfile?.aiInsights) {
    keyInsights.push(...profiles.needExpressionProfile.aiInsights)
  }

  // Determine strengths and improvement areas
  if (profiles.communicationProfile?.preferences?.directness >= 7) {
    strengthAreas.push("Direct communication style")
  } else {
    improvementAreas.push("Could benefit from more direct communication")
  }

  if (profiles.needExpressionProfile?.partnerAwareness?.currentLevel >= 7) {
    strengthAreas.push("Partner is good at reading their needs")
  } else {
    improvementAreas.push("Partner needs more guidance to understand their needs")
  }

  return {
    overallProfile: generateOverallProfileSummary(profiles),
    keyInsights: keyInsights.slice(0, 5),
    partnerSuggestionApproach: profiles.needExpressionProfile?.suggestionStrategy || 'balanced',
    strengthAreas,
    improvementAreas,
    confidenceLevel: calculateProfileConfidence(profiles)
  }
}

function generateOverallProfileSummary(profiles: Record<string, any>): string {
  const primary = profiles.loveLanguageProfile?.primary?.replace(/_/g, ' ') || 'quality time'
  const communicationStyle = profiles.communicationProfile?.style || 'thoughtful'
  const topIntimacyEntries = Object.entries(profiles.intimacyProfile?.priorities || {})
    .sort(([,a], [,b]) => (b as number) - (a as number))
  const topIntimacy = topIntimacyEntries[0]?.[0] || 'emotional'
  
  return `This person primarily feels loved through ${primary} and communicates in a ${communicationStyle} style. They prioritize ${topIntimacy} intimacy and their partner ${profiles.needExpressionProfile?.suggestionStrategy === 'very_direct' ? 'needs direct guidance' : 'is good at reading their cues'}. Focus on ${profiles.goalProfile?.primaryGoals?.[0]?.replace(/_/g, ' ') || 'communication improvement'} for relationship improvement.`
}

function calculateCompletenessScore(responses: OnboardingResponses): number {
  let completedFields = 0
  let totalFields = 0
  
  const fields = [
    'love_language_ranking', 'love_language_scores', 'communication_style',
    'conflict_approach', 'stress_response', 'intimacy_priorities',
    'primary_goals', 'goal_timeline', 'relationship_values',
    'expression_directness', 'partner_reading_ability'
  ]
  
  fields.forEach(field => {
    totalFields++
    const value = (responses as any)[field]
    
    if (value && (
      (Array.isArray(value) && value.length > 0) ||
      (typeof value === 'object' && value !== null && Object.keys(value).length > 0) ||
      (typeof value === 'string' && value.length > 0) ||
      (typeof value === 'number' && value > 0)
    )) {
      completedFields++
    }
  })
  
  return Math.round((completedFields / totalFields) * 100)
}

function calculateConfidenceScore(responses: OnboardingResponses): number {
  let score = 0.5
  
  if (responses.love_language_examples && Object.keys(responses.love_language_examples).length > 0) score += 0.1
  if (responses.specific_challenges && responses.specific_challenges.length > 100) score += 0.1
  if (responses.successful_communication_example && responses.successful_communication_example.length > 50) score += 0.1
  if (responses.success_metrics && responses.success_metrics.length > 50) score += 0.1
  if (responses.partner_reading_ability >= 1 && responses.partner_reading_ability <= 10) score += 0.1
  
  return Math.min(score, 1.0)
}

function calculateProfileConfidence(profiles: Record<string, any>): string {
  const completeness = profiles.completenessScore || 0
  const confidence = profiles.confidenceScore || 0
  
  if (completeness >= 90 && confidence >= 0.8) return 'very_high'
  if (completeness >= 75 && confidence >= 0.6) return 'high'
  if (completeness >= 60 && confidence >= 0.4) return 'medium'
  return 'low'
}