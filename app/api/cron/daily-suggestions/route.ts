// app/api/cron/daily-suggestions/route.ts
// Daily batch job to generate partner suggestions for relationships where only one partner has been active

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  try {
    // Verify this is a legitimate cron request (basic auth check)
    const authHeader = request.headers.get('authorization')
    const expectedAuth = `Bearer ${process.env.CRON_SECRET}`
    
    if (!authHeader || authHeader !== expectedAuth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🕐 Starting daily partner suggestions batch job...')

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

    // Find all active relationships
    const { data: relationships, error: relationshipError } = await supabase
      .from('relationships')
      .select(`
        id,
        name,
        relationship_type,
        relationship_members (
          user_id,
          users (
            id,
            full_name,
            email
          )
        )
      `)

    if (relationshipError) {
      console.error('❌ Error fetching relationships:', relationshipError)
      return NextResponse.json({ 
        error: 'Failed to fetch relationships',
        details: relationshipError.message 
      }, { status: 500 })
    }

    console.log(`📊 Found ${relationships?.length || 0} relationships to process`)

    let totalSuggestionsGenerated = 0
    let relationshipsProcessed = 0
    const results = []

    // Process each relationship
    for (const relationship of relationships || []) {
      try {
        const members = relationship.relationship_members
        if (!members || members.length < 2) {
          console.log(`⚠️ Skipping relationship ${relationship.id} - insufficient members`)
          continue
        }

        console.log(`🔍 Processing relationship: ${relationship.name} (${relationship.id})`)

        // Check if anyone has journal entries in the last 48 hours
        const twoDaysAgo = new Date()
        twoDaysAgo.setHours(twoDaysAgo.getHours() - 48)

        const { data: recentEntries, error: entriesError } = await supabase
          .from('journal_entries')
          .select('user_id, created_at')
          .in('user_id', members.map(m => m.user_id))
          .gte('created_at', twoDaysAgo.toISOString())

        if (entriesError) {
          console.error(`❌ Error checking entries for relationship ${relationship.id}:`, entriesError)
          continue
        }

        if (!recentEntries || recentEntries.length === 0) {
          console.log(`⏭️ Skipping relationship ${relationship.id} - no recent journal activity`)
          continue
        }

        // Check if suggestions were already generated recently (last 12 hours)
        const twelveHoursAgo = new Date()
        twelveHoursAgo.setHours(twelveHoursAgo.getHours() - 12)

        const { data: recentSuggestions, error: suggestionsError } = await supabase
          .from('partner_suggestions')
          .select('id')
          .eq('relationship_id', relationship.id)
          .gte('created_at', twelveHoursAgo.toISOString())

        if (!suggestionsError && recentSuggestions && recentSuggestions.length > 0) {
          console.log(`⏭️ Skipping relationship ${relationship.id} - suggestions already generated recently`)
          continue
        }

        // Generate suggestions for this relationship
        const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/relationships/generate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            relationshipId: relationship.id,
            timeframeHours: 72, // Look back 3 days
            maxSuggestions: 3
          })
        })

        if (response.ok) {
          const result = await response.json()
          const suggestionsGenerated = result.result?.suggestions?.length || 0
          
          console.log(`✅ Generated ${suggestionsGenerated} suggestions for relationship ${relationship.name}`)
          
          totalSuggestionsGenerated += suggestionsGenerated
          relationshipsProcessed++

          results.push({
            relationshipId: relationship.id,
            relationshipName: relationship.name,
            suggestionsGenerated,
            status: 'success'
          })
        } else {
          const errorData = await response.json()
          console.error(`❌ Failed to generate suggestions for relationship ${relationship.id}:`, errorData)
          
          results.push({
            relationshipId: relationship.id,
            relationshipName: relationship.name,
            suggestionsGenerated: 0,
            status: 'error',
            error: errorData.error
          })
        }

        // Add delay between requests to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 1000))

      } catch (error) {
        console.error(`❌ Error processing relationship ${relationship.id}:`, error)
        results.push({
          relationshipId: relationship.id,
          relationshipName: relationship.name,
          suggestionsGenerated: 0,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Cleanup old suggestions (older than 14 days)
    const fourteenDaysAgo = new Date()
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

    const { error: cleanupError } = await supabase
      .from('partner_suggestions')
      .delete()
      .lt('created_at', fourteenDaysAgo.toISOString())

    if (cleanupError) {
      console.error('❌ Error cleaning up old suggestions:', cleanupError)
    } else {
      console.log('✅ Cleaned up old suggestions')
    }

    console.log(`🎉 Daily batch job completed: ${totalSuggestionsGenerated} suggestions generated for ${relationshipsProcessed} relationships`)

    return NextResponse.json({
      success: true,
      totalSuggestionsGenerated,
      relationshipsProcessed,
      totalRelationships: relationships?.length || 0,
      results,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Daily batch job error:', error)
    return NextResponse.json({ 
      error: 'Daily batch job failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Manual trigger for testing
export async function POST(request: NextRequest) {
  // Allow manual triggering without auth for testing
  return GET(request)
}