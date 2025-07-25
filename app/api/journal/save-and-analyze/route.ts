// app/api/journal/save-and-analyze/route.ts
// Enhanced journal saving with automatic AI suggestion generation

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

    // Step 2: Trigger AI analysis in the background (non-blocking)
    triggerAIAnalysis(journalEntry.id, user_id)

    // Step 3: Auto-cleanup old insights (non-blocking)
    setTimeout(() => {
      cleanupOldInsights(user_id)
    }, 5000) // Wait 5 seconds after journal save

    return NextResponse.json({
      success: true,
      journalEntry,
      message: 'Journal entry saved! AI analysis will be ready shortly.'
    })

  } catch (error) {
    console.error('❌ Journal save error:', error)
    return NextResponse.json({ 
      error: 'Failed to save journal entry',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Background AI analysis trigger (non-blocking)
async function triggerAIAnalysis(journalEntryId: string, userId: string) {
  try {
    console.log('🤖 Starting background AI analysis for journal:', journalEntryId)

    // Small delay to ensure journal entry is fully committed
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Call our generate-partner-suggestions API
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/generate-partner-suggestions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
        triggerSource: 'journal_entry',
        triggerData: { journalEntryId },
        lookbackDays: 3 // Focus on recent entries for responsiveness
      })
    })

    if (!response.ok) {
      throw new Error(`AI analysis failed: ${response.statusText}`)
    }

    const result = await response.json()
    console.log('✅ Background AI analysis completed:', {
      personalInsights: result.personalInsights?.length || 0,
      partnerSuggestions: result.partnerSuggestions?.length || 0
    })

  } catch (error) {
    console.error('❌ Background AI analysis failed:', error)
    // Don't throw - this is background processing
  }
}

// GET endpoint for checking AI analysis status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const journalEntryId = searchParams.get('journalEntryId')

    if (!journalEntryId) {
      return NextResponse.json({ error: 'journalEntryId required' }, { status: 400 })
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

    // Check if journal entry has AI analysis
    const { data: journalEntry } = await supabase
      .from('journal_entries')
      .select('ai_analysis')
      .eq('id', journalEntryId)
      .single()

    const hasAnalysis = journalEntry?.ai_analysis && 
                       (journalEntry.ai_analysis as any).need_analysis

    return NextResponse.json({
      analysisComplete: hasAnalysis,
      analysis: hasAnalysis ? journalEntry.ai_analysis : null
    })

  } catch (error) {
    console.error('❌ Analysis status check error:', error)
    return NextResponse.json({ 
      error: 'Failed to check analysis status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Background cleanup of old insights
async function cleanupOldInsights(userId: string) {
  try {
    console.log('🧹 Auto-cleaning old insights for user:', userId)

    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/insights/cleanup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
        cleanupType: 'both' // Both time-based (1 week) and quantity-based (max 10)
      })
    })

    if (response.ok) {
      const result = await response.json()
      console.log('✅ Auto-cleanup completed:', result.deleted)
    }
  } catch (error) {
    console.error('❌ Auto-cleanup failed:', error)
    // Don't throw - this is background processing
  }
}