'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createBrowserClient } from '@supabase/ssr'
import { PartnerSuggestions } from '@/components/dashboard/PartnerSuggestions'

export default function InsightsPage() {
  const [partnerSuggestions, setPartnerSuggestions] = useState<any[]>([])
  const [loadingPartnerSuggestions, setLoadingPartnerSuggestions] = useState(false)
  const [showPartnerSuggestions, setShowPartnerSuggestions] = useState(true)
  const [relationships, setRelationships] = useState<any[]>([])
  const [insights, setInsights] = useState<any[]>([])
  const [filteredInsights, setFilteredInsights] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)
  const [generatingInsights, setGeneratingInsights] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  useEffect(() => {
  const getUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUser(user)
      await Promise.all([
        loadInsights(user.id),
        loadPartnerSuggestions(user.id),
        loadRelationships(user.id)
      ])
    }
  }
  getUser()
}, [])

  // Apply filters whenever insights, search, or filter options change
  useEffect(() => {
    let filtered = [...insights]

    // Filter by type
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(insight => insight.insight_type === selectedFilter)
    }

    // Filter by read status
    if (showUnreadOnly) {
      filtered = filtered.filter(insight => !insight.is_read)
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(insight => 
        insight.title.toLowerCase().includes(term) ||
        insight.description.toLowerCase().includes(term)
      )
    }

    setFilteredInsights(filtered)
  }, [insights, selectedFilter, showUnreadOnly, searchTerm])

  const loadInsights = async (userId: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('relationship_insights')
        .select('*')
        .eq('generated_for_user', userId)
        .order('created_at', { ascending: false })

      if (data && !error) {
        setInsights(data)
      } else if (error) {
        console.error('Error loading insights:', error)
      }
    } catch (error) {
      console.error('Error loading insights:', error)
    } finally {
      setLoading(false)
    }
  }
    const loadPartnerSuggestions = async (userId: string) => {
  setLoadingPartnerSuggestions(true)
  try {
    const { data, error } = await supabase
      .from('partner_suggestions')
      .select('*')
      .eq('recipient_user_id', userId)
      .gte('expires_at', new Date().toISOString()) // Not expired
      .order('created_at', { ascending: false })

    if (data && !error) {
      setPartnerSuggestions(data)
    } else if (error) {
      console.error('Error loading partner suggestions:', error)
    }
  } catch (error) {
    console.error('Error loading partner suggestions:', error)
  } finally {
    setLoadingPartnerSuggestions(false)
  }
}

const loadRelationships = async (userId: string) => {
  try {
    const { data: relationshipData, error } = await supabase
      .from('relationship_members')
      .select(`
        relationship_id,
        role,
        relationships (
          id,
          name,
          relationship_type
        )
      `)
      .eq('user_id', userId)

    if (relationshipData && !error) {
      const relationshipsList = relationshipData.map(r => ({
        ...r.relationships,
        myRole: r.role
      }))
      setRelationships(relationshipsList)
    }
  } catch (error) {
    console.error('Error loading relationships:', error)
  }
}

  const markAsRead = async (insightId: string) => {
    try {
      const { error } = await supabase
        .from('relationship_insights')
        .update({ is_read: true })
        .eq('id', insightId)

      if (!error) {
        setInsights(prev => prev.map(insight => 
          insight.id === insightId ? { ...insight, is_read: true } : insight
        ))
      }
    } catch (error) {
      console.error('Error marking insight as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const unreadIds = insights.filter(i => !i.is_read).map(i => i.id)
      if (unreadIds.length === 0) return

      const { error } = await supabase
        .from('relationship_insights')
        .update({ is_read: true })
        .in('id', unreadIds)

      if (!error) {
        setInsights(prev => prev.map(insight => ({ ...insight, is_read: true })))
      }
    } catch (error) {
      console.error('Error marking all as read:', error)
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
        await loadInsights(user.id)
        // Optional: Show success message
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-400'
      case 'medium': return 'bg-yellow-400'
      case 'low': return 'bg-green-400'
      default: return 'bg-gray-400'
    }
  }

  const getPriorityBorder = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50'
      case 'medium': return 'border-yellow-200 bg-yellow-50'
      case 'low': return 'border-green-200 bg-green-50'
      default: return 'border-gray-200 bg-gray-50'
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
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    })
  }

  const getInsightTypeLabel = (type: string) => {
    switch (type) {
      case 'suggestion': return 'Suggestion'
      case 'appreciation': return 'Appreciation'
      case 'milestone': return 'Milestone'
      case 'pattern': return 'Pattern'
      default: return 'Insight'
    }
  }

  const unreadCount = insights.filter(i => !i.is_read).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-calm-50 to-mint-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-calm-800">Relationship OS</h1>
            </div>
            <nav className="flex items-center space-x-6">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-700">
                Dashboard
              </Link>
              <Link href="/journal" className="text-gray-600 hover:text-gray-700">
                Journal
              </Link>
              <Link href="/checkin" className="text-gray-600 hover:text-gray-700">
                Check-In
              </Link>
              <Link href="/insights" className="text-calm-700 hover:text-calm-800 font-medium">
                Insights {unreadCount > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </Link>
              <Link href="/settings" className="text-gray-600 hover:text-gray-700">
                Settings
              </Link>
              <Button 
                variant="ghost" 
                className="text-gray-600"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Your Relationship Insights</h2>
              <p className="text-gray-600 mt-2">
                AI-powered insights to strengthen your relationship
              </p>
            </div>
            <div className="flex space-x-3">
              {unreadCount > 0 && (
                <Button 
                  onClick={markAllAsRead}
                  variant="outline"
                  size="sm"
                  className="border-calm-300 text-calm-700"
                >
                  Mark All Read
                </Button>
              )}
              <Button 
                onClick={generateInsights}
                disabled={generatingInsights}
                className="bg-calm-600 hover:bg-calm-700"
              >
                {generatingInsights ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Analyzing...</span>
                  </div>
                ) : (
                  'Generate New Insights'
                )}
              </Button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-2xl font-bold text-gray-900">{insights.length}</div>
              <div className="text-sm text-gray-600">Total Insights</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-2xl font-bold text-red-600">{unreadCount}</div>
              <div className="text-sm text-gray-600">Unread</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-2xl font-bold text-pink-600">{partnerSuggestions.length}</div>
              <div className="text-sm text-gray-600">Partner Suggestions</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-2xl font-bold text-blue-600">
                {insights.filter(i => i.insight_type === 'suggestion').length}
              </div>
              <div className="text-sm text-gray-600">AI Suggestions</div>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="text-2xl font-bold text-mint-600">
                {insights.filter(i => i.insight_type === 'appreciation').length}
              </div>
              <div className="text-sm text-gray-600">Appreciations</div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg p-6 border border-gray-200">
            <div className="flex flex-wrap items-center gap-4">
              {/* Search */}
              <div className="flex-1 min-w-64">
                <input
                  type="text"
                  placeholder="Search insights..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-calm-500 focus:border-calm-500"
                />
              </div>

              {/* Type Filter */}
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-calm-500 focus:border-calm-500"
              >
                <option value="all">All Types</option>
                <option value="suggestion">Suggestions</option>
                <option value="appreciation">Appreciations</option>
                <option value="milestone">Milestones</option>
                <option value="pattern">Patterns</option>
              </select>

              {/* Unread Filter */}
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showUnreadOnly}
                  onChange={(e) => setShowUnreadOnly(e.target.checked)}
                  className="h-4 w-4 text-calm-600 focus:ring-calm-500 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Unread only</span>
              </label>
            </div>
          </div>
        </div>

        {/* Partner Suggestions Section - NEW */}
      {relationships.length > 0 && (
        <div className="mb-8">
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6 border border-pink-200 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center">
                  <span className="text-lg">💕</span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Partner Suggestions
                  </h3>
                  <p className="text-gray-600 text-sm">
                    AI-generated suggestions based on your partner's relationship needs
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
                <div className="text-sm text-gray-500 self-center">
                  {partnerSuggestions.filter(s => !s.delivered_at).length} new
                </div>
              </div>
            </div>
          </div>
          
          {showPartnerSuggestions && (
            <div className="mb-8">
              <PartnerSuggestions />
            </div>
          )}
        </div>
      )}

        {/* Insights List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-calm-300 border-t-calm-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-500">Loading your insights...</p>
            </div>
          ) : filteredInsights.length === 0 ? (
            <div className="text-center py-12">
              {insights.length === 0 ? (
                <>
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <p className="text-gray-500 mb-4">No insights yet. Generate your first AI insights!</p>
                  <Button 
                    onClick={generateInsights}
                    disabled={generatingInsights}
                    className="bg-calm-600 hover:bg-calm-700"
                  >
                    {generatingInsights ? 'Analyzing...' : 'Generate Insights'}
                  </Button>
                </>
              ) : (
                <>
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="text-gray-500">No insights match your filters.</p>
                  <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filter settings.</p>
                </>
              )}
            </div>
          ) : (
            filteredInsights.map((insight) => (
              <div
                key={insight.id}
                className={`bg-white rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                  insight.is_read 
                    ? 'border-gray-200' 
                    : `${getPriorityBorder(insight.priority)} border-2`
                }`}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3 flex-1">
                      {/* Priority Indicator */}
                      <div className={`w-3 h-3 rounded-full mt-2 ${getPriorityColor(insight.priority)}`} />
                      
                      {/* Type Icon */}
                      <div className="mt-1">
                        {getInsightTypeIcon(insight.insight_type)}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className={`text-lg font-semibold ${insight.is_read ? 'text-gray-900' : 'text-gray-900'}`}>
                            {insight.title}
                          </h3>
                          {!insight.is_read && (
                            <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">
                              New
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                          <span className="flex items-center space-x-1">
                            {getInsightTypeIcon(insight.insight_type)}
                            <span>{getInsightTypeLabel(insight.insight_type)}</span>
                          </span>
                          <span>{formatInsightTime(insight.created_at)}</span>
                          <span className="capitalize">{insight.priority} priority</span>
                        </div>
                        
                        <p className="text-gray-700 leading-relaxed">
                          {insight.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Action Button */}
                    <div className="ml-4">
                      {!insight.is_read && (
                        <Button
                          onClick={() => markAsRead(insight.id)}
                          size="sm"
                          variant="outline"
                          className="border-calm-300 text-calm-700 hover:bg-calm-50"
                        >
                          Mark Read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Show count when filtered */}
        {(searchTerm || selectedFilter !== 'all' || showUnreadOnly) && filteredInsights.length > 0 && (
          <div className="text-center mt-6">
            <p className="text-sm text-gray-500">
              Showing {filteredInsights.length} of {insights.length} insights
            </p>
          </div>
        )}
      </main>
    </div>
  )
}