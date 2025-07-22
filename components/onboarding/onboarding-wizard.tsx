{
  ;`'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export function OnboardingWizard() {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [responses, setResponses] = useState({
    relationshipGoals: '',
    communicationStyle: '',
    loveLanguage: '',
    cycleTrackingOptIn: false,
  })
  const supabase = createClient()
  const router = useRouter()

  const handleNext = () => {
    // Basic validation for current step before moving on
    if (step === 1 && !responses.relationshipGoals) {
      toast.error('Please describe your relationship goals.')
      return
    }
    if (step === 2 && !responses.communicationStyle) {
      toast.error('Please select your primary communication style.')
      return
    }
    if (step === 3 && !responses.loveLanguage) {
      toast.error('Please select your primary love language.')
      return
    }
    setStep(step + 1)
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const handleChange = (field: string, value: any) => {
    setResponses((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      toast.error('You must be logged in to complete onboarding.')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('onboarding_responses').insert({
      user_id: user.id,
      responses: responses,
    })

    if (error) {
      toast.error(error.message)
    } else {
      // Update user's onboarding_completed status
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({ onboarding_completed: true })
        .eq('id', user.id)

      if (userUpdateError) {
        toast.error(userUpdateError.message)
      } else {
        toast.success('Onboarding complete! Welcome to Relationship OS.')
        // Trigger AI processing of onboarding responses (placeholder)
        await fetch('/api/onboarding/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: user.id, responses: responses }),
        })
        router.push('/dashboard')
        router.refresh()
      }
    }
    setLoading(false)
  }

  const totalSteps = 4
  const progress = (step / totalSteps) * 100

  return (
    <div className="grid gap-6">
      <Progress value={progress} className="w-full" />
      <div className="text-center text-sm text-muted-foreground">Step {step} of {totalSteps}</div>

      {step === 1 && (
        <div className="grid gap-4">
          <h2 className="text-xl font-semibold text-calm-600">1. Your Relationship Goals</h2>
          <Label htmlFor="relationship-goals">What are your primary goals for your relationships?</Label>
          <Textarea
            id="relationship-goals"
            placeholder="e.g., 'Improve communication, deepen intimacy, resolve conflicts constructively.'"
            rows={5}
            value={responses.relationshipGoals}
            onChange={(e) => handleChange('relationshipGoals', e.target.value)}
            required
          />
        </div>
      )}

      {step === 2 && (
        <div className="grid gap-4">
          <h2 className="text-xl font-semibold text-calm-600">2. Communication Style</h2>
          <Label>How do you primarily express yourself in relationships?</Label>
          <RadioGroup
            value={responses.communicationStyle}
            onValueChange={(value) => handleChange('communicationStyle', value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="direct" id="direct" />
              <Label htmlFor="direct">Direct and Assertive</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="indirect" id="indirect" />
              <Label htmlFor="indirect">Indirect and Suggestive</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="passive" id="passive" />
              <Label htmlFor="passive">Passive and Accommodating</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="analytical" id="analytical" />
              <Label htmlFor="analytical">Analytical and Logical</Label>
            </div>
          </RadioGroup>
        </div>
      )}

      {step === 3 && (
        <div className="grid gap-4">
          <h2 className="text-xl font-semibold text-calm-600">3. Love Language</h2>
          <Label>Which of the 5 love languages resonates most with you?</Label>
          <RadioGroup
            value={responses.loveLanguage}
            onValueChange={(value) => handleChange('loveLanguage', value)}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="words_of_affirmation" id="words_of_affirmation" />
              <Label htmlFor="words_of_affirmation">Words of Affirmation</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="quality_time" id="quality_time" />
              <Label htmlFor="quality_time">Quality Time</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="receiving_gifts" id="receiving_gifts" />
              <Label htmlFor="receiving_gifts">Receiving Gifts</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="acts_of_service" id="acts_of_service" />
              <Label htmlFor="acts_of_service">Acts of Service</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="physical_touch" id="physical_touch" />
              <Label htmlFor="physical_touch">Physical Touch</Label>
            </div>
          </RadioGroup>
        </div>
      )}

      {step === 4 && (
        <div className="grid gap-4">
          <h2 className="text-xl font-semibold text-calm-600">4. Optional: Menstrual Cycle Tracking</h2>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="cycle-tracking-opt-in"
              checked={responses.cycleTrackingOptIn}
              onCheckedChange={(checked) => handleChange('cycleTrackingOptIn', checked)}
            />
            <Label htmlFor="cycle-tracking-opt-in">
              I want to opt-in for menstrual cycle tracking and insights.
            </Label>
          </div>
          <p className="text-sm text-muted-foreground">
            This allows Relationship OS to provide personalized insights and partner suggestions based on your cycle phases, while keeping your sensitive data private.
          </p>
        </div>
      )}

      <div className="flex justify-between mt-6">
        {step > 1 && (
          <Button variant="outline" onClick={handleBack}>
            Back
          </Button>
        )}
        {step < totalSteps ? (
          <Button onClick={handleNext} className="ml-auto bg-calm-500 hover:bg-calm-600">
            Next
          </Button>
        ) : (
          <Button onClick={handleSubmit} disabled={loading} className="ml-auto bg-mint-500 hover:bg-mint-600">
            {loading ? 'Finishing...' : 'Finish Onboarding'}
          </Button>
        )}
      </div>
    </div>
  )
}
`
}
