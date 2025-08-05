// lib/ai/enhanced-sentiment-analyzer.ts
// Enhanced Sentiment Analysis System for Relationship Intelligence
// Fixed TypeScript version with proper type safety

// Define proper union types
type OverallSentiment = 'positive' | 'neutral' | 'negative' | 'mixed'
type NeedType = 'intimacy' | 'space' | 'quality_time' | 'support' | 'communication' | 'validation'
type Urgency = 'immediate' | 'soon' | 'ongoing' | 'low'
type IndicatorType = 'closeness' | 'distance' | 'conflict' | 'harmony' | 'growth' | 'stagnation'
type TrendDirection = 'increasing' | 'decreasing' | 'stable'
type EmotionalTrend = 'improving' | 'stable' | 'declining'
type FulfillmentArea = 'physical_intimacy' | 'emotional_connection' | 'communication' | 'shared_activities' | 'individual_growth'

interface RelationshipSentiment {
  overall_sentiment: OverallSentiment
  confidence_score: number
  emotional_state: EmotionalState
  relationship_needs: RelationshipNeed[]
  connection_indicators: ConnectionIndicator[]
  fulfillment_metrics: FulfillmentMetric[]
  suggestion_triggers: SuggestionTrigger[]
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

// Type-safe relationship context interface
interface RelationshipContext {
  relationship_count?: number
  partners?: any[]
  [key: string]: any
}

export class EnhancedSentimentAnalyzer {
  private readonly relationshipPatterns: Record<string, RelationshipPattern> = {
    // Advanced need recognition patterns
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

  async analyzeRelationshipSentiment(
    text: string, 
    userProfile?: UserProfile, 
    relationshipContext?: RelationshipContext
  ): Promise<RelationshipSentiment> {
    const cleanText = text.toLowerCase().trim()
    
    // Step 1: Detect relationship needs
    const relationship_needs = this.detectRelationshipNeeds(cleanText, userProfile)
    
    // Step 2: Analyze emotional state
    const emotional_state = this.analyzeEmotionalState(cleanText)
    
    // Step 3: Assess connection indicators
    const connection_indicators = this.assessConnectionIndicators(cleanText)
    
    // Step 4: Calculate fulfillment metrics
    const fulfillment_metrics = this.calculateFulfillmentMetrics(
      cleanText, relationship_needs, emotional_state
    )
    
    // Step 5: Generate suggestion triggers
    const suggestion_triggers = this.generateSuggestionTriggers(
      relationship_needs, emotional_state, userProfile
    )
    
    // Step 6: Calculate overall sentiment
    const overall_sentiment = this.calculateOverallSentiment(
      emotional_state, relationship_needs, connection_indicators
    )
    
    return {
      overall_sentiment,
      confidence_score: this.calculateConfidenceScore(cleanText, relationship_needs),
      emotional_state,
      relationship_needs,
      connection_indicators,
      fulfillment_metrics,
      suggestion_triggers
    }
  }

  private detectRelationshipNeeds(text: string, userProfile?: UserProfile): RelationshipNeed[] {
    const needs: RelationshipNeed[] = []
    
    for (const [needType, patterns] of Object.entries(this.relationshipPatterns)) {
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
        
        const urgency: Urgency = intensity >= 8 ? 'immediate' : 
                      intensity >= 6 ? 'soon' : 
                      intensity >= 4 ? 'ongoing' : 'low'
        
        // Type assertion for needType
        const needTypeTyped = this.mapStringToNeedType(needType)
        if (needTypeTyped) {
          needs.push({
            need_type: needTypeTyped,
            intensity,
            urgency,
            love_language_alignment: this.mapToLoveLanguages(needType),
            specific_indicators: [
              ...patterns.keywords.filter(k => text.includes(k)),
              ...patterns.phrases.filter(p => text.includes(p))
            ],
            partner_action_suggestion: this.generatePartnerActionSuggestion(needType, intensity)
          })
        }
      }
    }
    
    return needs.sort((a, b) => b.intensity - a.intensity)
  }

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

  private analyzeEmotionalState(text: string): EmotionalState {
    const emotions = {
      positive: 0,
      negative: 0,
      neutral: 0
    }
    
    // Analyze emotional lexicon matches
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
    
    // Determine primary emotion
    const totalEmotional = emotions.positive + emotions.negative
    const primary_emotion = totalEmotional === 0 ? 'neutral' :
                           emotions.positive > emotions.negative ? 'positive' : 'negative'
    
    const intensity_level = Math.min(Math.max(totalEmotional, 1), 10)
    
    return {
      primary_emotion,
      secondary_emotions: this.detectSecondaryEmotions(text),
      intensity_level,
      emotional_trend: this.detectEmotionalTrend(text),
      stress_indicators: this.detectStressIndicators(text),
      joy_indicators: this.detectJoyIndicators(text)
    }
  }

  private assessConnectionIndicators(text: string): ConnectionIndicator[] {
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
        indicators.push({
          indicator_type: indicatorType,
          strength: Math.min(matches.length * 2, 10),
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
    emotional: EmotionalState
  ): FulfillmentMetric[] {
    const areas: FulfillmentArea[] = ['physical_intimacy', 'emotional_connection', 'communication', 'shared_activities', 'individual_growth']
    
    return areas.map(area => {
      const relatedNeeds = needs.filter(need => 
        this.mapAreaToNeeds(area).includes(need.need_type)
      )
      
      const current_level = relatedNeeds.length > 0 ? 
        Math.max(1, 10 - Math.max(...relatedNeeds.map(n => n.intensity))) : 
        emotional.intensity_level
      
      const desired_level = relatedNeeds.length > 0 ? 
        Math.min(10, current_level + Math.max(...relatedNeeds.map(n => n.intensity))) : 
        8
      
      return {
        area,
        current_level,
        desired_level,
        gap_analysis: this.generateGapAnalysis(area, current_level, desired_level),
        improvement_potential: this.generateImprovementPotential(area, relatedNeeds)
      }
    })
  }

  private generateSuggestionTriggers(
    needs: RelationshipNeed[], 
    emotional: EmotionalState,
    userProfile?: UserProfile
  ): SuggestionTrigger[] {
    const triggers: SuggestionTrigger[] = []
    
    // High priority immediate needs
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
    
    // Emotional support triggers
    if (emotional.stress_indicators.length > 0) {
      triggers.push({
        trigger_type: 'immediate',
        priority: 'high',
        suggested_action: 'Offer emotional support and check in on their wellbeing',
        target_recipient: 'partner',
        expected_impact: 'Provide stress relief and emotional validation'
      })
    }
    
    // Positive reinforcement triggers
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

  // Helper methods
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

  private generatePartnerActionSuggestion(needType: string, intensity: number): string {
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

  private calculateOverallSentiment(
    emotional: EmotionalState,
    needs: RelationshipNeed[],
    indicators: ConnectionIndicator[]
  ): OverallSentiment {
    const positiveScore = indicators
      .filter(i => ['closeness', 'harmony', 'growth'].includes(i.indicator_type))
      .reduce((sum, i) => sum + i.strength, 0)
    
    const negativeScore = indicators
      .filter(i => ['distance', 'conflict', 'stagnation'].includes(i.indicator_type))
      .reduce((sum, i) => sum + i.strength, 0) +
      needs.filter(n => n.urgency === 'immediate').length * 3
    
    if (Math.abs(positiveScore - negativeScore) <= 2) return 'mixed'
    if (positiveScore > negativeScore) return 'positive'
    if (negativeScore > positiveScore) return 'negative'
    return 'neutral'
  }

  private calculateConfidenceScore(text: string, needs: RelationshipNeed[]): number {
    const textLength = text.length
    const needsDetected = needs.length
    const specificIndicators = needs.reduce((sum, need) => sum + need.specific_indicators.length, 0)
    
    const baseScore = Math.min(textLength / 50, 5) + needsDetected * 1.5 + specificIndicators * 0.5
    return Math.min(Math.round(baseScore * 10) / 10, 10)
  }

  // Additional helper methods (simplified for space)
  private detectSecondaryEmotions(text: string): string[] {
    return []
  }

  private detectEmotionalTrend(text: string): EmotionalTrend {
    return 'stable'
  }

  private detectStressIndicators(text: string): string[] {
    const stressWords = ['stressed', 'overwhelmed', 'anxious', 'pressure', 'worried', 'exhausted']
    return stressWords.filter(word => text.includes(word))
  }

  private detectJoyIndicators(text: string): string[] {
    const joyWords = ['happy', 'excited', 'grateful', 'amazing', 'wonderful', 'love']
    return joyWords.filter(word => text.includes(word))
  }

  private detectTrendDirection(text: string, type: string): TrendDirection {
    return 'stable'
  }

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