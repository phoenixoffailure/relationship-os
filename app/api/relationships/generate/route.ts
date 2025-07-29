// app/api/relationships/generate/route.ts
// ENHANCED VERSION - Real xAI Grok API Integration

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Type definitions
interface GenerateSuggestionsRequest {
  relationshipId: string
  sourceUserId?: string
  timeframeHours?: number
  maxSuggestions?: number
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

interface GeneratedSuggestion {
  suggestion_type: string
  suggestion_text: string
  anonymized_context: string
  priority_score: number
  confidence_score: number
  source_need_intensity: number
}

interface JournalEntry {
  id: string
  user_id: string
  content: string
  mood_score: number | null
  created_at: string
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { 
      relationshipId, 
      sourceUserId, 
      timeframeHours = 72, 
      maxSuggestions = 3 
    } = body as GenerateSuggestionsRequest

    if (!relationshipId) {
      return NextResponse.json({ 
        error: 'Missing relationshipId' 
      }, { status: 400 })
    }

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(relationshipId)) {
      console.log('❌ Invalid UUID format:', relationshipId)
      return NextResponse.json({ 
        error: 'Invalid relationshipId format. Must be a valid UUID.' 
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

    console.log('🎯 Starting AI-powered suggestion generation for relationship:', relationshipId)

    // Step 1: Get relationship context and partners
    const relationshipContext = await getRelationshipContext(supabase, relationshipId)
    
    if (!relationshipContext.isValid) {
      return NextResponse.json({ 
        error: 'Invalid relationship or insufficient members',
        debug: {
          partnersFound: relationshipContext.partners.length,
          relationshipId: relationshipId
        }
      }, { status: 400 })
    }

    console.log('👥 Relationship context:', {
      members: relationshipContext.partners.length,
      hasProfiles: relationshipContext.partnerProfiles.length
    })

    // Step 2: Get recent journal entries for analysis
    const recentJournalEntries = await getRecentJournalEntries(
      supabase, 
      relationshipContext.partners, 
      timeframeHours
    )

    console.log('📖 Found journal entries:', {
      totalEntries: recentJournalEntries.length,
      entriesWithContent: recentJournalEntries.filter(e => e.content.length > 20).length
    })

    // Step 3: Generate AI-powered suggestions for each partner
    const allGeneratedSuggestions: (GeneratedSuggestion & { 
      recipient_user_id: string
      source_user_id: string 
    })[] = []

    for (const partner of relationshipContext.partners) {
      // Find journal entries from OTHER partners (not this recipient)
      const journalEntriesFromOthers = recentJournalEntries.filter(
        entry => entry.user_id !== partner.user_id
      )

      if (journalEntriesFromOthers.length === 0) {
        console.log(`ℹ️ No journal entries from other partners for ${partner.user_name}`)
        continue
      }

      console.log(`🤖 Generating AI suggestions for ${partner.user_name} based on ${journalEntriesFromOthers.length} journal entries`)

      // Get partner's profile for personalization
      const partnerProfile = relationshipContext.partnerProfiles.find(p => p.user_id === partner.user_id)

      // Generate personalized suggestions using xAI Grok API
      const suggestions = await generateAISuggestions(
        journalEntriesFromOthers,
        partner,
        partnerProfile,
        maxSuggestions
      )

      allGeneratedSuggestions.push(...suggestions.map(s => ({
        ...s,
        recipient_user_id: partner.user_id,
        source_user_id: journalEntriesFromOthers[0].user_id // Primary source
      })))
    }

    console.log(`✨ Generated ${allGeneratedSuggestions.length} AI-powered suggestions`)

    // Step 4: Save suggestions to database
    const savedSuggestions = await saveSuggestionsToDatabase(
      supabase,
      allGeneratedSuggestions,
      relationshipId
    )

    console.log(`💾 Saved ${savedSuggestions.length} suggestions to database`)

    return NextResponse.json({
      success: true,
      result: {
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
          entries_analyzed: recentJournalEntries.length,
          needs_found: allGeneratedSuggestions.length,
          suggestions_generated: allGeneratedSuggestions.length,
          confidence_threshold_met: allGeneratedSuggestions.filter(s => s.confidence_score >= 0.7).length
        }
      },
      message: `Generated and saved ${allGeneratedSuggestions.length} AI-powered suggestions`,
      debug: {
        savedToDatabase: savedSuggestions.length,
        suggestionsGenerated: allGeneratedSuggestions.length,
        partnersFound: relationshipContext.partners.length,
        journalEntriesAnalyzed: recentJournalEntries.length
      }
    })

  } catch (error) {
    console.error('❌ AI suggestion generation error:', error)
    
    return NextResponse.json({ 
      error: 'AI suggestion generation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Helper function: Get recent journal entries for analysis
async function getRecentJournalEntries(
  supabase: any,
  partners: RelationshipMember[],
  timeframeHours: number
): Promise<JournalEntry[]> {
  
  const cutoffDate = new Date(Date.now() - timeframeHours * 60 * 60 * 1000)
  const userIds = partners.map(p => p.user_id)

  const { data: journalEntries, error } = await supabase
    .from('journal_entries')
    .select('id, user_id, content, mood_score, created_at')
    .in('user_id', userIds)
    .gte('created_at', cutoffDate.toISOString())
    .order('created_at', { ascending: false })
    .limit(20) // Reasonable limit for analysis

  if (error) {
    console.error('❌ Error fetching journal entries:', error)
    return []
  }

  return journalEntries || []
}

// Helper function: Generate AI-powered suggestions using xAI Grok API
async function generateAISuggestions(
  journalEntries: JournalEntry[],
  recipient: RelationshipMember,
  recipientProfile: PartnerProfile | undefined,
  maxSuggestions: number
): Promise<GeneratedSuggestion[]> {

  // Combine journal entries for analysis
  const journalContent = journalEntries
    .map(entry => `Entry from ${entry.created_at.split('T')[0]}: ${entry.content}`)
    .join('\n\n')

  // Get recipient's preferences from profile
  const loveLanguages = recipientProfile?.love_language_ranking?.join(', ') || 'unknown'
  const communicationStyle = recipientProfile?.communication_style || 'unknown'
  
  const prompt = `You are an expert relationship coach analyzing private journal entries to generate actionable suggestions for a partner. Your goal is to help them support their partner's needs without revealing the private journal content.

PRIVATE JOURNAL CONTENT (DO NOT REVEAL DIRECTLY):
${journalContent}

RECIPIENT CONTEXT:
- Name: ${recipient.user_name}
- Preferred Love Languages: ${loveLanguages}
- Communication Style: ${communicationStyle}

TASK: Generate ${maxSuggestions} specific, actionable suggestions for ${recipient.user_name} that would help them support their partner based on the patterns and needs you detect in the journal entries.

REQUIREMENTS:
1. DO NOT quote or reference the journal content directly
2. Focus on actionable behaviors and gestures
3. Consider the recipient's love language preferences
4. Make suggestions feel natural and non-demanding
5. Ensure suggestions are specific and practical
6. Maintain complete privacy of the journal content

Return ONLY a JSON array with exactly this structure:
[
  {
    "suggestion_type": "quality_time|words_of_affirmation|physical_touch|acts_of_service|receiving_gifts|emotional_support|communication|stress_support",
    "suggestion_text": "Specific actionable suggestion (2-3 sentences max)",
    "anonymized_context": "Brief explanation of why this would be helpful (without revealing journal content)",
    "priority_score": 1-10,
    "confidence_score": 0.1-1.0,
    "source_need_intensity": 1-10
  }
]`

  try {
    if (!process.env.XAI_API_KEY) {
      console.log('⚠️ No XAI_API_KEY found, using rule-based fallback')
      return generateRuleBasedSuggestions(journalEntries, recipient, maxSuggestions)
    }

    console.log('🤖 Calling xAI Grok API for suggestion generation...')
    
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: 'You are a professional relationship coach specializing in partner support strategies. Always respond with valid JSON only. Focus on actionable, practical suggestions that protect privacy while helping partners connect.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        model: 'grok-4',
        temperature: 0.7,
        max_tokens: 1000
      })
    })

    if (!response.ok) {
      throw new Error(`xAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    const aiSuggestions = JSON.parse(data.choices[0].message.content)

    console.log(`✅ Generated ${aiSuggestions.length} AI suggestions`)
    return aiSuggestions

  } catch (error) {
    console.error('❌ xAI API error, falling back to rule-based suggestions:', error)
    return generateRuleBasedSuggestions(journalEntries, recipient, maxSuggestions)
  }
}

// Fallback rule-based suggestion generation
function generateRuleBasedSuggestions(
  journalEntries: JournalEntry[],
  recipient: RelationshipMember,
  maxSuggestions: number
): GeneratedSuggestion[] {
  
  const allContent = journalEntries.map(e => e.content.toLowerCase()).join(' ')
  const suggestions: GeneratedSuggestion[] = []

  // Analyze content for common patterns
  if (allContent.includes('tired') || allContent.includes('stressed') || allContent.includes('overwhelmed')) {
    suggestions.push({
      suggestion_type: 'acts_of_service',
      suggestion_text: 'Consider offering to help with daily tasks or household responsibilities to give your partner some breathing room.',
      anonymized_context: 'Your partner might benefit from some practical support right now',
      priority_score: 8,
      confidence_score: 0.8,
      source_need_intensity: 7
    })
  }

  if (allContent.includes('miss') || allContent.includes('time together') || allContent.includes('connect')) {
    suggestions.push({
      suggestion_type: 'quality_time',
      suggestion_text: 'Plan some dedicated one-on-one time together without distractions - perhaps a walk, shared meal, or activity you both enjoy.',
      anonymized_context: 'Quality time and connection would strengthen your bond right now',
      priority_score: 9,
      confidence_score: 0.9,
      source_need_intensity: 8
    })
  }

  if (allContent.includes('appreciate') || allContent.includes('grateful') || allContent.includes('thank')) {
    suggestions.push({
      suggestion_type: 'words_of_affirmation',
      suggestion_text: 'Express specific appreciation for something your partner has done recently that made a difference in your life.',
      anonymized_context: 'Your partner values recognition and verbal appreciation',
      priority_score: 7,
      confidence_score: 0.7,
      source_need_intensity: 6
    })
  }

  if (allContent.includes('physical') || allContent.includes('hug') || allContent.includes('touch')) {
    suggestions.push({
      suggestion_type: 'physical_touch',
      suggestion_text: 'Offer more physical affection through hugs, gentle touches, or cuddling during relaxing moments together.',
      anonymized_context: 'Physical connection and affection would be meaningful to your partner',
      priority_score: 8,
      confidence_score: 0.8,
      source_need_intensity: 7
    })
  }

  // Default suggestion if no patterns detected
  if (suggestions.length === 0) {
    suggestions.push({
      suggestion_type: 'communication',
      suggestion_text: 'Check in with your partner about how they\'re feeling and ask if there\'s any way you can support them today.',
      anonymized_context: 'Open communication strengthens your relationship foundation',
      priority_score: 6,
      confidence_score: 0.6,
      source_need_intensity: 5
    })
  }

  return suggestions.slice(0, maxSuggestions)
}

// Helper function: Get relationship context
async function getRelationshipContext(supabase: any, relationshipId: string): Promise<RelationshipContext> {
  console.log('🔍 Getting relationship context for:', relationshipId)

  try {
    // Get relationship members with user data
    const { data: members, error: membersError } = await supabase
      .from('relationship_members')
      .select(`
        user_id,
        role,
        users (
          id,
          email,
          full_name
        )
      `)
      .eq('relationship_id', relationshipId)

    if (membersError) {
      console.error('❌ Error fetching relationship members:', membersError)
      return { isValid: false, partners: [], partnerProfiles: [] }
    }

    if (!members || members.length < 2) {
      console.log(`❌ Insufficient relationship members: ${members?.length || 0}`)
      return { isValid: false, partners: [], partnerProfiles: [] }
    }

    // Build partners array
    const partners: RelationshipMember[] = members.map((member: any) => ({
      user_id: member.user_id,
      user_name: member.users?.full_name || member.users?.email || `User ${member.user_id.substring(0, 8)}`,
      role: member.role
    }))

    // Get partner profiles
    const userIds = partners.map(p => p.user_id)
    const { data: profiles } = await supabase
      .from('enhanced_onboarding_responses')
      .select('user_id, responses')
      .in('user_id', userIds)

    const partnerProfiles: PartnerProfile[] = (profiles || []).map((profile: any) => ({
      user_id: profile.user_id,
      ai_profile_data: profile.responses,
      love_language_ranking: profile.responses?.loveLanguageReceive || [],
      communication_style: profile.responses?.communicationStyle || 'unknown'
    }))

    console.log(`✅ Valid relationship context: ${partners.length} members, ${partnerProfiles.length} profiles`)

    return {
      isValid: true,
      partners,
      partnerProfiles
    }

  } catch (error) {
    console.error('❌ Error in getRelationshipContext:', error)
    return { isValid: false, partners: [], partnerProfiles: [] }
  }
}

// Helper function: Save suggestions to database
async function saveSuggestionsToDatabase(
  supabase: any,
  suggestions: (GeneratedSuggestion & { recipient_user_id: string, source_user_id: string })[],
  relationshipId: string
): Promise<any[]> {
  
  if (suggestions.length === 0) return []

  const suggestionInserts = suggestions.map(s => ({
    relationship_id: relationshipId,
    recipient_user_id: s.recipient_user_id,
    source_user_id: s.source_user_id,
    suggestion_type: s.suggestion_type,
    suggestion_text: s.suggestion_text,
    anonymized_context: s.anonymized_context,
    priority_score: s.priority_score,
    confidence_score: Math.round(s.confidence_score * 10), // Convert to integer
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
    validation_passed: true,
    created_at: new Date().toISOString()
  }))

  console.log(`💾 Saving ${suggestionInserts.length} AI-generated suggestions to database...`)

  const { data: savedSuggestions, error } = await supabase
    .from('partner_suggestions')
    .insert(suggestionInserts)
    .select('*')

  if (error) {
    console.error('❌ Failed to save suggestions:', error)
    throw new Error(`Failed to save suggestions: ${error.message}`)
  }

  console.log(`✅ Successfully saved ${savedSuggestions?.length || 0} AI-generated suggestions`)
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