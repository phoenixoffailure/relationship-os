// COMPLETE DASHBOARD PAGE WITH PARTNER SUGGESTIONS INTEGRATION
// Replace your entire app/dashboard/page.tsx with this:

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createBrowserClient } from '@supabase/ssr'
import SharedInsights from '@/components/SharedInsights'
import RecentActivity from '@/components/RecentActivity'
import { PartnerSuggestions } from '@/components/dashboard/PartnerSuggestions'

export default function DashboardPage() {
  // State management
  const [connectionScore, setConnectionScore] = useState<number>(50)
  const [scoreLoading, setScoreLoading] = useState(true)
  const [scoreData, setScoreData] = useState<any>({
    currentScore: 50,
    trend: 0,
    lastWeekAvg: 50,
    totalCheckins: 0,
    daysActive: 0,
    components: null
  })
  
  const [user, setUser] = useState<any>(null)
  const [insights, setInsights] = useState<any[]>([])
  const [loadingInsights, setLoadingInsights] = useState(false)
  const [generatingInsights, setGeneratingInsights] = useState(false)
  const [message, setMessage] = useState('')
  
  // Relationship state
  const [relationships, setRelationships] = useState<any[]>([])
  const [activeRelationship, setActiveRelationship] = useState<any>(null)
  const [showSharedInsights, setShowSharedInsights] = useState(false)
  
  // Partner suggestions state
  const [showPartnerSuggestions, setShowPartnerSuggestions] = useState(true)
  const [suggestionCount, setSuggestionCount] = useState(0)
  
  // Score feedback state
  const [showScoreFeedback, setShowScoreFeedback] = useState(false)
  const [scoreFeedback, setScoreFeedback] = useState<'too_high' | 'too_low' | 'just_right' | null>(null)
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  // Load user and insights on page load
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)

        // Check if onboarding is completed
        const { data: userData } = await supabase
          .from('users')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single()
        
        if (userData && !userData.onboarding_completed) {
          window.location.href = '/onboarding'
          return
        }

        await Promise.all([
          loadInsights(user.id),
          loadRelationships(user.id),
          calculateConnectionScore(user.id),
          loadSuggestionCount(user.id)
        ])
      }
    }
    getUser()
  }, [])

  // Load suggestion count
  const loadSuggestionCount = async (userId: string) => {
    try {
      const { data: suggestions, error } = await supabase
        .from('partner_suggestions')
        .select('id')
        .eq('recipient_user_id', userId)
        .is('delivered_at', null) // Only undelivered suggestions
        .gte('expires_at', new Date().toISOString()) // Not expired

      if (!error && suggestions) {
        setSuggestionCount(suggestions.length)
      }
    } catch (error) {
      console.error('Error loading suggestion count:', error)
    }
  }

  // Calculate dynamic connection score
  const calculateConnectionScore = async (userId: string) => {
    setScoreLoading(true)
    
    try {
      // Get last 30 days of check-ins
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const { data: checkins, error } = await supabase
        .from('daily_checkins')
        .select('connection_score, mood_score, created_at, gratitude_note, challenge_note')
        .eq('user_id', userId)
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false })

      if (error) throw error

      if (!checkins || checkins.length === 0) {
        // New user - set default encouraging score
        const defaultData = {
          currentScore: 65,
          trend: 0,
          lastWeekAvg: 65,
          totalCheckins: 0,
          daysActive: 0,
          message: 'Complete your first check-in to get your personalized score!',
          components: null
        }
        setConnectionScore(65)
        setScoreData(defaultData)
        setScoreLoading(false)
        return
      }

      // Calculate base score from recent check-ins
      const recentCheckins = checkins.slice(0, 7) // Last 7 check-ins
      const baseConnectionScore = recentCheckins.length > 0 
        ? Math.round(recentCheckins.reduce((sum, checkin) => sum + checkin.connection_score, 0) / recentCheckins.length)
        : 50

      const baseMoodScore = recentCheckins.length > 0
        ? Math.round(recentCheckins.reduce((sum, checkin) => sum + checkin.mood_score, 0) / recentCheckins.length)
        : 50

      // Calculate consistency bonus (0-15 points)
      const daysActive = new Set(checkins.map(c => c.created_at.split('T')[0])).size
      const consistencyBonus = Math.min(Math.floor(daysActive / 2), 15)

      // Calculate gratitude bonus (0-10 points)
      const gratitudeCount = checkins.filter(c => c.gratitude_note?.trim()).length
      const gratitudeBonus = Math.min(Math.floor(gratitudeCount / 2), 10)

      // Calculate trend (comparing recent week to previous week)
      const recentWeek = checkins.slice(0, 7)
      const previousWeek = checkins.slice(7, 14)
      
      const recentAvg = recentWeek.length > 0 
        ? recentWeek.reduce((sum, c) => sum + c.connection_score, 0) / recentWeek.length 
        : baseConnectionScore
        
      const previousAvg = previousWeek.length > 0 
        ? previousWeek.reduce((sum, c) => sum + c.connection_score, 0) / previousWeek.length 
        : recentAvg

      const trend = recentAvg - previousAvg

      // Calculate final score (weighted algorithm)
      const finalScore = Math.round(
        (baseConnectionScore * 0.6) +  // 60% from connection scores
        (baseMoodScore * 0.2) +        // 20% from mood
        consistencyBonus +             // Consistency bonus
        gratitudeBonus                 // Gratitude bonus
      )

      // Ensure score is between 1-100
      const clampedScore = Math.max(1, Math.min(100, finalScore))

      // Store detailed analytics
      const scoreComponents = {
        baseConnectionScore,
        baseMoodScore,
        consistencyBonus,
        gratitudeBonus,
        totalCheckins: checkins.length,
        daysActive,
        trend: Math.round(trend * 10) / 10,
        algorithm_version: '1.0',
        weights: {
          connection: 0.6,
          mood: 0.2,
          consistency: consistencyBonus,
          gratitude: gratitudeBonus
        }
      }

      // Save analytics to database
      await supabase
        .from('score_analytics')
        .insert([{
          user_id: userId,
          score_value: clampedScore,
          score_components: scoreComponents
        }])

      setConnectionScore(clampedScore)
      setScoreData({
        currentScore: clampedScore,
        trend: Math.round(trend * 10) / 10,
        lastWeekAvg: Math.round(recentAvg * 10) / 10,
        totalCheckins: checkins.length,
        daysActive: daysActive,
        consistencyBonus,
        gratitudeBonus,
        baseConnection: baseConnectionScore,
        baseMood: baseMoodScore,
        components: scoreComponents
      })

    } catch (error) {
      console.error('Error calculating connection score:', error)
      // Fallback to default
      setConnectionScore(50)
    } finally {
      setScoreLoading(false)
    }
  }

  // Track user engagement after seeing score
  const trackEngagementAfterScore = async (action: string) => {
    try {
      // Get the most recent score
      const { data: recentScore } = await supabase
        .from('score_analytics')
        .select('id, engagement_after')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (recentScore) {
        const currentEngagement = recentScore.engagement_after || {}
        const updatedEngagement = {
          ...currentEngagement,
          [action]: (currentEngagement[action] || 0) + 1,
          last_action: action,
          last_action_at: new Date().toISOString()
        }

        await supabase
          .from('score_analytics')
          .update({ engagement_after: updatedEngagement })
          .eq('id', recentScore.id)
      }
    } catch (error) {
      console.error('Error tracking engagement:', error)
    }
  }

  // Handle score feedback
  const submitScoreFeedback = async (feedback: 'too_high' | 'too_low' | 'just_right') => {
    try {
      // Update the most recent score analytics entry
      const { data: recentScore } = await supabase
        .from('score_analytics')
        .select('id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (recentScore) {
        await supabase
          .from('score_analytics')
          .update({ user_perception: feedback })
          .eq('id', recentScore.id)
      }

      setScoreFeedback(feedback)
      setShowScoreFeedback(false)
      setMessage('Thanks for your feedback! This helps us improve the scoring.')
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error submitting feedback:', error)
    }
  }

  // Load user's relationships
  const loadRelationships = async (userId: string) => {
    try {
      const { data: relationshipData, error } = await supabase
        .from('relationship_members')
        .select(`
          relationship_id,
          role,
          joined_at,
          relationships (
            id,
            name,
            relationship_type,
            created_by,
            created_at
          )
        `)
        .eq('user_id', userId)

      if (relationshipData && !error) {
        const relationshipsList = relationshipData.map(r => ({
          ...r.relationships,
          myRole: r.role,
          joinedAt: r.joined_at
        }))
        
        setRelationships(relationshipsList)
        
        // Set the first relationship as active if exists
        if (relationshipsList.length > 0) {
          setActiveRelationship(relationshipsList[0])
        }
      }
    } catch (error) {
      console.error('Error loading relationships:', error)
    }
  }

  // Load existing insights from database
  const loadInsights = async (userId: string) => {
    setLoadingInsights(true)
    try {
      const { data, error } = await supabase
        .from('relationship_insights')
        .select('*')
        .eq('generated_for_user', userId)
        .order('created_at', { ascending: false })
        .limit(5)

      if (data && !error) {
        setInsights(data)
      }
    } catch (error) {
      console.error('Error loading insights:', error)
    } finally {
      setLoadingInsights(false)
    }
  }

  // Generate new insights using AI
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
        await loadInsights(user.id)
        trackEngagementAfterScore('clicked_generate_insights')
      } else {
        alert('Error generating insights. Please try again.')
      }
    } catch (error) {
      console.error('Error generating insights:', error)
      alert('Error generating insights. Please try again.')
    } finally {
      setGeneratingInsights(false)
    }
  }

  // Refresh connection score
  const refreshScore = async () => {
    if (user) {
      await calculateConnectionScore(user.id)
    }
  }

  // Score display helpers
  const getScoreMessage = (score: number, data: any) => {
    if (data.totalCheckins === 0) {
      return "Welcome! Complete your first check-in to see your personalized connection score."
    }
    
    if (score >= 85) {
      return `Excellent! Your relationship is thriving. You've been consistent with check-ins and maintaining a positive connection.`
    } else if (score >= 70) {
      return `Great job! Your relationship health is strong. ${data.trend > 0 ? 'Your scores are trending upward!' : 'Keep up the good work!'}`
    } else if (score >= 55) {
      return `You're doing well. ${data.trend > 0 ? 'Your connection is improving!' : 'Consider focusing on more quality time and communication.'}`
    } else if (score >= 40) {
      return `There's room for improvement. ${data.daysActive < 7 ? 'Try checking in more regularly. ' : ''}Focus on gratitude and open communication.`
    } else {
      return `Your relationship could use some attention. Regular check-ins and focusing on positive interactions can help improve your connection.`
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 70) return 'text-mint-600'
    if (score >= 55) return 'text-calm-600'
    if (score >= 40) return 'text-yellow-600'
    return 'text-orange-600'
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-green-50 border-green-200'
    if (score >= 70) return 'bg-mint-50 border-mint-200'
    if (score >= 55) return 'bg-calm-50 border-calm-200'
    if (score >= 40) return 'bg-yellow-50 border-yellow-200'
    return 'bg-orange-50 border-orange-200'
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-400'
      case 'medium': return 'bg-yellow-400'
      case 'low': return 'bg-green-400'
      default: return 'bg-gray-400'
    }
  }

  const getInsightTypeIcon = (type: string) => {
    switch (type) {
      case 'suggestion':
        return (
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        )
      case 'appreciation':
        return (
          <svg className="w-5 h-5 text-mint-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        )
      case 'milestone':
        return (
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'pattern':
        return (
          <svg className="w-5 h-5 text-calm-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
    }
  }

  const formatInsightTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`
    
    return date.toLocaleDateString()
  }

  const getRelationshipTypeIcon = (type: string) => {
    switch (type) {
      case 'couple': return '💕'
      case 'family': return '👨‍👩‍👧‍👦'
      case 'friends': return '👫'
      case 'work': return '🤝'
      case 'poly': return '💖'
      default: return '❤️'
    }
  }

  const unreadCount = insights.filter(i => !i.is_read).length

return (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Messages */}
        {message && (
          <div className="mb-6 p-4 rounded-lg bg-green-50 text-green-700 border border-green-200">
            {message}
          </div>
        )}

        {/* Relationship Status Banner */}
        {relationships.length > 0 ? (
          <div className="bg-gradient-to-r from-mint-500 to-calm-500 rounded-xl p-6 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-3xl">{getRelationshipTypeIcon(activeRelationship?.relationship_type)}</span>
                <div>
                  <h3 className="text-xl font-semibold">{activeRelationship?.name}</h3>
                  <p className="text-mint-100">
                    {relationships.length} connected relationship{relationships.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button 
                  onClick={() => setShowSharedInsights(!showSharedInsights)}
                  className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-white border"
                >
                  {showSharedInsights ? 'Hide' : 'Show'} Shared Insights
                </Button>
                <Link href="/relationships">
                  <Button className="bg-white text-calm-700 hover:bg-gray-100">
                    Manage Relationships
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl p-6 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold mb-2">Ready to Connect?</h3>
                <p className="text-blue-100">
                  Create an invitation code to connect with your partner and unlock shared insights
                </p>
              </div>
              <Link href="/relationships">
                <Button className="bg-white text-blue-700 hover:bg-gray-100">
                  Create Invitation
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Connection Score Hero */}
        <div className={`${getScoreBg(connectionScore)} rounded-2xl p-8 mb-8 border-2`}>
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 mb-2">
              <h2 className="text-2xl font-bold text-gray-900">
                Your Connection Score
              </h2>
              <Button 
                onClick={refreshScore}
                size="sm"
                variant="ghost"
                className="text-gray-500 hover:text-gray-700"
              >
                🔄
              </Button>
            </div>
            
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className={`text-6xl font-bold ${getScoreColor(connectionScore)}`}>
                {scoreLoading ? (
                  <div className="w-16 h-16 border-4 border-current border-t-transparent rounded-full animate-spin mx-auto"></div>
                ) : (
                  connectionScore
                )}
              </div>
              {!scoreLoading && scoreData.trend !== 0 && (
                <div className={`flex items-center text-lg font-semibold ${
                  scoreData.trend > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {scoreData.trend > 0 ? '↗️' : '↘️'}
                  <span className="ml-1">{Math.abs(scoreData.trend).toFixed(1)}</span>
                </div>
              )}
            </div>
            
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              {getScoreMessage(connectionScore, scoreData)}
            </p>
            
            {!scoreLoading && scoreData.totalCheckins > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 text-sm">
                <div className="bg-white bg-opacity-50 rounded-lg p-3">
                  <div className="font-bold text-lg">{scoreData.totalCheckins}</div>
                  <div className="text-gray-600">Check-ins</div>
                </div>
                <div className="bg-white bg-opacity-50 rounded-lg p-3">
                  <div className="font-bold text-lg">{scoreData.daysActive}</div>
                  <div className="text-gray-600">Active Days</div>
                </div>
                <div className="bg-white bg-opacity-50 rounded-lg p-3">
                  <div className="font-bold text-lg">{scoreData.lastWeekAvg}</div>
                  <div className="text-gray-600">Recent Avg</div>
                </div>
                <div className="bg-white bg-opacity-50 rounded-lg p-3">
                  <div className={`font-bold text-lg ${scoreData.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {scoreData.trend >= 0 ? '+' : ''}{scoreData.trend.toFixed(1)}
                  </div>
                  <div className="text-gray-600">Trend</div>
                </div>
              </div>
            )}
            
            <div className="flex justify-center space-x-4 mb-4">
              <Link href="/checkin">
                <Button 
                  className="bg-calm-600 hover:bg-calm-700"
                  onClick={() => trackEngagementAfterScore('clicked_checkin')}
                >
                  {scoreData.totalCheckins === 0 ? 'Start Your First Check-In' : 'Daily Check-In'}
                </Button>
              </Link>
              <Link href="/journal">
                <Button 
                  variant="outline" 
                  className="border-calm-300 text-calm-700"
                  onClick={() => trackEngagementAfterScore('clicked_journal')}
                >
                  Write in Journal
                </Button>
              </Link>
            </div>

            {/* Score Feedback Section */}
            {connectionScore && !scoreLoading && scoreData.totalCheckins > 0 && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => setShowScoreFeedback(!showScoreFeedback)}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Does this score feel accurate?
                </button>
                
                {showScoreFeedback && (
                  <div className="mt-3 p-4 bg-white bg-opacity-50 rounded-lg">
                    <p className="text-sm text-gray-700 mb-3">How does this score feel to you?</p>
                    <div className="flex justify-center space-x-2">
                      <Button
                        onClick={() => submitScoreFeedback('too_low')}
                        size="sm"
                        variant="outline"
                        className="border-orange-300 text-orange-700"
                      >
                        Too Low
                      </Button>
                      <Button
                        onClick={() => submitScoreFeedback('just_right')}
                        size="sm"
                        variant="outline"
                        className="border-green-300 text-green-700"
                      >
                        Just Right
                      </Button>
                      <Button
                        onClick={() => submitScoreFeedback('too_high')}
                        size="sm"
                        variant="outline"
                        className="border-red-300 text-red-700"
                      >
                        Too High
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Shared Insights Section */}
        {showSharedInsights && activeRelationship && (
          <div className="mb-8">
            <SharedInsights 
              relationshipId={activeRelationship.id}
              currentUserId={user?.id}
              privacyLevel="patterns"
            />
          </div>
        )}

        {/* Partner Suggestions Section - NEW */}
        {relationships.length > 0 && suggestionCount > 0 && (
          <div className="mb-8">
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6 border border-pink-200 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                    <span className="text-lg">💕</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      New Relationship Suggestions
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {suggestionCount} new suggestion{suggestionCount !== 1 ? 's' : ''} based on your partner's needs
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => setShowPartnerSuggestions(!showPartnerSuggestions)}
                    variant="outline"
                    size="sm"
                    className="border-pink-300 text-pink-700"
                  >
                    {showPartnerSuggestions ? 'Hide' : 'Show'} Suggestions
                  </Button>
                  <Link href="/insights">
                    <Button 
                      size="sm"
                      className="bg-pink-600 hover:bg-pink-700 text-white"
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

        <div className="grid lg:grid-cols-2 gap-8">
          {/* AI Insights */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                {relationships.length > 0 ? 'Relationship Coach' : 'Personal Coach'}
              </h3>
              <div className="flex space-x-2">
                <Button 
                  onClick={generateInsights}
                  disabled={generatingInsights}
                  size="sm"
                  className="bg-calm-600 hover:bg-calm-700"
                >
                  {generatingInsights ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Analyzing...</span>
                    </div>
                  ) : (
                    'Generate Insights'
                  )}
                </Button>
                <Link href="/insights">
                  <Button variant="ghost" size="sm" className="text-calm-600">
                    View All
                  </Button>
                </Link>
              </div>
            </div>

            {/* Relationship context indicator */}
            {relationships.length > 0 && (
              <div className="mb-4 p-3 bg-mint-50 rounded-lg border border-mint-200">
                <div className="flex items-center space-x-2 text-sm">
                  <svg className="w-4 h-4 text-mint-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-mint-800">
                    AI insights now include relationship context from {activeRelationship?.name}
                  </span>
                </div>
              </div>
            )}
            
            {loadingInsights ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-calm-300 border-t-calm-600 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500">Loading insights...</p>
              </div>
            ) : insights.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <p className="text-gray-500 mb-4">
                  {relationships.length > 0 
                    ? 'No relationship insights yet. Generate your first AI coaching session!'
                    : 'No personal insights yet. Generate your first AI guidance!'
                  }
                </p>
                <Button 
                  onClick={generateInsights}
                  disabled={generatingInsights}
                  className="bg-calm-600 hover:bg-calm-700"
                >
                  {generatingInsights ? 'Analyzing...' : 'Generate Insights'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {insights.map((insight) => (
                  <div key={insight.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(insight.priority)}`} />
                        <div className="flex items-center space-x-1">
                          {getInsightTypeIcon(insight.insight_type)}
                          <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                        </div>
                        {insight.relationship_id && (
                          <span className="bg-mint-100 text-mint-800 text-xs px-2 py-1 rounded-full">
                            Relationship
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500">{formatInsightTime(insight.created_at)}</span>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {insight.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity & Relationship Status */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h3>
              
              <RecentActivity userId={user?.id} limit={6} />
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 gap-4">
                <Link href="/cycle">
                  <Button variant="outline" className="w-full border-mint-300 text-mint-700">
                    Cycle Tracker
                  </Button>
                </Link>
                {relationships.length === 0 ? (
                  <Link href="/relationships">
                    <Button variant="outline" className="w-full border-purple-300 text-purple-700">
                      Create Invitation
                    </Button>
                  </Link>
                ) : suggestionCount > 0 ? (
                  <Link href="/insights">
                    <Button variant="outline" className="w-full border-pink-300 text-pink-700">
                      💕 View Suggestions ({suggestionCount})
                    </Button>
                  </Link>
                ) : (
                  <Link href={`/insights?relationship=${activeRelationship?.id}`}>
                    <Button variant="outline" className="w-full border-calm-300 text-calm-700">
                      Shared Insights
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Privacy Notice */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border-l-4 border-calm-500">
          <div className="flex items-start space-x-3">
            <svg className="w-6 h-6 text-calm-600 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Your Privacy is Protected</h4>
              <p className="text-gray-600 text-sm">
                {relationships.length > 0 
                  ? 'Shared insights and partner suggestions respect your privacy settings. Your personal journal entries remain completely confidential to you.'
                  : 'All insights are generated from your private data without sharing sensitive details. Your journal entries remain completely confidential to you.'
                }
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}