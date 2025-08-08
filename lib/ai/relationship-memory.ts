// lib/ai/relationship-memory.ts
// Phase 7.5: Advanced Context Switching & Memory
// AI memory system that maintains relationship-specific context and memory across interactions

import { RelationshipType } from '@/lib/ai/relationship-type-intelligence'

export interface MemoryEntry {
  id: string
  userId: string
  relationshipId: string
  relationshipType: RelationshipType
  entryType: 'interaction' | 'insight' | 'pattern' | 'milestone' | 'preference' | 'boundary'
  content: string
  context: Record<string, any>
  importance: 'low' | 'medium' | 'high' | 'critical'
  emotional_tone: 'positive' | 'neutral' | 'negative' | 'mixed'
  tags: string[]
  createdAt: Date
  lastReferencedAt?: Date
  referenceCount: number
  expiresAt?: Date // For temporary memories
}

export interface RelationshipMemoryContext {
  relationshipId: string
  relationshipType: RelationshipType
  recentInteractions: MemoryEntry[]
  importantPatterns: MemoryEntry[]
  preferences: MemoryEntry[]
  boundaries: MemoryEntry[]
  milestones: MemoryEntry[]
  lastUpdated: Date
}

export interface MemoryQuery {
  relationshipId?: string
  relationshipType?: RelationshipType
  entryTypes?: MemoryEntry['entryType'][]
  tags?: string[]
  timeRange?: { start: Date; end: Date }
  importance?: MemoryEntry['importance'][]
  limit?: number
}

class RelationshipMemoryManager {
  private memories: Map<string, MemoryEntry> = new Map()
  private relationshipContexts: Map<string, RelationshipMemoryContext> = new Map()

  // Store a new memory entry
  storeMemory(entry: Omit<MemoryEntry, 'id' | 'createdAt' | 'referenceCount'>): MemoryEntry {
    const memoryEntry: MemoryEntry = {
      ...entry,
      id: `memory_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      createdAt: new Date(),
      referenceCount: 0
    }

    this.memories.set(memoryEntry.id, memoryEntry)
    this.updateRelationshipContext(memoryEntry)

    console.log(`🧠 Phase 7.5: Stored ${entry.relationshipType} memory: ${entry.entryType} - ${entry.content.substring(0, 50)}...`)
    
    return memoryEntry
  }

  // Retrieve memories based on query
  retrieveMemories(query: MemoryQuery): MemoryEntry[] {
    let relevantMemories = Array.from(this.memories.values())

    // Filter by relationship
    if (query.relationshipId) {
      relevantMemories = relevantMemories.filter(m => m.relationshipId === query.relationshipId)
    }

    // Filter by relationship type
    if (query.relationshipType) {
      relevantMemories = relevantMemories.filter(m => m.relationshipType === query.relationshipType)
    }

    // Filter by entry types
    if (query.entryTypes && query.entryTypes.length > 0) {
      relevantMemories = relevantMemories.filter(m => query.entryTypes!.includes(m.entryType))
    }

    // Filter by tags
    if (query.tags && query.tags.length > 0) {
      relevantMemories = relevantMemories.filter(m => 
        query.tags!.some(tag => m.tags.includes(tag))
      )
    }

    // Filter by time range
    if (query.timeRange) {
      relevantMemories = relevantMemories.filter(m => 
        m.createdAt >= query.timeRange!.start && m.createdAt <= query.timeRange!.end
      )
    }

    // Filter by importance
    if (query.importance && query.importance.length > 0) {
      relevantMemories = relevantMemories.filter(m => query.importance!.includes(m.importance))
    }

    // Sort by importance and recency
    relevantMemories.sort((a, b) => {
      const importanceOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      const importanceDiff = importanceOrder[b.importance] - importanceOrder[a.importance]
      if (importanceDiff !== 0) return importanceDiff
      return b.createdAt.getTime() - a.createdAt.getTime()
    })

    // Update reference counts
    relevantMemories.forEach(memory => {
      memory.referenceCount++
      memory.lastReferencedAt = new Date()
    })

    // Apply limit
    if (query.limit) {
      relevantMemories = relevantMemories.slice(0, query.limit)
    }

    return relevantMemories
  }

  // Get relationship-specific context for AI
  getRelationshipContext(relationshipId: string, relationshipType: RelationshipType): RelationshipMemoryContext {
    let context = this.relationshipContexts.get(relationshipId)
    
    if (!context) {
      context = {
        relationshipId,
        relationshipType,
        recentInteractions: [],
        importantPatterns: [],
        preferences: [],
        boundaries: [],
        milestones: [],
        lastUpdated: new Date()
      }
      this.relationshipContexts.set(relationshipId, context)
    }

    return context
  }

  // Update relationship context when new memory is added
  private updateRelationshipContext(memory: MemoryEntry) {
    const context = this.getRelationshipContext(memory.relationshipId, memory.relationshipType)
    
    switch (memory.entryType) {
      case 'interaction':
        context.recentInteractions.unshift(memory)
        context.recentInteractions = context.recentInteractions.slice(0, 10) // Keep last 10
        break
      case 'pattern':
        context.importantPatterns.unshift(memory)
        context.importantPatterns = context.importantPatterns.slice(0, 5) // Keep top 5
        break
      case 'preference':
        context.preferences.unshift(memory)
        context.preferences = context.preferences.slice(0, 10) // Keep top 10
        break
      case 'boundary':
        context.boundaries.unshift(memory)
        context.boundaries = context.boundaries.slice(0, 5) // Keep top 5
        break
      case 'milestone':
        context.milestones.unshift(memory)
        break
    }

    context.lastUpdated = new Date()
  }

  // Generate context-aware prompt for AI based on relationship memory
  generateContextualPrompt(
    relationshipId: string, 
    relationshipType: RelationshipType,
    basePrompt: string,
    includeTypes: MemoryEntry['entryType'][] = ['interaction', 'pattern', 'preference', 'boundary']
  ): string {
    const memories = this.retrieveMemories({
      relationshipId,
      relationshipType,
      entryTypes: includeTypes,
      limit: 15
    })

    if (memories.length === 0) {
      return basePrompt
    }

    // Build relationship-specific context
    let contextualPrompt = basePrompt + '\n\n'

    // Add relationship-appropriate context header
    switch (relationshipType) {
      case 'romantic':
        contextualPrompt += `ROMANTIC RELATIONSHIP CONTEXT for this intimate partnership:\n`
        break
      case 'work':
        contextualPrompt += `PROFESSIONAL RELATIONSHIP CONTEXT (maintain appropriate workplace boundaries):\n`
        break
      case 'family':
        contextualPrompt += `FAMILY RELATIONSHIP CONTEXT (respect family dynamics and boundaries):\n`
        break
      case 'friend':
        contextualPrompt += `FRIENDSHIP CONTEXT (maintain casual, supportive dynamic):\n`
        break
      case 'other':
        contextualPrompt += `RELATIONSHIP CONTEXT:\n`
        break
    }

    // Add relevant memories by type
    const groupedMemories = this.groupMemoriesByType(memories)

    if (groupedMemories.preference && groupedMemories.preference.length > 0) {
      contextualPrompt += `\nKnown preferences and communication style:\n`
      groupedMemories.preference.forEach(memory => {
        contextualPrompt += `- ${memory.content}\n`
      })
    }

    if (groupedMemories.boundary && groupedMemories.boundary.length > 0) {
      contextualPrompt += `\nImportant boundaries to respect:\n`
      groupedMemories.boundary.forEach(memory => {
        contextualPrompt += `- ${memory.content}\n`
      })
    }

    if (groupedMemories.pattern && groupedMemories.pattern.length > 0) {
      contextualPrompt += `\nObserved patterns in this relationship:\n`
      groupedMemories.pattern.forEach(memory => {
        contextualPrompt += `- ${memory.content}\n`
      })
    }

    if (groupedMemories.milestone && groupedMemories.milestone.length > 0) {
      contextualPrompt += `\nRecent milestones and achievements:\n`
      groupedMemories.milestone.forEach(memory => {
        contextualPrompt += `- ${memory.content}\n`
      })
    }

    // Add recent interactions (last 3-5)
    const recentInteractions = (groupedMemories.interaction || []).slice(0, 5)
    if (recentInteractions.length > 0) {
      contextualPrompt += `\nRecent interactions to reference:\n`
      recentInteractions.forEach(memory => {
        const timeAgo = this.getTimeAgo(memory.createdAt)
        contextualPrompt += `- ${timeAgo}: ${memory.content}\n`
      })
    }

    // Add relationship-specific guidance
    contextualPrompt += this.getRelationshipSpecificGuidance(relationshipType)

    return contextualPrompt
  }

  // Group memories by type for organized context
  private groupMemoriesByType(memories: MemoryEntry[]) {
    return memories.reduce((groups, memory) => {
      const type = memory.entryType
      if (!groups[type]) groups[type] = []
      groups[type].push(memory)
      return groups
    }, {} as Record<string, MemoryEntry[]>)
  }

  // Get relationship-specific AI guidance
  private getRelationshipSpecificGuidance(relationshipType: RelationshipType): string {
    switch (relationshipType) {
      case 'romantic':
        return `\n\nGUIDANCE: Provide warm, intimate, emotionally supportive responses appropriate for a romantic partnership. Reference shared experiences, emotional connection, and future planning when relevant.`
      case 'work':
        return `\n\nGUIDANCE: Maintain strict professional boundaries. Focus on workplace dynamics, collaboration, and professional development. Avoid personal/intimate topics.`
      case 'family':
        return `\n\nGUIDANCE: Be respectful of family hierarchies and generational differences. Focus on family harmony, understanding different perspectives, and respecting boundaries.`
      case 'friend':
        return `\n\nGUIDANCE: Maintain a casual, supportive tone. Focus on mutual enjoyment, shared interests, and emotional support while respecting friendship boundaries.`
      case 'other':
        return `\n\nGUIDANCE: Adapt tone and approach based on the specific relationship context. Maintain appropriate boundaries.`
    }
  }

  // Helper function to get human-readable time ago
  private getTimeAgo(date: Date): string {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  // Clean up expired memories
  cleanupMemories() {
    const now = new Date()
    let cleanedCount = 0

    for (const [id, memory] of this.memories.entries()) {
      if (memory.expiresAt && memory.expiresAt <= now) {
        this.memories.delete(id)
        cleanedCount++
      }
    }

    if (cleanedCount > 0) {
      console.log(`🧠 Phase 7.5: Cleaned up ${cleanedCount} expired memories`)
    }

    // Also clean up old low-importance memories (keep last 100 per relationship)
    const relationshipMemoryCounts: Map<string, number> = new Map()
    const memoriesToDelete: string[] = []

    // Sort all memories by relationship and creation date
    const sortedMemories = Array.from(this.memories.entries()).sort(
      ([,a], [,b]) => b.createdAt.getTime() - a.createdAt.getTime()
    )

    for (const [id, memory] of sortedMemories) {
      const key = `${memory.relationshipId}_${memory.relationshipType}`
      const count = relationshipMemoryCounts.get(key) || 0
      relationshipMemoryCounts.set(key, count + 1)

      // Keep high and critical importance memories
      if (memory.importance === 'high' || memory.importance === 'critical') {
        continue
      }

      // Delete if we have too many memories for this relationship
      if (count > 100) {
        memoriesToDelete.push(id)
      }
    }

    memoriesToDelete.forEach(id => this.memories.delete(id))

    if (memoriesToDelete.length > 0) {
      console.log(`🧠 Phase 7.5: Cleaned up ${memoriesToDelete.length} old low-importance memories`)
    }
  }

  // Get memory statistics for analytics
  getMemoryStats(relationshipId?: string): {
    totalMemories: number
    memoryTypes: Record<string, number>
    importanceLevels: Record<string, number>
    relationshipTypes: Record<string, number>
    averageAge: number
  } {
    let memories = Array.from(this.memories.values())
    
    if (relationshipId) {
      memories = memories.filter(m => m.relationshipId === relationshipId)
    }

    const stats = {
      totalMemories: memories.length,
      memoryTypes: {} as Record<string, number>,
      importanceLevels: {} as Record<string, number>,
      relationshipTypes: {} as Record<string, number>,
      averageAge: 0
    }

    if (memories.length === 0) return stats

    // Count by type
    memories.forEach(memory => {
      stats.memoryTypes[memory.entryType] = (stats.memoryTypes[memory.entryType] || 0) + 1
      stats.importanceLevels[memory.importance] = (stats.importanceLevels[memory.importance] || 0) + 1
      stats.relationshipTypes[memory.relationshipType] = (stats.relationshipTypes[memory.relationshipType] || 0) + 1
    })

    // Calculate average age
    const totalAge = memories.reduce((sum, memory) => {
      return sum + (Date.now() - memory.createdAt.getTime())
    }, 0)
    stats.averageAge = totalAge / memories.length

    return stats
  }
}

// Export singleton instance
export const relationshipMemory = new RelationshipMemoryManager()

// Convenience functions for common memory operations

export function storeInteraction(
  userId: string,
  relationshipId: string,
  relationshipType: RelationshipType,
  content: string,
  context: Record<string, any> = {},
  importance: MemoryEntry['importance'] = 'medium'
): MemoryEntry {
  return relationshipMemory.storeMemory({
    userId,
    relationshipId,
    relationshipType,
    entryType: 'interaction',
    content,
    context,
    importance,
    emotional_tone: 'neutral',
    tags: ['interaction']
  })
}

export function storePattern(
  userId: string,
  relationshipId: string,
  relationshipType: RelationshipType,
  pattern: string,
  importance: MemoryEntry['importance'] = 'high'
): MemoryEntry {
  return relationshipMemory.storeMemory({
    userId,
    relationshipId,
    relationshipType,
    entryType: 'pattern',
    content: pattern,
    context: {},
    importance,
    emotional_tone: 'neutral',
    tags: ['pattern', 'analysis']
  })
}

export function storePreference(
  userId: string,
  relationshipId: string,
  relationshipType: RelationshipType,
  preference: string,
  importance: MemoryEntry['importance'] = 'medium'
): MemoryEntry {
  return relationshipMemory.storeMemory({
    userId,
    relationshipId,
    relationshipType,
    entryType: 'preference',
    content: preference,
    context: {},
    importance,
    emotional_tone: 'neutral',
    tags: ['preference', 'communication']
  })
}

export function storeBoundary(
  userId: string,
  relationshipId: string,
  relationshipType: RelationshipType,
  boundary: string,
  importance: MemoryEntry['importance'] = 'high'
): MemoryEntry {
  return relationshipMemory.storeMemory({
    userId,
    relationshipId,
    relationshipType,
    entryType: 'boundary',
    content: boundary,
    context: {},
    importance,
    emotional_tone: 'neutral',
    tags: ['boundary', 'respect']
  })
}

export function getContextualPrompt(
  relationshipId: string,
  relationshipType: RelationshipType,
  basePrompt: string
): string {
  return relationshipMemory.generateContextualPrompt(relationshipId, relationshipType, basePrompt)
}

export function getRelationshipMemories(
  relationshipId: string,
  relationshipType: RelationshipType,
  limit: number = 10
): MemoryEntry[] {
  return relationshipMemory.retrieveMemories({
    relationshipId,
    relationshipType,
    limit
  })
}

export default relationshipMemory