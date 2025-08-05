// components/dashboard/enhanced-connection-dashboard.tsx
// Enhanced Connection Health Dashboard UI Component

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Heart, 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Target,
  Star,
  Users,
  Activity,
  Zap,
  Calendar,
  Gift
} from 'lucide-react'

// Types
interface ConnectionHealthDashboard {
  overall_health_score: number
  health_trend: 'improving' | 'stable' | 'declining'
  last_updated: string
  
  relationship_vitals: RelationshipVitals
  sentiment_overview: SentimentOverview
  attunement_analysis: AttunementAnalysis
  realtime_intelligence: any
  
  immediate_actions: DashboardAction[]
  weekly_goals: WeeklyGoal[]
  celebration_highlights: CelebrationHighlight[]
  
  trend_analysis: TrendAnalysis
  pattern_insights: PatternInsight[]
  fulfillment_tracking: FulfillmentDashboard
  
  partner_suggestions: PartnerSuggestionSummary[]
  mutual_opportunities: MutualOpportunity[]
}

interface RelationshipVitals {
  connection_score: number
  communication_quality: number
  intimacy_level: number
  support_satisfaction: number
  growth_momentum: number
  last_7_days_avg: number
  change_from_last_week: number
}

interface SentimentOverview {
  current_sentiment: 'positive' | 'neutral' | 'negative' | 'mixed'
  confidence: number
  dominant_emotions: string[]
  needs_summary: {
    immediate: number
    ongoing: number
    resolved: number
  }
  emotional_trend: 'improving' | 'stable' | 'declining'
}

interface AttunementAnalysis {
  partner_attunement_score: number
  responsiveness: number
  understanding: number
  proactive_care: number
  recent_improvements: string[]
  areas_for_growth: string[]
}

interface DashboardAction {
  action_id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  category: 'communication' | 'connection' | 'self_care' | 'celebration'
  estimated_time: string
  expected_impact: string
}

interface WeeklyGoal {
  goal_id: string
  title: string
  description: string
  target_metric: string
  current_progress: number
  target_value: number
  due_date: string
  action_steps: string[]
}

interface CelebrationHighlight {
  highlight_id: string
  achievement: string
  significance: number
  date: string
  share_worthy: boolean
}

interface TrendAnalysis {
  overall_direction: 'improving' | 'stable' | 'declining'
  confidence: number
  key_drivers: string[]
  momentum_score: number
  prediction_next_month: string
  recommended_focus: string[]
}

interface PatternInsight {
  pattern_type: string
  description: string
  frequency: string
  impact: string
  recommendation: string
}

interface FulfillmentDashboard {
  areas: {
    emotional_intimacy: FulfillmentArea
    physical_connection: FulfillmentArea
    communication: FulfillmentArea
    shared_experiences: FulfillmentArea
    individual_growth: FulfillmentArea
  }
  overall_satisfaction: number
  trending_areas: string[]
}

interface FulfillmentArea {
  current_level: number
  target_level: number
  trend: 'improving' | 'stable' | 'declining'
  last_improvement: string
  next_milestone: string
}

interface PartnerSuggestionSummary {
  suggestion_count: number
  categories: string[]
  urgency_breakdown: {
    immediate: number
    soon: number
    ongoing: number
  }
  success_rate: number
}

interface MutualOpportunity {
  opportunity_type: string
  description: string
  timing: string
  both_benefit: boolean
  ease_of_implementation: 'easy' | 'moderate' | 'challenging'
}

interface Props {
  userId: string
  className?: string
}

export function EnhancedConnectionDashboard({ userId, className }: Props) {
  const [dashboard, setDashboard] = useState<ConnectionHealthDashboard | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const loadDashboard = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/dashboard/connection-health?userId=${userId}`)
      
      if (!response.ok) {
        throw new Error('Failed to load dashboard')
      }
      
      const data = await response.json()
      setDashboard(data.dashboard)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const refreshDashboard = async () => {
    setRefreshing(true)
    await loadDashboard()
    setRefreshing(false)
  }

  useEffect(() => {
    loadDashboard()
  }, [userId])

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Failed to load dashboard: {error}
          <Button variant="outline" size="sm" onClick={loadDashboard} className="ml-2">
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (!dashboard) {
    return <div>No dashboard data available</div>
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with Overall Health Score */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-brand-charcoal">Connection Health Dashboard</h1>
          <p className="text-brand-slate">AI-powered relationship intelligence</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-brand-charcoal">
              {dashboard.overall_health_score.toFixed(1)}/10
            </div>
            <div className="flex items-center gap-1 text-sm">
              {getTrendIcon(dashboard.health_trend)}
              <span className={getTrendColor(dashboard.health_trend)}>
                {dashboard.health_trend}
              </span>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={refreshDashboard} 
            disabled={refreshing}
            className="gap-2"
          >
            <Activity className="w-4 h-4" />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Quick Actions Alert */}
      {dashboard.immediate_actions.length > 0 && (
        <Alert>
          <Zap className="h-4 w-4" />
          <AlertDescription>
            You have {dashboard.immediate_actions.length} immediate actions to improve your connection.
            <Button variant="link" className="ml-2 p-0">View Actions</Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="partner">Partner</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Relationship Vitals */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <VitalCard
              title="Connection Score"
              value={dashboard.relationship_vitals.connection_score}
              change={dashboard.relationship_vitals.change_from_last_week}
              icon={<Heart className="w-5 h-5" />}
              color="text-pink-600"
            />
            <VitalCard
              title="Communication Quality"
              value={dashboard.relationship_vitals.communication_quality}
              icon={<Users className="w-5 h-5" />}
              color="text-blue-600"
            />
            <VitalCard
              title="Growth Momentum"
              value={dashboard.relationship_vitals.growth_momentum}
              icon={<TrendingUp className="w-5 h-5" />}
              color="text-green-600"
            />
          </div>

          {/* Sentiment & Attunement Overview */}
          <div className="grid md:grid-cols-2 gap-6">
            <SentimentOverviewCard sentiment={dashboard.sentiment_overview} />
            <AttunementOverviewCard attunement={dashboard.attunement_analysis} />
          </div>

          {/* Fulfillment Tracking */}
          <FulfillmentTrackingCard fulfillment={dashboard.fulfillment_tracking} />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {/* Real-time Intelligence */}
          <RealTimeIntelligenceCard intelligence={dashboard.realtime_intelligence} />
          
          {/* Pattern Insights */}
          <PatternInsightsCard patterns={dashboard.pattern_insights} />
        </TabsContent>

        <TabsContent value="actions" className="space-y-6">
          {/* Immediate Actions */}
          <ImmediateActionsCard actions={dashboard.immediate_actions} />
          
          {/* Weekly Goals */}
          <WeeklyGoalsCard goals={dashboard.weekly_goals} />
          
          {/* Celebrations */}
          <CelebrationHighlightsCard highlights={dashboard.celebration_highlights} />
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          {/* Trend Analysis */}
          <TrendAnalysisCard trends={dashboard.trend_analysis} />
        </TabsContent>

        <TabsContent value="partner" className="space-y-6">
          {/* Partner Suggestions Summary */}
          <PartnerSuggestionsCard suggestions={dashboard.partner_suggestions} />
          
          {/* Mutual Opportunities */}
          <MutualOpportunitiesCard opportunities={dashboard.mutual_opportunities} />
        </TabsContent>
      </Tabs>

      {/* Last Updated */}
      <div className="text-center text-sm text-gray-500">
        Last updated: {new Date(dashboard.last_updated).toLocaleString()}
      </div>
    </div>
  )
}

// Helper Components

function VitalCard({ title, value, change, icon, color }: {
  title: string
  value: number
  change?: number
  icon: React.ReactNode
  color: string
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{value.toFixed(1)}</p>
              {change !== undefined && (
                <Badge variant={change >= 0 ? "default" : "secondary"}>
                  {change >= 0 ? '+' : ''}{change.toFixed(1)}
                </Badge>
              )}
            </div>
          </div>
          <div className={color}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}

function SentimentOverviewCard({ sentiment }: { sentiment: SentimentOverview }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          Emotional Intelligence
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-gray-600">Current Sentiment</p>
          <Badge variant={sentiment.current_sentiment === 'positive' ? 'default' : 'secondary'}>
            {sentiment.current_sentiment}
          </Badge>
          <span className="ml-2 text-sm text-gray-500">
            ({(sentiment.confidence * 100).toFixed(0)}% confidence)
          </span>
        </div>
        
        <div>
          <p className="text-sm text-gray-600 mb-2">Current Needs</p>
          <div className="flex gap-2 text-sm">
            <Badge variant="destructive">{sentiment.needs_summary.immediate} immediate</Badge>
            <Badge variant="secondary">{sentiment.needs_summary.ongoing} ongoing</Badge>
            <Badge variant="default">{sentiment.needs_summary.resolved} resolved</Badge>
          </div>
        </div>

        <div>
          <p className="text-sm text-gray-600">Dominant Emotions</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {sentiment.dominant_emotions.map((emotion, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {emotion}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function AttunementOverviewCard({ attunement }: { attunement: AttunementAnalysis }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Partner Attunement
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm">Overall Score</span>
            <span className="font-bold">{attunement.partner_attunement_score.toFixed(1)}/10</span>
          </div>
          <Progress value={attunement.partner_attunement_score * 10} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Responsiveness</p>
            <p className="font-medium">{attunement.responsiveness.toFixed(1)}/10</p>
          </div>
          <div>
            <p className="text-gray-600">Understanding</p>
            <p className="font-medium">{attunement.understanding.toFixed(1)}/10</p>
          </div>
          <div>
            <p className="text-gray-600">Proactive Care</p>
            <p className="font-medium">{attunement.proactive_care.toFixed(1)}/10</p>
          </div>
        </div>

        {attunement.recent_improvements.length > 0 && (
          <div>
            <p className="text-sm text-gray-600 mb-1">Recent Improvements</p>
            <p className="text-sm text-green-600">{attunement.recent_improvements[0]}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function FulfillmentTrackingCard({ fulfillment }: { fulfillment: FulfillmentDashboard }) {
  const areas = Object.entries(fulfillment.areas)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5" />
          Relationship Fulfillment
        </CardTitle>
        <CardDescription>
          Overall Satisfaction: {fulfillment.overall_satisfaction.toFixed(1)}/10
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {areas.map(([areaName, area]) => (
            <div key={areaName}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm capitalize">
                  {areaName.replace('_', ' ')}
                </span>
                <div className="flex items-center gap-2">
                  {getTrendIcon(area.trend, 'sm')}
                  <span className="text-sm font-medium">
                    {area.current_level.toFixed(1)}/{area.target_level.toFixed(1)}
                  </span>
                </div>
              </div>
              <Progress 
                value={(area.current_level / area.target_level) * 100} 
                className="h-2" 
              />
              <p className="text-xs text-gray-500 mt-1">{area.next_milestone}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function RealTimeIntelligenceCard({ intelligence }: { intelligence: any }) {
  if (!intelligence) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Real-time Intelligence
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {intelligence.current_needs?.length > 0 && (
          <div>
            <h4 className="font-medium text-sm mb-2">Current Needs Detected</h4>
            {intelligence.current_needs.slice(0, 3).map((need: any, index: number) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg mb-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium capitalize">{need.need_type?.replace('_', ' ')}</span>
                  <Badge variant={need.urgency === 'immediate' ? 'destructive' : 'secondary'}>
                    {need.urgency}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mt-1">{need.suggested_response}</p>
              </div>
            ))}
          </div>
        )}

        {intelligence.connection_opportunities?.length > 0 && (
          <div>
            <h4 className="font-medium text-sm mb-2">Connection Opportunities</h4>
            {intelligence.connection_opportunities.slice(0, 2).map((opp: any, index: number) => (
              <div key={index} className="p-3 bg-blue-50 rounded-lg mb-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">{opp.opportunity_type?.replace('_', ' ')}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{opp.context}</p>
              </div>
            ))}
          </div>
        )}

        {intelligence.celebration_moments?.length > 0 && (
          <div>
            <h4 className="font-medium text-sm mb-2">Moments to Celebrate</h4>
            {intelligence.celebration_moments.slice(0, 2).map((moment: any, index: number) => (
              <div key={index} className="p-3 bg-green-50 rounded-lg mb-2">
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-green-600" />
                  <span className="font-medium">{moment.achievement_type?.replace('_', ' ')}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{moment.description}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function PatternInsightsCard({ patterns }: { patterns: PatternInsight[] }) {
  if (!patterns.length) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pattern Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {patterns.map((pattern, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Badge variant="outline">{pattern.pattern_type}</Badge>
                <span className="text-sm text-gray-500">{pattern.frequency}</span>
              </div>
              <p className="text-sm font-medium mb-1">{pattern.description}</p>
              <p className="text-sm text-gray-600 mb-2">Impact: {pattern.impact}</p>
              <p className="text-sm text-blue-600">{pattern.recommendation}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ImmediateActionsCard({ actions }: { actions: DashboardAction[] }) {
  if (!actions.length) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Immediate Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {actions.map((action) => (
            <div key={action.action_id} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium">{action.title}</h4>
                <div className="flex items-center gap-2">
                  <Badge variant={
                    action.priority === 'high' ? 'destructive' : 
                    action.priority === 'medium' ? 'default' : 'secondary'
                  }>
                    {action.priority}
                  </Badge>
                  <Badge variant="outline">{action.category}</Badge>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">{action.description}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {action.estimated_time}
                </span>
                <span className="text-green-600">{action.expected_impact}</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function WeeklyGoalsCard({ goals }: { goals: WeeklyGoal[] }) {
  if (!goals.length) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Weekly Goals
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {goals.map((goal) => (
            <div key={goal.goal_id} className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">{goal.title}</h4>
              <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
              
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm">Progress</span>
                  <span className="text-sm font-medium">
                    {goal.current_progress.toFixed(1)}/{goal.target_value.toFixed(1)}
                  </span>
                </div>
                <Progress 
                  value={(goal.current_progress / goal.target_value) * 100} 
                  className="h-2" 
                />
              </div>

              <div>
                <p className="text-sm font-medium mb-1">Action Steps:</p>
                <ul className="text-sm text-gray-600 space-y-1">
                  {goal.action_steps.map((step, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function CelebrationHighlightsCard({ highlights }: { highlights: CelebrationHighlight[] }) {
  if (!highlights.length) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5" />
          Celebration Highlights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {highlights.map((highlight) => (
            <div key={highlight.highlight_id} className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-600" />
                  <span className="font-medium text-yellow-800">Achievement</span>
                </div>
                {highlight.share_worthy && (
                  <Badge variant="default">Share worthy!</Badge>
                )}
              </div>
              <p className="text-sm font-medium text-gray-800 mb-1">{highlight.achievement}</p>
              <p className="text-sm text-gray-600">
                Significance: {highlight.significance}/10 • {new Date(highlight.date).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function TrendAnalysisCard({ trends }: { trends: TrendAnalysis }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Trend Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Overall Direction</span>
            <div className="flex items-center gap-2">
              {getTrendIcon(trends.overall_direction)}
              <span className={getTrendColor(trends.overall_direction)}>
                {trends.overall_direction}
              </span>
            </div>
          </div>
          <Progress value={trends.confidence * 100} className="h-2" />
          <p className="text-xs text-gray-500 mt-1">{trends.confidence * 100}% confidence</p>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Key Drivers</p>
          <div className="space-y-1">
            {trends.key_drivers.map((driver, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                {driver}
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-1">Next Month Prediction</p>
          <p className="text-sm text-gray-600">{trends.prediction_next_month}</p>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Recommended Focus</p>
          <div className="flex flex-wrap gap-2">
            {trends.recommended_focus.map((focus, index) => (
              <Badge key={index} variant="outline">{focus}</Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function PartnerSuggestionsCard({ suggestions }: { suggestions: PartnerSuggestionSummary[] }) {
  if (!suggestions.length) return null

  const suggestion = suggestions[0]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5" />
          Partner Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total Suggestions</p>
            <p className="text-2xl font-bold">{suggestion.suggestion_count}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Success Rate</p>
            <p className="text-2xl font-bold">{(suggestion.success_rate * 100).toFixed(0)}%</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Urgency Breakdown</p>
          <div className="flex gap-2">
            <Badge variant="destructive">
              {suggestion.urgency_breakdown.immediate} immediate
            </Badge>
            <Badge variant="default">
              {suggestion.urgency_breakdown.soon} soon
            </Badge>
            <Badge variant="secondary">
              {suggestion.urgency_breakdown.ongoing} ongoing
            </Badge>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium mb-2">Categories</p>
          <div className="flex flex-wrap gap-2">
            {suggestion.categories.map((category, index) => (
              <Badge key={index} variant="outline">
                {category.replace('_', ' ')}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function MutualOpportunitiesCard({ opportunities }: { opportunities: MutualOpportunity[] }) {
  if (!opportunities.length) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Mutual Opportunities
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {opportunities.map((opportunity, index) => (
            <div key={index} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium capitalize">
                  {opportunity.opportunity_type.replace('_', ' ')}
                </h4>
                <Badge variant={
                  opportunity.ease_of_implementation === 'easy' ? 'default' :
                  opportunity.ease_of_implementation === 'moderate' ? 'secondary' : 'outline'
                }>
                  {opportunity.ease_of_implementation}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-2">{opportunity.description}</p>
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {opportunity.timing}
                </span>
                {opportunity.both_benefit && (
                  <Badge variant="outline">Win-Win</Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// Helper functions
function getTrendIcon(trend: string, size: string = 'default') {
  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'
  
  switch (trend) {
    case 'improving':
      return <TrendingUp className={`${iconSize} text-green-600`} />
    case 'declining':
      return <TrendingDown className={`${iconSize} text-red-600`} />
    default:
      return <Minus className={`${iconSize} text-gray-600`} />
  }
}

function getTrendColor(trend: string): string {
  switch (trend) {
    case 'improving':
      return 'text-green-600'
    case 'declining':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
}