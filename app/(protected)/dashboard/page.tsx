// app/(protected)/dashboard/page.tsx
// COMPLETE PRODUCTION VERSION - Updated with brand colors

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createBrowserClient } from '@supabase/ssr'
import SharedInsights from '@/components/SharedInsights'
import RecentActivity from '@/components/RecentActivity'
import { PartnerSuggestions } from '@/components/dashboard/PartnerSuggestions'
import { EnhancedConnectionDashboard } from '@/components/dashboard/enhanced-connection-dashboard'
import { CleanRelationshipCards, useCleanRelationshipCards } from '@/components/dashboard/clean-relationship-cards'
import { CleanInsightsFeed, useCleanInsightsFeed } from '@/components/dashboard/clean-insights-feed'
import { Database } from '@/lib/types/database'
import { getUserNotificationPreferences, shouldShowPartnerSuggestions, shouldShowRelationshipInsights, shouldShowDailyReminders } from '@/lib/utils/notification-preferences'

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

// Enhanced score data interface for 100-point system
interface EnhancedScoreData {
  score: number
  trend: 'improving' | 'declining' | 'stable'
  components: {
    connection: number
    consistency: number
    positivity: number
    growth: number
  }
  analytics: {
    weeklyTrend: number
    monthlyTrend: number
    streakDays: number
    totalCheckins: number
    avgDailyMood: number
    avgConnection: number
    gratitudeFrequency: number
    challengeAwareness: number
    recentActivity: number
    consistencyRating: string
  }
  insights: string[]
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

// Enhanced Score Display Component (inline to avoid import issues)
const EnhancedScoreDisplay = ({ 
  scoreData, 
  onRefresh,
  loading = false 
}: {
  scoreData: EnhancedScoreData
  onRefresh?: () => void
  loading?: boolean
}) => {
  const [showDetails, setShowDetails] = useState(false)
  const [animatedScore, setAnimatedScore] = useState(0)

  // Animate score on load or data change
  useEffect(() => {
    const timer = setTimeout(() => {
      let current = 0
      const increment = scoreData.score / 50
      const animation = setInterval(() => {
        current += increment
        if (current >= scoreData.score) {
          setAnimatedScore(scoreData.score)
          clearInterval(animation)
        } else {
          setAnimatedScore(Math.floor(current))
        }
      }, 30)
      return () => clearInterval(animation)
    }, 300)
    
    return () => clearTimeout(timer)
  }, [scoreData.score])

  const getScoreMessage = (score: number) => {
    if (score >= 85) return { title: 'Thriving', emoji: '🌟', desc: 'Exceptional connection' }
    if (score >= 70) return { title: 'Strong', emoji: '💚', desc: 'Healthy relationship' }
    if (score >= 55) return { title: 'Growing', emoji: '🌱', desc: 'Building momentum' }
    return { title: 'Building', emoji: '🎯', desc: 'Focus on consistency' }
  }

  const getTrendIcon = (trend: string) => {
    switch(trend) {
      case 'improving': return '📈'
      case 'declining': return '📉'
      default: return '➡️'
    }
  }

  const getTrendColor = (trend: string) => {
    switch(trend) {
      case 'improving': return 'text-green-600 bg-green-50 border-green-200'
      case 'declining': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-brand-slate bg-brand-cool-gray border-brand-light-gray'
    }
  }

  const CircularProgress = ({ percentage, size = 200 }: { percentage: number, size?: number }) => {
    const radius = (size - 8) / 2
    const circumference = radius * 2 * Math.PI
    const strokeDasharray = `${circumference} ${circumference}`
    const strokeDashoffset = circumference - (percentage / 100) * circumference

    return (
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(156, 163, 175, 0.2)"
            strokeWidth={8}
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#gradient)"
            strokeWidth={8}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4AB9B8" />
              <stop offset="100%" stopColor="#FF8A9B" />
            </linearGradient>
          </defs>
        </svg>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl font-bold text-brand-charcoal mb-1 font-heading">
              {animatedScore}
            </div>
            <div className="text-sm text-brand-slate font-medium font-inter">out of 100</div>
          </div>
        </div>
      </div>
    )
  }

  const ComponentBar = ({ label, value, color, icon }: { 
    label: string
    value: number
    color: string
    icon: string
  }) => (
    <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-brand-light-gray hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-3">
        <div className={`w-8 h-8 rounded-full bg-gradient-to-r ${color} flex items-center justify-center`}>
          <span className="text-white text-sm">{icon}</span>
        </div>
        <span className="font-medium text-brand-charcoal font-inter">{label}</span>
      </div>
      <div className="flex items-center space-x-2">
        <div className="w-20 bg-brand-light-gray rounded-full h-2">
          <div 
            className={`h-2 bg-gradient-to-r ${color} rounded-full transition-all duration-1000`}
            style={{ width: `${Math.min(value, 100)}%` }}
          />
        </div>
        <span className="text-sm font-semibold text-brand-slate w-8 font-inter">{value}</span>
      </div>
    </div>
  )

  const message = getScoreMessage(scoreData.score)

  return (
    <div className="space-y-6">
      {/* Main Score Display */}
      <div className={`bg-gradient-to-br from-white via-brand-teal/5 to-brand-coral-pink/5 rounded-2xl p-6 sm:p-8 border border-brand-teal/20 shadow-lg ${loading ? 'opacity-70' : ''}`}>
        <div className="flex flex-col lg:flex-row items-center justify-between">
          {/* Left side - Score Circle */}
          <div className="flex flex-col items-center space-y-4 mb-6 lg:mb-0">
            <CircularProgress percentage={animatedScore} />
            
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <span className="text-2xl">{message.emoji}</span>
                <h3 className="text-xl font-bold text-brand-charcoal font-heading">{message.title}</h3>
                <span className="text-lg">{getTrendIcon(scoreData.trend)}</span>
              </div>
              <p className="text-brand-slate mb-2 font-inter">{message.desc}</p>
              
              <div className={`inline-flex items-center px-3 py-1 rounded-full border text-sm font-medium font-inter ${getTrendColor(scoreData.trend)}`}>
                {scoreData.trend === 'improving' && 'Improving'}
                {scoreData.trend === 'declining' && 'Needs attention'}
                {scoreData.trend === 'stable' && 'Stable'}
              </div>
              
              {scoreData.analytics.streakDays > 0 && (
                <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-brand-warm-peach/20 text-orange-800 text-sm font-medium font-inter">
                  🔥 {scoreData.analytics.streakDays} day streak
                </div>
              )}
            </div>
          </div>

          {/* Right side - Quick Stats */}
          <div className="grid grid-cols-2 gap-4 lg:ml-8 w-full lg:w-auto">
            <div className="text-center p-4 bg-white rounded-xl border border-brand-light-gray shadow-sm">
              <div className="text-2xl font-bold text-brand-teal font-heading">
                {scoreData.analytics.totalCheckins}
              </div>
              <div className="text-sm text-brand-slate font-inter">Total Check-ins</div>
            </div>
            
            <div className="text-center p-4 bg-white rounded-xl border border-brand-light-gray shadow-sm">
              <div className="text-2xl font-bold text-green-600 font-heading">
                {scoreData.analytics.recentActivity}
              </div>
              <div className="text-sm text-brand-slate font-inter">This Week</div>
            </div>
            
            <div className="text-center p-4 bg-white rounded-xl border border-brand-light-gray shadow-sm">
              <div className="text-2xl font-bold text-brand-coral-pink font-heading">
                {Math.round(scoreData.analytics.avgConnection * 10)}%
              </div>
              <div className="text-sm text-brand-slate font-inter">Avg Connection</div>
            </div>
            
            <div className="text-center p-4 bg-white rounded-xl border border-brand-light-gray shadow-sm">
              <div className="text-2xl font-bold text-brand-soft-teal font-heading">
                {Math.round(scoreData.analytics.gratitudeFrequency)}%
              </div>
              <div className="text-sm text-brand-slate font-inter">Gratitude Rate</div>
            </div>
          </div>
        </div>

        {/* Refresh Button */}
        {onRefresh && (
          <div className="mt-6 flex justify-center">
            <Button
              onClick={onRefresh}
              disabled={loading}
              variant="outline"
              size="sm"
              className="border-brand-teal/30 text-brand-teal hover:bg-brand-teal/10"
            >
              <svg className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Score
            </Button>
          </div>
        )}

        {/* Insights Section */}
        {scoreData.insights && scoreData.insights.length > 0 && (
          <div className="mt-6 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-brand-teal/20">
            <div className="flex items-center space-x-2 mb-3">
              <span className="text-brand-teal">✨</span>
              <h4 className="font-semibold text-brand-charcoal font-inter">AI Insights</h4>
            </div>
            <div className="space-y-2">
              {scoreData.insights.map((insight, index) => (
                <p key={index} className="text-sm text-brand-slate bg-white px-3 py-2 rounded-lg font-inter">
                  {insight}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Component Breakdown */}
      <div className="bg-white rounded-2xl p-6 border border-brand-light-gray shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-brand-charcoal font-heading">Score Breakdown</h3>
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-brand-teal hover:text-brand-dark-teal text-sm font-medium transition-colors font-inter"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
        </div>

        <div className="grid gap-4">
          <ComponentBar 
            label="Connection Quality" 
            value={scoreData.components.connection}
            color="from-brand-teal to-brand-dark-teal"
            icon="💖"
          />
          <ComponentBar 
            label="Consistency" 
            value={scoreData.components.consistency}
            color="from-green-500 to-green-600"
            icon="📅"
          />
          <ComponentBar 
            label="Positivity" 
            value={scoreData.components.positivity}
            color="from-brand-warm-peach to-orange-500"
            icon="🌟"
          />
          <ComponentBar 
            label="Growth Trend" 
            value={scoreData.components.growth}
            color="from-brand-coral-pink to-brand-light-coral"
            icon="📈"
          />
        </div>

        {showDetails && (
          <div className="mt-6 p-4 bg-brand-cool-gray rounded-xl">
            <h4 className="font-semibold text-brand-charcoal mb-3 font-inter">Detailed Analytics</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <div className="text-brand-slate font-inter">Weekly Trend</div>
                <div className={`font-semibold font-inter ${scoreData.analytics.weeklyTrend > 0 ? 'text-green-600' : scoreData.analytics.weeklyTrend < 0 ? 'text-red-600' : 'text-brand-slate'}`}>
                  {scoreData.analytics.weeklyTrend > 0 ? '+' : ''}{scoreData.analytics.weeklyTrend.toFixed(1)}
                </div>
              </div>
              <div>
                <div className="text-brand-slate font-inter">Monthly Trend</div>
                <div className={`font-semibold font-inter ${scoreData.analytics.monthlyTrend > 0 ? 'text-green-600' : scoreData.analytics.monthlyTrend < 0 ? 'text-red-600' : 'text-brand-slate'}`}>
                  {scoreData.analytics.monthlyTrend > 0 ? '+' : ''}{scoreData.analytics.monthlyTrend.toFixed(1)}
                </div>
              </div>
              <div>
                <div className="text-brand-slate font-inter">Avg Mood</div>
                <div className="font-semibold text-brand-teal font-inter">{scoreData.analytics.avgDailyMood.toFixed(1)}/10</div>
              </div>
              <div>
                <div className="text-brand-slate font-inter">Consistency</div>
                <div className="font-semibold text-green-600 font-inter">{scoreData.analytics.consistencyRating}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  // State management
  const [connectionScore, setConnectionScore] = useState<number>(50)
  const [scoreLoading, setScoreLoading] = useState(true)
  const [scoreError, setScoreError] = useState<string | null>(null)
  const [scoreData, setScoreData] = useState<ScoreData>({
    currentScore: 50,
    trend: 0,
    lastWeekAvg: 50,
    totalCheckins: 0,
    daysActive: 0,
    components: null
  })
  
  // Enhanced scoring state
  const [enhancedScoreData, setEnhancedScoreData] = useState<EnhancedScoreData | null>(null)
  
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
  
  // Phase 5 Clean Dashboard State
  const [cleanDashboardMode, setCleanDashboardMode] = useState(true)
  
  // Clean Dashboard Hooks
  const {
    relationships: cleanRelationships,
    selectedRelationshipId,
    selectedRelationship,
    loading: relationshipsLoading,
    error: relationshipsError,
    selectRelationship,
    refreshRelationships
  } = useCleanRelationshipCards(user?.id || '')
  
  const {
    insights: cleanInsights,
    loading: insightsLoading,
    error: insightsError,
    markAsRead,
    viewDetails,
    executeAction,
    refreshInsights
  } = useCleanInsightsFeed(user?.id || '', selectedRelationshipId)

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
      loadEnhancedConnectionScore(userId),
      loadInsights(userId),
      loadRelationships(userId),
      loadSuggestionCount(userId)
    ])
  }

  // Enhanced connection score loading
  const loadEnhancedConnectionScore = async (userId: string) => {
    try {
      setScoreLoading(true)
      setScoreError(null)
      
      console.log('🔄 Loading enhanced connection score for user:', userId)
      
      // Call the enhanced score calculation API
      const response = await fetch('/api/scores/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: userId,
          relationshipId: activeRelationship?.id || null 
        }),
      })

      if (!response.ok) {
        throw new Error(`Score calculation failed: ${response.status}`)
      }

      const enhancedScore: EnhancedScoreData = await response.json()
      console.log('✅ Enhanced score loaded:', enhancedScore)
      
      setEnhancedScoreData(enhancedScore)
      
      // Update legacy scoreData for backward compatibility
      setScoreData((prevData) => ({
        ...prevData,
        currentScore: Math.round(enhancedScore.score / 10), // Convert back to 10-point for legacy systems
        trend: enhancedScore.analytics.weeklyTrend,
        totalCheckins: enhancedScore.analytics.totalCheckins,
        daysActive: enhancedScore.analytics.streakDays,
        components: enhancedScore.components
      }))

    } catch (error) {
      console.error('❌ Error loading enhanced connection score:', error)
      setScoreError(error instanceof Error ? error.message : 'Failed to load score')
      
      // Fallback to basic calculation
      await loadBasicConnectionScore(userId)
      
    } finally {
      setScoreLoading(false)
    }
  }

  // Fallback function for basic scoring (original logic)
  const loadBasicConnectionScore = async (userId: string) => {
    try {
      console.log('⚠️ Falling back to basic score calculation')
      
      const { data: checkins, error } = await supabase
        .from('daily_checkins')
        .select('connection_score, mood_score, created_at, gratitude_note')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(14)

      if (error) throw error

      if (!checkins || checkins.length === 0) {
        setEnhancedScoreData({
          score: 50,
          trend: 'stable',
          components: { connection: 50, consistency: 50, positivity: 50, growth: 50 },
          analytics: {
            weeklyTrend: 0,
            monthlyTrend: 0,
            streakDays: 0,
            totalCheckins: 0,
            avgDailyMood: 5,
            avgConnection: 5,
            gratitudeFrequency: 0,
            challengeAwareness: 0,
            recentActivity: 0,
            consistencyRating: 'Getting Started'
          },
          insights: ['Start your first daily check-in to see personalized insights!']
        })
        return
      }

      // Convert basic 1-10 score to 100-point scale
      const latestScore = checkins[0]?.connection_score || 5
      const enhancedScore = Math.round(latestScore * 10)
      
      const scores = checkins.map(c => c.connection_score).filter((s): s is number => s !== null)
      const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 5

      // Basic trend calculation
      const trend = scores.length > 1 ? 
        (latestScore > scores[1] ? 'improving' : latestScore < scores[1] ? 'declining' : 'stable') : 
        'stable'

      const gratitudeCount = checkins.filter(c => c.gratitude_note?.trim()).length

      setEnhancedScoreData({
        score: enhancedScore,
        trend,
        components: {
          connection: enhancedScore,
          consistency: Math.min(100, checkins.length * 10),
          positivity: Math.round((avgScore || 5) * 10),
          growth: enhancedScore
        },
        analytics: {
          weeklyTrend: scores.length > 1 ? latestScore - scores[1] : 0,
          monthlyTrend: 0,
          streakDays: 0,
          totalCheckins: checkins.length,
          avgDailyMood: checkins.reduce((sum, c) => sum + (c.mood_score || 5), 0) / checkins.length,
          avgConnection: avgScore || 5,
          gratitudeFrequency: gratitudeCount / checkins.length * 100,
          challengeAwareness: 0,
          recentActivity: checkins.filter(c => {
            const daysSince = (Date.now() - new Date(c.created_at).getTime()) / (1000 * 60 * 60 * 24)
            return daysSince <= 7
          }).length,
          consistencyRating: checkins.length >= 7 ? 'Good' : 'Getting Started'
        },
        insights: [
          enhancedScore >= 70 ? 
            '💚 You\'re building a strong foundation!' : 
            '🌱 Keep up the daily check-ins to strengthen your connection.'
        ]
      })

      // Also update legacy state
      setConnectionScore(latestScore)
      setScoreData({
        currentScore: latestScore,
        trend: scores.length > 1 ? latestScore - scores[1] : 0,
        lastWeekAvg: Math.round(avgScore),
        totalCheckins: checkins.length,
        daysActive: new Set(checkins.map(c => new Date(c.created_at).toDateString())).size,
        components: null
      })

    } catch (error) {
      console.error('❌ Error in basic score calculation:', error)
      setScoreError('Unable to calculate score')
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
      default: return 'bg-brand-slate'
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

  // Score refresh function for manual refresh
  const refreshScore = async () => {
    if (user) {
      await loadEnhancedConnectionScore(user.id)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-warm-white to-brand-cool-gray flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-light-gray border-t-brand-teal rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-warm-white to-brand-cool-gray">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Status Message */}
        {message && (
          <div className="mb-6 p-4 bg-brand-teal/10 border border-brand-teal/20 rounded-xl">
            <p className="text-brand-dark-teal font-inter">{message}</p>
          </div>
        )}

        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-heading-xl font-bold text-brand-charcoal mb-2 font-heading">
                Welcome back! 👋
              </h1>
              <p className="text-brand-slate font-inter">
                Here's what's happening in your relationship journey.
              </p>
            </div>
            
            {/* Dashboard Mode Toggle */}
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => setCleanDashboardMode(!cleanDashboardMode)}
                variant="outline"
                size="sm"
                className={cleanDashboardMode ? 'border-brand-teal text-brand-teal' : 'border-gray-300'}
              >
                {cleanDashboardMode ? '✨ Clean View' : '📊 Enhanced View'}
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Connection Score Section - Only show in enhanced mode */}
        {!cleanDashboardMode && (
          <div className="mb-6 sm:mb-8">
          {scoreLoading ? (
            <div className="bg-gradient-to-br from-white via-brand-teal/5 to-brand-coral-pink/5 rounded-2xl p-8 border border-brand-teal/20 shadow-lg">
              <div className="flex flex-col lg:flex-row items-center justify-center space-y-4">
                <div className="animate-pulse">
                  <div className="w-48 h-48 bg-brand-light-gray rounded-full mb-4"></div>
                  <div className="h-6 bg-brand-light-gray rounded w-32 mx-auto mb-2"></div>
                  <div className="h-4 bg-brand-light-gray rounded w-24 mx-auto"></div>
                </div>
              </div>
            </div>
          ) : scoreError ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600">⚠️</span>
                </div>
                <div>
                  <h3 className="font-semibold text-red-900 font-inter">Score Calculation Error</h3>
                  <p className="text-red-700 text-sm font-inter">{scoreError}</p>
                </div>
                <button
                  onClick={refreshScore}
                  className="ml-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-inter"
                >
                  Retry
                </button>
              </div>
            </div>
          ) : enhancedScoreData ? (
            <EnhancedScoreDisplay 
              scoreData={enhancedScoreData}
              onRefresh={refreshScore}
              loading={scoreLoading}
            />
          ) : (
            <div className="bg-brand-cool-gray border border-brand-light-gray rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-brand-light-gray rounded-full mx-auto mb-4 flex items-center justify-center">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="font-semibold text-brand-charcoal mb-2 font-inter">No Score Data Available</h3>
              <p className="text-brand-slate mb-4 font-inter">Complete your first daily check-in to see your relationship score.</p>
              <button
                onClick={() => window.location.href = '/checkin'}
                className="px-6 py-3 bg-brand-teal text-white rounded-lg hover:bg-brand-dark-teal transition-colors font-inter"
              >
                Start First Check-in
              </button>
            </div>
          )}

          {/* Score Feedback Section */}
          {showScoreFeedback && enhancedScoreData && (
            <div className="mt-4 p-4 bg-white/60 backdrop-blur-sm rounded-lg border border-brand-teal/20">
              <p className="text-sm text-brand-slate mb-3 font-inter">How does this {enhancedScoreData.score}/100 score feel to you?</p>
              <div className="flex flex-wrap justify-center space-x-2 space-y-2">
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
              <div className="mt-2 text-center">
                <button 
                  onClick={() => setShowScoreFeedback(false)}
                  className="text-xs text-brand-slate hover:text-brand-charcoal font-inter"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Add feedback trigger button */}
          {enhancedScoreData && !showScoreFeedback && (
            <div className="mt-4 text-center">
              <button 
                onClick={() => setShowScoreFeedback(true)}
                className="text-sm text-brand-slate hover:text-brand-charcoal transition-colors font-inter"
              >
                How accurate is this score? 🤔
              </button>
            </div>
          )}
          </div>
        )}

        {/* Phase 5 Clean Dashboard */}
        {cleanDashboardMode && user?.id ? (
          <div className="space-y-6 sm:space-y-8">
            {/* Clean Relationship Cards */}
            <CleanRelationshipCards
              relationships={cleanRelationships}
              selectedRelationshipId={selectedRelationshipId}
              onRelationshipSelect={selectRelationship}
              loading={relationshipsLoading}
              className="mb-6"
            />
            
            {/* Clean Insights Feed */}
            <CleanInsightsFeed
              insights={cleanInsights}
              selectedRelationshipId={selectedRelationshipId}
              onMarkAsRead={markAsRead}
              onViewDetails={viewDetails}
              onExecuteAction={executeAction}
              loading={insightsLoading}
              className="mb-6"
            />
            
            {/* Quick Actions for Selected Relationship */}
            {selectedRelationship && (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-6 border border-brand-light-gray">
                <h3 className="text-lg font-semibold text-brand-charcoal mb-4 font-heading">
                  Quick Actions for {selectedRelationship.name}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <Link href={`/journal?relationshipId=${selectedRelationship.id}`}>
                    <Button variant="outline" className="w-full border-brand-teal/30 text-brand-teal hover:bg-brand-teal/10 text-sm">
                      📝 Journal
                    </Button>
                  </Link>
                  <Link href={`/checkin?relationshipId=${selectedRelationship.id}`}>
                    <Button variant="outline" className="w-full border-brand-coral-pink/30 text-brand-coral-pink hover:bg-brand-coral-pink/10 text-sm">
                      💬 Check-in
                    </Button>
                  </Link>
                  <Button
                    onClick={() => refreshInsights()}
                    variant="outline"
                    className="w-full border-brand-teal/30 text-brand-teal hover:bg-brand-teal/10 text-sm"
                  >
                    🔄 Refresh
                  </Button>
                  <Link href={`/insights?relationshipId=${selectedRelationship.id}`}>
                    <Button
                      className="w-full bg-brand-teal hover:bg-brand-dark-teal text-white text-sm"
                    >
                      📊 View All
                    </Button>
                  </Link>
                </div>
                
                {/* Premium Analytics Link */}
                <div className="mt-4">
                  <Link href="/premium/analytics">
                    <Button
                      variant="outline"
                      className="w-full border-2 border-brand-coral-pink text-brand-coral-pink hover:bg-brand-coral-pink hover:text-white text-sm font-semibold"
                    >
                      👑 Premium Analytics
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        ) : (
          // Original Enhanced Dashboard
          user?.id && <EnhancedConnectionDashboard userId={user.id} />
        )}

        {/* Original Dashboard Content - Only show when NOT in clean mode */}
        {!cleanDashboardMode && (
          <>
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
            <div className="bg-gradient-to-r from-brand-coral-pink/10 to-brand-teal/10 rounded-xl p-4 sm:p-6 border border-brand-coral-pink/30 mb-4 sm:mb-6 backdrop-blur-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center space-x-3 mb-4 sm:mb-0">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-brand-coral-pink/20 rounded-full flex items-center justify-center">
                    <span className="text-base sm:text-lg">💕</span>
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-brand-charcoal font-heading">
                      Partner Suggestions
                    </h3>
                    <p className="text-brand-slate text-xs sm:text-sm font-inter">
                      {suggestionCount} suggestion{suggestionCount !== 1 ? 's' : ''} based on your partner's needs
                    </p>
                    <p className="text-brand-slate text-xs font-inter">
                      Last checked: {lastSuggestionRefresh.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Button
                    onClick={() => setShowPartnerSuggestions(!showPartnerSuggestions)}
                    variant="outline"
                    size="sm"
                    className="border-brand-coral-pink/30 text-brand-coral-pink hover:bg-brand-coral-pink/10"
                  >
                    {showPartnerSuggestions ? 'Hide' : 'Show'} Suggestions
                  </Button>
                  <Button
                    onClick={() => loadSuggestionCount(user.id)}
                    variant="outline"
                    size="sm"
                    className="border-brand-teal/30 text-brand-teal hover:bg-brand-teal/10"
                  >
                    Refresh
                  </Button>
                  <Link href="/insights">
                    <Button 
                      size="sm"
                      className="w-full sm:w-auto bg-brand-teal hover:bg-brand-dark-teal text-white"
                    >
                      View All in Insights
                    </Button>
                  </Link>
                </div>
              </div>
              
              {showPartnerSuggestions && (
                <PartnerSuggestions />
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* AI Insights */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-6 border border-brand-light-gray">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
              <h3 className="text-lg sm:text-xl font-bold text-brand-charcoal mb-2 sm:mb-0 font-heading">
                {relationships.length > 0 ? 'Relationship Coach' : 'Personal Coach'}
              </h3>
              <Button 
                onClick={generateInsights}
                disabled={generatingInsights}
                size="sm"
                className="bg-brand-teal hover:bg-brand-dark-teal text-white"
              >
                {generatingInsights ? 'Analyzing...' : 'Generate Insights'}
              </Button>
            </div>
            
            {loadingInsights ? (
              <div className="space-y-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-brand-light-gray rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-brand-light-gray rounded w-1/2"></div>
                </div>
              </div>
            ) : insights.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-brand-teal/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl">🧠</span>
                </div>
                <p className="text-brand-slate mb-4 font-inter">
                  {relationships.length > 0 
                    ? 'No relationship insights yet. Generate your first AI coaching session!'
                    : 'No personal insights yet. Generate your first AI guidance!'
                  }
                </p>
                <Button 
                  onClick={generateInsights}
                  disabled={generatingInsights}
                  className="bg-brand-teal hover:bg-brand-dark-teal text-white"
                >
                  {generatingInsights ? 'Analyzing...' : 'Generate Insights'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {insights.map((insight) => (
                  <div key={insight.id} className="border border-brand-light-gray rounded-lg p-3 sm:p-4 hover:bg-brand-cool-gray transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(insight.priority)} flex-shrink-0`} />
                        <div className="flex items-center space-x-1 min-w-0">
                          <span className="flex-shrink-0">{getInsightTypeIcon(insight.insight_type)}</span>
                          <h4 className="font-semibold text-brand-charcoal text-sm sm:text-base truncate font-inter">{insight.title}</h4>
                        </div>
                        {insight.relationship_id && (
                          <span className="bg-brand-coral-pink/20 text-brand-coral-pink text-xs px-2 py-1 rounded-full flex-shrink-0 hidden sm:inline font-inter">
                            Relationship
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-brand-slate flex-shrink-0 ml-2 font-inter">{formatInsightTime(insight.created_at)}</span>
                    </div>
                    <p className="text-brand-slate text-xs sm:text-sm leading-relaxed font-inter">
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
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-6 border border-brand-light-gray">
              <h3 className="text-lg sm:text-xl font-bold text-brand-charcoal mb-4 sm:mb-6 font-heading">Recent Activity</h3>
              
              <RecentActivity userId={user?.id} limit={6} />
            </div>

            {/* Quick Actions */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-4 sm:p-6 border border-brand-light-gray">
              <h3 className="text-lg sm:text-xl font-bold text-brand-charcoal mb-4 font-heading">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <Link href="/cycle">
                  <Button variant="outline" className="w-full border-brand-coral-pink/30 text-brand-coral-pink hover:bg-brand-coral-pink/10 text-xs sm:text-sm">
                    Cycle Tracker
                  </Button>
                </Link>
                {relationships.length === 0 ? (
                  <Link href="/relationships">
                    <Button className="w-full bg-brand-teal hover:bg-brand-dark-teal text-white text-xs sm:text-sm">
                      Connect Partner
                    </Button>
                  </Link>
                ) : (
                  <Button
                    onClick={() => setShowSharedInsights(!showSharedInsights)}
                    variant="outline"
                    className="w-full border-brand-teal/30 text-brand-teal hover:bg-brand-teal/10 text-xs sm:text-sm"
                  >
                    {showSharedInsights ? 'Hide' : 'Show'} Shared
                  </Button>
                )}
                <Link href="/checkin">
                  <Button variant="outline" className="w-full border-brand-coral-pink/30 text-brand-coral-pink hover:bg-brand-coral-pink/10 text-xs sm:text-sm">
                    Daily Check-in
                  </Button>
                </Link>
                <Link href="/journal">
                  <Button variant="outline" className="w-full border-brand-teal/30 text-brand-teal hover:bg-brand-teal/10 text-xs sm:text-sm">
                    Write Journal
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
          </>
        )}
      </div>
    </div>
  )
}