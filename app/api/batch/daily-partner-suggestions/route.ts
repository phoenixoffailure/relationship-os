// app/api/batch/daily-partner-suggestions/route.ts
// Phase 4: Daily Batch Processing for Partner Suggestions

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Type definitions
interface BatchJournal {
  journal_id: string
  user_id: string
  content: string
  relationship_id: string | null
  mood_score: number | null
  created_at: string
}

interface RelationshipBatch {
  relationship_id: string
  relationship_name: string
  relationship_type: string
  journals: BatchJournal[]
  members: Array<{
    user_id: string
    user_name: string
    role: string | null
  }>
}

interface BatchProcessingResult {
  relationship_id: string
  entries_processed: number
  suggestions_generated: number
  status: 'completed' | 'failed'
  error?: string
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    console.log('🚀 Starting daily batch processing for partner suggestions...')
    
    // Get target date from request or default to yesterday
    const body = await request.json().catch(() => ({}))
    const targetDate = body.date || getYesterday()
    
    console.log(`📅 Processing batch for date: ${targetDate}`)

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

    // Step 1: Check if this batch has already been processed
    const { data: existingBatch } = await supabase
      .from('batch_processing_log')
      .select('id, processing_status')
      .eq('batch_date', targetDate)
      .eq('processing_status', 'completed')
      .limit(1)

    if (existingBatch && existingBatch.length > 0) {
      console.log(`ℹ️ Batch for ${targetDate} already processed, skipping`)
      return NextResponse.json({
        success: true,
        message: `Batch for ${targetDate} already processed`,
        alreadyProcessed: true
      })
    }

    // Step 2: Get all journals ready for batch processing from target date
    console.log('📖 Fetching journals ready for batch processing...')
    const { data: journals, error: journalError } = await supabase
      .rpc('get_journals_ready_for_batch', { target_date: targetDate })

    if (journalError) {
      console.error('❌ Error fetching journals for batch:', journalError)
      return NextResponse.json({ 
        error: 'Failed to fetch journals for batch processing',
        details: journalError.message 
      }, { status: 500 })
    }

    if (!journals || journals.length === 0) {
      console.log(`ℹ️ No journals found for batch processing on ${targetDate}`)
      return NextResponse.json({
        success: true,
        message: `No journals to process for ${targetDate}`,
        journalsProcessed: 0
      })
    }

    console.log(`📚 Found ${journals.length} journals ready for batch processing`)

    // Step 3: Group journals by relationship
    const relationshipBatches = await groupJournalsByRelationship(supabase, journals as BatchJournal[])
    console.log(`🔗 Grouped into ${relationshipBatches.length} relationship batches`)

    // Step 4: Process each relationship batch
    const batchResults: BatchProcessingResult[] = []
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin

    for (const batch of relationshipBatches) {
      console.log(`🔄 Processing relationship batch: ${batch.relationship_name} (${batch.journals.length} entries)`)
      
      try {
        // Create batch log entry
        const { data: batchLog } = await supabase
          .from('batch_processing_log')
          .insert({
            batch_date: targetDate,
            relationship_id: batch.relationship_id,
            entries_processed: batch.journals.length,
            processing_status: 'running'
          })
          .select('id')
          .single()

        const batchId = batchLog?.id || null

        // Generate suggestions for this relationship batch
        const suggestions = await generateBatchSuggestions(
          supabase,
          batch,
          targetDate,
          batchId,
          baseUrl
        )

        // Update batch log as completed
        if (batchId) {
          await supabase
            .from('batch_processing_log')
            .update({
              suggestions_generated: suggestions.length,
              processing_status: 'completed',
              processing_completed_at: new Date().toISOString()
            })
            .eq('id', batchId)
        }

        batchResults.push({
          relationship_id: batch.relationship_id,
          entries_processed: batch.journals.length,
          suggestions_generated: suggestions.length,
          status: 'completed'
        })

        console.log(`✅ Completed batch for ${batch.relationship_name}: ${suggestions.length} suggestions generated`)

      } catch (error) {
        console.error(`❌ Error processing batch for ${batch.relationship_name}:`, error)
        
        batchResults.push({
          relationship_id: batch.relationship_id,
          entries_processed: batch.journals.length,
          suggestions_generated: 0,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error'
        })

        // Update batch log as failed
        await supabase
          .from('batch_processing_log')
          .update({
            processing_status: 'failed',
            error_message: error instanceof Error ? error.message : 'Unknown error',
            processing_completed_at: new Date().toISOString()
          })
          .eq('batch_date', targetDate)
          .eq('relationship_id', batch.relationship_id)
      }
    }

    // Step 5: Mark all processed journals as batch completed
    const journalIds = journals.map((j: BatchJournal) => j.journal_id)
    const { data: markedJournals } = await supabase
      .rpc('mark_journals_batch_processed', {
        journal_ids: journalIds,
        batch_timestamp: new Date().toISOString()
      })

    console.log(`✅ Marked ${markedJournals || 0} journals as batch processed`)

    // Step 6: Summary results
    const totalSuggestions = batchResults.reduce((sum, r) => sum + r.suggestions_generated, 0)
    const successfulBatches = batchResults.filter(r => r.status === 'completed').length
    const failedBatches = batchResults.filter(r => r.status === 'failed').length

    console.log(`🎉 Daily batch processing complete:`)
    console.log(`   📊 ${journals.length} journals processed`)
    console.log(`   🔗 ${relationshipBatches.length} relationships analyzed`) 
    console.log(`   💡 ${totalSuggestions} partner suggestions generated`)
    console.log(`   ✅ ${successfulBatches} successful, ❌ ${failedBatches} failed`)

    return NextResponse.json({
      success: true,
      batchDate: targetDate,
      summary: {
        journalsProcessed: journals.length,
        relationshipsAnalyzed: relationshipBatches.length,
        suggestionsGenerated: totalSuggestions,
        successfulBatches,
        failedBatches
      },
      results: batchResults,
      message: `Daily batch processing completed for ${targetDate}`
    })

  } catch (error) {
    console.error('❌ Daily batch processing error:', error)
    return NextResponse.json({ 
      error: 'Daily batch processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Helper function: Group journals by relationship
async function groupJournalsByRelationship(
  supabase: any, 
  journals: BatchJournal[]
): Promise<RelationshipBatch[]> {
  
  // Phase 9: First filter to only include journals from premium users
  console.log('🔍 Phase 9: Filtering for premium users only...')
  const userIds = [...new Set(journals.map(j => j.user_id))]
  
  // Get premium users
  const { data: premiumUsers } = await supabase
    .from('premium_subscriptions')
    .select('user_id')
    .eq('subscription_status', 'active')
    .in('user_id', userIds)
  
  const premiumUserIds = new Set(premiumUsers?.map(p => p.user_id) || [])
  
  // Filter journals to only premium users
  const premiumJournals = journals.filter(j => premiumUserIds.has(j.user_id))
  
  console.log(`📊 Phase 9: Filtered ${journals.length} journals to ${premiumJournals.length} from premium users`)
  
  // Get unique relationship IDs (excluding null relationship_ids)
  const relationshipIds = [...new Set(
    premiumJournals
      .filter(j => j.relationship_id) 
      .map(j => j.relationship_id)
  )] as string[]

  if (relationshipIds.length === 0) {
    console.log('ℹ️ No relationship-specific journals found from premium users for batching')
    return []
  }

  // Get relationship details and members
  const { data: relationships, error: relError } = await supabase
    .from('relationships')
    .select(`
      id,
      name,
      relationship_type,
      relationship_members (
        user_id,
        role,
        users (
          full_name,
          email
        )
      )
    `)
    .in('id', relationshipIds)

  if (relError || !relationships) {
    console.error('❌ Error fetching relationship details:', relError)
    return []
  }

  // Build relationship batches (using premium journals only)
  const relationshipBatches: RelationshipBatch[] = relationships.map((rel: any) => ({
    relationship_id: rel.id,
    relationship_name: rel.name,
    relationship_type: rel.relationship_type,
    journals: premiumJournals.filter(j => j.relationship_id === rel.id),
    members: rel.relationship_members.map((member: any) => ({
      user_id: member.user_id,
      user_name: member.users?.full_name || member.users?.email || 'Unknown',
      role: member.role
    }))
  }))

  return relationshipBatches.filter(batch => batch.journals.length > 0)
}

// Helper function: Generate suggestions for a relationship batch
async function generateBatchSuggestions(
  supabase: any,
  batch: RelationshipBatch,
  batchDate: string,
  batchId: string | null,
  baseUrl: string
): Promise<any[]> {
  
  const allSuggestions: any[] = []

  // For each member who didn't journal, generate suggestions based on others' journals
  for (const member of batch.members) {
    // Find journals from OTHER members (not this recipient)
    const othersJournals = batch.journals.filter(j => j.user_id !== member.user_id)
    
    if (othersJournals.length === 0) {
      console.log(`ℹ️ No journals from others for ${member.user_name}, skipping suggestions`)
      continue
    }

    console.log(`🤖 Generating batch suggestions for ${member.user_name} based on ${othersJournals.length} journal entries`)

    try {
      // Call the existing relationship generation endpoint with batch context
      const response = await fetch(`${baseUrl}/api/relationships/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          relationshipId: batch.relationship_id,
          sourceUserId: othersJournals[0].user_id, // Primary journal writer for this batch
          timeframeHours: 24, // Only look at today's batch
          maxSuggestions: 3,
          batchMode: true,
          batchDate,
          batchId
        })
      })

      if (response.ok) {
        const result = await response.json()
        const suggestions = result.result?.suggestions || []
        
        // Mark suggestions as part of this batch
        if (suggestions.length > 0) {
          await supabase
            .from('partner_suggestions')
            .update({
              batch_date: batchDate,
              batch_id: batchId
            })
            .eq('recipient_user_id', member.user_id)
            .eq('relationship_id', batch.relationship_id)
            .gte('created_at', new Date(new Date().getTime() - 5 * 60 * 1000).toISOString()) // Last 5 minutes
        }

        allSuggestions.push(...suggestions)
        console.log(`✅ Generated ${suggestions.length} suggestions for ${member.user_name}`)
        
      } else {
        const errorText = await response.text()
        console.error(`❌ Failed to generate batch suggestions for ${member.user_name}:`, response.status, errorText)
      }

    } catch (error) {
      console.error(`❌ Error generating batch suggestions for ${member.user_name}:`, error)
    }

    // Add small delay between API calls to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  return allSuggestions
}

// Helper function: Get yesterday's date in YYYY-MM-DD format
function getYesterday(): string {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return yesterday.toISOString().split('T')[0]
}

// Manual trigger endpoint for testing
export async function GET(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url)
  const date = url.searchParams.get('date') || getYesterday()
  
  console.log(`🔧 Manual batch trigger for date: ${date}`)

  return POST(new NextRequest(request.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date })
  }))
}