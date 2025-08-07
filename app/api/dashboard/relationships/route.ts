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

    // Get all relationships where user is a member (matches existing system pattern)
    const { data: membershipData, error: relationshipsError } = await supabase
      .from('relationship_members')
      .select(`
        relationship_id,
        relationships (
          id,
          name,
          relationship_type,
          created_at
        )
      `)
      .eq('user_id', userId)

    if (relationshipsError) {
      console.error('Error fetching relationship memberships:', relationshipsError)
      return NextResponse.json(
        { error: 'Failed to fetch relationships' },
        { status: 500 }
      )
    }

    // Extract relationships from membership data
    const relationships = (membershipData || [])
      .filter(member => member.relationships !== null)
      .map(member => member.relationships!)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    // Get health scores and unread counts for each relationship
    const enrichedRelationships = await Promise.all(
      relationships.map(async (relationship) => {
        // Get health score from relationship_health_scores table
        const { data: healthData } = await supabase
          .from('relationship_health_scores')
          .select('health_score, trend, last_activity, unread_insights_count, unread_suggestions_count')
          .eq('relationship_id', relationship.id)
          .eq('user_id', userId)
          .single()

        // Only count partner suggestions (not personal insights) for unread notifications
        const { count: unreadSuggestions, error: suggestionsCountError } = await supabase
          .from('partner_suggestions')
          .select('*', { count: 'exact' })
          .eq('relationship_id', relationship.id)
          .eq('recipient_user_id', userId)
          .or('read_status.is.null,read_status.eq.unread')
          .or('dashboard_dismissed.is.null,dashboard_dismissed.eq.false')

        // Debug logging
        if (suggestionsCountError) {
          console.error('Error counting partner suggestions:', suggestionsCountError)
        }

        console.log(`💕 Relationship ${relationship.name}: ${unreadSuggestions || 0} unread partner suggestions`)

        // Calculate relationship-specific health score
        let healthScore = healthData?.health_score || 75
        let trend = healthData?.trend || 'stable'
        let lastActivity = healthData?.last_activity

        // Enhanced health calculation for relationship cards
        if (!healthData) {
          // Get recent journal entries for this relationship
          const { data: recentEntries } = await supabase
            .from('journal_entries')
            .select('mood_score, created_at')
            .eq('relationship_id', relationship.id)
            .eq('user_id', userId)
            .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
            .order('created_at', { ascending: false })

          // Get recent check-ins for this relationship
          const { data: recentCheckins } = await supabase
            .from('daily_checkins')
            .select('connection_score, mood_score, created_at')
            .eq('user_id', userId)
            .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
            .order('created_at', { ascending: false })

          // Get last activity
          const { data: lastEntry } = await supabase
            .from('journal_entries')
            .select('created_at')
            .eq('relationship_id', relationship.id)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          lastActivity = lastEntry?.created_at || relationship.created_at

          // Advanced health calculation based on multiple factors
          const journalCount = recentEntries?.length || 0
          const checkinCount = recentCheckins?.length || 0
          const avgMoodFromJournals = journalCount > 0 
            ? recentEntries!.reduce((sum, entry) => sum + (entry.mood_score || 5), 0) / journalCount
            : 5
          const avgConnectionFromCheckins = checkinCount > 0
            ? recentCheckins!.reduce((sum, checkin) => sum + (checkin.connection_score || 5), 0) / checkinCount 
            : 5

          // Calculate recency factor
          const daysSinceLastActivity = lastActivity 
            ? Math.floor((Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60 * 24))
            : 30

          // Health score algorithm (0-100)
          let baseScore = 50
          
          // Activity frequency bonus (0-25 points)
          if (journalCount + checkinCount > 10) baseScore += 25
          else if (journalCount + checkinCount > 5) baseScore += 15
          else if (journalCount + checkinCount > 2) baseScore += 10
          else if (journalCount + checkinCount > 0) baseScore += 5

          // Mood quality bonus (0-25 points)
          const avgMood = (avgMoodFromJournals + avgConnectionFromCheckins) / 2
          baseScore += Math.round((avgMood - 5) * 5) // Convert 1-10 scale to -20 to +25 points

          // Recency penalty (0 to -20 points)
          if (daysSinceLastActivity > 14) baseScore -= 20
          else if (daysSinceLastActivity > 7) baseScore -= 10
          else if (daysSinceLastActivity > 3) baseScore -= 5

          // Engagement consistency bonus (0-10 points)
          const engagementDays = new Set([
            ...(recentEntries || []).map(e => new Date(e.created_at).toDateString()),
            ...(recentCheckins || []).map(c => new Date(c.created_at).toDateString())
          ]).size
          if (engagementDays > 15) baseScore += 10
          else if (engagementDays > 10) baseScore += 7
          else if (engagementDays > 5) baseScore += 5

          healthScore = Math.max(10, Math.min(100, baseScore))

          // Calculate trend based on recent vs older data
          const recentAvgMood = recentEntries?.slice(0, 5).reduce((sum, e) => sum + (e.mood_score || 5), 0) / Math.min(5, recentEntries?.length || 1) || 5
          const olderAvgMood = recentEntries?.slice(5, 10).reduce((sum, e) => sum + (e.mood_score || 5), 0) / Math.min(5, Math.max(0, (recentEntries?.length || 0) - 5)) || 5
          
          if (recentAvgMood > olderAvgMood + 0.5) trend = 'improving'
          else if (recentAvgMood < olderAvgMood - 0.5) trend = 'declining'
          else trend = 'stable'
        }

        // Determine if needs attention (based on health score and partner suggestions only)
        const needsAttention = healthScore < 60 || (unreadSuggestions || 0) > 3

        return {
          id: relationship.id,
          name: relationship.name,
          type: relationship.relationship_type,
          health_score: healthScore,
          trend,
          unread_insights: 0, // Don't show personal insights in notification count
          unread_suggestions: unreadSuggestions || 0, // Only show partner suggestions
          last_activity: lastActivity || relationship.created_at,
          needs_attention: needsAttention
        }
      })
    )

    return NextResponse.json({
      relationships: enrichedRelationships,
      total_count: relationships.length,
      total_unread: enrichedRelationships.reduce(
        (sum, rel) => sum + rel.unread_suggestions, // Only partner suggestions count as notifications
        0
      )
    })

  } catch (error) {
    console.error('Dashboard relationships API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}