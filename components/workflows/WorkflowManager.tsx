// components/workflows/WorkflowManager.tsx
// Phase 7.4: Main workflow management interface
// Allows users to browse, select, and manage relationship-specific workflows

'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useRelationshipContext } from '@/lib/contexts/RelationshipContext'
import { RelationshipType } from '@/lib/ai/relationship-type-intelligence'
import { 
  getWorkflowsForRelationshipType, 
  RelationshipWorkflow, 
  WorkflowAction,
  recommendWorkflows,
  getWorkflowsByCategory
} from '@/lib/workflows/relationship-specific-workflows'
import { 
  createWorkflowSession, 
  startWorkflow, 
  getActiveWorkflows,
  WorkflowSession,
  getWorkflowProgress,
  WorkflowProgress
} from '@/lib/workflows/workflow-engine'
import { 
  Play, 
  Clock, 
  Users, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  Pause,
  BarChart3,
  Calendar,
  Target
} from 'lucide-react'

interface WorkflowManagerProps {
  userId: string
  className?: string
}

export function WorkflowManager({ userId, className = '' }: WorkflowManagerProps) {
  const { 
    activeRelationshipId, 
    activeRelationshipType, 
    activeRelationship 
  } = useRelationshipContext()

  const [selectedWorkflow, setSelectedWorkflow] = useState<RelationshipWorkflow | null>(null)
  const [activeSessions, setActiveSessions] = useState<WorkflowSession[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Get workflows for current relationship type
  const relationshipType = activeRelationshipType || 'other'
  const availableWorkflows = getWorkflowsForRelationshipType(relationshipType)
  const recommendedWorkflows = recommendWorkflows(relationshipType, ['daily_checkin', 'improvement_needed'])

  useEffect(() => {
    loadActiveSessions()
  }, [userId])

  const loadActiveSessions = async () => {
    try {
      const sessions = getActiveWorkflows(userId)
      setActiveSessions(sessions)
    } catch (error) {
      console.error('Error loading active workflows:', error)
      setError('Failed to load active workflows')
    }
  }

  const handleStartWorkflow = async (workflow: RelationshipWorkflow) => {
    if (!activeRelationshipId || !activeRelationshipType) {
      setError('Please select a relationship to start a workflow')
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Create and start workflow session
      const session = createWorkflowSession(
        workflow.id,
        userId,
        activeRelationshipId,
        activeRelationshipType
      )
      
      startWorkflow(session.id)
      
      // Refresh active sessions
      await loadActiveSessions()
      
      console.log(`🚀 Phase 7.4: Started ${workflow.name} for ${activeRelationshipType} relationship`)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to start workflow')
      console.error('Error starting workflow:', error)
    } finally {
      setLoading(false)
    }
  }

  const getWorkflowCategoryIcon = (category: RelationshipWorkflow['category']) => {
    switch (category) {
      case 'daily': return <Calendar className="w-4 h-4" />
      case 'weekly': return <BarChart3 className="w-4 h-4" />
      case 'monthly': return <TrendingUp className="w-4 h-4" />
      case 'situational': return <Target className="w-4 h-4" />
      case 'crisis': return <AlertCircle className="w-4 h-4" />
      default: return <CheckCircle className="w-4 h-4" />
    }
  }

  const getPriorityColor = (priority: RelationshipWorkflow['priority']) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
    }
  }

  const getDifficultyColor = (difficulty: WorkflowAction['difficulty']) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700'
      case 'intermediate': return 'bg-yellow-100 text-yellow-700'
      case 'advanced': return 'bg-red-100 text-red-700'
    }
  }

  const ActiveSessionCard = ({ session }: { session: WorkflowSession }) => {
    const progress = getWorkflowProgress(session.id)
    
    return (
      <Card className="border-brand-teal/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Active Workflow</CardTitle>
            <Badge className="bg-brand-teal text-white">
              {session.status}
            </Badge>
          </div>
          <CardDescription>
            {activeRelationship?.name || 'Active Relationship'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progress</span>
                <span>{progress.progressPercentage}%</span>
              </div>
              <Progress value={progress.progressPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {progress.completedActions} of {progress.totalActions} actions complete
              </p>
            </div>

            {progress.currentAction && (
              <div className="p-3 bg-muted rounded-lg">
                <h4 className="font-medium text-sm mb-1">Current Action:</h4>
                <p className="text-sm">{progress.currentAction.name}</p>
                <p className="text-xs text-muted-foreground">
                  Est. {progress.currentAction.estimatedTime}
                </p>
              </div>
            )}

            <div className="flex space-x-2">
              <Button size="sm" className="flex-1">
                Continue
              </Button>
              <Button size="sm" variant="outline">
                <Pause className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const WorkflowCard = ({ workflow }: { workflow: RelationshipWorkflow }) => (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        selectedWorkflow?.id === workflow.id ? 'border-brand-teal bg-brand-teal/5' : ''
      }`}
      onClick={() => setSelectedWorkflow(selectedWorkflow?.id === workflow.id ? null : workflow)}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            {getWorkflowCategoryIcon(workflow.category)}
            <CardTitle className="text-base">{workflow.name}</CardTitle>
          </div>
          <Badge className={getPriorityColor(workflow.priority)}>
            {workflow.priority}
          </Badge>
        </div>
        <CardDescription>{workflow.description}</CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>{workflow.actions.length} actions</span>
            </div>
            <Badge variant="outline" className="capitalize">
              {workflow.category}
            </Badge>
          </div>

          {selectedWorkflow?.id === workflow.id && (
            <div className="border-t pt-3 space-y-3">
              <div>
                <h4 className="font-medium text-sm mb-2">Actions in this workflow:</h4>
                <div className="space-y-2">
                  {workflow.actions.map((action, index) => (
                    <div key={action.id} className="flex items-center space-x-2 text-sm">
                      <span className="flex-shrink-0 w-5 h-5 bg-muted rounded-full flex items-center justify-center text-xs">
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{action.name}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge size="sm" className={getDifficultyColor(action.difficulty)}>
                            {action.difficulty}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {action.estimatedTime}
                          </span>
                        </div>
                      </div>
                      <span className="text-lg">{action.icon}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-2">Expected Outcomes:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {workflow.expectedOutcomes.map((outcome, index) => (
                    <li key={index} className="flex items-center space-x-2">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Button 
                onClick={(e) => {
                  e.stopPropagation()
                  handleStartWorkflow(workflow)
                }}
                disabled={loading}
                className="w-full"
              >
                <Play className="w-4 h-4 mr-2" />
                {loading ? 'Starting...' : 'Start Workflow'}
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  if (!activeRelationshipType) {
    return (
      <div className={className}>
        <Alert>
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>
            Please select a relationship to view available workflows.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-brand-charcoal mb-2">
          Relationship Workflows
        </h2>
        <p className="text-brand-slate">
          Structured tools and practices for your {activeRelationshipType} relationship
          {activeRelationship ? ` with ${activeRelationship.name}` : ''}
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Active Workflows</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {activeSessions.map(session => (
              <ActiveSessionCard key={session.id} session={session} />
            ))}
          </div>
        </div>
      )}

      {/* Workflow Browser */}
      <Tabs defaultValue="recommended" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="recommended">Recommended</TabsTrigger>
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="situational">Situational</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value="recommended" className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-3">Recommended for You</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Based on your {activeRelationshipType} relationship patterns
            </p>
            {recommendedWorkflows.length === 0 ? (
              <p className="text-muted-foreground">No recommendations available yet.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {recommendedWorkflows.map(workflow => (
                  <WorkflowCard key={workflow.id} workflow={workflow} />
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="daily" className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-3">Daily Practices</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {getWorkflowsByCategory(relationshipType, 'daily').map(workflow => (
                <WorkflowCard key={workflow.id} workflow={workflow} />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="situational" className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-3">Situational Tools</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {getWorkflowsByCategory(relationshipType, 'situational').map(workflow => (
                <WorkflowCard key={workflow.id} workflow={workflow} />
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-3">All Available Workflows</h3>
            <div className="grid gap-4 md:grid-cols-2">
              {availableWorkflows.map(workflow => (
                <WorkflowCard key={workflow.id} workflow={workflow} />
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}