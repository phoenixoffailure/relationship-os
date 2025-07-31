// lib/cycle/enhanced-phase-system.ts
// Enhanced cycle tracking with relationship-focused insights

export interface CyclePhaseInsights {
  phase: 'menstrual' | 'follicular' | 'ovulation' | 'luteal'
  emotionalState: {
    primaryEmotions: string[]
    supportNeeds: string[]
    communicationStyle: string
    energyLevel: 'low' | 'medium' | 'high'
  }
  relationshipNeeds: {
    intimacyLevel: 'low' | 'medium' | 'high'
    reassuranceNeed: 'low' | 'medium' | 'high'
    patienceRequired: 'low' | 'medium' | 'high'
    preferredActivities: string[]
  }
  sexualWellness: {
    libidoLevel: 'low' | 'medium' | 'high'
    preferences: string[]
    considerations: string[]
  }
  partnerGuidance: {
    doThis: string[]
    avoidThis: string[]
    specialConsiderations: string[]
  }
}

export const ENHANCED_PHASE_DATA: Record<string, CyclePhaseInsights> = {
  menstrual: {
    phase: 'menstrual',
    emotionalState: {
      primaryEmotions: ['introspective', 'sensitive', 'vulnerable', 'reflective'],
      supportNeeds: ['comfort', 'understanding', 'space when needed', 'gentle affection'],
      communicationStyle: 'May need more processing time, prefer softer approaches',
      energyLevel: 'low'
    },
    relationshipNeeds: {
      intimacyLevel: 'low',
      reassuranceNeed: 'high',
      patienceRequired: 'high',
      preferredActivities: ['quiet time together', 'gentle conversations', 'comfort activities', 'being pampered']
    },
    sexualWellness: {
      libidoLevel: 'low',
      preferences: ['emotional intimacy over physical', 'gentle touch', 'no pressure'],
      considerations: ['respect comfort levels', 'focus on emotional connection', 'physical comfort priority']
    },
    partnerGuidance: {
      doThis: [
        'Offer extra emotional support and validation',
        'Help with daily tasks without being asked',
        'Provide comfort items (heating pad, favorite snacks)',
        'Give gentle, non-sexual physical affection',
        'Be patient with mood fluctuations'
      ],
      avoidThis: [
        'Minimize their discomfort or emotions',
        'Pressure for intimacy or activities',
        'Make demands or create additional stress',
        'Take mood changes personally'
      ],
      specialConsiderations: [
        'This is an ideal time for deep emotional connection',
        'Small gestures of care mean extra much right now',
        'Respect their need for rest and comfort'
      ]
    }
  },
  
  follicular: {
    phase: 'follicular',
    emotionalState: {
      primaryEmotions: ['optimistic', 'creative', 'motivated', 'social'],
      supportNeeds: ['encouragement for new ideas', 'participation in activities', 'positive feedback'],
      communicationStyle: 'Open to discussions, receptive to planning and new ideas',
      energyLevel: 'medium'
    },
    relationshipNeeds: {
      intimacyLevel: 'medium',
      reassuranceNeed: 'medium',
      patienceRequired: 'low',
      preferredActivities: ['planning future activities', 'trying new things', 'social activities', 'creative projects']
    },
    sexualWellness: {
      libidoLevel: 'medium',
      preferences: ['building anticipation', 'playful intimacy', 'trying new things'],
      considerations: ['energy is returning', 'open to exploration', 'building connection']
    },
    partnerGuidance: {
      doThis: [
        'Support their new ideas and projects',
        'Plan exciting activities for the future',
        'Engage in meaningful conversations',
        'Match their increasing energy levels',
        'Be encouraging about their goals'
      ],
      avoidThis: [
        'Dismiss their enthusiasm or new ideas',
        'Be overly cautious about their suggestions',
        'Dampen their creative energy'
      ],
      specialConsiderations: [
        'Great time for relationship planning and goal setting',
        'They may be more receptive to feedback and growth',
        'Energy and optimism are building - join them!'
      ]
    }
  },

  ovulation: {
    phase: 'ovulation',
    emotionalState: {
      primaryEmotions: ['confident', 'outgoing', 'attractive', 'energetic'],
      supportNeeds: ['appreciation of their confidence', 'active participation', 'matching their energy'],
      communicationStyle: 'Direct, confident, excellent time for important conversations',
      energyLevel: 'high'
    },
    relationshipNeeds: {
      intimacyLevel: 'high',
      reassuranceNeed: 'low',
      patienceRequired: 'low',
      preferredActivities: ['social events', 'intimate conversations', 'physical activities', 'adventure']
    },
    sexualWellness: {
      libidoLevel: 'high',
      preferences: ['passionate intimacy', 'feeling desired', 'physical connection'],
      considerations: ['peak fertility awareness', 'high confidence', 'strong physical desires']
    },
    partnerGuidance: {
      doThis: [
        'Express attraction and desire openly',
        'Plan romantic and exciting activities',
        'Engage in deep, meaningful conversations',
        'Match their high energy and confidence',
        'Take advantage of their openness to intimacy'
      ],
      avoidThis: [
        'Ignore their peak attractiveness and confidence',
        'Suggest low-key activities when they want excitement',
        'Miss opportunities for deeper connection'
      ],
      specialConsiderations: [
        'This is the ideal time for important relationship conversations',
        'Their attractiveness and confidence are at peak - celebrate it!',
        'Great time for romantic gestures and intimate connection'
      ]
    }
  },

  luteal: {
    phase: 'luteal',
    emotionalState: {
      primaryEmotions: ['focused', 'detail-oriented', 'potentially moody', 'introspective'],
      supportNeeds: ['patience with mood swings', 'help with decision-making', 'emotional stability'],
      communicationStyle: 'May be more critical or sensitive, need gentle approaches',
      energyLevel: 'medium'
    },
    relationshipNeeds: {
      intimacyLevel: 'medium',
      reassuranceNeed: 'high',
      patienceRequired: 'high',
      preferredActivities: ['completing projects', 'organizing', 'quiet activities', 'comfort routines']
    },
    sexualWellness: {
      libidoLevel: 'medium',
      preferences: ['emotional security first', 'gentle approaches', 'comfort-focused'],
      considerations: ['may need more foreplay', 'emotional state affects desire', 'comfort priority']
    },
    partnerGuidance: {
      doThis: [
        'Provide extra emotional reassurance',
        'Help complete tasks and reduce stress',
        'Be patient with mood fluctuations',
        'Offer comfort and stability',
        'Listen actively to their concerns'
      ],
      avoidThis: [
        'Criticize or add pressure during this sensitive time',
        'Ignore their need for emotional support',
        'Take mood changes as personal attacks',
        'Push for intimacy if they seem withdrawn'
      ],
      specialConsiderations: [
        'They may be more critical of themselves and others',
        'Extra patience and understanding are crucial',
        'Focus on completing things rather than starting new projects'
      ]
    }
  }
}

export function getCyclePhaseInsights(
  phase: 'menstrual' | 'follicular' | 'ovulation' | 'luteal',
  userLoveLanguages?: string[],
  partnerLoveLanguages?: string[]
): CyclePhaseInsights & { personalizedGuidance?: string[] } {
  const baseInsights = ENHANCED_PHASE_DATA[phase]
  
  // Personalize guidance based on love languages if available
  if (userLoveLanguages && userLoveLanguages.length > 0) {
    const personalizedGuidance = generatePersonalizedGuidance(phase, userLoveLanguages, partnerLoveLanguages)
    return {
      ...baseInsights,
      personalizedGuidance
    }
  }
  
  return baseInsights
}

function generatePersonalizedGuidance(
  phase: string,
  userLoveLanguages: string[],
  partnerLoveLanguages?: string[]
): string[] {
  const guidance: string[] = []
  const phaseData = ENHANCED_PHASE_DATA[phase]
  
  // Focus on user's top 3 love languages with weighted importance
  const topLanguages = userLoveLanguages.slice(0, 3)
  
  topLanguages.forEach((language, index) => {
    const weight = index === 0 ? 'especially' : index === 1 ? 'also' : 'additionally'
    
    switch (language) {
      case 'words_of_affirmation':
        if (phase === 'menstrual') {
          guidance.push(`${weight === 'especially' ? 'Most importantly' : weight}: Offer gentle, affirming words about their strength and your support`)
        } else if (phase === 'ovulation') {
          guidance.push(`${weight === 'especially' ? 'Most importantly' : weight}: Express attraction and appreciation verbally - they'll especially value hearing how amazing they are`)
        }
        break
      
      case 'quality_time':
        if (phase === 'luteal') {
          guidance.push(`${weight === 'especially' ? 'Most importantly' : weight}: Offer undivided attention for conversations and concerns`)
        } else if (phase === 'follicular') {
          guidance.push(`${weight === 'especially' ? 'Most importantly' : weight}: Plan dedicated time for shared activities and future planning`)
        }
        break
      
      case 'physical_touch':
        if (phase === 'menstrual') {
          guidance.push(`${weight === 'especially' ? 'Most importantly' : weight}: Offer gentle, non-sexual touch - back rubs, hand holding, cuddling`)
        } else if (phase === 'ovulation') {
          guidance.push(`${weight === 'especially' ? 'Most importantly' : weight}: They're likely to crave and appreciate passionate physical connection`)
        }
        break
      
      case 'acts_of_service':
        if (phase === 'menstrual' || phase === 'luteal') {
          guidance.push(`${weight === 'especially' ? 'Most importantly' : weight}: Take care of tasks they usually handle, especially comfort-related ones`)
        }
        break
      
      case 'receiving_gifts':
        guidance.push(`${weight === 'especially' ? 'Most importantly' : weight}: Small thoughtful gifts related to their current needs (comfort items during menstrual, exciting plans during ovulation)`)
        break
    }
  })
  
  return guidance
}

// Helper function to calculate current phase based on cycle data
export function calculateCurrentPhase(
  cycleStartDate: string,
  averageCycleLength: number = 28,
  averagePeriodLength: number = 5
): { phase: 'menstrual' | 'follicular' | 'ovulation' | 'luteal', dayInCycle: number } {
  const startDate = new Date(cycleStartDate)
  const today = new Date()
  const dayInCycle = Math.floor((today.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)) + 1
  
  let phase: 'menstrual' | 'follicular' | 'ovulation' | 'luteal'
  
  if (dayInCycle <= averagePeriodLength) {
    phase = 'menstrual'
  } else if (dayInCycle <= averageCycleLength / 2 - 2) {
    phase = 'follicular'
  } else if (dayInCycle <= averageCycleLength / 2 + 2) {
    phase = 'ovulation'
  } else {
    phase = 'luteal'
  }
  
  return { phase, dayInCycle }
}