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
    const relationshipId = searchParams.get('relationshipId')

    if (!userId || !relationshipId) {
      return NextResponse.json(
        { error: 'User ID and Relationship ID are required' },
        { status: 400 }
      )
    }

    console.log(`🏥 Health Score Debug for user: ${userId}, relationship: ${relationshipId}`)

    // Get relationship name
    const { data: relationship } = await supabase
      .from('relationships')
      .select('name')
      .eq('id', relationshipId)
      .single()

    // Get recent journal entries for this relationship (last 30 days)
    const { data: recentEntries } = await supabase
      .from('journal_entries')
      .select('mood_score, created_at')
      .eq('relationship_id', relationshipId)
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })

    // Get recent check-ins (last 30 days)
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
      .eq('relationship_id', relationshipId)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    const lastActivity = lastEntry?.created_at

    // Calculate all the factors
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

    // Health score calculation step by step
    let baseScore = 50
    let scoreBreakdown = {
      starting_score: 50,
      activity_bonus: 0,
      mood_bonus: 0,
      recency_penalty: 0,
      consistency_bonus: 0,
      final_score: 0
    }

    // Activity frequency bonus (0-25 points)
    if (journalCount + checkinCount > 10) {
      scoreBreakdown.activity_bonus = 25
    } else if (journalCount + checkinCount > 5) {
      scoreBreakdown.activity_bonus = 15
    } else if (journalCount + checkinCount > 2) {
      scoreBreakdown.activity_bonus = 10
    } else if (journalCount + checkinCount > 0) {
      scoreBreakdown.activity_bonus = 5
    }
    baseScore += scoreBreakdown.activity_bonus

    // Mood quality bonus (-25 to +25 points)
    const avgMood = (avgMoodFromJournals + avgConnectionFromCheckins) / 2
    scoreBreakdown.mood_bonus = Math.round((avgMood - 5) * 5) // Convert 1-10 scale to -20 to +25 points
    baseScore += scoreBreakdown.mood_bonus

    // Recency penalty (0 to -20 points)
    if (daysSinceLastActivity > 14) {
      scoreBreakdown.recency_penalty = -20
    } else if (daysSinceLastActivity > 7) {
      scoreBreakdown.recency_penalty = -10
    } else if (daysSinceLastActivity > 3) {
      scoreBreakdown.recency_penalty = -5
    }
    baseScore += scoreBreakdown.recency_penalty

    // Engagement consistency bonus (0-10 points)
    const engagementDays = new Set([
      ...(recentEntries || []).map(e => new Date(e.created_at).toDateString()),
      ...(recentCheckins || []).map(c => new Date(c.created_at).toDateString())
    ]).size
    if (engagementDays > 15) {
      scoreBreakdown.consistency_bonus = 10
    } else if (engagementDays > 10) {
      scoreBreakdown.consistency_bonus = 7
    } else if (engagementDays > 5) {
      scoreBreakdown.consistency_bonus = 5
    }
    baseScore += scoreBreakdown.consistency_bonus

    scoreBreakdown.final_score = Math.max(10, Math.min(100, baseScore))

    // Calculate trend
    const recentAvgMood = recentEntries?.slice(0, 5).reduce((sum, e) => sum + (e.mood_score || 5), 0) / Math.min(5, recentEntries?.length || 1) || 5
    const olderAvgMood = recentEntries?.slice(5, 10).reduce((sum, e) => sum + (e.mood_score || 5), 0) / Math.min(5, Math.max(0, (recentEntries?.length || 0) - 5)) || 5
    
    let trend = 'stable'
    if (recentAvgMood > olderAvgMood + 0.5) trend = 'improving'
    else if (recentAvgMood < olderAvgMood - 0.5) trend = 'declining'

    return NextResponse.json({
      relationship_name: relationship?.name || 'Unknown',
      health_score: scoreBreakdown.final_score,
      trend,
      score_breakdown: scoreBreakdown,
      raw_data: {
        journal_entries_last_30_days: journalCount,
        daily_checkins_last_30_days: checkinCount,
        avg_mood_from_journals: Math.round(avgMoodFromJournals * 10) / 10,
        avg_connection_from_checkins: Math.round(avgConnectionFromCheckins * 10) / 10,
        combined_avg_mood: Math.round(avgMood * 10) / 10,
        days_since_last_activity: daysSinceLastActivity,
        unique_engagement_days: engagementDays,
        last_activity_date: lastActivity
      },
      explanation: {
        "What this score means": "This is YOUR engagement health with this relationship",
        "Activity Bonus": `+${scoreBreakdown.activity_bonus} points for ${journalCount + checkinCount} total activities (journals + check-ins)`,
        "Mood Quality": `${scoreBreakdown.mood_bonus >= 0 ? '+' : ''}${scoreBreakdown.mood_bonus} points based on average mood of ${Math.round(avgMood * 10) / 10}/10`,
        "Recency Factor": `${scoreBreakdown.recency_penalty} points (${daysSinceLastActivity} days since last activity)`,
        "Consistency": `+${scoreBreakdown.consistency_bonus} points for engaging across ${engagementDays} different days`
      }
    })

  } catch (error) {
    console.error('Health score debug error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}