// lib/ai/multi-relationship-context-switcher.ts
// Context switching system for users with multiple relationships
// Phase 3 Implementation - RelationshipOS v2.0

import { RelationshipType, getRelationshipConfig } from './relationship-type-intelligence'

// Type definitions
export interface RelationshipContext {
  relationshipId: string
  relationshipType: RelationshipType
  relationshipName: string
  lastActive?: Date
  isCurrentContext: boolean
}

export interface UserRelationshipSession {
  userId: string
  activeRelationships: RelationshipContext[]
  currentContext?: RelationshipContext
  sessionStarted: Date
  lastUpdated: Date
}

export interface AggregatedInsightContext {
  userId: string
  relationships: {
    relationshipId: string
    type: RelationshipType
    name: string
    recentActivity: boolean
    insightCount: number
  }[]
  needsBoundaryEnforcement: boolean
  primaryFocus?: RelationshipType
}

// Session management for relationship contexts
class RelationshipContextManager {
  private sessions: Map<string, UserRelationshipSession> = new Map()

  // Initialize or get existing session for user
  getOrCreateSession(userId: string): UserRelationshipSession {
    if (!this.sessions.has(userId)) {
      this.sessions.set(userId, {
        userId,
        activeRelationships: [],
        sessionStarted: new Date(),
        lastUpdated: new Date()
      })
    }
    return this.sessions.get(userId)!
  }

  // Update current context based on journal entry or user action
  updateCurrentContext(
    userId: string,
    relationshipId: string,
    relationshipType: RelationshipType,
    relationshipName: string
  ): RelationshipContext {
    const session = this.getOrCreateSession(userId)
    
    // Mark all contexts as not current
    session.activeRelationships.forEach(ctx => {
      ctx.isCurrentContext = false
    })
    
    // Find or create the relationship context
    let context = session.activeRelationships.find(
      ctx => ctx.relationshipId === relationshipId
    )
    
    if (!context) {
      context = {
        relationshipId,
        relationshipType,
        relationshipName,
        lastActive: new Date(),
        isCurrentContext: true
      }
      session.activeRelationships.push(context)
    } else {
      context.isCurrentContext = true
      context.lastActive = new Date()
    }
    
    session.currentContext = context
    session.lastUpdated = new Date()
    
    return context
  }

  // Get current context for user
  getCurrentContext(userId: string): RelationshipContext | undefined {
    const session = this.sessions.get(userId)
    return session?.currentContext
  }

  // Get all active relationships for user
  getActiveRelationships(userId: string): RelationshipContext[] {
    const session = this.sessions.get(userId)
    return session?.activeRelationships || []
  }

  // Clear session for user
  clearSession(userId: string): void {
    this.sessions.delete(userId)
  }
}

// Singleton instance
export const contextManager = new RelationshipContextManager()

// Function to detect relationship context from journal entry
export async function detectContextFromJournalEntry(
  journalContent: string,
  userRelationships: Array<{
    id: string
    name: string
    relationship_type: RelationshipType
  }>
): Promise<string | null> {
  const lowerContent = journalContent.toLowerCase()
  
  // Look for relationship name mentions
  for (const relationship of userRelationships) {
    const relationshipName = relationship.name.toLowerCase()
    if (lowerContent.includes(relationshipName)) {
      return relationship.id
    }
  }
  
  // Look for relationship type keywords
  const typeKeywords: Record<RelationshipType, string[]> = {
    romantic: ['partner', 'boyfriend', 'girlfriend', 'spouse', 'husband', 'wife', 'lover', 'significant other'],
    family: ['mom', 'dad', 'mother', 'father', 'sister', 'brother', 'parent', 'sibling', 'family'],
    friend: ['friend', 'buddy', 'pal', 'bestie', 'bff'],
    work: ['colleague', 'coworker', 'boss', 'manager', 'team', 'office', 'work'],
    other: []
  }
  
  for (const relationship of userRelationships) {
    const keywords = typeKeywords[relationship.relationship_type] || []
    for (const keyword of keywords) {
      if (lowerContent.includes(keyword)) {
        return relationship.id
      }
    }
  }
  
  // If only one relationship exists, default to it
  if (userRelationships.length === 1) {
    return userRelationships[0].id
  }
  
  return null
}

// Function to aggregate insights across multiple relationships with boundaries
export function aggregateInsightsWithBoundaries(
  insights: Array<{
    relationshipId: string
    relationshipType: RelationshipType
    insight: any
  }>
): {
  aggregated: any[]
  boundaryViolations: string[]
} {
  const aggregated: any[] = []
  const boundaryViolations: string[] = []
  
  // Group insights by relationship type
  const groupedByType = new Map<RelationshipType, typeof insights>()
  
  for (const item of insights) {
    if (!groupedByType.has(item.relationshipType)) {
      groupedByType.set(item.relationshipType, [])
    }
    groupedByType.get(item.relationshipType)!.push(item)
  }
  
  // Check for boundary violations when mixing relationship types
  const hasWork = groupedByType.has('work')
  const hasRomantic = groupedByType.has('romantic')
  const hasFamily = groupedByType.has('family')
  
  if (hasWork && hasRomantic) {
    boundaryViolations.push('Cannot mix work and romantic relationship insights in same view')
  }
  
  // Process each type with appropriate boundaries
  for (const [type, typeInsights] of groupedByType) {
    const config = getRelationshipConfig(type)
    
    for (const item of typeInsights) {
      // Filter out inappropriate content based on most restrictive relationship
      if (hasWork && config.boundaries.allowIntimacy) {
        // Skip intimate insights when work relationships are present
        if (item.insight.description?.toLowerCase().includes('intimate') ||
            item.insight.description?.toLowerCase().includes('sexual')) {
          continue
        }
      }
      
      aggregated.push({
        ...item.insight,
        relationshipContext: {
          id: item.relationshipId,
          type: item.relationshipType,
          boundaries: config.boundaries
        }
      })
    }
  }
  
  return { aggregated, boundaryViolations }
}

// Function to determine primary relationship focus
export function determinePrimaryFocus(
  relationships: Array<{
    relationshipId: string
    relationshipType: RelationshipType
    lastActivity?: Date
    activityCount: number
  }>
): RelationshipType | null {
  if (relationships.length === 0) return null
  
  // Sort by activity count and recency
  const sorted = relationships.sort((a, b) => {
    // First by activity count
    if (b.activityCount !== a.activityCount) {
      return b.activityCount - a.activityCount
    }
    
    // Then by recency if available
    if (a.lastActivity && b.lastActivity) {
      return b.lastActivity.getTime() - a.lastActivity.getTime()
    }
    
    return 0
  })
  
  return sorted[0].relationshipType
}

// Function to generate context-aware prompt modifier
export function generateContextAwarePromptModifier(
  activeContexts: RelationshipContext[]
): string {
  if (activeContexts.length === 0) {
    return ''
  }
  
  if (activeContexts.length === 1) {
    const context = activeContexts[0]
    return `\nCURRENT CONTEXT: Focusing on ${context.relationshipName} (${context.relationshipType} relationship)`
  }
  
  // Multiple contexts - need to be careful about boundaries
  const types = new Set(activeContexts.map(ctx => ctx.relationshipType))
  
  let modifier = '\nMULTIPLE RELATIONSHIP CONTEXTS ACTIVE:\n'
  
  // Identify most restrictive boundaries
  let mostRestrictive: RelationshipType = 'other'
  if (types.has('work')) mostRestrictive = 'work'
  else if (types.has('family')) mostRestrictive = 'family'
  else if (types.has('friend')) mostRestrictive = 'friend'
  else if (types.has('romantic')) mostRestrictive = 'romantic'
  
  modifier += `- Managing ${activeContexts.length} relationships\n`
  modifier += `- Relationship types: ${Array.from(types).join(', ')}\n`
  modifier += `- APPLYING MOST RESTRICTIVE BOUNDARIES: ${mostRestrictive}\n`
  modifier += `- Ensure all suggestions are appropriate for ALL active relationship types\n`
  
  return modifier
}

// Function to validate content across multiple relationship contexts
export function validateContentForMultipleContexts(
  content: string,
  activeContexts: RelationshipContext[]
): {
  isValid: boolean
  violations: string[]
  recommendedAdjustments: string[]
} {
  const violations: string[] = []
  const recommendedAdjustments: string[] = []
  
  // Get all active relationship types
  const types = activeContexts.map(ctx => ctx.relationshipType)
  
  // Check if content violates any boundaries
  for (const context of activeContexts) {
    const config = getRelationshipConfig(context.relationshipType)
    
    // Check for inappropriate topics
    for (const inappropriateTopic of config.inappropriateTopics) {
      if (content.toLowerCase().includes(inappropriateTopic.toLowerCase())) {
        violations.push(
          `Content contains inappropriate topic "${inappropriateTopic}" for ${context.relationshipType} relationship`
        )
      }
    }
    
    // Specific boundary checks
    if (!config.boundaries.allowIntimacy && 
        (content.includes('intimate') || content.includes('sexual'))) {
      violations.push(`Intimate content not appropriate for ${context.relationshipType} relationship`)
      recommendedAdjustments.push('Remove intimate or sexual references')
    }
    
    if (!config.boundaries.allowPhysicalTouch && 
        (content.includes('touch') || content.includes('hug') || content.includes('cuddle'))) {
      violations.push(`Physical touch references not appropriate for ${context.relationshipType} relationship`)
      recommendedAdjustments.push('Replace physical touch suggestions with appropriate alternatives')
    }
  }
  
  // Check for conflicting contexts
  if (types.includes('work') && types.includes('romantic')) {
    recommendedAdjustments.push('Separate work and romantic relationship insights')
  }
  
  return {
    isValid: violations.length === 0,
    violations,
    recommendedAdjustments
  }
}

// Function to switch context based on user action
export async function switchRelationshipContext(
  userId: string,
  targetRelationshipId: string,
  supabase: any
): Promise<{
  success: boolean
  newContext?: RelationshipContext
  error?: string
}> {
  try {
    // Get relationship details from database
    const { data: relationship, error } = await supabase
      .from('relationships')
      .select('id, name, relationship_type')
      .eq('id', targetRelationshipId)
      .single()
    
    if (error || !relationship) {
      return { success: false, error: 'Relationship not found' }
    }
    
    // Update context manager
    const newContext = contextManager.updateCurrentContext(
      userId,
      relationship.id,
      relationship.relationship_type as RelationshipType,
      relationship.name
    )
    
    return { success: true, newContext }
  } catch (error) {
    console.error('Error switching relationship context:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

// Export all utilities
export default {
  contextManager,
  detectContextFromJournalEntry,
  aggregateInsightsWithBoundaries,
  determinePrimaryFocus,
  generateContextAwarePromptModifier,
  validateContentForMultipleContexts,
  switchRelationshipContext
}