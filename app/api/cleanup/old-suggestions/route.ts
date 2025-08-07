import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { userId, daysOld = 30, dryRun = false } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    console.log(`🧹 ${dryRun ? 'DRY RUN:' : ''} Cleaning up partner suggestions older than ${daysOld} days for user: ${userId}`)

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    // First, get count of what would be affected
    const { count: totalCount } = await supabase
      .from('partner_suggestions')
      .select('*', { count: 'exact' })
      .eq('recipient_user_id', userId)

    const { count: oldCount } = await supabase
      .from('partner_suggestions')
      .select('*', { count: 'exact' })
      .eq('recipient_user_id', userId)
      .lt('created_at', cutoffDate.toISOString())

    const { count: oldUnreadCount } = await supabase
      .from('partner_suggestions')
      .select('*', { count: 'exact' })
      .eq('recipient_user_id', userId)
      .or('read_status.is.null,read_status.eq.unread')
      .lt('created_at', cutoffDate.toISOString())

    if (dryRun) {
      return NextResponse.json({
        dry_run: true,
        user_id: userId,
        cutoff_date: cutoffDate.toISOString(),
        analysis: {
          total_partner_suggestions: totalCount || 0,
          old_suggestions: oldCount || 0,
          old_unread_suggestions: oldUnreadCount || 0
        },
        recommendation: oldUnreadCount > 0 ? 
          `Would mark ${oldUnreadCount} old unread suggestions as read` :
          'No old unread suggestions to clean up',
        next_step: 'Set dryRun=false to perform actual cleanup'
      })
    }

    // Actually perform the cleanup
    const { data: markedAsRead, error: markError } = await supabase
      .from('partner_suggestions')
      .update({
        read_status: 'read',
        read_at: new Date().toISOString()
      })
      .eq('recipient_user_id', userId)
      .or('read_status.is.null,read_status.eq.unread')
      .lt('created_at', cutoffDate.toISOString())
      .select('id, created_at, suggestion_text')

    if (markError) {
      console.error('Error marking old suggestions as read:', markError)
      return NextResponse.json(
        { error: 'Failed to mark old suggestions as read', details: markError },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      user_id: userId,
      cutoff_date: cutoffDate.toISOString(),
      results: {
        marked_as_read: markedAsRead?.length || 0,
        total_before: totalCount || 0,
        old_suggestions_before: oldCount || 0,
        old_unread_before: oldUnreadCount || 0
      },
      sample_cleaned: (markedAsRead || []).slice(0, 3).map(s => ({
        id: s.id,
        created_at: s.created_at,
        preview: s.suggestion_text?.substring(0, 50) + '...'
      })),
      message: `Successfully marked ${markedAsRead?.length || 0} old partner suggestions as read`
    })

  } catch (error) {
    console.error('Cleanup old suggestions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// GET endpoint to check what would be cleaned up
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const daysOld = parseInt(searchParams.get('daysOld') || '30')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required as query parameter' },
        { status: 400 }
      )
    }

    // Just do a dry run analysis
    const response = await fetch(request.url.replace('/cleanup/old-suggestions', '/cleanup/old-suggestions'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        daysOld,
        dryRun: true
      })
    })

    return response

  } catch (error) {
    console.error('Cleanup check error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}