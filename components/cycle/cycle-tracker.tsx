{
  ;`'use client'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'

export function CycleTracker() {
  const [cycleStartDate, setCycleStartDate] = useState<Date | undefined>(new Date())
  const [cycleLength, setCycleLength] = useState(28)
  const [periodLength, setPeriodLength] = useState(5)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      toast.error('You must be logged in to track your cycle.')
      setLoading(false)
      return
    }

    if (!cycleStartDate) {
      toast.error('Please select a cycle start date.')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('menstrual_cycles').insert({
      user_id: user.id,
      cycle_start_date: cycleStartDate.toISOString().split('T')[0], // Format to YYYY-MM-DD
      cycle_length: cycleLength,
      period_length: periodLength,
      is_active: true, // Mark as active cycle
    })

    if (error) {
      toast.error(error.message)
    } else {
      toast.success('Cycle data saved successfully!')
      // Trigger cycle prediction (placeholder)
      await fetch('/api/cycle/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, cycleId: 'newly-created-cycle-id' }), // Replace with actual ID
      })
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <div className="grid gap-2">
        <Label htmlFor="cycle-start-date">Cycle Start Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={'outline'}
              className={cn(
                'w-full justify-start text-left font-normal',
                !cycleStartDate && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {cycleStartDate ? format(cycleStartDate, 'PPP') : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={cycleStartDate}
              onSelect={setCycleStartDate}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="cycle-length">Average Cycle Length (days)</Label>
        <Input
          id="cycle-length"
          type="number"
          min={21}
          max={45}
          value={cycleLength}
          onChange={(e) => setCycleLength(parseInt(e.target.value))}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="period-length">Average Period Length (days)</Label>
        <Input
          id="period-length"
          type="number"
          min={1}
          max={10}
          value={periodLength}
          onChange={(e) => setPeriodLength(parseInt(e.target.value))}
          required
        />
      </div>

      <Button type="submit" className="bg-brand-teal hover:bg-calm-600" disabled={loading}>
        {loading ? 'Saving...' : 'Save Cycle Data'}
      </Button>
    </form>
  )
}
`
}
