// lib/metrics/relationship-metrics.ts
// Phase 7.2: Relationship-Specific Metrics & Features
// Replace universal romantic metrics with relationship-appropriate ones

import { RelationshipType } from '@/lib/ai/relationship-type-intelligence'

// Base metric interface
export interface BaseMetric {
  name: string
  displayName: string
  description: string
  min: number
  max: number
  unit?: string
  color?: string
}

// Relationship-specific metric configurations
export interface RelationshipMetricConfig {
  relationshipType: RelationshipType
  displayName: string
  primaryMetrics: BaseMetric[]
  secondaryMetrics: BaseMetric[]
  checkInQuestions: CheckInQuestion[]
  healthScoreWeights: Record<string, number>
  improvementAreas: string[]
}

export interface CheckInQuestion {
  id: string
  question: string
  type: 'slider' | 'text' | 'select'
  options?: string[]
  metric: string
  required: boolean
}

// Relationship-specific metric definitions
export const RELATIONSHIP_METRICS: Record<RelationshipType, RelationshipMetricConfig> = {
  romantic: {
    relationshipType: 'romantic',
    displayName: 'Romantic Partnership',
    primaryMetrics: [
      {
        name: 'connection_score',
        displayName: 'Connection Level',
        description: 'How connected and close you feel to your romantic partner',
        min: 1,
        max: 10,
        color: '#E91E63'
      },
      {
        name: 'intimacy_score',
        displayName: 'Intimacy Level', 
        description: 'Physical and emotional intimacy in your relationship',
        min: 1,
        max: 10,
        color: '#FF5722'
      },
      {
        name: 'future_alignment',
        displayName: 'Future Alignment',
        description: 'How aligned you are on future plans and goals',
        min: 1,
        max: 10,
        color: '#9C27B0'
      }
    ],
    secondaryMetrics: [
      {
        name: 'communication_quality',
        displayName: 'Communication Quality',
        description: 'How well you communicate with each other',
        min: 1,
        max: 10,
        color: '#2196F3'
      },
      {
        name: 'conflict_resolution',
        displayName: 'Conflict Resolution',
        description: 'How effectively you resolve disagreements',
        min: 1,
        max: 10,
        color: '#FF9800'
      },
      {
        name: 'shared_activities',
        displayName: 'Quality Time',
        description: 'Satisfaction with time spent together',
        min: 1,
        max: 10,
        color: '#4CAF50'
      }
    ],
    checkInQuestions: [
      {
        id: 'connection_score',
        question: 'How connected do you feel to your partner today?',
        type: 'slider',
        metric: 'connection_score',
        required: true
      },
      {
        id: 'intimacy_score', 
        question: 'How satisfied are you with intimacy (physical and emotional) lately?',
        type: 'slider',
        metric: 'intimacy_score',
        required: true
      },
      {
        id: 'future_alignment',
        question: 'How aligned do you feel with your partner on future plans and goals?',
        type: 'slider',
        metric: 'future_alignment',
        required: true
      },
      {
        id: 'gratitude_note',
        question: 'What are you grateful for in your relationship today?',
        type: 'text',
        metric: 'gratitude_note',
        required: false
      },
      {
        id: 'challenge_note',
        question: 'Any relationship challenges you\'re working through?',
        type: 'text', 
        metric: 'challenge_note',
        required: false
      }
    ],
    healthScoreWeights: {
      connection_score: 0.30,
      intimacy_score: 0.25,
      future_alignment: 0.20,
      communication_quality: 0.15,
      conflict_resolution: 0.10
    },
    improvementAreas: [
      'Emotional intimacy',
      'Physical connection',
      'Future planning',
      'Daily communication',
      'Conflict resolution',
      'Quality time together'
    ]
  },

  work: {
    relationshipType: 'work',
    displayName: 'Professional Relationship',
    primaryMetrics: [
      {
        name: 'professional_rapport',
        displayName: 'Professional Rapport',
        description: 'How well you work together professionally',
        min: 1,
        max: 10,
        color: '#1565C0'
      },
      {
        name: 'collaboration_effectiveness',
        displayName: 'Collaboration Effectiveness', 
        description: 'How effectively you collaborate on work tasks',
        min: 1,
        max: 10,
        color: '#0277BD'
      },
      {
        name: 'boundary_health',
        displayName: 'Boundary Health',
        description: 'How well professional boundaries are maintained',
        min: 1,
        max: 10,
        color: '#0288D1'
      }
    ],
    secondaryMetrics: [
      {
        name: 'communication_clarity',
        displayName: 'Communication Clarity',
        description: 'How clear and effective work communication is',
        min: 1,
        max: 10,
        color: '#039BE5'
      },
      {
        name: 'goal_alignment',
        displayName: 'Goal Alignment',
        description: 'How aligned you are on professional objectives',
        min: 1,
        max: 10,
        color: '#03A9F4'
      },
      {
        name: 'mutual_respect',
        displayName: 'Mutual Respect',
        description: 'Level of professional respect and courtesy',
        min: 1,
        max: 10,
        color: '#29B6F6'
      }
    ],
    checkInQuestions: [
      {
        id: 'professional_rapport',
        question: 'How would you rate your professional working relationship today?',
        type: 'slider',
        metric: 'professional_rapport',
        required: true
      },
      {
        id: 'collaboration_effectiveness',
        question: 'How effective was your collaboration on work tasks recently?',
        type: 'slider',
        metric: 'collaboration_effectiveness',
        required: true
      },
      {
        id: 'work_gratitude',
        question: 'What do you appreciate about working with this person?',
        type: 'text',
        metric: 'work_gratitude',
        required: false
      },
      {
        id: 'work_challenges',
        question: 'Any professional challenges or areas for improvement?',
        type: 'text',
        metric: 'work_challenges', 
        required: false
      }
    ],
    healthScoreWeights: {
      professional_rapport: 0.25,
      collaboration_effectiveness: 0.25,
      boundary_health: 0.20,
      communication_clarity: 0.15,
      goal_alignment: 0.15
    },
    improvementAreas: [
      'Communication clarity',
      'Project collaboration',
      'Professional boundaries',
      'Goal alignment',
      'Mutual respect',
      'Work efficiency'
    ]
  },

  family: {
    relationshipType: 'family',
    displayName: 'Family Relationship',
    primaryMetrics: [
      {
        name: 'family_harmony',
        displayName: 'Family Harmony',
        description: 'Overall sense of peace and harmony in the relationship',
        min: 1,
        max: 10,
        color: '#388E3C'
      },
      {
        name: 'boundary_respect',
        displayName: 'Boundary Respect',
        description: 'How well personal boundaries are respected',
        min: 1,
        max: 10,
        color: '#689F38'
      },
      {
        name: 'generational_understanding',
        displayName: 'Generational Understanding',
        description: 'Mutual understanding across generational differences',
        min: 1,
        max: 10,
        color: '#7CB342'
      }
    ],
    secondaryMetrics: [
      {
        name: 'communication_openness',
        displayName: 'Communication Openness',
        description: 'How openly and honestly you communicate',
        min: 1,
        max: 10,
        color: '#8BC34A'
      },
      {
        name: 'support_level',
        displayName: 'Support Level',
        description: 'How supported you feel in the relationship',
        min: 1,
        max: 10,
        color: '#9CCC65'
      },
      {
        name: 'tradition_connection',
        displayName: 'Tradition Connection',
        description: 'Connection through family traditions and shared history',
        min: 1,
        max: 10,
        color: '#AED581'
      }
    ],
    checkInQuestions: [
      {
        id: 'family_harmony',
        question: 'How harmonious did your family interaction feel today?',
        type: 'slider',
        metric: 'family_harmony',
        required: true
      },
      {
        id: 'boundary_respect',
        question: 'How well were your boundaries respected in family interactions?',
        type: 'slider',
        metric: 'boundary_respect',
        required: true
      },
      {
        id: 'family_gratitude',
        question: 'What are you grateful for in this family relationship?',
        type: 'text',
        metric: 'family_gratitude',
        required: false
      },
      {
        id: 'family_challenges',
        question: 'Any family dynamics you\'re navigating or working on?',
        type: 'text',
        metric: 'family_challenges',
        required: false
      }
    ],
    healthScoreWeights: {
      family_harmony: 0.25,
      boundary_respect: 0.25,
      generational_understanding: 0.20,
      communication_openness: 0.15,
      support_level: 0.15
    },
    improvementAreas: [
      'Family communication',
      'Boundary setting',
      'Generational bridge-building',
      'Conflict resolution',
      'Emotional support',
      'Tradition building'
    ]
  },

  friend: {
    relationshipType: 'friend',
    displayName: 'Friendship',
    primaryMetrics: [
      {
        name: 'friendship_satisfaction',
        displayName: 'Friendship Satisfaction',
        description: 'Overall satisfaction and joy in the friendship',
        min: 1,
        max: 10,
        color: '#FF9800'
      },
      {
        name: 'mutual_support',
        displayName: 'Mutual Support',
        description: 'How well you support each other through ups and downs',
        min: 1,
        max: 10,
        color: '#FB8C00'
      },
      {
        name: 'social_energy',
        displayName: 'Social Energy',
        description: 'How energized vs drained you feel after spending time together',
        min: 1,
        max: 10,
        color: '#F57C00'
      }
    ],
    secondaryMetrics: [
      {
        name: 'shared_interests',
        displayName: 'Shared Interests',
        description: 'How much you enjoy shared activities and interests',
        min: 1,
        max: 10,
        color: '#EF6C00'
      },
      {
        name: 'trust_level',
        displayName: 'Trust Level',
        description: 'How much you trust and rely on each other',
        min: 1,
        max: 10,
        color: '#E65100'
      },
      {
        name: 'fun_factor',
        displayName: 'Fun Factor',
        description: 'How much fun and laughter you share together',
        min: 1,
        max: 10,
        color: '#D84315'
      }
    ],
    checkInQuestions: [
      {
        id: 'friendship_satisfaction',
        question: 'How satisfied do you feel with this friendship right now?',
        type: 'slider',
        metric: 'friendship_satisfaction',
        required: true
      },
      {
        id: 'social_energy',
        question: 'After spending time together, how do you usually feel?',
        type: 'slider',
        metric: 'social_energy',
        required: true
      },
      {
        id: 'friend_gratitude',
        question: 'What do you appreciate most about this friendship?',
        type: 'text',
        metric: 'friend_gratitude',
        required: false
      },
      {
        id: 'friend_activities',
        question: 'Any fun activities or adventures you\'d like to share?',
        type: 'text',
        metric: 'friend_activities',
        required: false
      }
    ],
    healthScoreWeights: {
      friendship_satisfaction: 0.30,
      mutual_support: 0.25,
      social_energy: 0.20,
      shared_interests: 0.15,
      trust_level: 0.10
    },
    improvementAreas: [
      'Quality time together',
      'Shared activities',
      'Mutual support',
      'Communication frequency',
      'Trust building',
      'Fun and laughter'
    ]
  },

  other: {
    relationshipType: 'other',
    displayName: 'Other Relationship',
    primaryMetrics: [
      {
        name: 'relationship_satisfaction',
        displayName: 'Relationship Satisfaction',
        description: 'Overall satisfaction with how the relationship is going',
        min: 1,
        max: 10,
        color: '#9C27B0'
      },
      {
        name: 'mutual_respect',
        displayName: 'Mutual Respect',
        description: 'Level of mutual respect and understanding',
        min: 1,
        max: 10,
        color: '#8E24AA'
      },
      {
        name: 'communication_quality',
        displayName: 'Communication Quality',
        description: 'How well you communicate and understand each other',
        min: 1,
        max: 10,
        color: '#7B1FA2'
      }
    ],
    secondaryMetrics: [
      {
        name: 'boundary_clarity',
        displayName: 'Boundary Clarity',
        description: 'How clear and respected boundaries are',
        min: 1,
        max: 10,
        color: '#6A1B9A'
      },
      {
        name: 'growth_potential',
        displayName: 'Growth Potential',
        description: 'Potential for the relationship to develop positively',
        min: 1,
        max: 10,
        color: '#4A148C'
      }
    ],
    checkInQuestions: [
      {
        id: 'relationship_satisfaction',
        question: 'How satisfied are you with this relationship currently?',
        type: 'slider',
        metric: 'relationship_satisfaction',
        required: true
      },
      {
        id: 'communication_quality',
        question: 'How would you rate the quality of communication?',
        type: 'slider',
        metric: 'communication_quality',
        required: true
      },
      {
        id: 'general_gratitude',
        question: 'What are you grateful for in this relationship?',
        type: 'text',
        metric: 'general_gratitude',
        required: false
      },
      {
        id: 'general_notes',
        question: 'Any thoughts or reflections on this relationship?',
        type: 'text',
        metric: 'general_notes',
        required: false
      }
    ],
    healthScoreWeights: {
      relationship_satisfaction: 0.35,
      mutual_respect: 0.25,
      communication_quality: 0.20,
      boundary_clarity: 0.20
    },
    improvementAreas: [
      'Communication clarity',
      'Boundary setting', 
      'Mutual understanding',
      'Respect building',
      'Connection deepening'
    ]
  }
}

// Utility functions
export function getRelationshipMetrics(relationshipType: RelationshipType): RelationshipMetricConfig {
  return RELATIONSHIP_METRICS[relationshipType] || RELATIONSHIP_METRICS.other
}

export function calculateRelationshipHealthScore(
  relationshipType: RelationshipType,
  metricValues: Record<string, number>
): number {
  const config = getRelationshipMetrics(relationshipType)
  let totalScore = 0
  let totalWeight = 0

  Object.entries(config.healthScoreWeights).forEach(([metric, weight]) => {
    if (metricValues[metric] !== undefined) {
      totalScore += metricValues[metric] * weight
      totalWeight += weight
    }
  })

  if (totalWeight === 0) return 0
  
  // Convert to 100-point scale
  return Math.round((totalScore / totalWeight) * 10)
}

export function getRelationshipCheckInQuestions(relationshipType: RelationshipType): CheckInQuestion[] {
  return getRelationshipMetrics(relationshipType).checkInQuestions
}

export function getAllMetricsForRelationship(relationshipType: RelationshipType): BaseMetric[] {
  const config = getRelationshipMetrics(relationshipType)
  return [...config.primaryMetrics, ...config.secondaryMetrics]
}

// Migration helpers for converting from old universal metrics
export function migrateUniversalToRelationshipMetrics(
  oldConnectionScore: number,
  oldMoodScore: number,
  relationshipType: RelationshipType
): Record<string, number> {
  const metrics: Record<string, number> = {}
  
  switch (relationshipType) {
    case 'romantic':
      metrics.connection_score = oldConnectionScore
      metrics.intimacy_score = Math.max(1, oldConnectionScore - 1) // Slight adjustment
      metrics.communication_quality = oldMoodScore
      break
      
    case 'work':
      metrics.professional_rapport = oldConnectionScore
      metrics.collaboration_effectiveness = oldMoodScore
      metrics.boundary_health = Math.min(10, oldConnectionScore + 1)
      break
      
    case 'family':
      metrics.family_harmony = oldConnectionScore
      metrics.boundary_respect = oldMoodScore
      metrics.communication_openness = Math.max(1, (oldConnectionScore + oldMoodScore) / 2)
      break
      
    case 'friend':
      metrics.friendship_satisfaction = oldConnectionScore
      metrics.social_energy = oldMoodScore
      metrics.mutual_support = Math.min(10, oldConnectionScore + 1)
      break
      
    case 'other':
      metrics.relationship_satisfaction = oldConnectionScore
      metrics.communication_quality = oldMoodScore
      metrics.mutual_respect = Math.max(1, (oldConnectionScore + oldMoodScore) / 2)
      break
  }
  
  return metrics
}

export default {
  RELATIONSHIP_METRICS,
  getRelationshipMetrics,
  calculateRelationshipHealthScore,
  getRelationshipCheckInQuestions,
  getAllMetricsForRelationship,
  migrateUniversalToRelationshipMetrics
}