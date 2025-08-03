// src/components/onboarding/question-components/RankingQuestion.tsx - BRAND COLOR FIXES

'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { GripVertical, ArrowUp, ArrowDown } from 'lucide-react'

interface Option {
  value: string
  label: string
  description?: string
}

interface Question {
  id: string
  type: string
  question: string
  options?: Option[]
  required?: boolean
}

interface RankingQuestionProps {
  question: Question
  value: string | string[] | number | Record<string, string | number> | undefined
  onChange: (value: string[]) => void
  error?: string
}

export const RankingQuestion: React.FC<RankingQuestionProps> = ({ 
  question, 
  value, 
  onChange, 
  error 
}) => {
  const [rankings, setRankings] = useState<string[]>([])
  const options = question.options || []

  useEffect(() => {
    if (Array.isArray(value) && value.length > 0) {
      setRankings(value)
    } else {
      // Initialize with unranked options
      setRankings(options.map(opt => opt.value))
    }
  }, [value, options])

  const moveItem = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= rankings.length) return
    
    const newRankings = [...rankings]
    const [movedItem] = newRankings.splice(fromIndex, 1)
    newRankings.splice(toIndex, 0, movedItem)
    
    setRankings(newRankings)
    onChange(newRankings)
  }

  const getRankPosition = (optionValue: string) => {
    return rankings.indexOf(optionValue) + 1
  }

  const getOptionByValue = (value: string) => {
    return options.find(opt => opt.value === value)
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-600 mb-4">
        Drag items or use the arrow buttons to rank from most important (1) to least important ({options.length})
      </div>
      
      <div className="space-y-3">
        {rankings.map((optionValue, index) => {
          const option = getOptionByValue(optionValue)
          if (!option) return null
          
          const rank = getRankPosition(optionValue)
          const isFirst = index === 0
          const isLast = index === rankings.length - 1
          
          return (
            <Card 
              key={optionValue} 
              className={`p-4 transition-all duration-200 hover:shadow-md ${
                rank <= 2 ? 'border-brand-teal/30 bg-brand-teal/5' : 
                rank <= 4 ? 'border-brand-coral-pink/30 bg-brand-coral-pink/5' : 
                'border-brand-cool-gray bg-brand-warm-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                  <div className="flex flex-col space-y-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveItem(index, index - 1)}
                      disabled={isFirst}
                      className="h-6 w-6 p-0"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveItem(index, index + 1)}
                      disabled={isLast}
                      className="h-6 w-6 p-0"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  <GripVertical className="w-5 h-5 text-gray-400" />
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h4 className="font-medium">{option.label}</h4>
                    </div>
                    {option.description && (
                      <p className="text-sm text-gray-600">{option.description}</p>
                    )}
                  </div>
                </div>
                
                <Badge 
                  variant={rank <= 2 ? "default" : rank <= 4 ? "secondary" : "outline"}
                  className={`text-lg font-bold min-w-[2rem] justify-center ${
                    rank <= 2 ? 'bg-brand-teal text-white' : 
                    rank <= 4 ? 'bg-brand-coral-pink text-white' : 
                    'bg-brand-warm-white text-brand-cool-gray border'
                  }`}
                >
                  {rank}
                </Badge>
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
      
      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-md">
        <strong>Tip:</strong> Your top 2 choices will have the biggest impact on your personalized insights.
      </div>
    </div>
  )
}