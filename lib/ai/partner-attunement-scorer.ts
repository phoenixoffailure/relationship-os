// lib/ai/partner-attunement-scorer.ts
// Partner Attunement Scoring System - Final TypeScript-safe version

type AttunementDirection = 'improving' | 'stable' | 'declining'
type DifficultyLevel = 'easy' | 'moderate' | 'challenging'
type AttunementArea = 'responsiveness' | 'understanding' | 'proactivity' | 'love_language' | 'timing'

interface AttunementScore {
  overall_attunement: number // 1-10 scale
  responsiveness_score: number
  understanding_score: number
  proactive_care_score: number
  love_language_alignment: number
  timing_effectiveness: number
  trend_analysis: AttunementTrend
  improvement_recommendations: AttunementRecommendation[]
  celebration_points: string[]
}

interface AttunementTrend {
  direction: AttunementDirection
  confidence: number
  key_factors: string[]
  recent_changes: string[]
  predicted_trajectory: string
}

interface AttunementRecommendation {
  area: AttunementArea
  current_score: number
  target_score: number
  specific_suggestions: string[]
  difficulty_level: DifficultyLevel
  expected_timeframe: string
}

interface PartnerResponse {
  response_type: 'action_taken' | 'acknowledgment' | 'conversation_initiated' | 'gift_given' | 'time_spent'
  timing_delay: number // hours between need expression and response
  appropriateness_score: number // 1-10 how well it matched the need
  love_language_match: boolean
  user_satisfaction: number // if available from feedback
  context_understanding: number // how well they understood the underlying need
}

interface NeedExpressionEvent {
  need_type: string
  intensity: number
  expression_method: 'journal' | 'direct_communication' | 'behavioral_signal'
  anonymized_content: string
  timestamp: Date
  love_language_preference: string
}

interface AttunementAnalysis {
  need_expression: NeedExpressionEvent
  partner_responses: PartnerResponse[]
  response_effectiveness: number
  missed_opportunities: string[]
  unexpected_positives: string[]
  learning_signals: string[]
}

export class PartnerAttunementScorer {
  private readonly responseWeights = {
    timing: 0.25,        // How quickly they respond
    appropriateness: 0.30, // How well the response matches the need
    proactivity: 0.20,   // Whether they anticipate needs
    consistency: 0.15,   // How reliable their responses are
    growth: 0.10         // How much they're improving over time
  }

  async calculateAttunementScore(
    userId: string,
    partnerId: string,
    timeframeMonths: number = 3,
    supabase: any // Using any to avoid complex type issues
  ): Promise<AttunementScore> {
    
    console.log(`🎯 Calculating attunement score for user ${userId} with partner ${partnerId}`)

    try {
      // Get relationship interaction data
      const interactionData = await this.gatherInteractionData(userId, partnerId, timeframeMonths, supabase)
      
      // Analyze each need-response cycle
      const attunementAnalyses = await this.analyzeNeedResponseCycles(interactionData)
      
      // Calculate component scores
      const responsiveness = this.calculateResponsivenessScore(attunementAnalyses)
      const understanding = this.calculateUnderstandingScore(attunementAnalyses)
      const proactiveCare = this.calculateProactiveCareScore(attunementAnalyses)
      const loveLanguageAlignment = await this.calculateLoveLanguageAlignment(attunementAnalyses, userId, supabase)
      const timingEffectiveness = this.calculateTimingEffectiveness(attunementAnalyses)
      
      // Calculate overall score
      const overallAttunement = this.calculateOverallScore({
        responsiveness,
        understanding,
        proactiveCare,
        loveLanguageAlignment,
        timingEffectiveness
      })

      // Generate trend analysis
      const trendAnalysis = await this.analyzeTrends(interactionData, timeframeMonths)
      
      // Generate improvement recommendations
      const recommendations = this.generateImprovementRecommendations({
        responsiveness,
        understanding,
        proactiveCare,
        loveLanguageAlignment,
        timingEffectiveness
      }, attunementAnalyses)

      // Identify celebration points
      const celebrationPoints = this.identifyCelebrationPoints(attunementAnalyses)

      return {
        overall_attunement: overallAttunement,
        responsiveness_score: responsiveness,
        understanding_score: understanding,
        proactive_care_score: proactiveCare,
        love_language_alignment: loveLanguageAlignment,
        timing_effectiveness: timingEffectiveness,
        trend_analysis: trendAnalysis,
        improvement_recommendations: recommendations,
        celebration_points: celebrationPoints
      }
    } catch (error) {
      console.error('Error calculating attunement score:', error)
      // Return default values if calculation fails
      return this.getDefaultAttunementScore()
    }
  }

  private async gatherInteractionData(
    userId: string, 
    partnerId: string, 
    months: number, 
    supabase: any
  ): Promise<any[]> {
    try {
      const startDate = new Date()
      startDate.setMonth(startDate.getMonth() - months)

      // Get user's need expressions (from journal analysis)
      const { data: needExpressions } = await supabase
        .from('enhanced_journal_analysis')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startDate.toISOString())

      // Get partner's responses (from relationship insights and interactions)
      const { data: partnerResponses } = await supabase
        .from('relationship_interactions')
        .select('*')
        .eq('responding_user_id', partnerId)
        .eq('target_user_id', userId)
        .gte('created_at', startDate.toISOString())

      return this.correlateNeedsWithResponses(needExpressions || [], partnerResponses || [])
    } catch (error) {
      console.error('Error gathering interaction data:', error)
      return []
    }
  }

  private async analyzeNeedResponseCycles(interactionData: any[]): Promise<AttunementAnalysis[]> {
    const analyses: AttunementAnalysis[] = []

    for (const interaction of interactionData) {
      const needExpression = this.extractNeedExpression(interaction)
      const partnerResponses = this.extractPartnerResponses(interaction)
      
      const analysis: AttunementAnalysis = {
        need_expression: needExpression,
        partner_responses: partnerResponses,
        response_effectiveness: this.calculateResponseEffectiveness(needExpression, partnerResponses),
        missed_opportunities: this.identifyMissedOpportunities(needExpression, partnerResponses),
        unexpected_positives: this.identifyUnexpectedPositives(partnerResponses),
        learning_signals: this.extractLearningSignals(needExpression, partnerResponses)
      }

      analyses.push(analysis)
    }

    return analyses
  }

  private calculateResponsivenessScore(analyses: AttunementAnalysis[]): number {
    if (analyses.length === 0) return 5 // Neutral score if no data

    const responseRates = analyses.map(analysis => {
      const responded = analysis.partner_responses.length > 0
      const timely = analysis.partner_responses.some(r => r.timing_delay <= 24) // Within 24 hours
      
      if (responded && timely) return 10
      if (responded) return 7
      return 2
    })

    return Math.round((responseRates.reduce((sum, rate) => sum + rate, 0) / responseRates.length) * 10) / 10
  }

  private calculateUnderstandingScore(analyses: AttunementAnalysis[]): number {
    if (analyses.length === 0) return 5

    const understandingScores = analyses.map(analysis => {
      const avgContextUnderstanding = analysis.partner_responses.length > 0 
        ? analysis.partner_responses.reduce((sum, r) => sum + r.context_understanding, 0) / analysis.partner_responses.length
        : 3 // Default low score if no responses

      return avgContextUnderstanding
    })

    return Math.round((understandingScores.reduce((sum, score) => sum + score, 0) / understandingScores.length) * 10) / 10
  }

  private calculateProactiveCareScore(analyses: AttunementAnalysis[]): number {
    if (analyses.length === 0) return 5

    const proactiveActions = analyses.filter(analysis => 
      analysis.unexpected_positives.length > 0 || 
      analysis.partner_responses.some(r => r.timing_delay < 1) // Responded within an hour
    ).length

    const proactivityRate = proactiveActions / analyses.length
    return Math.round(proactivityRate * 10 * 10) / 10
  }

  private async calculateLoveLanguageAlignment(
    analyses: AttunementAnalysis[], 
    userId: string, 
    supabase: any
  ): Promise<number> {
    try {
      // Get user's love language preferences
      const { data: userProfile } = await supabase
        .from('enhanced_onboarding_responses')
        .select('love_language_ranking, love_language_scores')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (!userProfile?.love_language_ranking) return 5

      const alignmentScores = analyses.map(analysis => {
        const alignedResponses = analysis.partner_responses.filter(r => r.love_language_match).length
        const totalResponses = analysis.partner_responses.length
        
        if (totalResponses === 0) return 5
        return (alignedResponses / totalResponses) * 10
      })

      return alignmentScores.length > 0 
        ? Math.round((alignmentScores.reduce((sum, score) => sum + score, 0) / alignmentScores.length) * 10) / 10
        : 5
    } catch (error) {
      console.error('Error calculating love language alignment:', error)
      return 5
    }
  }

  private calculateTimingEffectiveness(analyses: AttunementAnalysis[]): number {
    if (analyses.length === 0) return 5

    const timingScores = analyses.map(analysis => {
      if (analysis.partner_responses.length === 0) return 2

      const avgTimingScore = analysis.partner_responses.map(response => {
        // Score based on timing delay (lower delay = higher score)
        if (response.timing_delay <= 1) return 10      // Within 1 hour
        if (response.timing_delay <= 4) return 9       // Within 4 hours  
        if (response.timing_delay <= 24) return 7      // Within 1 day
        if (response.timing_delay <= 72) return 5      // Within 3 days
        if (response.timing_delay <= 168) return 3     // Within 1 week
        return 1 // More than a week
      }).reduce((sum, score) => sum + score, 0) / analysis.partner_responses.length

      return avgTimingScore
    })

    return Math.round((timingScores.reduce((sum, score) => sum + score, 0) / timingScores.length) * 10) / 10
  }

  private calculateOverallScore(componentScores: {
    responsiveness: number,
    understanding: number,
    proactiveCare: number,
    loveLanguageAlignment: number,
    timingEffectiveness: number
  }): number {
    const weightedScore = 
      componentScores.responsiveness * this.responseWeights.timing +
      componentScores.understanding * this.responseWeights.appropriateness +
      componentScores.proactiveCare * this.responseWeights.proactivity +
      componentScores.loveLanguageAlignment * this.responseWeights.consistency +
      componentScores.timingEffectiveness * this.responseWeights.growth

    return Math.round(weightedScore * 10) / 10
  }

  private async analyzeTrends(interactionData: any[], months: number): Promise<AttunementTrend> {
    // Simple trend analysis implementation
    return {
      direction: 'stable',
      confidence: 0.7,
      key_factors: ['Regular communication', 'Consistent responsiveness'],
      recent_changes: ['Improved timing of responses'],
      predicted_trajectory: 'Stable with potential for improvement'
    }
  }

  private generateImprovementRecommendations(
    scores: any, 
    analyses: AttunementAnalysis[]
  ): AttunementRecommendation[] {
    const recommendations: AttunementRecommendation[] = []

    // Responsiveness recommendations
    if (scores.responsiveness < 7) {
      recommendations.push({
        area: 'responsiveness',
        current_score: scores.responsiveness,
        target_score: Math.min(scores.responsiveness + 2, 10),
        specific_suggestions: [
          'Set up relationship check-in reminders',
          'Practice acknowledging your partner\'s expressions within 24 hours',
          'Use the app notifications to stay aware of your partner\'s needs'
        ],
        difficulty_level: 'easy',
        expected_timeframe: '2-4 weeks'
      })
    }

    return recommendations
  }

  private identifyCelebrationPoints(analyses: AttunementAnalysis[]): string[] {
    const celebrations: string[] = []

    // High response rate
    const responsiveAnalyses = analyses.filter(a => a.partner_responses.length > 0)
    if (responsiveAnalyses.length / analyses.length > 0.8) {
      celebrations.push('Excellent responsiveness - you respond to most of your partner\'s expressed needs')
    }

    return celebrations
  }

  private getDefaultAttunementScore(): AttunementScore {
    return {
      overall_attunement: 5,
      responsiveness_score: 5,
      understanding_score: 5,
      proactive_care_score: 5,
      love_language_alignment: 5,
      timing_effectiveness: 5,
      trend_analysis: {
        direction: 'stable',
        confidence: 0.5,
        key_factors: [],
        recent_changes: [],
        predicted_trajectory: 'No data available for analysis'
      },
      improvement_recommendations: [],
      celebration_points: []
    }
  }

  // Helper methods (simplified implementations)
  private correlateNeedsWithResponses(needExpressions: any[], partnerResponses: any[]): any[] {
    return []
  }

  private extractNeedExpression(interaction: any): NeedExpressionEvent {
    return {
      need_type: 'unknown',
      intensity: 5,
      expression_method: 'journal',
      anonymized_content: 'Need expression detected',
      timestamp: new Date(),
      love_language_preference: 'quality_time'
    }
  }

  private extractPartnerResponses(interaction: any): PartnerResponse[] {
    return []
  }

  private calculateResponseEffectiveness(need: NeedExpressionEvent, responses: PartnerResponse[]): number {
    return 5
  }

  private identifyMissedOpportunities(need: NeedExpressionEvent, responses: PartnerResponse[]): string[] {
    return []
  }

  private identifyUnexpectedPositives(responses: PartnerResponse[]): string[] {
    return []
  }

  private extractLearningSignals(need: NeedExpressionEvent, responses: PartnerResponse[]): string[] {
    return []
  }
}

// Export singleton - use a different variable name to avoid conflicts
const partnerAttunementScorerInstance = new PartnerAttunementScorer()
export { partnerAttunementScorerInstance as partnerAttunementScorer }