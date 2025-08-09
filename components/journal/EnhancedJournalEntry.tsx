// components/journal/EnhancedJournalEntry.tsx
// Journal entry component with automatic AI analysis trigger

'use client'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { createBrowserClient } from '@supabase/ssr'
import { trackEvent, trackConversion } from '@/lib/analytics/events'

type Relationship = {
  id: string
  name: string
  relationship_type: string
}

export function EnhancedJournalEntry() {
  const [content, setContent] = useState('')
  const [moodScore, setMoodScore] = useState(5)
  const [selectedRelationship, setSelectedRelationship] = useState<string | undefined>(undefined)
  const [relationships, setRelationships] = useState<Relationship[]>([])
  const [loading, setLoading] = useState(false)
  const [aiAnalysisStatus, setAiAnalysisStatus] = useState<'idle' | 'analyzing' | 'complete'>('idle')
  const [savedEntryId, setSavedEntryId] = useState<string | null>(null)
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const fetchRelationships = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: members, error: membersError } = await supabase
        .from('relationship_members')
        .select('relationship_id')
        .eq('user_id', user.id)

      if (membersError) {
        console.error('Error loading relationships:', membersError)
        return
      }

      const relationshipIds = members?.map(m => m.relationship_id) || []

      if (relationshipIds.length > 0) {
        const { data, error } = await supabase
          .from('relationships')
          .select('*')
          .in('id', relationshipIds)

        if (error) {
          console.error('Error loading relationships:', error)
        } else {
          setRelationships(data || [])
        }
      }
    }
    fetchRelationships()
  }, [supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        toast.error('You must be logged in to submit a journal entry.')
        setLoading(false)
        return
      }

      // Use our new save-and-analyze endpoint
      const response = await fetch('/api/journal/save-and-analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content,
          mood_score: moodScore,
          user_id: user.id,
          relationship_id: selectedRelationship || null
        })
      })

      const result = await response.json()

      if (result.success) {
        toast.success(result.message || 'Journal entry saved!')
        setSavedEntryId(result.journalEntry.id)
        setContent('')
        setMoodScore(5)
        setSelectedRelationship(undefined)
        
        // Only start monitoring if insights were triggered
        if (result.personalInsightsTriggered) {
          setAiAnalysisStatus('analyzing')
          monitorAIAnalysis(result.journalEntry.id)
        } else if (result.insightDenialReason === 'no_checkin') {
          toast.info('Complete a check-in for this relationship to unlock insights!', {
            action: {
              label: 'Check-in',
              onClick: () => window.location.href = '/checkin'
            }
          })
        } else if (result.insightDenialReason === 'free_tier_limit') {
          // Track paywall interaction for insight cap
          trackEvent('paywall_click_insight_cap', {
            user_id: user.id,
            source_component: 'journal_insights'
          })
          
          toast.info('Upgrade to premium for unlimited insights!', {
            action: {
              label: 'Upgrade',
              onClick: () => {
                trackConversion('insight_cap', user.id, 'free')
                window.location.href = '/premium/pricing'
              }
            }
          })
        }
      } else {
        toast.error(result.error || 'Failed to save journal entry')
      }
    } catch (error) {
      console.error('Error saving journal entry:', error)
      toast.error('Failed to save journal entry. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const monitorAIAnalysis = async (journalEntryId: string) => {
    const maxAttempts = 30 // 30 seconds max
    let attempts = 0

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/journal/save-and-analyze?journalEntryId=${journalEntryId}`)
        const result = await response.json()

        if (result.analysisComplete) {
          setAiAnalysisStatus('complete')
          toast.success('AI analysis complete! Check your insights for new guidance.', {
            action: {
              label: 'View Insights',
              onClick: () => window.location.href = '/insights'
            }
          })
          return
        }

        attempts++
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 1000) // Check every second
        } else {
          setAiAnalysisStatus('idle')
          toast.info('AI analysis is taking longer than usual. Check back in a few minutes.')
        }
      } catch (error) {
        console.error('Error checking analysis status:', error)
        setAiAnalysisStatus('idle')
      }
    }

    // Start checking after a brief delay
    setTimeout(checkStatus, 2000)
  }

  const getMoodLabel = (score: number) => {
    if (score <= 2) return 'Very Low'
    if (score <= 4) return 'Low'
    if (score <= 6) return 'Neutral'
    if (score <= 8) return 'Good'
    return 'Excellent'
  }

  const getMoodColor = (score: number) => {
    if (score <= 2) return 'text-red-600'
    if (score <= 4) return 'text-orange-600'
    if (score <= 6) return 'text-yellow-600'
    if (score <= 8) return 'text-green-600'
    return 'text-emerald-600'
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="grid gap-6">
        {relationships.length > 0 && (
          <div className="grid gap-2">
            <Label htmlFor="relationship-select">About which relationship? (Optional)</Label>
            <Select value={selectedRelationship} onValueChange={setSelectedRelationship}>
              <SelectTrigger id="relationship-select">
                <SelectValue placeholder="Select a relationship or leave blank for personal entry" />
              </SelectTrigger>
              <SelectContent>
                {relationships.map((rel) => (
                  <SelectItem key={rel.id} value={rel.id}>
                    {rel.name} ({rel.relationship_type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">
              Select a relationship to get personalized insights. Requires daily check-in to unlock insights.
            </p>
          </div>
        )}
        
        <div className="grid gap-2">
          <Label htmlFor="journal-content">What's on your mind today?</Label>
          <Textarea
            id="journal-content"
            placeholder="Write about your day, feelings, or anything you want to reflect on..."
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            className="min-h-32 resize-y"
          />
          <p className="text-sm text-gray-500">
            Your thoughts are private and secure. Our AI will analyze your entry to provide personal insights and relationship guidance.
          </p>
        </div>

        <div className="grid gap-3">
          <Label htmlFor="mood-score">
            Mood Score: <span className={`font-semibold ${getMoodColor(moodScore)}`}>
              {moodScore} - {getMoodLabel(moodScore)}
            </span>
          </Label>
          <Slider
            id="mood-score"
            min={1}
            max={10}
            step={1}
            value={[moodScore]}
            onValueChange={(val) => setMoodScore(val[0])}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>1 - Very Low</span>
            <span>5 - Neutral</span>
            <span>10 - Excellent</span>
          </div>
        </div>

        <div className="flex space-x-4">
          <Button 
            type="submit" 
            className="bg-calm-600 hover:bg-calm-700 flex-1" 
            disabled={loading || !content.trim()}
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </div>
            ) : (
              'Save Journal Entry'
            )}
          </Button>
        </div>
      </form>

      {/* AI Analysis Status */}
      {aiAnalysisStatus !== 'idle' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            {aiAnalysisStatus === 'analyzing' && (
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            )}
            {aiAnalysisStatus === 'complete' && (
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <div>
              <h4 className="font-medium text-gray-900">
                {aiAnalysisStatus === 'analyzing' && 'AI Analysis in Progress'}
                {aiAnalysisStatus === 'complete' && 'AI Analysis Complete'}
              </h4>
              <p className="text-sm text-gray-600">
                {aiAnalysisStatus === 'analyzing' && 
                  'Our AI is analyzing your entry to generate personal insights and relationship suggestions...'}
                {aiAnalysisStatus === 'complete' && 
                  'Your personal insights and any partner suggestions have been generated!'}
              </p>
            </div>
          </div>
          
          {aiAnalysisStatus === 'complete' && (
            <div className="mt-3 flex space-x-2">
              <Button 
                size="sm" 
                onClick={() => window.location.href = '/insights'}
                className="bg-blue-600 hover:bg-blue-700"
              >
                View Insights
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setAiAnalysisStatus('idle')}
                className="border-blue-300 text-blue-700"
              >
                Dismiss
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Privacy Notice */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 text-gray-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <div>
            <h4 className="font-medium text-gray-900 mb-1">Your Privacy is Protected</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• <strong>Personal insights</strong> are generated privately for your growth and remain confidential to you</p>
              <p>• <strong>Partner suggestions</strong> are anonymized - your partner receives helpful guidance without seeing your private thoughts</p>
              <p>• All journal entries are encrypted and secured with industry-standard protection</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h4 className="font-medium text-gray-900 mb-3">Quick Actions</h4>
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.href = '/insights'}
            className="border-calm-300 text-calm-700"
          >
            View My Insights
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.href = '/checkin'}
            className="border-mint-300 text-mint-700"
          >
            Daily Check-In
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.href = '/dashboard'}
            className="border-gray-300 text-gray-700"
          >
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}