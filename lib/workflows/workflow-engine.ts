// lib/workflows/workflow-engine.ts
// Phase 7.4: Workflow execution engine for relationship-specific tools
// Manages workflow state, progress tracking, and completion

import { RelationshipType } from '@/lib/ai/relationship-type-intelligence'
import { RelationshipWorkflow, WorkflowAction, getWorkflowById, getWorkflowsForRelationshipType } from './relationship-specific-workflows'

export interface WorkflowSession {
  id: string
  workflowId: string
  userId: string
  relationshipId: string
  relationshipType: RelationshipType
  status: 'not_started' | 'in_progress' | 'completed' | 'paused' | 'abandoned'
  currentActionIndex: number
  completedActions: string[]
  sessionData: Record<string, any>
  startedAt: Date
  lastActivityAt: Date
  completedAt?: Date
  notes?: string
}

export interface ActionResult {
  actionId: string
  completed: boolean
  duration?: number
  notes?: string
  satisfaction?: number // 1-5 scale
  challenges?: string[]
  outcomes?: string[]
}

export interface WorkflowProgress {
  totalActions: number
  completedActions: number
  progressPercentage: number
  estimatedTimeRemaining: string
  currentAction?: WorkflowAction
  nextAction?: WorkflowAction
}

class WorkflowEngine {
  private sessions: Map<string, WorkflowSession> = new Map()

  // Create a new workflow session
  createSession(
    workflowId: string,
    userId: string,
    relationshipId: string,
    relationshipType: RelationshipType
  ): WorkflowSession {
    const workflow = getWorkflowById(workflowId)
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`)
    }

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2)}`
    
    const session: WorkflowSession = {
      id: sessionId,
      workflowId,
      userId,
      relationshipId,
      relationshipType,
      status: 'not_started',
      currentActionIndex: 0,
      completedActions: [],
      sessionData: {},
      startedAt: new Date(),
      lastActivityAt: new Date()
    }

    this.sessions.set(sessionId, session)
    console.log(`🔄 Phase 7.4: Created ${relationshipType} workflow session: ${workflow.name}`)
    
    return session
  }

  // Start a workflow session
  startSession(sessionId: string): WorkflowSession {
    const session = this.sessions.get(sessionId)
    if (!session) {
      throw new Error(`Session ${sessionId} not found`)
    }

    session.status = 'in_progress'
    session.lastActivityAt = new Date()
    
    const workflow = getWorkflowById(session.workflowId)
    console.log(`▶️ Phase 7.4: Started workflow "${workflow?.name}" for ${session.relationshipType} relationship`)
    
    return session
  }

  // Complete an action within a workflow
  completeAction(
    sessionId: string,
    actionResult: ActionResult
  ): WorkflowSession {
    const session = this.sessions.get(sessionId)
    if (!session) {
      throw new Error(`Session ${sessionId} not found`)
    }

    const workflow = getWorkflowById(session.workflowId)
    if (!workflow) {
      throw new Error(`Workflow ${session.workflowId} not found`)
    }

    // Validate the action belongs to current step
    const currentAction = workflow.actions[session.currentActionIndex]
    if (!currentAction || currentAction.id !== actionResult.actionId) {
      throw new Error(`Action ${actionResult.actionId} is not the current action`)
    }

    // Mark action as completed
    if (actionResult.completed) {
      session.completedActions.push(actionResult.actionId)
      session.sessionData[`action_${actionResult.actionId}`] = actionResult
      
      // Move to next action
      session.currentActionIndex++
      
      // Check if workflow is complete
      if (session.currentActionIndex >= workflow.actions.length) {
        session.status = 'completed'
        session.completedAt = new Date()
        console.log(`✅ Phase 7.4: Completed ${session.relationshipType} workflow: ${workflow.name}`)
      } else {
        console.log(`✓ Phase 7.4: Completed action "${currentAction.name}" in ${session.relationshipType} workflow`)
      }
    }

    session.lastActivityAt = new Date()
    return session
  }

  // Pause a workflow session
  pauseSession(sessionId: string, notes?: string): WorkflowSession {
    const session = this.sessions.get(sessionId)
    if (!session) {
      throw new Error(`Session ${sessionId} not found`)
    }

    session.status = 'paused'
    session.lastActivityAt = new Date()
    if (notes) {
      session.notes = notes
    }

    console.log(`⏸️ Phase 7.4: Paused ${session.relationshipType} workflow session`)
    return session
  }

  // Resume a paused workflow session
  resumeSession(sessionId: string): WorkflowSession {
    const session = this.sessions.get(sessionId)
    if (!session) {
      throw new Error(`Session ${sessionId} not found`)
    }

    if (session.status !== 'paused') {
      throw new Error(`Session ${sessionId} is not paused`)
    }

    session.status = 'in_progress'
    session.lastActivityAt = new Date()

    console.log(`▶️ Phase 7.4: Resumed ${session.relationshipType} workflow session`)
    return session
  }

  // Get workflow progress
  getProgress(sessionId: string): WorkflowProgress {
    const session = this.sessions.get(sessionId)
    if (!session) {
      throw new Error(`Session ${sessionId} not found`)
    }

    const workflow = getWorkflowById(session.workflowId)
    if (!workflow) {
      throw new Error(`Workflow ${session.workflowId} not found`)
    }

    const totalActions = workflow.actions.length
    const completedActions = session.completedActions.length
    const progressPercentage = Math.round((completedActions / totalActions) * 100)

    const currentAction = workflow.actions[session.currentActionIndex]
    const nextAction = workflow.actions[session.currentActionIndex + 1]

    // Calculate estimated time remaining
    const remainingActions = workflow.actions.slice(session.currentActionIndex)
    const estimatedMinutes = remainingActions.reduce((total, action) => {
      const timeMatch = action.estimatedTime.match(/(\d+)\s*minutes?/)
      return total + (timeMatch ? parseInt(timeMatch[1]) : 15) // Default 15 min if no time specified
    }, 0)

    const estimatedTimeRemaining = estimatedMinutes > 60 
      ? `${Math.round(estimatedMinutes / 60)}h ${estimatedMinutes % 60}m`
      : `${estimatedMinutes}m`

    return {
      totalActions,
      completedActions,
      progressPercentage,
      estimatedTimeRemaining,
      currentAction,
      nextAction
    }
  }

  // Get session by ID
  getSession(sessionId: string): WorkflowSession | undefined {
    return this.sessions.get(sessionId)
  }

  // Get all sessions for a user
  getUserSessions(userId: string): WorkflowSession[] {
    return Array.from(this.sessions.values()).filter(s => s.userId === userId)
  }

  // Get active sessions for a user
  getActiveSessions(userId: string): WorkflowSession[] {
    return this.getUserSessions(userId).filter(s => 
      s.status === 'in_progress' || s.status === 'paused'
    )
  }

  // Get sessions for a specific relationship
  getRelationshipSessions(userId: string, relationshipId: string): WorkflowSession[] {
    return this.getUserSessions(userId).filter(s => s.relationshipId === relationshipId)
  }

  // Get completed sessions for analytics
  getCompletedSessions(userId: string, relationshipType?: RelationshipType): WorkflowSession[] {
    let sessions = this.getUserSessions(userId).filter(s => s.status === 'completed')
    
    if (relationshipType) {
      sessions = sessions.filter(s => s.relationshipType === relationshipType)
    }
    
    return sessions
  }

  // Abandon a session
  abandonSession(sessionId: string, reason?: string): WorkflowSession {
    const session = this.sessions.get(sessionId)
    if (!session) {
      throw new Error(`Session ${sessionId} not found`)
    }

    session.status = 'abandoned'
    session.lastActivityAt = new Date()
    if (reason) {
      session.notes = `Abandoned: ${reason}`
    }

    console.log(`❌ Phase 7.4: Abandoned ${session.relationshipType} workflow session${reason ? ': ' + reason : ''}`)
    return session
  }

  // Get workflow analytics
  getWorkflowAnalytics(userId: string, relationshipType: RelationshipType) {
    const sessions = this.getUserSessions(userId).filter(s => s.relationshipType === relationshipType)
    const completedSessions = sessions.filter(s => s.status === 'completed')
    const activeSessions = sessions.filter(s => s.status === 'in_progress')
    const pausedSessions = sessions.filter(s => s.status === 'paused')

    const completionRate = sessions.length > 0 ? (completedSessions.length / sessions.length) * 100 : 0

    // Calculate average satisfaction from completed sessions
    const satisfactionRatings: number[] = []
    completedSessions.forEach(session => {
      Object.values(session.sessionData).forEach((actionResult: any) => {
        if (actionResult.satisfaction) {
          satisfactionRatings.push(actionResult.satisfaction)
        }
      })
    })

    const averageSatisfaction = satisfactionRatings.length > 0 
      ? satisfactionRatings.reduce((sum, rating) => sum + rating, 0) / satisfactionRatings.length
      : 0

    // Most used workflows
    const workflowUsage: Record<string, number> = {}
    sessions.forEach(session => {
      workflowUsage[session.workflowId] = (workflowUsage[session.workflowId] || 0) + 1
    })

    const mostUsedWorkflows = Object.entries(workflowUsage)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([workflowId, count]) => ({
        workflow: getWorkflowById(workflowId),
        usageCount: count
      }))

    return {
      totalSessions: sessions.length,
      completedSessions: completedSessions.length,
      activeSessions: activeSessions.length,
      pausedSessions: pausedSessions.length,
      completionRate: Math.round(completionRate),
      averageSatisfaction: Math.round(averageSatisfaction * 10) / 10,
      mostUsedWorkflows
    }
  }
}

// Export singleton instance
export const workflowEngine = new WorkflowEngine()

// Helper functions for easy workflow management

export function createWorkflowSession(
  workflowId: string,
  userId: string,
  relationshipId: string,
  relationshipType: RelationshipType
): WorkflowSession {
  return workflowEngine.createSession(workflowId, userId, relationshipId, relationshipType)
}

export function startWorkflow(sessionId: string): WorkflowSession {
  return workflowEngine.startSession(sessionId)
}

export function completeWorkflowAction(
  sessionId: string,
  actionResult: ActionResult
): WorkflowSession {
  return workflowEngine.completeAction(sessionId, actionResult)
}

export function getWorkflowProgress(sessionId: string): WorkflowProgress {
  return workflowEngine.getProgress(sessionId)
}

export function pauseWorkflow(sessionId: string, notes?: string): WorkflowSession {
  return workflowEngine.pauseSession(sessionId, notes)
}

export function resumeWorkflow(sessionId: string): WorkflowSession {
  return workflowEngine.resumeSession(sessionId)
}

export function getActiveWorkflows(userId: string): WorkflowSession[] {
  return workflowEngine.getActiveSessions(userId)
}

export function getRelationshipWorkflows(userId: string, relationshipId: string): WorkflowSession[] {
  return workflowEngine.getRelationshipSessions(userId, relationshipId)
}

export function getWorkflowAnalytics(userId: string, relationshipType: RelationshipType) {
  return workflowEngine.getWorkflowAnalytics(userId, relationshipType)
}

export default workflowEngine