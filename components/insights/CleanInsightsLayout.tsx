// components/insights/CleanInsightsLayout.tsx
// Clean, decluttered insights page with two-tab system and smart organization

'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { createBrowserClient } from '@supabase/ssr'
import { Sparkles, TrendingUp, Heart, Trophy, RefreshCw, ThumbsUp, ThumbsDown, Clock, ChevronDown, ChevronUp } from 'lucide-react'

interface CleanInsightsLayoutProps {
  user: any
  onGenerateInsights: () => void
  generatingInsights: boolean
}

export function CleanInsightsLayout({ user, onGenerateInsights, generatingInsights }: CleanInsightsLayoutProps) {
  const [insights, setInsights] = useState<any[]>([])
  const [partnerSuggestions, setPartnerSuggestions] = useState<any[]>([])
  const [relationships, setRelationships] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'personal' | 'partner'>('personal')
  const [showMoreInsights, setShowMoreInsights] = useState(false)
  const [feedbackRatings, setFeedbackRatings] = useState<Record<string, string>>({})
  const [partnerFeedbackRatings, setPartnerFeedbackRatings] = useState<Record<string, string>>({})

  // Auto-read timer management
  const timersRef = useRef<Record<string, any>>({})

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    if (user) {
      loadAllData(user.id)
    }
  }, [user])

  // Auto-read timer for unread insights (keep latest unread, auto-mark others after 8 seconds)
  useEffect(() => {
    Object.values(timersRef.current).forEach(timeoutId => clearTimeout(timeoutId))
    timersRef.current = {}
    
    const unread = insights.filter(i => !i.is_read)
    if (unread.length > 1) {
      // Auto-mark all but the most recent unread insight
      unread.slice(1).forEach(insight => {
        timersRef.current[insight.id] = setTimeout(() => {
          markAsRead(insight.id)
        }, 8000)
      })
    }
    
    return () => {
      Object.values(timersRef.current).forEach(timeoutId => clearTimeout(timeoutId))
    }
  }, [insights])

  const loadAllData = async (userId: string) => {
    setLoading(true)
    await Promise.all([
      loadPersonalInsights(userId),
      loadPartnerSuggestions(userId),
      loadRelationships(userId)
    ])
    setLoading(false)
  }

  const loadPersonalInsights = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('relationship_insights')
        .select('*')
        .eq('generated_for_user', userId)
        .order('created_at', { ascending: false })
        .limit(20) // Load more for history view

      if (data && !error) {
        setInsights(data)
      }
    } catch (error) {
      console.error('Error loading personal insights:', error)
    }
  }

  const loadPartnerSuggestions = async (userId: string) => {
    try {
      // Get suggestions from last 48 hours, grouped by relationship
      const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString()
      
      const { data, error } = await supabase
        .from('partner_suggestions')
        .select(`
          *,
          relationships (
            id,
            name,
            relationship_type
          )
        `)
        .eq('recipient_user_id', userId)
        .gte('created_at', fortyEightHoursAgo)
        .order('created_at', { ascending: false })

      if (data && !error) {
        // Group by relationship_id and take most recent per relationship
        const groupedSuggestions = data.reduce((acc: any, suggestion: any) => {
          const relationshipId = suggestion.relationship_id
          if (!acc[relationshipId] || new Date(suggestion.created_at) > new Date(acc[relationshipId].created_at)) {
            acc[relationshipId] = suggestion
          }
          return acc
        }, {})
        
        setPartnerSuggestions(Object.values(groupedSuggestions))
      }
    } catch (error) {
      console.error('Error loading partner suggestions:', error)
    }
  }

  const loadRelationships = async (userId: string) => {
    try {
      const { data: relationshipData, error } = await supabase
        .from('relationship_members')
        .select(`
          relationship_id,
          relationships (
            id,
            name,
            relationship_type
          )
        `)
        .eq('user_id', userId)

      if (relationshipData && !error) {
        const relationshipsList = relationshipData.map(r => r.relationships).filter(Boolean)
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

  const handleFeedback = async (insightId: string, rating: 'up' | 'down') => {
    try {
      const response = await fetch('/api/insights/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ insightId, rating }),
      })

      if (response.ok) {
        setFeedbackRatings(prev => ({ ...prev, [insightId]: rating }))
      }
    } catch (error) {
      console.error('Error submitting feedback:', error)
    }
  }

  const handlePartnerFeedback = async (suggestionId: string, rating: 'up' | 'down') => {
    try {
      const response = await fetch('/api/partner-suggestions/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suggestionId, rating }),
      })

      if (response.ok) {
        setPartnerFeedbackRatings(prev => ({ ...prev, [suggestionId]: rating }))
      }
    } catch (error) {
      console.error('Error submitting partner feedback:', error)
    }
  }

  const markPartnerSuggestionAsRead = async (suggestionId: string) => {
    try {
      const response = await fetch('/api/partner-suggestions/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ suggestionId }),
      })

      if (response.ok) {
        setPartnerSuggestions(prev => prev.map(suggestion => 
          suggestion.id === suggestionId ? { ...suggestion, read_status: 'read', read_at: new Date().toISOString() } : suggestion
        ))
      }
    } catch (error) {
      console.error('Error marking partner suggestion as read:', error)
    }
  }

  const markAllInsightsAsRead = async () => {
    try {
      const unreadInsights = insights.filter(i => !i.is_read)
      if (unreadInsights.length === 0) return

      const response = await fetch('/api/insights/mark-all-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })

      if (response.ok) {
        // Update all insights to read
        setInsights(prev => prev.map(insight => ({ ...insight, is_read: true })))
        
        // Clear any auto-read timers
        Object.values(timersRef.current).forEach(timeoutId => clearTimeout(timeoutId))
        timersRef.current = {}
      }
    } catch (error) {
      console.error('Error marking all insights as read:', error)
    }
  }

  const markAllPartnerSuggestionsAsRead = async () => {
    try {
      const unreadSuggestions = partnerSuggestions.filter(s => s.read_status !== 'read')
      if (unreadSuggestions.length === 0) return

      const response = await fetch('/api/partner-suggestions/mark-all-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })

      if (response.ok) {
        // Update all partner suggestions to read
        setPartnerSuggestions(prev => prev.map(suggestion => ({ 
          ...suggestion, 
          read_status: 'read', 
          read_at: new Date().toISOString() 
        })))
      }
    } catch (error) {
      console.error('Error marking all partner suggestions as read:', error)
    }
  }

  const getPillarIcon = (pillarType: string) => {
    switch (pillarType) {
      case 'pattern':
        return <TrendingUp className="w-5 h-5 text-blue-600" />
      case 'growth':
      case 'suggestion':
        return <Sparkles className="w-5 h-5 text-purple-600" />
      case 'appreciation':
        return <Heart className="w-5 h-5 text-rose-600" />
      case 'milestone':
        return <Trophy className="w-5 h-5 text-amber-600" />
      default:
        return <Sparkles className="w-5 h-5 text-gray-600" />
    }
  }

  const getPillarColor = (pillarType: string) => {
    switch (pillarType) {
      case 'pattern':
        return 'border-l-blue-400 bg-blue-50/50'
      case 'growth':
      case 'suggestion':
        return 'border-l-purple-400 bg-purple-50/50'
      case 'appreciation':
        return 'border-l-rose-400 bg-rose-50/50'
      case 'milestone':
        return 'border-l-amber-400 bg-amber-50/50'
      default:
        return 'border-l-gray-400 bg-gray-50/50'
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffHours < 1) return 'Just now'
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  // Reset to "For You" tab when generating new insights
  const handleGenerateInsights = () => {
    setActiveTab('personal')
    onGenerateInsights()
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-brand-teal border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-brand-slate">Loading your insights...</p>
        </div>
      </div>
    )
  }

  const recentInsights = showMoreInsights ? insights : insights.slice(0, 2)
  const hasMoreInsights = insights.length > 2

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Clean Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-brand-charcoal">Your Insights</h1>
          <p className="text-brand-slate mt-2">AI-powered relationship guidance, personalized for you</p>
        </div>
        <Button 
          onClick={handleGenerateInsights}
          disabled={generatingInsights}
          className="bg-brand-teal hover:bg-brand-teal-dark text-white"
        >
          {generatingInsights ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              New Insights
            </>
          )}
        </Button>
      </div>

      {/* Two-Tab Navigation */}
      <div className="flex space-x-1 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab('personal')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'personal'
              ? 'border-brand-teal text-brand-teal'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          For You
        </button>
        <button
          onClick={() => setActiveTab('partner')}
          className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'partner'
              ? 'border-brand-coral-pink text-brand-coral-pink'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          From Your Partner
          {partnerSuggestions.filter(s => s.read_status !== 'read').length > 0 && (
            <span className="ml-2 bg-brand-coral-pink text-white text-xs px-2 py-1 rounded-full">
              {partnerSuggestions.filter(s => s.read_status !== 'read').length}
            </span>
          )}
        </button>
      </div>

      {/* For You Tab */}
      {activeTab === 'personal' && (
        <div className="space-y-6">
          {/* Mark All as Read Button for Personal Insights */}
          {insights.filter(i => !i.is_read).length > 0 && (
            <div className="flex justify-end">
              <Button
                onClick={markAllInsightsAsRead}
                variant="outline"
                size="sm"
                className="text-brand-teal border-brand-teal hover:bg-brand-teal hover:text-white"
              >
                Mark All as Read ({insights.filter(i => !i.is_read).length})
              </Button>
            </div>
          )}
          
          {insights.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-brand-teal/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-brand-teal" />
              </div>
              <h3 className="text-xl font-semibold text-brand-charcoal mb-2">Ready for insights?</h3>
              <p className="text-brand-slate mb-6">Generate your first personalized insights to get started.</p>
              <Button 
                onClick={handleGenerateInsights}
                disabled={generatingInsights}
                className="bg-brand-teal hover:bg-brand-teal-dark text-white"
              >
                Generate Insights
              </Button>
            </div>
          ) : (
            <>
              {recentInsights.map((insight) => (
                <Card 
                  key={insight.id} 
                  className={`${getPillarColor(insight.insight_type)} border-l-4 ${
                    insight.is_read ? 'opacity-75' : ''
                  } hover:shadow-lg transition-all duration-200`}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        {getPillarIcon(insight.insight_type)}
                        <div>
                          <h3 className="text-lg font-semibold text-brand-charcoal">{insight.title}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <p className="text-sm text-brand-slate capitalize">
                              {insight.insight_type === 'suggestion' ? 'growth opportunity' : insight.insight_type}
                            </p>
                            <span className="text-xs text-gray-400">•</span>
                            <p className="text-xs text-gray-400">{formatTimeAgo(insight.created_at)}</p>
                          </div>
                        </div>
                      </div>
                      {!insight.is_read && (
                        <div className="flex items-center space-x-2">
                          <span className="bg-brand-teal text-white text-xs px-2 py-1 rounded-full">New</span>
                          <Button
                            onClick={() => markAsRead(insight.id)}
                            variant="ghost"
                            size="sm"
                            className="text-brand-teal hover:bg-brand-teal hover:text-white text-xs"
                          >
                            Got it
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-brand-charcoal leading-relaxed mb-6">
                      {insight.description}
                    </p>

                    {/* Feedback at bottom of card */}
                    {!feedbackRatings[insight.id] ? (
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-400">Was this helpful?</p>
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handleFeedback(insight.id, 'up')}
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:bg-green-50"
                          >
                            <ThumbsUp className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleFeedback(insight.id, 'down')}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:bg-red-50"
                          >
                            <ThumbsDown className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-green-600">Thank you for your feedback!</p>
                    )}
                  </CardContent>
                </Card>
              ))}
              
              {/* Show More / Show Less Toggle */}
              {hasMoreInsights && (
                <div className="text-center">
                  <Button 
                    onClick={() => setShowMoreInsights(!showMoreInsights)}
                    variant="outline"
                    className="text-brand-teal border-brand-teal hover:bg-brand-teal hover:text-white"
                  >
                    {showMoreInsights ? (
                      <>
                        <ChevronUp className="w-4 h-4 mr-2" />
                        Show Less
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-2" />
                        View More ({insights.length - 2} older)
                      </>
                    )}
                  </Button>
                </div>
              )}

              {/* Generate more CTA when caught up */}
              {recentInsights.every(i => i.is_read) && (
                <div className="text-center py-8">
                  <p className="text-brand-slate mb-4">Caught up on your insights!</p>
                  <Button 
                    onClick={handleGenerateInsights}
                    disabled={generatingInsights}
                    variant="outline"
                    className="text-brand-teal border-brand-teal hover:bg-brand-teal hover:text-white"
                  >
                    Generate More Insights
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* From Your Partner Tab */}
      {activeTab === 'partner' && (
        <div className="space-y-6">
          {/* Mark All as Read Button for Partner Suggestions */}
          {partnerSuggestions.filter(s => s.read_status !== 'read').length > 0 && (
            <div className="flex justify-end">
              <Button
                onClick={markAllPartnerSuggestionsAsRead}
                variant="outline"
                size="sm"
                className="text-brand-coral-pink border-brand-coral-pink hover:bg-brand-coral-pink hover:text-white"
              >
                Mark All as Read ({partnerSuggestions.filter(s => s.read_status !== 'read').length})
              </Button>
            </div>
          )}
          
          {partnerSuggestions.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-brand-coral-pink/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-brand-coral-pink" />
              </div>
              <h3 className="text-xl font-semibold text-brand-charcoal mb-2">Nothing new right now</h3>
              <p className="text-brand-slate mb-2">No new partner suggestions in the last 48 hours.</p>
              <p className="text-sm text-gray-400">Check back later for fresh insights from your partner's activity!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {partnerSuggestions.map((suggestion) => (
                <Card key={suggestion.id} className={`border-l-4 border-l-brand-coral-pink bg-rose-50/30 ${
                  suggestion.read_status === 'read' ? 'opacity-75' : ''
                } hover:shadow-lg transition-all duration-200`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-brand-charcoal">
                          {suggestion.relationships?.name || 'Your Partner'}
                        </h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <p className="text-sm text-brand-slate">{formatTimeAgo(suggestion.created_at)}</p>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-sm text-brand-coral-pink capitalize bg-white px-2 py-1 rounded border text-xs">
                            {suggestion.relationships?.relationship_type || 'relationship'}
                          </span>
                        </div>
                      </div>
                      {suggestion.read_status !== 'read' && (
                        <div className="flex items-center space-x-2">
                          <span className="bg-brand-coral-pink text-white text-xs px-2 py-1 rounded-full">New</span>
                          <Button
                            onClick={() => markPartnerSuggestionAsRead(suggestion.id)}
                            variant="ghost"
                            size="sm"
                            className="text-brand-coral-pink hover:bg-brand-coral-pink hover:text-white text-xs"
                          >
                            Got it
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-brand-charcoal leading-relaxed mb-6">
                      {suggestion.suggestion_text}
                    </p>

                    {/* Feedback at bottom of card */}
                    {!partnerFeedbackRatings[suggestion.id] ? (
                      <div className="flex items-center justify-between">
                        <p className="text-xs text-gray-400">Was this helpful?</p>
                        <div className="flex space-x-2">
                          <Button
                            onClick={() => handlePartnerFeedback(suggestion.id, 'up')}
                            variant="ghost"
                            size="sm"
                            className="text-green-600 hover:bg-green-50"
                          >
                            <ThumbsUp className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handlePartnerFeedback(suggestion.id, 'down')}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:bg-red-50"
                          >
                            <ThumbsDown className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-green-600">Thank you for your feedback!</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}