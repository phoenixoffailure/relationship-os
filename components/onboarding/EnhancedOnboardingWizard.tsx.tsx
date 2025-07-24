// components/onboarding/EnhancedOnboardingWizard.tsx - COMPLETE TYPE FIXES
// Fixed all TypeScript type compatibility issues

'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, ArrowLeft, ArrowRight } from 'lucide-react'

import { enhancedOnboardingQuestions, OnboardingResponse } from '@/lib/onboarding/enhanced-questions'
import { validateStep, getProgressPercentage } from '@/lib/onboarding/validation'

// Import question components
import { RankingQuestion } from './question-components/RankingQuestion'
import { SliderGroupQuestion } from './question-components/SliderGroupQuestion'
import { 
  TextareaGroupQuestion,
  SingleChoiceQuestion,
  MultipleChoiceQuestion,
  SingleChoiceGroupQuestion,
  SliderQuestion,
  TextareaQuestion
} from './question-components/index'

interface EnhancedOnboardingWizardProps {
  userId?: string
}

// Comprehensive option interface
interface Option {
  value: string
  label: string
  description?: string
}

// Slider configuration interface
interface SliderConfig {
  key: string
  label: string
  min: number
  max: number
}

// Textarea configuration interface
interface TextareaConfig {
  key: string
  label: string
  placeholder?: string
}

// Choice configuration interface
interface ChoiceConfig {
  key: string
  label: string
  options: Option[]
}

// Comprehensive question interface
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

// Question component props interface (simplified)
interface ComponentProps {
  question: Question
  value: string | string[] | number | Record<string, string | number> | undefined
  onChange: (value: string | string[] | number | Record<string, string | number>) => void
  error?: string
}

export const EnhancedOnboardingWizard: React.FC<EnhancedOnboardingWizardProps> = ({ userId }) => {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [responses, setResponses] = useState<Partial<OnboardingResponse>>({})
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const totalSteps = 5
  const progress = getProgressPercentage(currentStep, responses)

  // Enhanced response handling with proper typing
  const handleResponse = (questionId: string, value: string | string[] | number | Record<string, string | number>) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }))
    
    // Clear error for this question
    if (errors[questionId]) {
      setErrors(prev => ({ ...prev, [questionId]: '' }))
    }
  }

  const handleNext = () => {
    const validation = validateStep(currentStep, responses)
    
    if (validation.isValid) {
      setErrors({})
      setCurrentStep(prev => Math.min(prev + 1, totalSteps))
    } else {
      setErrors(validation.errors)
      // Scroll to first error
      const firstErrorElement = document.querySelector('[data-error="true"]')
      firstErrorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  const handleBack = () => {
    setErrors({})
    setCurrentStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    const validation = validateStep(currentStep, responses)
    
    if (!validation.isValid) {
      setErrors(validation.errors)
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/onboarding/enhanced-save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responses,
          completedAt: new Date().toISOString()
        })
      })

      if (response.ok) {
        // Show success message briefly
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Redirect to dashboard
        router.push('/dashboard?onboarding=complete')
        router.refresh()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save responses')
      }
    } catch (error) {
      console.error('Onboarding submission error:', error)
      setErrors({ submit: error instanceof Error ? error.message : 'Failed to save your responses. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const renderStepIndicator = () => {
    return (
      <div className="flex items-center justify-between mb-8">
        {Array.from({ length: totalSteps }, (_, i) => {
          const stepNumber = i + 1
          const isCompleted = stepNumber < currentStep
          const isCurrent = stepNumber === currentStep
          
          return (
            <div key={stepNumber} className="flex items-center">
              <div className={`
                flex items-center justify-center w-8 h-8 rounded-full border-2 text-sm font-medium
                ${isCompleted ? 'bg-green-500 border-green-500 text-white' : 
                  isCurrent ? 'bg-calm-500 border-calm-500 text-white' : 
                  'bg-gray-100 border-gray-300 text-gray-500'}
              `}>
                {isCompleted ? <CheckCircle className="w-4 h-4" /> : stepNumber}
              </div>
              {stepNumber < totalSteps && (
                <div className={`
                  w-16 h-0.5 mx-2
                  ${stepNumber < currentStep ? 'bg-green-500' : 'bg-gray-300'}
                `} />
              )}
            </div>
          )
        })}
      </div>
    )
  }

  const renderQuestion = (question: Question) => {
    // Create properly typed props with explicit type checking
    const commonProps = {
      question,
      value: responses[question.id as keyof OnboardingResponse],
      onChange: (value: string | string[] | number | Record<string, string | number>) => handleResponse(question.id, value),
      error: errors[question.id]
    }

    // Type-safe question rendering with comprehensive validation
    switch (question.type) {
      case 'ranking':
        if (!question.options || question.options.length === 0) {
          return <div className="text-red-500">Ranking question missing options</div>
        }
        return <RankingQuestion {...commonProps} />
        
      case 'slider_group':
        if (!question.sliders || question.sliders.length === 0) {
          return <div className="text-red-500">Slider group question missing sliders configuration</div>
        }
        return <SliderGroupQuestion {...commonProps} />
        
      case 'textarea_group':
        if (!question.textareas || question.textareas.length === 0) {
          return <div className="text-red-500">Textarea group question missing textareas configuration</div>
        }
        return <TextareaGroupQuestion {...commonProps} />
        
      case 'single_choice':
        if (!question.options || question.options.length === 0) {
          return <div className="text-red-500">Single choice question missing options</div>
        }
        return <SingleChoiceQuestion {...commonProps} />
        
      case 'multiple_choice':
        if (!question.options || question.options.length === 0) {
          return <div className="text-red-500">Multiple choice question missing options</div>
        }
        return <MultipleChoiceQuestion {...commonProps} />
        
      case 'single_choice_group':
        if (!question.choices || question.choices.length === 0) {
          return <div className="text-red-500">Single choice group question missing choices configuration</div>
        }
        return <SingleChoiceGroupQuestion {...commonProps} />
        
      case 'slider':
        return <SliderQuestion {...commonProps} />
        
      case 'textarea':
        return <TextareaQuestion {...commonProps} />
        
      default:
        return <div className="text-red-500">Unknown question type: {question.type}</div>
    }
  }

  const renderStep = () => {
    const stepKey = `step${currentStep}` as keyof typeof enhancedOnboardingQuestions
    const stepData = enhancedOnboardingQuestions[stepKey]
    
    if (!stepData) {
      return <div className="text-red-500">Step {currentStep} not found</div>
    }
    
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Badge variant="secondary" className="text-sm">
              Step {currentStep} of {totalSteps}
            </Badge>
          </div>
          <CardTitle className="text-2xl text-calm-600">{stepData.title}</CardTitle>
          <CardDescription className="text-lg">{stepData.subtitle}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {stepData.questions.map((question) => (
            <div 
              key={question.id} 
              className="space-y-4"
              data-error={!!errors[question.id]}
            >
              <div className="flex items-start justify-between">
                <Label className="text-lg font-medium flex-1">{question.question}</Label>
                {question.required && (
                  <Badge variant="outline" className="text-xs ml-2">Required</Badge>
                )}
              </div>
              
              {renderQuestion(question as Question)}
              
              {errors[question.id] && (
                <p className="text-sm text-red-600 bg-red-50 p-2 rounded-md">
                  {errors[question.id]}
                </p>
              )}
            </div>
          ))}
          
          {errors.submit && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-red-600">{errors.submit}</p>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-calm-50 to-mint-50 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Progress indicator */}
        <div className="text-center space-y-4">
          <Progress value={progress} className="w-full max-w-md mx-auto h-2" />
          <p className="text-sm text-gray-600">
            {Math.round(progress)}% Complete
          </p>
        </div>

        {/* Step indicator */}
        {renderStepIndicator()}

        {/* Step content */}
        {renderStep()}

        {/* Navigation */}
        <div className="flex justify-between max-w-4xl mx-auto pt-6">
          {currentStep > 1 ? (
            <Button 
              variant="outline" 
              onClick={handleBack} 
              disabled={loading}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
          ) : (
            <div />
          )}
          
          {currentStep < totalSteps ? (
            <Button 
              onClick={handleNext} 
              disabled={loading}
              className="bg-calm-500 hover:bg-calm-600 flex items-center space-x-2"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              disabled={loading}
              className="bg-mint-500 hover:bg-mint-600 flex items-center space-x-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Complete Onboarding</span>
                </>
              )}
            </Button>
          )}
        </div>

        {/* Additional info */}
        <div className="text-center text-sm text-gray-500 max-w-2xl mx-auto">
          Your responses are private and secure. We use this information to provide personalized relationship insights.
        </div>
      </div>
    </div>
  )
}

export default EnhancedOnboardingWizard