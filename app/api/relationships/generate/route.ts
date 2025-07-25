// app/api/suggestions/generate/route.ts
// Core MVP Feature: Transform needs into partner suggestions
// This is the MAKE-OR-BREAK feature that differentiates RelationshipOS

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database, SuggestionType, PartnerSuggestionInsert } from '@/lib/types/database'

// Type definitions
interface GenerateSuggestionsRequest {
  relationshipId: string
  sourceUserId?: string // Optional - if not provided, will find recent journal entries
  timeframeHours?: number // How far back to look for needs (default: 72 hours)
  maxSuggestions?: number // Max suggestions to generate (default: 3)
}

interface GeneratedSuggestion {
  suggestion_type: SuggestionType
  suggestion_text: string
  anonymized_context: string
  priority_score: number
  confidence_score: number
  source_need_intensity: number
}

interface SuggestionGenerationResult {
  suggestions: GeneratedSuggestion[]
  relationship_context: {
    partner_profiles: any[]
    relationship_id: string
    active_members: number
  }
  processing_stats: {
    entries_analyzed: number
    needs_found: number
    suggestions_generated: number
    confidence_threshold_met: number
  }
}

interface RelationshipMember {
  user_id: string
  user_name: string
  role: string | null
}

interface PartnerProfile {
  user_id: string
  ai_profile_data: any
  love_language_ranking: string[]
  communication_style: string
}

interface RelationshipContext {
  isValid: boolean
  partners: RelationshipMember[]
  partnerProfiles: PartnerProfile[]
}

interface Need {
  type: SuggestionType // Changed from string to SuggestionType
  intensity: number
  urgency: 'high' | 'medium' | 'low'
  context: string
  keywords: string[]
  emotional_state: string
  source_user_id: string
  entry_id: string
  entry_mood: number
  entry_date: string
}

interface RecentNeedsResult {
  totalEntries: number
  entriesWithNeeds: number
  allNeeds: Need[]
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { 
      relationshipId, 
      sourceUserId, 
      timeframeHours = 72, 
      maxSuggestions = 3 
    } = await request.json() as GenerateSuggestionsRequest

    if (!relationshipId) {
      return NextResponse.json({ 
        error: 'Missing relationshipId' 
      }, { status: 400 })
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { 
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set(name, value, options)
          },
          remove(name: string, options: any) {
            cookieStore.delete(name)
          },
        },
      }
    )

    console.log('🎯 Starting suggestion generation for relationship:', relationshipId)

    // Step 1: Get relationship context and partners
    const relationshipContext = await getRelationshipContext(supabase, relationshipId)
    
    if (!relationshipContext.isValid) {
      return NextResponse.json({ 
        error: 'Invalid relationship or insufficient members' 
      }, { status: 400 })
    }

    console.log('👥 Relationship context:', {
      members: relationshipContext.partners.length,
      hasProfiles: relationshipContext.partnerProfiles.length
    })

    // Step 2: Find recent journal entries with need analysis
    const recentNeeds = await findRecentNeeds(
      supabase, 
      relationshipContext.partners, 
      timeframeHours,
      sourceUserId
    )

    console.log('🔍 Found needs:', {
      totalEntries: recentNeeds.totalEntries,
      entriesWithNeeds: recentNeeds.entriesWithNeeds,
      totalNeeds: recentNeeds.allNeeds.length
    })

    if (recentNeeds.allNeeds.length === 0) {
      return NextResponse.json({
        success: true,
        suggestions: [],
        message: 'No actionable needs found in recent journal entries',
        processing_stats: {
          entries_analyzed: recentNeeds.totalEntries,
          needs_found: 0,
          suggestions_generated: 0,
          confidence_threshold_met: 0
        }
      })
    }

    // Step 3: Generate suggestions for each partner
    const allGeneratedSuggestions: (GeneratedSuggestion & { 
      recipient_user_id: string
      source_user_id: string 
    })[] = []

    for (const partner of relationshipContext.partners) {
      // Find needs expressed by OTHER partners (not this partner)
      const needsForThisPartner = recentNeeds.allNeeds.filter(
        need => need.source_user_id !== partner.user_id
      )

      if (needsForThisPartner.length === 0) continue

      console.log(`💡 Generating suggestions for ${partner.user_name} based on ${needsForThisPartner.length} partner needs`)

      // Generate personalized suggestions
      const suggestions = await generatePersonalizedSuggestions(
        needsForThisPartner,
        partner,
        relationshipContext.partnerProfiles.find(p => p.user_id === partner.user_id),
        maxSuggestions
      )

      allGeneratedSuggestions.push(...suggestions.map(s => ({
        ...s,
        recipient_user_id: partner.user_id,
        source_user_id: needsForThisPartner[0].source_user_id // Primary need source
      })))
    }

    console.log(`✨ Generated ${allGeneratedSuggestions.length} total suggestions`)

    // Step 4: Save suggestions to database
    const savedSuggestions = await saveSuggestionsToDatabase(
      supabase,
      allGeneratedSuggestions,
      relationshipId
    )

    // Step 5: Return results
    const result: SuggestionGenerationResult = {
      suggestions: allGeneratedSuggestions.map(s => ({
        suggestion_type: s.suggestion_type,
        suggestion_text: s.suggestion_text,
        anonymized_context: s.anonymized_context,
        priority_score: s.priority_score,
        confidence_score: s.confidence_score,
        source_need_intensity: s.source_need_intensity
      })),
      relationship_context: {
        partner_profiles: relationshipContext.partnerProfiles,
        relationship_id: relationshipId,
        active_members: relationshipContext.partners.length
      },
      processing_stats: {
        entries_analyzed: recentNeeds.totalEntries,
        needs_found: recentNeeds.allNeeds.length,
        suggestions_generated: allGeneratedSuggestions.length,
        confidence_threshold_met: allGeneratedSuggestions.filter(s => s.confidence_score >= 0.7).length
      }
    }

    console.log('✅ Suggestion generation completed successfully')

    return NextResponse.json({
      success: true,
      result,
      message: `Generated ${allGeneratedSuggestions.length} personalized suggestions`
    })

  } catch (error) {
    console.error('❌ Suggestion generation error:', error)
    
    return NextResponse.json({ 
      error: 'Suggestion generation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Helper functions

async function getRelationshipContext(supabase: any, relationshipId: string): Promise<RelationshipContext> {
  // Get relationship members
  const { data: members, error: membersError } = await supabase
    .from('relationship_members')
    .select(`
      user_id,
      role,
      users!inner (
        id,
        full_name,
        email
      )
    `)
    .eq('relationship_id', relationshipId)

  if (membersError || !members || members.length < 2) {
    return { isValid: false, partners: [], partnerProfiles: [] }
  }

  // Get partner AI profiles for personalization
  const userIds = members.map((m: any) => m.user_id)
  const { data: profiles } = await supabase
    .from('enhanced_onboarding_responses')
    .select('user_id, ai_profile_data, love_language_ranking, communication_style')
    .in('user_id', userIds)
    .order('created_at', { ascending: false })

  return {
    isValid: true,
    partners: members.map((m: any) => ({
      user_id: m.user_id,
      user_name: m.users.full_name || m.users.email,
      role: m.role
    })),
    partnerProfiles: profiles || []
  }
}

async function findRecentNeeds(
  supabase: any, 
  partners: RelationshipMember[], 
  timeframeHours: number,
  sourceUserId?: string
): Promise<RecentNeedsResult> {
  const cutoffTime = new Date(Date.now() - timeframeHours * 60 * 60 * 1000).toISOString()
  const userIds = sourceUserId ? [sourceUserId] : partners.map((p: RelationshipMember) => p.user_id)

  // Get recent journal entries with AI analysis
  const { data: entries, error } = await supabase
    .from('journal_entries')
    .select('id, user_id, content, mood_score, ai_analysis, created_at')
    .in('user_id', userIds)
    .gte('created_at', cutoffTime)
    .not('ai_analysis', 'is', null)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('❌ Error fetching recent entries:', error)
    return { totalEntries: 0, entriesWithNeeds: 0, allNeeds: [] }
  }

  // Extract needs from AI analysis
  const allNeeds: Need[] = []
  let entriesWithNeeds = 0

  for (const entry of entries || []) {
    if (entry.ai_analysis?.need_analysis?.needs) {
      const needs = entry.ai_analysis.need_analysis.needs
      if (needs.length > 0) {
        entriesWithNeeds++
        needs.forEach((need: any) => {
          // Type guard to ensure need.type is a valid SuggestionType
          const needType = need.type as SuggestionType
          if (needType && ['love_language_action', 'communication_improvement', 'intimacy_connection', 'goal_support', 'conflict_resolution', 'quality_time', 'stress_support'].includes(needType)) {
            allNeeds.push({
              ...need,
              type: needType, // Ensure type is properly cast
              source_user_id: entry.user_id,
              entry_id: entry.id,
              entry_mood: entry.mood_score,
              entry_date: entry.created_at
            })
          }
        })
      }
    }
  }

  // Sort needs by urgency and intensity
  allNeeds.sort((a: Need, b: Need) => {
    const urgencyScore: Record<string, number> = { high: 3, medium: 2, low: 1 }
    const aScore = (urgencyScore[a.urgency] || 1) * a.intensity
    const bScore = (urgencyScore[b.urgency] || 1) * b.intensity
    return bScore - aScore
  })

  return {
    totalEntries: entries?.length || 0,
    entriesWithNeeds,
    allNeeds: allNeeds.slice(0, 10) // Limit to top 10 needs
  }
}

async function generatePersonalizedSuggestions(
  needs: Need[],
  recipient: RelationshipMember,
  recipientProfile: PartnerProfile | undefined,
  maxSuggestions: number
): Promise<GeneratedSuggestion[]> {
  
  const suggestions: GeneratedSuggestion[] = []
  const usedTypes = new Set<string>()

  // Process needs by priority
  for (const need of needs.slice(0, maxSuggestions * 2)) { // Process more needs than we'll use
    // Skip if we already have a suggestion of this type
    if (usedTypes.has(need.type)) continue
    
    // Generate suggestion based on need type and recipient profile
    const suggestion = await generateSuggestionForNeed(need, recipient, recipientProfile)
    
    if (suggestion && suggestion.confidence_score >= 0.6) { // Quality threshold
      suggestions.push(suggestion)
      usedTypes.add(need.type)
      
      if (suggestions.length >= maxSuggestions) break
    }
  }

  return suggestions
}

async function generateSuggestionForNeed(
  need: Need,
  recipient: RelationshipMember,
  recipientProfile: PartnerProfile | undefined
): Promise<GeneratedSuggestion | null> {
  
  // Get recipient's love language and communication style for personalization
  const primaryLoveLanguage = recipientProfile?.love_language_ranking?.[0] || 'quality_time'
  const communicationStyle = recipientProfile?.communication_style || 'direct'
  
  // Suggestion templates organized by need type
  const suggestionTemplates = {
    love_language_action: {
      quality_time: [
        "Plan 15-20 minutes of uninterrupted time together tonight - perhaps during dinner or before bed.",
        "Suggest a short walk together or sitting outside for a few minutes to connect.",
        "Create a phone-free zone for your next conversation to give them your full attention."
      ],
      physical_touch: [
        "Offer a gentle hug or back rub when you see them next - physical comfort can mean a lot right now.",
        "Hold their hand while watching TV or during conversations to show support.",
        "Give them a brief shoulder massage while they're working or relaxing."
      ],
      words_of_affirmation: [
        "Tell them something specific you appreciate about them today.",
        "Send a thoughtful text message acknowledging something they've done well recently.",
        "Verbally express how much they mean to you during a quiet moment together."
      ],
      acts_of_service: [
        "Take care of one small task they usually handle - like making coffee or tidying up.",
        "Offer to help with something they're working on or feeling stressed about.",
        "Do something thoughtful that makes their day a little easier."
      ],
      receiving_gifts: [
        "Bring them their favorite snack or drink as a small surprise.",
        "Pick up something small that reminds you of them or an inside joke you share.",
        "Write them a short note expressing your appreciation and leave it somewhere they'll find it."
      ]
    },
    
    communication_improvement: {
      direct: [
        "Ask them directly: 'How are you feeling about us lately? I want to make sure we're on the same page.'",
        "Schedule a brief check-in conversation: 'Can we talk for 10 minutes about how things are going?'",
        "Express your commitment: 'I want you to know I'm here to listen if you want to share what's on your mind.'"
      ],
      indirect_suggestive: [
        "Create space for conversation by suggesting: 'Would you like to talk about anything over dinner?'",
        "Show interest gently: 'I've been thinking about us and wondering how you're feeling lately.'",
        "Use open-ended invitations: 'I'm here if you ever want to share what's on your mind.'"
      ]
    },

    quality_time: [
      "Suggest doing something low-key together - even 15 minutes of focused time can help them feel more connected.",
      "Put away distractions and give them your full attention during your next interaction.",
      "Propose a simple shared activity like cooking dinner together or taking a short walk.",
      "Ask if they'd like to just sit together for a few minutes without any agenda - sometimes presence is enough."
    ],

    intimacy_connection: [
      "Create emotional safety by asking: 'How can I support you better right now?'",
      "Share something vulnerable about your own day or feelings to invite deeper connection.",
      "Suggest cuddling or physical closeness without any pressure - sometimes just being close helps.",
      "Express appreciation for who they are as a person, not just what they do."
    ],

    stress_support: [
      "Ask specifically: 'What would be most helpful for you right now?' and then follow through.",
      "Offer to take something off their plate: 'Is there anything I can handle so you have less to worry about?'",
      "Create a calm environment - dim lights, minimize noise, or suggest a relaxing activity together.",
      "Remind them of their strengths: 'You've handled challenging things before, and I believe in you.'"
    ],

    goal_support: [
      "Ask about their current goals and how you can support them: 'What are you working toward that I can help with?'",
      "Celebrate small wins: acknowledge progress they've made on things that matter to them.",
      "Offer practical support: 'Is there a way I can help make your goals easier to achieve?'",
      "Express belief in their abilities: 'I'm excited to see where your efforts take you.'"
    ],

    conflict_resolution: [
      "Suggest addressing any tension directly but gently: 'I feel like there might be something between us - can we talk about it?'",
      "Take responsibility for your part: 'I want to understand if I've done something that hurt you.'",
      "Focus on moving forward: 'How can we handle this differently next time?'",
      "Express your commitment to working through challenges together."
    ]
  }

  // Get appropriate suggestions based on need type
  let possibleSuggestions: string[] = []
  
  // Type guard to ensure need.type is handled properly
  const needType = need.type
  
  if (needType in suggestionTemplates && typeof suggestionTemplates[needType] === 'object') {
    // Love language specific suggestions
    const loveLanguageCategory = suggestionTemplates[needType] as Record<string, string[]>
    possibleSuggestions = loveLanguageCategory[primaryLoveLanguage] || loveLanguageCategory['quality_time'] || []
  } else if (needType in suggestionTemplates) {
    // General suggestions
    const generalSuggestions = suggestionTemplates[needType]
    possibleSuggestions = Array.isArray(generalSuggestions) ? generalSuggestions : []
  }

  if (possibleSuggestions.length === 0) {
    return null // No suggestions available for this need type
  }

  // Select best suggestion based on need intensity and context
  const selectedSuggestion = selectBestSuggestion(possibleSuggestions, need, recipientProfile)
  
  // Calculate confidence score based on multiple factors
  const confidenceScore = calculateSuggestionConfidence(need, recipientProfile, selectedSuggestion)
  
  // Create anonymized context
  const anonymizedContext = createAnonymizedContext(need)
  
  // Calculate priority score
  const priorityScore = calculatePriorityScore(need, confidenceScore)

  return {
    suggestion_type: need.type as SuggestionType, // Type assertion for database enum
    suggestion_text: selectedSuggestion,
    anonymized_context: anonymizedContext,
    priority_score: priorityScore,
    confidence_score: confidenceScore,
    source_need_intensity: need.intensity
  }
}

function selectBestSuggestion(
  possibleSuggestions: string[],
  need: Need,
  recipientProfile: PartnerProfile | undefined
): string {
  // For now, select based on need intensity
  // Higher intensity needs get more direct suggestions
  if (need.intensity >= 7 && possibleSuggestions.length > 1) {
    return possibleSuggestions[0] // Most direct/immediate suggestion
  } else if (need.intensity >= 4 && possibleSuggestions.length > 2) {
    return possibleSuggestions[1] // Moderate suggestion
  } else {
    return possibleSuggestions[possibleSuggestions.length - 1] // Gentler suggestion
  }
}

function calculateSuggestionConfidence(
  need: Need,
  recipientProfile: PartnerProfile | undefined,
  suggestionText: string
): number {
  let confidence = 0.5 // Base confidence
  
  // Boost confidence based on need intensity
  confidence += (need.intensity / 10) * 0.3
  
  // Boost confidence if we have recipient profile
  if (recipientProfile) {
    confidence += 0.15
  }
  
  // Boost confidence based on urgency
  const urgencyBoost: Record<string, number> = { high: 0.2, medium: 0.1, low: 0.05 }
  confidence += urgencyBoost[need.urgency] || 0
  
  // Slight boost for longer, more detailed suggestions
  if (suggestionText.length > 80) {
    confidence += 0.05
  }
  
  return Math.min(confidence, 1.0) // Cap at 1.0
}

function createAnonymizedContext(need: Need): string {
  const contextTemplates: Record<string, string> = {
    love_language_action: "Your partner has been expressing a need for more physical affection and connection.",
    communication_improvement: "Your partner would appreciate more open dialogue and emotional sharing.",
    quality_time: "Your partner has been feeling like they need more focused time and attention.",
    intimacy_connection: "Your partner is seeking deeper emotional connection and intimacy.",
    stress_support: "Your partner has been feeling overwhelmed and could use extra support.",
    goal_support: "Your partner would benefit from encouragement and support with their personal goals.",
    conflict_resolution: "There may be some unresolved tension that your partner would like to address."
  }
  
  const baseContext = contextTemplates[need.type] || 
    "Your partner has expressed a relationship need that you could help address."
  
  // Add intensity context
  if (need.intensity >= 8) {
    return baseContext + " This seems particularly important to them right now."
  } else if (need.intensity >= 6) {
    return baseContext + " This appears to be on their mind lately."
  } else {
    return baseContext
  }
}

function calculatePriorityScore(need: Need, confidenceScore: number): number {
  const urgencyWeight: Record<string, number> = { high: 3, medium: 2, low: 1 }
  const urgencyScore = urgencyWeight[need.urgency] || 1
  
  // Priority = (intensity * urgency * confidence) normalized to 1-10 scale
  const rawScore = (need.intensity / 10) * urgencyScore * confidenceScore
  return Math.min(Math.max(Math.round(rawScore * 10), 1), 10)
}

async function saveSuggestionsToDatabase(
  supabase: any,
  suggestions: (GeneratedSuggestion & { recipient_user_id: string, source_user_id: string })[],
  relationshipId: string
): Promise<any[]> {
  
  if (suggestions.length === 0) return []

  const suggestionInserts: PartnerSuggestionInsert[] = suggestions.map(s => ({
    relationship_id: relationshipId,
    recipient_user_id: s.recipient_user_id,
    source_user_id: s.source_user_id,
    suggestion_type: s.suggestion_type,
    suggestion_text: s.suggestion_text,
    anonymized_context: s.anonymized_context,
    priority_score: s.priority_score,
    confidence_score: s.confidence_score
  }))

  console.log(`💾 Saving ${suggestionInserts.length} suggestions to database...`)

  const { data: savedSuggestions, error } = await supabase
    .from('partner_suggestions')
    .insert(suggestionInserts)
    .select('*')

  if (error) {
    console.error('❌ Failed to save suggestions:', error)
    throw new Error(`Failed to save suggestions: ${error.message}`)
  }

  console.log(`✅ Successfully saved ${savedSuggestions?.length || 0} suggestions`)
  return savedSuggestions || []
}

// Manual trigger endpoint for testing
export async function GET(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url)
  const relationshipId = url.searchParams.get('relationshipId')
  
  if (!relationshipId) {
    return NextResponse.json({ 
      error: 'Missing relationshipId parameter' 
    }, { status: 400 })
  }

  // Trigger suggestion generation for testing
  return POST(new NextRequest(request.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ relationshipId })
  }))
}