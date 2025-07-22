// Shared Insights Component for Partners
// Save as: components/SharedInsights.tsx

'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'

interface SharedInsightsProps {
  relationshipId: string
  currentUserId: string
  privacyLevel?: 'general' | 'patterns' | 'detailed'
}

export default function SharedInsights({ 
  relationshipId, 
  currentUserId, 
  privacyLevel = 'general' 
}: SharedInsightsProps) {
  const [insights, setInsights] = useState<any[]>([])
  const [partners, setPartners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [relationshipInfo, setRelationshipInfo] = useState<any>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    loadSharedData()
  }, [relationshipId, privacyLevel])

  const loadSharedData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        loadRelationshipInfo(),
        loadPartners(),
        loadSharedInsights()
      ])
    } catch (error) {
      console.error('Error loading shared data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadRelationshipInfo = async () => {
    const { data, error } = await supabase
      .from('relationships')
      .select('*')
      .eq('id', relationshipId)
      .single()

    if (data && !error) {
      setRelationshipInfo(data)
    }
  }

  const loadPartners = async () => {
    const { data, error } = await supabase
      .from('relationship_members')
      .select(`
        user_id,
        role,
        joined_at,
        users (
          id,
          email,
          full_name
        )
      `)
      .eq('relationship_id', relationshipId)
      .neq('user_id', currentUserId)

    if (data && !error) {
      setPartners(data)
    }
  }

  const loadSharedInsights = async () => {
    // Load insights that are appropriate for sharing based on privacy level
    const { data, error } = await supabase
      .from('relationship_insights')
      .select('*')
      .or(`relationship_id.eq.${relationshipId},generated_for_user.in.(${await getPartnerIds()})`)
      .order('created_at', { ascending: false })
      .limit(10)

    if (data && !error) {
      // Filter insights based on privacy level
      const filteredInsights = filterInsightsByPrivacy(data, privacyLevel)
      setInsights(filteredInsights)
    }
  }

  const getPartnerIds = async () => {
    const { data } = await supabase
      .from('relationship_members')
      .select('user_id')
      .eq('relationship_id', relationshipId)

    return data?.map(member => member.user_id).join(',') || ''
  }

  const filterInsightsByPrivacy = (insights: any[], privacy: string) => {
    return insights.map(insight => {
      switch (privacy) {
        case 'general':
          // Only show very basic, general insights
          return {
            ...insight,
            description: generalizeInsight(insight.description),
            title: generalizeTitle(insight.title)
          }
        case 'patterns':
          // Show pattern-based insights but anonymized
          return {
            ...insight,
            description: anonymizePatternInsight(insight.description)
          }
        case 'detailed':
          // Show full insights (respecting user's choice)
          return insight
        default:
          return {
            ...insight,
            description: 'General relationship insight available.',
            title: 'Relationship Insight'
          }
      }
    })
  }

  const generalizeInsight = (description: string) => {
    // Convert specific insights to general suggestions
    if (description.includes('connection score')) {
      return 'Consider focusing on quality time and communication to strengthen your bond.'
    }
    if (description.includes('mood')) {
      return 'Supporting each other through different moods can strengthen your relationship.'
    }
    if (description.includes('gratitude')) {
      return 'Expressing appreciation regularly can improve relationship satisfaction.'
    }
    // Default generalization
    return 'Continue focusing on communication and connection in your relationship.'
  }

  const generalizeTitle = (title: string) => {
    if (title.includes('Connection') || title.includes('Score')) {
      return 'Connection Opportunity'
    }
    if (title.includes('Communication')) {
      return 'Communication Focus'
    }
    if (title.includes('Appreciation')) {
      return 'Gratitude Practice'
    }
    return 'Relationship Insight'
  }

  const anonymizePatternInsight = (description: string) => {
    // Remove specific scores but keep patterns
    return description
      .replace(/\d+(\.\d+)?\/10/g, 'recent scores')
      .replace(/\d+ (hour|day|week)s? ago/g, 'recently')
      .replace(/specific dates/g, 'recent period')
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
      default:
        return (
          <svg className="w-5 h-5 text-calm-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getPrivacyLevelInfo = (level: string) => {
    switch (level) {
      case 'general':
        return {
          icon: '🔒',
          label: 'General Sharing',
          description: 'Basic suggestions only'
        }
      case 'patterns':
        return {
          icon: '📊',
          label: 'Pattern Sharing',
          description: 'Trends without specific details'
        }
      case 'detailed':
        return {
          icon: '🔓',
          label: 'Detailed Sharing',
          description: 'Full insights and recommendations'
        }
      default:
        return {
          icon: '🔐',
          label: 'Private',
          description: 'No sharing'
        }
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="w-8 h-8 border-2 border-calm-300 border-t-calm-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500">Loading shared insights...</p>
      </div>
    )
  }

  const privacyInfo = getPrivacyLevelInfo(privacyLevel)

  return (
    <div className="space-y-6">
      {/* Privacy Level Indicator */}
      <div className="bg-calm-50 border border-calm-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{privacyInfo.icon}</span>
          <div>
            <h4 className="font-semibold text-calm-800">{privacyInfo.label}</h4>
            <p className="text-sm text-calm-600">{privacyInfo.description}</p>
          </div>
        </div>
      </div>

      {/* Relationship Info */}
      {relationshipInfo && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center space-x-3 mb-3">
            <span className="text-2xl">💕</span>
            <div>
              <h3 className="font-semibold text-gray-900">{relationshipInfo.name}</h3>
              <p className="text-sm text-gray-600">
                {partners.length} partner{partners.length !== 1 ? 's' : ''} connected
              </p>
            </div>
          </div>
          
          {partners.length > 0 && (
            <div className="space-y-2">
              {partners.map((partner: any) => (
                <div key={partner.user_id} className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>{partner.users?.full_name || partner.users?.email}</span>
                  <span className="text-xs text-gray-500">({partner.role})</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Shared Insights */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Shared Insights</h3>
        
        {insights.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
            <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <p className="text-gray-500 mb-2">No shared insights yet</p>
            <p className="text-sm text-gray-400">Insights will appear here as you and your partner use the app</p>
          </div>
        ) : (
          <div className="space-y-3">
            {insights.map((insight) => (
              <div key={insight.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2 flex-1">
                    <div className={`w-2 h-2 rounded-full ${getPriorityColor(insight.priority)}`} />
                    <div className="flex items-center space-x-1">
                      {getInsightTypeIcon(insight.insight_type)}
                      <h4 className="font-semibold text-gray-900">{insight.title}</h4>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{formatDate(insight.created_at)}</span>
                </div>
                
                <p className="text-gray-700 text-sm leading-relaxed mb-3">
                  {insight.description}
                </p>

                {/* Privacy indicator for this insight */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="capitalize">{insight.insight_type} • {insight.priority} priority</span>
                  <span className="flex items-center space-x-1">
                    <span>{privacyInfo.icon}</span>
                    <span>Shared at {privacyInfo.label.toLowerCase()} level</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Privacy Explanation */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-2">How Sharing Works</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li className="flex items-start space-x-2">
            <span className="text-calm-600">•</span>
            <span>Personal journal entries always stay completely private</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-calm-600">•</span>
            <span>AI insights are filtered based on your privacy settings</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-calm-600">•</span>
            <span>You control what level of detail gets shared</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="text-calm-600">•</span>
            <span>Partners see insights that help support each other</span>
          </li>
        </ul>
      </div>
    </div>
  )
}