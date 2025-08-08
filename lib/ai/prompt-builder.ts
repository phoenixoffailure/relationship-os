// lib/ai/prompt-builder.ts
// Dynamic AI prompt generation based on relationship type for Universal Relationship OS
// Phase 7.1 Implementation - True behavioral differentiation

import { RelationshipType } from './relationship-type-intelligence'
import { getAIPersonality, buildPersonalityPrompt } from './personalities'
import { getFilteringGuidelines } from './content-filters'

export interface UserPsychologicalProfile {
  firoNeeds?: {
    inclusion: number // 1-9
    control: number // 1-9  
    affection: number // 1-9
  }
  attachmentStyle?: 'secure' | 'anxious' | 'avoidant' | 'disorganized'
  communicationStyle?: {
    directness: 'direct' | 'moderate' | 'diplomatic'
    assertiveness: 'assertive' | 'moderate' | 'passive'
  }
  loveLanguages?: string[]
}

export interface RelationshipContext {
  relationshipId: string
  relationshipType: RelationshipType
  relationshipName?: string
  partnerName?: string
  relationshipLength?: string
  currentChallenges?: string[]
  recentPositives?: string[]
}

export interface PromptBuildingOptions {
  taskType: 'insights' | 'partner-suggestions' | 'analysis' | 'general'
  includePersonality: boolean
  includeFiltering: boolean
  includePsychProfile: boolean
  includeRelationshipContext: boolean
}

// Main function to build relationship-aware AI prompts
export function buildRelationshipAwarePrompt(
  relationshipType: RelationshipType,
  basePrompt: string,
  userPsychProfile?: UserPsychologicalProfile,
  relationshipContext?: RelationshipContext,
  options: Partial<PromptBuildingOptions> = {}
): string {
  const {
    taskType = 'general',
    includePersonality = true,
    includeFiltering = true,
    includePsychProfile = true,
    includeRelationshipContext = true
  } = options

  let fullPrompt = ''

  // 1. Add personality system prompt
  if (includePersonality) {
    const personality = getAIPersonality(relationshipType)
    fullPrompt += `${personality.systemPrompt}\n\n`
  }

  // 2. Add relationship-specific context
  if (includeRelationshipContext && relationshipContext) {
    fullPrompt += buildRelationshipContextSection(relationshipContext)
  }

  // 3. Add psychological profile adaptation
  if (includePsychProfile && userPsychProfile) {
    fullPrompt += buildPsychProfileSection(relationshipType, userPsychProfile)
  }

  // 4. Add task-specific instructions
  fullPrompt += buildTaskSpecificSection(taskType, relationshipType)

  // 5. Add content filtering guidelines
  if (includeFiltering) {
    fullPrompt += getFilteringGuidelines(relationshipType)
  }

  // 6. Add the base prompt/task
  fullPrompt += `\nTASK CONTEXT:\n${basePrompt}\n\n`

  // 7. Add final instructions
  fullPrompt += buildFinalInstructions(relationshipType, taskType)

  return fullPrompt
}

// Build relationship context section
function buildRelationshipContextSection(context: RelationshipContext): string {
  const personality = getAIPersonality(context.relationshipType)
  
  return `
RELATIONSHIP CONTEXT:
- Type: ${context.relationshipType} (${personality.displayName})
- Name: ${context.relationshipName || 'This relationship'}
- Partner: ${context.partnerName || 'Their connection'}
- Duration: ${context.relationshipLength || 'Not specified'}
${context.currentChallenges ? `- Current challenges: ${context.currentChallenges.join(', ')}` : ''}
${context.recentPositives ? `- Recent positives: ${context.recentPositives.join(', ')}` : ''}

Your role: ${personality.role}
Communication style: ${personality.communicationStyle.tone}

`
}

// Build psychological profile adaptation section  
function buildPsychProfileSection(
  relationshipType: RelationshipType,
  profile: UserPsychologicalProfile
): string {
  let section = `USER PSYCHOLOGICAL PROFILE ADAPTATIONS:\n`

  // FIRO needs adaptation
  if (profile.firoNeeds) {
    const { inclusion, control, affection } = profile.firoNeeds
    
    section += `FIRO Needs Integration:\n`
    
    if (inclusion >= 7) {
      section += `- HIGH INCLUSION NEED (${inclusion}/9): Emphasize connection, belonging, and being included in relationship decisions\n`
    } else if (inclusion <= 3) {
      section += `- LOW INCLUSION NEED (${inclusion}/9): Respect their need for independence and avoid overwhelming with social suggestions\n`
    }
    
    if (control >= 7) {
      section += `- HIGH CONTROL NEED (${control}/9): Offer choices, respect their autonomy, provide structure and options\n`
    } else if (control <= 3) {
      section += `- LOW CONTROL NEED (${control}/9): Provide clear guidance and direction, they prefer being guided\n`
    }
    
    if (affection >= 7 && relationshipType === 'romantic') {
      section += `- HIGH AFFECTION NEED (${affection}/9): Warm, caring language appropriate; they value emotional closeness\n`
    } else if (affection >= 7 && relationshipType !== 'romantic') {
      section += `- HIGH AFFECTION NEED (${affection}/9): Warm but appropriate language for ${relationshipType} context\n`
    }
  }

  // Attachment style adaptation
  if (profile.attachmentStyle) {
    section += `ATTACHMENT STYLE ADAPTATION (${profile.attachmentStyle}):\n`
    
    switch (profile.attachmentStyle) {
      case 'secure':
        section += `- Use confident, direct communication; they can handle straightforward feedback\n`
        break
      case 'anxious':
        section += `- Provide extra reassurance and validation; emphasize stability and consistency\n`
        break
      case 'avoidant':
        section += `- Respect their independence; avoid pushing for emotional vulnerability too quickly\n`
        break
      case 'disorganized':
        section += `- Be gentle about relationship struggles; validate internal conflict without judgment\n`
        break
    }
  }

  // Communication style adaptation
  if (profile.communicationStyle) {
    section += `COMMUNICATION STYLE ADAPTATION:\n`
    section += `- Directness: ${profile.communicationStyle.directness} - `
    
    switch (profile.communicationStyle.directness) {
      case 'direct':
        section += `Use straightforward, honest communication\n`
        break
      case 'diplomatic':
        section += `Use gentle, tactful language with careful phrasing\n`
        break
      default:
        section += `Balance directness with tact\n`
    }
    
    section += `- Assertiveness: ${profile.communicationStyle.assertiveness} - `
    
    switch (profile.communicationStyle.assertiveness) {
      case 'assertive':
        section += `They can handle confident suggestions and feedback\n`
        break
      case 'passive':
        section += `Provide gentle encouragement and support for speaking up\n`
        break
      default:
        section += `Balanced approach to assertiveness\n`
    }
  }

  return section + `\n`
}

// Build task-specific instructions
function buildTaskSpecificSection(
  taskType: 'insights' | 'partner-suggestions' | 'analysis' | 'general',
  relationshipType: RelationshipType
): string {
  const personality = getAIPersonality(relationshipType)
  
  let section = `TASK-SPECIFIC INSTRUCTIONS FOR ${taskType.toUpperCase()}:\n`

  switch (taskType) {
    case 'insights':
      section += `You are generating personal insights for someone about their ${relationshipType} relationship.
      
INSIGHTS SHOULD:
- Use your ${personality.role} expertise
- Follow your communication style: ${personality.communicationStyle.tone}
- Focus on: ${personality.communicationStyle.focusAreas.join(', ')}
- Provide actionable guidance within appropriate boundaries
- Validate their efforts and growth
- Offer specific, practical suggestions

INSIGHTS FORMAT:
- Title: Brief, engaging insight title
- Content: 2-3 paragraphs with specific guidance
- Tone: Match ${relationshipType} relationship requirements

`
      break

    case 'partner-suggestions':
      section += `You are generating suggestions for their partner/connection about supporting this person.
      
PARTNER SUGGESTIONS SHOULD:
- Help the partner understand how to support them better
- Bridge different communication/love styles appropriately
- Maintain anonymity (never reveal specific journal content)
- Focus on: ${personality.communicationStyle.focusAreas.join(', ')}
- Respect ${relationshipType} relationship boundaries
- Be actionable and specific

SUGGESTION FORMAT:
- Type: The kind of support needed
- Action: Specific thing partner can do
- Context: Why this would help (without revealing private details)

`
      break

    case 'analysis':
      section += `You are analyzing journal content for psychological patterns and relationship insights.
      
ANALYSIS SHOULD:
- Use your ${personality.role} expertise
- Identify patterns appropriate to ${relationshipType} relationships
- Respect privacy (analysis stays private)
- Focus on growth and improvement opportunities
- Consider relationship context and appropriate boundaries

`
      break

    case 'general':
      section += `You are providing general guidance as a ${personality.role}.
      
GUIDANCE SHOULD:
- Stay within your expertise area
- Respect ${relationshipType} relationship boundaries
- Use appropriate tone: ${personality.communicationStyle.tone}
- Focus on: ${personality.communicationStyle.focusAreas.join(', ')}

`
      break
  }

  return section
}

// Build final instructions
function buildFinalInstructions(
  relationshipType: RelationshipType, 
  taskType: string
): string {
  const personality = getAIPersonality(relationshipType)
  
  return `
FINAL REQUIREMENTS:

ROLE CONSISTENCY:
- You are a ${personality.role} - stay in character throughout
- Never provide guidance outside your specialty area
- If asked about other relationship types, refer to appropriate resources

RESPONSE QUALITY:
- Use natural, conversational language (not clinical/robotic)
- Be specific and actionable
- Maintain appropriate ${relationshipType} relationship boundaries
- Include validation and encouragement
- End with forward-looking perspective

BOUNDARY REMINDERS:
${personality.communicationStyle.boundaries.map(b => `- ${b}`).join('\n')}

Remember: Your response will be filtered for appropriateness. Ensure all content aligns with ${relationshipType} relationship boundaries and your role as ${personality.role}.
`
}

// Specialized prompt builders for common use cases

export function buildInsightsPrompt(
  relationshipType: RelationshipType,
  journalContent: string,
  userPsychProfile?: UserPsychologicalProfile,
  relationshipContext?: RelationshipContext
): string {
  const basePrompt = `Analyze this journal content and generate 4 helpful insights for someone working on their ${relationshipType} relationship:

JOURNAL CONTENT:
${journalContent}

Generate insights that:
1. Acknowledge what they're experiencing
2. Provide specific, actionable guidance
3. Validate their efforts and progress
4. Offer hope and forward momentum

Focus on patterns, growth opportunities, appreciation of efforts, and next steps that are appropriate for their ${relationshipType} relationship.`

  return buildRelationshipAwarePrompt(
    relationshipType,
    basePrompt,
    userPsychProfile,
    relationshipContext,
    { taskType: 'insights' }
  )
}

export function buildPartnerSuggestionsPrompt(
  relationshipType: RelationshipType,
  anonymizedInsights: string,
  partnerPsychProfile?: UserPsychologicalProfile,
  relationshipContext?: RelationshipContext
): string {
  const basePrompt = `Based on anonymized insights about what someone in a ${relationshipType} relationship is experiencing, generate 3 helpful suggestions for their partner/connection:

ANONYMIZED INSIGHTS:
${anonymizedInsights}

Generate suggestions that:
1. Help the partner/connection provide better support
2. Bridge different communication and support styles
3. Maintain complete privacy (never reveal specific details)
4. Are appropriate for ${relationshipType} relationship boundaries
5. Are specific and actionable

Focus on practical ways the partner can show support, understanding, and care within the context of their ${relationshipType} relationship.`

  return buildRelationshipAwarePrompt(
    relationshipType,
    basePrompt,
    partnerPsychProfile,
    relationshipContext,
    { taskType: 'partner-suggestions' }
  )
}

export default {
  buildRelationshipAwarePrompt,
  buildInsightsPrompt,
  buildPartnerSuggestionsPrompt
}