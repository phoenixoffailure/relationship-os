// lib/onboarding/profile-builder.ts
// Utility functions for building user profiles from onboarding responses

import { OnboardingResponse } from '@/lib/onboarding/enhanced-questions'

export interface UserProfile {
  loveLanguageProfile: LoveLanguageProfile
  communicationProfile: CommunicationProfile
  intimacyProfile: IntimacyProfile
  goalProfile: GoalProfile
  needExpressionProfile: NeedExpressionProfile
  aiSummary: AISummary
  completenessScore: number
  confidenceScore: number
}

export interface LoveLanguageProfile {
  primary: string
  secondary: string
  scores: Record<string, number>
  personalizedExamples: Record<string, string>
  aiInsights: string[]
  partnerGuidance: string[]
}

export interface CommunicationProfile {
  style: string
  conflictStyle: string
  stressResponse: string
  preferences: Record<string, number>
  optimalTiming: string[]
  aiInsights: string[]
  partnerGuidance: string[]
}

export interface IntimacyProfile {
  priorities: Record<string, number>
  enhancers: string[]
  barriers: string[]
  frequencies: Record<string, string>
  aiInsights: string[]
  partnerGuidance: string[]
}

export interface GoalProfile {
  primaryGoals: string[]
  timeline: string
  challenges: string
  values: string[]
  successVision: string
  aiInsights: string[]
}

export interface NeedExpressionProfile {
  style: {
    directness: string
    frequency: string
    preferredMethods: string[]
  }
  categoryDifficulty: Record<string, number>
  partnerAwareness: {
    currentLevel: number
    successfulExample: string
  }
  communicationBarriers: string[]
  aiInsights: string[]
  suggestionStrategy: string
}

export interface AISummary {
  overallProfile: string
  keyInsights: string[]
  partnerSuggestionApproach: string
  strengthAreas: string[]
  improvementAreas: string[]
  confidenceLevel: string
}

export function buildUserProfileFromResponses(responses: OnboardingResponse): UserProfile {
  // This would be called from the API route after saving responses
  const loveLanguageProfile = buildLoveLanguageProfile(responses)
  const communicationProfile = buildCommunicationProfile(responses)
  const intimacyProfile = buildIntimacyProfile(responses)
  const goalProfile = buildGoalProfile(responses)
  const needExpressionProfile = buildNeedExpressionProfile(responses)
  
  const completenessScore = calculateCompleteness(responses)
  const confidenceScore = calculateConfidence(responses)
  
  const aiSummary = generateProfileSummary({
    loveLanguageProfile,
    communicationProfile,
    intimacyProfile,
    goalProfile,
    needExpressionProfile,
    completenessScore,
    confidenceScore
  })

  return {
    loveLanguageProfile,
    communicationProfile,
    intimacyProfile,
    goalProfile,
    needExpressionProfile,
    aiSummary,
    completenessScore,
    confidenceScore
  }
}

function buildLoveLanguageProfile(responses: OnboardingResponse): LoveLanguageProfile {
  const rankings = responses.love_language_ranking || []
  const scores = responses.love_language_intensity || {}
  const examples = responses.love_language_examples || {}

  const primary = rankings[0] || 'quality_time'
  const secondary = rankings[1] || 'words_of_affirmation'

  const aiInsights = []
  const partnerGuidance = []

  // Generate insights based on primary love language
  const primaryScore = scores[primary] || 5
  if (primaryScore >= 8) {
    aiInsights.push(`Strongly values ${primary.replace(/_/g, ' ')} - this is essential for feeling loved`)
  }

  // Generate partner guidance
  switch (primary) {
    case 'words_of_affirmation':
      partnerGuidance.push('Offer specific, genuine compliments daily')
      partnerGuidance.push('Express appreciation for both big and small actions')
      break
    case 'quality_time':
      partnerGuidance.push('Schedule regular uninterrupted time together')
      partnerGuidance.push('Put away devices during conversations')
      break
    case 'physical_touch':
      partnerGuidance.push('Increase casual physical affection throughout the day')
      partnerGuidance.push('Be mindful of their need for physical comfort during stress')
      break
    case 'acts_of_service':
      partnerGuidance.push('Help with tasks that matter to them')
      partnerGuidance.push('Take initiative on household responsibilities')
      break
    case 'receiving_gifts':
      partnerGuidance.push('Focus on thoughtful, meaningful gifts over expensive ones')
      partnerGuidance.push('Remember special occasions and celebrate with tokens of love')
      break
  }

  // Add insight from examples
  if (examples.mostMeaningful && examples.mostMeaningful.length > 20) {
    aiInsights.push('Values personal, thoughtful gestures based on their examples')
  }

  return {
    primary,
    secondary,
    scores,
    personalizedExamples: examples,
    aiInsights,
    partnerGuidance
  }
}

function buildCommunicationProfile(responses: OnboardingResponse): CommunicationProfile {
  const style = responses.communication_approach || 'thoughtful_diplomatic'
  const conflictStyle = responses.conflict_style || 'seek_compromise'
  const stressResponse = responses.stress_response || 'seek_support'
  const preferences = responses.expression_preferences || {}
  const timing = responses.communication_timing || []

  const aiInsights = []
  const partnerGuidance = []

  // Generate insights based on communication patterns
  if (conflictStyle === 'need_time_process') {
    aiInsights.push('Needs processing time before difficult conversations')
    partnerGuidance.push('Give them space to process before expecting responses')
    partnerGuidance.push("Say 'Let's talk when you're ready' instead of pushing for immediate discussion")
  }

  if (stressResponse === 'need_space') {
    aiInsights.push('Requires alone time when stressed before being receptive to support')
    partnerGuidance.push('Offer support but respect their need for space when overwhelmed')
  }

  if (timing.includes('evening')) {
    partnerGuidance.push('Evening conversations tend to be most effective for deeper topics')
  }

  return {
    style,
    conflictStyle,
    stressResponse,
    preferences,
    optimalTiming: timing,
    aiInsights,
    partnerGuidance
  }
}

function buildIntimacyProfile(responses: OnboardingResponse): IntimacyProfile {
  const priorities = responses.intimacy_priorities || {}
  const enhancers = responses.intimacy_enhancers || []
  const barriers = responses.intimacy_barriers || []
  const frequencies = responses.connection_frequency || {}

  const aiInsights = []
  const partnerGuidance = []

  // Find top intimacy priority
  const topPriority = Object.entries(priorities)
    .sort(([,a], [,b]) => (b as number) - (a as number))[0]

  if (topPriority) {
    aiInsights.push(`${topPriority[0]} intimacy is their highest priority (${topPriority[1]}/10)`)
    
    switch (topPriority[0]) {
      case 'emotional':
        partnerGuidance.push('Focus on sharing feelings and being vulnerable')
        break
      case 'physical':
        partnerGuidance.push('Prioritize physical affection and intimate touch')
        break
      case 'intellectual':
        partnerGuidance.push('Engage in deep conversations about meaningful topics')
        break
    }
  }

  // Generate guidance from enhancers
  if (enhancers.includes('undivided_attention')) {
    partnerGuidance.push('Give complete attention during intimate moments')
  }

  if (enhancers.includes('vulnerability')) {
    partnerGuidance.push('Share your own vulnerabilities to deepen connection')
  }

  // Generate guidance from barriers
  if (barriers.includes('distractions')) {
    aiInsights.push('Technology distractions significantly impact their sense of connection')
    partnerGuidance.push('Create phone-free zones for intimate conversations')
  }

  return {
    priorities,
    enhancers,
    barriers,
    frequencies,
    aiInsights,
    partnerGuidance
  }
}

function buildGoalProfile(responses: OnboardingResponse): GoalProfile {
  const goals = responses.primary_goals || []
  const timeline = responses.goal_timeline || '6_months'
  const challenges = responses.specific_challenges || ''
  const values = responses.relationship_values || []
  const successVision = responses.success_metrics || ''

  const aiInsights = []

  if (goals.includes('improve_communication')) {
    aiInsights.push('Communication improvement is a priority - focus on listening and expression skills')
  }

  if (goals.includes('deepen_intimacy')) {
    aiInsights.push('Ready for deeper intimacy work - emotional vulnerability will be key')
  }

  return {
    primaryGoals: goals,
    timeline,
    challenges,
    values,
    successVision,
    aiInsights
  }
}

function buildNeedExpressionProfile(responses: OnboardingResponse): NeedExpressionProfile {
  const directness = responses.expression_directness || 'somewhat_direct'
  const frequency = responses.expression_frequency || 'when_necessary'
  const methods = responses.preferred_methods || []
  const categoryDifficulty = responses.need_categories_ranking || {}
  const partnerAbility = responses.partner_reading_ability || 5
  const successfulExample = responses.successful_communication || ''
  const barriers = responses.communication_barriers || []

  const aiInsights = []
  let suggestionStrategy = 'balanced'

  // Determine optimal suggestion strategy for partner insights
  if (directness === 'very_indirect' && partnerAbility <= 5) {
    suggestionStrategy = 'very_direct'
    aiInsights.push('Partner needs very direct suggestions since user communicates indirectly')
  } else if (directness === 'very_direct' && partnerAbility >= 7) {
    suggestionStrategy = 'gentle_subtle'
    aiInsights.push('Partner is good at reading cues, suggestions can be more subtle')
  }

  // Analyze communication barriers
  if (barriers.includes('fear_rejection')) {
    aiInsights.push('User fears rejection when expressing needs - partner should be extra supportive')
  }

  if (barriers.includes('dont_want_burden')) {
    aiInsights.push("User doesn't want to be a burden - frame suggestions as mutual benefits")
  }

  return {
    style: {
      directness,
      frequency,
      preferredMethods: methods
    },
    categoryDifficulty,
    partnerAwareness: {
      currentLevel: partnerAbility,
      successfulExample
    },
    communicationBarriers: barriers,
    aiInsights,
    suggestionStrategy
  }
}

function calculateCompleteness(responses: OnboardingResponse): number {
  let completedFields = 0
  let totalFields = 0

  Object.entries(responses).forEach(([key, value]) => {
    totalFields++
    if (value && (
      (Array.isArray(value) && value.length > 0) ||
      (typeof value === 'object' && Object.keys(value).length > 0) ||
      (typeof value === 'string' && value.length > 0) ||
      (typeof value === 'number' && value > 0)
    )) {
      completedFields++
    }
  })

  return Math.round((completedFields / totalFields) * 100)
}

function calculateConfidence(responses: OnboardingResponse): number {
  let score = 0.5 // Base confidence

  // Increase confidence based on response quality
  if (responses.love_language_examples?.mostMeaningful && responses.love_language_examples.mostMeaningful.length > 50) {
    score += 0.1
  }
  
  if (responses.specific_challenges && responses.specific_challenges.length > 100) {
    score += 0.1
  }
  
  if (responses.successful_communication && responses.successful_communication.length > 50) {
    score += 0.1
  }
  
  if (responses.success_metrics && responses.success_metrics.length > 50) {
    score += 0.1
  }
  
  if (responses.partner_reading_ability && responses.partner_reading_ability >= 1 && responses.partner_reading_ability <= 10) {
    score += 0.1
  }

  return Math.min(score, 1.0)
}

function generateProfileSummary(profileData: any): AISummary {
  const { loveLanguageProfile, communicationProfile, needExpressionProfile, completenessScore, confidenceScore } = profileData

  const keyInsights = [
    ...loveLanguageProfile.aiInsights,
    ...communicationProfile.aiInsights,
    ...needExpressionProfile.aiInsights
  ].slice(0, 5)

  const strengthAreas = []
  const improvementAreas = []

  if (communicationProfile.preferences.directness >= 7) {
    strengthAreas.push('Direct communication style')
  } else {
    improvementAreas.push('Could benefit from more direct communication')
  }

  if (needExpressionProfile.partnerAwareness.currentLevel >= 7) {
    strengthAreas.push('Partner is good at reading their needs')
  } else {
    improvementAreas.push('Partner needs more guidance to understand their needs')
  }

  const confidenceLevel = completenessScore >= 90 && confidenceScore >= 0.8 ? 'very_high' :
                         completenessScore >= 75 && confidenceScore >= 0.6 ? 'high' :
                         completenessScore >= 60 && confidenceScore >= 0.4 ? 'medium' : 'low'

  const overallProfile = `This person primarily feels loved through ${loveLanguageProfile.primary.replace(/_/g, ' ')} and communicates in a ${communicationProfile.style} style. Their partner ${needExpressionProfile.suggestionStrategy === 'very_direct' ? 'needs direct guidance' : 'can pick up on subtle cues'}.`

  return {
    overallProfile,
    keyInsights,
    partnerSuggestionApproach: needExpressionProfile.suggestionStrategy,
    strengthAreas,
    improvementAreas,
    confidenceLevel
  }
}