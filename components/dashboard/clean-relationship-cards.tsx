'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Heart, 
  Users, 
  Briefcase, 
  Home,
  TrendingUp,
  TrendingDown,
  Minus,
  Bell
} from 'lucide-react'

// Types
interface CleanRelationshipCard {
  id: string
  name: string
  type: 'romantic' | 'family' | 'friend' | 'work' | 'other'
  health_score: number
  trend: 'improving' | 'stable' | 'declining'
  unread_insights: number
  unread_suggestions: number
  last_activity: string
  needs_attention: boolean
}

interface CleanRelationshipCardsProps {
  relationships: CleanRelationshipCard[]
  selectedRelationshipId?: string
  onRelationshipSelect: (relationshipId: string) => void
  loading?: boolean
  className?: string
}

export function CleanRelationshipCards({
  relationships,
  selectedRelationshipId,
  onRelationshipSelect,
  loading = false,
  className = ''
}: CleanRelationshipCardsProps) {
  const [isScrolling, setIsScrolling] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  // Get relationship type icon and color
  const getRelationshipIcon = (type: string) => {
    switch (type) {
      case 'romantic':
        return <Heart className="w-5 h-5 text-pink-500" />
      case 'family':
        return <Home className="w-5 h-5 text-blue-500" />
      case 'friend':
        return <Users className="w-5 h-5 text-green-500" />
      case 'work':
        return <Briefcase className="w-5 h-5 text-gray-500" />
      default:
        return <Users className="w-5 h-5 text-purple-500" />
    }
  }

  const getRelationshipEmoji = (type: string) => {
    switch (type) {
      case 'romantic':
        return '💕'
      case 'family':
        return '👨‍👩‍👧‍👦'
      case 'friend':
        return '👥'
      case 'work':
        return '💼'
      default:
        return '🤝'
    }
  }

  const getHealthColor = (score: number) => {
    if (score >= 85) return 'text-green-600 bg-green-50 border-green-200'
    if (score >= 70) return 'text-blue-600 bg-blue-50 border-blue-200'
    if (score >= 55) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const getHealthMessage = (score: number) => {
    if (score >= 85) return { title: 'Thriving', icon: '🌟' }
    if (score >= 70) return { title: 'Strong', icon: '💚' }
    if (score >= 55) return { title: 'Growing', icon: '🌱' }
    return { title: 'Needs Attention', icon: '🎯' }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-500" />
      case 'declining':
        return <TrendingDown className="w-4 h-4 text-red-500" />
      default:
        return <Minus className="w-4 h-4 text-gray-400" />
    }
  }

  const formatLastActivity = (timestamp: string) => {
    try {
      const date = new Date(timestamp)
      const now = new Date()
      const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
      
      if (diffHours < 1) return 'Active now'
      if (diffHours < 24) return `${diffHours}h ago`
      const diffDays = Math.floor(diffHours / 24)
      if (diffDays === 1) return 'Yesterday'
      if (diffDays < 7) return `${diffDays} days ago`
      return date.toLocaleDateString()
    } catch {
      return 'Recently'
    }
  }

  const getTotalUnreadCount = (relationship: CleanRelationshipCard) => {
    // Only show partner suggestions as notifications (not personal insights)
    return relationship.unread_suggestions
  }

  // Center selected card when selection changes
  useEffect(() => {
    if (selectedRelationshipId && scrollContainerRef.current) {
      const selectedCard = cardRefs.current[selectedRelationshipId]
      if (selectedCard) {
        const container = scrollContainerRef.current
        const cardLeft = selectedCard.offsetLeft
        const cardWidth = selectedCard.offsetWidth
        const containerWidth = container.offsetWidth
        
        // Calculate scroll position to center the card
        const scrollLeft = cardLeft - (containerWidth / 2) + (cardWidth / 2)
        
        container.scrollTo({
          left: scrollLeft,
          behavior: 'smooth'
        })
      }
    }
  }, [selectedRelationshipId])

  // Handle card click - navigate to insights page for this relationship
  const handleCardClick = (relationship: CleanRelationshipCard) => {
    onRelationshipSelect(relationship.id)
    // Navigate to insights page filtered for this relationship
    window.location.href = `/insights?relationshipId=${relationship.id}&name=${encodeURIComponent(relationship.name)}`
  }

  if (loading) {
    return (
      <div className={`${className}`}>
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex-shrink-0 w-72">
              <Card className="h-32 animate-pulse">
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (relationships.length === 0) {
    return (
      <div className={`${className}`}>
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="p-8 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Relationships Yet</h3>
            <p className="text-gray-500 mb-4">Add your first relationship to start tracking your connection health.</p>
            <Button variant="outline" className="border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white">
              Add Relationship
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-brand-charcoal">Your Relationships</h2>
        <Badge variant="outline" className="text-brand-slate">
          {relationships.length} relationship{relationships.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Scrollable Cards */}
      <div className="relative">
        <div 
          ref={scrollContainerRef}
          className="flex space-x-4 overflow-x-auto pb-4 scroll-smooth"
          onScroll={() => setIsScrolling(true)}
          onScrollEnd={() => setIsScrolling(false)}
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {relationships.map((relationship) => {
            const isSelected = relationship.id === selectedRelationshipId
            const healthMessage = getHealthMessage(relationship.health_score)
            const totalUnread = getTotalUnreadCount(relationship)
            
            return (
              <div 
                key={relationship.id} 
                className="flex-shrink-0 w-80"
                ref={(el) => cardRefs.current[relationship.id] = el}
              >
                <Card 
                  className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                    isSelected 
                      ? 'ring-2 ring-brand-teal border-brand-teal shadow-md scale-105' 
                      : 'border-gray-200 hover:border-gray-300'
                  } ${relationship.needs_attention ? 'ring-1 ring-red-200' : ''}`}
                  onClick={() => handleCardClick(relationship)}
                >
                  <CardContent className="p-4">
                    {/* Header Row */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl" role="img" aria-label={relationship.type}>
                          {getRelationshipEmoji(relationship.type)}
                        </span>
                        <div>
                          <h3 className="font-semibold text-brand-charcoal text-sm">
                            {relationship.name}
                          </h3>
                          <p className="text-xs text-brand-slate capitalize">
                            {relationship.type}
                          </p>
                        </div>
                      </div>
                      
                      {/* Unread Badge */}
                      {totalUnread > 0 && (
                        <Badge 
                          variant="destructive" 
                          className="bg-red-500 text-white text-xs px-2 py-1 min-w-[1.5rem] h-6 flex items-center justify-center"
                        >
                          {totalUnread > 99 ? '99+' : totalUnread}
                        </Badge>
                      )}
                    </div>

                    {/* Health Score Row */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-brand-slate">Health Score</span>
                        <div className="flex items-center space-x-1">
                          <span className="text-lg font-bold text-brand-charcoal">
                            {relationship.health_score}
                          </span>
                          <span className="text-xs text-brand-slate">/100</span>
                          {getTrendIcon(relationship.trend)}
                        </div>
                      </div>
                      <Progress 
                        value={relationship.health_score} 
                        className="h-2 mb-1" 
                      />
                      <div className="flex items-center justify-between">
                        <span className={`text-xs px-2 py-1 rounded-full border ${getHealthColor(relationship.health_score)}`}>
                          {healthMessage.icon} {healthMessage.title}
                        </span>
                      </div>
                    </div>

                    {/* Activity Row */}
                    <div className="flex items-center justify-between text-xs text-brand-slate">
                      <span>Last active: {formatLastActivity(relationship.last_activity)}</span>
                      {relationship.needs_attention && (
                        <Badge variant="outline" className="text-orange-600 border-orange-300">
                          <Bell className="w-3 h-3 mr-1" />
                          Attention
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )
          })}
        </div>

        {/* Scroll Indicators */}
        {relationships.length > 3 && (
          <div className="flex justify-center mt-2 space-x-1">
            {relationships.map((_, index) => (
              <div
                key={index}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  index === 0 ? 'bg-brand-teal' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between text-sm">
          <span className="text-brand-slate">
            {relationships.filter(r => r.health_score >= 70).length} thriving relationships
          </span>
          <span className="text-brand-slate">
            {relationships.reduce((sum, r) => sum + getTotalUnreadCount(r), 0)} partner suggestions
          </span>
        </div>
      </div>
    </div>
  )
}

// Hook for managing relationship data
export function useCleanRelationshipCards(userId: string) {
  const [relationships, setRelationships] = useState<CleanRelationshipCard[]>([])
  const [selectedRelationshipId, setSelectedRelationshipId] = useState<string | undefined>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (userId) {
      loadRelationships()
    }
  }, [userId])

  const loadRelationships = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/dashboard/relationships?userId=${userId}`)
      if (!response.ok) {
        throw new Error('Failed to load relationships')
      }

      const data = await response.json()
      setRelationships(data.relationships || [])
      
      // Auto-select first relationship if none selected
      if (data.relationships?.length > 0 && !selectedRelationshipId) {
        setSelectedRelationshipId(data.relationships[0].id)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const refreshRelationships = () => {
    loadRelationships()
  }

  const selectRelationship = (relationshipId: string) => {
    setSelectedRelationshipId(relationshipId)
  }

  const getSelectedRelationship = () => {
    return relationships.find(r => r.id === selectedRelationshipId)
  }

  return {
    relationships,
    selectedRelationshipId,
    selectedRelationship: getSelectedRelationship(),
    loading,
    error,
    selectRelationship,
    refreshRelationships
  }
}