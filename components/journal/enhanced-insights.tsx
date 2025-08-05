// components/journal/enhanced-insights.tsx
// Component to display enhanced AI insights from journal analysis

'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Brain, 
  Heart, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Target,
  Lightbulb,
  Star,
  Clock,
  Zap
} from 'lucide-react'

interface EnhancedJournalInsights {
  sentiment_analysis: {
    overall_sentiment: 'positive' | 'neutral' | 'negative' | 'mixed'
    confidence_score: number
    emotional_state: {
      primary_emotion: string
      intensity_level: number
      stress_indicators: string[]
      joy_indicators: string[]
    }
    relationship_needs: Array<{
      need_type: string
      intensity: number
      urgency: 'immediate' | 'soon' | 'ongoing' | 'low'
      partner_action_suggestion: string
    }>
  }
  relationship_health_score: number
  immediate_actions: Array<{
    action_type: string
    description: string
    priority: 'urgent' | 'high' | 'medium' | 'low'
    timeframe: 'today' | 'this_week' | 'ongoing'
  }>
  pattern_insights: Array<{
    pattern_type: string
    description: string
    frequency: string
    recommended_response: string
  }>
  fulfillment_tracking: {
    areas: {
      emotional_intimacy: number
      physical_connection: number
      communication_quality: number
      shared_experiences: number
      individual_autonomy: number
    }
    overall_fulfillment: number
  }
}

interface Props {
  insights: EnhancedJournalInsights
  onActionTaken?: (actionId: string) => void
  className?: string
}

export function EnhancedJournalInsights({ insights, onActionTaken, className }: Props) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Overall Health Score */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" />
            Enhanced AI Analysis
          </CardTitle>
          <CardDescription>
            Deep relationship intelligence from your journal entry
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Relationship Health Score</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-blue-600">
                  {insights.relationship_health_score.toFixed(1)}/10
                </span>
                <Progress value={insights.relationship_health_score * 10} className="w-24 h-2" />
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">Overall Sentiment</p>
              <Badge variant={getSentimentVariant(insights.sentiment_analysis.overall_sentiment)}>
                {insights.sentiment_analysis.overall_sentiment}
              </Badge>
              <p className="text-xs text-gray-500 mt-1">
                {(insights.sentiment_analysis.confidence_score * 100).toFixed(0)}% confidence
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Immediate Actions Alert */}
      {insights.immediate_actions.filter(a => a.priority === 'urgent' || a.priority === 'high').length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {insights.immediate_actions.filter(a => a.priority === 'urgent' || a.priority === 'high').length} high-priority actions identified for today.
            <Button variant="link" className="ml-2 p-0" onClick={() => toggleSection('actions')}>
              View Actions
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Emotional State Analysis */}
      <Card>
        <CardHeader className="cursor-pointer" onClick={() => toggleSection('emotional')}>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-pink-600" />
              Emotional State Analysis
            </div>
            <span className="text-sm text-gray-500">
              {expandedSection === 'emotional' ? 'Collapse' : 'Expand'}
            </span>
          </CardTitle>
        </CardHeader>
        {expandedSection === 'emotional' && (
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium mb-2">Primary Emotion</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{insights.sentiment_analysis.emotional_state.primary_emotion}</Badge>
                  <span className="text-sm">
                    Intensity: {insights.sentiment_analysis.emotional_state.intensity_level}/10
                  </span>
                </div>
              </div>
            </div>

            {insights.sentiment_analysis.emotional_state.stress_indicators.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2 text-red-600">Stress Indicators</p>
                <div className="flex flex-wrap gap-2">
                  {insights.sentiment_analysis.emotional_state.stress_indicators.map((indicator, index) => (
                    <Badge key={index} variant="destructive" className="text-xs">
                      {indicator}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {insights.sentiment_analysis.emotional_state.joy_indicators.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2 text-green-600">Joy Indicators</p>
                <div className="flex flex-wrap gap-2">
                  {insights.sentiment_analysis.emotional_state.joy_indicators.map((indicator, index) => (
                    <Badge key={index} variant="default" className="text-xs">
                      {indicator}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Relationship Needs */}
      {insights.sentiment_analysis.relationship_needs.length > 0 && (
        <Card>
          <CardHeader className="cursor-pointer" onClick={() => toggleSection('needs')}>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                Detected Relationship Needs
                <Badge variant="secondary">{insights.sentiment_analysis.relationship_needs.length}</Badge>
              </div>
              <span className="text-sm text-gray-500">
                {expandedSection === 'needs' ? 'Collapse' : 'Expand'}
              </span>
            </CardTitle>
          </CardHeader>
          {expandedSection === 'needs' && (
            <CardContent>
              <div className="space-y-4">
                {insights.sentiment_analysis.relationship_needs
                  .sort((a, b) => b.intensity - a.intensity)
                  .map((need, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium capitalize">
                        {need.need_type.replace('_', ' ')}
                      </h4>
                      <div className="flex items-center gap-2">
                        <Badge variant={getUrgencyVariant(need.urgency)}>
                          {need.urgency}
                        </Badge>
                        <span className="text-sm font-medium">
                          {need.intensity}/10
                        </span>
                      </div>
                    </div>
                    <Progress value={need.intensity * 10} className="h-2 mb-2" />
                    <p className="text-sm text-gray-600">
                      <strong>Suggested Response:</strong> {need.partner_action_suggestion}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Immediate Actions */}
      {insights.immediate_actions.length > 0 && (
        <Card>
          <CardHeader className="cursor-pointer" onClick={() => toggleSection('actions')}>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Recommended Actions
                <Badge variant="secondary">{insights.immediate_actions.length}</Badge>
              </div>
              <span className="text-sm text-gray-500">
                {expandedSection === 'actions' ? 'Collapse' : 'Expand'}
              </span>
            </CardTitle>
          </CardHeader>
          {expandedSection === 'actions' && (
            <CardContent>
              <div className="space-y-4">
                {insights.immediate_actions
                  .sort((a, b) => getPriorityWeight(b.priority) - getPriorityWeight(a.priority))
                  .map((action, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium capitalize">
                        {action.action_type.replace('_', ' ')}
                      </h4>
                      <div className="flex items-center gap-2">
                        <Badge variant={getPriorityVariant(action.priority)}>
                          {action.priority}
                        </Badge>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Clock className="w-3 h-3" />
                          {action.timeframe}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{action.description}</p>
                    {onActionTaken && (
                      <Button 
                        size="sm" 
                        onClick={() => onActionTaken(`${action.action_type}-${index}`)}
                        className="w-full"
                      >
                        Take This Action
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Pattern Insights */}
      {insights.pattern_insights.length > 0 && (
        <Card>
          <CardHeader className="cursor-pointer" onClick={() => toggleSection('patterns')}>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                Pattern Insights
                <Badge variant="secondary">{insights.pattern_insights.length}</Badge>
              </div>
              <span className="text-sm text-gray-500">
                {expandedSection === 'patterns' ? 'Collapse' : 'Expand'}
              </span>
            </CardTitle>
          </CardHeader>
          {expandedSection === 'patterns' && (
            <CardContent>
              <div className="space-y-4">
                {insights.pattern_insights.map((pattern, index) => (
                  <div key={index} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{pattern.pattern_type}</Badge>
                      <span className="text-sm text-gray-500">{pattern.frequency}</span>
                    </div>
                    <p className="text-sm font-medium mb-2">{pattern.description}</p>
                    <p className="text-sm text-blue-600">
                      <strong>Recommendation:</strong> {pattern.recommended_response}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Fulfillment Tracking */}
      <Card>
        <CardHeader className="cursor-pointer" onClick={() => toggleSection('fulfillment')}>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-orange-600" />
              Relationship Fulfillment
            </div>
            <span className="text-sm text-gray-500">
              {expandedSection === 'fulfillment' ? 'Collapse' : 'Expand'}
            </span>
          </CardTitle>
          <CardDescription>
            Overall Score: {insights.fulfillment_tracking.overall_fulfillment.toFixed(1)}/10
          </CardDescription>
        </CardHeader>
        {expandedSection === 'fulfillment' && (
          <CardContent>
            <div className="space-y-4">
              {Object.entries(insights.fulfillment_tracking.areas).map(([area, score]) => (
                <div key={area}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium capitalize">
                      {area.replace('_', ' ')}
                    </span>
                    <span className="text-sm font-bold">{score.toFixed(1)}/10</span>
                  </div>
                  <Progress value={score * 10} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* AI Processing Info */}
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Zap className="w-4 h-4" />
            <span>
              Enhanced AI analysis powered by relationship intelligence algorithms
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper functions
function getSentimentVariant(sentiment: string) {
  switch (sentiment) {
    case 'positive':
      return 'default'
    case 'negative':
      return 'destructive'
    case 'mixed':
      return 'secondary'
    default:
      return 'outline'
  }
}

function getUrgencyVariant(urgency: string) {
  switch (urgency) {
    case 'immediate':
      return 'destructive'
    case 'soon':
      return 'default'
    case 'ongoing':
      return 'secondary'
    default:
      return 'outline'
  }
}

function getPriorityVariant(priority: string) {
  switch (priority) {
    case 'urgent':
      return 'destructive'
    case 'high':
      return 'default'
    case 'medium':
      return 'secondary'
    default:
      return 'outline'
  }
}

function getPriorityWeight(priority: string): number {
  switch (priority) {
    case 'urgent':
      return 4
    case 'high':
      return 3
    case 'medium':
      return 2
    default:
      return 1
  }
}

// Hook for using with journal entries
export function useEnhancedJournalAnalysis() {
  const [analyzing, setAnalyzing] = useState(false)
  const [insights, setInsights] = useState<EnhancedJournalInsights | null>(null)
  const [error, setError] = useState<string | null>(null)

  const analyzeJournal = async (journalContent: string, userId: string, moodScore?: number) => {
    setAnalyzing(true)
    setError(null)

    try {
      const response = await fetch('/api/journal/enhanced-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          journalContent,
          userId,
          moodScore
        })
      })

      if (!response.ok) {
        throw new Error('Analysis failed')
      }

      const data = await response.json()
      setInsights(data.analysis)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setAnalyzing(false)
    }
  }

  return {
    analyzing,
    insights,
    error,
    analyzeJournal
  }
}