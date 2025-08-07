'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Heart, 
  Users, 
  Briefcase, 
  Home,
  CheckCircle,
  Eye,
  Clock,
  ArrowRight,
  Star,
  TrendingUp,
  MessageCircle
} from 'lucide-react'

// Types
interface CleanInsight {
  id: string
  relationship_id: string
  relationship_name: string
  relationship_type: 'romantic' | 'family' | 'friend' | 'work' | 'other'
  title: string
  description: string
  pillar_type: 'pattern' | 'growth' | 'appreciation' | 'milestone'
  priority: 'high' | 'medium' | 'low'
  relevance_score: number
  created_at: string
  suggested_actions: string[]
}

interface CleanInsightsFeedProps {
  insights: CleanInsight[]
  selectedRelationshipId?: string
  onMarkAsRead: (insightId: string) => void
  onViewDetails: (insightId: string) => void
  onExecuteAction: (insightId: string, action: string) => void
  loading?: boolean
  className?: string
}

export function CleanInsightsFeed({
  insights,
  selectedRelationshipId,
  onMarkAsRead,
  onViewDetails,
  onExecuteAction,
  loading = false,
  className = ''
}: CleanInsightsFeedProps) {
  // Filter insights for selected relationship or show all
  const filteredInsights = selectedRelationshipId 
    ? insights.filter(insight => insight.relationship_id === selectedRelationshipId)
    : insights

  // Get relationship icon and color
  const getRelationshipIcon = (type: string) => {
    switch (type) {
      case 'romantic':
        return <Heart className="w-4 h-4 text-pink-500" />
      case 'family':
        return <Home className="w-4 h-4 text-blue-500" />
      case 'friend':
        return <Users className="w-4 h-4 text-green-500" />
      case 'work':
        return <Briefcase className="w-4 h-4 text-gray-500" />
      default:
        return <Users className="w-4 h-4 text-purple-500" />
    }
  }

  const getPillarIcon = (pillarType: string) => {
    switch (pillarType) {
      case 'pattern':
        return <TrendingUp className="w-4 h-4 text-blue-500" />
      case 'growth':
        return <Star className="w-4 h-4 text-green-500" />
      case 'appreciation':
        return <Heart className="w-4 h-4 text-pink-500" />
      case 'milestone':
        return <CheckCircle className="w-4 h-4 text-purple-500" />
      default:
        return <MessageCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-50 border-red-200 text-red-700'
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700'
      case 'low':
        return 'bg-blue-50 border-blue-200 text-blue-700'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700'
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      const now = new Date()
      const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
      
      if (diffHours < 1) return 'Just now'
      if (diffHours < 24) return `${diffHours}h ago`
      const diffDays = Math.floor(diffHours / 24)
      if (diffDays === 1) return 'Yesterday'
      if (diffDays < 7) return `${diffDays}d ago`
      return date.toLocaleDateString()
    } catch {
      return 'Recently'
    }
  }

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="flex space-x-2">
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (filteredInsights.length === 0) {
    return (
      <div className={`${className}`}>
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="p-6 text-center">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">All Caught Up!</h3>
            <p className="text-gray-500 mb-4">
              {selectedRelationshipId 
                ? "No new insights for this relationship." 
                : "No new insights across your relationships."
              }
            </p>
            <p className="text-sm text-gray-400">
              New insights appear here when there's something worth your attention.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-brand-charcoal">
          {selectedRelationshipId ? 'Recent Insights' : 'Recent Insights Across All Relationships'}
        </h2>
        <Badge variant="outline" className="text-brand-slate">
          {filteredInsights.length} unread
        </Badge>
      </div>

      {/* Insights List */}
      <div className="space-y-4">
        {filteredInsights.map((insight) => (
          <Card key={insight.id} className="hover:shadow-md transition-shadow duration-200">
            <CardContent className="p-4">
              {/* Header Row */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  {getRelationshipIcon(insight.relationship_type)}
                  <span className="font-medium text-brand-charcoal text-sm">
                    {insight.relationship_name}
                  </span>
                  <Badge variant="outline" className="text-xs capitalize">
                    {insight.relationship_type}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-2">
                  {getPillarIcon(insight.pillar_type)}
                  <Badge 
                    variant="outline" 
                    className={`text-xs capitalize ${getPriorityColor(insight.priority)}`}
                  >
                    {insight.priority}
                  </Badge>
                  <div className="flex items-center text-xs text-brand-slate">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatTimeAgo(insight.created_at)}
                  </div>
                </div>
              </div>

              {/* Insight Content */}
              <div className="mb-4">
                <h3 className="font-semibold text-brand-charcoal mb-2">
                  {insight.title}
                </h3>
                <p className="text-brand-slate text-sm leading-relaxed">
                  {insight.description}
                </p>
              </div>

              {/* Quick Actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => onMarkAsRead(insight.id)}
                    variant="outline"
                    size="sm"
                    className="text-green-600 border-green-300 hover:bg-green-50"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Mark as Read
                  </Button>
                  
                  <Button
                    onClick={() => onViewDetails(insight.id)}
                    variant="outline"
                    size="sm"
                    className="text-blue-600 border-blue-300 hover:bg-blue-50"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Details
                  </Button>
                </div>

                {/* Suggested Actions */}
                {insight.suggested_actions && insight.suggested_actions.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-brand-slate">Quick Action:</span>
                    <Button
                      onClick={() => onExecuteAction(insight.id, insight.suggested_actions[0])}
                      variant="default"
                      size="sm"
                      className="bg-brand-teal hover:bg-brand-teal-dark text-white"
                    >
                      {insight.suggested_actions[0]}
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Relevance Score (for debugging/admin) */}
              {insight.relevance_score > 0 && (
                <div className="mt-2 flex items-center justify-end">
                  <span className="text-xs text-gray-400">
                    Relevance: {insight.relevance_score}/100
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More / View All */}
      {filteredInsights.length > 0 && (
        <div className="mt-6 text-center">
          <Button 
            variant="ghost" 
            className="text-brand-teal hover:bg-brand-teal hover:text-white"
          >
            View All Insights
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  )
}

// Hook for managing insights data
export function useCleanInsightsFeed(userId: string, selectedRelationshipId?: string) {
  const [insights, setInsights] = useState<CleanInsight[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (userId) {
      loadInsights()
    }
  }, [userId, selectedRelationshipId])

  const loadInsights = async () => {
    try {
      setLoading(true)
      setError(null)

      const params = new URLSearchParams({ userId })
      if (selectedRelationshipId) {
        params.append('relationshipId', selectedRelationshipId)
      }

      const response = await fetch(`/api/dashboard/insights?${params}`)
      if (!response.ok) {
        throw new Error('Failed to load insights')
      }

      const data = await response.json()
      setInsights(data.insights || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (insightId: string) => {
    try {
      const response = await fetch(`/api/insights/${insightId}/mark-read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      })

      if (response.ok) {
        // Remove from insights list (since it's now read)
        setInsights(prev => prev.filter(insight => insight.id !== insightId))
      }
    } catch (err) {
      console.error('Failed to mark insight as read:', err)
    }
  }

  const viewDetails = (insightId: string) => {
    // Navigate to insight details page
    window.location.href = `/insights/${insightId}`
  }

  const executeAction = async (insightId: string, action: string) => {
    try {
      // Execute the suggested action
      const response = await fetch(`/api/insights/${insightId}/execute-action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, action })
      })

      if (response.ok) {
        // Mark as acknowledged (middle state between unread and read)
        setInsights(prev => 
          prev.map(insight => 
            insight.id === insightId 
              ? { ...insight, priority: 'low' } // Reduce priority after action
              : insight
          )
        )
      }
    } catch (err) {
      console.error('Failed to execute action:', err)
    }
  }

  const refreshInsights = () => {
    loadInsights()
  }

  return {
    insights,
    loading,
    error,
    markAsRead,
    viewDetails,
    executeAction,
    refreshInsights
  }
}