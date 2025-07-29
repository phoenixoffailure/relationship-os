// app/(protected)/dashboard/page.tsx
// COMPLETE PRODUCTION VERSION - All features preserved, unified colors & mobile responsive

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createBrowserClient } from '@supabase/ssr'
import SharedInsights from '@/components/SharedInsights'
import RecentActivity from '@/components/RecentActivity'
import { PartnerSuggestions } from '@/components/dashboard/PartnerSuggestions'
import { Database } from '@/lib/types/database'

// Use exact database types
type RelationshipInsightRow = Database['public']['Tables']['relationship_insights']['Row']
type RelationshipMemberRow = Database['public']['Tables']['relationship_members']['Row']
type RelationshipRow = Database['public']['Tables']['relationships']['Row']

interface ScoreData {
  currentScore: number | null
  trend: number
  lastWeekAvg: number
  totalCheckins: number
  daysActive: number
  components: any
}

type Insight = RelationshipInsightRow

interface RelationshipWithMember {
  id: string
  name: string
  relationship_type: string
  myRole?: string | null
}

interface RelationshipMemberWithRelationship extends RelationshipMemberRow {
  relationships: RelationshipRow | null
}

export default function DashboardPage() {
  // State management
  const [connectionScore, setConnectionScore] = useState<number>(50)
  const [scoreLoading, setScoreLoading] = useState(true)
  const [scoreData, setScoreData] = useState<ScoreData>({
    currentScore: 50,
    trend: 0,
    lastWeekAvg: 50,
    totalCheckins: 0,
    daysActive: 0,
    components: null
  })
  
  const [user, setUser] = useState<any>(null)
  const [insights, setInsights] = useState<Insight[]>([])
  const [loadingInsights, setLoadingInsights] = useState(false)
  const [generatingInsights, setGeneratingInsights] = useState(false)
  const [message, setMessage] = useState('')
  
  // Relationship state
  const [relationships, setRelationships] = useState<RelationshipWithMember[]>([])
  const [activeRelationship, setActiveRelationship] = useState<RelationshipWithMember | null>(null)
  const [showSharedInsights, setShowSharedInsights] = useState(false)
  
  // Partner suggestions state
  const [showPartnerSuggestions, setShowPartnerSuggestions] = useState(true)
  const [suggestionCount, setSuggestionCount] = useState(0)
  const [lastSuggestionRefresh, setLastSuggestionRefresh] = useState<Date>(new Date())
  
  // Score feedback state
  const [showScoreFeedback, setShowScoreFeedback] = useState(false)
  const [scoreFeedback, setScoreFeedback] = useState<'too_high' | 'too_low' | 'just_right' | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        loadUserData(user.id)
      }
    }
    getUser()
  }, [])

  // Auto-refresh suggestions every 2 minutes
  useEffect(() => {
    if (!user) return
    
    const interval = setInterval(() => {
      loadSuggestionCount(user.id)
      setLastSuggestionRefresh(new Date())
    }, 2 * 60 * 1000) // 2 minutes

    return () => clearInterval(interval)
  }, [user])

  const loadUserData = async (userId: string) => {
    await Promise.all([
      loadConnectionScore(userId),
      loadInsights(userId),
      loadRelationships(userId),
      loadSuggestionCount(userId)
    ])
  }

  const loadConnectionScore = async (userId: string) => {
    try {
      setScoreLoading(true)
      
      const { data: checkins, error } = await supabase
        .from('daily_checkins')
        .select('connection_score, mood_score, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(14)

      if (error) {
        console.error('Error loading connection scores:', error)
        return
      }

      if (!checkins || checkins.length === 0) {
        setScoreData((prevData) => ({ ...prevData, currentScore: null }))
        setConnectionScore(50)
        setScoreLoading(false)
        return
      }

      const latestScore = checkins[0]?.connection_score || 50
      const scores = checkins.map(c => c.connection_score).filter((s): s is number => s !== null)
      const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 50

      setConnectionScore(latestScore)
      setScoreData({
        currentScore: latestScore,
        trend: scores.length > 1 ? latestScore - scores[1] : 0,
        lastWeekAvg: avgScore,
        totalCheckins: checkins.length,
        daysActive: new Set(checkins.map(c => new Date(c.created_at).toDateString())).size,
        components: null
      })

    } catch (error) {
      console.error('Error loading connection score:', error)
    } finally {
      setScoreLoading(false)
    }
  }

  const loadInsights = async (userId: string) => {
    try {
      setLoadingInsights(true)
      
      const { data, error } = await supabase
        .from('relationship_insights')
        .select('*')
        .eq('generated_for_user', userId)
        .order('created_at', { ascending: false })
        .limit(5)

      if (data && !error) {
        setInsights(data as Insight[])
      }
    } catch (error) {
      console.error('Error loading insights:', error)
    } finally {
      setLoadingInsights(false)
    }
  }

  const loadRelationships = async (userId: string) => {
    try {
      const { data: relationshipData, error } = await supabase
        .from('relationship_members')
        .select(`
          *,
          relationships (*)
        `)
        .eq('user_id', userId)

      if (relationshipData && !error) {
        const typedData = relationshipData as RelationshipMemberWithRelationship[]
        const relationshipsList = typedData
          .filter(r => r.relationships !== null)
          .map(r => ({
            id: r.relationships!.id,
            name: r.relationships!.name,
            relationship_type: r.relationships!.relationship_type,
            myRole: r.role
          }))
        setRelationships(relationshipsList)
        if (relationshipsList.length > 0) {
          setActiveRelationship(relationshipsList[0])
        }
      }
    } catch (error) {
      console.error('Error loading relationships:', error)
    }
  }

  const loadSuggestionCount = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('partner_suggestions')
        .select('id, created_at')
        .eq('recipient_user_id', userId)
        .or('expires_at.is.null,expires_at.gte.' + new Date().toISOString())
        .order('created_at', { ascending: false })

      if (!error && data) {
        setSuggestionCount(data.length)
        console.log(`💕 Found ${data.length} partner suggestions for user`)
      }
    } catch (error) {
      console.error('Error loading suggestion count:', error)
    }
  }

  const generateInsights = async () => {
    if (!user) return
    
    setGeneratingInsights(true)
    try {
      const response = await fetch('/api/insights/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()
      
      if (result.success) {
        setMessage('✅ New insights generated! AI analysis will also trigger partner suggestions.')
        setTimeout(() => setMessage(''), 5000)
        loadInsights(user.id)
        // Refresh suggestion count after generating insights
        setTimeout(() => loadSuggestionCount(user.id), 3000)
      } else {
        setMessage('❌ Error generating insights. Please try again.')
        setTimeout(() => setMessage(''), 5000)
      }
    } catch (error) {
      console.error('Error generating insights:', error)
      setMessage('❌ Error generating insights. Please try again.')
      setTimeout(() => setMessage(''), 5000)
    } finally {
      setGeneratingInsights(false)
    }
  }

  const submitScoreFeedback = async (feedback: 'too_high' | 'too_low' | 'just_right') => {
    setScoreFeedback(feedback)
    setShowScoreFeedback(false)
    console.log('Score feedback submitted:', feedback)
  }

  const getPriorityColor = (priority: string | null) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-red-500'
      case 'medium': return 'bg-orange-500'
      case 'low': return 'bg-green-500'
      default: return 'bg-gray-500'
    }
  }

  const getInsightTypeIcon = (type: string) => {
    switch (type) {
      case 'suggestion': return '💡'
      case 'appreciation': return '❤️'
      case 'milestone': return '🎉'
      case 'pattern': return '📊'
      case 'personal_growth': return '🌱'
      default: return '✨'
    }
  }

  const formatInsightTime = (timestamp: string | null) => {
    if (!timestamp) return 'Recently'
    
    const date = new Date(timestamp)
    const now = new Date()
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    return date.toLocaleDateString()
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-calm-50 to-mint-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-calm-300 border-t-calm-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-calm-50 to-mint-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Status Message */}
        {message && (
          <div className="mb-6 p-4 bg-calm-50 border border-calm-200 rounded-xl">
            <p className="text-calm-800">{message}</p>
          </div>
        )}

        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Welcome back! 👋
          </h1>
          <p className="text-gray-600">
            Here's what's happening in your relationship journey.
          </p>
        </div>

        {/* Connection Score */}
        <div className="mb-6 sm:mb-8">
          <div className="bg-gradient-to-r from-calm-100 to-mint-100 rounded-xl p-4 sm:p-6 border border-calm-200 backdrop-blur-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="mb-4 sm:mb-0">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Connection Score</h2>
                {scoreLoading ? (
                  <div className="animate-pulse">
                    <div className="h-6 sm:h-8 bg-gray-200 rounded w-16 sm:w-20 mb-2"></div>
                    <div className="h-3 sm:h-4 bg-gray-200 rounded w-24 sm:w-32"></div>
                  </div>
                ) : (
                  <div>
                    <div className="text-2xl sm:text-3xl font-bold text-calm-600 mb-1">
                      {scoreData.currentScore || 'N/A'}/10
                    </div>
                    <p className="text-gray-600 text-xs sm:text-sm">
                      {scoreData.currentScore 
                        ? `Based on ${scoreData.totalCheckins} check-ins over ${scoreData.daysActive} days`
                        : 'Complete your first daily check-in to see your score'
                      }
                    </p>
                  </div>
                )}
              </div>
              <div className="text-left sm:text-right">
                <button 
                  onClick={() => setShowScoreFeedback(!showScoreFeedback)}
                  className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  How accurate is this? 🤔
                </button>
                
                {showScoreFeedback && (
                  <div className="mt-3 p-3 sm:p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-calm-100">
                    <p className="text-xs sm:text-sm text-gray-700 mb-3">How does this score feel to you?</p>
                    <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-2">
                      <Button
                        onClick={() => submitScoreFeedback('too_low')}
                        size="sm"
                        variant="outline"
                        className="border-orange-300 text-orange-700 hover:bg-orange-50"
                      >
                        Too Low
                      </Button>
                      <Button
                        onClick={() => submitScoreFeedback('just_right')}
                        size="sm"
                        variant="outline"
                        className="border-green-300 text-green-700 hover:bg-green-50"
                      >
                        Just Right
                      </Button>
                      <Button
                        onClick={() => submitScoreFeedback('too_high')}
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-700 hover:bg-red-50"
                      >
                        Too High
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Shared Insights Section */}
        {showSharedInsights && activeRelationship && (
          <div className="mb-6 sm:mb-8">
            <SharedInsights 
              relationshipId={activeRelationship.id}
              currentUserId={user?.id}
              privacyLevel="patterns"
            />
          </div>
        )}

        {/* Partner Suggestions Section */}
        {relationships.length > 0 && (
          <div className="mb-6 sm:mb-8">
            <div className="bg-gradient-to-r from-mint-50 to-calm-50 rounded-xl p-4 sm:p-6 border border-mint-200 mb-4 sm:mb-6 backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center space-x-3 mb-4 sm:mb-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-mint-100 rounded-full flex items-center justify-center">
                    <span className="text-base sm:text-lg">💕</span>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                      Partner Suggestions
                    </h3>
                    <p className="text-gray-600 text-xs sm:text-sm">
                      {suggestionCount} suggestion{suggestionCount !== 1 ? 's' : ''} based on your partner's needs
                    </p>
                    <p className="text-gray-500 text-xs">
                      Last checked: {lastSuggestionRefresh.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Button
                    onClick={() => setShowPartnerSuggestions(!showPartnerSuggestions)}
                    variant="outline"
                    size="sm"
                    className="border-mint-300 text-mint-700 hover:bg-mint-50"
                  >
                    {showPartnerSuggestions ? 'Hide' : 'Show'} Suggestions
                  </Button>
                  <Button
                    onClick={() => loadSuggestionCount(user.id)}
                    variant="outline"
                    size="sm"
                    className="border-mint-300 text-mint-700 hover:bg-mint-50"
                  >
                    Refresh
                  </Button>
                  <Link href="/insights">
                    <Button 
                      size="sm"
                      className="w-full sm:w-auto bg-mint-600 hover:bg-mint-700 text-white"
                    >
                      View All in Insights
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
            
            {showPartnerSuggestions && (
              <PartnerSuggestions />
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* AI Insights */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-6 border border-calm-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-0">
                {relationships.length > 0 ? 'Relationship Coach' : 'Personal Coach'}
              </h3>
              <Button 
                onClick={generateInsights}
                disabled={generatingInsights}
                size="sm"
                className="bg-calm-600 hover:bg-calm-700 text-white"
              >
                {generatingInsights ? 'Analyzing...' : 'Generate Insights'}
              </Button>
            </div>
            
            {loadingInsights ? (
              <div className="space-y-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ) : insights.length === 0 ? (
              <div className="text-center py-6 sm:py-8">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-calm-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-xl sm:text-2xl">🧠</span>
                </div>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">
                  {relationships.length > 0 
                    ? 'No relationship insights yet. Generate your first AI coaching session!'
                    : 'No personal insights yet. Generate your first AI guidance!'
                  }
                </p>
                <Button 
                  onClick={generateInsights}
                  disabled={generatingInsights}
                  className="bg-calm-600 hover:bg-calm-700 text-white"
                >
                  {generatingInsights ? 'Analyzing...' : 'Generate Insights'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {insights.map((insight) => (
                  <div key={insight.id} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(insight.priority)} flex-shrink-0`} />
                        <div className="flex items-center space-x-1 min-w-0">
                          <span className="flex-shrink-0">{getInsightTypeIcon(insight.insight_type)}</span>
                          <h4 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{insight.title}</h4>
                        </div>
                        {insight.relationship_id && (
                          <span className="bg-mint-100 text-mint-800 text-xs px-2 py-1 rounded-full flex-shrink-0 hidden sm:inline">
                            Relationship
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">{formatInsightTime(insight.created_at)}</span>
                    </div>
                    <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                      {insight.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity & Quick Actions */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-6 border border-calm-200">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Recent Activity</h3>
              
              <RecentActivity userId={user?.id} limit={6} />
            </div>

            {/* Quick Actions */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-6 border border-calm-200">
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <Link href="/cycle">
                  <Button variant="outline" className="w-full border-mint-300 text-mint-700 hover:bg-mint-50 text-xs sm:text-sm">
                    Cycle Tracker
                  </Button>
                </Link>
                {relationships.length === 0 ? (
                  <Link href="/relationships">
                    <Button className="w-full bg-calm-600 hover:bg-calm-700 text-white text-xs sm:text-sm">
                      Connect Partner
                    </Button>
                  </Link>
                ) : (
                  <Button
                    onClick={() => setShowSharedInsights(!showSharedInsights)}
                    variant="outline"
                    className="w-full border-calm-300 text-calm-700 hover:bg-calm-50 text-xs sm:text-sm"
                  >
                    {showSharedInsights ? 'Hide' : 'Show'} Shared
                  </Button>
                )}
                <Link href="/checkin">
                  <Button variant="outline" className="w-full border-mint-300 text-mint-700 hover:bg-mint-50 text-xs sm:text-sm">
                    Daily Check-in
                  </Button>
                </Link>
                <Link href="/journal">
                  <Button variant="outline" className="w-full border-calm-300 text-calm-700 hover:bg-calm-50 text-xs sm:text-sm">
                    Write Journal
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}