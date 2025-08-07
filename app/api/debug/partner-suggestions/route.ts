import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required', example: '/api/debug/partner-suggestions?userId=YOUR_USER_ID' },
        { status: 400 }
      )
    }

    console.log(`💕 Checking partner suggestions for user: ${userId}`)

    // Get all partner suggestions for this user
    const { data: suggestions, error } = await supabase
      .from('partner_suggestions')
      .select(`
        id,
        suggestion_text,
        created_at,
        read_status,
        dashboard_dismissed,
        relationship_id,
        source_user_id,
        priority_score,
        expires_at
      `)
      .eq('recipient_user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching partner suggestions:', error)
      return NextResponse.json(
        { error: 'Failed to fetch partner suggestions', details: error },
        { status: 500 }
      )
    }

    // Get relationship names
    const { data: relationships } = await supabase
      .from('relationships')
      .select('id, name')

    const relationshipMap = (relationships || []).reduce((acc: any, rel) => {
      acc[rel.id] = rel.name
      return acc
    }, {})

    // Categorize suggestions
    const now = new Date()
    const categorized = {
      unread: [] as any[],
      read: [] as any[],
      dismissed: [] as any[],
      expired: [] as any[]
    }

    const enrichedSuggestions = (suggestions || []).map(suggestion => {
      const isExpired = suggestion.expires_at && new Date(suggestion.expires_at) < now
      const isRead = suggestion.read_status === 'read'
      const isDismissed = suggestion.dashboard_dismissed === true
      
      const enriched = {
        ...suggestion,
        relationship_name: relationshipMap[suggestion.relationship_id] || 'Unknown',
        age_days: Math.floor((now.getTime() - new Date(suggestion.created_at).getTime()) / (1000 * 60 * 60 * 24)),
        status: isExpired ? 'expired' : isDismissed ? 'dismissed' : isRead ? 'read' : 'unread'
      }

      if (isExpired) categorized.expired.push(enriched)
      else if (isDismissed) categorized.dismissed.push(enriched)
      else if (isRead) categorized.read.push(enriched)
      else categorized.unread.push(enriched)

      return enriched
    })

    // Count for dashboard
    const unreadCount = categorized.unread.length

    return NextResponse.json({
      user_id: userId,
      summary: {
        total_suggestions: enrichedSuggestions.length,
        unread_count: unreadCount,
        read_count: categorized.read.length,
        dismissed_count: categorized.dismissed.length,
        expired_count: categorized.expired.length
      },
      unread_suggestions: categorized.unread.map(s => ({
        id: s.id,
        text: s.suggestion_text?.substring(0, 100) + (s.suggestion_text?.length > 100 ? '...' : ''),
        relationship: s.relationship_name,
        age_days: s.age_days,
        created_at: s.created_at
      })),
      analysis: {
        oldest_unread: categorized.unread.length > 0 ? 
          Math.max(...categorized.unread.map(s => s.age_days)) : 0,
        newest_unread: categorized.unread.length > 0 ? 
          Math.min(...categorized.unread.map(s => s.age_days)) : 0,
        recommendation: unreadCount > 10 ? 
          'Consider marking old suggestions as read or running cleanup' : 
          unreadCount > 0 ? 
            'You have partner suggestions waiting for your attention' :
            'No unread partner suggestions'
      }
    })

  } catch (error) {
    console.error('Partner suggestions debug error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}