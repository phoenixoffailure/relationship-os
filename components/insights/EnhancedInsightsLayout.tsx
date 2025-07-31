// components/insights/EnhancedInsightsLayout.tsx
// Fixed version with pillar integration

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { createBrowserClient } from '@supabase/ssr'
import { PartnerSuggestions } from '@/components/dashboard/PartnerSuggestions'
import { getPillarConfig, formatPillarTitle } from '@/lib/insights/pillar-helpers'

interface InsightsLayoutProps {
  user: any
  onGenerateInsights: () => void
  generatingInsights: boolean
}

export function EnhancedInsightsLayout({ user, onGenerateInsights, generatingInsights }: InsightsLayoutProps) {
  const [insights, setInsights] = useState<any[]>([])
  const [partnerSuggestions, setPartnerSuggestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'personal' | 'partner' | 'all'>('all')
  const [relationships, setRelationships] = useState<any[]>([])

  // Limits to prevent clutter
  const MAX_INSIGHTS_DISPLAY = 10
  const MAX_SUGGESTIONS_DISPLAY = 8

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    if (user) {
      loadAllData(user.id)
    }
  }, [user])

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
        .limit(MAX_INSIGHTS_DISPLAY)

      if (data && !error) {
        setInsights(data)
      }
    } catch (error) {
      console.error('Error loading personal insights:', error)
    }
  }

  const loadPartnerSuggestions = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('partner_suggestions')
        .select('*')
        .eq('recipient_user_id', userId)
        .or('expires_at.is.null,expires_at.gte.' + new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(MAX_SUGGESTIONS_DISPLAY)

      if (data && !error) {
        setPartnerSuggestions(data)
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

  const getInsightTypeIcon = (type: string) => {
    switch (type) {
      case 'suggestion':
        return (
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        )
      case 'personal_growth':
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
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

  // Enhanced pillar insight rendering
  const renderPillarInsight = (insight: any) => {
    const pillarConfig = getPillarConfig(insight.insight_type)
    
    return (
      <div key={insight.id} className={`${pillarConfig.bgColor} ${pillarConfig.borderColor} border rounded-lg p-4 hover:shadow-md transition-shadow`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start space-x-3 flex-1">
            <div className={`w-3 h-3 rounded-full mt-2 ${getPriorityColor(insight.priority)}`} />
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                {/* Pillar indicator badge */}
                <span className={`text-xs font-medium ${pillarConfig.textColor} bg-white px-2 py-1 rounded-full border ${pillarConfig.borderColor}`}>
                  {pillarConfig.icon} {pillarConfig.name}
                </span>
                {!insight.is_read && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">New</span>
                )}
              </div>
              <h4 className={`font-semibold ${pillarConfig.textColor} text-sm mb-1`}>
                {insight.title}
              </h4>
              <p className="text-gray-600 text-xs mb-2">{formatInsightTime(insight.created_at)}</p>
              <p className={`${pillarConfig.textColor} text-sm leading-relaxed`}>
                {insight.description}
              </p>
            </div>
          </div>
          {!insight.is_read && (
            <Button
              onClick={() => markAsRead(insight.id)}
              size="sm"
              variant="outline"
              className={`${pillarConfig.borderColor} ${pillarConfig.textColor} hover:${pillarConfig.bgColor}`}
            >
              Mark Read
            </Button>
          )}
        </div>
      </div>
    )
  }

  const unreadInsights = insights.filter(i => !i.is_read).length
  const newSuggestions = partnerSuggestions.filter(s => !s.delivered_at).length

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-2 border-calm-300 border-t-calm-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500">Loading your insights...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Tabs */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Your AI Coaching</h2>
            <p className="text-gray-600 mt-1">Personal growth insights and relationship suggestions</p>
          </div>
          <Button 
            onClick={onGenerateInsights}
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

        {/* Tab Navigation */}
        <div className="flex space-x-1 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'all'
                ? 'border-calm-500 text-calm-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            All Insights ({insights.length + partnerSuggestions.length})
          </button>
          <button
            onClick={() => setActiveTab('personal')}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'personal'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Personal Growth ({insights.length})
            {unreadInsights > 0 && (
              <span className="ml-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {unreadInsights}
              </span>
            )}
          </button>
          {relationships.length > 0 && (
            <button
              onClick={() => setActiveTab('partner')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'partner'
                  ? 'border-pink-500 text-pink-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Partner Suggestions ({partnerSuggestions.length})
              {newSuggestions > 0 && (
                <span className="ml-1 bg-pink-500 text-white text-xs px-2 py-1 rounded-full">
                  {newSuggestions}
                </span>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'personal' && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center space-x-2 mb-2">
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className="font-semibold text-green-800">Personal Growth Insights</h3>
            </div>
            <p className="text-green-700 text-sm">
              Safe space to process emotions and develop relationship skills. These insights are private to you.
            </p>
          </div>

          {insights.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <p className="text-gray-500">No personal insights yet. Write in your journal to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {insights.map((insight) => renderPillarInsight(insight))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'partner' && relationships.length > 0 && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 border border-pink-200">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-lg">💕</span>
              <h3 className="font-semibold text-pink-800">Partner Suggestions</h3>
            </div>
            <p className="text-pink-700 text-sm">
              AI-generated suggestions to help strengthen your relationship, based on your partner's expressed needs.
            </p>
          </div>

          <PartnerSuggestions />
        </div>
      )}

      {activeTab === 'all' && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Personal Insights Column */}
          <div className="space-y-4">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <h3 className="font-semibold text-green-800">Personal Growth</h3>
                </div>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  {insights.length} insights
                </span>
              </div>
            </div>

            {insights.slice(0, 3).map((insight) => {
              const pillarConfig = getPillarConfig(insight.insight_type)
              return (
                <div key={insight.id} className={`${pillarConfig.bgColor} ${pillarConfig.borderColor} border rounded-lg p-3 hover:shadow-md transition-shadow`}>
                  <div className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 ${getPriorityColor(insight.priority)}`} />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs">{pillarConfig.icon}</span>
                        <h4 className={`font-medium ${pillarConfig.textColor} text-sm`}>
                          {insight.title}
                        </h4>
                        {!insight.is_read && (
                          <span className="bg-green-100 text-green-800 text-xs px-1 py-0.5 rounded">New</span>
                        )}
                      </div>
                      <p className="text-gray-600 text-xs mb-2">{formatInsightTime(insight.created_at)}</p>
                      <p className={`${pillarConfig.textColor} text-sm line-clamp-2`}>{insight.description}</p>
                    </div>
                  </div>
                </div>
              )
            })}

            {insights.length > 3 && (
              <Button
                onClick={() => setActiveTab('personal')}
                variant="outline"
                className="w-full border-green-300 text-green-700"
              >
                View All Personal Insights ({insights.length})
              </Button>
            )}
          </div>

          {/* Partner Suggestions Column */}
          <div className="space-y-4">
            {relationships.length > 0 ? (
              <>
                <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 border border-pink-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">💕</span>
                      <h3 className="font-semibold text-pink-800">Partner Suggestions</h3>
                    </div>
                    <span className="bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded-full">
                      {partnerSuggestions.length} suggestions
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                  <PartnerSuggestions />
                </div>

                {partnerSuggestions.length > 0 && (
                  <Button
                    onClick={() => setActiveTab('partner')}
                    variant="outline"
                    className="w-full border-pink-300 text-pink-700"
                  >
                    View All Partner Suggestions ({partnerSuggestions.length})
                  </Button>
                )}
              </>
            ) : (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                <div className="text-center">
                  <h3 className="font-semibold text-blue-800 mb-2">Ready to Connect?</h3>
                  <p className="text-blue-700 text-sm mb-3">
                    Connect with your partner to unlock AI-powered relationship suggestions
                  </p>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Create Invitation
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}