// lib/workflows/relationship-specific-workflows.ts
// Phase 7.4: Specialized Tools & Workflows
// Define relationship-specific workflows and tools that adapt to different relationship contexts

import { RelationshipType } from '@/lib/ai/relationship-type-intelligence'

export interface WorkflowAction {
  id: string
  name: string
  description: string
  icon: string
  category: 'communication' | 'analysis' | 'planning' | 'support' | 'development'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: string
  prerequisites?: string[]
  outcomes: string[]
}

export interface RelationshipWorkflow {
  id: string
  name: string
  description: string
  relationshipType: RelationshipType
  category: 'daily' | 'weekly' | 'monthly' | 'situational' | 'crisis'
  priority: 'high' | 'medium' | 'low'
  actions: WorkflowAction[]
  triggers: string[]
  expectedOutcomes: string[]
}

// Romantic Relationship Workflows
const ROMANTIC_WORKFLOWS: RelationshipWorkflow[] = [
  {
    id: 'romantic-daily-connection',
    name: 'Daily Intimacy Building',
    description: 'Daily practices to maintain and deepen romantic connection',
    relationshipType: 'romantic',
    category: 'daily',
    priority: 'high',
    triggers: ['daily_checkin', 'low_connection_score', 'lack_of_intimacy'],
    expectedOutcomes: ['Increased intimacy', 'Better communication', 'Stronger bond'],
    actions: [
      {
        id: 'romantic-morning-affirmation',
        name: 'Morning Love Affirmation',
        description: 'Start the day by expressing love and appreciation',
        icon: '💕',
        category: 'communication',
        difficulty: 'beginner',
        estimatedTime: '2 minutes',
        outcomes: ['Positive start to day', 'Increased affection']
      },
      {
        id: 'romantic-quality-time',
        name: 'Distraction-Free Time',
        description: 'Spend 15 minutes together without phones or distractions',
        icon: '🤝',
        category: 'communication',
        difficulty: 'intermediate',
        estimatedTime: '15 minutes',
        outcomes: ['Deeper connection', 'Better presence']
      },
      {
        id: 'romantic-physical-affection',
        name: 'Physical Touch Check-in',
        description: 'Non-sexual physical affection throughout the day',
        icon: '🤗',
        category: 'support',
        difficulty: 'beginner',
        estimatedTime: 'Ongoing',
        outcomes: ['Increased intimacy', 'Physical connection']
      }
    ]
  },
  {
    id: 'romantic-conflict-resolution',
    name: 'Healthy Conflict Resolution',
    description: 'Navigate disagreements constructively in romantic relationships',
    relationshipType: 'romantic',
    category: 'situational',
    priority: 'high',
    triggers: ['argument_detected', 'tension_high', 'communication_breakdown'],
    expectedOutcomes: ['Resolved conflict', 'Stronger understanding', 'Improved communication'],
    actions: [
      {
        id: 'romantic-pause-breathe',
        name: 'Pause and Breathe',
        description: 'Take a 10-minute cooling off period before continuing discussion',
        icon: '🧘',
        category: 'communication',
        difficulty: 'intermediate',
        estimatedTime: '10 minutes',
        outcomes: ['Reduced tension', 'Clearer thinking']
      },
      {
        id: 'romantic-active-listening',
        name: 'Active Listening Exercise',
        description: 'Each person speaks for 3 minutes while the other listens without interrupting',
        icon: '👂',
        category: 'communication',
        difficulty: 'advanced',
        estimatedTime: '15 minutes',
        outcomes: ['Better understanding', 'Validation felt']
      }
    ]
  }
]

// Work Relationship Workflows  
const WORK_WORKFLOWS: RelationshipWorkflow[] = [
  {
    id: 'work-collaboration-improvement',
    name: 'Team Collaboration Enhancement',
    description: 'Structured approach to improve professional working relationships',
    relationshipType: 'work',
    category: 'weekly',
    priority: 'medium',
    triggers: ['collaboration_issues', 'project_delays', 'communication_gaps'],
    expectedOutcomes: ['Better teamwork', 'Clearer communication', 'Improved productivity'],
    actions: [
      {
        id: 'work-expectation-alignment',
        name: 'Expectation Alignment Meeting',
        description: 'Schedule a brief meeting to align on project expectations and communication preferences',
        icon: '🎯',
        category: 'planning',
        difficulty: 'intermediate',
        estimatedTime: '20 minutes',
        outcomes: ['Clear expectations', 'Better planning']
      },
      {
        id: 'work-feedback-session',
        name: 'Constructive Feedback Exchange',
        description: 'Professional feedback session focusing on work processes and outcomes',
        icon: '💼',
        category: 'development',
        difficulty: 'advanced',
        estimatedTime: '30 minutes',
        prerequisites: ['trust_established', 'safe_environment'],
        outcomes: ['Professional growth', 'Improved processes']
      },
      {
        id: 'work-appreciation-expression',
        name: 'Professional Appreciation',
        description: 'Acknowledge colleague\'s contributions and professional strengths',
        icon: '👏',
        category: 'support',
        difficulty: 'beginner',
        estimatedTime: '5 minutes',
        outcomes: ['Increased motivation', 'Better rapport']
      }
    ]
  },
  {
    id: 'work-boundary-management',
    name: 'Professional Boundary Setting',
    description: 'Establish and maintain healthy professional boundaries',
    relationshipType: 'work',
    category: 'situational',
    priority: 'high',
    triggers: ['boundary_violation', 'work_life_imbalance', 'inappropriate_requests'],
    expectedOutcomes: ['Clear boundaries', 'Professional respect', 'Better work-life balance'],
    actions: [
      {
        id: 'work-boundary-conversation',
        name: 'Professional Boundary Discussion',
        description: 'Have a respectful conversation about work boundaries and expectations',
        icon: '🚧',
        category: 'communication',
        difficulty: 'advanced',
        estimatedTime: '15 minutes',
        outcomes: ['Clear boundaries', 'Mutual respect']
      },
      {
        id: 'work-documentation',
        name: 'Document Agreements',
        description: 'Write down agreed-upon professional boundaries and expectations',
        icon: '📝',
        category: 'planning',
        difficulty: 'intermediate',
        estimatedTime: '10 minutes',
        outcomes: ['Written clarity', 'Reference for future']
      }
    ]
  }
]

// Family Relationship Workflows
const FAMILY_WORKFLOWS: RelationshipWorkflow[] = [
  {
    id: 'family-harmony-building',
    name: 'Family Harmony Restoration',
    description: 'Structured approach to improve family dynamics and relationships',
    relationshipType: 'family',
    category: 'weekly',
    priority: 'high',
    triggers: ['family_tension', 'communication_breakdown', 'generational_conflict'],
    expectedOutcomes: ['Improved family dynamics', 'Better understanding', 'Reduced tension'],
    actions: [
      {
        id: 'family-listening-circle',
        name: 'Family Listening Circle',
        description: 'Structured conversation where each family member shares without judgment',
        icon: '🏠',
        category: 'communication',
        difficulty: 'intermediate',
        estimatedTime: '30 minutes',
        outcomes: ['Better understanding', 'Validation', 'Family connection']
      },
      {
        id: 'family-gratitude-sharing',
        name: 'Family Gratitude Practice',
        description: 'Each family member shares something they appreciate about the others',
        icon: '💚',
        category: 'support',
        difficulty: 'beginner',
        estimatedTime: '15 minutes',
        outcomes: ['Increased appreciation', 'Positive focus']
      },
      {
        id: 'family-boundary-respect',
        name: 'Family Boundary Discussion',
        description: 'Respectful conversation about individual needs and family boundaries',
        icon: '🤝',
        category: 'communication',
        difficulty: 'advanced',
        estimatedTime: '25 minutes',
        outcomes: ['Clear boundaries', 'Mutual respect', 'Individual autonomy']
      }
    ]
  },
  {
    id: 'family-tradition-building',
    name: 'Family Tradition Creation',
    description: 'Establish new family traditions or strengthen existing ones',
    relationshipType: 'family',
    category: 'monthly',
    priority: 'medium',
    triggers: ['lack_of_connection', 'desire_for_traditions', 'family_bonding_needed'],
    expectedOutcomes: ['Stronger family bonds', 'Shared memories', 'Family identity'],
    actions: [
      {
        id: 'family-tradition-brainstorm',
        name: 'Tradition Brainstorming Session',
        description: 'Family meeting to discuss and plan new traditions everyone enjoys',
        icon: '💡',
        category: 'planning',
        difficulty: 'beginner',
        estimatedTime: '20 minutes',
        outcomes: ['Creative ideas', 'Family buy-in', 'Shared planning']
      },
      {
        id: 'family-memory-creation',
        name: 'Intentional Memory Making',
        description: 'Plan and execute a special family activity focused on creating positive memories',
        icon: '📸',
        category: 'support',
        difficulty: 'intermediate',
        estimatedTime: '2 hours',
        outcomes: ['Positive memories', 'Family bonding', 'Tradition establishment']
      }
    ]
  }
]

// Friend Relationship Workflows
const FRIEND_WORKFLOWS: RelationshipWorkflow[] = [
  {
    id: 'friend-connection-maintenance',
    name: 'Friendship Connection Maintenance',
    description: 'Keep friendships strong through intentional connection and support',
    relationshipType: 'friend',
    category: 'monthly',
    priority: 'medium',
    triggers: ['friendship_drift', 'lack_of_contact', 'life_changes'],
    expectedOutcomes: ['Maintained friendship', 'Mutual support', 'Shared experiences'],
    actions: [
      {
        id: 'friend-quality-time',
        name: 'Intentional Friend Time',
        description: 'Plan a meaningful activity together that you both enjoy',
        icon: '👫',
        category: 'support',
        difficulty: 'beginner',
        estimatedTime: '2-3 hours',
        outcomes: ['Shared experience', 'Deeper connection', 'Fun memories']
      },
      {
        id: 'friend-check-in',
        name: 'Genuine Check-In',
        description: 'Reach out to see how your friend is really doing in life',
        icon: '💬',
        category: 'communication',
        difficulty: 'beginner',
        estimatedTime: '15 minutes',
        outcomes: ['Emotional connection', 'Mutual support', 'Updated understanding']
      },
      {
        id: 'friend-celebration',
        name: 'Friend Achievement Celebration',
        description: 'Acknowledge and celebrate your friend\'s successes and milestones',
        icon: '🎉',
        category: 'support',
        difficulty: 'beginner',
        estimatedTime: '30 minutes',
        outcomes: ['Shared joy', 'Supportive friendship', 'Positive reinforcement']
      }
    ]
  },
  {
    id: 'friend-conflict-navigation',
    name: 'Friendship Conflict Resolution',
    description: 'Navigate disagreements or tensions in friendships with care',
    relationshipType: 'friend',
    category: 'situational',
    priority: 'high',
    triggers: ['friend_conflict', 'misunderstanding', 'hurt_feelings'],
    expectedOutcomes: ['Resolved conflict', 'Stronger friendship', 'Better communication'],
    actions: [
      {
        id: 'friend-honest-conversation',
        name: 'Honest Friendship Talk',
        description: 'Have an open, honest conversation about what happened and how you both feel',
        icon: '💭',
        category: 'communication',
        difficulty: 'intermediate',
        estimatedTime: '30 minutes',
        outcomes: ['Cleared misunderstandings', 'Emotional healing', 'Strengthened trust']
      },
      {
        id: 'friend-space-respect',
        name: 'Respectful Space Giving',
        description: 'Give your friend space if needed while keeping the door open for reconciliation',
        icon: '🌟',
        category: 'support',
        difficulty: 'advanced',
        estimatedTime: 'Variable',
        outcomes: ['Respected autonomy', 'Time for reflection', 'Preserved friendship potential']
      }
    ]
  }
]

// Consolidated workflow registry
export const RELATIONSHIP_WORKFLOWS: Record<RelationshipType, RelationshipWorkflow[]> = {
  romantic: ROMANTIC_WORKFLOWS,
  work: WORK_WORKFLOWS,
  family: FAMILY_WORKFLOWS,
  friend: FRIEND_WORKFLOWS,
  other: [] // Generic workflows can be added here
}

// Utility functions for workflow management

export function getWorkflowsForRelationshipType(relationshipType: RelationshipType): RelationshipWorkflow[] {
  return RELATIONSHIP_WORKFLOWS[relationshipType] || []
}

export function getWorkflowById(workflowId: string): RelationshipWorkflow | null {
  for (const workflows of Object.values(RELATIONSHIP_WORKFLOWS)) {
    const workflow = workflows.find(w => w.id === workflowId)
    if (workflow) return workflow
  }
  return null
}

export function getWorkflowsByCategory(
  relationshipType: RelationshipType, 
  category: RelationshipWorkflow['category']
): RelationshipWorkflow[] {
  return getWorkflowsForRelationshipType(relationshipType).filter(w => w.category === category)
}

export function getWorkflowsByTrigger(
  relationshipType: RelationshipType,
  trigger: string
): RelationshipWorkflow[] {
  return getWorkflowsForRelationshipType(relationshipType).filter(w => 
    w.triggers.includes(trigger)
  )
}

export function getHighPriorityWorkflows(relationshipType: RelationshipType): RelationshipWorkflow[] {
  return getWorkflowsForRelationshipType(relationshipType).filter(w => w.priority === 'high')
}

// Workflow recommendation engine
export function recommendWorkflows(
  relationshipType: RelationshipType,
  triggers: string[],
  userLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner'
): RelationshipWorkflow[] {
  const allWorkflows = getWorkflowsForRelationshipType(relationshipType)
  
  // Score workflows based on trigger matches and user level
  const scoredWorkflows = allWorkflows.map(workflow => {
    let score = 0
    
    // Add points for trigger matches
    const triggerMatches = workflow.triggers.filter(t => triggers.includes(t)).length
    score += triggerMatches * 10
    
    // Add points for priority
    if (workflow.priority === 'high') score += 5
    if (workflow.priority === 'medium') score += 3
    
    // Adjust for user level (prefer appropriate difficulty)
    const hasAppropriateActions = workflow.actions.some(action => 
      action.difficulty === userLevel || 
      (userLevel === 'intermediate' && action.difficulty === 'beginner')
    )
    if (hasAppropriateActions) score += 3
    
    return { workflow, score }
  })
  
  // Sort by score and return top recommendations
  return scoredWorkflows
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(item => item.workflow)
}

export default {
  RELATIONSHIP_WORKFLOWS,
  getWorkflowsForRelationshipType,
  getWorkflowById,
  getWorkflowsByCategory,
  getWorkflowsByTrigger,
  getHighPriorityWorkflows,
  recommendWorkflows
}