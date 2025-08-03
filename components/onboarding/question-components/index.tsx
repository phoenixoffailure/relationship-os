// components/onboarding/question-components/index.tsx - BRAND COLOR FIXES
// Fixed all TypeScript errors and updated to brand colors

'use client'

import React from 'react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

// Comprehensive type definitions
interface Option {
  value: string
  label: string
  description?: string
}

interface SliderConfig {
  key: string
  label: string
  min: number
  max: number
}

interface TextareaConfig {
  key: string
  label: string
  placeholder?: string
}

interface ChoiceConfig {
  key: string
  label: string
  options: Option[]
}

interface Question {
  id: string
  type: string
  question: string
  options?: Option[]
  sliders?: SliderConfig[]
  textareas?: TextareaConfig[]
  choices?: ChoiceConfig[]
  placeholder?: string
  minLength?: number
  maxSelections?: number
  required?: boolean
  min?: number
  max?: number
  minLabel?: string
  maxLabel?: string
  label?: string
}

// Base question props interface
interface BaseQuestionProps {
  question: Question
  value: string | string[] | number | Record<string, string | number> | undefined
  onChange: (value: string | string[] | number | Record<string, string | number>) => void
  error?: string
}

// =============================================================================
// TEXTAREA GROUP QUESTION
// =============================================================================

export const TextareaGroupQuestion: React.FC<BaseQuestionProps> = ({ 
  question, 
  value = {}, 
  onChange, 
  error 
}) => {
  const textareas = question.textareas || []
  const textareaValue = typeof value === 'object' && !Array.isArray(value) && value !== null 
    ? value as Record<string, string> 
    : {}

  const handleTextareaChange = (key: string, newValue: string) => {
    onChange({ 
      ...textareaValue, 
      [key]: newValue 
    })
  }

  return (
    <div className="space-y-4">
      {textareas.map((textarea) => (
        <div key={textarea.key} className="space-y-2">
          <Label className="font-medium">{textarea.label}</Label>
          <Textarea
            value={textareaValue[textarea.key] || ''}
            onChange={(e) => handleTextareaChange(textarea.key, e.target.value)}
            placeholder={textarea.placeholder || ''}
            rows={3}
            className="resize-none"
          />
          <div className="text-xs text-gray-500">
            {(textareaValue[textarea.key] || '').length} characters
          </div>
        </div>
      ))}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-2 rounded-md">
          {error}
        </p>
      )}
    </div>
  )
}

// =============================================================================
// SINGLE CHOICE QUESTION
// =============================================================================

export const SingleChoiceQuestion: React.FC<BaseQuestionProps> = ({ 
  question, 
  value = '', 
  onChange, 
  error 
}) => {
  const options = question.options || []
  const stringValue = typeof value === 'string' ? value : ''

  return (
    <div className="space-y-3">
      <RadioGroup value={stringValue} onValueChange={(newValue) => onChange(newValue)}>
        {options.map((option) => (
          <div key={option.value} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
            <RadioGroupItem value={option.value} id={option.value} className="mt-1" />
            <div className="flex-1">
              <Label htmlFor={option.value} className="font-medium cursor-pointer">
                {option.label}
              </Label>
              {option.description && (
                <p className="text-sm text-gray-600 mt-1">{option.description}</p>
              )}
            </div>
          </div>
        ))}
      </RadioGroup>
      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-2 rounded-md">
          {error}
        </p>
      )}
    </div>
  )
}

// =============================================================================
// MULTIPLE CHOICE QUESTION
// =============================================================================

export const MultipleChoiceQuestion: React.FC<BaseQuestionProps> = ({ 
  question, 
  value = [], 
  onChange, 
  error 
}) => {
  const options = question.options || []
  const arrayValue = Array.isArray(value) ? value : []

  const handleToggle = (optionValue: string) => {
    const newValue = arrayValue.includes(optionValue)
      ? arrayValue.filter((v: string) => v !== optionValue)
      : [...arrayValue, optionValue]
    
    // Respect maxSelections if set
    if (question.maxSelections && newValue.length > question.maxSelections) {
      return
    }
    
    onChange(newValue)
  }

  return (
    <div className="space-y-3">
      {question.maxSelections && (
        <div className="flex items-center justify-between text-sm text-gray-600 bg-gray-50 p-2 rounded">
          <span>Select up to {question.maxSelections} options</span>
          <Badge variant="outline">
            {arrayValue.length} / {question.maxSelections}
          </Badge>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {options.map((option) => {
          const isSelected = arrayValue.includes(option.value)
          const isDisabled = question.maxSelections && 
                             arrayValue.length >= question.maxSelections && 
                             !isSelected
          
          return (
            <Card 
              key={option.value} 
              className={`p-3 cursor-pointer transition-all ${
                isSelected ? 'border-brand-teal bg-brand-teal/5' : 
                isDisabled ? 'opacity-50 cursor-not-allowed' : 
                'hover:border-gray-400 bg-white'
              }`}
              onClick={() => !isDisabled && handleToggle(option.value)}
            >
              <div className="flex items-start space-x-3">
                <Checkbox
                  id={option.value}
                  checked={isSelected}
                  disabled={isDisabled ? true : false}
                  onCheckedChange={(checked) => {
                    if (!isDisabled && typeof checked === 'boolean') {
                      handleToggle(option.value)
                    }
                  }}
                />
                <Label 
                  htmlFor={option.value} 
                  className="flex-1 cursor-pointer font-medium"
                >
                  {option.label}
                </Label>
              </div>
            </Card>
          )
        })}
      </div>
      
      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-2 rounded-md">
          {error}
        </p>
      )}
    </div>
  )
}

// =============================================================================
// SINGLE CHOICE GROUP QUESTION
// =============================================================================

export const SingleChoiceGroupQuestion: React.FC<BaseQuestionProps> = ({ 
  question, 
  value = {}, 
  onChange, 
  error 
}) => {
  const choices = question.choices || []
  const objectValue = typeof value === 'object' && !Array.isArray(value) && value !== null 
    ? value as Record<string, string> 
    : {}

  const handleChoiceChange = (key: string, choice: string) => {
    onChange({ 
      ...objectValue, 
      [key]: choice 
    })
  }

  return (
    <div className="space-y-6">
      {choices.map((choice) => (
        <div key={choice.key} className="space-y-3 p-4 border rounded-lg bg-white">
          <Label className="font-medium text-base">{choice.label}</Label>
          <RadioGroup
            value={objectValue[choice.key] || ''}
            onValueChange={(newValue) => handleChoiceChange(choice.key, newValue)}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {choice.options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem 
                    value={option.value} 
                    id={`${choice.key}_${option.value}`} 
                  />
                  <Label 
                    htmlFor={`${choice.key}_${option.value}`} 
                    className="text-sm cursor-pointer"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        </div>
      ))}
      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-2 rounded-md">
          {error}
        </p>
      )}
    </div>
  )
}

// =============================================================================
// SLIDER QUESTION (Single)
// =============================================================================

export const SliderQuestion: React.FC<BaseQuestionProps> = ({ 
  question, 
  value = 5, 
  onChange, 
  error 
}) => {
  const numericValue = typeof value === 'number' ? value : 5
  const min = question.min || 1
  const max = question.max || 10

  const getValueDescription = (sliderValue: number) => {
    const percentage = ((sliderValue - min) / (max - min)) * 100
    if (percentage >= 90) return 'Extremely High'
    if (percentage >= 70) return 'High'
    if (percentage >= 50) return 'Moderate'
    if (percentage >= 30) return 'Low'
    return 'Very Low'
  }

  return (
    <div className="space-y-4">
      <div className="p-4 border rounded-lg bg-white">
        <div className="flex justify-between items-center mb-4">
          <Label className="font-medium text-base">{question.label || question.question}</Label>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="text-lg bg-brand-teal text-white">
              {numericValue}
            </Badge>
            <span className="text-sm text-gray-600">
              {getValueDescription(numericValue)}
            </span>
          </div>
        </div>
        
        <Slider
          value={[numericValue]}
          onValueChange={(newValue) => onChange(newValue[0])}
          min={min}
          max={max}
          step={1}
          className="w-full"
        />
        
        <div className="flex justify-between text-sm text-gray-500 mt-2">
          <span>{question.minLabel || min}</span>
          <span>{question.maxLabel || max}</span>
        </div>
      </div>
      
      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-2 rounded-md">
          {error}
        </p>
      )}
    </div>
  )
}

// =============================================================================
// TEXTAREA QUESTION (Single)
// =============================================================================

export const TextareaQuestion: React.FC<BaseQuestionProps> = ({ 
  question, 
  value = '', 
  onChange, 
  error 
}) => {
  const stringValue = typeof value === 'string' ? value : ''

  return (
    <div className="space-y-2">
      <Textarea
        value={stringValue}
        onChange={(e) => onChange(e.target.value)}
        placeholder={question.placeholder || ''}
        rows={4}
        className="resize-none"
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>{stringValue.length} characters</span>
        {question.minLength && (
          <span className={stringValue.length >= question.minLength ? 'text-green-600' : 'text-red-600'}>
            Minimum: {question.minLength} characters
          </span>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-2 rounded-md">
          {error}
        </p>
      )}
    </div>
  )
}

// =============================================================================
// SLIDER GROUP QUESTION
// =============================================================================

export const SliderGroupQuestion: React.FC<BaseQuestionProps> = ({ 
  question, 
  value = {}, 
  onChange, 
  error 
}) => {
  const sliders = question.sliders || []
  const objectValue = typeof value === 'object' && !Array.isArray(value) && value !== null
    ? value as Record<string, number>
    : {}

  const handleSliderChange = (key: string, newValue: number) => {
    onChange({ 
      ...objectValue, 
      [key]: newValue 
    })
  }

  const getValueDescription = (sliderValue: number, min: number, max: number) => {
    const percentage = ((sliderValue - min) / (max - min)) * 100
    if (percentage >= 90) return 'Extremely High'
    if (percentage >= 70) return 'High'
    if (percentage >= 50) return 'Moderate'
    if (percentage >= 30) return 'Low'
    return 'Very Low'
  }

  return (
    <div className="space-y-6">
      {sliders.map((slider) => {
        const sliderValue = objectValue[slider.key] || Math.floor((slider.min + slider.max) / 2)
        
        return (
          <div key={slider.key} className="space-y-3 p-4 border rounded-lg bg-white">
            <div className="flex justify-between items-center">
              <Label className="font-medium">{slider.label}</Label>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="bg-brand-teal text-white">
                  {sliderValue}
                </Badge>
                <span className="text-sm text-gray-600">
                  {getValueDescription(sliderValue, slider.min, slider.max)}
                </span>
              </div>
            </div>
            
            <Slider
              value={[sliderValue]}
              onValueChange={(newValue) => handleSliderChange(slider.key, newValue[0])}
              min={slider.min}
              max={slider.max}
              step={1}
              className="w-full"
            />
            
            <div className="flex justify-between text-sm text-gray-500">
              <span>{slider.min}</span>
              <span>{slider.max}</span>
            </div>
          </div>
        )
      })}
      
      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-2 rounded-md">
          {error}
        </p>
      )}
    </div>
  )
}

// =============================================================================
// RANKING QUESTION 
// =============================================================================

export const RankingQuestion: React.FC<BaseQuestionProps> = ({ 
  question, 
  value = [], 
  onChange, 
  error 
}) => {
  const options = question.options || []
  const arrayValue = Array.isArray(value) ? value as string[] : []

  // Simple ranking implementation - can be enhanced with drag & drop later
  const handleRankingChange = (optionValue: string, rank: number) => {
    const newRanking = [...arrayValue]
    
    // Remove the option if it already exists
    const filteredRanking = newRanking.filter(item => item !== optionValue)
    
    // Insert at the correct position based on rank
    if (rank > 0 && rank <= options.length) {
      filteredRanking.splice(rank - 1, 0, optionValue)
    }
    
    onChange(filteredRanking)
  }

  const getRankForOption = (optionValue: string): number => {
    const index = arrayValue.indexOf(optionValue)
    return index >= 0 ? index + 1 : 0
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        Rank these options in order of importance (1 = most important)
      </div>
      
      {options.map((option, index) => {
        const currentRank = getRankForOption(option.value)
        
        return (
          <div key={option.value} className="flex items-center space-x-4 p-3 border rounded-lg bg-white">
            <div className="flex items-center space-x-2">
              <Label className="text-sm font-medium">Rank:</Label>
              <select 
                value={currentRank || ''}
                onChange={(e) => handleRankingChange(option.value, parseInt(e.target.value))}
                className="border rounded px-2 py-1"
              >
                <option value="">-</option>
                {options.map((_, idx) => (
                  <option key={idx + 1} value={idx + 1}>{idx + 1}</option>
                ))}
              </select>
            </div>
            <Label className="flex-1">{option.label}</Label>
          </div>
        )
      })}
      
      {error && (
        <p className="text-sm text-red-600 bg-red-50 p-2 rounded-md">
          {error}
        </p>
      )}
    </div>
  )
}