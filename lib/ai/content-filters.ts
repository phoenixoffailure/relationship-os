// lib/ai/content-filters.ts
// Content filtering and boundary enforcement for Universal Relationship OS
// Phase 7.1 Implementation - Prevent inappropriate AI suggestions

import { RelationshipType, RELATIONSHIP_TYPE_CONFIGS } from './relationship-type-intelligence'
import { getAIPersonality } from './personalities'

export interface ContentFilter {
  type: RelationshipType
  prohibitedPatterns: RegExp[]
  requiredElements: string[]
  boundaryViolations: {
    pattern: RegExp
    violation: string
    severity: 'high' | 'medium' | 'low'
  }[]
}

// Content filters for each relationship type
export const CONTENT_FILTERS: Record<RelationshipType, ContentFilter> = {
  romantic: {
    type: 'romantic',
    prohibitedPatterns: [
      // No overly clinical language
      /\b(analyze|assessment|intervention|clinical|therapeutic protocol)\b/gi,
      // No inappropriate familiarity
      /\b(sweetheart|honey|darling|babe)\b/gi
    ],
    requiredElements: [
      'emotional warmth',
      'relationship focus',
      'professional boundaries'
    ],
    boundaryViolations: [
      {
        pattern: /\b(I'm so touched|I feel|my heart)\b/gi,
        violation: 'AI expressing personal emotions inappropriately',
        severity: 'medium'
      }
    ]
  },

  work: {
    type: 'work',
    prohibitedPatterns: [
      // No intimacy or romantic content
      /\b(intimate|intimacy|romantic|sexual|attraction|feelings for|crush|love)\b/gi,
      // No physical touch suggestions
      /\b(hug|touch|kiss|cuddle|massage|physical affection|hold hands)\b/gi,
      // No personal emotional support
      /\b(emotional support|share your feelings|open up emotionally|personal problems)\b/gi,
      // No personal life advice
      /\b(personal relationship|family issues|dating life|romantic problems)\b/gi
    ],
    requiredElements: [
      'professional boundaries',
      'workplace appropriateness',
      'career focus'
    ],
    boundaryViolations: [
      {
        pattern: /\b(share personal|emotional vulnerability|personal life|private matters)\b/gi,
        violation: 'Suggesting inappropriate personal sharing in workplace',
        severity: 'high'
      },
      {
        pattern: /\b(romantic|sexual|intimate|attraction)\b/gi,
        violation: 'Romantic/sexual content in professional context',
        severity: 'high'
      },
      {
        pattern: /\b(hug|kiss|touch|physical)\b/gi,
        violation: 'Physical contact suggestions in workplace',
        severity: 'high'
      }
    ]
  },

  family: {
    type: 'family',
    prohibitedPatterns: [
      // No romantic or sexual content
      /\b(romantic|sexual|intimate partner|attraction|dating|crush)\b/gi,
      // No inappropriate physical suggestions
      /\b(romantic touch|sexual|intimate physical)\b/gi,
      // Avoid taking sides
      /\b(they're wrong|you should cut them off|they're toxic|you deserve better)\b/gi
    ],
    requiredElements: [
      'family complexity awareness',
      'generational respect',
      'diplomatic approach'
    ],
    boundaryViolations: [
      {
        pattern: /\b(cut them off|go no contact|they're toxic|family is toxic)\b/gi,
        violation: 'Inappropriately advising family estrangement',
        severity: 'high'
      },
      {
        pattern: /\b(romantic|sexual|intimate relationship)\b/gi,
        violation: 'Romantic content in family context',
        severity: 'high'
      }
    ]
  },

  friend: {
    type: 'friend',
    prohibitedPatterns: [
      // No romantic implications
      /\b(romantic feelings|attraction|dating potential|romantic relationship|crush)\b/gi,
      // No excessive emotional dependency
      /\b(depend on them emotionally|they owe you|you should expect|demand support)\b/gi,
      // No family or work advice
      /\b(family relationship|workplace issue|professional advice|career guidance)\b/gi
    ],
    requiredElements: [
      'friendship focus',
      'mutual enjoyment',
      'voluntary nature'
    ],
    boundaryViolations: [
      {
        pattern: /\b(romantic potential|dating|attraction|romantic feelings)\b/gi,
        violation: 'Romantic implications in friendship context',
        severity: 'medium'
      },
      {
        pattern: /\b(they owe you|you deserve|demand|expect them to)\b/gi,
        violation: 'Encouraging unhealthy friendship expectations',
        severity: 'medium'
      }
    ]
  },

  other: {
    type: 'other',
    prohibitedPatterns: [
      // No assumptions about relationship nature
      /\b(obviously romantic|clearly family|definitely work|this is a)\b/gi,
      // No overly specific advice without context
      /\b(you should definitely|the best approach is always|everyone should)\b/gi
    ],
    requiredElements: [
      'context awareness',
      'adaptive approach',
      'no assumptions'
    ],
    boundaryViolations: [
      {
        pattern: /\b(this is obviously|you should definitely|the only way)\b/gi,
        violation: 'Making assumptions about unclear relationship context',
        severity: 'medium'
      }
    ]
  }
}

// Function to filter and validate AI response content
export function filterContent(
  content: string,
  relationshipType: RelationshipType
): {
  isValid: boolean
  filteredContent?: string
  violations: string[]
  severity: 'high' | 'medium' | 'low' | 'none'
} {
  const filter = CONTENT_FILTERS[relationshipType]
  const violations: string[] = []
  let maxSeverity: 'high' | 'medium' | 'low' | 'none' = 'none'

  // Check for prohibited patterns
  for (const pattern of filter.prohibitedPatterns) {
    if (pattern.test(content)) {
      violations.push(`Contains prohibited content for ${relationshipType} relationship: ${pattern.source}`)
      maxSeverity = 'high'
    }
  }

  // Check for boundary violations
  for (const boundaryCheck of filter.boundaryViolations) {
    if (boundaryCheck.pattern.test(content)) {
      violations.push(boundaryCheck.violation)
      if (boundaryCheck.severity === 'high' || (boundaryCheck.severity === 'medium' && maxSeverity !== 'high')) {
        maxSeverity = boundaryCheck.severity
      }
    }
  }

  // If high severity violations, reject content
  if (maxSeverity === 'high') {
    return {
      isValid: false,
      violations,
      severity: maxSeverity
    }
  }

  // For medium/low severity, clean content and warn
  let filteredContent = content
  
  // Apply content cleaning for medium violations
  if (maxSeverity === 'medium') {
    // Remove or replace problematic content
    for (const pattern of filter.prohibitedPatterns) {
      filteredContent = filteredContent.replace(pattern, '[CONTENT_FILTERED]')
    }
  }

  return {
    isValid: violations.length === 0 || maxSeverity !== 'high',
    filteredContent: filteredContent,
    violations,
    severity: maxSeverity
  }
}

// Function to validate AI response meets relationship requirements
export function validateResponseRequirements(
  content: string,
  relationshipType: RelationshipType
): {
  hasRequiredElements: boolean
  missingElements: string[]
  suggestions: string[]
} {
  const filter = CONTENT_FILTERS[relationshipType]
  const personality = getAIPersonality(relationshipType)
  const config = RELATIONSHIP_TYPE_CONFIGS[relationshipType]
  
  const lowerContent = content.toLowerCase()
  const missingElements: string[] = []
  const suggestions: string[] = []

  // Check for required personality elements
  for (const required of personality.requiredElements) {
    const requiredLower = required.toLowerCase()
    
    // Simple check - in production, this would be more sophisticated
    if (!lowerContent.includes(requiredLower.split(' ')[0])) {
      missingElements.push(required)
      suggestions.push(`Consider adding ${required} to align with ${personality.role} approach`)
    }
  }

  // Relationship-specific validations
  switch (relationshipType) {
    case 'work':
      if (!lowerContent.includes('professional') && !lowerContent.includes('workplace') && !lowerContent.includes('career')) {
        missingElements.push('professional context')
        suggestions.push('Include professional context or workplace relevance')
      }
      break
      
    case 'romantic':
      if (!lowerContent.includes('relationship') && !lowerContent.includes('partner') && !lowerContent.includes('connection')) {
        missingElements.push('relationship focus')
        suggestions.push('Include relationship or partnership focus')
      }
      break
      
    case 'family':
      if (!lowerContent.includes('family') && !lowerContent.includes('generation') && !lowerContent.includes('boundary')) {
        missingElements.push('family awareness')
        suggestions.push('Include family dynamics or generational awareness')
      }
      break
      
    case 'friend':
      if (!lowerContent.includes('friend') && !lowerContent.includes('social') && !lowerContent.includes('enjoy')) {
        missingElements.push('friendship focus')
        suggestions.push('Include friendship or social enjoyment focus')
      }
      break
  }

  return {
    hasRequiredElements: missingElements.length === 0,
    missingElements,
    suggestions
  }
}

// Function to get content filtering guidelines for AI prompt
export function getFilteringGuidelines(relationshipType: RelationshipType): string {
  const filter = CONTENT_FILTERS[relationshipType]
  const personality = getAIPersonality(relationshipType)
  
  return `
CONTENT FILTERING REQUIREMENTS FOR ${relationshipType.toUpperCase()} RELATIONSHIP:

NEVER INCLUDE:
${filter.prohibitedPatterns.map(p => `- Content matching: ${p.source}`).join('\n')}

ALWAYS INCLUDE:
${filter.requiredElements.map(e => `- ${e}`).join('\n')}

BOUNDARY VIOLATIONS TO AVOID:
${filter.boundaryViolations.map(v => `- ${v.violation} (severity: ${v.severity})`).join('\n')}

PERSONALITY REQUIREMENTS:
- Role: ${personality.role}
- Tone: ${personality.communicationStyle.tone}
- Focus: ${personality.communicationStyle.focusAreas.join(', ')}

Remember: Content that violates these guidelines will be rejected or filtered before reaching the user.
`
}

export default {
  CONTENT_FILTERS,
  filterContent,
  validateResponseRequirements,
  getFilteringGuidelines
}