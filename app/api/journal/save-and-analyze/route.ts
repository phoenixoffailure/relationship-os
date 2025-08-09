// app/api/journal/save-and-analyze/route.ts
// FIXED: Enhanced journal saving with proper partner suggestion generation

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { trackEvent } from '@/lib/analytics/events'

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

    const { content, mood_score, user_id, relationship_id } = await request.json()

    if (!content || !user_id) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 })
    }

    console.log('📝 Saving journal entry and checking insight eligibility...')

    // Step 1: Save the journal entry
    const { data: journalEntry, error: saveError } = await supabase
      .from('journal_entries')
      .insert({
        user_id,
        content,
        mood_score: mood_score || null,
        relationship_id: relationship_id || null,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (saveError) {
      console.error('❌ Error saving journal entry:', saveError)
      return NextResponse.json({ 
        error: 'Failed to save journal entry',
        details: saveError.message 
      }, { status: 500 })
    }

    console.log('✅ Journal entry saved:', journalEntry.id)

    // Phase 9: Track journal submission
    trackEvent('journal_submitted', {
      user_id,
      relationship_id: relationship_id || undefined,
      has_relationship: !!relationship_id
    })

    if (relationship_id) {
      trackEvent('journal_with_relationship_selected', {
        user_id,
        relationship_id
      })
    }

    // Phase 9: Check if user can generate insights
    let shouldGenerateInsight = false
    let insightDenialReason = null
    
    if (relationship_id) {
      // Check if user is premium
      const { data: subscription } = await supabase
        .from('premium_subscriptions')
        .select('subscription_status')
        .eq('user_id', user_id)
        .eq('subscription_status', 'active')
        .single()
      
      const isPremium = !!subscription
      
      // Check if user can generate insight using database function
      const { data: canGenerate, error: checkError } = await supabase
        .rpc('can_generate_insight', { 
          p_user_id: user_id, 
          p_relationship_id: relationship_id,
          p_is_premium: isPremium
        })
      
      if (checkError) {
        console.error('❌ Error checking insight eligibility:', checkError)
      } else if (!canGenerate) {
        // Get more specific reason
        const today = new Date().toISOString().split('T')[0]
        const { data: controlData } = await supabase
          .from('generation_controls')
          .select('checkin_date, first_journal_after_checkin_today')
          .eq('user_id', user_id)
          .eq('relationship_id', relationship_id)
          .single()
        
        if (!controlData || controlData.checkin_date !== today) {
          insightDenialReason = 'no_checkin'
          console.log('⚠️ No check-in today - insight generation blocked')
          
          // Track insight denial
          trackEvent('insights_denied_no_checkin', {
            user_id,
            relationship_id,
            subscription_status: isPremium ? 'premium' : 'free'
          })
        } else if (!isPremium && controlData.first_journal_after_checkin_today) {
          insightDenialReason = 'free_tier_limit'
          console.log('⚠️ Free tier limit reached - already generated insight today')
          
          // Track insight denial for free tier cap
          trackEvent('insights_denied_daily_cap_free', {
            user_id,
            relationship_id,
            subscription_status: 'free'
          })
        }
      } else {
        shouldGenerateInsight = true
        console.log('✅ User eligible for insight generation')
      }
    } else {
      // No relationship specified, skip insight generation
      console.log('⚠️ No relationship specified - skipping insight generation')
    }

    console.log('✅ Journal entry saved:', journalEntry.id)

    // Step 2: Mark journal as ready for batch processing (Phase 4 Update)
    console.log('✅ Journal marked as ready for daily batch processing')
    
    // Note: Partner suggestions are now generated via daily batch processing (PREMIUM ONLY)
    // This journal will be processed in the next daily batch run

    // Step 3: Trigger personal insights generation (only if eligible)
    let insightGenerated = false
    if (shouldGenerateInsight) {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin
      try {
        console.log('🔍 Triggering personal insights generation...')
        const insightsResponse = await fetch(`${baseUrl}/api/insights/generate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            user_id: user_id || null,
            relationship_id: relationship_id || null
          })
        })
        if (insightsResponse.ok) {
          console.log('✅ Personal insights generation triggered successfully')
          insightGenerated = true
          
          // Track successful insight generation
          trackEvent(isPremium ? 'insights_generated_premium' : 'insights_generated_free', {
            user_id,
            relationship_id,
            subscription_status: isPremium ? 'premium' : 'free'
          })
          
          // Update generation_controls to record insight generation
          if (relationship_id) {
            await supabase.rpc('record_insight_generation', {
              p_user_id: user_id,
              p_relationship_id: relationship_id
            })
          }
        } else {
          console.error('❌ Failed to trigger insights generation:', insightsResponse.status)
        }
      } catch (error) {
        console.error('❌ Failed to trigger insights generation:', error)
      }
    } else {
      console.log('⚠️ Insight generation skipped - user not eligible')
    }

    // Step 4: Mark journal insights as generated and ready for batch processing
    try {
      const { error: updateError } = await supabase
        .from('journal_entries')
        .update({ 
          personal_insights_generated: true,
          ready_for_batch_processing: true
        })
        .eq('id', journalEntry.id)

      if (updateError) {
        console.error('❌ Error marking journal as ready for batch:', updateError)
      } else {
        console.log('✅ Journal marked as ready for batch processing')
      }
    } catch (error) {
      console.error('❌ Error updating journal batch status:', error)
    }

    // Step 5: Auto-cleanup old insights (non-blocking)
    setTimeout(() => {
      cleanupOldInsights(user_id).catch(error => 
        console.error('❌ Error in cleanup:', error)
      )
    }, 5000)

    // Build response message based on what happened
    let message = 'Journal entry saved!'
    if (insightGenerated) {
      message += ' Personal insight generated.'
    } else if (insightDenialReason === 'no_checkin') {
      message += ' Complete today\'s check-in to unlock insights.'
    } else if (insightDenialReason === 'free_tier_limit') {
      message += ' Daily insight limit reached. Upgrade to premium for unlimited insights after check-in.'
    } else if (!relationship_id) {
      message += ' Select a relationship to generate insights.'
    }
    
    return NextResponse.json({
      success: true,
      journalEntry,
      personalInsightsTriggered: insightGenerated,
      insightDenialReason,
      message
    })

  } catch (error) {
    console.error('❌ Journal save error:', error)
    return NextResponse.json({ 
      error: 'Failed to save journal entry',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Helper function to cleanup old insights
async function cleanupOldInsights(userId: string) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { 
        cookies: {
          get() { return undefined },
          set() {},
          remove() {},
        },
      }
    )

    // Delete insights older than 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    await supabase
      .from('relationship_insights')
      .delete()
      .eq('generated_for_user', userId)
      .lt('created_at', thirtyDaysAgo.toISOString())

    console.log('✅ Cleaned up old insights for user:', userId)
  } catch (error) {
    console.error('❌ Error cleaning up insights:', error)
  }
}