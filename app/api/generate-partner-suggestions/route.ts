// app/api/generate-partner-suggestions/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { generateValidatedPartnerSuggestion } from '@/lib/quality-validation'

// Type definitions for AI suggestions
interface PartnerSuggestion {
  type: string
  text: string
  context: string
  priority: number
  confidence: number
  quality_metrics?: any
}

interface PersonalInsight {
  priority: string
  title: string
  insight: string
  category: string
  actionableSteps: string[]
}

export async function POST(request: NextRequest) {
  try {
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
    
    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { userId, lookbackDays = 7 } = await request.json()
    const targetUserId = userId || user.id

    console.log('🤖 Starting comprehensive AI coaching generation for user:', targetUserId)

    // 1. Gather all user data for analysis
    const userData = await gatherUserData(supabase, targetUserId, lookbackDays)
    console.log('📊 Gathered user data:', {
      journalEntries: userData.journalEntries.length,
      checkins: userData.checkins.length,
      relationships: userData.relationships.length,
      hasOnboarding: !!userData.onboardingData
    })

    // 2. Generate personal insights for the user
    const personalInsights = await generatePersonalInsights(userData)
    console.log('💭 Generated personal insights:', personalInsights.length)

    // 3. Generate partner suggestions for each relationship
    const partnerSuggestions = await generatePartnerSuggestions(userData, supabase)
    console.log('💕 Generated partner suggestions:', partnerSuggestions.length)

    // 4. Save personal insights to database
    const savedInsights = await savePersonalInsights(supabase, targetUserId, personalInsights)

    // 5. Save partner suggestions to database
    const savedSuggestions = await savePartnerSuggestions(supabase, partnerSuggestions)

    return NextResponse.json({
      success: true,
      personalInsights: savedInsights,
      partnerSuggestions: savedSuggestions,
      summary: {
        personalInsightsGenerated: personalInsights.length,
        partnerSuggestionsGenerated: partnerSuggestions.length,
        relationshipsAnalyzed: userData.relationships.length,
        dataPointsProcessed: userData.journalEntries.length + userData.checkins.length
      }
    })

  } catch (error) {
    console.error('❌ Partner suggestions generation error:', error)
    return NextResponse.json({ 
      error: 'Suggestion generation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Gather comprehensive user data for AI analysis
async function gatherUserData(supabase: any, userId: string, lookbackDays: number) {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - lookbackDays)

  // Get journal entries
  const { data: journalEntries } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', cutoffDate.toISOString())
    .order('created_at', { ascending: false })

  // Get daily check-ins
  const { data: checkins } = await supabase
    .from('daily_checkins')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', cutoffDate.toISOString())
    .order('created_at', { ascending: false })

  // Get relationships and partners
  const { data: relationships } = await supabase
    .from('relationship_members')
    .select(`
      relationship_id,
      role,
      relationships (
        id,
        name,
        relationship_type,
        created_at
      ),
      partner:relationship_members!relationship_id (
        user_id,
        role,
        users (
          id,
          full_name,
          email
        )
      )
    `)
    .eq('user_id', userId)

  // Get onboarding data
  const { data: onboardingData } = await supabase
    .from('enhanced_onboarding_responses')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  return {
    userId,
    journalEntries: journalEntries || [],
    checkins: checkins || [],
    relationships: relationships || [],
    onboardingData: onboardingData || null,
    lookbackDays
  }
}

// Generate personal insights for individual growth
async function generatePersonalInsights(userData: any) {
  const insights = []

  // Analyze journal patterns for personal growth
  if (userData.journalEntries.length > 0) {
    const journalInsights = await analyzeJournalForPersonalGrowth(userData)
    insights.push(...journalInsights)
  }

  // Analyze check-in patterns for relationship awareness
  if (userData.checkins.length > 0) {
    const checkinInsights = await analyzeCheckinsForPersonalGrowth(userData)
    insights.push(...checkinInsights)
  }

  // Generate relationship skills insights
  const skillsInsights = await generateRelationshipSkillsInsights(userData)
  insights.push(...skillsInsights)

  return insights
}

// Analyze journal entries for personal growth opportunities
async function analyzeJournalForPersonalGrowth(userData: any) {
  const insights = []
  const recentJournals = userData.journalEntries.slice(0, 5) // Last 5 entries

  for (const entry of recentJournals) {
    const analysis = await analyzeJournalEntryForGrowth(entry, userData.onboardingData)
    if (analysis) {
      insights.push({
        type: 'personal_growth',
        priority: analysis.priority,
        title: analysis.title,
        description: analysis.insight,
        source_journal_id: entry.id,
        category: analysis.category,
        actionable_steps: analysis.actionableSteps
      })
    }
  }

  return insights
}

// AI-powered journal entry analysis for personal growth
async function analyzeJournalEntryForGrowth(journalEntry: any, onboardingData: any): Promise<PersonalInsight | null> {
  if (!process.env.XAI_API_KEY) {
    return generateRuleBasedPersonalInsight(journalEntry, onboardingData)
  }

  const prompt = `You are a compassionate relationship coach analyzing a journal entry to provide supportive personal insights. Your goal is to help the user process emotions constructively while maintaining a positive view of their relationship.

Journal Entry: "${journalEntry.content}"

User Context:
- Communication Style: ${onboardingData?.communication_style || 'unknown'}
- Love Languages: ${onboardingData?.love_language_ranking?.join(', ') || 'unknown'}
- Relationship Goals: ${onboardingData?.primary_goals?.join(', ') || 'unknown'}
- Conflict Style: ${onboardingData?.conflict_style || 'unknown'}

Generate a supportive personal insight that:
1. Validates their feelings without judgment
2. Offers constructive reframing or perspective
3. Provides actionable steps for personal growth
4. Maintains optimism about the relationship
5. Focuses on what THEY can control

Return JSON with this structure:
{
  "priority": "high|medium|low",
  "title": "Brief supportive title",
  "insight": "2-3 sentence insight that validates and guides",
  "category": "emotional_processing|communication|self_awareness|relationship_skills",
  "actionableSteps": ["step1", "step2", "step3"]
}`

  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'You are a compassionate relationship coach. Always respond with valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        model: 'grok-beta',
        temperature: 0.7
      })
    })

    const data = await response.json()
    return JSON.parse(data.choices[0].message.content)
  } catch (error) {
    console.error('❌ Grok API error for personal insight:', error)
    return generateRuleBasedPersonalInsight(journalEntry, onboardingData)
  }
}

// Generate partner suggestions from user data
async function generatePartnerSuggestions(userData: any, supabase: any) {
  const suggestions = []

  for (const relationship of userData.relationships) {
    // Find partner in this relationship
    const partner = relationship.partner?.find((p: any) => p.user_id !== userData.userId)
    if (!partner) continue

    // Generate suggestions for this partner based on user's recent data
    const relationshipSuggestions = await generateSuggestionsForPartner(
      userData,
      relationship,
      partner,
      supabase
    )
    suggestions.push(...relationshipSuggestions)
  }

  return suggestions
}

// Generate specific suggestions for a partner
async function generateSuggestionsForPartner(
  userData: any, 
  relationship: any, 
  partner: any, 
  supabase: any
): Promise<any[]> {
  const suggestions = []

  // Get past feedback for this partner
  const { data: pastFeedback } = await supabase
    .from('partner_suggestions')
    .select('rating, suggestion_type, feedback_text')
    .eq('recipient_user_id', partner.user_id)
    .eq('source_user_id', userData.userId)
    .not('rating', 'is', null)

  // Analyze recent journal entries with quality validation
  const recentJournals = userData.journalEntries.slice(0, 3)
  for (const entry of recentJournals) {
    const suggestion = await generatePartnerSuggestionFromJournal(
      entry,
      userData.onboardingData,
      relationship,
      partner,
      pastFeedback || [] // Pass feedback history
    )
    
    if (suggestion) {
      suggestions.push({
        relationship_id: relationship.relationships.id,
        recipient_user_id: partner.user_id,
        source_user_id: userData.userId,
        suggestion_type: suggestion.type,
        suggestion_text: suggestion.text,
        anonymized_context: suggestion.context,
        priority_score: suggestion.priority,
        confidence_score: suggestion.confidence,
        quality_metrics: suggestion.quality_metrics || null, // Store quality data
        validation_passed: true, // Mark as validated
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      })
    }
  }

  // Analyze check-ins for partner suggestions
  const recentCheckins = userData.checkins.slice(0, 3)
  for (const checkin of recentCheckins) {
    const suggestion = await generatePartnerSuggestionFromCheckin(
      checkin,
      userData.onboardingData,
      relationship,
      partner
    )
    if (suggestion) {
      suggestions.push({
        relationship_id: relationship.relationships.id,
        recipient_user_id: partner.user_id,
        source_user_id: userData.userId,
        suggestion_type: suggestion.type,
        suggestion_text: suggestion.text,
        anonymized_context: suggestion.context,
        priority_score: suggestion.priority,
        confidence_score: suggestion.confidence,
        expires_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) // 5 days
      })
    }
  }

  return suggestions
}

// AI-powered partner suggestion generation from journal
async function generatePartnerSuggestionFromJournal(
  journalEntry: any,
  onboardingData: any,
  relationship: any,
  partner: any,
  pastFeedback?: any[]
): Promise<PartnerSuggestion | null> {
  
  // Use the new validated generation function
  return await generateValidatedPartnerSuggestion(
    journalEntry,
    onboardingData,
    relationship,
    partner,
    pastFeedback
  )
}

// Fallback rule-based suggestion generation
function generateRuleBasedPartnerSuggestion(journalEntry: any, onboardingData: any): PartnerSuggestion | null {
  const content = journalEntry.content.toLowerCase()
  
  if (content.includes('tired') || content.includes('exhausted') || content.includes('overwhelmed')) {
    return {
      type: 'support',
      text: 'Consider offering to help with household tasks or suggesting they take some time to relax',
      context: 'Your partner might benefit from some extra support right now',
      priority: 8,
      confidence: 7
    }
  }
  
  if (content.includes('miss') || content.includes('time together') || content.includes('date')) {
    return {
      type: 'quality_time',
      text: 'Plan a special date night or quality time activity together',
      context: 'Connection and quality time would strengthen your relationship right now',
      priority: 9,
      confidence: 8
    }
  }
  
  return null
}

// Similar rule-based fallback for personal insights
function generateRuleBasedPersonalInsight(journalEntry: any, onboardingData: any): PersonalInsight | null {
  const content = journalEntry.content.toLowerCase()
  
  if (content.includes('frustrated') || content.includes('annoyed')) {
    return {
      priority: 'medium',
      title: 'Processing Frustration Constructively',
      insight: 'It\'s natural to feel frustrated sometimes. Consider what specific need isn\'t being met and how you might communicate it positively.',
      category: 'emotional_processing',
      actionableSteps: [
        'Take some time to identify the specific need behind the frustration',
        'Practice expressing this need using "I" statements',
        'Focus on solutions rather than problems'
      ]
    }
  }
  
  return null
}

// Additional helper functions for check-ins and relationship skills
async function analyzeCheckinsForPersonalGrowth(userData: any) {
  // Analyze patterns in mood, connection scores, etc.
  return []
}

async function generateRelationshipSkillsInsights(userData: any) {
  // Generate insights about communication, conflict resolution, etc.
  return []
}

async function generatePartnerSuggestionFromCheckin(
  checkin: any, 
  onboardingData: any, 
  relationship: any, 
  partner: any
): Promise<PartnerSuggestion | null> {
  // Generate suggestions based on check-in data
  return null
}

// Save personal insights to database
async function savePersonalInsights(supabase: any, userId: string, insights: any[]) {
  if (insights.length === 0) return []

  const insightsToSave = insights.map(insight => ({
    generated_for_user: userId,
    insight_type: insight.type,
    title: insight.title,
    description: insight.description,
    priority: insight.priority || 'medium',
    relationship_id: insight.relationship_id || null,
    created_at: new Date().toISOString()
  }))

  const { data, error } = await supabase
    .from('relationship_insights')
    .insert(insightsToSave)
    .select()

  if (error) {
    console.error('❌ Error saving personal insights:', error)
    throw error
  }

  return data
}

// Save partner suggestions to database
async function savePartnerSuggestions(supabase: any, suggestions: any[]) {
  if (suggestions.length === 0) return []

  const { data, error } = await supabase
    .from('partner_suggestions')
    .insert(suggestions)
    .select()

  if (error) {
    console.error('❌ Error saving partner suggestions:', error)
    throw error
  }

  return data
}