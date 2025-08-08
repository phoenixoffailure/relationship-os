// app/(protected)/workflows/page.tsx
// Phase 7.4: Specialized workflows page for relationship-specific tools
// Main entry point for users to access relationship-appropriate workflows

'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { WorkflowManager } from '@/components/workflows/WorkflowManager'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useRelationshipContext } from '@/lib/contexts/RelationshipContext'
import { RelationshipIconComponent } from '@/lib/ui/relationship-aware-icons'
import { 
  Zap, 
  Target, 
  Heart, 
  Briefcase, 
  Home, 
  Users, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  BarChart3
} from 'lucide-react'

interface User {
  id: string
  email: string
}

export default function WorkflowsPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const { 
    relationships, 
    relationshipTypes, 
    hasMultipleTypes, 
    activeRelationshipType 
  } = useRelationshipContext()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
      }
      setLoading(false)
    }
    getUser()
  }, [])

  const getRelationshipTypeDescription = (type: string) => {
    switch (type) {
      case 'romantic':
        return 'Build deeper intimacy, resolve conflicts constructively, and strengthen your romantic bond through proven relationship practices.'
      case 'work':
        return 'Improve professional collaboration, set healthy boundaries, and enhance workplace relationships with structured approaches.'
      case 'family':
        return 'Foster family harmony, navigate generational differences, and strengthen family bonds through respectful communication.'
      case 'friend':
        return 'Maintain meaningful friendships, navigate social dynamics, and create lasting connections through intentional practices.'
      default:
        return 'General relationship improvement tools and practices for building stronger connections.'
    }
  }

  const getWorkflowStats = (type: string) => {
    // Mock stats - in real app, these would come from the workflow system
    const stats = {
      romantic: { workflows: 8, avgTime: '15-45 min', difficulty: 'Beginner-Advanced' },
      work: { workflows: 6, avgTime: '10-30 min', difficulty: 'Intermediate' },
      family: { workflows: 7, avgTime: '20-60 min', difficulty: 'Intermediate-Advanced' },
      friend: { workflows: 5, avgTime: '15-30 min', difficulty: 'Beginner-Intermediate' },
      other: { workflows: 3, avgTime: '15-30 min', difficulty: 'Beginner' }
    }
    return stats[type as keyof typeof stats] || stats.other
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-warm-white to-brand-cool-gray flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-brand-light-gray border-t-brand-teal rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-brand-slate font-inter">Loading workflows...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-warm-white to-brand-cool-gray flex items-center justify-center">
        <Alert>
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            Please log in to access relationship workflows.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (relationships.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-warm-white to-brand-cool-gray">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-brand-teal/10 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Target className="w-8 h-8 text-brand-teal" />
            </div>
            <h1 className="text-2xl font-bold text-brand-charcoal mb-4">
              Relationship Workflows
            </h1>
            <p className="text-brand-slate mb-6 max-w-md mx-auto">
              Get started with structured tools and practices to improve your relationships. 
              First, you'll need to add some relationships to your account.
            </p>
            <a href="/relationships" className="inline-flex items-center px-6 py-3 bg-brand-teal text-white rounded-lg hover:bg-brand-dark-teal transition-colors">
              Add Your First Relationship
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-warm-white to-brand-cool-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-teal to-brand-dark-teal rounded-xl flex items-center justify-center shadow-lg">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-brand-charcoal font-heading">
                Relationship Workflows
              </h1>
              <p className="text-brand-slate font-inter">
                Phase 7.4: Specialized tools and practices for each relationship type
              </p>
            </div>
          </div>

          {hasMultipleTypes && (
            <Alert className="border-brand-teal/30 bg-brand-teal/5">
              <TrendingUp className="w-4 h-4 text-brand-teal" />
              <AlertDescription>
                <strong>Multi-Relationship User:</strong> You have {relationshipTypes.length} different relationship types. 
                Workflows will automatically adapt based on your selected relationship context.
              </AlertDescription>
            </Alert>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Workflow Manager */}
          <div className="lg:col-span-2">
            <WorkflowManager userId={user.id} />
          </div>

          {/* Sidebar - Relationship Type Overview */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Your Relationship Types</span>
                </CardTitle>
                <CardDescription>
                  Available workflow categories based on your relationships
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {relationshipTypes.map(type => {
                  const stats = getWorkflowStats(type)
                  const isActive = type === activeRelationshipType
                  
                  return (
                    <div 
                      key={type}
                      className={`p-4 rounded-lg border transition-all ${
                        isActive ? 'border-brand-teal bg-brand-teal/5' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <RelationshipIconComponent
                            relationshipType={type as any}
                            iconType="primary"
                            size="sm"
                            showEmoji={true}
                            showLucide={false}
                          />
                          <span className="font-semibold capitalize">{type}</span>
                        </div>
                        {isActive && (
                          <Badge className="bg-brand-teal text-white text-xs">
                            Active
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
                        {getRelationshipTypeDescription(type)}
                      </p>

                      <div className="space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Workflows:</span>
                          <span className="font-medium">{stats.workflows}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Time:</span>
                          <span className="font-medium">{stats.avgTime}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Difficulty:</span>
                          <span className="font-medium">{stats.difficulty}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5" />
                  <span>Workflow Overview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-brand-teal" />
                      <span className="text-sm">Total Workflows</span>
                    </div>
                    <Badge variant="outline">
                      {relationshipTypes.reduce((sum, type) => sum + getWorkflowStats(type).workflows, 0)}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Relationship Types</span>
                    </div>
                    <Badge variant="outline">
                      {relationshipTypes.length}
                    </Badge>
                  </div>

                  <div className="pt-4 border-t">
                    <p className="text-xs text-muted-foreground">
                      💡 <strong>Phase 7.4 Feature:</strong> Each relationship type has specialized 
                      workflows designed for its unique dynamics and appropriate boundaries.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Workflow Benefits */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Why Use Workflows?</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Structured approach to relationship improvement</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Context-appropriate tools for each relationship type</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Step-by-step guidance with clear outcomes</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>Research-backed relationship practices</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}