// components/onboarding/relationship-details-step.tsx
// New onboarding step to capture actual relationship timeline

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CalendarIcon, HeartIcon, UsersIcon } from 'lucide-react'

interface RelationshipDetailsData {
  relationshipStartDate: string
  anniversaryDate: string
  durationYears: number
  durationMonths: number
}

interface RelationshipDetailsStepProps {
  onData: (data: RelationshipDetailsData) => void
  onNext: () => void
  onBack: () => void
  initialData?: Partial<RelationshipDetailsData>
}

export default function RelationshipDetailsStep({ 
  onData, 
  onNext, 
  onBack, 
  initialData 
}: RelationshipDetailsStepProps) {
  const [startDate, setStartDate] = useState(initialData?.relationshipStartDate || '')
  const [anniversaryDate, setAnniversaryDate] = useState(initialData?.anniversaryDate || '')
  const [years, setYears] = useState(initialData?.durationYears || 0)
  const [months, setMonths] = useState(initialData?.durationMonths || 0)
  const [calculatedFromDates, setCalculatedFromDates] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Auto-calculate duration when dates are provided
  useEffect(() => {
    if (startDate && anniversaryDate) {
      const start = new Date(startDate)
      const anniversary = new Date(anniversaryDate)
      
      if (anniversary >= start) {
        const diffTime = anniversary.getTime() - start.getTime()
        const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365.25))
        const remainingTime = diffTime - (diffYears * 1000 * 60 * 60 * 24 * 365.25)
        const diffMonths = Math.floor(remainingTime / (1000 * 60 * 60 * 24 * 30.44))
        
        setYears(diffYears)
        setMonths(Math.max(0, Math.min(11, diffMonths)))
        setCalculatedFromDates(true)
        
        // Clear any date-related errors
        setErrors(prev => ({
          ...prev,
          startDate: '',
          anniversaryDate: ''
        }))
      } else {
        setErrors(prev => ({
          ...prev,
          anniversaryDate: 'Anniversary date must be after start date'
        }))
      }
    }
  }, [startDate, anniversaryDate])

  // Calculate approximate anniversary from duration
  useEffect(() => {
    if ((years > 0 || months > 0) && !startDate && !calculatedFromDates) {
      const totalMonths = years * 12 + months
      const approximateStart = new Date()
      approximateStart.setMonth(approximateStart.getMonth() - totalMonths)
      
      // Don't auto-set dates from duration to avoid overriding user input
    }
  }, [years, months, startDate, calculatedFromDates])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    // Must have either dates OR duration
    const hasDates = startDate && anniversaryDate
    const hasDuration = years > 0 || months > 0

    if (!hasDates && !hasDuration) {
      newErrors.general = 'Please provide either your anniversary dates OR how long you\'ve been together'
    }

    // If dates are provided, validate them
    if (startDate && anniversaryDate) {
      const start = new Date(startDate)
      const anniversary = new Date(anniversaryDate)
      
      if (start > new Date()) {
        newErrors.startDate = 'Start date cannot be in the future'
      }
      
      if (anniversary > new Date()) {
        newErrors.anniversaryDate = 'Anniversary date cannot be in the future'
      }
      
      if (anniversary < start) {
        newErrors.anniversaryDate = 'Anniversary must be after start date'
      }
    }

    // Validate duration if provided
    if (years < 0 || years > 100) {
      newErrors.years = 'Years must be between 0 and 100'
    }
    
    if (months < 0 || months > 11) {
      newErrors.months = 'Months must be between 0 and 11'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (!validateForm()) return

    const data: RelationshipDetailsData = {
      relationshipStartDate: startDate,
      anniversaryDate: anniversaryDate,
      durationYears: years,
      durationMonths: months
    }

    onData(data)
    onNext()
  }

  const handleManualDurationChange = (field: 'years' | 'months', value: number) => {
    setCalculatedFromDates(false) // Allow manual override
    if (field === 'years') {
      setYears(Math.max(0, Math.min(100, value)))
    } else {
      setMonths(Math.max(0, Math.min(11, value)))
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="flex justify-center">
          <HeartIcon className="w-12 h-12 text-pink-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Your Relationship Timeline</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Help us understand your actual relationship history so we can provide better insights 
          tailored to your relationship stage.
        </p>
      </div>

      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 text-sm text-red-700">
          {errors.general}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Anniversary Dates Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Anniversary Dates
            </CardTitle>
            <CardDescription>
              If you know your specific dates (recommended for accuracy)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="start-date">When did your relationship begin?</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className={errors.startDate ? 'border-red-500' : ''}
              />
              {errors.startDate && (
                <p className="text-sm text-red-600 mt-1">{errors.startDate}</p>
              )}
            </div>

            <div>
              <Label htmlFor="anniversary-date">What's your anniversary date?</Label>
              <Input
                id="anniversary-date"
                type="date"
                value={anniversaryDate}
                onChange={(e) => setAnniversaryDate(e.target.value)}
                className={errors.anniversaryDate ? 'border-red-500' : ''}
              />
              <p className="text-xs text-gray-500 mt-1">
                This might be different from when you started dating (e.g., wedding date)
              </p>
              {errors.anniversaryDate && (
                <p className="text-sm text-red-600 mt-1">{errors.anniversaryDate}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Duration Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersIcon className="w-5 h-5" />
              Time Together
            </CardTitle>
            <CardDescription>
              How long have you been together? 
              {calculatedFromDates && " (calculated from your dates)"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="years">Years</Label>
              <Input
                id="years"
                type="number"
                min="0"
                max="100"
                value={years}
                onChange={(e) => handleManualDurationChange('years', parseInt(e.target.value) || 0)}
                className={errors.years ? 'border-red-500' : ''}
                disabled={calculatedFromDates}
              />
              {errors.years && (
                <p className="text-sm text-red-600 mt-1">{errors.years}</p>
              )}
            </div>

            <div>
              <Label htmlFor="months">Additional Months</Label>
              <Input
                id="months"
                type="number"
                min="0"
                max="11"
                value={months}
                onChange={(e) => handleManualDurationChange('months', parseInt(e.target.value) || 0)}
                className={errors.months ? 'border-red-500' : ''}
                disabled={calculatedFromDates}
              />
              <p className="text-xs text-gray-500 mt-1">
                0-11 additional months
              </p>
              {errors.months && (
                <p className="text-sm text-red-600 mt-1">{errors.months}</p>
              )}
            </div>

            {calculatedFromDates && (
              <p className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                Duration calculated from your anniversary dates. 
                <button 
                  type="button"
                  onClick={() => setCalculatedFromDates(false)}
                  className="underline ml-1"
                >
                  Edit manually
                </button>
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      {(years > 0 || months > 0) && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <h3 className="font-medium text-green-900 mb-2">Relationship Summary</h3>
          <p className="text-green-700">
            You've been together for <strong>{years} years{months > 0 && `, ${months} months`}</strong>
            {startDate && anniversaryDate && (
              <span> (from {new Date(startDate).toLocaleDateString()} to {new Date(anniversaryDate).toLocaleDateString()})</span>
            )}
          </p>
          <p className="text-sm text-green-600 mt-1">
            This will help us categorize your relationship stage and provide relevant insights.
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleSubmit} className="bg-brand-coral-pink hover:bg-brand-coral-pink/80 text-white">
      Continue
    </Button>
      </div>
    </div>
  )
}