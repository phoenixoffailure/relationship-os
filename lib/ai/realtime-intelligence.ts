// lib/ai/realtime-intelligence.ts
// Real-time Relationship Intelligence System - Type Safe Version
// Fixed all complex type issues and undefined behavior

// FIXED: Comprehensive type definitions for all interfaces
type NeedType = 'emotional_support' | 'quality_time' | 'physical_affection' | 'space' | 'validation' | 'help'
type UrgencyLevel = 'immediate' | 'today' | 'this_week' | 'ongoing'
type DetectionSource = 'journal' | 'behavior_pattern' | 'schedule_analysis' | 'partner_feedback'
type SuggestionType = 'anticipatory_care' | 'mood_boost' | 'stress_prevention' | 'connection_building'
type OpportunityType = 'quality_time_window' | 'stress_relief_moment' | 'celebration_chance' | 'intimacy_opportunity'
type RiskType = 'emotional_distance' | 'stress_overload' | 'communication_breakdown' | 'burnout_warning'
type RiskSeverity = 'low' | 'moderate' | 'high' | 'critical'
type AchievementType = 'milestone_reached' | 'positive_pattern' | 'improvement_noted' | 'anniversary'
type AvailabilityType = 'available' | 'busy' | 'do_not_disturb' | 'flexible'

interface RealTimeIntelligenceData {
  current_needs: CurrentNeed[]
  proactive_suggestions: ProactiveSuggestion[]
  connection_opportunities: ConnectionOpportunity[]
  risk_alerts: RiskAlert[]
  celebration_moments: CelebrationMoment[]
  optimal_timing: OptimalTiming[]
}

interface CurrentNeed {
  need_id: string
  need_type: NeedType
  intensity_level: number // 1-10
  urgency: UrgencyLevel
  detected_from: DetectionSource
  confidence_score: number
  suggested_response: string
  optimal_timing: string
  love_language_match: string
}

interface ProactiveSuggestion {
  suggestion_id: string
  trigger_event: string
  suggestion_type: SuggestionType
  action_suggestion: string
  timing_window: string
  expected_impact: string
  difficulty_level: 'easy' | 'moderate' | 'significant'
  success_probability: number
}

interface ConnectionOpportunity {
  opportunity_id: string
  opportunity_type: OpportunityType
  timing: {
    start_time: Date
    duration_minutes: number
    timezone: string
  }
  context: string
  suggested_activities: string[]
  preparation_needed: string[]
  success_indicators: string[]
}

interface RiskAlert {
  alert_id: string
  risk_type: RiskType
  severity: RiskSeverity
  indicators: string[]
  recommended_interventions: string[]
  timeline_for_action: string
  escalation_plan: string[]
}

interface CelebrationMoment {
  moment_id: string
  achievement_type: AchievementType
  description: string
  significance_level: number // 1-10
  suggested_celebration: string[]
  timing_recommendation: string
}

interface OptimalTiming {
  activity_type: string
  optimal_windows: TimeWindow[]
  reasoning: string
  success_factors: string[]
  avoid_times: TimeWindow[]
}

interface TimeWindow {
  day_of_week?: string
  start_hour: number
  end_hour: number
  timezone: string
  confidence: number
}

interface UserContext {
  current_mood?: number
  stress_level?: number
  energy_level?: number
  availability?: AvailabilityType
  recent_patterns?: any[]
  relationship_status?: string
  partner_context?: any
}

// FIXED: Simplified Supabase interface for type safety
interface SupabaseClient {
  from: (table: string) => any
  [key: string]: any
}

class RealTimeIntelligence {
  private readonly patternThresholds = {
    stress_warning: 7,
    mood_concern: 4,
    connection_opportunity: 8,
    urgent_need: 8,
    celebration_worthy: 8
  }

  async generateRealTimeIntelligence(
    userId: string,
    partnerId?: string,
    supabase?: SupabaseClient
  ): Promise<RealTimeIntelligenceData> {
    console.log('🧠 Generating real-time relationship intelligence...')

    try {
      // Gather current context
      const userContext = await this.gatherCurrentContext(userId, supabase)
      const partnerContext = partnerId ? await this.gatherCurrentContext(partnerId, supabase) : null

      // Detect current needs
      const currentNeeds = await this.detectCurrentNeeds(userId, userContext, supabase)

      // Generate proactive suggestions
      const proactiveSuggestions = await this.generateProactiveSuggestions(
        userId, userContext, currentNeeds, supabase
      )

      // Identify connection opportunities
      const connectionOpportunities = await this.identifyConnectionOpportunities(
        userId, partnerId, userContext, partnerContext, supabase
      )

      // Check for risk alerts
      const riskAlerts = await this.detectRiskAlerts(
        userId, userContext, currentNeeds, supabase
      )

      // Find celebration moments
      const celebrationMoments = await this.findCelebrationMoments(
        userId, userContext, supabase
      )

      // Calculate optimal timing
      const optimalTiming = await this.calculateOptimalTiming(
        userId, userContext, currentNeeds
      )

      return {
        current_needs: currentNeeds,
        proactive_suggestions: proactiveSuggestions,
        connection_opportunities: connectionOpportunities,
        risk_alerts: riskAlerts,
        celebration_moments: celebrationMoments,
        optimal_timing: optimalTiming
      }

    } catch (error) {
      console.error('❌ Real-time intelligence error:', error)
      return this.getFallbackIntelligence()
    }
  }

  private async gatherCurrentContext(userId: string, supabase?: SupabaseClient): Promise<UserContext> {
    if (!supabase) {
      return {
        current_mood: 6,
        stress_level: 4,
        energy_level: 7,
        availability: 'available',
        recent_patterns: [],
        relationship_status: 'partnered'
      }
    }

    try {
      // Gather recent journal entries for mood/stress indicators
      const { data: journalData } = await supabase
        .from('enhanced_journal_analysis')
        .select('sentiment_analysis, relationship_health_score, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(5)

      // Gather availability data
      const { data: availabilityData } = await supabase
        .from('user_availability')
        .select('availability_type, energy_level, openness_to_connection')
        .eq('user_id', userId)
        .eq('date', new Date().toISOString().split('T')[0])
        .single()

      // Extract context from recent data
      const recentMood = journalData?.[0]?.sentiment_analysis?.emotional_state?.intensity || 6
      const recentHealthScore = journalData?.[0]?.relationship_health_score || 6
      const currentAvailability = availabilityData?.availability_type || 'available'
      const energyLevel = availabilityData?.energy_level || 7

      return {
        current_mood: recentMood,
        stress_level: Math.max(1, 10 - recentHealthScore), // Inverse of health score
        energy_level: energyLevel,
        availability: currentAvailability as AvailabilityType,
        recent_patterns: journalData || [],
        relationship_status: 'partnered'
      }

    } catch (error) {
      console.warn('Error gathering user context:', error)
      return {
        current_mood: 6,
        stress_level: 4,
        energy_level: 7,
        availability: 'available',
        recent_patterns: [],
        relationship_status: 'partnered'
      }
    }
  }

  private async detectCurrentNeeds(
    userId: string,
    context: UserContext,
    supabase?: SupabaseClient
  ): Promise<CurrentNeed[]> {
    const needs: CurrentNeed[] = []

    // Stress-based need detection
    if (context.stress_level && context.stress_level >= this.patternThresholds.stress_warning) {
      needs.push({
        need_id: `stress-support-${Date.now()}`,
        need_type: 'emotional_support',
        intensity_level: context.stress_level,
        urgency: context.stress_level >= 9 ? 'immediate' : 'today',
        detected_from: 'behavior_pattern',
        confidence_score: 0.9,
        suggested_response: 'Offer stress relief and emotional support',
        optimal_timing: 'Next available calm moment',
        love_language_match: await this.getPrimaryLoveLanguage(userId, supabase)
      })
    }

    // Low mood need detection
    if (context.current_mood && context.current_mood <= this.patternThresholds.mood_concern) {
      needs.push({
        need_id: `mood-boost-${Date.now()}`,
        need_type: 'emotional_support',
        intensity_level: Math.max(1, 10 - context.current_mood),
        urgency: context.current_mood <= 3 ? 'immediate' : 'today',
        detected_from: 'behavior_pattern',
        confidence_score: 0.8,
        suggested_response: 'Provide mood-lifting activities and emotional connection',
        optimal_timing: 'Soon, when both partners are available',
        love_language_match: await this.getPrimaryLoveLanguage(userId, supabase)
      })
    }

    // Energy-based needs
    if (context.energy_level && context.energy_level <= 3) {
      needs.push({
        need_id: `energy-support-${Date.now()}`,
        need_type: 'help',
        intensity_level: Math.max(1, 5 - context.energy_level),
        urgency: 'today',
        detected_from: 'behavior_pattern',
        confidence_score: 0.7,
        suggested_response: 'Offer practical help and reduce their responsibilities',
        optimal_timing: 'Soon, without requiring energy from them',
        love_language_match: 'acts_of_service'
      })
    }

    return needs.sort((a, b) => b.intensity_level - a.intensity_level)
  }

  private async generateProactiveSuggestions(
    userId: string,
    context: UserContext,
    currentNeeds: CurrentNeed[],
    supabase?: SupabaseClient
  ): Promise<ProactiveSuggestion[]> {
    const suggestions: ProactiveSuggestion[] = []

    // Generate suggestions based on current needs
    for (const need of currentNeeds.slice(0, 3)) { // Top 3 needs
      const suggestion = await this.createProactiveSuggestion(need, context)
      if (suggestion) {
        suggestions.push(suggestion)
      }
    }

    // Add pattern-based suggestions
    if (context.stress_level && context.stress_level > 6) {
      suggestions.push({
        suggestion_id: `stress-prevention-${Date.now()}`,
        trigger_event: 'Elevated stress detected',
        suggestion_type: 'stress_prevention',
        action_suggestion: 'Plan a relaxing evening activity or help with daily tasks',
        timing_window: 'This evening or tomorrow',
        expected_impact: 'Reduced stress and improved mood',
        difficulty_level: 'easy',
        success_probability: 0.8
      })
    }

    // Add connection-building suggestions
    if (context.current_mood && context.current_mood >= this.patternThresholds.connection_opportunity) {
      suggestions.push({
        suggestion_id: `connection-boost-${Date.now()}`,
        trigger_event: 'Partner in good mood',
        suggestion_type: 'connection_building',
        action_suggestion: 'Take advantage of positive mood for quality time or deeper conversation',
        timing_window: 'Next few hours while mood is positive',
        expected_impact: 'Strengthened emotional connection',
        difficulty_level: 'easy',
        success_probability: 0.9
      })
    }

    return suggestions.sort((a, b) => b.success_probability - a.success_probability)
  }

  private async createProactiveSuggestion(
    need: CurrentNeed,
    context: UserContext
  ): Promise<ProactiveSuggestion | null> {
    const suggestionMap: Record<NeedType, ProactiveSuggestion> = {
      emotional_support: {
        suggestion_id: `support-${Date.now()}`,
        trigger_event: 'Emotional support need detected',
        suggestion_type: 'anticipatory_care',
        action_suggestion: 'Reach out with a caring message or offer to listen',
        timing_window: need.urgency === 'immediate' ? 'Right now' : 'Within next few hours',
        expected_impact: 'Improved emotional state and connection',
        difficulty_level: 'easy',
        success_probability: 0.85
      },
      quality_time: {
        suggestion_id: `time-${Date.now()}`,
        trigger_event: 'Quality time need detected',
        suggestion_type: 'connection_building',
        action_suggestion: 'Suggest a focused activity together without distractions',
        timing_window: 'Next available mutual free time',
        expected_impact: 'Increased intimacy and bonding',
        difficulty_level: 'moderate',
        success_probability: 0.8
      },
      physical_affection: {
        suggestion_id: `affection-${Date.now()}`,
        trigger_event: 'Physical affection need detected',
        suggestion_type: 'connection_building',
        action_suggestion: 'Offer physical comfort through hugs, cuddling, or gentle touch',
        timing_window: 'When together and both comfortable',
        expected_impact: 'Increased physical intimacy and comfort',
        difficulty_level: 'easy',
        success_probability: 0.9
      },
      space: {
        suggestion_id: `space-${Date.now()}`,
        trigger_event: 'Need for space detected',
        suggestion_type: 'anticipatory_care',
        action_suggestion: 'Proactively give space while staying emotionally supportive',
        timing_window: 'Starting now and continuing as needed',
        expected_impact: 'Reduced pressure and maintained connection',
        difficulty_level: 'moderate',
        success_probability: 0.75
      },
      validation: {
        suggestion_id: `validation-${Date.now()}`,
        trigger_event: 'Validation need detected',
        suggestion_type: 'mood_boost',
        action_suggestion: 'Express specific appreciation and acknowledge their feelings',
        timing_window: 'Next conversation or interaction',
        expected_impact: 'Improved self-esteem and relationship satisfaction',
        difficulty_level: 'easy',
        success_probability: 0.9
      },
      help: {
        suggestion_id: `help-${Date.now()}`,
        trigger_event: 'Need for help detected',
        suggestion_type: 'anticipatory_care',
        action_suggestion: 'Offer specific, practical assistance with tasks or responsibilities',
        timing_window: 'As soon as possible',
        expected_impact: 'Reduced burden and increased appreciation',
        difficulty_level: 'moderate',
        success_probability: 0.8
      }
    }

    return suggestionMap[need.need_type] || null
  }

  private async identifyConnectionOpportunities(
    userId: string,
    partnerId?: string,
    userContext?: UserContext | null,
    partnerContext?: UserContext | null,
    supabase?: SupabaseClient
  ): Promise<ConnectionOpportunity[]> {
    const opportunities: ConnectionOpportunity[] = []

    // Check for mutual availability
    if (userContext?.availability === 'available' && partnerContext?.availability === 'available') {
      opportunities.push({
        opportunity_id: `mutual-available-${Date.now()}`,
        opportunity_type: 'quality_time_window',
        timing: {
          start_time: new Date(),
          duration_minutes: 60,
          timezone: 'local'
        },
        context: 'Both partners are currently available',
        suggested_activities: [
          'Take a walk together',
          'Have a meaningful conversation',
          'Cook or eat a meal together',
          'Share physical affection'
        ],
        preparation_needed: ['Clear distractions', 'Set aside time'],
        success_indicators: ['Uninterrupted time', 'Mutual engagement', 'Positive emotions']
      })
    }

    // Check for stress relief opportunities
    if (userContext?.stress_level && userContext.stress_level > 6) {
      opportunities.push({
        opportunity_id: `stress-relief-${Date.now()}`,
        opportunity_type: 'stress_relief_moment',
        timing: {
          start_time: new Date(),
          duration_minutes: 30,
          timezone: 'local'
        },
        context: 'Partner needs stress relief support',
        suggested_activities: [
          'Offer a shoulder massage',
          'Prepare a relaxing environment',
          'Listen without giving advice',
          'Help with pending tasks'
        ],
        preparation_needed: ['Create calm space', 'Clear own schedule'],
        success_indicators: ['Visible relaxation', 'Grateful response', 'Reduced stress signs']
      })
    }

    // Check for celebration opportunities
    if (userContext?.current_mood && userContext.current_mood >= 8) {
      opportunities.push({
        opportunity_id: `celebration-${Date.now()}`,
        opportunity_type: 'celebration_chance',
        timing: {
          start_time: new Date(),
          duration_minutes: 45,
          timezone: 'local'
        },
        context: 'Partner is in a great mood - perfect for celebration',
        suggested_activities: [
          'Acknowledge their positive energy',
          'Share in their excitement',
          'Plan a spontaneous fun activity',
          'Express appreciation for their joy'
        ],
        preparation_needed: ['Match their energy', 'Be present'],
        success_indicators: ['Shared joy', 'Increased connection', 'Positive memories']
      })
    }

    return opportunities.sort((a, b) => b.timing.duration_minutes - a.timing.duration_minutes)
  }

  private async detectRiskAlerts(
    userId: string,
    context: UserContext,
    currentNeeds: CurrentNeed[],
    supabase?: SupabaseClient
  ): Promise<RiskAlert[]> {
    const alerts: RiskAlert[] = []

    // Check for high stress with urgent needs
    if (context.stress_level && context.stress_level >= 8 && 
        currentNeeds.some(need => need.urgency === 'immediate')) {
      alerts.push({
        alert_id: `burnout-risk-${Date.now()}`,
        risk_type: 'burnout_warning',
        severity: context.stress_level >= 9 ? 'critical' : 'high',
        indicators: ['Very high stress level', 'Multiple urgent needs', 'Low energy'],
        recommended_interventions: [
          'Immediate stress relief measures',
          'Practical help with responsibilities',
          'Professional support consideration',
          'Schedule relief and recovery time'
        ],
        timeline_for_action: 'Within 24 hours',
        escalation_plan: [
          'Check in frequently',
          'Suggest professional help if needed',
          'Coordinate support network',
          'Monitor for improvement'
        ]
      })
    }

    // Check for emotional distance patterns
    if (context.current_mood && context.current_mood <= 3 && 
        currentNeeds.filter(need => need.need_type === 'emotional_support').length > 1) {
      alerts.push({
        alert_id: `distance-risk-${Date.now()}`,
        risk_type: 'emotional_distance',
        severity: 'moderate',
        indicators: ['Very low mood', 'Multiple emotional support needs', 'Potential withdrawal'],
        recommended_interventions: [
          'Gentle emotional outreach',
          'Create safe space for sharing',
          'Avoid overwhelming with solutions',
          'Be patient and consistent'
        ],
        timeline_for_action: 'This week',
        escalation_plan: [
          'Monitor mood changes',
          'Increase emotional availability',
          'Consider couples support'
        ]
      })
    }

    return alerts.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, moderate: 2, low: 1 }
      return severityOrder[b.severity] - severityOrder[a.severity]
    })
  }

  private async findCelebrationMoments(
    userId: string,
    context: UserContext,
    supabase?: SupabaseClient
  ): Promise<CelebrationMoment[]> {
    const celebrations: CelebrationMoment[] = []

    // Check for mood improvements
    if (context.current_mood && context.current_mood >= this.patternThresholds.celebration_worthy) {
      celebrations.push({
        moment_id: `mood-celebration-${Date.now()}`,
        achievement_type: 'positive_pattern',
        description: 'Partner is experiencing a notably positive mood',
        significance_level: context.current_mood,
        suggested_celebration: [
          'Acknowledge their positive energy',
          'Express joy in their happiness',
          'Suggest doing something fun together',
          'Share in their excitement'
        ],
        timing_recommendation: 'Right now while mood is high'
      })
    }

    // Check for low stress (recovery)
    if (context.stress_level && context.stress_level <= 3) {
      celebrations.push({
        moment_id: `stress-recovery-${Date.now()}`,
        achievement_type: 'improvement_noted',
        description: 'Partner has successfully managed stress levels',
        significance_level: Math.max(1, 10 - context.stress_level),
        suggested_celebration: [
          'Acknowledge their stress management',
          'Express pride in their resilience',
          'Suggest maintaining the positive momentum',
          'Plan relaxing activities to sustain wellbeing'
        ],
        timing_recommendation: 'Soon, to reinforce positive patterns'
      })
    }

    return celebrations.sort((a, b) => b.significance_level - a.significance_level)
  }

  private async calculateOptimalTiming(
    userId: string,
    context: UserContext,
    currentNeeds: CurrentNeed[]
  ): Promise<OptimalTiming[]> {
    const timing: OptimalTiming[] = []

    // Timing for emotional conversations
    if (currentNeeds.some(need => need.need_type === 'emotional_support')) {
      timing.push({
        activity_type: 'emotional_conversation',
        optimal_windows: [
          {
            start_hour: 19,
            end_hour: 21,
            timezone: 'local',
            confidence: 0.8
          }
        ],
        reasoning: 'Evening hours when both partners are typically more relaxed and available',
        success_factors: ['Both partners present', 'Minimal distractions', 'Calm environment'],
        avoid_times: [
          {
            start_hour: 7,
            end_hour: 9,
            timezone: 'local',
            confidence: 0.9
          }
        ]
      })
    }

    // Timing for quality time activities
    if (currentNeeds.some(need => need.need_type === 'quality_time')) {
      timing.push({
        activity_type: 'quality_time_activity',
        optimal_windows: [
          {
            day_of_week: 'weekend',
            start_hour: 10,
            end_hour: 16,
            timezone: 'local',
            confidence: 0.9
          }
        ],
        reasoning: 'Weekend daytime offers extended availability and energy for meaningful activities',
        success_factors: ['Mutual availability', 'Good energy levels', 'Shared interest'],
        avoid_times: [
          {
            start_hour: 22,
            end_hour: 24,
            timezone: 'local',
            confidence: 0.8
          }
        ]
      })
    }

    return timing
  }

  private async getPrimaryLoveLanguage(userId: string, supabase?: SupabaseClient): Promise<string> {
    if (!supabase) return 'quality_time'

    try {
      const { data } = await supabase
        .from('enhanced_onboarding_responses')
        .select('love_language_ranking')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      return data?.love_language_ranking?.[0] || 'quality_time'
    } catch (error) {
      return 'quality_time'
    }
  }

  private getFallbackIntelligence(): RealTimeIntelligenceData {
    // FIXED: Return properly typed arrays
    const fallback: RealTimeIntelligenceData = {
      current_needs: [] as CurrentNeed[],
      proactive_suggestions: [] as ProactiveSuggestion[],
      connection_opportunities: [] as ConnectionOpportunity[],
      risk_alerts: [] as RiskAlert[],
      celebration_moments: [] as CelebrationMoment[],
      optimal_timing: [] as OptimalTiming[]
    }
    return fallback
  }
}

// Export singleton instance
const realTimeIntelligence = new RealTimeIntelligence()
export { realTimeIntelligence }