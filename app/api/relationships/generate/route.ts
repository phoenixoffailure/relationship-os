// app/api/relationships/generate/route.ts
// FIXED VERSION - TypeScript safe with better data access

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

    console.log(`🤖 Starting ENHANCED AI suggestion generation for relationship: ${relationshipId}`)

    // Step 1: Get relationship context
    const relationshipContext = await getRelationshipContext(supabase, relationshipId)
    if (!relationshipContext.isValid) {
      return NextResponse.json({ 
        error: 'Invalid relationship context',
        details: 'Relationship not found or has no active members'
      }, { status: 400 })
    }

    // Step 2: Get recent journal entries for analysis
    const recentJournalEntries = await getRecentJournalEntries(
      supabase, 
      relationshipContext.partners, 
      timeframeHours
    )

    console.log(`📖 Found journal entries: { totalEntries: ${recentJournalEntries.length}, entriesWithContent: ${recentJournalEntries.filter(e => e.content && e.content.length > 20).length} }`)

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

      console.log(`🤖 Generating ENHANCED AI suggestions for ${partner.user_name} based on ${journalEntriesFromOthers.length} journal entries`)

      // Get both profiles for enhanced suggestion generation
      const recipientProfile = relationshipContext.partnerProfiles.find(p => p.user_id === partner.user_id)
      const journalWriterProfile = relationshipContext.partnerProfiles.find(p => 
        p.user_id === journalEntriesFromOthers[0].user_id
      )

      // Generate personalized suggestions using ENHANCED xAI Grok API
      const suggestions = await generateEnhancedAISuggestions(
        journalEntriesFromOthers,
        partner,
        recipientProfile,
        journalWriterProfile,
        maxSuggestions
      )

      allGeneratedSuggestions.push(...suggestions.map(s => ({
        ...s,
        recipient_user_id: partner.user_id,
        source_user_id: journalEntriesFromOthers[0].user_id
      })))
    }

    console.log(`✨ Generated ${allGeneratedSuggestions.length} ENHANCED AI-powered suggestions`)

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
      message: `Generated and saved ${allGeneratedSuggestions.length} ENHANCED AI-powered suggestions`,
      debug: {
        savedToDatabase: savedSuggestions.length,
        suggestionsGenerated: allGeneratedSuggestions.length,
        partnersFound: relationshipContext.partners.length,
        journalEntriesAnalyzed: recentJournalEntries.length
      }
    })

  } catch (error) {
    console.error('❌ ENHANCED AI suggestion generation error:', error)
    
    return NextResponse.json({ 
      error: 'ENHANCED AI suggestion generation failed',
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
    .limit(20)

  if (error) {
    console.error('❌ Error fetching journal entries:', error)
    return []
  }

  return journalEntries || []
}

// FIXED: TypeScript safe version with better data access
async function generateEnhancedAISuggestions(
  journalEntries: any[],
  recipient: any, 
  recipientProfile: PartnerProfile | undefined,
  journalWriterProfile: PartnerProfile | undefined,
  maxSuggestions: number
): Promise<GeneratedSuggestion[]> {

  const journalContent = journalEntries
    .map(entry => `Entry from ${entry.created_at.split('T')[0]}: ${entry.content}`)
    .join('\n\n')

  // Get love language preferences (existing logic preserved)
  let recipientGivesLove: string[] = ['acts_of_service']
  if (recipientProfile) {
    if (recipientProfile.ai_profile_data?.love_language_profile?.partnerGuidance && 
        Array.isArray(recipientProfile.ai_profile_data.love_language_profile.partnerGuidance)) {
      recipientGivesLove = recipientProfile.ai_profile_data.love_language_profile.partnerGuidance
    }
    else if (recipientProfile.love_language_ranking && 
             Array.isArray(recipientProfile.love_language_ranking) && 
             recipientProfile.love_language_ranking.length > 0) {
      recipientGivesLove = recipientProfile.love_language_ranking
    }
  }
  
  const recipientCommunicationStyle = recipientProfile?.communication_style || 'thoughtful'
  
  let writerReceivesLove: string[] = ['quality_time']
  if (journalWriterProfile) {
    if (journalWriterProfile.love_language_ranking && 
        Array.isArray(journalWriterProfile.love_language_ranking) && 
        journalWriterProfile.love_language_ranking.length > 0) {
      writerReceivesLove = journalWriterProfile.love_language_ranking
    }
  }

  // ENHANCED: Show exactly what we found
  console.log(`🔍 FIXED DEBUG: Recipient ${recipient.user_name} gives love via: ${recipientGivesLove.join(', ')}`)
  console.log(`🔍 FIXED DEBUG: Writer receives love via: ${writerReceivesLove.join(', ')}`)
  console.log(`🔍 FIXED DEBUG: Recipient profile exists: ${!!recipientProfile}`)
  console.log(`🔍 FIXED DEBUG: Writer profile exists: ${!!journalWriterProfile}`)
  
  if (recipientProfile) {
    console.log(`🔍 FIXED DEBUG: Recipient love_language_ranking from DB:`, recipientProfile.love_language_ranking)
    console.log(`🔍 FIXED DEBUG: Recipient ai_profile_data keys:`, Object.keys(recipientProfile.ai_profile_data || {}))
  }
  
  if (journalWriterProfile) {
    console.log(`🔍 FIXED DEBUG: Writer love_language_ranking from DB:`, journalWriterProfile.love_language_ranking)  
    console.log(`🔍 FIXED DEBUG: Writer ai_profile_data keys:`, Object.keys(journalWriterProfile.ai_profile_data || {}))
  }
  
const enhancedPrompt = `You're a caring friend who wants to help ${recipient.user_name} support their partner better. Based on what their partner has been going through lately, suggest thoughtful ways they can show love and support.

    Here's what you know about ${recipient.user_name}:
    - They naturally show love through: ${recipientGivesLove.join(', ')}
    - Their communication style: ${recipientCommunicationStyle}
    - They really care about their partner and want to help

    What their partner has been experiencing lately (PRIVATE - don't reference directly):
    ${journalContent}

    Their partner tends to feel most loved through: ${writerReceivesLove.join(', ')}

    SPEAKING STYLE - Talk like a caring friend who:
    ✅ Says "It might help to..." instead of "Analysis suggests..."
    ✅ Says "I notice they seem..." instead of "Data indicates..."  
    ✅ Offers practical, doable suggestions
    ✅ Validates how much they care about their partner
    ✅ Uses warm, conversational language

    ❌ NEVER say things like:
    - "Based on psychological analysis..."
    - "Optimize relationship parameters..."
    - "Implement intervention strategies..."
    - "Clinical assessment indicates..."
    - "Four-pillar framework analysis..."

    SUGGESTION GUIDELINES:
    - Reference the partner's needs WITHOUT revealing journal content
    - Bridge how ${recipient.user_name} naturally gives love with how their partner receives it
    - Make suggestions feel natural and caring, not clinical
    - Focus on specific, actionable ideas they can try today
    - Sound like advice from a good friend who really cares

    Generate ${maxSuggestions} warm, caring suggestions that would help ${recipient.user_name} support their partner right now.

    Return ONLY a valid JSON array:
    [
      {
        "suggestion_type": "${writerReceivesLove[0]}",
        "suggestion_text": "Specific, caring suggestion that feels like advice from a good friend",
        "anonymized_context": "Why this would help right now (warm explanation, no clinical language)",
        "priority_score": 8,
        "confidence_score": 0.8,
        "source_need_intensity": 7
      }
    ]`;
  try {
    if (!process.env.XAI_API_KEY) {
      console.log('⚠️ No XAI_API_KEY found, using enhanced rule-based fallback')
      return generateEnhancedRuleBasedSuggestions(
        journalEntries, 
        recipient, 
        recipientGivesLove,
        writerReceivesLove,
        maxSuggestions
      )
    }

    console.log('🤖 Calling xAI Grok API for CORRECTED suggestion generation...')
    
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
            content: 'You are a warm, caring friend who wants to help someone support their partner better. You offer practical, loving suggestions while respecting privacy. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: enhancedPrompt
          }
        ],
        model: 'grok-4',
        temperature: 0.7,
        max_tokens: 1200
      })
    })

    if (!response.ok) {
      console.error(`❌ xAI API HTTP error: ${response.status} ${response.statusText}`)
      throw new Error(`xAI API error: ${response.statusText}`)
    }

    const data = await response.json()
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      console.error('❌ xAI API returned malformed response:', data)
      throw new Error('xAI API returned malformed response')
    }

    const rawContent = data.choices[0].message.content.trim()
    console.log('🔍 Raw AI response:', rawContent.substring(0, 200) + '...')

    let cleanContent = rawContent
    cleanContent = cleanContent.replace(/```json\s*/g, '').replace(/```\s*/g, '')
    
    const jsonMatch = cleanContent.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      cleanContent = jsonMatch[0]
    }

    let aiSuggestions
    try {
      aiSuggestions = JSON.parse(cleanContent)
    } catch (parseError) {
      console.error('❌ JSON parse error. Raw content:', rawContent)
      throw new Error(`JSON parse failed: ${parseError}`)
    }

    if (!Array.isArray(aiSuggestions)) {
      console.error('❌ AI response is not an array:', aiSuggestions)
      throw new Error('AI response is not an array')
    }

    const validSuggestions = aiSuggestions.filter(s => 
      s.suggestion_type && 
      s.suggestion_text && 
      s.anonymized_context &&
      typeof s.priority_score === 'number' &&
      typeof s.confidence_score === 'number'
    )

    if (validSuggestions.length === 0) {
      console.error('❌ No valid suggestions in AI response:', aiSuggestions)
      throw new Error('No valid suggestions generated')
    }

    console.log(`✅ Generated ${validSuggestions.length} CORRECTED AI suggestions with proper love language bridging`)
    return validSuggestions

  } catch (error) {
    console.error('❌ xAI API error, falling back to enhanced rule-based suggestions:', error)
    return generateEnhancedRuleBasedSuggestions(
      journalEntries, 
      recipient, 
      recipientGivesLove,
      writerReceivesLove,
      maxSuggestions
    )
  }
}

// FIXED: TypeScript safe rule-based fallback
function generateEnhancedRuleBasedSuggestions(
  journalEntries: JournalEntry[],
  recipient: RelationshipMember,
  recipientGivesLove: string[],
  writerReceivesLove: string[],
  maxSuggestions: number
): GeneratedSuggestion[] {
  
  const allContent = journalEntries.map(e => e.content.toLowerCase()).join(' ')
  const suggestions: GeneratedSuggestion[] = []
  
  const primaryGive = recipientGivesLove[0] || 'acts_of_service'
  const primaryReceive = writerReceivesLove[0] || 'quality_time'

  console.log(`🔍 RULE-BASED: ${recipient.user_name} gives via ${primaryGive}, writer receives via ${primaryReceive}`)

  if (allContent.includes('tired') || allContent.includes('stressed') || allContent.includes('overwhelmed')) {
    
    if (primaryReceive === 'quality_time' && primaryGive === 'acts_of_service') {
      suggestions.push({
        suggestion_type: 'quality_time',
        suggestion_text: 'Handle their daily responsibilities so you can spend some focused, uninterrupted time together. Say: "Let me take care of these tasks so we can just relax together."',
        anonymized_context: 'They need quality time support, delivered through your service-oriented approach',
        priority_score: 9,
        confidence_score: 0.9,
        source_need_intensity: 8
      })
    } else if (primaryReceive === 'words_of_affirmation' && primaryGive === 'acts_of_service') {
      suggestions.push({
        suggestion_type: 'words_of_affirmation',
        suggestion_text: 'Express specific appreciation while helping: "I can see how hard you\'re working, and I want you to know how much I admire your dedication. Let me help with this."',
        anonymized_context: 'They need verbal encouragement, which you can give while being helpful',
        priority_score: 9,
        confidence_score: 0.9,
        source_need_intensity: 8
      })
    } else {
      suggestions.push({
        suggestion_type: primaryReceive,
        suggestion_text: `Your partner is stressed and would benefit from ${primaryReceive.replace('_', ' ')}. Consider offering support in this specific way since it matches how they best receive care.`,
        anonymized_context: `They need ${primaryReceive.replace('_', ' ')} support right now`,
        priority_score: 8,
        confidence_score: 0.8,
        source_need_intensity: 7
      })
    }
  }

  if (allContent.includes('miss') || allContent.includes('time together') || allContent.includes('connect')) {
    
    if (primaryReceive === 'quality_time') {
      suggestions.push({
        suggestion_type: 'quality_time',
        suggestion_text: 'Plan some dedicated one-on-one time together doing something you both enjoy, with phones away and full attention on each other.',
        anonymized_context: 'They\'re craving connection and quality time is their primary love language',
        priority_score: 10,
        confidence_score: 0.95,
        source_need_intensity: 9
      })
    } else if (primaryReceive === 'physical_touch') {
      suggestions.push({
        suggestion_type: 'physical_touch',
        suggestion_text: 'Suggest spending time together with intentional physical closeness - maybe cuddling while watching something, giving a massage, or simply holding hands during conversation.',
        anonymized_context: 'They\'re missing connection and respond best to physical expressions of love',
        priority_score: 9,
        confidence_score: 0.9,
        source_need_intensity: 8
      })
    }
  }

  if (allContent.includes('appreciate') || allContent.includes('grateful') || allContent.includes('thank')) {
    
    if (primaryReceive === 'words_of_affirmation') {
      suggestions.push({
        suggestion_type: 'words_of_affirmation',
        suggestion_text: 'Express specific, heartfelt appreciation for something meaningful they\'ve done recently. Be detailed about how their actions impacted you positively.',
        anonymized_context: 'They\'re in an appreciative mood and words of affirmation are their primary way of feeling loved',
        priority_score: 9,
        confidence_score: 0.9,
        source_need_intensity: 7
      })
    } else if (primaryReceive === 'receiving_gifts' && primaryGive === 'quality_time') {
      suggestions.push({
        suggestion_type: 'receiving_gifts',
        suggestion_text: 'Consider giving them a small, thoughtful gift that shows you\'ve been paying attention to their interests, and present it during focused time together.',
        anonymized_context: 'Bridges their appreciation for thoughtful gifts with your preference for spending quality time',
        priority_score: 8,
        confidence_score: 0.8,
        source_need_intensity: 6
      })
    }
  }

  return suggestions.slice(0, maxSuggestions)
}

// Helper function: Get relationship context with partner profiles
async function getRelationshipContext(supabase: any, relationshipId: string): Promise<RelationshipContext> {
  try {
    // Get relationship members (unchanged)
    const { data: members, error: membersError } = await supabase
      .from('relationship_members')
      .select(`
        user_id,
        role,
        users (
          full_name,
          email
        )
      `)
      .eq('relationship_id', relationshipId)

    if (membersError || !members || members.length === 0) {
      console.error('❌ Error fetching relationship members:', membersError)
      return { isValid: false, partners: [], partnerProfiles: [] }
    }

    const partners: RelationshipMember[] = members.map((member: any) => ({
      user_id: member.user_id,
      user_name: member.users?.full_name || member.users?.email || 'Unknown',
      role: member.role || null
    }))

    // ✅ FIXED: Read from v2.0 tables instead of old table
    const userIds = partners.map(p => p.user_id)
    
    // Get universal profiles (FIRO + Attachment + Communication)
    const { data: universalProfiles, error: universalError } = await supabase
      .from('universal_user_profiles')
      .select(`
        user_id,
        inclusion_need,
        control_need, 
        affection_need,
        attachment_style,
        communication_directness,
        communication_assertiveness
      `)
      .in('user_id', userIds)

    // Get relationship profiles  
    const { data: relationshipProfiles, error: relationshipError } = await supabase
      .from('relationship_profiles')
      .select(`
        user_id,
        perceived_closeness,
        preferred_interaction_style
      `)
      .in('user_id', userIds)

    if (universalError) {
      console.error('❌ Error fetching universal profiles:', universalError)
    }
    if (relationshipError) {
      console.error('❌ Error fetching relationship profiles:', relationshipError)
    }

    // Combine v2.0 data into partner profiles
    const partnerProfiles: PartnerProfile[] = partners.map(partner => {
      const universalProfile = universalProfiles?.find((p: any) => p.user_id === partner.user_id)
      const relationshipProfile = relationshipProfiles?.find((p: any) => p.user_id === partner.user_id)
      
      // Derive love language from FIRO needs
      const loveLanguages = []
      if (universalProfile?.inclusion_need >= 7) {
        loveLanguages.push('words_of_affirmation', 'quality_time')
      }
      if (universalProfile?.affection_need >= 7) {
        loveLanguages.push('physical_touch')
      }
      if (universalProfile?.control_need >= 7) {
        loveLanguages.push('acts_of_service')
      }
      if (loveLanguages.length === 0) {
        loveLanguages.push('quality_time', 'words_of_affirmation')
      }
      
      return {
        user_id: partner.user_id,
        ai_profile_data: {
          firo_needs: {
            inclusion: universalProfile?.inclusion_need || 5,
            control: universalProfile?.control_need || 5, 
            affection: universalProfile?.affection_need || 5
          },
          attachment_style: universalProfile?.attachment_style || 'secure',
          communication_style: {
            directness: universalProfile?.communication_directness || 'moderate',
            assertiveness: universalProfile?.communication_assertiveness || 'moderate'
          }
        },
        love_language_ranking: [...new Set(loveLanguages)],
        communication_style: `${universalProfile?.communication_directness || 'moderate'}_${universalProfile?.communication_assertiveness || 'moderate'}`
      }
    })

    console.log(`✅ v2.0 relationship context: ${partners.length} members, ${partnerProfiles.length} profiles from universal_user_profiles`)
    
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
    confidence_score: Math.round(s.confidence_score * 10),
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    validation_passed: true,
    created_at: new Date().toISOString()
  }))

  console.log(`💾 Saving ${suggestionInserts.length} ENHANCED AI-generated suggestions to database...`)

  const { data: savedSuggestions, error } = await supabase
    .from('partner_suggestions')
    .insert(suggestionInserts)
    .select('*')

  if (error) {
    console.error('❌ Failed to save suggestions:', error)
    throw new Error(`Failed to save suggestions: ${error.message}`)
  }

  console.log(`✅ Successfully saved ${savedSuggestions?.length || 0} ENHANCED AI-generated suggestions`)
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

  return POST(new NextRequest(request.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ relationshipId })
  }))
}