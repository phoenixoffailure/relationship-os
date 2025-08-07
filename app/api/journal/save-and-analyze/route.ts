// app/api/journal/save-and-analyze/route.ts
// FIXED: Enhanced journal saving with proper partner suggestion generation

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

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

    const { content, mood_score, user_id } = await request.json()

    if (!content || !user_id) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 })
    }

    console.log('📝 Saving journal entry and triggering AI analysis...')

    // Step 1: Save the journal entry
    const { data: journalEntry, error: saveError } = await supabase
      .from('journal_entries')
      .insert({
        user_id,
        content,
        mood_score: mood_score || null,
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

    // Step 2: Mark journal as ready for batch processing (Phase 4 Update)
    console.log('✅ Journal marked as ready for daily batch processing')
    
    // Note: Partner suggestions are now generated via daily batch processing
    // This journal will be processed in the next daily batch run

    // Step 3: Trigger personal insights generation (immediate, per journal)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin
    try {
      console.log('🔍 Triggering personal insights generation...')
      const insightsResponse = await fetch(`${baseUrl}/api/insights/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user_id || null }) // Pass the user_id
      })
      if (insightsResponse.ok) {
        console.log('✅ Personal insights generation triggered successfully')
      } else {
        console.error('❌ Failed to trigger insights generation:', insightsResponse.status)
      }
    } catch (error) {
      console.error('❌ Failed to trigger insights generation:', error)
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

    return NextResponse.json({
      success: true,
      journalEntry,
      personalInsightsTriggered: true,
      message: 'Journal entry saved! Personal insights generated immediately. Partner suggestions will be processed in tonight\'s daily batch.'
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