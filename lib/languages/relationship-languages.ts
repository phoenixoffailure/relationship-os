// lib/languages/relationship-languages.ts
// Phase 7.2: Relationship-specific "language" systems
// Adapting love languages concept to different relationship types

import { RelationshipType } from '@/lib/ai/relationship-type-intelligence'

export interface RelationshipLanguage {
  id: string
  name: string
  displayName: string
  description: string
  examples: string[]
  color: string
}

export interface RelationshipLanguageSystem {
  relationshipType: RelationshipType
  systemName: string
  description: string
  languages: RelationshipLanguage[]
}

// Relationship-specific language systems
export const RELATIONSHIP_LANGUAGES: Record<RelationshipType, RelationshipLanguageSystem> = {
  romantic: {
    relationshipType: 'romantic',
    systemName: 'Love Languages',
    description: 'The five ways people express and receive love in romantic relationships',
    languages: [
      {
        id: 'words_of_affirmation',
        name: 'words_of_affirmation',
        displayName: 'Words of Affirmation',
        description: 'Verbal expressions of love, appreciation, and encouragement',
        examples: [
          'I love you and appreciate everything you do',
          'You look beautiful/handsome today',
          'I believe in you and your dreams',
          'Thank you for being such an amazing partner'
        ],
        color: '#E91E63'
      },
      {
        id: 'physical_touch',
        name: 'physical_touch', 
        displayName: 'Physical Touch',
        description: 'Non-verbal expressions through physical connection and intimacy',
        examples: [
          'Hugs, kisses, and intimate moments',
          'Holding hands while walking',
          'Cuddling while watching movies',
          'Gentle touches throughout the day'
        ],
        color: '#FF5722'
      },
      {
        id: 'receiving_gifts',
        name: 'receiving_gifts',
        displayName: 'Receiving Gifts',
        description: 'Thoughtful gifts and surprises as symbols of love',
        examples: [
          'Surprise flowers or favorite treats',
          'Meaningful jewelry or keepsakes',
          'Thoughtful gifts for special occasions',
          'Small tokens that show you were thinking of them'
        ],
        color: '#9C27B0'
      },
      {
        id: 'quality_time',
        name: 'quality_time',
        displayName: 'Quality Time',
        description: 'Focused, uninterrupted time together building connection',
        examples: [
          'Date nights with phones put away',
          'Deep conversations about dreams and goals',
          'Shared hobbies and activities',
          'Traveling and creating memories together'
        ],
        color: '#2196F3'
      },
      {
        id: 'acts_of_service',
        name: 'acts_of_service',
        displayName: 'Acts of Service', 
        description: 'Helpful actions that make life easier and show care',
        examples: [
          'Cooking favorite meals or handling chores',
          'Running errands or completing tasks',
          'Planning special events or surprises',
          'Taking care of responsibilities to reduce their stress'
        ],
        color: '#4CAF50'
      }
    ]
  },

  work: {
    relationshipType: 'work',
    systemName: 'Professional Appreciation Languages',
    description: 'How colleagues and team members prefer to give and receive professional recognition',
    languages: [
      {
        id: 'public_recognition',
        name: 'public_recognition',
        displayName: 'Public Recognition',
        description: 'Acknowledgment of achievements in front of others',
        examples: [
          'Praise in team meetings or company-wide emails',
          'Highlighting achievements in newsletters or reports',
          'Nominating for awards or recognition programs',
          'Mentioning contributions in presentations'
        ],
        color: '#1565C0'
      },
      {
        id: 'professional_development',
        name: 'professional_development',
        displayName: 'Professional Development',
        description: 'Investment in growth, learning, and career advancement',
        examples: [
          'Offering training opportunities or conference attendance',
          'Providing mentorship and career guidance',
          'Supporting skill development and certifications',
          'Creating stretch assignments and growth opportunities'
        ],
        color: '#0277BD'
      },
      {
        id: 'collaborative_support',
        name: 'collaborative_support',
        displayName: 'Collaborative Support',
        description: 'Working together effectively and providing professional backup',
        examples: [
          'Offering help with challenging projects',
          'Sharing resources and expertise generously',
          'Being reliable and meeting commitments',
          'Providing backup during busy periods'
        ],
        color: '#0288D1'
      },
      {
        id: 'constructive_feedback',
        name: 'constructive_feedback',
        displayName: 'Constructive Feedback',
        description: 'Honest, helpful input for professional improvement',
        examples: [
          'Regular one-on-one feedback sessions',
          'Specific suggestions for improvement',
          'Honest assessment of strengths and areas for growth',
          'Coaching through professional challenges'
        ],
        color: '#039BE5'
      },
      {
        id: 'autonomy_respect',
        name: 'autonomy_respect',
        displayName: 'Autonomy & Respect',
        description: 'Trust, independence, and respect for professional judgment',
        examples: [
          'Delegating meaningful responsibilities',
          'Respecting professional opinions and decisions',
          'Providing flexibility in work approach',
          'Trusting competence without micromanagement'
        ],
        color: '#03A9F4'
      }
    ]
  },

  family: {
    relationshipType: 'family',
    systemName: 'Family Support Languages',
    description: 'How family members prefer to express and receive care and support',
    languages: [
      {
        id: 'quality_time',
        name: 'quality_time',
        displayName: 'Quality Family Time',
        description: 'Meaningful time spent together as family',
        examples: [
          'Family dinners with good conversation',
          'Attending important events and milestones',
          'Planning family traditions and gatherings',
          'One-on-one time for deeper connection'
        ],
        color: '#388E3C'
      },
      {
        id: 'acts_of_service',
        name: 'acts_of_service', 
        displayName: 'Helpful Actions',
        description: 'Practical help and support with family responsibilities',
        examples: [
          'Helping with household tasks and responsibilities',
          'Providing childcare or eldercare support',
          'Offering assistance during difficult times',
          'Taking care of family logistics and planning'
        ],
        color: '#689F38'
      },
      {
        id: 'words_of_affirmation',
        name: 'words_of_affirmation',
        displayName: 'Encouraging Words',
        description: 'Verbal expressions of support, pride, and encouragement',
        examples: [
          'Expressing pride in achievements and growth',
          'Offering encouragement during challenges',
          'Affirming family bonds and relationships',
          'Sharing positive memories and gratitude'
        ],
        color: '#7CB342'
      },
      {
        id: 'tradition_keeping',
        name: 'tradition_keeping',
        displayName: 'Tradition & Memory Keeping',
        description: 'Creating and maintaining family traditions and memories',
        examples: [
          'Maintaining family traditions and celebrations',
          'Creating photo albums and memory books',
          'Sharing family history and stories',
          'Planning special family events and reunions'
        ],
        color: '#8BC34A'
      },
      {
        id: 'respectful_space',
        name: 'respectful_space',
        displayName: 'Respectful Space',
        description: 'Honoring boundaries and individual family member needs',
        examples: [
          'Respecting privacy and personal boundaries',
          'Supporting individual interests and choices',
          'Giving space during difficult times',
          'Honoring different life stages and needs'
        ],
        color: '#9CCC65'
      }
    ]
  },

  friend: {
    relationshipType: 'friend', 
    systemName: 'Friendship Languages',
    description: 'How friends prefer to connect, support, and enjoy each other\'s company',
    languages: [
      {
        id: 'shared_activities',
        name: 'shared_activities',
        displayName: 'Shared Activities',
        description: 'Enjoying common interests and adventures together',
        examples: [
          'Going to concerts, movies, or events together',
          'Playing sports or working out together',
          'Trying new restaurants or traveling',
          'Engaging in shared hobbies and interests'
        ],
        color: '#FF9800'
      },
      {
        id: 'emotional_availability',
        name: 'emotional_availability',
        displayName: 'Emotional Availability',
        description: 'Being there for support during both good times and challenges',
        examples: [
          'Listening without judgment during difficult times',
          'Celebrating successes and achievements',
          'Checking in regularly and staying connected',
          'Being a reliable source of support and encouragement'
        ],
        color: '#FB8C00'
      },
      {
        id: 'thoughtful_gestures',
        name: 'thoughtful_gestures',
        displayName: 'Thoughtful Gestures',
        description: 'Small acts that show you care and are thinking of them',
        examples: [
          'Remembering important dates and events',
          'Sending funny memes or encouraging texts',
          'Bringing their favorite coffee or treats',
          'Surprising them with small thoughtful gifts'
        ],
        color: '#F57C00'
      },
      {
        id: 'loyal_companionship',
        name: 'loyal_companionship',
        displayName: 'Loyal Companionship',
        description: 'Being a consistent, trustworthy friend through all seasons',
        examples: [
          'Keeping confidences and being trustworthy',
          'Standing by them through challenges',
          'Being consistent and reliable in the friendship',
          'Defending and supporting them when needed'
        ],
        color: '#EF6C00'
      },
      {
        id: 'fun_and_laughter',
        name: 'fun_and_laughter',
        displayName: 'Fun & Laughter',
        description: 'Bringing joy, humor, and lightness to the friendship',
        examples: [
          'Making each other laugh and smile',
          'Creating fun memories and inside jokes',
          'Being spontaneous and adventurous',
          'Bringing positive energy and optimism'
        ],
        color: '#E65100'
      }
    ]
  },

  other: {
    relationshipType: 'other',
    systemName: 'Connection Languages',
    description: 'General ways people prefer to connect and build relationships',
    languages: [
      {
        id: 'respectful_communication',
        name: 'respectful_communication',
        displayName: 'Respectful Communication',
        description: 'Clear, honest, and respectful dialogue',
        examples: [
          'Open and honest conversation',
          'Active listening and understanding',
          'Respectful disagreement and conflict resolution',
          'Clear communication of needs and boundaries'
        ],
        color: '#9C27B0'
      },
      {
        id: 'mutual_support',
        name: 'mutual_support', 
        displayName: 'Mutual Support',
        description: 'Being there for each other in practical and emotional ways',
        examples: [
          'Offering help when needed',
          'Being emotionally supportive during challenges',
          'Celebrating each other\'s successes',
          'Providing practical assistance and resources'
        ],
        color: '#8E24AA'
      },
      {
        id: 'shared_interests',
        name: 'shared_interests',
        displayName: 'Shared Interests',
        description: 'Connecting through common activities and interests',
        examples: [
          'Engaging in mutual hobbies or interests',
          'Learning new things together',
          'Sharing resources and recommendations',
          'Exploring common passions and curiosities'
        ],
        color: '#7B1FA2'
      },
      {
        id: 'boundary_respect',
        name: 'boundary_respect',
        displayName: 'Boundary Respect',
        description: 'Honoring personal limits and respecting individual needs',
        examples: [
          'Respecting personal and professional boundaries',
          'Understanding and adapting to different comfort levels',
          'Not pressuring for more than the relationship can handle',
          'Being mindful of time and energy limitations'
        ],
        color: '#6A1B9A'
      },
      {
        id: 'authentic_connection',
        name: 'authentic_connection',
        displayName: 'Authentic Connection',
        description: 'Being genuine and creating space for authentic relationship',
        examples: [
          'Being genuine and authentic in interactions',
          'Creating safe space for vulnerability when appropriate',
          'Sharing thoughts and feelings honestly',
          'Building trust through consistent authenticity'
        ],
        color: '#4A148C'
      }
    ]
  }
}

// Utility functions
export function getRelationshipLanguageSystem(relationshipType: RelationshipType): RelationshipLanguageSystem {
  return RELATIONSHIP_LANGUAGES[relationshipType] || RELATIONSHIP_LANGUAGES.other
}

export function getRelationshipLanguage(relationshipType: RelationshipType, languageId: string): RelationshipLanguage | undefined {
  const system = getRelationshipLanguageSystem(relationshipType)
  return system.languages.find(lang => lang.id === languageId)
}

export function getAllLanguagesForRelationship(relationshipType: RelationshipType): RelationshipLanguage[] {
  return getRelationshipLanguageSystem(relationshipType).languages
}

// Migration helper from traditional love languages to relationship-specific languages
export function migrateLoveLanguageToRelationshipLanguage(
  oldLoveLanguage: string,
  relationshipType: RelationshipType
): string {
  // Map traditional love languages to relationship-appropriate equivalents
  const migrationMap: Record<RelationshipType, Record<string, string>> = {
    romantic: {
      'words_of_affirmation': 'words_of_affirmation',
      'physical_touch': 'physical_touch',
      'receiving_gifts': 'receiving_gifts',
      'quality_time': 'quality_time',
      'acts_of_service': 'acts_of_service'
    },
    work: {
      'words_of_affirmation': 'public_recognition',
      'physical_touch': 'collaborative_support', // No physical touch in work
      'receiving_gifts': 'professional_development',
      'quality_time': 'constructive_feedback',
      'acts_of_service': 'collaborative_support'
    },
    family: {
      'words_of_affirmation': 'words_of_affirmation',
      'physical_touch': 'quality_time', // Appropriate family physical affection
      'receiving_gifts': 'tradition_keeping',
      'quality_time': 'quality_time',
      'acts_of_service': 'acts_of_service'
    },
    friend: {
      'words_of_affirmation': 'emotional_availability',
      'physical_touch': 'thoughtful_gestures', // Appropriate friend physical gestures
      'receiving_gifts': 'thoughtful_gestures',
      'quality_time': 'shared_activities',
      'acts_of_service': 'loyal_companionship'
    },
    other: {
      'words_of_affirmation': 'respectful_communication',
      'physical_touch': 'boundary_respect', // Respect physical boundaries
      'receiving_gifts': 'mutual_support',
      'quality_time': 'shared_interests',
      'acts_of_service': 'mutual_support'
    }
  }

  const typeMap = migrationMap[relationshipType] || migrationMap.other
  return typeMap[oldLoveLanguage] || typeMap['quality_time'] || 'respectful_communication'
}

// Get top languages for a user in a specific relationship type
export function getTopLanguagesForUser(
  userLanguageRankings: string[],
  relationshipType: RelationshipType
): RelationshipLanguage[] {
  const system = getRelationshipLanguageSystem(relationshipType)
  
  return userLanguageRankings
    .map(langId => system.languages.find(lang => lang.id === langId))
    .filter((lang): lang is RelationshipLanguage => lang !== undefined)
    .slice(0, 3) // Top 3 languages
}

export default {
  RELATIONSHIP_LANGUAGES,
  getRelationshipLanguageSystem,
  getRelationshipLanguage,
  getAllLanguagesForRelationship,
  migrateLoveLanguageToRelationshipLanguage,
  getTopLanguagesForUser
}