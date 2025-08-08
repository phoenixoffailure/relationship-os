// app/api/insights/generate-with-memory/route.ts
// Phase 7.5: Context-aware insights generation with relationship memory
// Enhanced AI that remembers past interactions and adapts responses accordingly

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { RelationshipType } from '@/lib/ai/relationship-type-intelligence'
import { 
  generateContextAwareInsight, 
  ContextAwareAIRequest 
} from '@/lib/ai/context-aware-ai'
import {
  storeInteraction,
  storePattern,
  getRelationshipMemories
} from '@/lib/ai/relationship-memory'

interface GenerateInsightsRequest {
  user_id?: string
  relationship_id?: string
  relationship_type?: RelationshipType
  journal_context?: string
  additional_context?: Record<string, any>
}

export async function POST(request: Request) {
  console.log('🧠 Phase 7.5: Starting context-aware insight generation with memory...')
  
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch (error) {
              console.log('Cookie setting error (can be ignored):', error)
            }
          },
        },
      }
    )
    
    // Parse request body
    let requestBody: GenerateInsightsRequest = {}
    try {
      requestBody = await request.json()
    } catch (error) {
      console.log('📝 No request body provided')
    }

    // Get user ID
    let user_id = requestBody.user_id
    if (!user_id) {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (authError || !user) {
        return NextResponse.json({ 
          error: 'Authentication required' 
        }, { status: 401 })
      }
      user_id = user.id
    }

    console.log('✅ User ID:', user_id)

    // Get user's active relationship context
    const relationshipContext = await getActiveRelationshipContext(
      supabase, 
      user_id, 
      requestBody.relationship_id,
      requestBody.relationship_type
    )

    if (!relationshipContext) {
      return NextResponse.json({
        error: 'No active relationship context found',
        message: 'Please add relationships to generate context-aware insights'
      }, { status: 400 })
    }

    const { relationshipId, relationshipType, relationshipData } = relationshipContext

    console.log(`🧠 Phase 7.5: Generating insights for ${relationshipType} relationship: ${relationshipData.name}`)

    // Get recent journal entries for context
    const recentEntries = await getRecentJournalEntries(supabase, user_id, relationshipId)
    
    // Build input context from journal entries and additional context
    const contextInput = buildInsightContext(
      recentEntries,
      requestBody.journal_context,
      requestBody.additional_context
    )

    // Generate context-aware insights using AI memory
    const aiResponse = await generateContextAwareInsight(
      user_id,
      relationshipId,
      relationshipType,
      contextInput
    )

    console.log(`🧠 Generated ${relationshipType} insights with ${aiResponse.contextUsed.memoryCount} memory entries`)

    // Parse AI response into individual insights
    const insights = parseInsightsFromResponse(aiResponse.response, relationshipType)

    // Save insights to database
    const savedInsights = await saveInsights(
      supabase,
      user_id,
      relationshipId,
      insights,
      relationshipType
    )

    // Store this interaction in memory for future context
    await storeInteraction(
      user_id,
      relationshipId,
      relationshipType,
      `Generated ${insights.length} insights based on recent journal entries`,
      {
        insightTypes: insights.map(i => i.insight_type),
        confidence: aiResponse.confidence,
        journalEntriesAnalyzed: recentEntries.length
      },
      'medium'
    )

    console.log(`✅ Phase 7.5: Generated ${savedInsights.length} context-aware insights for ${relationshipType} relationship`)

    return NextResponse.json({
      success: true,
      insights: savedInsights,
      relationship_context: {
        relationship_id: relationshipId,
        relationship_type: relationshipType,
        relationship_name: relationshipData.name
      },
      ai_context: aiResponse.contextUsed,
      memory_entries_created: aiResponse.memoryEntriesCreated.length,
      message: `Generated ${savedInsights.length} personalized insights with relationship memory`
    })

  } catch (error) {
    console.error('❌ Phase 7.5: Context-aware insight generation error:', error)
    
    return NextResponse.json({
      error: 'Failed to generate context-aware insights',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Get active relationship context for user
async function getActiveRelationshipContext(
  supabase: any,
  userId: string,
  preferredRelationshipId?: string,
  preferredRelationshipType?: RelationshipType
) {
  try {
    // First, get user's relationships
    const { data: memberData, error: memberError } = await supabase
      .from('relationship_members')
      .select(`
        relationship_id,
        relationships (
          id,
          name,
          relationship_type,
          created_at
        )
      `)
      .eq('user_id', userId)

    if (memberError || !memberData?.length) {
      console.log('❌ No relationships found for user')
      return null
    }

    const relationships = memberData
      .map((member: any) => member.relationships)
      .filter(Boolean)

    // If specific relationship requested, use that
    if (preferredRelationshipId) {
      const targetRelationship = relationships.find((r: any) => r.id === preferredRelationshipId)
      if (targetRelationship) {
        return {
          relationshipId: targetRelationship.id,
          relationshipType: targetRelationship.relationship_type as RelationshipType,
          relationshipData: targetRelationship
        }
      }
    }

    // If specific relationship type requested, find first match
    if (preferredRelationshipType) {
      const targetRelationship = relationships.find((r: any) => r.relationship_type === preferredRelationshipType)
      if (targetRelationship) {
        return {
          relationshipId: targetRelationship.id,
          relationshipType: targetRelationship.relationship_type as RelationshipType,
          relationshipData: targetRelationship
        }
      }
    }

    // Default to first relationship (most recently created)
    const firstRelationship = relationships[0]
    return {
      relationshipId: firstRelationship.id,
      relationshipType: firstRelationship.relationship_type as RelationshipType,
      relationshipData: firstRelationship
    }

  } catch (error) {
    console.error('Error getting relationship context:', error)
    return null
  }
}

// Get recent journal entries for context
async function getRecentJournalEntries(supabase: any, userId: string, relationshipId?: string) {
  try {
    let query = supabase
      .from('journal_entries')
      .select('id, content, mood_score, created_at, relationship_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5)

    // If relationship specified, get entries for that relationship + general entries
    if (relationshipId) {
      query = query.or(`relationship_id.eq.${relationshipId},relationship_id.is.null`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching journal entries:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getRecentJournalEntries:', error)
    return []
  }
}

// Build context input for AI from various sources
function buildInsightContext(
  journalEntries: any[],
  journalContext?: string,
  additionalContext?: Record<string, any>
): string {
  let context = ''

  // Add journal context if provided
  if (journalContext) {
    context += `Recent journal context: ${journalContext}\n\n`
  }

  // Add recent journal entries
  if (journalEntries.length > 0) {
    context += 'Recent journal entries:\n'
    journalEntries.forEach((entry, index) => {
      const timeAgo = getTimeAgo(new Date(entry.created_at))
      context += `${index + 1}. (${timeAgo}) ${entry.content.substring(0, 200)}...\n`
    })
    context += '\n'
  }

  // Add additional context
  if (additionalContext && Object.keys(additionalContext).length > 0) {
    context += 'Additional context:\n'
    Object.entries(additionalContext).forEach(([key, value]) => {
      context += `${key}: ${value}\n`
    })
  }

  return context || 'Generate insights based on the user\'s relationship patterns and needs.'
}

// Parse AI response into structured insights
function parseInsightsFromResponse(response: string, relationshipType: RelationshipType) {
  // Simple parsing - in production, this would be more sophisticated
  const insights = []
  const sentences = response.split(/[.!?]+/).filter(s => s.trim().length > 20)
  
  // Take the first few meaningful sentences as insights
  const insightCount = Math.min(sentences.length, 4)
  
  for (let i = 0; i < insightCount; i++) {
    const sentence = sentences[i].trim()
    if (sentence.length > 20) {
      insights.push({
        insight_type: getInsightType(sentence, relationshipType),
        title: generateInsightTitle(sentence, relationshipType),
        description: sentence,
        priority: i === 0 ? 'high' : i === 1 ? 'medium' : 'low'
      })
    }
  }

  return insights
}

// Determine insight type based on content
function getInsightType(content: string, relationshipType: RelationshipType): string {
  const lower = content.toLowerCase()
  
  if (lower.includes('pattern') || lower.includes('notice') || lower.includes('tend to')) {
    return 'pattern'
  }
  if (lower.includes('suggest') || lower.includes('try') || lower.includes('consider')) {
    return 'suggestion'
  }
  if (lower.includes('appreciate') || lower.includes('grateful') || lower.includes('value')) {
    return 'appreciation'
  }
  if (lower.includes('progress') || lower.includes('growth') || lower.includes('milestone')) {
    return 'milestone'
  }
  
  // Default based on relationship type
  switch (relationshipType) {
    case 'romantic': return 'connection'
    case 'work': return 'professional_growth'
    case 'family': return 'family_harmony'
    case 'friend': return 'friendship_support'
    default: return 'personal_growth'
  }
}

// Generate appropriate title for insight
function generateInsightTitle(content: string, relationshipType: RelationshipType): string {
  const titles = {
    romantic: [
      'Deepening Connection',
      'Relationship Growth',
      'Intimacy Insight',
      'Partnership Reflection'
    ],
    work: [
      'Professional Development',
      'Workplace Collaboration',
      'Career Insight',
      'Team Dynamics'
    ],
    family: [
      'Family Harmony',
      'Generational Understanding',
      'Family Relationship',
      'Family Growth'
    ],
    friend: [
      'Friendship Connection',
      'Social Support',
      'Friend Appreciation',
      'Social Growth'
    ],
    other: [
      'Relationship Insight',
      'Personal Growth',
      'Connection Reflection',
      'Relationship Development'
    ]
  }

  const titleOptions = titles[relationshipType] || titles.other
  return titleOptions[Math.floor(Math.random() * titleOptions.length)]
}

// Save insights to database
async function saveInsights(
  supabase: any,
  userId: string,
  relationshipId: string,
  insights: any[],
  relationshipType: RelationshipType
) {
  const insightsToSave = insights.map(insight => ({
    generated_for_user: userId,
    relationship_id: relationshipId,
    insight_type: insight.insight_type,
    title: insight.title,
    description: insight.description,
    priority: insight.priority,
    created_at: new Date().toISOString()
  }))

  const { data, error } = await supabase
    .from('relationship_insights')
    .insert(insightsToSave)
    .select()

  if (error) {
    console.error('Error saving insights:', error)
    return []
  }

  return data || []
}

// Helper function to get human-readable time ago
function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffHours < 1) return 'just now'
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays === 1) return 'yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return date.toLocaleDateString()
}