// components/checkin/RelationshipCheckin.tsx
// Phase 7.2: Relationship-specific check-in forms
// Adaptive check-in experience based on relationship type

'use client'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/types/database'
import { RelationshipType } from '@/lib/ai/relationship-type-intelligence'
import { 
  getRelationshipMetrics, 
  getRelationshipCheckInQuestions,
  CheckInQuestion,
  BaseMetric 
} from '@/lib/metrics/relationship-metrics'

type Relationship = Database['public']['Tables']['relationships']['Row'] & {
  relationship_type: RelationshipType
}

interface RelationshipCheckinProps {
  preselectedRelationship?: string
}

export function RelationshipCheckin({ preselectedRelationship }: RelationshipCheckinProps) {
  const [relationships, setRelationships] = useState<Relationship[]>([])
  const [selectedRelationship, setSelectedRelationship] = useState<string | undefined>(preselectedRelationship)
  const [relationshipType, setRelationshipType] = useState<RelationshipType>('other')
  const [metricValues, setMetricValues] = useState<Record<string, number>>({})
  const [textResponses, setTextResponses] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    fetchRelationships()
  }, [])

  useEffect(() => {
    if (selectedRelationship) {
      const relationship = relationships.find(r => r.id === selectedRelationship)
      if (relationship) {
        setRelationshipType(relationship.relationship_type as RelationshipType)
        // Reset form values when relationship type changes
        setMetricValues({})
        setTextResponses({})
      }
    }
  }, [selectedRelationship, relationships])

  const fetchRelationships = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: members, error: membersError } = await supabase
      .from('relationship_members')
      .select('relationship_id')
      .eq('user_id', user.id)

    if (membersError) {
      toast.error('Failed to fetch relationships')
      return
    }

    const relationshipIds = members?.map(m => m.relationship_id) || []

    if (relationshipIds.length > 0) {
      const { data, error } = await supabase
        .from('relationships')
        .select('*')
        .in('id', relationshipIds)

      if (error) {
        toast.error('Failed to load relationship details')
      } else {
        const typedRelationships = (data || []) as Relationship[]
        setRelationships(typedRelationships)
        
        if (!preselectedRelationship && typedRelationships.length > 0) {
          setSelectedRelationship(typedRelationships[0].id)
        }
      }
    }
  }

  const handleSliderChange = (metric: string, value: number[]) => {
    setMetricValues(prev => ({
      ...prev,
      [metric]: value[0]
    }))
  }

  const handleTextChange = (metric: string, value: string) => {
    setTextResponses(prev => ({
      ...prev,
      [metric]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast.error('You must be logged in to submit a check-in.')
      setLoading(false)
      return
    }

    if (!selectedRelationship) {
      toast.error('Please select a relationship for this check-in.')
      setLoading(false)
      return
    }

    // Validate required metrics
    const questions = getRelationshipCheckInQuestions(relationshipType)
    const requiredSliders = questions.filter(q => q.required && q.type === 'slider')
    
    for (const question of requiredSliders) {
      if (metricValues[question.metric] === undefined) {
        toast.error(`Please provide a rating for ${question.question}`)
        setLoading(false)
        return
      }
    }

    try {
      // Save relationship-specific check-in data
      const checkInData = {
        user_id: user.id,
        relationship_id: selectedRelationship,
        relationship_type: relationshipType,
        metric_values: metricValues,
        text_responses: textResponses,
        created_at: new Date().toISOString()
      }

      // Save to new relationship-specific table
      const { error: saveError } = await supabase
        .from('relationship_checkins')
        .insert([checkInData])

      if (saveError) {
        throw saveError
      }

      // Also maintain compatibility with old system for now
      const primaryMetrics = getRelationshipMetrics(relationshipType).primaryMetrics
      const primaryMetric = primaryMetrics[0]
      
      const legacyData = {
        user_id: user.id,
        relationship_id: selectedRelationship,
        connection_score: metricValues[primaryMetric.name] || 5,
        mood_score: metricValues[primaryMetrics[1]?.name] || 5,
        gratitude_note: Object.values(textResponses).find(text => text.includes('grateful') || text.includes('appreciate')) || '',
        challenge_note: Object.values(textResponses).find(text => text.includes('challenge') || text.includes('working')) || '',
      }

      await supabase.from('daily_checkins').insert([legacyData])

      toast.success(`${getRelationshipMetrics(relationshipType).displayName} check-in saved successfully!`)
      
      // Reset form
      setMetricValues({})
      setTextResponses({})

      // Trigger relationship-specific score calculation
      await fetch('/api/scores/calculate-relationship', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          relationshipId: selectedRelationship,
          relationshipType: relationshipType,
          userId: user.id
        })
      })

    } catch (error: any) {
      console.error('Check-in submission error:', error)
      toast.error(error.message || 'Failed to save check-in')
    }

    setLoading(false)
  }

  if (relationships.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-center text-muted-foreground">
            No relationships found. Create a relationship first to start tracking your connection.
          </p>
        </CardContent>
      </Card>
    )
  }

  const relationshipConfig = getRelationshipMetrics(relationshipType)
  const questions = getRelationshipCheckInQuestions(relationshipType)
  const selectedRelationshipData = relationships.find(r => r.id === selectedRelationship)

  return (
    <div className="space-y-6">
      {/* Relationship Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Relationship Check-in</CardTitle>
          <CardDescription>
            Select a relationship and share how things are going
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="relationship">Select Relationship</Label>
              <Select
                value={selectedRelationship}
                onValueChange={setSelectedRelationship}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a relationship..." />
                </SelectTrigger>
                <SelectContent>
                  {relationships.map((relationship) => (
                    <SelectItem key={relationship.id} value={relationship.id}>
                      {relationship.name} ({relationship.relationship_type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Relationship-Specific Check-in Form */}
      {selectedRelationship && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getRelationshipTypeIcon(relationshipType)}
              {relationshipConfig.displayName} Check-in
            </CardTitle>
            <CardDescription>
              {selectedRelationshipData?.name} - {relationshipConfig.displayName}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {questions.map((question) => (
                <div key={question.id} className="space-y-3">
                  <Label className="text-base font-medium">
                    {question.question}
                    {question.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  
                  {question.type === 'slider' && (
                    <div className="space-y-3">
                      <Slider
                        value={[metricValues[question.metric] || 5]}
                        onValueChange={(value) => handleSliderChange(question.metric, value)}
                        max={10}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>1</span>
                        <span className="font-medium">
                          {metricValues[question.metric] || 5}/10
                        </span>
                        <span>10</span>
                      </div>
                    </div>
                  )}
                  
                  {question.type === 'text' && (
                    <Textarea
                      value={textResponses[question.metric] || ''}
                      onChange={(e) => handleTextChange(question.metric, e.target.value)}
                      placeholder="Share your thoughts..."
                      rows={3}
                    />
                  )}
                  
                  {question.type === 'select' && question.options && (
                    <Select
                      value={textResponses[question.metric] || ''}
                      onValueChange={(value) => handleTextChange(question.metric, value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option..." />
                      </SelectTrigger>
                      <SelectContent>
                        {question.options.map((option) => (
                          <SelectItem key={option} value={option}>
                            {option}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              ))}

              <Button 
                type="submit" 
                className="w-full" 
                disabled={loading}
                size="lg"
              >
                {loading ? 'Saving...' : `Save ${relationshipConfig.displayName} Check-in`}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Metrics Preview */}
      {selectedRelationship && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {relationshipConfig.displayName} Metrics
            </CardTitle>
            <CardDescription>
              Key areas we track for this relationship type
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {relationshipConfig.primaryMetrics.map((metric) => (
                <div
                  key={metric.name}
                  className="p-4 rounded-lg border bg-muted/30"
                >
                  <div className="font-medium text-sm mb-1">
                    {metric.displayName}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {metric.description}
                  </div>
                  {metricValues[metric.name] && (
                    <div className="text-lg font-bold mt-2" style={{ color: metric.color }}>
                      {metricValues[metric.name]}/10
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function getRelationshipTypeIcon(type: RelationshipType) {
  switch (type) {
    case 'romantic':
      return '💕'
    case 'work':
      return '💼'
    case 'family':
      return '🏠'
    case 'friend':
      return '👫'
    case 'other':
      return '❤️'
    default:
      return '❤️'
  }
}