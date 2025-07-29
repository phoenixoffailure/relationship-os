// app/api/journal/analyze-needs/route.ts
// AI-powered need analysis from journal entries
// Extends existing AI profile generation patterns

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database, SuggestionType } from '@/lib/types/database'

interface NeedAnalysisRequest {
  journalEntryId: string
  userId: string
  relationshipId?: string
}

interface IdentifiedNeed {
  type: SuggestionType
  intensity: number // 1-10 scale
  context: string // Anonymized context
  keywords: string[]
  emotional_state: string
  urgency: 'low' | 'medium' | 'high'
}

interface NeedAnalysisResult {
  needs: IdentifiedNeed[]
  emotional_analysis: {
    primary_emotion: string
    intensity: number
    stress_indicators: string[]
  }
  suggestion_triggers: {
    immediate: IdentifiedNeed[]
    future: IdentifiedNeed[]
  }
  confidence_score: number
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { journalEntryId, userId, relationshipId } = await request.json() as NeedAnalysisRequest

    if (!journalEntryId || !userId) {
      return NextResponse.json({ 
        error: 'Missing journalEntryId or userId' 
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

    console.log('🧠 Starting need analysis for journal entry:', journalEntryId)

    // Step 1: Fetch journal entry
    const { data: journalEntry, error: journalError } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('id', journalEntryId)
      .eq('user_id', userId)
      .single()

    if (journalError || !journalEntry) {
      console.error('❌ Journal entry not found:', journalError?.message)
      return NextResponse.json({ 
        error: 'Journal entry not found' 
      }, { status: 404 })
    }

    // Step 2: Get user's AI profile for context
    const { data: userProfile, error: profileError } = await supabase
      .from('enhanced_onboarding_responses')
      .select('ai_profile_data, love_language_ranking, communication_style, expression_preferences')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (profileError) {
      console.warn('⚠️ No user profile found, using default analysis')
    }

    console.log('📊 Analyzing journal content with user context...')

    // Step 3: Perform AI need analysis
    const analysisResult = await analyzeJournalForNeeds(
      journalEntry.content,
      userProfile?.ai_profile_data,
      journalEntry.mood_score
    )

    // Step 4: Save analysis back to journal entry
    const { error: updateError } = await supabase
      .from('journal_entries')
      .update({
        ai_analysis: {
          ...journalEntry.ai_analysis as any,
          need_analysis: analysisResult,
          analyzed_at: new Date().toISOString()
        }
      })
      .eq('id', journalEntryId)

    if (updateError) {
      console.error('❌ Failed to save analysis:', updateError.message)
      // Continue anyway - we still return the analysis
    }

    console.log('✅ Need analysis completed successfully')

          // Step 5: Trigger partner suggestion generation
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin
      const { data: relationships } = await supabase
        .from('relationship_members')
        .select('relationship_id')
        .eq('user_id', userId)

      // Use the same pattern as other Supabase queries in the codebase
      const relationshipsList = relationships || []

      if (relationshipsList.length > 0) {
        console.log(`💕 Found ${relationshipsList.length} relationships, triggering partner suggestions...`)
        
        relationshipsList.forEach(async (rel) => {
          try {
            const response = await fetch(`${baseUrl}/api/relationships/generate`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                relationshipId: rel.relationship_id,
                sourceUserId: userId,
                timeframeHours: 72,
                maxSuggestions: 3
              })
            })
            
            if (response.ok) {
              const result = await response.json()
              console.log(`✅ Generated ${result.result?.suggestions?.length || 0} suggestions for relationship ${rel.relationship_id}`)
            }
          } catch (error) {
            console.error(`❌ Error generating suggestions:`, error)
          }
        })
      }

    return NextResponse.json({
      success: true,
      analysis: analysisResult,
      journalEntryId,
      nextSteps: {
        shouldGenerateSuggestions: analysisResult.suggestion_triggers.immediate.length > 0,
        immediateNeeds: analysisResult.suggestion_triggers.immediate.length,
        confidenceScore: analysisResult.confidence_score
      }
    })


  } catch (error) {
    console.error('❌ Need analysis error:', error)
    
    return NextResponse.json({ 
      error: 'Need analysis failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Core AI analysis function - extends existing AI profile patterns
async function analyzeJournalForNeeds(
  journalContent: string,
  userProfile: any,
  moodScore: number | null
): Promise<NeedAnalysisResult> {
  
  // Need detection patterns based on relationship psychology
  const needPatterns = {
    love_language_action: {
      keywords: ['touch', 'hug', 'kiss', 'physical', 'close', 'cuddle', 'affection'],
      phrases: ['want to be held', 'need affection', 'miss touching', 'feel distant physically']
    },
    communication_improvement: {
      keywords: ['talk', 'listen', 'understand', 'communicate', 'express', 'share', 'discuss'],
      phrases: ['need to talk', 'feel unheard', 'not listening', 'misunderstood', 'cant express']
    },
    quality_time: {
      keywords: ['time', 'together', 'attention', 'focus', 'present', 'busy', 'distracted'],
      phrases: ['spend time', 'feel ignored', 'always busy', 'not present', 'want attention']
    },
    intimacy_connection: {
      keywords: ['intimate', 'connection', 'close', 'distant', 'emotional', 'vulnerable', 'open'],
      phrases: ['feel disconnected', 'want closeness', 'emotionally distant', 'need intimacy']
    },
    stress_support: {
      keywords: ['stress', 'overwhelmed', 'support', 'help', 'pressure', 'anxious', 'worried'],
      phrases: ['feeling overwhelmed', 'need support', 'stressed out', 'cant handle']
    },
    goal_support: {
      keywords: ['goals', 'dreams', 'support', 'encourage', 'future', 'plans', 'ambition'],
      phrases: ['need encouragement', 'support my goals', 'believe in me', 'future together']
    },
    conflict_resolution: {
      keywords: ['fight', 'argue', 'conflict', 'resolve', 'problem', 'issue', 'tension'],
      phrases: ['we fought', 'need to resolve', 'tension between', 'relationship problems']
    }
  }

  const content = journalContent.toLowerCase()
  const identifiedNeeds: IdentifiedNeed[] = []

  // Analyze each need type
  for (const [needType, patterns] of Object.entries(needPatterns)) {
    let intensity = 0
    let foundKeywords: string[] = []
    let contextClues: string[] = []

    // Keyword matching with intensity scoring
    patterns.keywords.forEach(keyword => {
      if (content.includes(keyword)) {
        intensity += 1
        foundKeywords.push(keyword)
      }
    })

    // Phrase matching (higher intensity)
    patterns.phrases.forEach(phrase => {
      if (content.includes(phrase)) {
        intensity += 3
        contextClues.push(phrase)
      }
    })

    // Factor in mood score
    if (moodScore && moodScore < 5) {
      intensity += 1 // Negative mood amplifies needs
    }

    // Consider user profile preferences
    if (userProfile && needType === 'love_language_action') {
      const primaryLoveLanguage = userProfile.love_language_profile?.primary
      if (primaryLoveLanguage === 'physical_touch') {
        intensity += 2
      }
    }

    if (intensity > 0) {
      // Create anonymized context
      const anonymizedContext = createAnonymizedContext(content, foundKeywords, contextClues)
      
      identifiedNeeds.push({
        type: needType as SuggestionType,
        intensity: Math.min(intensity, 10),
        context: anonymizedContext,
        keywords: foundKeywords,
        emotional_state: determineEmotionalState(content, moodScore),
        urgency: intensity >= 6 ? 'high' : intensity >= 3 ? 'medium' : 'low'
      })
    }
  }

  // Sort needs by intensity
  identifiedNeeds.sort((a, b) => b.intensity - a.intensity)

  // Emotional analysis
  const emotional_analysis = {
    primary_emotion: determineEmotionalState(content, moodScore),
    intensity: moodScore || calculateEmotionalIntensity(content),
    stress_indicators: findStressIndicators(content)
  }

  // Categorize for suggestion generation
  const suggestion_triggers = {
    immediate: identifiedNeeds.filter(need => need.urgency === 'high' || need.intensity >= 6),
    future: identifiedNeeds.filter(need => need.urgency !== 'high' && need.intensity < 6)
  }

  // Overall confidence score
  const confidence_score = calculateConfidenceScore(identifiedNeeds, content.length)

  return {
    needs: identifiedNeeds,
    emotional_analysis,
    suggestion_triggers,
    confidence_score
  }
}

// Helper functions
function createAnonymizedContext(content: string, keywords: string[], phrases: string[]): string {
  // Create context without revealing specific personal details
  const contextParts = []
  
  if (keywords.length > 0) {
    contextParts.push(`Expressed needs related to: ${keywords.slice(0, 3).join(', ')}`)
  }
  
  if (phrases.length > 0) {
    contextParts.push(`Indicated feelings of needing more connection/support`)
  }
  
  return contextParts.join('. ') || 'General relationship need expressed'
}

function determineEmotionalState(content: string, moodScore: number | null): string {
  if (moodScore !== null) {
    if (moodScore <= 3) return 'distressed'
    if (moodScore <= 5) return 'concerned'
    if (moodScore <= 7) return 'neutral'
    return 'positive'
  }

  // Fallback emotional analysis
  const negativeWords = ['sad', 'angry', 'frustrated', 'lonely', 'hurt', 'upset']
  const positiveWords = ['happy', 'grateful', 'love', 'good', 'better', 'content']
  
  const negativeCount = negativeWords.filter(word => content.includes(word)).length
  const positiveCount = positiveWords.filter(word => content.includes(word)).length
  
  if (negativeCount > positiveCount) return 'distressed'
  if (positiveCount > negativeCount) return 'positive'
  return 'neutral'
}

function calculateEmotionalIntensity(content: string): number {
  const intensityWords = ['very', 'really', 'extremely', 'so', 'incredibly', 'absolutely']
  let intensity = 5 // baseline
  
  intensityWords.forEach(word => {
    if (content.includes(word)) intensity += 1
  })
  
  return Math.min(intensity, 10)
}

function findStressIndicators(content: string): string[] {
  const stressWords = ['overwhelmed', 'pressure', 'anxious', 'worried', 'stressed', 'exhausted']
  return stressWords.filter(word => content.includes(word))
}

function calculateConfidenceScore(needs: IdentifiedNeed[], contentLength: number): number {
  if (needs.length === 0) return 0.1
  
  // Base confidence on number of needs found and content depth
  const needsScore = Math.min(needs.length * 0.2, 0.6)
  const contentScore = Math.min(contentLength / 500, 0.3) // Longer content = higher confidence
  const intensityScore = needs.reduce((sum, need) => sum + need.intensity, 0) / (needs.length * 10) * 0.1
  
  return Math.min(needsScore + contentScore + intensityScore, 1.0)
}