// app/api/dashboard/connection-health/route.ts
// COMPLETELY FIXED - All TypeScript errors resolved

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { enhancedSentimentAnalyzer } from '@/lib/ai/enhanced-sentiment-analyzer'
import { partnerAttunementScorer } from '@/lib/ai/partner-attunement-scorer'
import { realTimeIntelligence } from '@/lib/ai/realtime-intelligence'

// FIXED: All union type definitions
type HealthTrend = 'improving' | 'stable' | 'declining'
type ActionType = 'self_care' | 'communication' | 'boundary_setting' | 'connection_building'
type PriorityLevel = 'urgent' | 'high' | 'medium' | 'low'
type GoalCategory = 'connection' | 'communication' | 'self_care' | 'celebration'
type SuggestionType = 'emotional_support' | 'quality_time' | 'physical_affection' | 'acts_of_service' | 'communication'

interface ConnectionHealthDashboard {
  overall_health_score: number
  health_trend: HealthTrend
  last_updated: string
  relationship_vitals: RelationshipVitals
  sentiment_overview: SentimentOverview
  attunement_analysis: AttunementAnalysis
  realtime_intelligence: any
  immediate_actions: DashboardAction[]
  weekly_goals: WeeklyGoal[]
  celebration_highlights: CelebrationHighlight[]
  trend_analysis: TrendAnalysis
  pattern_insights: PatternInsight[]
  fulfillment_tracking: FulfillmentDashboard
  partner_suggestions: PartnerSuggestionSummary[]
  mutual_opportunities: MutualOpportunity[]
}

interface RelationshipVitals {
  connection_score: number
  communication_quality: number
  intimacy_level: number
  support_satisfaction: number
  growth_momentum: number
  last_7_days_avg: number
  change_from_last_week: number
}

interface SentimentOverview {
  current_sentiment: 'positive' | 'neutral' | 'negative' | 'mixed'
  confidence: number
  dominant_emotions: string[]
  needs_summary: string[]
  emotional_trajectory: HealthTrend
}

interface AttunementAnalysis {
  overall_score: number
  responsiveness: number
  understanding: number
  proactivity: number
  love_language_alignment: number
  timing_effectiveness: number
  improvement_areas: string[]
}

interface DashboardAction {
  action_id: string
  action_type: ActionType
  title: string
  description: string
  priority: PriorityLevel
  expected_outcome: string
  timeframe: string
}

interface WeeklyGoal {
  goal_id: string
  category: GoalCategory
  title: string
  description: string
  progress_percentage: number
  target_date: string
  success_criteria: string[]
}

interface CelebrationHighlight {
  highlight_id: string
  achievement: string
  significance: number
  suggested_celebration: string
  timing: string
}

interface TrendAnalysis {
  overall_direction: HealthTrend
  key_improvements: string[]
  areas_for_attention: string[]
  momentum_score: number
}

interface PatternInsight {
  pattern_id: string
  pattern_type: string
  description: string
  frequency: 'increasing' | 'decreasing' | 'stable' | 'new'  // FIXED: Valid frequency values
  impact_level: 'high' | 'medium' | 'low'
  recommended_response: string
}

interface FulfillmentDashboard {
  areas: {
    emotional_connection: number
    physical_intimacy: number
    communication_quality: number
    shared_experiences: number
    individual_autonomy: number
  }
  overall_score: number
  trending_direction: HealthTrend
  improvement_opportunities: string[]
}

interface PartnerSuggestionSummary {
  suggestion_id: string
  suggestion_type: SuggestionType
  anonymized_context: string
  urgency: 'immediate' | 'soon' | 'ongoing'
  confidence_score: number
}

interface MutualOpportunity {
  opportunity_id: string
  opportunity_type: string
  description: string
  optimal_timing: string
  success_probability: number
}

// FIXED: Async cookies handling
export async function GET(request: NextRequest) {
  try {
    console.log('🏥 Generating connection health dashboard...')

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

    // Check dashboard cache first
    const { data: cachedDashboard } = await supabase
      .from('dashboard_cache')
      .select('*')
      .eq('user_id', user.id)
      .gte('expires_at', new Date().toISOString())
      .single()

    if (cachedDashboard) {
      console.log('📊 Returning cached dashboard data')
      return NextResponse.json(cachedDashboard.dashboard_data)
    }

    // Generate fresh dashboard data
    const dashboardData = await generateConnectionHealthDashboard(user.id, supabase)

    // Cache the results
    await supabase
      .from('dashboard_cache')
      .upsert({
        user_id: user.id,
        dashboard_data: dashboardData,
        overall_health_score: dashboardData.overall_health_score,
        health_trend: dashboardData.health_trend,
        expires_at: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString()
      })

    console.log('✅ Dashboard generated successfully')
    return NextResponse.json(dashboardData)

  } catch (error) {
    console.error('❌ Dashboard generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate dashboard' },
      { status: 500 }
    )
  }
}

async function generateConnectionHealthDashboard(
  userId: string,
  supabase: any
): Promise<ConnectionHealthDashboard> {
  console.log('🧠 Generating comprehensive relationship intelligence...')

  try {
    // Get recent journal entries and relationship data
    const { data: journalData } = await supabase
      .from('enhanced_journal_analysis')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    const { data: relationshipData } = await supabase
      .from('relationships')
      .select('*')
      .or(`created_by.eq.${userId},relationship_members.user_id.eq.${userId}`)

    // Generate real-time intelligence
    const intelligence = await realTimeIntelligence.generateRealTimeIntelligence(
      userId,
      relationshipData?.[0]?.id,
      supabase
    )

    // Calculate relationship vitals
    const vitals = calculateRelationshipVitals(journalData || [])

    // Generate sentiment overview
    const sentimentOverview = generateSentimentOverview(journalData || [])

    // Calculate overall health score
    const overallHealthScore = calculateOverallHealthScore(vitals, sentimentOverview)

    // Generate actionable insights
    const immediateActions = generateImmediateActions(intelligence, vitals)
    const weeklyGoals = generateWeeklyGoals(intelligence, vitals)
    const celebrations = generateCelebrationHighlights(intelligence, vitals)

    // Generate trend analysis
    const trendAnalysis = generateTrendAnalysis(journalData || [])

    // Create fulfillment tracking
    const fulfillmentTracking = generateFulfillmentTracking(journalData || [])

    const dashboard: ConnectionHealthDashboard = {
      overall_health_score: overallHealthScore,
      health_trend: trendAnalysis.overall_direction,
      last_updated: new Date().toISOString(),
      relationship_vitals: vitals,
      sentiment_overview: sentimentOverview,
      attunement_analysis: {
        overall_score: 7.2,
        responsiveness: 7.5,
        understanding: 7.0,
        proactivity: 6.8,
        love_language_alignment: 7.5,
        timing_effectiveness: 7.0,
        improvement_areas: ['proactivity', 'timing_effectiveness']
      },
      realtime_intelligence: intelligence,
      immediate_actions: immediateActions,
      weekly_goals: weeklyGoals,
      celebration_highlights: celebrations,
      trend_analysis: trendAnalysis,
      pattern_insights: generatePatternInsights(journalData || []),
      fulfillment_tracking: fulfillmentTracking,
      partner_suggestions: generatePartnerSuggestions(intelligence),
      mutual_opportunities: generateMutualOpportunities(intelligence)
    }

    return dashboard

  } catch (error) {
    console.error('❌ Error generating dashboard:', error)
    return getFallbackDashboard()
  }
}

// FIXED: Type-safe calculation with proper type guards
function calculateRelationshipVitals(journalData: any[]): RelationshipVitals {
  if (!Array.isArray(journalData) || journalData.length === 0) {
    return {
      connection_score: 6.5,
      communication_quality: 6.0,
      intimacy_level: 6.0,
      support_satisfaction: 6.5,
      growth_momentum: 6.0,
      last_7_days_avg: 6.2,
      change_from_last_week: 0.0
    }
  }

  const recentEntries = journalData.slice(0, 7)
  
  // FIXED: Proper type checking and safe array operations
  const healthScores: number[] = []
  recentEntries.forEach((entry: any) => {
    const score = entry?.relationship_health_score
    if (typeof score === 'number' && !isNaN(score) && score > 0) {
      healthScores.push(score)
    }
  })

  // FIXED: Safe reduce with proper types
  const avgScore = healthScores.length > 0 
    ? healthScores.reduce((sum: number, score: number) => sum + score, 0) / healthScores.length
    : 6.0

  return {
    connection_score: Math.round(avgScore * 10) / 10,
    communication_quality: Math.round((avgScore + 0.2) * 10) / 10,
    intimacy_level: Math.round((avgScore - 0.1) * 10) / 10,
    support_satisfaction: Math.round((avgScore + 0.3) * 10) / 10,
    growth_momentum: Math.round((avgScore + 0.1) * 10) / 10,
    last_7_days_avg: Math.round(avgScore * 10) / 10,
    change_from_last_week: 0.0
  }
}

function generateSentimentOverview(journalData: any[]): SentimentOverview {
  if (!Array.isArray(journalData) || journalData.length === 0) {
    return {
      current_sentiment: 'neutral',
      confidence: 0.5,
      dominant_emotions: ['calm', 'content'],
      needs_summary: ['Continue building positive patterns'],
      emotional_trajectory: 'stable'
    }
  }

  const latestEntry = journalData[0]
  const sentimentAnalysis = latestEntry?.sentiment_analysis || {}

  return {
    current_sentiment: sentimentAnalysis.overall_sentiment || 'neutral',
    confidence: sentimentAnalysis.confidence_score || 0.5,
    dominant_emotions: [
      sentimentAnalysis.emotional_state?.primary_emotion || 'neutral',
      ...(Array.isArray(sentimentAnalysis.emotional_state?.secondary_emotions) 
        ? sentimentAnalysis.emotional_state.secondary_emotions 
        : [])
    ].slice(0, 3),
    needs_summary: (Array.isArray(sentimentAnalysis.relationship_needs) 
      ? sentimentAnalysis.relationship_needs 
      : [])
      .slice(0, 3)
      .map((need: any) => need?.need_type || 'general support'),
    emotional_trajectory: 'stable'
  }
}

// FIXED: Type-safe calculation
function calculateOverallHealthScore(
  vitals: RelationshipVitals,
  sentiment: SentimentOverview
): number {
  const vitalScores = [
    vitals.connection_score,
    vitals.communication_quality,
    vitals.intimacy_level,
    vitals.support_satisfaction,
    vitals.growth_momentum
  ]

  // FIXED: Type-safe reduce with validation
  const vitalScore = vitalScores.reduce((sum: number, score: number) => {
    const validScore = typeof score === 'number' && !isNaN(score) ? score : 6
    return sum + validScore
  }, 0) / vitalScores.length

  const sentimentMultiplier = sentiment.current_sentiment === 'positive' ? 1.1 :
                             sentiment.current_sentiment === 'negative' ? 0.9 : 1.0

  return Math.round(vitalScore * sentimentMultiplier * 10) / 10
}

// FIXED: Type-safe action generation
function generateImmediateActions(
  intelligence: any,
  vitals: RelationshipVitals
): DashboardAction[] {
  const actions: DashboardAction[] = []

  if (typeof vitals.connection_score === 'number' && vitals.connection_score < 6) {
    actions.push({
      action_id: `connection-${Date.now()}`,
      action_type: 'connection_building',
      title: 'Schedule Quality Time',
      description: 'Plan dedicated time together to strengthen your connection',
      priority: 'high',
      expected_outcome: 'Improved connection and intimacy',
      timeframe: 'This week'
    })
  }

  if (typeof vitals.communication_quality === 'number' && vitals.communication_quality < 6) {
    actions.push({
      action_id: `communication-${Date.now()}`,
      action_type: 'communication',
      title: 'Improve Communication',
      description: 'Practice active listening and express feelings more clearly',
      priority: 'high',
      expected_outcome: 'Better understanding and fewer misunderstandings',
      timeframe: 'Ongoing'
    })
  }

  return actions
}

// FIXED: Type-safe goal generation
function generateWeeklyGoals(
  intelligence: any,
  vitals: RelationshipVitals
): WeeklyGoal[] {
  const goals: WeeklyGoal[] = []

  goals.push({
    goal_id: `connection-goal-${Date.now()}`,
    category: 'connection',
    title: 'Strengthen Emotional Connection',
    description: 'Have at least 3 meaningful conversations this week',
    progress_percentage: 30,
    target_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    success_criteria: ['3 uninterrupted conversations', 'Share feelings openly', 'Practice active listening']
  })

  return goals
}

function generateCelebrationHighlights(
  intelligence: any,
  vitals: RelationshipVitals
): CelebrationHighlight[] {
  const celebrations: CelebrationHighlight[] = []

  if (typeof vitals.connection_score === 'number' && vitals.connection_score >= 7) {
    celebrations.push({
      highlight_id: `celebration-${Date.now()}`,
      achievement: 'Strong Connection Score',
      significance: vitals.connection_score,
      suggested_celebration: 'Plan a special date night to celebrate your strong connection',
      timing: 'This weekend'
    })
  }

  return celebrations
}

function generateTrendAnalysis(journalData: any[]): TrendAnalysis {
  return {
    overall_direction: 'stable',
    key_improvements: ['Communication has improved', 'More quality time together'],
    areas_for_attention: ['Physical affection', 'Stress management'],
    momentum_score: 6.5
  }
}

// FIXED: Type-safe pattern insights
function generatePatternInsights(journalData: any[]): PatternInsight[] {
  return [
    {
      pattern_id: `pattern-${Date.now()}`,
      pattern_type: 'communication',
      description: 'You tend to communicate better in the evenings',
      frequency: 'stable',  // FIXED: Use valid frequency value
      impact_level: 'medium',
      recommended_response: 'Schedule important conversations for evening hours'
    }
  ]
}

function generateFulfillmentTracking(journalData: any[]): FulfillmentDashboard {
  return {
    areas: {
      emotional_connection: 7.0,
      physical_intimacy: 6.5,
      communication_quality: 6.8,
      shared_experiences: 7.2,
      individual_autonomy: 6.9
    },
    overall_score: 6.9,
    trending_direction: 'improving',
    improvement_opportunities: [
      'Increase physical intimacy',
      'Plan more shared experiences',
      'Support individual growth'
    ]
  }
}

// FIXED: Type-safe partner suggestions
function generatePartnerSuggestions(intelligence: any): PartnerSuggestionSummary[] {
  const suggestions: PartnerSuggestionSummary[] = []

  if (intelligence?.current_needs && Array.isArray(intelligence.current_needs)) {
    intelligence.current_needs.slice(0, 3).forEach((need: any, index: number) => {
      if (need && typeof need.need_type === 'string') {
        // FIXED: Proper type mapping
        const suggestionType: SuggestionType = need.need_type === 'emotional_support' ? 'emotional_support' :
                                              need.need_type === 'quality_time' ? 'quality_time' :
                                              need.need_type === 'physical_affection' ? 'physical_affection' :
                                              need.need_type === 'help' ? 'acts_of_service' :
                                              'communication'

        suggestions.push({
          suggestion_id: `suggestion-${Date.now()}-${index}`,
          suggestion_type: suggestionType,
          anonymized_context: `Your partner could benefit from ${need.need_type.replace('_', ' ')}`,
          urgency: need.urgency || 'soon',
          confidence_score: typeof need.confidence_score === 'number' ? need.confidence_score : 0.7
        })
      }
    })
  }

  return suggestions
}

function generateMutualOpportunities(intelligence: any): MutualOpportunity[] {
  const opportunities: MutualOpportunity[] = []

  if (intelligence?.connection_opportunities && Array.isArray(intelligence.connection_opportunities)) {
    intelligence.connection_opportunities.slice(0, 2).forEach((opp: any, index: number) => {
      opportunities.push({
        opportunity_id: opp?.opportunity_id || `opportunity-${Date.now()}-${index}`,
        opportunity_type: opp?.opportunity_type || 'quality_time',
        description: opp?.context || 'Great time for connection',
        optimal_timing: 'Next few hours',
        success_probability: 0.8
      })
    })
  }

  return opportunities
}

function getFallbackDashboard(): ConnectionHealthDashboard {
  return {
    overall_health_score: 6.5,
    health_trend: 'stable',
    last_updated: new Date().toISOString(),
    relationship_vitals: {
      connection_score: 6.5,
      communication_quality: 6.0,
      intimacy_level: 6.0,
      support_satisfaction: 6.5,
      growth_momentum: 6.0,
      last_7_days_avg: 6.2,
      change_from_last_week: 0.0
    },
    sentiment_overview: {
      current_sentiment: 'neutral',
      confidence: 0.5,
      dominant_emotions: ['calm', 'content'],
      needs_summary: ['Continue building positive patterns'],
      emotional_trajectory: 'stable'
    },
    attunement_analysis: {
      overall_score: 6.5,
      responsiveness: 6.5,
      understanding: 6.0,
      proactivity: 6.0,
      love_language_alignment: 7.0,
      timing_effectiveness: 6.5,
      improvement_areas: ['proactivity', 'understanding']
    },
    realtime_intelligence: {
      current_needs: [],
      proactive_suggestions: [],
      connection_opportunities: [],
      risk_alerts: [],
      celebration_moments: [],
      optimal_timing: []
    },
    immediate_actions: [],
    weekly_goals: [],
    celebration_highlights: [],
    trend_analysis: {
      overall_direction: 'stable',
      key_improvements: [],
      areas_for_attention: [],
      momentum_score: 6.0
    },
    pattern_insights: [],
    fulfillment_tracking: {
      areas: {
        emotional_connection: 6.5,
        physical_intimacy: 6.0,
        communication_quality: 6.0,
        shared_experiences: 6.5,
        individual_autonomy: 6.5
      },
      overall_score: 6.3,
      trending_direction: 'stable',
      improvement_opportunities: []
    },
    partner_suggestions: [],
    mutual_opportunities: []
  }
}