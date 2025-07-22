import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface ActivityItem {
  id: string
  type: 'journal' | 'checkin' | 'insight' | 'relationship'
  title: string
  description?: string
  time: string
  data?: {
    mood_score?: number
    connection_score?: number
    relationship_id?: string
    insight_type?: string
    relationship_name?: string
    relationship_type?: string
  }
}

interface RelationshipData {
  id: string
  name: string
  relationship_type: string
}

export function useRecentActivity(userId: string, limit: number = 10) {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    if (userId) {
      loadRecentActivity()
    }
  }, [userId, limit])

  const loadRecentActivity = async () => {
    setLoading(true)
    try {
      // Get recent activities from multiple tables
      const [journalData, checkinData, insightData, relationshipData] = await Promise.all([
        // Recent journal entries
        supabase
          .from('journal_entries')
          .select('id, created_at, mood_score')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(5),

        // Recent check-ins
        supabase
          .from('daily_checkins')
          .select('id, created_at, connection_score, mood_score, relationship_id')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(5),

        // Recent insights
        supabase
          .from('relationship_insights')
          .select('id, created_at, title, insight_type')
          .eq('generated_for_user', userId)
          .order('created_at', { ascending: false })
          .limit(5),

        // Recent relationship activities
        supabase
          .from('relationship_members')
          .select(`
            id, 
            joined_at,
            relationships (
              id,
              name,
              relationship_type
            )
          `)
          .eq('user_id', userId)
          .order('joined_at', { ascending: false })
          .limit(3)
      ])

      const allActivities: ActivityItem[] = []

      // Process journal entries
      if (journalData.data) {
        journalData.data.forEach((entry: any) => {
          allActivities.push({
            id: `journal-${entry.id}`,
            type: 'journal',
            title: 'Journal Entry',
            description: `Reflected on your day (mood: ${entry.mood_score}/10)`,
            time: entry.created_at,
            data: { mood_score: entry.mood_score }
          })
        })
      }

      // Process check-ins
      if (checkinData.data) {
        checkinData.data.forEach((checkin: any) => {
          allActivities.push({
            id: `checkin-${checkin.id}`,
            type: 'checkin',
            title: checkin.relationship_id ? 'Relationship Check-In' : 'Daily Check-In',
            description: `Connection: ${checkin.connection_score}/10, Mood: ${checkin.mood_score}/10`,
            time: checkin.created_at,
            data: { 
              connection_score: checkin.connection_score, 
              mood_score: checkin.mood_score,
              relationship_id: checkin.relationship_id 
            }
          })
        })
      }

      // Process insights
      if (insightData.data) {
        insightData.data.forEach((insight: any) => {
          allActivities.push({
            id: `insight-${insight.id}`,
            type: 'insight',
            title: insight.title,
            description: `New ${insight.insight_type} insight generated`,
            time: insight.created_at,
            data: { insight_type: insight.insight_type }
          })
        })
      }

      // Process relationship activities
      if (relationshipData.data) {
        relationshipData.data.forEach((member: any) => {
          if (member.relationships) {
            const rel = member.relationships as RelationshipData
            allActivities.push({
              id: `relationship-${member.id}`,
              type: 'relationship',
              title: 'Connected to Partner',
              description: `Joined ${rel.name}`,
              time: member.joined_at,
              data: { 
                relationship_name: rel.name,
                relationship_type: rel.relationship_type 
              }
            })
          }
        })
      }

      // Sort all activities by time and limit
      allActivities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      setActivities(allActivities.slice(0, limit))

    } catch (error) {
      console.error('Error loading recent activity:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatActivityTime = (timeString: string) => {
    const date = new Date(timeString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) {
      const hours = diffInHours
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`
    }
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`
    }
    
    // Show actual date for older items
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    })
  }

  const getActivityBgColor = (type: string) => {
    switch (type) {
      case 'journal': return 'bg-mint-100'
      case 'checkin': return 'bg-calm-100'
      case 'insight': return 'bg-purple-100'
      case 'relationship': return 'bg-pink-100'
      default: return 'bg-gray-100'
    }
  }

  return {
    activities,
    loading,
    formatActivityTime,
    getActivityBgColor,
    refresh: loadRecentActivity
  }
}