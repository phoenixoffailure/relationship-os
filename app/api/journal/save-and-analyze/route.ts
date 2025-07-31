// app/api/journal/save-and-analyze/route.ts
// Enhanced journal saving with automatic partner suggestion generation

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

    // Step 2: Get user's relationships for partner suggestion generation
    const { data: relationships, error: relationshipError } = await supabase
      .from('relationship_members')
      .select(`
        relationship_id,
        relationships (
          id,
          name,
          relationship_type
        )
      `)
      .eq('user_id', user_id)

    if (relationshipError) {
      console.error('❌ Error fetching relationships:', relationshipError)
    } else if (relationships && relationships.length > 0) {
      console.log(`💕 Found ${relationships.length} relationships, triggering partner suggestions...`)
      
      // Step 3: Trigger partner suggestion generation for each relationship (async)
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin
      
        await Promise.all(relationships.map(async (rel) => {
        try {
          const response = await fetch(`${baseUrl}/api/relationships/generate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              relationshipId: rel.relationship_id,
              sourceUserId: user_id,
              timeframeHours: 72, // Look back 3 days
              maxSuggestions: 3
            })
          })

          if (response.ok) {
            const result = await response.json()
            console.log(`✅ Generated ${result.result?.suggestions?.length || 0} suggestions for relationship ${rel.relationship_id}`)
          } else {
            console.error(`❌ Failed to generate suggestions for relationship ${rel.relationship_id}`)
          }
        } catch (error) {
          console.error(`❌ Error generating suggestions for relationship ${rel.relationship_id}:`, error)
        }
      }))
    } else {
      console.log('ℹ️ No relationships found, skipping partner suggestion generation')
    }

    // Step 4: Trigger personal insights generation (existing logic)
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin
    fetch(`${baseUrl}/api/insights/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }).catch(error => {
      console.error('Failed to trigger insights generation:', error)
    })

    // Step 5: Auto-cleanup old insights (non-blocking)
    setTimeout(() => {
      cleanupOldInsights(user_id)
    }, 5000)

    return NextResponse.json({
      success: true,
      journalEntry,
      partnerSuggestionsTriggered: relationships?.length || 0,
      message: 'Journal entry saved! AI analysis and partner suggestions will be ready shortly.'
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