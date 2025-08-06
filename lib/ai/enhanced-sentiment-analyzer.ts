// lib/ai/enhanced-sentiment-analyzer.ts
// Enhanced Sentiment Analysis System for Relationship Intelligence
// PHASE 3: Added relationship-type awareness to existing system

// Keep all existing types
type OverallSentiment = 'positive' | 'neutral' | 'negative' | 'mixed'
type NeedType = 'intimacy' | 'space' | 'quality_time' | 'support' | 'communication' | 'validation'
type Urgency = 'immediate' | 'soon' | 'ongoing' | 'low'
type IndicatorType = 'closeness' | 'distance' | 'conflict' | 'harmony' | 'growth' | 'stagnation'
type TrendDirection = 'increasing' | 'decreasing' | 'stable'
type EmotionalTrend = 'improving' | 'stable' | 'declining'
type FulfillmentArea = 'physical_intimacy' | 'emotional_connection' | 'communication' | 'shared_activities' | 'individual_growth'

// NEW: Add relationship type awareness
type RelationshipType = 'romantic' | 'family' | 'friend' | 'work' | 'other'

interface RelationshipSentiment {
  overall_sentiment: OverallSentiment
  confidence_score: number
  emotional_state: EmotionalState
  relationship_needs: RelationshipNeed[]
  connection_indicators: ConnectionIndicator[]
  fulfillment_metrics: FulfillmentMetric[]
  suggestion_triggers: SuggestionTrigger[]
  // NEW: Add relationship-type specific analysis
  relationship_adaptation?: RelationshipAdaptation
}

// NEW: Relationship-specific adaptation data
interface RelationshipAdaptation {
  relationship_type: RelationshipType
  tone_adjustments: {
    formality_level: 'casual' | 'semi_formal' | 'formal'
    emotional_intensity: 'high' | 'medium' | 'low'
    directness: 'direct' | 'indirect' | 'diplomatic'
  }
  expectation_adjustments: {
    response_urgency_modifier: number // -0.5 to +0.5
    intimacy_expectation_level: number // 1-10
    conflict_sensitivity: 'high' | 'medium' | 'low'
  }
  suggestion_adaptations: {
    appropriate_actions: string[]
    avoid_suggestions: string[]
    preferred_timing: string
  }
}

interface EmotionalState {
  primary_emotion: string
  secondary_emotions: string[]
  intensity_level: number // 1-10
  emotional_trend: EmotionalTrend
  stress_indicators: string[]
  joy_indicators: string[]
}

interface RelationshipNeed {
  need_type: NeedType
  intensity: number // 1-10
  urgency: Urgency
  love_language_alignment: string[]
  specific_indicators: string[]
  partner_action_suggestion: string
}

interface ConnectionIndicator {
  indicator_type: IndicatorType
  strength: number // 1-10
  evidence: string[]
  trend_direction: TrendDirection
}

interface FulfillmentMetric {
  area: FulfillmentArea
  current_level: number // 1-10
  desired_level: number // 1-10
  gap_analysis: string
  improvement_potential: string[]
}

interface SuggestionTrigger {
  trigger_type: 'immediate' | 'weekly' | 'ongoing' | 'milestone'
  priority: 'high' | 'medium' | 'low'
  suggested_action: string
  target_recipient: 'user' | 'partner' | 'both'
  expected_impact: string
}

interface RelationshipPattern {
  keywords: string[]
  phrases: string[]
  emotional_signals: string[]
  intensity_modifiers: string[]
}

// Type-safe user profile interface
interface UserProfile {
  love_language_ranking?: string[]
  communication_style?: string
  [key: string]: any
}

// Enhanced relationship context interface
interface RelationshipContext {
  relationship_type?: RelationshipType
  relationship_id?: string
  partner_id?: string
  perceived_closeness?: number
  communication_frequency?: string
  relationship_duration_days?: number
  relationship_count?: number
  partners?: any[]
  [key: string]: any
}

export class EnhancedSentimentAnalyzer {
  // NEW: Relationship-type specific configurations
  private readonly relationshipTypeConfigs = {
    romantic: {
      intimacy_weight: 1.2,
      emotional_intensity_modifier: 1.1,
      urgency_threshold_adjust: -0.5,
      appropriate_needs: ['intimacy', 'quality_time', 'validation', 'communication', 'support'],
      tone: { formality_level: 'casual', emotional_intensity: 'high', directness: 'direct' },
      timing_preferences: 'immediate_to_same_day',
      conflict_sensitivity: 'high'
    },
    family: {
      intimacy_weight: 0.7,
      emotional_intensity_modifier: 0.9,
      urgency_threshold_adjust: 0.0,
      appropriate_needs: ['support', 'communication', 'space', 'validation'],
      tone: { formality_level: 'casual', emotional_intensity: 'medium', directness: 'diplomatic' },
      timing_preferences: 'same_day_to_few_days',
      conflict_sensitivity: 'medium'
    },
    friend: {
      intimacy_weight: 0.5,
      emotional_intensity_modifier: 0.8,
      urgency_threshold_adjust: 0.5,
      appropriate_needs: ['quality_time', 'support', 'communication', 'space'],
      tone: { formality_level: 'casual', emotional_intensity: 'medium', directness: 'direct' },
      timing_preferences: 'few_days_to_week',
      conflict_sensitivity: 'low'
    },
    work: {
      intimacy_weight: 0.2,
      emotional_intensity_modifier: 0.6,
      urgency_threshold_adjust: 0.8,
      appropriate_needs: ['communication', 'support', 'space'],
      tone: { formality_level: 'formal', emotional_intensity: 'low', directness: 'diplomatic' },
      timing_preferences: 'business_hours_only',
      conflict_sensitivity: 'low'
    },
    other: {
      intimacy_weight: 0.6,
      emotional_intensity_modifier: 0.8,
      urgency_threshold_adjust: 0.3,
      appropriate_needs: ['communication', 'support', 'quality_time', 'space'],
      tone: { formality_level: 'semi_formal', emotional_intensity: 'medium', directness: 'diplomatic' },
      timing_preferences: 'flexible',
      conflict_sensitivity: 'medium'
    }
  } as const

  private readonly relationshipPatterns: Record<string, RelationshipPattern> = {
    intimacy_craving: {
      keywords: ['lonely', 'distant', 'miss you', 'close', 'touch', 'cuddle', 'intimate', 'connected'],
      phrases: [
        'feel far apart', 'miss being close', 'want to feel connected', 
        'need more intimacy', 'feeling disconnected', 'crave closeness'
      ],
      emotional_signals: ['longing', 'sadness', 'yearning', 'emptiness'],
      intensity_modifiers: ['really', 'so', 'very', 'extremely', 'desperately']
    },
    space_needs: {
      keywords: ['overwhelmed', 'space', 'alone', 'breathing room', 'independence', 'crowded'],
      phrases: [
        'need some space', 'feeling overwhelmed', 'need time alone', 
        'too much together', 'need independence', 'feeling suffocated'
      ],
      emotional_signals: ['stress', 'anxiety', 'fatigue', 'irritation'],
      intensity_modifiers: ['really', 'desperately', 'badly', 'urgently']
    },
    quality_time_desire: {
      keywords: ['busy', 'distracted', 'phones', 'attention', 'present', 'focus', 'together'],
      phrases: [
        'always on phone', 'not paying attention', 'want quality time',
        'feel ignored', 'distracted lately', 'miss spending time'
      ],
      emotional_signals: ['neglect', 'frustration', 'sadness', 'longing'],
      intensity_modifiers: ['constantly', 'always', 'never', 'barely']
    },
    communication_gaps: {
      keywords: ['misunderstood', 'listen', 'hear', 'talk', 'express', 'communicate'],
      phrases: [
        'not listening', 'dont understand', 'not hearing me',
        'cant express', 'miscommunication', 'talking past each other'
      ],
      emotional_signals: ['frustration', 'isolation', 'anger', 'sadness'],
      intensity_modifiers: ['never', 'always', 'constantly', 'completely']
    },
    support_seeking: {
      keywords: ['support', 'help', 'stressed', 'struggle', 'difficult', 'hard'],
      phrases: [
        'need support', 'going through tough time', 'need help',
        'feeling overwhelmed', 'struggling with', 'having hard time'
      ],
      emotional_signals: ['vulnerability', 'stress', 'fatigue', 'uncertainty'],
      intensity_modifiers: ['really', 'very', 'extremely', 'completely']
    },
    appreciation_expressing: {
      keywords: ['grateful', 'appreciate', 'thankful', 'love', 'amazing', 'wonderful'],
      phrases: [
        'so grateful for', 'appreciate you', 'thankful for',
        'love how you', 'amazing at', 'wonderful when'
      ],
      emotional_signals: ['gratitude', 'love', 'joy', 'contentment'],
      intensity_modifiers: ['so', 'really', 'incredibly', 'absolutely']
    }
  }

  private readonly emotionalLexicon = {
    positive: {
      high_intensity: ['ecstatic', 'thrilled', 'overjoyed', 'blissful', 'elated'],
      medium_intensity: ['happy', 'content', 'pleased', 'satisfied', 'glad'],
      low_intensity: ['okay', 'fine', 'alright', 'decent', 'peaceful']
    },
    negative: {
      high_intensity: ['devastated', 'furious', 'heartbroken', 'enraged', 'despair'],
      medium_intensity: ['sad', 'angry', 'frustrated', 'disappointed', 'hurt'],
      low_intensity: ['meh', 'annoyed', 'tired', 'bored', 'slightly upset']
    },
    relationship_specific: {
      connection: ['bonded', 'close', 'united', 'synchronized', 'in tune'],
      disconnection: ['distant', 'alone', 'misunderstood', 'isolated', 'separate'],
      growth: ['evolving', 'learning', 'improving', 'developing', 'progressing'],
      conflict: ['tense', 'arguing', 'disagreeing', 'clashing', 'friction']
    }
  }

  // ENHANCED: Main analysis method now includes relationship context
  async analyzeRelationshipSentiment(
    text: string, 
    userProfile?: UserProfile, 
    relationshipContext?: RelationshipContext
  ): Promise<RelationshipSentiment> {
    const cleanText = text.toLowerCase().trim()
    
    // NEW: Get relationship-type configuration
    const relationshipType = this.determineRelationshipType(relationshipContext)
    const typeConfig = this.relationshipTypeConfigs[relationshipType]
    
    // Step 1: Detect relationship needs (enhanced with relationship context)
    const relationship_needs = this.detectRelationshipNeeds(cleanText, userProfile, typeConfig)
    
    // Step 2: Analyze emotional state (enhanced with relationship context)
    const emotional_state = this.analyzeEmotionalState(cleanText, typeConfig)
    
    // Step 3: Assess connection indicators (enhanced)
    const connection_indicators = this.assessConnectionIndicators(cleanText, typeConfig)
    
    // Step 4: Calculate fulfillment metrics (relationship-aware)
    const fulfillment_metrics = this.calculateFulfillmentMetrics(
      cleanText, relationship_needs, emotional_state, typeConfig
    )
    
    // Step 5: Generate suggestion triggers (relationship-aware)
    const suggestion_triggers = this.generateSuggestionTriggers(
      relationship_needs, emotional_state, userProfile, typeConfig
    )
    
    // Step 6: Calculate overall sentiment (relationship-adjusted)
    const overall_sentiment = this.calculateOverallSentiment(
      emotional_state, relationship_needs, connection_indicators, typeConfig
    )

    // NEW: Step 7: Generate relationship adaptation data
    const relationship_adaptation = this.generateRelationshipAdaptation(
      relationshipType, typeConfig, relationship_needs
    )
    
    return {
      overall_sentiment,
      confidence_score: this.calculateConfidenceScore(cleanText, relationship_needs),
      emotional_state,
      relationship_needs,
      connection_indicators,
      fulfillment_metrics,
      suggestion_triggers,
      relationship_adaptation // NEW
    }
  }

  // NEW: Determine relationship type from context
  private determineRelationshipType(relationshipContext?: RelationshipContext): RelationshipType {
    if (!relationshipContext) return 'romantic'
    
    // Try to get from relationship_type field first
    if (relationshipContext.relationship_type) {
      return relationshipContext.relationship_type
    }
    
    // Try to get from relationship_stage field (fallback)
    if (relationshipContext.relationship_stage) {
      return relationshipContext.relationship_stage as RelationshipType
    }
    
    return 'romantic' // Default fallback
  }

  // ENHANCED: Detect needs with relationship-type awareness
  private detectRelationshipNeeds(
    text: string, 
    userProfile?: UserProfile, 
    typeConfig?: any
  ): RelationshipNeed[] {
    const needs: RelationshipNeed[] = []
    
    for (const [needType, patterns] of Object.entries(this.relationshipPatterns)) {
      // NEW: Skip inappropriate needs for relationship type
      const needTypeTyped = this.mapStringToNeedType(needType)
      if (needTypeTyped && typeConfig && !typeConfig.appropriate_needs.includes(needTypeTyped)) {
        continue // Skip this need type for this relationship type
      }

      const keywordMatches = patterns.keywords.filter(keyword => 
        text.includes(keyword)
      ).length
      
      const phraseMatches = patterns.phrases.filter(phrase => 
        text.includes(phrase)
      ).length
      
      const emotionalMatches = patterns.emotional_signals.filter(emotion => 
        text.includes(emotion)
      ).length
      
      const intensityMatches = patterns.intensity_modifiers.filter(modifier => 
        text.includes(modifier)
      ).length
      
      const totalMatches = keywordMatches + phraseMatches + emotionalMatches
      
      if (totalMatches > 0) {
        const baseIntensity = Math.min(totalMatches * 2, 8)
        const intensity = Math.min(baseIntensity + intensityMatches, 10)
        
        // NEW: Adjust urgency based on relationship type
        const adjustedUrgency = this.calculateAdjustedUrgency(intensity, typeConfig)
        
        if (needTypeTyped) {
          needs.push({
            need_type: needTypeTyped,
            intensity,
            urgency: adjustedUrgency,
            love_language_alignment: this.mapToLoveLanguages(needType),
            specific_indicators: [
              ...patterns.keywords.filter(k => text.includes(k)),
              ...patterns.phrases.filter(p => text.includes(p))
            ],
            // ENHANCED: Relationship-appropriate partner action
            partner_action_suggestion: this.generatePartnerActionSuggestion(needType, intensity, typeConfig)
          })
        }
      }
    }
    
    return needs.sort((a, b) => b.intensity - a.intensity)
  }

  // NEW: Calculate adjusted urgency based on relationship type
  private calculateAdjustedUrgency(baseIntensity: number, typeConfig?: any): Urgency {
    if (!typeConfig) {
      // Fallback to original logic
      return baseIntensity >= 8 ? 'immediate' : 
             baseIntensity >= 6 ? 'soon' : 
             baseIntensity >= 4 ? 'ongoing' : 'low'
    }

    const adjustedIntensity = baseIntensity + (typeConfig.urgency_threshold_adjust * 2)
    
    return adjustedIntensity >= 8 ? 'immediate' : 
           adjustedIntensity >= 6 ? 'soon' : 
           adjustedIntensity >= 4 ? 'ongoing' : 'low'
  }

  // ENHANCED: Emotional analysis with relationship context
  private analyzeEmotionalState(text: string, typeConfig?: any): EmotionalState {
    const emotions = { positive: 0, negative: 0, neutral: 0 }
    
    // Existing analysis logic...
    for (const [category, subcategories] of Object.entries(this.emotionalLexicon)) {
      if (category === 'relationship_specific') continue
      
      const typedSubcategories = subcategories as Record<string, string[]>
      for (const [intensity, words] of Object.entries(typedSubcategories)) {
        const matches = words.filter((word: string) => text.includes(word)).length
        const intensityMultiplier = intensity === 'high_intensity' ? 3 : 
                                  intensity === 'medium_intensity' ? 2 : 1
        
        if (category === 'positive') {
          emotions.positive += matches * intensityMultiplier
        } else if (category === 'negative') {
          emotions.negative += matches * intensityMultiplier
        }
      }
    }
    
    const totalEmotional = emotions.positive + emotions.negative
    const primary_emotion = totalEmotional === 0 ? 'neutral' :
                           emotions.positive > emotions.negative ? 'positive' : 'negative'
    
    // NEW: Apply relationship-type emotional intensity modifier
    let baseIntensity = Math.min(Math.max(totalEmotional, 1), 10)
    if (typeConfig) {
      baseIntensity = Math.round(baseIntensity * typeConfig.emotional_intensity_modifier)
    }
    
    return {
      primary_emotion,
      secondary_emotions: this.detectSecondaryEmotions(text),
      intensity_level: Math.min(Math.max(baseIntensity, 1), 10),
      emotional_trend: this.detectEmotionalTrend(text),
      stress_indicators: this.detectStressIndicators(text),
      joy_indicators: this.detectJoyIndicators(text)
    }
  }

  // NEW: Generate relationship adaptation data
  private generateRelationshipAdaptation(
    relationshipType: RelationshipType,
    typeConfig: any,
    needs: RelationshipNeed[]
  ): RelationshipAdaptation {
    return {
      relationship_type: relationshipType,
      tone_adjustments: typeConfig.tone,
      expectation_adjustments: {
        response_urgency_modifier: typeConfig.urgency_threshold_adjust,
        intimacy_expectation_level: Math.round(typeConfig.intimacy_weight * 8),
        conflict_sensitivity: typeConfig.conflict_sensitivity
      },
      suggestion_adaptations: {
        appropriate_actions: this.getAppropriateActions(relationshipType, needs),
        avoid_suggestions: this.getAvoidSuggestions(relationshipType),
        preferred_timing: typeConfig.timing_preferences
      }
    }
  }

  // NEW: Get relationship-appropriate actions
  private getAppropriateActions(relationshipType: RelationshipType, needs: RelationshipNeed[]): string[] {
    const actionMap = {
      romantic: ['plan quality time', 'express affection', 'have intimate conversation', 'physical touch'],
      family: ['schedule family time', 'offer practical support', 'respectful communication', 'set boundaries'],
      friend: ['hang out casually', 'offer support', 'plan fun activities', 'check in occasionally'],
      work: ['professional communication', 'collaborative problem-solving', 'respect boundaries', 'schedule meetings'],
      other: ['appropriate communication', 'mutual respect', 'helpful gestures', 'maintain connection']
    }
    return actionMap[relationshipType] || actionMap.other
  }

  // NEW: Get suggestions to avoid for relationship type
  private getAvoidSuggestions(relationshipType: RelationshipType): string[] {
    const avoidMap = {
      romantic: ['professional distance', 'formal communication'],
      family: ['inappropriate intimacy', 'professional boundaries'],
      friend: ['overly intense emotional involvement', 'daily check-ins'],
      work: ['personal intimacy', 'emotional intensity', 'off-hours contact'],
      other: ['assumptions about intimacy level', 'inappropriate boundaries']
    }
    return avoidMap[relationshipType] || []
  }

  // ENHANCED: Partner action suggestions with relationship awareness
  private generatePartnerActionSuggestion(needType: string, intensity: number, typeConfig?: any): string {
    if (!typeConfig) {
      return this.getOriginalPartnerActionSuggestion(needType, intensity)
    }

    const relationshipType = this.getRelationshipTypeFromConfig(typeConfig)
    
    const suggestions = {
      romantic: {
        'intimacy_craving': intensity >= 8 ? 
          'Plan immediate intimate quality time together - emotional and physical connection' :
          'Increase affection and emotional availability',
        'quality_time_desire': 'Plan focused, phone-free time together - your full attention',
        'communication_gaps': 'Have an important heart-to-heart conversation',
        'support_seeking': 'Offer emotional support and practical help',
        'space_needs': 'Give some breathing room while staying emotionally available'
      },
      family: {
        'support_seeking': 'Offer family support and practical assistance',
        'communication_gaps': 'Have a respectful family conversation about understanding',
        'space_needs': 'Respect their need for independence while staying connected',
        'quality_time_desire': 'Plan meaningful family time together'
      },
      friend: {
        'quality_time_desire': 'Plan a fun hangout or activity together',
        'support_seeking': 'Be there as a supportive friend - listen and offer help',
        'communication_gaps': 'Have an honest conversation as friends',
        'space_needs': 'Give them space while letting them know you care'
      },
      work: {
        'communication_gaps': 'Schedule a professional discussion to improve collaboration',
        'support_seeking': 'Offer appropriate workplace support and assistance',
        'space_needs': 'Respect professional boundaries and give them space to work'
      }
    }

    const typeKey = relationshipType as keyof typeof suggestions
    const needSuggestions = suggestions[typeKey]
    if (needSuggestions && needType in needSuggestions) {
      return needSuggestions[needType as keyof typeof needSuggestions]
    }

    return this.getOriginalPartnerActionSuggestion(needType, intensity)
  }

  private getRelationshipTypeFromConfig(typeConfig: any): RelationshipType {
    for (const [type, config] of Object.entries(this.relationshipTypeConfigs)) {
      if (config === typeConfig) {
        return type as RelationshipType
      }
    }
    return 'romantic'
  }

  // Keep all existing helper methods for backward compatibility...
  private mapStringToNeedType(needType: string): NeedType | null {
    const needTypeMap: Record<string, NeedType> = {
      'intimacy_craving': 'intimacy',
      'space_needs': 'space',
      'quality_time_desire': 'quality_time',
      'communication_gaps': 'communication',
      'support_seeking': 'support',
      'appreciation_expressing': 'validation'
    }
    return needTypeMap[needType] || null
  }

  private assessConnectionIndicators(text: string, typeConfig?: any): ConnectionIndicator[] {
    const indicators: ConnectionIndicator[] = []
    
    const connectionPatterns: Record<string, string[]> = {
      closeness: ['close', 'connected', 'together', 'bond', 'intimate', 'united'],
      distance: ['distant', 'apart', 'separate', 'alone', 'disconnected', 'isolated'],
      conflict: ['argue', 'fight', 'disagree', 'tension', 'conflict', 'clash'],
      harmony: ['harmony', 'sync', 'agreement', 'peaceful', 'balanced', 'flow'],
      growth: ['grow', 'learn', 'improve', 'develop', 'progress', 'evolve'],
      stagnation: ['stuck', 'same', 'routine', 'bored', 'stagnant', 'plateau']
    }
    
    for (const [type, keywords] of Object.entries(connectionPatterns)) {
      const matches = keywords.filter(keyword => text.includes(keyword))
      
      if (matches.length > 0) {
        const indicatorType = type as IndicatorType
        let strength = Math.min(matches.length * 2, 10)
        
        if (typeConfig && type === 'intimacy' && typeConfig.intimacy_weight) {
          strength = Math.round(strength * typeConfig.intimacy_weight)
        }
        
        indicators.push({
          indicator_type: indicatorType,
          strength: Math.min(Math.max(strength, 1), 10),
          evidence: matches,
          trend_direction: this.detectTrendDirection(text, type)
        })
      }
    }
    
    return indicators
  }

  private calculateFulfillmentMetrics(
    text: string, 
    needs: RelationshipNeed[], 
    emotional: EmotionalState,
    typeConfig?: any
  ): FulfillmentMetric[] {
    const areas: FulfillmentArea[] = ['physical_intimacy', 'emotional_connection', 'communication', 'shared_activities', 'individual_growth']
    
    return areas.map(area => {
      const relatedNeeds = needs.filter(need => 
        this.mapAreaToNeeds(area).includes(need.need_type)
      )
      
      let current_level = relatedNeeds.length > 0 ? 
        Math.max(1, 10 - Math.max(...relatedNeeds.map(n => n.intensity))) : 
        emotional.intensity_level

      if (typeConfig && area === 'physical_intimacy') {
        current_level = Math.round(current_level * typeConfig.intimacy_weight)
      }
      
      const desired_level = relatedNeeds.length > 0 ? 
        Math.min(10, current_level + Math.max(...relatedNeeds.map(n => n.intensity))) : 
        8
      
      return {
        area,
        current_level: Math.min(Math.max(current_level, 1), 10),
        desired_level,
        gap_analysis: this.generateGapAnalysis(area, current_level, desired_level),
        improvement_potential: this.generateImprovementPotential(area, relatedNeeds)
      }
    })
  }

  private generateSuggestionTriggers(
    needs: RelationshipNeed[], 
    emotional: EmotionalState,
    userProfile?: UserProfile,
    typeConfig?: any
  ): SuggestionTrigger[] {
    const triggers: SuggestionTrigger[] = []
    
    const immediateNeeds = needs.filter(need => need.urgency === 'immediate')
    immediateNeeds.forEach(need => {
      triggers.push({
        trigger_type: 'immediate',
        priority: 'high',
        suggested_action: need.partner_action_suggestion,
        target_recipient: 'partner',
        expected_impact: `Address ${need.need_type} need with intensity ${need.intensity}/10`
      })
    })
    
    if (emotional.stress_indicators.length > 0) {
      const stressAction = typeConfig ? 
        this.getRelationshipAppropriateStressResponse(typeConfig) :
        'Offer emotional support and check in on their wellbeing'
        
      triggers.push({
        trigger_type: 'immediate',
        priority: 'high',
        suggested_action: stressAction,
        target_recipient: 'partner',
        expected_impact: 'Provide stress relief and emotional validation'
      })
    }
    
    if (emotional.joy_indicators.length > 0) {
      triggers.push({
        trigger_type: 'ongoing',
        priority: 'medium',
        suggested_action: 'Continue activities that bring joy and celebrate positive moments',
        target_recipient: 'both',
        expected_impact: 'Reinforce positive relationship patterns'
      })
    }
    
    return triggers
  }

  private getRelationshipAppropriateStressResponse(typeConfig: any): string {
    const relationshipType = this.getRelationshipTypeFromConfig(typeConfig)
    
    const stressResponses = {
      romantic: 'Offer emotional support, physical comfort, and help with responsibilities',
      family: 'Provide family support and understanding - be available to help',
      friend: 'Be a supportive friend - offer to listen or help however you can',
      work: 'Offer appropriate workplace support and understanding',
      other: 'Provide appropriate support and understanding'
    }
    
    return stressResponses[relationshipType] || stressResponses.other
  }

  private calculateOverallSentiment(
    emotional: EmotionalState,
    needs: RelationshipNeed[],
    indicators: ConnectionIndicator[],
    typeConfig?: any
  ): OverallSentiment {
    const positiveScore = indicators
      .filter(i => ['closeness', 'harmony', 'growth'].includes(i.indicator_type))
      .reduce((sum, i) => sum + i.strength, 0)
    
    let negativeScore = indicators
      .filter(i => ['distance', 'conflict', 'stagnation'].includes(i.indicator_type))
      .reduce((sum, i) => sum + i.strength, 0) +
      needs.filter(n => n.urgency === 'immediate').length * 3

    if (typeConfig) {
      negativeScore = Math.round(negativeScore * (1 + typeConfig.urgency_threshold_adjust))
    }
    
    if (Math.abs(positiveScore - negativeScore) <= 2) return 'mixed'
    if (positiveScore > negativeScore) return 'positive'
    if (negativeScore > positiveScore) return 'negative'
    return 'neutral'
  }

  // Keep all existing helper methods
  private mapToLoveLanguages(needType: string): string[] {
    const mapping: Record<string, string[]> = {
      'intimacy_craving': ['physical_touch', 'quality_time'],
      'space_needs': ['acts_of_service', 'words_of_affirmation'],
      'quality_time_desire': ['quality_time', 'words_of_affirmation'],
      'communication_gaps': ['words_of_affirmation', 'quality_time'],
      'support_seeking': ['acts_of_service', 'words_of_affirmation'],
      'appreciation_expressing': ['words_of_affirmation', 'receiving_gifts']
    }
    return mapping[needType] || ['quality_time']
  }

  private getOriginalPartnerActionSuggestion(needType: string, intensity: number): string {
    const suggestions: Record<string, string> = {
      'intimacy_craving': intensity >= 8 ? 
        'Plan immediate quality intimate time together - physical closeness and emotional connection' :
        'Increase physical affection and emotional availability',
      'space_needs': intensity >= 8 ? 
        'Give them immediate space to breathe and recharge independently' :
        'Respect their need for some personal time and independence',
      'quality_time_desire': intensity >= 8 ? 
        'Schedule focused, phone-free time together as soon as possible' :
        'Plan some quality activities together without distractions',
      'communication_gaps': intensity >= 8 ? 
        'Have an important conversation about communication and understanding' :
        'Practice active listening and check for understanding',
      'support_seeking': intensity >= 8 ? 
        'Offer immediate help and emotional support for what they\'re facing' :
        'Be available to help and provide encouragement',
      'appreciation_expressing': 'Acknowledge their appreciation and reciprocate with gratitude'
    }
    return suggestions[needType] || 'Show care and attention to their emotional needs'
  }

  private calculateConfidenceScore(text: string, needs: RelationshipNeed[]): number {
    const textLength = text.length
    const needsDetected = needs.length
    const specificIndicators = needs.reduce((sum, need) => sum + need.specific_indicators.length, 0)
    
    const baseScore = Math.min(textLength / 50, 5) + needsDetected * 1.5 + specificIndicators * 0.5
    return Math.min(Math.round(baseScore * 10) / 10, 10)
  }

  // Keep all existing helper methods
  private detectSecondaryEmotions(text: string): string[] { return [] }
  private detectEmotionalTrend(text: string): EmotionalTrend { return 'stable' }
  private detectStressIndicators(text: string): string[] {
    const stressWords = ['stressed', 'overwhelmed', 'anxious', 'pressure', 'worried', 'exhausted']
    return stressWords.filter(word => text.includes(word))
  }
  private detectJoyIndicators(text: string): string[] {
    const joyWords = ['happy', 'excited', 'grateful', 'amazing', 'wonderful', 'love']
    return joyWords.filter(word => text.includes(word))
  }
  private detectTrendDirection(text: string, type: string): TrendDirection { return 'stable' }
  private mapAreaToNeeds(area: FulfillmentArea): NeedType[] {
    const mapping: Record<FulfillmentArea, NeedType[]> = {
      'physical_intimacy': ['intimacy'],
      'emotional_connection': ['intimacy', 'support'],
      'communication': ['communication'],
      'shared_activities': ['quality_time'],
      'individual_growth': ['space']
    }
    return mapping[area] || []
  }
  private generateGapAnalysis(area: FulfillmentArea, current: number, desired: number): string {
    const gap = desired - current
    if (gap <= 2) return `Minor gap in ${area} - small improvements needed`
    if (gap <= 5) return `Moderate gap in ${area} - focused attention required`
    return `Significant gap in ${area} - priority area for improvement`
  }
  private generateImprovementPotential(area: FulfillmentArea, needs: RelationshipNeed[]): string[] {
    return [`Focus on ${area} improvement`, 'Consistent effort over time']
  }
}

// Export singleton instance
export const enhancedSentimentAnalyzer = new EnhancedSentimentAnalyzer()