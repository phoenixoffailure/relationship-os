// app/premium/analytics/page.tsx
// Phase 6A Premium Analytics Dashboard
// Research-backed relationship insights for premium subscribers

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Heart, 
  Users, 
  TrendingUp, 
  Brain, 
  Lock, 
  Star,
  BarChart3,
  MessageSquare,
  AlertCircle,
  CheckCircle,
  Crown
} from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'

// Types for premium analytics
interface PremiumSubscription {
  has_premium: boolean
  subscription_status: string
  plan_type?: string
  current_period_end?: string
  trial_ends_at?: string
  trial_available: boolean
}

interface FIROCompatibility {
  inclusion_compatibility: number
  control_compatibility: number
  affection_compatibility: number
  overall_score: number
  compatibility_level: string
  confidence_level: number
  research_insights: string[]
  limitations: string[]
}

interface RelationshipOption {
  id: string
  name: string
  relationship_type: string
}

export default function PremiumAnalyticsPage() {
  // State management
  const [user, setUser] = useState<any>(null)
  const [subscription, setSubscription] = useState<PremiumSubscription | null>(null)
  const [relationships, setRelationships] = useState<RelationshipOption[]>([])
  const [selectedRelationshipId, setSelectedRelationshipId] = useState<string>('')
  const [firokCompatibility, setFiroCompatibility] = useState<FIROCompatibility | null>(null)
  const [loading, setLoading] = useState(true)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const initializePage = async () => {
      await loadUser()
      await loadSubscriptionStatus()
      await loadRelationships()
      setLoading(false)
    }
    
    initializePage()
  }, [])

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUser(user)
    }
  }

  const loadSubscriptionStatus = async () => {
    try {
      const response = await fetch('/api/premium/subscription-check')
      const subscriptionData = await response.json()
      setSubscription(subscriptionData)
    } catch (error) {
      console.error('Error loading subscription status:', error)
    }
  }

  const loadRelationships = async () => {
    try {
      const { data, error } = await supabase
        .from('relationship_members')
        .select(`
          relationships!inner (
            id,
            name,
            relationship_type
          )
        `)
        .eq('user_id', user?.id)

      if (data && !error) {
        const relationshipsList = data
          .filter((item: any) => item.relationships !== null)
          .map((item: any) => ({
            id: item.relationships.id,
            name: item.relationships.name,
            relationship_type: item.relationships.relationship_type
          }))
        
        setRelationships(relationshipsList)
        if (relationshipsList.length > 0) {
          setSelectedRelationshipId(relationshipsList[0].id)
        }
      }
    } catch (error) {
      console.error('Error loading relationships:', error)
    }
  }

  const analyzeFIROCompatibility = async () => {
    if (!selectedRelationshipId) {
      setError('Please select a relationship for analysis')
      return
    }

    setAnalyzing(true)
    setError(null)

    try {
      const response = await fetch('/api/premium/firo-compatibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ relationshipId: selectedRelationshipId })
      })

      const result = await response.json()

      if (result.success) {
        setFiroCompatibility(result.analysis)
      } else {
        setError(result.error || 'Analysis failed')
      }
    } catch (error) {
      console.error('Error analyzing FIRO compatibility:', error)
      setError('Failed to analyze compatibility')
    } finally {
      setAnalyzing(false)
    }
  }

  const getRelationshipTypeIcon = (type: string) => {
    switch (type) {
      case 'romantic': return <Heart className="w-4 h-4" />
      case 'family': return <Users className="w-4 h-4" />
      case 'friend': return <Users className="w-4 h-4" />
      case 'work': return <BarChart3 className="w-4 h-4" />
      default: return <Users className="w-4 h-4" />
    }
  }

  const getCompatibilityColor = (score: number) => {
    if (score >= 85) return 'text-green-600 bg-green-50 border-green-200'
    if (score >= 70) return 'text-blue-600 bg-blue-50 border-blue-200'
    if (score >= 55) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    if (score >= 40) return 'text-orange-600 bg-orange-50 border-orange-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const CompatibilityRadarChart = ({ compatibility }: { compatibility: FIROCompatibility }) => {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Inclusion */}
          <div className="text-center">
            <div className="text-sm font-medium text-brand-slate mb-2">Inclusion (Social Connection)</div>
            <Progress value={compatibility.inclusion_compatibility} className="mb-2" />
            <span className="text-lg font-semibold">{compatibility.inclusion_compatibility}%</span>
          </div>

          {/* Control */}
          <div className="text-center">
            <div className="text-sm font-medium text-brand-slate mb-2">Control (Influence/Structure)</div>
            <Progress value={compatibility.control_compatibility} className="mb-2" />
            <span className="text-lg font-semibold">{compatibility.control_compatibility}%</span>
          </div>

          {/* Affection */}
          <div className="text-center">
            <div className="text-sm font-medium text-brand-slate mb-2">Affection (Emotional Closeness)</div>
            <Progress value={compatibility.affection_compatibility} className="mb-2" />
            <span className="text-lg font-semibold">{compatibility.affection_compatibility}%</span>
          </div>
        </div>
      </div>
    )
  }

  // Premium paywall component
  const PremiumPaywall = () => (
    <div className="min-h-screen bg-gradient-to-br from-brand-warm-white to-brand-cool-gray flex items-center justify-center">
      <div className="max-w-md mx-auto p-6">
        <Card className="text-center border-2 border-brand-teal/20">
          <CardHeader>
            <div className="w-16 h-16 bg-gradient-to-r from-brand-teal to-brand-coral-pink rounded-full mx-auto mb-4 flex items-center justify-center">
              <Crown className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-xl font-heading">Premium Analytics Required</CardTitle>
            <CardDescription>
              Unlock research-backed relationship insights with Premium
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm text-brand-slate">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>FIRO Compatibility Analysis</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Communication Style Insights</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Relationship Trend Forecasting</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>Research-Backed Recommendations</span>
              </div>
            </div>
            
            {subscription?.trial_available && (
              <Button className="w-full bg-brand-teal hover:bg-brand-dark-teal text-white">
                Start 7-Day Free Trial
              </Button>
            )}
            
            <div className="text-xs text-brand-slate">
              $9.99/month • Cancel anytime
            </div>
            
            <Link href="/dashboard">
              <Button variant="outline" className="w-full">
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-warm-white to-brand-cool-gray flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-light-gray border-t-brand-teal rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!subscription?.has_premium) {
    return <PremiumPaywall />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-warm-white to-brand-cool-gray">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Crown className="w-6 h-6 text-brand-teal" />
                <h1 className="text-heading-xl font-bold text-brand-charcoal font-heading">
                  Premium Analytics
                </h1>
              </div>
              <p className="text-brand-slate font-inter">
                Research-backed insights powered by psychology and AI
              </p>
            </div>
            
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Relationship Selection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Select Relationship for Analysis</CardTitle>
            <CardDescription>Choose which relationship you'd like to analyze</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relationships.map((relationship) => (
                <button
                  key={relationship.id}
                  onClick={() => setSelectedRelationshipId(relationship.id)}
                  className={`p-4 rounded-lg border-2 transition-colors ${
                    selectedRelationshipId === relationship.id
                      ? 'border-brand-teal bg-brand-teal/10'
                      : 'border-brand-light-gray hover:border-brand-teal/50'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    {getRelationshipTypeIcon(relationship.relationship_type)}
                    <div className="text-left">
                      <div className="font-medium text-brand-charcoal">{relationship.name}</div>
                      <div className="text-sm text-brand-slate capitalize">
                        {relationship.relationship_type}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Error Display */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-red-700">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analytics Tabs */}
        <Tabs defaultValue="firo" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="firo">FIRO Compatibility</TabsTrigger>
            <TabsTrigger value="communication" disabled>Communication Style</TabsTrigger>
            <TabsTrigger value="trends" disabled>Relationship Trends</TabsTrigger>
          </TabsList>

          {/* FIRO Compatibility Tab */}
          <TabsContent value="firo">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Brain className="w-5 h-5" />
                  <span>FIRO Compatibility Analysis</span>
                </CardTitle>
                <CardDescription>
                  Research-backed compatibility analysis using FIRO theory (Schutz, 1958)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {!firokCompatibility ? (
                  <div className="text-center py-8">
                    <Brain className="w-16 h-16 text-brand-teal/30 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-brand-charcoal mb-2">
                      Ready for Analysis
                    </h3>
                    <p className="text-brand-slate mb-4">
                      Analyze your relationship compatibility using 50+ years of FIRO research
                    </p>
                    <Button
                      onClick={analyzeFIROCompatibility}
                      disabled={analyzing || !selectedRelationshipId}
                      className="bg-brand-teal hover:bg-brand-dark-teal text-white"
                    >
                      {analyzing ? 'Analyzing...' : 'Analyze FIRO Compatibility'}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Overall Score */}
                    <div className="text-center">
                      <div className="text-4xl font-bold text-brand-charcoal mb-2">
                        {firokCompatibility.overall_score}%
                      </div>
                      <Badge className={`text-sm px-3 py-1 ${getCompatibilityColor(firokCompatibility.overall_score)}`}>
                        {firokCompatibility.compatibility_level} Compatibility
                      </Badge>
                      <div className="text-sm text-brand-slate mt-2">
                        Confidence: {firokCompatibility.confidence_level}%
                      </div>
                    </div>

                    {/* Compatibility Breakdown */}
                    <CompatibilityRadarChart compatibility={firokCompatibility} />

                    {/* Research Insights */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-semibold text-blue-900 mb-3 flex items-center space-x-2">
                        <Star className="w-4 h-4" />
                        <span>Research Insights</span>
                      </h4>
                      <div className="space-y-2">
                        {firokCompatibility.research_insights.map((insight, index) => (
                          <p key={index} className="text-sm text-blue-800">
                            • {insight}
                          </p>
                        ))}
                      </div>
                    </div>

                    {/* Limitations */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h4 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4" />
                        <span>Important Limitations</span>
                      </h4>
                      <div className="space-y-1">
                        {firokCompatibility.limitations.map((limitation, index) => (
                          <p key={index} className="text-xs text-gray-700">
                            • {limitation}
                          </p>
                        ))}
                      </div>
                    </div>

                    {/* Re-analyze Button */}
                    <div className="text-center">
                      <Button
                        onClick={analyzeFIROCompatibility}
                        variant="outline"
                        disabled={analyzing}
                        className="border-brand-teal text-brand-teal hover:bg-brand-teal/10"
                      >
                        {analyzing ? 'Analyzing...' : 'Refresh Analysis'}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Communication Analysis Tab (Coming Soon) */}
          <TabsContent value="communication">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <MessageSquare className="w-16 h-16 text-brand-slate/30 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-brand-charcoal mb-2">
                    Communication Analysis
                  </h3>
                  <p className="text-brand-slate">
                    Coming soon - analyze communication patterns from your journal entries
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trends Tab (Coming Soon) */}
          <TabsContent value="trends">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <TrendingUp className="w-16 h-16 text-brand-slate/30 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-brand-charcoal mb-2">
                    Relationship Trends
                  </h3>
                  <p className="text-brand-slate">
                    Coming soon - predictive insights based on relationship patterns
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}