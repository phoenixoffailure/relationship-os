// lib/ai/memory-integration.ts
// Phase 8: Database-connected memory system integration
// Connects the in-memory system to actual database tables

import { createClient } from '@supabase/supabase-js'
import type { 
  Database,
  AIMemoryEntry,
  AIConversationHistory,
  RelationshipContextCache 
} from '@/lib/types/database'

type SupabaseClient = ReturnType<typeof createClient<Database>>

export interface MemoryContext {
  recentInteractions: AIMemoryEntry[]
  importantPatterns: AIMemoryEntry[]
  preferences: AIMemoryEntry[]
  boundaries: AIMemoryEntry[]
  conversationHistory: AIConversationHistory[]
}

export interface MemoryInsight {
  content: string
  context: Record<string, any>
  importance: 'low' | 'medium' | 'high' | 'critical'
  patterns: string[]
}

/**
 * Load relationship memories from database
 */
export async function loadRelationshipMemories(
  supabase: SupabaseClient,
  userId: string,
  relationshipId?: string,
  limit: number = 20
): Promise<MemoryContext> {
  console.log('🧠 Loading relationship memories for user:', userId)

  // Load recent memory entries
  const { data: memories, error: memoryError } = await supabase
    .from('ai_memory_entries')
    .select('*')
    .eq('user_id', userId)
    .eq(relationshipId ? 'relationship_id' : 'user_id', relationshipId || userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (memoryError) {
    console.error('Error loading memories:', memoryError)
  }

  // Load recent conversation history
  const { data: conversations, error: convError } = await supabase
    .from('ai_conversation_history')
    .select('*')
    .eq('user_id', userId)
    .eq(relationshipId ? 'relationship_id' : 'user_id', relationshipId || userId)
    .order('created_at', { ascending: false })
    .limit(10)

  if (convError) {
    console.error('Error loading conversations:', convError)
  }

  // Organize memories by type
  const memoryContext: MemoryContext = {
    recentInteractions: memories?.filter(m => m.entry_type === 'interaction') || [],
    importantPatterns: memories?.filter(m => m.entry_type === 'pattern') || [],
    preferences: memories?.filter(m => m.entry_type === 'preference') || [],
    boundaries: memories?.filter(m => m.entry_type === 'boundary') || [],
    conversationHistory: conversations || []
  }

  console.log('🧠 Loaded memory context:', {
    interactions: memoryContext.recentInteractions.length,
    patterns: memoryContext.importantPatterns.length,
    preferences: memoryContext.preferences.length,
    boundaries: memoryContext.boundaries.length,
    conversations: memoryContext.conversationHistory.length
  })

  return memoryContext
}

/**
 * Store a new memory entry in database
 */
export async function storeMemory(
  supabase: SupabaseClient,
  userId: string,
  memory: {
    relationshipId?: string
    relationshipType: 'romantic' | 'work' | 'family' | 'friend' | 'other'
    entryType: 'interaction' | 'insight' | 'pattern' | 'milestone' | 'preference' | 'boundary'
    content: string
    context?: Record<string, any>
    importance: 'low' | 'medium' | 'high' | 'critical'
    emotionalTone: 'positive' | 'neutral' | 'negative' | 'mixed'
    tags?: string[]
  }
): Promise<AIMemoryEntry | null> {
  console.log('💾 Storing new memory:', memory.entryType)

  const { data, error } = await supabase
    .from('ai_memory_entries')
    .insert({
      user_id: userId,
      relationship_id: memory.relationshipId,
      relationship_type: memory.relationshipType,
      entry_type: memory.entryType,
      content: memory.content,
      context: memory.context || {},
      importance: memory.importance,
      emotional_tone: memory.emotionalTone,
      tags: memory.tags || [],
      confidence_score: 0.8, // Default confidence
      is_active: true
    })
    .select()
    .single()

  if (error) {
    console.error('Error storing memory:', error)
    return null
  }

  console.log('✅ Memory stored successfully')
  return data
}

/**
 * Store conversation history in database
 */
export async function storeConversation(
  supabase: SupabaseClient,
  userId: string,
  conversation: {
    relationshipId?: string
    relationshipType: 'romantic' | 'work' | 'family' | 'friend' | 'other'
    conversationType: 'insight_generation' | 'journal_analysis' | 'suggestion_creation' | 'general_conversation'
    userInput?: string
    aiResponse: string
    responseType: 'insight' | 'suggestion' | 'analysis' | 'conversation'
    personalityUsed: string
    confidence?: number
    responseTimeMs?: number
  }
): Promise<AIConversationHistory | null> {
  console.log('💬 Storing conversation history')

  const { data, error } = await supabase
    .from('ai_conversation_history')
    .insert({
      user_id: userId,
      relationship_id: conversation.relationshipId,
      relationship_type: conversation.relationshipType,
      conversation_type: conversation.conversationType,
      user_input: conversation.userInput,
      ai_response: conversation.aiResponse,
      response_type: conversation.responseType,
      ai_personality_used: conversation.personalityUsed,
      confidence: conversation.confidence || 0.8,
      response_time_ms: conversation.responseTimeMs
    })
    .select()
    .single()

  if (error) {
    console.error('Error storing conversation:', error)
    return null
  }

  console.log('✅ Conversation stored successfully')
  return data
}

/**
 * Generate memory-enhanced context for AI prompts
 */
export function buildMemoryContext(
  memoryContext: MemoryContext,
  relationshipType: 'romantic' | 'work' | 'family' | 'friend' | 'other'
): string {
  console.log('🔗 Building memory-enhanced context')

  let context = ''

  // Add recent interactions
  if (memoryContext.recentInteractions.length > 0) {
    context += '\\n\\nRecent Interaction Context:\\n'
    memoryContext.recentInteractions.slice(0, 3).forEach(memory => {
      context += `- ${memory.content} (${memory.emotional_tone})\\n`
    })
  }

  // Add important patterns
  if (memoryContext.importantPatterns.length > 0) {
    context += '\\n\\nObserved Patterns:\\n'
    memoryContext.importantPatterns.slice(0, 2).forEach(memory => {
      context += `- ${memory.content}\\n`
    })
  }

  // Add preferences (if appropriate for relationship type)
  if (memoryContext.preferences.length > 0 && relationshipType !== 'work') {
    context += '\\n\\nRemembered Preferences:\\n'
    memoryContext.preferences.slice(0, 3).forEach(memory => {
      context += `- ${memory.content}\\n`
    })
  }

  // Add boundaries
  if (memoryContext.boundaries.length > 0) {
    context += '\\n\\nImportant Boundaries:\\n'
    memoryContext.boundaries.forEach(memory => {
      context += `- ${memory.content}\\n`
    })
  }

  console.log('✅ Memory context built, length:', context.length)
  return context
}

/**
 * Extract insights that should be remembered from AI response
 */
export function extractMemoryInsights(
  aiResponse: string,
  relationshipType: 'romantic' | 'work' | 'family' | 'friend' | 'other',
  userInput?: string
): MemoryInsight[] {
  const insights: MemoryInsight[] = []

  // Simple pattern matching to identify memorable content
  // In a production system, this would use more sophisticated NLP

  // Look for pattern mentions
  if (aiResponse.includes('pattern') || aiResponse.includes('tend to') || aiResponse.includes('often')) {
    insights.push({
      content: `Identified pattern in ${relationshipType} relationship behavior`,
      context: { userInput, relationshipType },
      importance: 'medium',
      patterns: ['behavioral_pattern']
    })
  }

  // Look for preference mentions
  if (aiResponse.includes('prefer') || aiResponse.includes('like when') || aiResponse.includes('appreciate')) {
    insights.push({
      content: `Identified preference in ${relationshipType} relationship`,
      context: { userInput, relationshipType },
      importance: 'medium',
      patterns: ['preference_insight']
    })
  }

  // Look for boundary mentions
  if (aiResponse.includes('boundary') || aiResponse.includes('comfortable') || aiResponse.includes('respect')) {
    insights.push({
      content: `Identified boundary consideration in ${relationshipType} relationship`,
      context: { userInput, relationshipType },
      importance: 'high',
      patterns: ['boundary_insight']
    })
  }

  return insights
}

/**
 * Update context cache for performance
 */
export async function updateContextCache(
  supabase: SupabaseClient,
  userId: string,
  relationshipId: string,
  relationshipType: 'romantic' | 'work' | 'family' | 'friend' | 'other',
  memoryContext: MemoryContext
): Promise<void> {
  console.log('📦 Updating context cache')

  const cacheData = {
    recent_interactions: memoryContext.recentInteractions.map(m => ({
      content: m.content,
      emotional_tone: m.emotional_tone,
      created_at: m.created_at
    })),
    important_patterns: memoryContext.importantPatterns.map(m => ({
      content: m.content,
      importance: m.importance
    })),
    preferences: memoryContext.preferences.map(m => ({
      content: m.content,
      tags: m.tags
    })),
    boundaries: memoryContext.boundaries.map(m => ({
      content: m.content,
      importance: m.importance
    }))
  }

  const { error } = await supabase
    .from('relationship_context_cache')
    .upsert({
      user_id: userId,
      relationship_id: relationshipId,
      relationship_type: relationshipType,
      recent_interactions: cacheData.recent_interactions,
      important_patterns: cacheData.important_patterns,
      preferences: cacheData.preferences,
      boundaries: cacheData.boundaries,
      last_updated: new Date().toISOString(),
      cache_version: '1.0'
    })

  if (error) {
    console.error('Error updating context cache:', error)
  } else {
    console.log('✅ Context cache updated')
  }
}