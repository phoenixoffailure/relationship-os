{
  ;`'use client'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

export function JournalEntry() {
  const [content, setContent] = useState('')
  const [moodScore, setMoodScore] = useState(5)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      toast.error('You must be logged in to submit a journal entry.')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('journal_entries').insert({
      user_id: user.id,
      content,
      mood_score: moodScore,
    })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Journal entry saved successfully!')
      setContent('')
      setMoodScore(5)
      // Trigger AI analysis (placeholder)
      await fetch('/api/insights/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, entryContent: content }),
      })
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <div className="grid gap-2">
        <Label htmlFor="journal-content">What's on your mind today?</Label>
        <Textarea
          id="journal-content"
          placeholder="Write about your day, feelings, or anything you want to reflect on..."
          rows={8}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="mood-score">Mood Score (1-10): {moodScore}</Label>
        <Slider
          id="mood-score"
          min={1}
          max={10}
          step={1}
          value={[moodScore]}
          onValueChange={(val) => setMoodScore(val[0])}
          className="w-[60%]"
        />
        <p className="text-sm text-muted-foreground">1 = Very Low, 10 = Very High</p>
      </div>
      <Button type="submit" className="bg-calm-500 hover:bg-calm-600" disabled={loading}>
        {loading ? 'Saving...' : 'Save Journal Entry'}
      </Button>
    </form>
  )
}
`
}
