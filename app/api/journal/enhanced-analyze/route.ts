// app/api/journal/enhanced-analyze/route.ts
// COMPLETELY FIXED - All TypeScript errors resolved

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { enhancedSentimentAnalyzer } from '@/lib/ai/enhanced-sentiment-analyzer'
import { partnerAttunementScorer } from '@/lib/ai/partner-attunement-scorer'
import { realTimeIntelligence } from '@/lib/ai/realtime-intelligence'

// FIXED: All union type definitions
type ActionType = 'self_care' | 'communication' | 'boundary_setting' | 'connection_building'
type PriorityLevel = 'urgent' | 'high' | 'medium' | 'low'
type TimeFrame = 'today' | 'this_week' | 'ongoing'
type SuggestionType = 'emotional_support' | 'quality_time' | 'physical_affection' | 'acts_of_service' | 'communication'
type UrgencyLevel = 'immediate' | 'soon' | 'ongoing'
type TrendDirection = 'improving' | 'stable' | 'declining'

interface EnhancedAnalysisResult {
  sentiment_analysis: any
  pattern_insights: PatternInsight[]
  relationship_health_score: number
  immediate_actions: ImmediateAction[]
  partner_suggestions: PartnerSuggestion[]
  individual_growth_recommendations: GrowthRecommendation[]
  fulfillment_tracking: FulfillmentTracking
  privacy_preserving_insights: PrivacyInsight[]
  attunement_analysis?: any
  realtime_intelligence?: any
}

interface PatternInsight {
  pattern_type: 'behavioral' | 'emotional' | 'communication' | 'connection'
  description: string
  frequency: 'increasing' | 'decreasing' | 'stable' | 'new'  // FIXED: Valid frequency values
  impact_level: 'high' | 'medium' | 'low'
  recommended_response: string
}

interface ImmediateAction {
  action_type: ActionType
  description: string
  priority: PriorityLevel
  expected_outcome: string
  timeframe: TimeFrame
}

interface PartnerSuggestion {
  suggestion_type: SuggestionType
  anonymized_context: string
  specific_suggestion: string
  love_language_alignment: string
  urgency: UrgencyLevel
  confidence_score: number
}

interface GrowthRecommendation {
  area: string
  current_pattern: string
  growth_opportunity: string
  suggested_practices: string[]
  milestone_targets: string[]
}

interface FulfillmentTracking {
  areas: {
    emotional_intimacy: number
    physical_connection: number
    communication_quality: number
    shared_experiences: number
    individual_autonomy: number
  }
  overall_fulfillment: number
  trending_direction: TrendDirection
  key_drivers: string[]
}

interface PrivacyInsight {
  insight_category: string
  anonymized_insight: string
  share_with_partner: boolean
  confidence_level: number
}

// FIXED: Async cookies handling
export async function POST(request: NextRequest) {
  try {
    console.log('📝 Starting enhanced journal analysis...')

    const cookieStore = await cookies()  // FIXED: Added await
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          }
        }
      }
    )

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Parse request body
    const body = await request.json()
    const { content, journal_id } = body

    if (!content || typeof content !== 'string') {
      return NextResponse.json({ error: 'Journal content is required' }, { status: 400 })
    }

    // Get user profile and relationship context
    const userProfile = await getUserProfile(user.id, supabase)
    const relationshipContext = await getRelationshipContext(user.id, supabase)

    // Run enhanced sentiment analysis
    console.log('🧠 Running enhanced sentiment analysis...')
    const sentimentAnalysis = await enhancedSentimentAnalyzer.analyzeRelationshipSentiment(
      content,
      userProfile,
      relationshipContext
    )

    // Calculate relationship health score
    const healthScore = calculateRelationshipHealthScore(sentimentAnalysis)

    // Generate pattern insights
    const patternInsights = generatePatternInsights(sentimentAnalysis, userProfile)

    // Generate immediate actions
    const immediateActions = generateImmediateActions(sentimentAnalysis, userProfile)

    // Generate partner suggestions
    const partnerSuggestions = generatePartnerSuggestions(sentimentAnalysis, userProfile)

    // Generate growth recommendations
    const growthRecommendations = generateGrowthRecommendations(sentimentAnalysis, userProfile)

    // Calculate fulfillment tracking
    const fulfillmentTracking = calculateFulfillmentTracking(sentimentAnalysis)

    // Generate privacy insights
    const privacyInsights = generatePrivacyInsights(sentimentAnalysis, partnerSuggestions)

    // Get real-time intelligence if partner exists
    let realtimeIntelligence = null
    if (relationshipContext?.has_partner) {
      realtimeIntelligence = await realTimeIntelligence.generateRealTimeIntelligence(
        user.id,
        relationshipContext.partner_id,
        supabase
      )
    }

    // Combine all analysis results
    const analysisResult: EnhancedAnalysisResult = {
      sentiment_analysis: sentimentAnalysis,
      pattern_insights: patternInsights,
      relationship_health_score: healthScore,
      immediate_actions: immediateActions,
      partner_suggestions: partnerSuggestions,
      individual_growth_recommendations: growthRecommendations,
      fulfillment_tracking: fulfillmentTracking,
      privacy_preserving_insights: privacyInsights,
      realtime_intelligence: realtimeIntelligence
    }

    // Store analysis in database
    const analysisId = await storeAnalysisResults(
      user.id,
      content,
      analysisResult,
      journal_id,
      supabase
    )

    console.log('✅ Enhanced journal analysis completed')
    
    return NextResponse.json({
      analysis_id: analysisId,
      ...analysisResult
    })

  } catch (error) {
    console.error('❌ Enhanced journal analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze journal entry' },
      { status: 500 }
    )
  }
}

async function getUserProfile(userId: string, supabase: any): Promise<any> {
  try {
    const { data: onboardingData } = await supabase
      .from('enhanced_onboarding_responses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    return {
      love_language_ranking: Array.isArray(onboardingData?.love_language_ranking) 
        ? onboardingData.love_language_ranking 
        : ['quality_time'],
      communication_style: onboardingData?.communication_style || 'direct',
      relationship_values: Array.isArray(onboardingData?.relationship_values) 
        ? onboardingData.relationship_values 
        : []
    }
  } catch (error) {
    console.warn('Could not fetch user profile:', error)
    return {
      love_language_ranking: ['quality_time'],
      communication_style: 'direct',
      relationship_values: []
    }
  }
}

async function getRelationshipContext(userId: string, supabase: any): Promise<any> {
  try {
    const { data: relationships } = await supabase
      .from('relationship_members')
      .select('relationship_id, relationships(*)')
      .eq('user_id', userId)

    const hasPartner = Array.isArray(relationships) && relationships.length > 0
    const partnerId = hasPartner ? relationships[0]?.relationship_id : null

    return {
      has_partner: hasPartner,
      partner_id: partnerId,
      relationship_count: relationships?.length || 0,
      relationship_stage: hasPartner ? relationships[0]?.relationships?.relationship_type : null
    }
  } catch (error) {
    console.warn('Could not fetch relationship context:', error)
    return {
      has_partner: false,
      partner_id: null,
      relationship_count: 0,
      relationship_stage: null
    }
  }
}

function calculateRelationshipHealthScore(sentimentAnalysis: any): number {
  let baseScore = 6.0

  // FIXED: Safe property access with type checking
  const overallSentiment = sentimentAnalysis?.overall_sentiment
  if (typeof overallSentiment === 'string') {
    switch (overallSentiment) {
      case 'positive':
        baseScore += 1.5
        break
      case 'negative':
        baseScore -= 1.5
        break
      case 'mixed':
        baseScore -= 0.5
        break
      default: // neutral
        break
    }
  }

  // FIXED: Safe array access and calculation
  const relationshipNeeds = sentimentAnalysis?.relationship_needs
  if (Array.isArray(relationshipNeeds) && relationshipNeeds.length > 0) {
    let totalIntensity = 0
    let validNeeds = 0
    
    relationshipNeeds.forEach((need: any) => {
      if (need && typeof need.intensity === 'number') {
        totalIntensity += need.intensity
        validNeeds++
      }
    })
    
    if (validNeeds > 0) {
      const avgNeedIntensity = totalIntensity / validNeeds
      if (avgNeedIntensity > 7) {
        baseScore -= 1.0
      } else if (avgNeedIntensity < 4) {
        baseScore += 0.5
      }
    }
  }

  return Math.max(1, Math.min(10, Math.round(baseScore * 10) / 10))
}

// FIXED: Type-safe pattern insights generation
function generatePatternInsights(sentimentAnalysis: any, userProfile: any): PatternInsight[] {
  const insights: PatternInsight[] = []

  // FIXED: Safe property access
  const emotionalState = sentimentAnalysis?.emotional_state
  if (emotionalState && typeof emotionalState.primary_emotion === 'string') {
    insights.push({
      pattern_type: 'emotional',
      description: `Your primary emotional state shows ${emotionalState.primary_emotion}`,
      frequency: 'stable',  // FIXED: Use valid frequency value
      impact_level: (typeof emotionalState.intensity === 'number' && emotionalState.intensity > 7) ? 'high' : 'medium',
      recommended_response: `Focus on nurturing ${emotionalState.primary_emotion} patterns through self-care and connection`
    })
  }

  // FIXED: Safe array access
  const relationshipNeeds = sentimentAnalysis?.relationship_needs
  if (Array.isArray(relationshipNeeds) && relationshipNeeds.length > 0) {
    const dominantNeed = relationshipNeeds[0]
    if (dominantNeed && typeof dominantNeed.need_type === 'string') {
      insights.push({
        pattern_type: 'communication',
        description: `You frequently express need for ${dominantNeed.need_type.replace('_', ' ')}`,
        frequency: 'increasing',  // FIXED: Use valid frequency value
        impact_level: (typeof dominantNeed.intensity === 'number' && dominantNeed.intensity > 7) ? 'high' : 'medium',
        recommended_response: dominantNeed.suggested_response || 'Address this need through clear communication'
      })
    }
  }

  return insights
}

// FIXED: Type-safe immediate actions generation
function generateImmediateActions(sentimentAnalysis: any, userProfile: any): ImmediateAction[] {
  const actions: ImmediateAction[] = []

  // FIXED: Safe array filtering and processing
  const relationshipNeeds = sentimentAnalysis?.relationship_needs
  if (Array.isArray(relationshipNeeds)) {
    const urgentNeeds = relationshipNeeds.filter((need: any) => 
      need && need.urgency === 'immediate'
    )

    urgentNeeds.forEach((need: any) => {
      if (need && typeof need.need_type === 'string') {
        const actionType = mapNeedToActionType(need.need_type)
        
        actions.push({
          action_type: actionType,
          description: need.suggested_response || `Address ${need.need_type.replace('_', ' ')} need`,
          priority: (typeof need.intensity === 'number' && need.intensity > 8) ? 'urgent' : 'high',
          expected_outcome: `Improved ${need.need_type.replace('_', ' ')} satisfaction`,
          timeframe: need.urgency === 'immediate' ? 'today' : 'this_week'
        })
      }
    })
  }

  // Add general well-being actions if no urgent needs
  if (actions.length === 0 && sentimentAnalysis?.overall_sentiment === 'negative') {
    actions.push({
      action_type: 'self_care',
      description: 'Practice self-compassion and stress relief activities',
      priority: 'medium',
      expected_outcome: 'Improved emotional well-being',
      timeframe: 'today'
    })
  }

  return actions
}

// FIXED: Type-safe mapping function
function mapNeedToActionType(needType: string): ActionType {
  const mapping: Record<string, ActionType> = {
    'space': 'boundary_setting',
    'emotional_support': 'communication',
    'validation': 'communication', 
    'help': 'self_care',
    'quality_time': 'connection_building',
    'physical_affection': 'connection_building'
  }
  
  return mapping[needType] || 'communication'
}

// FIXED: Type-safe partner suggestions generation
function generatePartnerSuggestions(sentimentAnalysis: any, userProfile: any): PartnerSuggestion[] {
  const suggestions: PartnerSuggestion[] = []

  // FIXED: Safe array access and processing
  const relationshipNeeds = sentimentAnalysis?.relationship_needs
  if (Array.isArray(relationshipNeeds)) {
    const topNeeds = relationshipNeeds.slice(0, 3)

    topNeeds.forEach((need: any) => {
      if (need && typeof need.need_type === 'string') {
        const suggestionType = mapNeedToSuggestionType(need.need_type)
        
        suggestions.push({
          suggestion_type: suggestionType,
          anonymized_context: generateAnonymizedContext(need),
          specific_suggestion: generateSpecificSuggestion(need, userProfile),
          love_language_alignment: determineLoveLanguageAlignment(need, userProfile),
          urgency: (typeof need.urgency === 'string' && 
                   ['immediate', 'soon', 'ongoing'].includes(need.urgency)) 
                   ? need.urgency as UrgencyLevel 
                   : 'soon',
          confidence_score: typeof need.confidence === 'number' ? need.confidence : 0.7
        })
      }
    })
  }

  return suggestions
}

// FIXED: Type-safe mapping function
function mapNeedToSuggestionType(needType: string): SuggestionType {
  const mapping: Record<string, SuggestionType> = {
    'emotional_support': 'emotional_support',
    'quality_time': 'quality_time',
    'physical_affection': 'physical_affection',
    'help': 'acts_of_service',
    'validation': 'communication',
    'space': 'communication'
  }
  
  return mapping[needType] || 'emotional_support'
}

function generateAnonymizedContext(need: any): string {
  const needType = need?.need_type || 'support'
  return `Based on recent patterns, your partner could benefit from ${needType.replace('_', ' ')}`
}

function generateSpecificSuggestion(need: any, userProfile: any): string {
  const primaryLoveLanguage = Array.isArray(userProfile?.love_language_ranking) 
    ? userProfile.love_language_ranking[0] 
    : 'quality_time'
  
  const needType = need?.need_type || 'emotional_support'
  
  const suggestions: Record<string, Record<string, string>> = {
    emotional_support: {
      words_of_affirmation: 'Send a heartfelt message expressing your care and understanding',
      quality_time: 'Offer to spend focused time listening to their concerns',
      physical_touch: 'Provide comfort through gentle, supportive touch',
      acts_of_service: 'Help with tasks to reduce their stress',
      receiving_gifts: 'Bring a small comfort item or thoughtful surprise'
    },
    quality_time: {
      words_of_affirmation: 'Express how much you value your time together',
      quality_time: 'Plan uninterrupted, focused time together',
      physical_touch: 'Suggest cuddling while talking or watching something',
      acts_of_service: 'Prepare a special environment for quality time',
      receiving_gifts: 'Plan a meaningful shared experience'
    }
  }

  const needSuggestions = suggestions[needType] || suggestions.emotional_support
  return needSuggestions[primaryLoveLanguage] || needSuggestions.quality_time || 'Show care and attention'
}

function determineLoveLanguageAlignment(need: any, userProfile: any): string {
  return Array.isArray(userProfile?.love_language_ranking) 
    ? userProfile.love_language_ranking[0] 
    : 'quality_time'
}

function generateGrowthRecommendations(sentimentAnalysis: any, userProfile: any): GrowthRecommendation[] {
  const recommendations: GrowthRecommendation[] = []

  // FIXED: Safe array access
  const relationshipNeeds = sentimentAnalysis?.relationship_needs
  if (Array.isArray(relationshipNeeds) && relationshipNeeds.length > 0) {
    const dominantNeed = relationshipNeeds[0]
    
    if (dominantNeed && typeof dominantNeed.need_type === 'string') {
      recommendations.push({
        area: dominantNeed.need_type.replace('_', ' '),
        current_pattern: `You frequently seek ${dominantNeed.need_type.replace('_', ' ')}`,
        growth_opportunity: `Develop skills in communicating ${dominantNeed.need_type.replace('_', ' ')} needs`,
        suggested_practices: [
          'Practice expressing needs clearly and directly',
          'Identify optimal timing for important conversations',
          'Develop self-soothing techniques for urgent needs'
        ],
        milestone_targets: [
          'Successfully communicate needs without conflict',
          'Notice improvements in need fulfillment',
          'Develop emotional regulation skills'
        ]
      })
    }
  }

  return recommendations
}

// FIXED: Type-safe fulfillment tracking calculation
function calculateFulfillmentTracking(sentimentAnalysis: any): FulfillmentTracking {
  // FIXED: Safe object access with defaults
  const fulfillmentAreas = sentimentAnalysis?.fulfillment_areas || {}
  
  const emotional_connection = typeof fulfillmentAreas.emotional_connection === 'number' 
    ? fulfillmentAreas.emotional_connection : 5
  const physical_intimacy = typeof fulfillmentAreas.physical_intimacy === 'number' 
    ? fulfillmentAreas.physical_intimacy : 5
  const communication = typeof fulfillmentAreas.communication === 'number' 
    ? fulfillmentAreas.communication : 5
  const shared_activities = typeof fulfillmentAreas.shared_activities === 'number' 
    ? fulfillmentAreas.shared_activities : 5
  const individual_growth = typeof fulfillmentAreas.individual_growth === 'number' 
    ? fulfillmentAreas.individual_growth : 5

  const overall = (emotional_connection + physical_intimacy + communication + shared_activities + individual_growth) / 5

  return {
    areas: {
      emotional_intimacy: emotional_connection,
      physical_connection: physical_intimacy,
      communication_quality: communication,
      shared_experiences: shared_activities,
      individual_autonomy: individual_growth
    },
    overall_fulfillment: Math.round(overall * 10) / 10,
    trending_direction: determineTrend(sentimentAnalysis),
    key_drivers: identifyKeyDrivers(sentimentAnalysis)
  }
}

function determineTrend(sentimentAnalysis: any): TrendDirection {
  const overallSentiment = sentimentAnalysis?.overall_sentiment
  switch (overallSentiment) {
    case 'positive':
      return 'improving'
    case 'negative':
      return 'declining'
    default:
      return 'stable'
  }
}

// FIXED: Type-safe key drivers identification
function identifyKeyDrivers(sentimentAnalysis: any): string[] {
  const drivers: string[] = []
  
  // FIXED: Safe array access
  const relationshipNeeds = sentimentAnalysis?.relationship_needs
  if (Array.isArray(relationshipNeeds) && relationshipNeeds.length > 0) {
    const topNeeds = relationshipNeeds.slice(0, 2)
    topNeeds.forEach((need: any) => {
      if (need && typeof need.need_type === 'string') {
        drivers.push(need.need_type.replace('_', ' '))
      }
    })
  }
  
  // FIXED: Safe property access
  const primaryEmotion = sentimentAnalysis?.emotional_state?.primary_emotion
  if (typeof primaryEmotion === 'string') {
    drivers.push(`${primaryEmotion} emotional state`)
  }
  
  return drivers
}

function generatePrivacyInsights(sentimentAnalysis: any, partnerSuggestions: PartnerSuggestion[]): PrivacyInsight[] {
  return partnerSuggestions.map((suggestion: PartnerSuggestion) => ({
    insight_category: suggestion.suggestion_type,
    anonymized_insight: suggestion.anonymized_context,
    share_with_partner: suggestion.confidence_score >= 0.7,
    confidence_level: suggestion.confidence_score
  }))
}

async function storeAnalysisResults(
  userId: string,
  content: string,
  analysisResult: EnhancedAnalysisResult,
  journalId: string | null,
  supabase: any
): Promise<string> {
  try {
    const contentHash = hashContent(content)

    const { data, error } = await supabase
      .from('enhanced_journal_analysis')
      .insert({
        user_id: userId,
        journal_content_hash: contentHash,
        sentiment_analysis: analysisResult.sentiment_analysis,
        overall_sentiment: analysisResult.sentiment_analysis?.overall_sentiment || 'neutral',
        confidence_score: analysisResult.sentiment_analysis?.confidence_score || 0.5,
        relationship_needs: analysisResult.sentiment_analysis?.relationship_needs || [],
        relationship_health_score: analysisResult.relationship_health_score,
        fulfillment_tracking: analysisResult.fulfillment_tracking,
        immediate_actions: analysisResult.immediate_actions,
        pattern_insights: analysisResult.pattern_insights,
        analysis_version: '2.0-enhanced'
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error storing analysis:', error)
      throw error
    }

    return data?.id || `temp-${Date.now()}`
  } catch (error) {
    console.error('Failed to store analysis results:', error)
    return `temp-${Date.now()}`
  }
}

function hashContent(content: string): string {
  return Buffer.from(content).toString('base64').slice(0, 32)
}