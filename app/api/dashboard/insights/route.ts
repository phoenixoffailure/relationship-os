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
    const relationshipId = searchParams.get('relationshipId') // Optional filter
    const hoursAgo = parseInt(searchParams.get('hoursAgo') || '48')
    const maxPerRelationship = parseInt(searchParams.get('maxPerRelationship') || '3')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // First try the database function, fallback to direct query if function doesn't exist
    let insights: any[] = []
    let insightsError: any = null

    try {
      const { data, error } = await supabase
        .rpc('get_unread_dashboard_insights', {
          p_user_id: userId,
          p_hours_ago: hoursAgo,
          p_max_per_relationship: maxPerRelationship
        })
      
      insights = data || []
      insightsError = error
    } catch (functionError) {
      console.log('Database function not available, using direct query fallback')
      
      // Fallback to direct query
      const { data, error } = await supabase
        .from('relationship_insights')
        .select('*')
        .eq('generated_for_user', userId)
        .or('read_status.is.null,read_status.eq.unread')
        .or('dashboard_dismissed.is.null,dashboard_dismissed.eq.false')
        .gte('created_at', new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(maxPerRelationship * 5) // Get more and filter later

      insights = data || []
      insightsError = error
    }

    if (insightsError) {
      console.error('Error fetching dashboard insights:', insightsError)
      return NextResponse.json(
        { error: 'Failed to fetch insights' },
        { status: 500 }
      )
    }

    // Get relationship details for each insight
    const enrichedInsights = await Promise.all(
      (insights || []).map(async (insight: any) => {
        const { data: relationship } = await supabase
          .from('relationships')
          .select('name, relationship_type')
          .eq('id', insight.relationship_id)
          .single()

        return {
          id: insight.id,
          relationship_id: insight.relationship_id,
          relationship_name: relationship?.name || 'Unknown',
          relationship_type: relationship?.relationship_type || 'other',
          title: insight.title,
          description: insight.description,
          pillar_type: insight.pillar_type,
          priority: insight.priority,
          relevance_score: insight.relevance_score,
          created_at: insight.created_at,
          suggested_actions: [] // Could be populated from a suggestions table
        }
      })
    )

    // Filter by relationship if specified
    const filteredInsights = relationshipId
      ? enrichedInsights.filter(insight => insight.relationship_id === relationshipId)
      : enrichedInsights

    // Sort by priority and recency
    const sortedInsights = filteredInsights.sort((a, b) => {
      // Priority sorting: high > medium > low
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      const priorityDiff = (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
                          (priorityOrder[a.priority as keyof typeof priorityOrder] || 0)
      
      if (priorityDiff !== 0) return priorityDiff
      
      // Then by relevance score
      const scoreDiff = (b.relevance_score || 0) - (a.relevance_score || 0)
      if (scoreDiff !== 0) return scoreDiff
      
      // Finally by recency
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })

    return NextResponse.json({
      insights: sortedInsights,
      total_count: sortedInsights.length,
      filtered_by_relationship: relationshipId || null,
      hours_window: hoursAgo
    })

  } catch (error) {
    console.error('Dashboard insights API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}