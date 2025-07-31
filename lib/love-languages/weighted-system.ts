// lib/love-languages/weighted-system.ts
// Weighted love languages system focusing on top 3 with proper scaling

export interface WeightedLoveLanguage {
  language: string
  weight: number // 0-1 scale where 1 is most important
  intensity: number // 1-10 user-provided intensity
  effectiveScore: number // weight * intensity for AI processing
  priority: 'primary' | 'secondary' | 'tertiary' | 'minimal'
}

export interface LoveLanguageProfile {
  weighted: WeightedLoveLanguage[]
  topThree: WeightedLoveLanguage[]
  primary: WeightedLoveLanguage
  givingProfile: WeightedLoveLanguage[]
  receivingProfile: WeightedLoveLanguage[]
  bridgingInsights: string[]
}

export const LOVE_LANGUAGE_DEFINITIONS = {
  words_of_affirmation: {
    name: 'Words of Affirmation',
    description: 'Verbal appreciation, compliments, encouragement',
    givingExamples: ['Offering genuine compliments', 'Writing encouraging notes', 'Expressing gratitude verbally'],
    receivingExamples: ['Hearing "I love you"', 'Getting specific praise', 'Receiving encouraging words']
  },
  quality_time: {
    name: 'Quality Time',
    description: 'Undivided attention, shared experiences, meaningful presence',
    givingExamples: ['Planning one-on-one activities', 'Active listening', 'Being fully present'],
    receivingExamples: ['Having uninterrupted conversations', 'Shared activities', 'Feeling prioritized']
  },
  physical_touch: {
    name: 'Physical Touch',
    description: 'Physical connection, affection, comfort through touch',
    givingExamples: ['Hugs and kisses', 'Holding hands', 'Gentle touches'],
    receivingExamples: ['Feeling physically connected', 'Comfort through touch', 'Affectionate gestures']
  },
  acts_of_service: {
    name: 'Acts of Service',
    description: 'Helpful actions, practical support, doing things for others',
    givingExamples: ['Helping with tasks', 'Anticipating needs', 'Taking care of responsibilities'],
    receivingExamples: ['Having things done for you', 'Practical help', 'Feeling supported through actions']
  },
  receiving_gifts: {
    name: 'Receiving Gifts',
    description: 'Thoughtful presents, symbols of love, tangible expressions',
    givingExamples: ['Choosing meaningful gifts', 'Surprise tokens', 'Remembering special items'],
    receivingExamples: ['Thoughtful surprises', 'Meaningful objects', 'Feeling remembered through gifts']
  }
}

/**
 * Creates a weighted love language profile from user rankings and intensities
 */
export function createWeightedProfile(
  rankings: string[], // User's ranked preferences 1-5
  intensities: Record<string, number>, // User's intensity ratings 1-10
  type: 'giving' | 'receiving' = 'receiving'
): LoveLanguageProfile {
  
  // Create weighted scores based on ranking position and intensity
  const weighted: WeightedLoveLanguage[] = rankings.map((language, index) => {
    // Weight decreases significantly after top 3
    const positionWeight = index === 0 ? 1.0 : 
                          index === 1 ? 0.75 : 
                          index === 2 ? 0.50 : 
                          index === 3 ? 0.25 : 0.1
    
    const intensity = intensities[language] || 5
    const effectiveScore = positionWeight * (intensity / 10)
    
    const priority = index === 0 ? 'primary' : 
                    index === 1 ? 'secondary' : 
                    index === 2 ? 'tertiary' : 'minimal'
    
    return {
      language,
      weight: positionWeight,
      intensity,
      effectiveScore,
      priority
    }
  })
  
  // Sort by effective score to get true priority order
  weighted.sort((a, b) => b.effectiveScore - a.effectiveScore)
  
  // Extract top three for focused AI processing
  const topThree = weighted.slice(0, 3)
  const primary = weighted[0]
  
  // Generate bridging insights for giving vs receiving
  const bridgingInsights = generateBridgingInsights(weighted, type)
  
  return {
    weighted,
    topThree,
    primary,
    givingProfile: type === 'giving' ? weighted : [],
    receivingProfile: type === 'receiving' ? weighted : [],
    bridgingInsights
  }
}

/**
 * Generates insights for how someone gives vs receives love
 */
function generateBridgingInsights(
  weighted: WeightedLoveLanguage[],
  type: 'giving' | 'receiving'
): string[] {
  const insights: string[] = []
  const primary = weighted[0]
  const secondary = weighted[1]
  
  // Focus on top 2-3 languages for insights
  if (primary.effectiveScore > 0.7) {
    const langName = LOVE_LANGUAGE_DEFINITIONS[primary.language as keyof typeof LOVE_LANGUAGE_DEFINITIONS]?.name
    insights.push(`Strongly ${type === 'giving' ? 'gives' : 'receives'} love through ${langName} - this is their primary way`)
  }
  
  if (secondary && secondary.effectiveScore > 0.5) {
    const langName = LOVE_LANGUAGE_DEFINITIONS[secondary.language as keyof typeof LOVE_LANGUAGE_DEFINITIONS]?.name
    insights.push(`Also values ${langName} as a ${type === 'giving' ? 'giving' : 'receiving'} method`)
  }
  
  // Identify if there's a big gap between top languages
  if (primary.effectiveScore - secondary.effectiveScore > 0.3) {
    insights.push(`Has a strong preference for their primary language over others`)
  } else {
    insights.push(`Values multiple love languages relatively equally`)
  }
  
  return insights
}

/**
 * Creates bridging suggestions between how someone gives vs receives
 */
export function createLoveLanguageBridge(
  givingProfile: LoveLanguageProfile,
  receivingProfile: LoveLanguageProfile
): {
  matches: string[]
  gaps: string[]
  bridgingSuggestions: string[]
} {
  const matches: string[] = []
  const gaps: string[] = []
  const bridgingSuggestions: string[] = []
  
  // Compare primary languages
  if (givingProfile.primary.language === receivingProfile.primary.language) {
    matches.push(`Primary alignment: You give and receive love the same way (${givingProfile.primary.language})`)
  } else {
    gaps.push(`Language gap: You give through ${givingProfile.primary.language} but receive through ${receivingProfile.primary.language}`)
    
    // Create bridging suggestion
    const givingLang = LOVE_LANGUAGE_DEFINITIONS[givingProfile.primary.language as keyof typeof LOVE_LANGUAGE_DEFINITIONS]
    const receivingLang = LOVE_LANGUAGE_DEFINITIONS[receivingProfile.primary.language as keyof typeof LOVE_LANGUAGE_DEFINITIONS]
    
    bridgingSuggestions.push(
      `Try combining your natural giving style (${givingLang?.name}) with your receiving needs (${receivingLang?.name}) when supporting your partner`
    )
  }
  
  // Look for secondary matches
  const givingTop3 = givingProfile.topThree.map(l => l.language)
  const receivingTop3 = receivingProfile.topThree.map(l => l.language)
  
  const commonLanguages = givingTop3.filter(lang => receivingTop3.includes(lang))
  
  if (commonLanguages.length > 1) {
    matches.push(`You have ${commonLanguages.length} common languages in your top 3`)
  }
  
  // Generate specific bridging suggestions
  givingProfile.topThree.forEach(givingLang => {
    receivingProfile.topThree.forEach(receivingLang => {
      if (givingLang.language !== receivingLang.language) {
        const suggestion = createSpecificBridge(givingLang.language, receivingLang.language)
        if (suggestion) {
          bridgingSuggestions.push(suggestion)
        }
      }
    })
  })
  
  return { matches, gaps, bridgingSuggestions: bridgingSuggestions.slice(0, 3) } // Limit to top 3
}

function createSpecificBridge(givingLanguage: string, receivingLanguage: string): string | null {
  const bridges: Record<string, Record<string, string>> = {
    words_of_affirmation: {
      quality_time: "Express appreciation verbally during your time together to bridge giving words with receiving presence",
      physical_touch: "Combine verbal affirmations with gentle touch to meet both language needs",
      acts_of_service: "Verbally acknowledge when acts of service are done for you, bridging appreciation with action",
      receiving_gifts: "Include meaningful written notes with gifts to combine words with tangible expressions"
    },
    quality_time: {
      words_of_affirmation: "Spend focused time actively listening and offering encouraging words",
      physical_touch: "Create moments of physical closeness during quality time together",
      acts_of_service: "Use quality time to help with tasks together, combining presence with practical help",
      receiving_gifts: "Present gifts during special one-on-one moments to maximize impact"
    },
    acts_of_service: {
      words_of_affirmation: "Explain the thought behind your helpful actions to bridge service with verbal appreciation",
      quality_time: "Invite participation in helpful tasks to create quality time through service",
      physical_touch: "Offer service that includes physical comfort (massage, bringing comfort items)",
      receiving_gifts: "Choose practical gifts that serve a helpful purpose"
    },
    physical_touch: {
      words_of_affirmation: "Combine gentle touch with spoken words of love and appreciation",
      quality_time: "Ensure physical affection happens during focused time together",
      acts_of_service: "Offer physical comfort as a form of service (back rubs, holding during stress)",
      receiving_gifts: "Choose gifts that involve physical connection (matching jewelry, soft items)"
    },
    receiving_gifts: {
      words_of_affirmation: "Include heartfelt written messages with gifts to bridge tangible with verbal",
      quality_time: "Present gifts during special moments together to maximize emotional impact",
      acts_of_service: "Choose gifts that help make life easier, bridging giving with practical help",
      physical_touch: "Select gifts that encourage physical connection (matching items, comfort objects)"
    }
  }
  
  return bridges[givingLanguage]?.[receivingLanguage] || null
}

/**
 * For AI processing - returns only the languages that matter for this person
 */
export function getEffectiveLanguages(profile: LoveLanguageProfile): WeightedLoveLanguage[] {
  // Only return languages with significant weights (top 3, but only if they score above threshold)
  return profile.weighted.filter(lang => lang.effectiveScore > 0.3)
}

/**
 * For partner suggestions - focuses AI on what actually matters
 */
export function generatePartnerGuidance(
  userProfile: LoveLanguageProfile,
  partnerProfile?: LoveLanguageProfile
): string[] {
  const guidance: string[] = []
  const effectiveLanguages = getEffectiveLanguages(userProfile)
  
  effectiveLanguages.forEach((lang, index) => {
    const priority = index === 0 ? 'most important' : index === 1 ? 'also important' : 'additionally valuable'
    const langDef = LOVE_LANGUAGE_DEFINITIONS[lang.language as keyof typeof LOVE_LANGUAGE_DEFINITIONS]
    
    if (langDef) {
      guidance.push(`${priority.charAt(0).toUpperCase() + priority.slice(1)}: Show love through ${langDef.name.toLowerCase()} - ${langDef.description.toLowerCase()}`)
    }
  })
  
  // Add bridging guidance if partner profile available
  if (partnerProfile) {
    const bridge = createLoveLanguageBridge(partnerProfile, userProfile)
    if (bridge.bridgingSuggestions.length > 0) {
      guidance.push(`Bridging tip: ${bridge.bridgingSuggestions[0]}`)
    }
  }
  
  return guidance.slice(0, 4) // Limit to 4 key points for partner
}