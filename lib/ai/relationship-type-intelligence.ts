// lib/ai/relationship-type-intelligence.ts
// Core intelligence system for adapting AI behavior based on relationship type
// Phase 3 Implementation - RelationshipOS v2.0

import { Database } from '@/lib/types/database'

// Type definitions
export type RelationshipType = 'romantic' | 'family' | 'friend' | 'work' | 'other'

export interface RelationshipTypeConfig {
  type: RelationshipType
  displayName: string
  emotionalIntensity: 'high' | 'medium' | 'low'
  nudgingFrequency: 'frequent' | 'moderate' | 'infrequent' | 'minimal'
  boundaries: {
    allowIntimacy: boolean
    allowPersonalAdvice: boolean
    allowEmotionalSupport: boolean
    allowPhysicalTouch: boolean
    allowFinancialAdvice: boolean
    allowConflictResolution: boolean
  }
  toneProfile: {
    warmth: number // 1-10
    formality: number // 1-10
    enthusiasm: number // 1-10
    directness: number // 1-10
  }
  appropriateTopics: string[]
  inappropriateTopics: string[]
  samplePhrases: {
    greeting: string
    validation: string
    suggestion: string
    appreciation: string
  }
}

// Relationship type configurations based on research
export const RELATIONSHIP_TYPE_CONFIGS: Record<RelationshipType, RelationshipTypeConfig> = {
  romantic: {
    type: 'romantic',
    displayName: 'Romantic Partner',
    emotionalIntensity: 'high',
    nudgingFrequency: 'moderate',
    boundaries: {
      allowIntimacy: true,
      allowPersonalAdvice: true,
      allowEmotionalSupport: true,
      allowPhysicalTouch: true,
      allowFinancialAdvice: true,
      allowConflictResolution: true
    },
    toneProfile: {
      warmth: 10,
      formality: 2,
      enthusiasm: 8,
      directness: 7
    },
    appropriateTopics: [
      'intimacy', 'future planning', 'emotional needs', 'physical affection',
      'shared dreams', 'sexual connection', 'deep feelings', 'relationship growth'
    ],
    inappropriateTopics: [],
    samplePhrases: {
      greeting: "I notice how intentionally you're approaching your relationship growth",
      validation: "Your awareness of these dynamics shows real emotional intelligence",
      suggestion: "Consider planning something meaningful that connects with what they've shared",
      appreciation: "Your commitment to understanding each other is strengthening your bond"
    }
  },

  family: {
    type: 'family',
    displayName: 'Family Member',
    emotionalIntensity: 'medium',
    nudgingFrequency: 'infrequent',
    boundaries: {
      allowIntimacy: false,
      allowPersonalAdvice: true,
      allowEmotionalSupport: true,
      allowPhysicalTouch: false,
      allowFinancialAdvice: false,
      allowConflictResolution: true
    },
    toneProfile: {
      warmth: 7,
      formality: 4,
      enthusiasm: 6,
      directness: 5
    },
    appropriateTopics: [
      'family dynamics', 'boundaries', 'communication', 'support',
      'traditions', 'shared history', 'generational patterns', 'family roles'
    ],
    inappropriateTopics: [
      'intimate details', 'sexual topics', 'romantic advice'
    ],
    samplePhrases: {
      greeting: "I see you're thoughtfully navigating your family dynamics",
      validation: "Your balanced perspective on these family patterns shows wisdom",
      suggestion: "Consider approaching this with clear boundaries and genuine care",
      appreciation: "Your efforts to build healthy family connections are valuable"
    }
  },

  friend: {
    type: 'friend',
    displayName: 'Friend',
    emotionalIntensity: 'medium',
    nudgingFrequency: 'infrequent',
    boundaries: {
      allowIntimacy: false,
      allowPersonalAdvice: true,
      allowEmotionalSupport: true,
      allowPhysicalTouch: false,
      allowFinancialAdvice: false,
      allowConflictResolution: true
    },
    toneProfile: {
      warmth: 8,
      formality: 2,
      enthusiasm: 9,
      directness: 6
    },
    appropriateTopics: [
      'shared activities', 'mutual support', 'fun experiences', 'loyalty',
      'trust', 'shared interests', 'life updates', 'casual hangouts'
    ],
    inappropriateTopics: [
      'intimate details', 'excessive emotional dependency', 'romantic feelings'
    ],
    samplePhrases: {
      greeting: "I notice how much care you put into your friendships",
      validation: "This level of thoughtfulness strengthens meaningful connections",
      suggestion: "Consider planning something enjoyable that fits both your styles",
      appreciation: "Your intentional approach to friendship creates lasting bonds"
    }
  },

  work: {
    type: 'work',
    displayName: 'Work Colleague',
    emotionalIntensity: 'low',
    nudgingFrequency: 'minimal',
    boundaries: {
      allowIntimacy: false,
      allowPersonalAdvice: false,
      allowEmotionalSupport: false,
      allowPhysicalTouch: false,
      allowFinancialAdvice: false,
      allowConflictResolution: true
    },
    toneProfile: {
      warmth: 4,
      formality: 8,
      enthusiasm: 5,
      directness: 8
    },
    appropriateTopics: [
      'professional development', 'collaboration', 'boundaries', 'communication',
      'project management', 'team dynamics', 'workplace culture', 'career growth'
    ],
    inappropriateTopics: [
      'personal life details', 'intimate topics', 'emotional support',
      'physical affection', 'personal finances', 'non-work socializing'
    ],
    samplePhrases: {
      greeting: "I see you're developing your professional relationship skills",
      validation: "This strategic approach to workplace dynamics shows strong judgment",
      suggestion: "Consider addressing this through clear, professional communication",
      appreciation: "Your focus on positive workplace relationships supports your career growth"
    }
  },

  other: {
    type: 'other',
    displayName: 'Other Relationship',
    emotionalIntensity: 'medium',
    nudgingFrequency: 'moderate',
    boundaries: {
      allowIntimacy: false,
      allowPersonalAdvice: true,
      allowEmotionalSupport: true,
      allowPhysicalTouch: false,
      allowFinancialAdvice: false,
      allowConflictResolution: true
    },
    toneProfile: {
      warmth: 6,
      formality: 5,
      enthusiasm: 6,
      directness: 6
    },
    appropriateTopics: [
      'general communication', 'boundaries', 'mutual respect', 'shared goals',
      'connection', 'understanding', 'growth', 'support'
    ],
    inappropriateTopics: [
      'assumptions about relationship nature', 'overly intimate suggestions'
    ],
    samplePhrases: {
      greeting: "I notice your thoughtful approach to building this connection",
      validation: "Your awareness of relationship dynamics is helping you navigate this well",
      suggestion: "Consider what approach would feel most authentic and beneficial",
      appreciation: "Your intentional focus on healthy relationships is creating positive outcomes"
    }
  }
}

// Function to get relationship configuration
export function getRelationshipConfig(type: RelationshipType): RelationshipTypeConfig {
  return RELATIONSHIP_TYPE_CONFIGS[type] || RELATIONSHIP_TYPE_CONFIGS.other
}

// Function to adapt prompt based on relationship type
export function adaptPromptForRelationshipType(
  basePrompt: string,
  relationshipType: RelationshipType,
  userContext?: {
    firoNeeds?: { inclusion: number; control: number; affection: number }
    attachmentStyle?: string
    communicationStyle?: string
  }
): string {
  const config = getRelationshipConfig(relationshipType)
  
  // Build relationship-specific context
  const contextAdditions: string[] = []
  
  // Add tone guidance
  contextAdditions.push(`
RELATIONSHIP CONTEXT: This is a ${config.displayName} relationship.
EMOTIONAL INTENSITY: ${config.emotionalIntensity}
APPROPRIATE TONE: 
- Warmth level: ${config.toneProfile.warmth}/10
- Formality level: ${config.toneProfile.formality}/10
- Enthusiasm: ${config.toneProfile.enthusiasm}/10
- Directness: ${config.toneProfile.directness}/10

BOUNDARIES TO RESPECT:
${!config.boundaries.allowIntimacy ? '- NO intimate or sexual suggestions' : ''}
${!config.boundaries.allowPersonalAdvice ? '- NO personal life advice' : ''}
${!config.boundaries.allowEmotionalSupport ? '- NO emotional support offerings' : ''}
${!config.boundaries.allowPhysicalTouch ? '- NO physical touch suggestions' : ''}
${!config.boundaries.allowFinancialAdvice ? '- NO financial advice' : ''}

APPROPRIATE TOPICS: ${config.appropriateTopics.join(', ')}
AVOID THESE TOPICS: ${config.inappropriateTopics.join(', ') || 'None'}

EXAMPLE PHRASES TO MATCH TONE:
- Greeting: "${config.samplePhrases.greeting}"
- Validation: "${config.samplePhrases.validation}"
- Suggestion: "${config.samplePhrases.suggestion}"
- Appreciation: "${config.samplePhrases.appreciation}"
`)

  // Add user-specific adaptations if provided
  if (userContext?.firoNeeds) {
    const { inclusion, control, affection } = userContext.firoNeeds
    
    if (inclusion >= 7 && config.boundaries.allowEmotionalSupport) {
      contextAdditions.push('USER CONTEXT: High inclusion need - emphasize connection and belonging')
    }
    
    if (control >= 7) {
      contextAdditions.push('USER CONTEXT: High control need - offer choices and respect autonomy')
    }
    
    if (affection >= 7 && config.boundaries.allowIntimacy && relationshipType === 'romantic') {
      contextAdditions.push('USER CONTEXT: High affection need - warm, caring language appropriate')
    }
  }

  // Combine base prompt with relationship-specific context
  return `${basePrompt}\n\n${contextAdditions.join('\n')}`
}

// Function to validate if a suggestion is appropriate for relationship type
export function validateSuggestionForRelationshipType(
  suggestion: string,
  relationshipType: RelationshipType
): { isValid: boolean; reason?: string } {
  const config = getRelationshipConfig(relationshipType)
  const lowerSuggestion = suggestion.toLowerCase()
  
  // Check for boundary violations
  if (!config.boundaries.allowIntimacy) {
    const intimacyKeywords = ['intimate', 'sexual', 'romantic', 'passionate', 'sensual', 'erotic']
    for (const keyword of intimacyKeywords) {
      if (lowerSuggestion.includes(keyword)) {
        return { isValid: false, reason: `Inappropriate intimacy reference for ${config.displayName} relationship` }
      }
    }
  }
  
  if (!config.boundaries.allowPhysicalTouch) {
    const touchKeywords = ['touch', 'hug', 'kiss', 'cuddle', 'massage', 'caress', 'hold hands']
    for (const keyword of touchKeywords) {
      if (lowerSuggestion.includes(keyword)) {
        return { isValid: false, reason: `Inappropriate physical touch suggestion for ${config.displayName} relationship` }
      }
    }
  }
  
  if (!config.boundaries.allowPersonalAdvice && relationshipType === 'work') {
    const personalKeywords = ['personal life', 'home life', 'family matters', 'personal problems']
    for (const keyword of personalKeywords) {
      if (lowerSuggestion.includes(keyword)) {
        return { isValid: false, reason: `Inappropriate personal advice for work relationship` }
      }
    }
  }
  
  return { isValid: true }
}

// Function to get appropriate insight types for relationship
export function getAppropriateInsightTypes(relationshipType: RelationshipType): {
  pattern: boolean
  suggestion: boolean
  appreciation: boolean
  milestone: boolean
} {
  const config = getRelationshipConfig(relationshipType)
  
  return {
    pattern: true, // Always appropriate to notice patterns
    suggestion: config.nudgingFrequency !== 'minimal',
    appreciation: config.emotionalIntensity !== 'low',
    milestone: config.emotionalIntensity === 'high' || relationshipType === 'romantic'
  }
}

// Function to adjust love language suggestions based on relationship type
export function adjustLoveLanguageForRelationshipType(
  loveLanguage: string,
  relationshipType: RelationshipType
): string {
  const config = getRelationshipConfig(relationshipType)
  
  // Map love languages to relationship-appropriate expressions
  const adjustments: Record<string, Record<RelationshipType, string>> = {
    'physical_touch': {
      romantic: 'physical affection and intimate touch',
      family: 'appropriate family affection like brief hugs',
      friend: 'friendly gestures like high-fives or fist bumps',
      work: 'professional distance and respect for personal space',
      other: 'appropriate physical boundaries'
    },
    'words_of_affirmation': {
      romantic: 'loving words and intimate affirmations',
      family: 'supportive and encouraging family communication',
      friend: 'genuine compliments and friendly encouragement',
      work: 'professional recognition and constructive feedback',
      other: 'sincere and appropriate affirmations'
    },
    'quality_time': {
      romantic: 'intimate one-on-one time together',
      family: 'meaningful family time and traditions',
      friend: 'fun activities and hanging out together',
      work: 'productive collaboration and team building',
      other: 'intentional time spent together'
    },
    'acts_of_service': {
      romantic: 'thoughtful gestures and loving support',
      family: 'helping with family responsibilities',
      friend: 'being there when they need help',
      work: 'professional support and collaboration',
      other: 'helpful actions within appropriate boundaries'
    },
    'receiving_gifts': {
      romantic: 'meaningful gifts and romantic surprises',
      family: 'thoughtful family gifts for occasions',
      friend: 'small tokens of friendship',
      work: 'professional acknowledgments only',
      other: 'appropriate gestures of appreciation'
    }
  }
  
  return adjustments[loveLanguage]?.[relationshipType] || loveLanguage
}

// Export utility function to detect relationship type from database
export async function detectRelationshipType(
  relationshipId: string,
  supabase: any
): Promise<RelationshipType> {
  try {
    const { data, error } = await supabase
      .from('relationships')
      .select('relationship_type')
      .eq('id', relationshipId)
      .single()
    
    if (error || !data) {
      console.warn('Could not detect relationship type, defaulting to "other"')
      return 'other'
    }
    
    return data.relationship_type as RelationshipType || 'other'
  } catch (error) {
    console.error('Error detecting relationship type:', error)
    return 'other'
  }
}

// Function to generate relationship-aware AI prompt intro
export function generateRelationshipAwareIntro(
  relationshipType: RelationshipType,
  userName?: string
): string {
  const config = getRelationshipConfig(relationshipType)
  const name = userName || 'there'
  
  const intros: Record<RelationshipType, string> = {
    romantic: `Hey ${name}, I'm here to support your romantic relationship with warmth and care. ${config.samplePhrases.greeting}`,
    family: `Hi ${name}, let's explore your family dynamics with understanding and respect. ${config.samplePhrases.greeting}`,
    friend: `Hey ${name}! ${config.samplePhrases.greeting} Let's think about your friendship together.`,
    work: `Hello ${name}. ${config.samplePhrases.greeting} Let's focus on professional dynamics.`,
    other: `Hi ${name}, ${config.samplePhrases.greeting} Let's explore this connection thoughtfully.`
  }
  
  return intros[relationshipType]
}

// Export all functions and types for use in other modules
export default {
  getRelationshipConfig,
  adaptPromptForRelationshipType,
  validateSuggestionForRelationshipType,
  getAppropriateInsightTypes,
  adjustLoveLanguageForRelationshipType,
  detectRelationshipType,
  generateRelationshipAwareIntro,
  RELATIONSHIP_TYPE_CONFIGS
}