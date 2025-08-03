// src/components/onboarding/question-components/SliderGroupQuestion.tsx - BRAND COLOR FIXES

'use client'

import React from 'react'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'

interface SliderConfig {
  key: string
  label: string
  min: number
  max: number
}

interface Question {
  id: string
  type: string
  question: string
  sliders?: SliderConfig[]
  required?: boolean
}

interface SliderGroupQuestionProps {
  question: Question
  value: string | string[] | number | Record<string, string | number> | undefined
  onChange: (value: Record<string, number>) => void
  error?: string
}

export const SliderGroupQuestion: React.FC<SliderGroupQuestionProps> = ({ 
  question, 
  value, 
  onChange, 
  error 
}) => {
  // Ensure we have sliders array
  const sliders = question.sliders || []
  
  // Convert value to proper format with type safety
  const currentValues = typeof value === 'object' && !Array.isArray(value) && value !== null
    ? value as Record<string, number>
    : {}

  const handleSliderChange = (key: string, newValue: number[]) => {
    onChange({ 
      ...currentValues, 
      [key]: newValue[0] 
    })
  }

  const getSliderColor = (sliderValue: number, min: number, max: number) => {
    const percentage = ((sliderValue - min) / (max - min)) * 100
    if (percentage >= 80) return 'bg-brand-teal text-white'
    if (percentage >= 60) return 'bg-brand-coral-pink text-white'
    if (percentage >= 40) return 'bg-brand-slate text-white'
    return 'bg-gray-400 text-white'
  }

  const getValueLabel = (sliderValue: number, min: number, max: number) => {
    const percentage = ((sliderValue - min) / (max - min)) * 100
    if (percentage >= 90) return 'Extremely Important'
    if (percentage >= 80) return 'Very Important'
    if (percentage >= 60) return 'Important'
    if (percentage >= 40) return 'Somewhat Important'
    if (percentage >= 20) return 'Slightly Important'
    return 'Not Important'
  }

  return (
    <div className="space-y-6">
      {sliders.map((sliderConfig: SliderConfig) => {
        const currentValue = currentValues[sliderConfig.key] || sliderConfig.min
        const colorClass = getSliderColor(currentValue, sliderConfig.min, sliderConfig.max)
        const valueLabel = getValueLabel(currentValue, sliderConfig.min, sliderConfig.max)
        
        return (
          <div key={sliderConfig.key} className="space-y-3 p-4 border rounded-lg bg-brand-warm-white">
            <div className="flex justify-between items-center">
              <Label className="font-medium text-base">{sliderConfig.label}</Label>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className={colorClass}>
                  {currentValue}
                </Badge>
                <span className="text-sm text-gray-600">{valueLabel}</span>
              </div>
            </div>
            
            <Slider
              value={[currentValue]}
              onValueChange={(newValue) => handleSliderChange(sliderConfig.key, newValue)}
              min={sliderConfig.min}
              max={sliderConfig.max}
              step={1}
              className="w-full"
            />
            
            <div className="flex justify-between text-xs text-gray-500">
              <span>{sliderConfig.min} - Not Important</span>
              <span>{Math.round((sliderConfig.min + sliderConfig.max) / 2)} - Moderate</span>
              <span>{sliderConfig.max} - Extremely Important</span>
            </div>
          </div>
        )
      })}
      
      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-2 rounded-md">
          {error}
        </p>
      )}
      
      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md">
        <strong>Tip:</strong> Rate each item based on how important it is to you personally. 
        There are no right or wrong answers.
      </div>
    </div>
  )
}