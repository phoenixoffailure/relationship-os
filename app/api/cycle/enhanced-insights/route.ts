// app/api/cycle/enhanced-insights/route.ts
// Enhanced cycle insights API using xAI Grok (matching your existing pattern)

import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getCyclePhaseInsights, calculateCurrentPhase } from '@/lib/cycle/enhanced-phase-system'
import { createWeightedProfile, generatePartnerGuidance, type LoveLanguageProfile } from '@/lib/love-languages/weighted-system'

export async function POST(req: Request) {
  try {
    const { userId, cycleId } = await req.json()
    
    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Fetch user's cycle data
    const { data: cycleData } = await supabase
      .from('menstrual_cycles')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single()

    if (!cycleData) {
      return NextResponse.json({ error: 'No active cycle found' }, { status: 404 })
    }

    // Fetch user's historical cycles for better prediction
    const { data: historicalCycles } = await supabase
      .from('menstrual_cycles')
      .select('cycle_length, period_length')
      .eq('user_id', userId)
      .eq('is_active', false)
      .order('created_at', { ascending: false })
      .limit(6)

    // Calculate averages
    const avgCycleLength = historicalCycles && historicalCycles.length > 0
      ? Math.round(historicalCycles.reduce((sum, cycle) => sum + (cycle.cycle_length || 28), 0) / historicalCycles.length)
      : 28

    const avgPeriodLength = historicalCycles && historicalCycles.length > 0
      ? Math.round(historicalCycles.reduce((sum, cycle) => sum + (cycle.period_length || 5), 0) / historicalCycles.length)
      : 5

    // Calculate current phase
    const { phase, dayInCycle } = calculateCurrentPhase(
      cycleData.cycle_start_date,
      avgCycleLength,
      avgPeriodLength
    )

    // Fetch user's onboarding data for love languages
    const { data: onboardingData } = await supabase
      .from('enhanced_onboarding_responses')
      .select('love_language_ranking, love_language_intensity, ai_profile_data')
      .eq('user_id', userId)
      .single()

    // Create weighted love language profile
    let userLoveLanguageProfile: LoveLanguageProfile | null = null
    if (onboardingData?.love_language_ranking && onboardingData?.love_language_intensity) {
      userLoveLanguageProfile = createWeightedProfile(
        onboardingData.love_language_ranking,
        onboardingData.love_language_intensity,
        'receiving'
      )
    }

    // Get enhanced phase insights
    const phaseInsights = getCyclePhaseInsights(
      phase,
      userLoveLanguageProfile?.topThree.map(l => l.language),
      [] // Partner languages would go here if available
    )

    // Generate personalized mood prediction using xAI Grok
    let personalizedMood = `During the ${phase} phase, you might feel ${phaseInsights.emotionalState.primaryEmotions.join(' or ')}.`
    
    if (process.env.XAI_API_KEY) {
      try {
        const moodResponse = await fetch('https://api.x.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
          },
          body: JSON.stringify({
            messages: [
              {
                role: 'system',
                content: 'You are a compassionate relationship and wellness AI. Provide supportive, accurate insights about menstrual cycle phases and their emotional impacts.'
              },
              {
                role: 'user',
                content: `Based on the ${phase} phase of the menstrual cycle and the following user context, provide a personalized mood and emotional prediction:

Phase: ${phase} (Day ${dayInCycle} of cycle)
User's Top Love Languages: ${userLoveLanguageProfile?.topThree.map(l => l.language).join(', ') || 'unknown'}

Phase Characteristics:
- Primary emotions: ${phaseInsights.emotionalState.primaryEmotions.join(', ')}
- Energy level: ${phaseInsights.emotionalState.energyLevel}
- Communication style: ${phaseInsights.emotionalState.communicationStyle}

Provide a personalized 1-2 sentence prediction about how they might feel during this phase, focusing on emotions and relationship needs. Be supportive and understanding.`
              }
            ],
            model: 'grok-4',
            temperature: 0.6,
            max_tokens: 200
          })
        })

        if (moodResponse.ok) {
          const moodData = await moodResponse.json()
          personalizedMood = moodData.choices?.[0]?.message?.content || personalizedMood
        }
      } catch (error) {
        console.error('Error generating mood prediction:', error)
      }
    }

    // Generate partner suggestions with cycle and love language context using xAI Grok
    let partnerSuggestions = `Your partner might appreciate extra ${phaseInsights.relationshipNeeds.reassuranceNeed === 'high' ? 'emotional support' : 'understanding'} during this phase.`
    
    if (process.env.XAI_API_KEY) {
      try {
        const partnerResponse = await fetch('https://api.x.ai/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
          },
          body: JSON.stringify({
            messages: [
              {
                role: 'system',
                content: 'You are a relationship coach AI. Create practical, respectful suggestions that help partners support each other better. Be specific but maintain privacy and discretion.'
              },
              {
                role: 'user',
                content: `Create specific, actionable suggestions for a partner based on menstrual cycle phase and love languages:

Current Phase: ${phase} (Day ${dayInCycle})
Partner's Top Love Languages: ${userLoveLanguageProfile?.topThree.map(l => l.language).join(', ') || 'unknown'}

Phase Needs:
- Intimacy level: ${phaseInsights.relationshipNeeds.intimacyLevel}
- Reassurance need: ${phaseInsights.relationshipNeeds.reassuranceNeed}
- Patience required: ${phaseInsights.relationshipNeeds.patienceRequired}
- Preferred activities: ${phaseInsights.relationshipNeeds.preferredActivities.join(', ')}

Key Partner Guidance:
${phaseInsights.partnerGuidance.doThis.slice(0, 3).map((item: string) => `- ${item}`).join('\n')}

Generate 2-3 specific, actionable suggestions that combine cycle needs with their love language preferences. Keep suggestions discrete and supportive.`
              }
            ],
            model: 'grok-4',
            temperature: 0.7,
            max_tokens: 300
          })
        })

        if (partnerResponse.ok) {
          const partnerData = await partnerResponse.json()
          partnerSuggestions = partnerData.choices?.[0]?.message?.content || partnerSuggestions
        }
      } catch (error) {
        console.error('Error generating partner suggestions:', error)
      }
    }

    // Prepare insights data for database
    const insightsData = {
      phase,
      dayInCycle,
      predicted_mood: {
        text: personalizedMood,
        emotions: phaseInsights.emotionalState.primaryEmotions,
        energy: phaseInsights.emotionalState.energyLevel,
        support_needs: phaseInsights.emotionalState.supportNeeds
      },
      partner_suggestions: {
        text: partnerSuggestions,
        intimacy_level: phaseInsights.relationshipNeeds.intimacyLevel,
        reassurance_need: phaseInsights.relationshipNeeds.reassuranceNeed,
        patience_required: phaseInsights.relationshipNeeds.patienceRequired,
        love_language_considerations: userLoveLanguageProfile?.topThree.map(l => l.language) || []
      },
      relationship_insights: {
        sexual_wellness: phaseInsights.sexualWellness,
        preferred_activities: phaseInsights.relationshipNeeds.preferredActivities,
        communication_guidance: phaseInsights.emotionalState.communicationStyle
      }
    }

    // Save enhanced insights to database
    const { data: savedInsights, error: saveError } = await supabase
      .from('cycle_insights')
      .upsert({
        user_id: userId,
        cycle_id: cycleData.id,
        phase,
        predicted_mood: insightsData.predicted_mood,
        partner_suggestions: insightsData.partner_suggestions,
        generated_at: new Date().toISOString()
      })
      .select()

    if (saveError) {
      console.error('Error saving cycle insights:', saveError)
    }

    // Check if user has a relationship for partner insights integration
    const { data: userRelationships } = await supabase
      .from('relationship_members')
      .select('relationship_id, relationships(id, name)')
      .eq('user_id', userId)

    // If user has relationships, create discretely integrated partner insights
    if (userRelationships && userRelationships.length > 0) {
      for (const rel of userRelationships) {
        // Create a relationship insight that considers cycle data without being explicit
        let discreteInsight = `Your partner might benefit from extra emotional support and understanding right now. Consider being especially patient and offering gentle care.`
        
        if (process.env.XAI_API_KEY) {
          try {
            const insightResponse = await fetch('https://api.x.ai/v1/chat/completions', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
              },
              body: JSON.stringify({
                messages: [
                  {
                    role: 'system',
                    content: 'Create supportive relationship insights that help partners be more understanding without revealing private cycle information.'
                  },
                  {
                    role: 'user',
                    content: `Create a subtle relationship insight for a partner that helps them be more supportive, based on this context:

Current relationship dynamic needs:
- Partner may need: ${phaseInsights.relationshipNeeds.reassuranceNeed === 'high' ? 'extra emotional support' : 'normal support'}
- Communication approach: ${phaseInsights.emotionalState.communicationStyle}
- Energy levels: ${phaseInsights.emotionalState.energyLevel}
- Top love languages: ${userLoveLanguageProfile?.topThree.map(l => l.language).join(', ') || 'unknown'}

Create a helpful suggestion that doesn't mention cycles explicitly but helps the partner be more supportive during this time. Focus on emotional needs and communication.`
                  }
                ],
                model: 'grok-4',
                temperature: 0.6,
                max_tokens: 200
              })
            })

            if (insightResponse.ok) {
              const insightData = await insightResponse.json()
              discreteInsight = insightData.choices?.[0]?.message?.content || discreteInsight
            }
          } catch (error) {
            console.error('Error generating discrete insight:', error)
          }
        }

        // Save discrete relationship insight
        await supabase
          .from('relationship_insights')
          .insert({
            relationship_id: rel.relationship_id,
            generated_for_user: userId, // The person who will benefit from this insight
            insight_type: 'suggestion',
            title: 'Support & Understanding',
            description: discreteInsight,
            priority: phaseInsights.relationshipNeeds.reassuranceNeed === 'high' ? 'high' : 'medium'
          })
      }
    }

    return NextResponse.json({
      success: true,
      insights: {
        phase,
        dayInCycle,
        personalizedMood,
        partnerSuggestions,
        phaseInsights,
        loveLanguageGuidance: userLoveLanguageProfile ? generatePartnerGuidance(userLoveLanguageProfile) : null,
        cycleData: {
          avgCycleLength,
          avgPeriodLength,
          currentCycleStart: cycleData.cycle_start_date
        }
      }
    })

  } catch (error) {
    console.error('Error generating enhanced cycle insights:', error)
    return NextResponse.json({ 
      error: 'Failed to generate cycle insights',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Additional endpoint for real-time phase checking
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 })
    }

    // Initialize Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Get current active cycle
    const { data: currentCycle } = await supabase
      .from('menstrual_cycles')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single()

    if (!currentCycle) {
      return NextResponse.json({ 
        hasActiveCycle: false,
        message: 'No active cycle found' 
      })
    }

    // Calculate current phase
    const { phase, dayInCycle } = calculateCurrentPhase(currentCycle.cycle_start_date)
    const phaseInsights = getCyclePhaseInsights(phase)

    return NextResponse.json({
      hasActiveCycle: true,
      currentPhase: {
        phase,
        dayInCycle,
        description: phaseInsights.emotionalState.communicationStyle,
        energyLevel: phaseInsights.emotionalState.energyLevel,
        supportNeeds: phaseInsights.emotionalState.supportNeeds
      }
    })

  } catch (error) {
    console.error('Error getting cycle status:', error)
    return NextResponse.json({ 
      error: 'Failed to get cycle status' 
    }, { status: 500 })
  }
}