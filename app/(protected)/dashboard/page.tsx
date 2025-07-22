// Enhanced Dashboard with full relationship integration
// Replace your existing dashboard/page.tsx with this version

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createBrowserClient } from '@supabase/ssr'
import SharedInsights from '@/components/SharedInsights'
import RecentActivity from '@/components/RecentActivity'

export default function DashboardPage() {
  // State management
  const [connectionScore] = useState(78)
  const [user, setUser] = useState<any>(null)
  const [insights, setInsights] = useState<any[]>([])
  const [loadingInsights, setLoadingInsights] = useState(false)
  const [generatingInsights, setGeneratingInsights] = useState(false)
  
  // Relationship state
  const [relationships, setRelationships] = useState<any[]>([])
  const [activeRelationship, setActiveRelationship] = useState<any>(null)
  const [showSharedInsights, setShowSharedInsights] = useState(false)
  
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
          loadRelationships(user.id)
        ])
      }
    }
    getUser()
  }, [])

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
        // Reload insights to show new ones
        await loadInsights(user.id)
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-mint-600'
    if (score >= 60) return 'text-calm-600'
    return 'text-yellow-600'
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return 'bg-mint-50 border-mint-200'
    if (score >= 60) return 'bg-calm-50 border-calm-200'
    return 'bg-yellow-50 border-yellow-200'
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-calm-50 to-mint-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-calm-800">Relationship OS</h1>
              <div className="text-gray-500">Welcome back, {user?.email?.split('@')[0]}!</div>
            </div>
            <nav className="flex items-center space-x-6">
              <Link href="/dashboard" className="text-calm-700 hover:text-calm-800 font-medium">
                Dashboard
              </Link>
              <Link href="/journal" className="text-gray-600 hover:text-gray-700">
                Journal
              </Link>
              <Link href="/checkin" className="text-gray-600 hover:text-gray-700">
                Check-In
              </Link>
              <Link href="/insights" className="text-gray-600 hover:text-gray-700">
                Insights
              </Link>
              <Link href="/relationships" className="text-gray-600 hover:text-gray-700">
                Relationships
              </Link>
              <Link href="/calendar" className="text-gray-600 hover:text-gray-700">
                Calendar
              </Link>
              <Link href="/settings" className="text-gray-600 hover:text-gray-700">
                Settings
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                  Invite your partner to unlock shared insights and strengthen your relationship together
                </p>
              </div>
              <Link href="/relationships">
                <Button className="bg-white text-blue-700 hover:bg-gray-100">
                  Invite Partner
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Connection Score Hero */}
        <div className={`${getScoreBg(connectionScore)} rounded-2xl p-8 mb-8 border-2`}>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Your Connection Score
            </h2>
            <div className={`text-6xl font-bold ${getScoreColor(connectionScore)} mb-4`}>
              {connectionScore}
            </div>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              {relationships.length > 0 
                ? `Your relationship health is good and trending upward. Keep focusing on quality communication and shared experiences with ${activeRelationship?.name}.`
                : 'Your personal growth and self-awareness are building a strong foundation for future relationships.'
              }
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/checkin">
                <Button className="bg-calm-600 hover:bg-calm-700">
                  Daily Check-In
                </Button>
              </Link>
              <Link href="/journal">
                <Button variant="outline" className="border-calm-300 text-calm-700">
                  Write in Journal
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Shared Insights Section */}
        {showSharedInsights && activeRelationship && (
          <div className="mb-8">
            <SharedInsights 
              relationshipId={activeRelationship.id}
              currentUserId={user?.id}
              privacyLevel="patterns" // This would come from user settings
            />
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
                      Invite Partner
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
                  ? 'Shared insights respect your privacy settings. Your personal journal entries remain completely confidential to you.'
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