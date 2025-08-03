{
  ;`'use client'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/types/database'
import { useEffect } from 'react'

type Relationship = Database['public']['Tables']['relationships']['Row']

export function CheckinForm() {
  const [connectionScore, setConnectionScore] = useState(5)
  const [moodScore, setMoodScore] = useState(5)
  const [gratitudeNote, setGratitudeNote] = useState('')
  const [challengeNote, setChallengeNote] = useState('')
  const [selectedRelationship, setSelectedRelationship] = useState<string | undefined>(undefined)
  const [relationships, setRelationships] = useState<Relationship[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchRelationships = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: members, error: membersError } = await supabase
        .from('relationship_members')
        .select('relationship_id')
        .eq('user_id', user.id)

      if (membersError) {
        toast.error(membersError.message)
        return
      }

      const relationshipIds = members?.map(m => m.relationship_id) || []

      if (relationshipIds.length > 0) {
        const { data, error } = await supabase
          .from('relationships')
          .select('*')
          .in('id', relationshipIds)

        if (error) {
          toast.error(error.message)
        } else {
          setRelationships(data || [])
          if (data && data.length > 0) {
            setSelectedRelationship(data[0].id) // Select first relationship by default
          }
        }
      }
    }
    fetchRelationships()
  }, [supabase])

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

    const { error } = await supabase.from('daily_checkins').insert({
      user_id: user.id,
      relationship_id: selectedRelationship,
      connection_score: connectionScore,
      mood_score: moodScore,
      gratitude_note: gratitudeNote,
      challenge_note: challengeNote,
    })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Daily check-in saved successfully!')
      setConnectionScore(5)
      setMoodScore(5)
      setGratitudeNote('')
      setChallengeNote('')
      // Trigger score calculation (placeholder)
      await fetch('/api/scores/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ relationshipId: selectedRelationship }),
      })
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <div className="grid gap-2">
        <Label htmlFor="relationship-select">Select Relationship</Label>
        <Select value={selectedRelationship} onValueChange={setSelectedRelationship}>
          <SelectTrigger id="relationship-select">
            <SelectValue placeholder="Select a relationship" />
          </SelectTrigger>
          <SelectContent>
            {relationships.map((rel) => (
              <SelectItem key={rel.id} value={rel.id}>
                {rel.name} ({rel.relationship_type})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="connection-score">Connection Score (1-10): {connectionScore}</Label>
        <Slider
          id="connection-score"
          min={1}
          max={10}
          step={1}
          value={[connectionScore]}
          onValueChange={(val) => setConnectionScore(val[0])}
          className="w-[60%]"
        />
        <p className="text-sm text-muted-foreground">How connected do you feel to this relationship today?</p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="mood-score">Your Mood Score (1-10): {moodScore}</Label>
        <Slider
          id="mood-score"
          min={1}
          max={10}
          step={1}
          value={[moodScore]}
          onValueChange={(val) => setMoodScore(val[0])}
          className="w-[60%]"
        />
        <p className="text-sm text-muted-foreground">How would you rate your overall mood today?</p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="gratitude-note">What are you grateful for in this relationship today? (Optional)</Label>
        <Textarea
          id="gratitude-note"
          placeholder="e.g., 'I'm grateful for their support with my project.'"
          rows={3}
          value={gratitudeNote}
          onChange={(e) => setGratitudeNote(e.target.value)}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="challenge-note">Any challenges or areas for growth? (Optional)</Label>
        <Textarea
          id="challenge-note"
          placeholder="e.g., 'We had a small disagreement, but we're working through it.'"
          rows={3}
          value={challengeNote}
          onChange={(e) => setChallengeNote(e.target.value)}
        />
      </div>

      <Button type="submit" className="bg-brand-teal hover:bg-calm-600" disabled={loading}>
        {loading ? 'Submitting...' : 'Submit Daily Check-in'}
      </Button>
    </form>
  )
}
`
}
