// app/(protected)/checkin/page.tsx
// Phase 7.2: Relationship-specific check-in system with legacy compatibility

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RelationshipCheckin } from '@/components/checkin/RelationshipCheckin'
import { createBrowserClient } from '@supabase/ssr'
import { 
  Heart, 
  CheckCircle, 
  Calendar, 
  TrendingUp,
  Star,
  Settings,
  Sparkles,
  BarChart3,
  Users,
  Briefcase,
  Home
} from 'lucide-react'

interface User {
  id: string
  email: string
  full_name?: string
}

interface Relationship {
  id: string
  name: string
  relationship_type: string
  created_at: string
}

interface RecentCheckin {
  id: string
  relationship_id: string
  relationship_type?: string
  health_score?: number
  created_at: string
  relationships?: {
    name: string
    relationship_type: string
  }
}

export default function CheckinPage() {
  const [user, setUser] = useState<User | null>(null)
  const [relationships, setRelationships] = useState<Relationship[]>([])
  const [recentCheckins, setRecentCheckins] = useState<RecentCheckin[]>([])
  const [loading, setLoading] = useState(true)
  const [checkinMode, setCheckinMode] = useState<'relationship-specific' | 'legacy'>('relationship-specific')
  const [selectedRelationship, setSelectedRelationship] = useState<string | undefined>()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const initialize = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        await Promise.all([
          loadUserRelationships(user.id),
          loadRecentCheckins(user.id)
        ])
      }
      setLoading(false)
    }
    initialize()
  }, [])

  const loadUserRelationships = async (userId: string) => {
    try {
      const { data: memberData, error: memberError } = await supabase
        .from('relationship_members')
        .select(`
          relationship_id,
          relationships (
            id,
            name,
            relationship_type,
            created_at
          )
        `)
        .eq('user_id', userId)

      if (memberError) throw memberError

      const userRelationships = (memberData || [])
        .map((member: any) => member.relationships)
        .filter(Boolean)

      setRelationships(userRelationships)
      
      // Auto-select first relationship if only one exists
      if (userRelationships.length === 1) {
        setSelectedRelationship(userRelationships[0].id)
      }
    } catch (error) {
      console.error('Error loading relationships:', error)
    }
  }

  const loadRecentCheckins = async (userId: string) => {
    try {
      // Load both relationship-specific and legacy check-ins
      const [relationshipCheckinsResult, legacyCheckinsResult] = await Promise.all([
        supabase
          .from('relationship_health_scores')
          .select(`
            id,
            relationship_id,
            relationship_type,
            health_score,
            calculation_date,
            relationships!inner (
              name,
              relationship_type
            )
          `)
          .eq('user_id', userId)
          .order('calculation_date', { ascending: false })
          .limit(5),
        
        supabase
          .from('daily_checkins')
          .select(`
            id,
            relationship_id,
            connection_score,
            mood_score,
            created_at,
            relationships (
              name,
              relationship_type
            )
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(5)
      ])

      const relationshipCheckins = relationshipCheckinsResult.data || []
      const legacyCheckins = legacyCheckinsResult.data || []

      // Combine and format check-ins
      const allCheckins = [
        ...relationshipCheckins.map(checkin => ({
          id: checkin.id,
          relationship_id: checkin.relationship_id,
          relationship_type: checkin.relationship_type,
          health_score: checkin.health_score,
          created_at: checkin.calculation_date,
          relationships: checkin.relationships
        })),
        ...legacyCheckins.map(checkin => ({
          id: checkin.id,
          relationship_id: checkin.relationship_id,
          health_score: Math.round((checkin.connection_score + checkin.mood_score) * 5), // Convert to 100-point scale
          created_at: checkin.created_at,
          relationships: checkin.relationships
        }))
      ]

      // Sort by date and remove duplicates
      const uniqueCheckins = allCheckins
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10)

      setRecentCheckins(uniqueCheckins)
    } catch (error) {
      console.error('Error loading recent check-ins:', error)
    }
  }

  const getRelationshipIcon = (type: string) => {
    switch (type) {
      case 'romantic':
        return <Heart className="w-4 h-4 text-pink-500" />
      case 'work':
        return <Briefcase className="w-4 h-4 text-blue-500" />
      case 'family':
        return <Home className="w-4 h-4 text-green-500" />
      case 'friend':
        return <Users className="w-4 h-4 text-orange-500" />
      default:
        return <Heart className="w-4 h-4 text-purple-500" />
    }
  }

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200'
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-red-600 bg-red-50 border-red-200'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-warm-white to-brand-cool-gray flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-brand-light-gray border-t-brand-teal rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-brand-slate font-inter">Loading your check-in...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-warm-white to-brand-cool-gray flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Please log in to access your check-ins.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-warm-white to-brand-cool-gray">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand-teal to-brand-dark-teal rounded-2xl shadow-lg mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-heading-xl font-bold text-brand-charcoal mb-2 font-heading">
            Relationship Check-in
          </h1>
          <p className="text-brand-slate font-inter max-w-2xl mx-auto">
            Phase 7.2: Track your relationships with relationship-type-specific metrics that adapt to romantic, work, family, and friend connections
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center bg-white rounded-lg border border-brand-light-gray p-1">
            <Button
              variant={checkinMode === 'relationship-specific' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCheckinMode('relationship-specific')}
              className={checkinMode === 'relationship-specific' ? 'bg-brand-teal text-white' : ''}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Relationship-Specific
              <Badge className="ml-2 bg-green-100 text-green-800 border-green-200">NEW</Badge>
            </Button>
            <Button
              variant={checkinMode === 'legacy' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setCheckinMode('legacy')}
              className={checkinMode === 'legacy' ? 'bg-brand-teal text-white' : ''}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Universal
              <Badge className="ml-2 bg-gray-100 text-gray-600 border-gray-200">Legacy</Badge>
            </Button>
          </div>
        </div>

        {/* Phase 7.2 Feature Highlight */}
        {checkinMode === 'relationship-specific' && (
          <Card className="mb-8 border-brand-teal/30 bg-gradient-to-r from-brand-teal/5 to-brand-coral-pink/5">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-brand-teal rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-brand-charcoal font-heading mb-1">
                    🎯 Phase 7.2: Relationship-Specific Metrics
                  </h3>
                  <p className="text-sm text-brand-slate font-inter leading-relaxed">
                    Each relationship type now has appropriate metrics: <strong>Professional Rapport</strong> for work, 
                    <strong> Family Harmony</strong> for family, <strong>Friendship Satisfaction</strong> for friends, 
                    and <strong>Connection & Intimacy</strong> for romantic relationships. No more inappropriate suggestions!
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge variant="outline" className="text-xs">
                      💕 Romantic: Connection + Intimacy
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      💼 Work: Rapport + Collaboration
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      🏠 Family: Harmony + Boundaries
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      👫 Friends: Satisfaction + Energy
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Check-in Form */}
          <div className="lg:col-span-2">
            {checkinMode === 'relationship-specific' ? (
              <RelationshipCheckin preselectedRelationship={selectedRelationship} />
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Universal Check-in (Legacy)</CardTitle>
                  <CardDescription>
                    Traditional check-in system with universal connection and mood scores
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="mb-4">Legacy check-in system temporarily disabled.</p>
                    <p className="text-sm">Please use the new relationship-specific check-ins above.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Relationships Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Your Relationships
                </CardTitle>
              </CardHeader>
              <CardContent>
                {relationships.length === 0 ? (
                  <div className="text-center py-6 text-muted-foreground">
                    <p className="mb-4">No relationships yet</p>
                    <Link href="/relationships">
                      <Button variant="outline" size="sm">
                        Add Relationship
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {relationships.map((relationship) => (
                      <div
                        key={relationship.id}
                        className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${
                          selectedRelationship === relationship.id ? 'bg-brand-teal/10 border-brand-teal' : 'border-border'
                        }`}
                        onClick={() => setSelectedRelationship(relationship.id)}
                      >
                        <div className="flex items-center gap-3">
                          {getRelationshipIcon(relationship.relationship_type)}
                          <div>
                            <p className="font-medium text-sm">{relationship.name}</p>
                            <p className="text-xs text-muted-foreground capitalize">
                              {relationship.relationship_type}
                            </p>
                          </div>
                        </div>
                        {selectedRelationship === relationship.id && (
                          <CheckCircle className="w-4 h-4 text-brand-teal" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Check-ins */}
            {recentCheckins.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentCheckins.slice(0, 5).map((checkin) => (
                      <div key={checkin.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {checkin.relationships && getRelationshipIcon(checkin.relationships.relationship_type)}
                          <div>
                            <p className="text-sm font-medium">
                              {checkin.relationships?.name || 'Relationship'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(checkin.created_at)}
                            </p>
                          </div>
                        </div>
                        {checkin.health_score && (
                          <Badge variant="outline" className={`text-xs ${getHealthScoreColor(checkin.health_score)}`}>
                            {checkin.health_score}%
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t">
                    <Link href="/dashboard">
                      <Button variant="outline" size="sm" className="w-full">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        View Full Analytics
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href="/journal">
                  <Button variant="outline" className="w-full justify-start">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Write in Journal
                  </Button>
                </Link>
                <Link href="/relationships">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    Manage Relationships
                  </Button>
                </Link>
                <Link href="/insights">
                  <Button variant="outline" className="w-full justify-start">
                    <Star className="w-4 h-4 mr-2" />
                    View Insights
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}