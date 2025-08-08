// components/workflows/WorkflowExecution.tsx
// Phase 7.4: Workflow execution interface for completing actions step-by-step
// Guides users through workflow actions with appropriate UI for each relationship type

'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Slider } from '@/components/ui/slider'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  WorkflowSession, 
  WorkflowProgress, 
  ActionResult,
  completeWorkflowAction,
  pauseWorkflow,
  getWorkflowProgress
} from '@/lib/workflows/workflow-engine'
import { getWorkflowById } from '@/lib/workflows/relationship-specific-workflows'
import { useRelationshipContext } from '@/lib/contexts/RelationshipContext'
import { RelationshipIconComponent } from '@/lib/ui/relationship-aware-icons'
import { 
  Play, 
  Pause, 
  CheckCircle, 
  Clock, 
  Star,
  AlertCircle,
  ArrowRight,
  Trophy
} from 'lucide-react'

interface WorkflowExecutionProps {
  session: WorkflowSession
  onSessionUpdate?: (session: WorkflowSession) => void
  className?: string
}

export function WorkflowExecution({ 
  session, 
  onSessionUpdate, 
  className = '' 
}: WorkflowExecutionProps) {
  const [notes, setNotes] = useState('')
  const [satisfaction, setSatisfaction] = useState([3])
  const [challenges, setChallenges] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { activeRelationship } = useRelationshipContext()
  const workflow = getWorkflowById(session.workflowId)
  const progress = getWorkflowProgress(session.id)

  if (!workflow) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="w-4 h-4" />
        <AlertDescription>
          Workflow not found. Please contact support.
        </AlertDescription>
      </Alert>
    )
  }

  const currentAction = progress.currentAction
  const nextAction = progress.nextAction

  const handleCompleteAction = async (completed: boolean = true) => {
    if (!currentAction) return

    setLoading(true)
    setError(null)

    try {
      const actionResult: ActionResult = {
        actionId: currentAction.id,
        completed,
        notes: notes.trim() || undefined,
        satisfaction: satisfaction[0],
        challenges: challenges.trim() ? [challenges] : undefined,
        outcomes: completed ? currentAction.outcomes : undefined
      }

      const updatedSession = completeWorkflowAction(session.id, actionResult)
      onSessionUpdate?.(updatedSession)

      // Reset form
      setNotes('')
      setSatisfaction([3])
      setChallenges('')

      console.log(`✅ Phase 7.4: Completed action "${currentAction.name}" in ${session.relationshipType} workflow`)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to complete action')
      console.error('Error completing workflow action:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePauseWorkflow = async () => {
    setLoading(true)
    try {
      const updatedSession = pauseWorkflow(session.id, notes || 'User paused workflow')
      onSessionUpdate?.(updatedSession)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to pause workflow')
    } finally {
      setLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700 border-green-200'
      case 'intermediate': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'advanced': return 'bg-red-100 text-red-700 border-red-200'
    }
  }

  // Completed workflow display
  if (session.status === 'completed') {
    return (
      <Card className={`border-green-200 bg-green-50 ${className}`}>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Trophy className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <CardTitle className="text-green-800">Workflow Completed! 🎉</CardTitle>
              <CardDescription className="text-green-600">
                {workflow.name} for {activeRelationship?.name || 'your relationship'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-green-800 mb-2">Expected Outcomes:</h4>
              <ul className="space-y-1">
                {workflow.expectedOutcomes.map((outcome, index) => (
                  <li key={index} className="flex items-center space-x-2 text-green-700">
                    <CheckCircle className="w-4 h-4" />
                    <span className="text-sm">{outcome}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="pt-4 border-t border-green-200">
              <p className="text-sm text-green-600">
                Great job! Consider reflecting on this experience in your journal or check-in.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Workflow Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <RelationshipIconComponent
                relationshipType={session.relationshipType}
                iconType="primary"
                size="md"
                showEmoji={true}
                showLucide={false}
              />
              <div>
                <CardTitle>{workflow.name}</CardTitle>
                <CardDescription>
                  {activeRelationship?.name || 'Active relationship'} • {session.relationshipType} relationship
                </CardDescription>
              </div>
            </div>
            <Badge className={session.status === 'in_progress' ? 'bg-brand-teal text-white' : ''}>
              {session.status === 'in_progress' ? 'Active' : session.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progress</span>
                <span>{progress.progressPercentage}%</span>
              </div>
              <Progress value={progress.progressPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground mt-1">
                {progress.completedActions} of {progress.totalActions} actions completed
                {progress.estimatedTimeRemaining && ` • ${progress.estimatedTimeRemaining} remaining`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Current Action */}
      {currentAction && (
        <Card className="border-brand-teal/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <span className="text-2xl">{currentAction.icon}</span>
                <span>{currentAction.name}</span>
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Badge className={getDifficultyColor(currentAction.difficulty)}>
                  {currentAction.difficulty}
                </Badge>
                <Badge variant="outline" className="flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{currentAction.estimatedTime}</span>
                </Badge>
              </div>
            </div>
            <CardDescription>{currentAction.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Prerequisites */}
              {currentAction.prerequisites && currentAction.prerequisites.length > 0 && (
                <Alert>
                  <AlertCircle className="w-4 h-4" />
                  <AlertDescription>
                    <strong>Prerequisites:</strong> {currentAction.prerequisites.join(', ')}
                  </AlertDescription>
                </Alert>
              )}

              {/* Expected Outcomes */}
              <div>
                <h4 className="font-medium mb-2">Expected Outcomes:</h4>
                <ul className="space-y-1">
                  {currentAction.outcomes.map((outcome, index) => (
                    <li key={index} className="flex items-center space-x-2 text-sm">
                      <Star className="w-3 h-3 text-yellow-500" />
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Completion Form */}
              <div className="space-y-4 p-4 bg-muted rounded-lg">
                <h4 className="font-medium">Complete This Action</h4>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Notes (optional)
                  </label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Share any thoughts, insights, or observations from completing this action..."
                    rows={3}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Satisfaction Rating: {satisfaction[0]}/5
                  </label>
                  <Slider
                    value={satisfaction}
                    onValueChange={setSatisfaction}
                    max={5}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>Not satisfied</span>
                    <span>Very satisfied</span>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Challenges (optional)
                  </label>
                  <Textarea
                    value={challenges}
                    onChange={(e) => setChallenges(e.target.value)}
                    placeholder="Did you face any challenges or difficulties?"
                    rows={2}
                  />
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={() => handleCompleteAction(true)}
                    disabled={loading}
                    className="flex-1"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {loading ? 'Completing...' : 'Mark Complete'}
                  </Button>
                  <Button
                    onClick={handlePauseWorkflow}
                    disabled={loading}
                    variant="outline"
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Next Action Preview */}
      {nextAction && (
        <Card className="border-muted">
          <CardHeader>
            <CardTitle className="text-lg flex items-center space-x-2">
              <ArrowRight className="w-5 h-5 text-muted-foreground" />
              <span>Next: {nextAction.name}</span>
            </CardTitle>
            <CardDescription>{nextAction.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Clock className="w-4 h-4" />
                <span>{nextAction.estimatedTime}</span>
              </div>
              <Badge variant="outline" className={getDifficultyColor(nextAction.difficulty)}>
                {nextAction.difficulty}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}