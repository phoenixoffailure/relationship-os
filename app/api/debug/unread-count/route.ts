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
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    console.log(`🔍 Debugging unread count for user: ${userId}`)

    // Get all unread insights
    const { data: insights, error: insightsError } = await supabase
      .from('relationship_insights')
      .select('id, title, created_at, relationship_id, read_status, dashboard_dismissed')
      .eq('generated_for_user', userId)
      .or('read_status.is.null,read_status.eq.unread')
      .or('dashboard_dismissed.is.null,dashboard_dismissed.eq.false')
      .order('created_at', { ascending: false })

    // Get all unread suggestions
    const { data: suggestions, error: suggestionsError } = await supabase
      .from('partner_suggestions')
      .select('id, suggestion_text, created_at, relationship_id, read_status, dashboard_dismissed')
      .eq('recipient_user_id', userId)
      .or('read_status.is.null,read_status.eq.unread')
      .or('dashboard_dismissed.is.null,dashboard_dismissed.eq.false')
      .order('created_at', { ascending: false })

    // Get relationship names for context
    const { data: relationships } = await supabase
      .from('relationships')
      .select('id, name')

    const relationshipMap = (relationships || []).reduce((acc: any, rel) => {
      acc[rel.id] = rel.name
      return acc
    }, {})

    // Group by age
    const now = new Date()
    const groupByAge = (items: any[]) => {
      const groups = {
        'last_24h': [] as any[],
        'last_7d': [] as any[],
        'last_30d': [] as any[],
        'older': [] as any[]
      }

      items.forEach(item => {
        const age = now.getTime() - new Date(item.created_at).getTime()
        const days = age / (1000 * 60 * 60 * 24)

        if (days <= 1) groups.last_24h.push(item)
        else if (days <= 7) groups.last_7d.push(item)
        else if (days <= 30) groups.last_30d.push(item)
        else groups.older.push(item)
      })

      return groups
    }

    const insightGroups = groupByAge(insights || [])
    const suggestionGroups = groupByAge(suggestions || [])

    // Analysis
    const analysis = {
      total_unread: (insights?.length || 0) + (suggestions?.length || 0),
      insights: {
        total: insights?.length || 0,
        by_age: {
          last_24h: insightGroups.last_24h.length,
          last_7d: insightGroups.last_7d.length,
          last_30d: insightGroups.last_30d.length,
          older: insightGroups.older.length
        },
        by_relationship: {} as Record<string, number>
      },
      suggestions: {
        total: suggestions?.length || 0,
        by_age: {
          last_24h: suggestionGroups.last_24h.length,
          last_7d: suggestionGroups.last_7d.length,
          last_30d: suggestionGroups.last_30d.length,
          older: suggestionGroups.older.length
        },
        by_relationship: {} as Record<string, number>
      }
    }

    // Count by relationship
    ;(insights || []).forEach(insight => {
      const relName = relationshipMap[insight.relationship_id] || 'Unknown'
      analysis.insights.by_relationship[relName] = (analysis.insights.by_relationship[relName] || 0) + 1
    })

    ;(suggestions || []).forEach(suggestion => {
      const relName = relationshipMap[suggestion.relationship_id] || 'Unknown'
      analysis.suggestions.by_relationship[relName] = (analysis.suggestions.by_relationship[relName] || 0) + 1
    })

    return NextResponse.json({
      analysis,
      sample_insights: insights?.slice(0, 5).map(i => ({
        id: i.id,
        title: i.title,
        created_at: i.created_at,
        relationship: relationshipMap[i.relationship_id] || 'Unknown',
        read_status: i.read_status,
        dashboard_dismissed: i.dashboard_dismissed
      })),
      sample_suggestions: suggestions?.slice(0, 5).map(s => ({
        id: s.id,
        text: s.suggestion_text?.substring(0, 100) + '...',
        created_at: s.created_at,
        relationship: relationshipMap[s.relationship_id] || 'Unknown',
        read_status: s.read_status,
        dashboard_dismissed: s.dashboard_dismissed
      })),
      recommendation: analysis.total_unread > 20 ? 
        "Consider bulk marking old items as read or running cleanup" : 
        "Unread count looks normal"
    })

  } catch (error) {
    console.error('Debug unread count error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}