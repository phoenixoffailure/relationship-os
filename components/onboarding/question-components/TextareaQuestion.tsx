// src/components/onboarding/question-components/TextareaQuestion.tsx

'use client'

import React from 'react'
import { Textarea } from '@/components/ui/textarea'

interface QuestionData {
  id: string
  type: string
  question: string
  placeholder?: string
  minLength?: number
  required?: boolean
}

interface TextareaQuestionProps {
  question: QuestionData
  value: string | undefined
  onChange: (value: string) => void
  error?: string
}

export const TextareaQuestion: React.FC<TextareaQuestionProps> = ({ 
  question, 
  value = '', 
  onChange, 
  error 
}) => {
  return (
    <div className="space-y-2">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={question.placeholder}
        rows={4}
        className="resize-none"
      />
      <div className="flex justify-between text-xs text-gray-500">
        <span>{value.length} characters</span>
        {question.minLength && (
          <span className={value.length >= question.minLength ? 'text-green-600' : 'text-red-600'}>
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