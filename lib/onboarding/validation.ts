// lib/onboarding/validation.ts - FIXED VERSION
// Fixed TypeScript errors and added proper type safety

export interface ValidationRule {
  required: boolean
  type: string
  minSelections?: number
  maxSelections?: number
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  count?: number
}

export const validationRules: Record<string, Record<string, ValidationRule>> = {
  step1: {
    love_language_ranking: { 
      required: true, 
      type: 'ranking', 
      count: 5 
    },
    love_language_intensity: { 
      required: true, 
      type: 'slider_group', 
      min: 1, 
      max: 10 
    },
    love_language_examples: { 
      required: true, 
      type: 'textarea_group', 
      minLength: 20 
    }
  },
  step2: {
    communication_approach: { 
      required: true, 
      type: 'single_choice' 
    },
    conflict_style: { 
      required: true, 
      type: 'single_choice' 
    },
    stress_response: { 
      required: true, 
      type: 'single_choice' 
    },
    expression_preferences: { 
      required: true, 
      type: 'slider_group', 
      min: 1, 
      max: 10 
    },
    communication_timing: { 
      required: true, 
      type: 'multiple_choice', 
      minSelections: 1 
    }
  },
  step3: {
    intimacy_priorities: { 
      required: true, 
      type: 'slider_group', 
      min: 1, 
      max: 10 
    },
    intimacy_enhancers: { 
      required: true, 
      type: 'multiple_choice', 
      minSelections: 3 
    },
    intimacy_barriers: { 
      required: true, 
      type: 'multiple_choice', 
      minSelections: 1 
    },
    connection_frequency: { 
      required: true, 
      type: 'single_choice_group' 
    }
  },
  step4: {
    primary_goals: { 
      required: true, 
      type: 'multiple_choice', 
      minSelections: 2, 
      maxSelections: 5 
    },
    goal_timeline: { 
      required: true, 
      type: 'single_choice' 
    },
    specific_challenges: { 
      required: true, 
      type: 'textarea', 
      minLength: 50 
    },
    relationship_values: { 
      required: true, 
      type: 'multiple_choice', 
      minSelections: 3 
    },
    success_metrics: { 
      required: true, 
      type: 'textarea', 
      minLength: 30 
    }
  },
  step5: {
    expression_directness: { 
      required: true, 
      type: 'single_choice' 
    },
    expression_frequency: { 
      required: true, 
      type: 'single_choice' 
    },
    preferred_methods: { 
      required: true, 
      type: 'multiple_choice', 
      minSelections: 2 
    },
    need_categories_ranking: { 
      required: true, 
      type: 'ranking', 
      count: 6 
    },
    partner_reading_ability: { 
      required: true, 
      type: 'slider', 
      min: 1, 
      max: 10 
    },
    successful_communication: { 
      required: true, 
      type: 'textarea', 
      minLength: 30 
    },
    communication_barriers: { 
      required: true, 
      type: 'multiple_choice', 
      minSelections: 1 
    }
  }
}

export function validateStep(step: number, responses: Record<string, any>): { isValid: boolean; errors: Record<string, string> } {
  const stepKey = `step${step}` as keyof typeof validationRules
  const rules = validationRules[stepKey]
  const errors: Record<string, string> = {}
  let isValid = true

  if (!rules) {
    return { isValid: false, errors: { general: 'Invalid step number' } }
  }

  Object.entries(rules).forEach(([questionId, rule]) => {
    const value = responses[questionId]
    
    // Required field validation
    if (rule.required && (!value || (Array.isArray(value) && value.length === 0))) {
      errors[questionId] = 'This field is required'
      isValid = false
      return
    }

    // Skip further validation if field is empty and not required
    if (!value) return

    // Multiple choice validation
    if (rule.type === 'multiple_choice' && Array.isArray(value)) {
      if (rule.minSelections && value.length < rule.minSelections) {
        errors[questionId] = `Please select at least ${rule.minSelections} options`
        isValid = false
      }
      if (rule.maxSelections && value.length > rule.maxSelections) {
        errors[questionId] = `Please select no more than ${rule.maxSelections} options`
        isValid = false
      }
    }

    // Textarea validation
    if (rule.type === 'textarea' && typeof value === 'string') {
      if (rule.minLength && value.length < rule.minLength) {
        errors[questionId] = `Please provide at least ${rule.minLength} characters`
        isValid = false
      }
      if (rule.maxLength && value.length > rule.maxLength) {
        errors[questionId] = `Please keep under ${rule.maxLength} characters`
        isValid = false
      }
    }

    // Textarea group validation
    if (rule.type === 'textarea_group' && typeof value === 'object' && value !== null) {
      const allValues = Object.values(value) as string[]
      const totalLength = allValues.join('').length
      if (rule.minLength && totalLength < rule.minLength) {
        errors[questionId] = `Please provide more detailed responses`
        isValid = false
      }
    }

    // Slider validation
    if (rule.type === 'slider' && typeof value === 'number') {
      if (rule.min && value < rule.min) {
        errors[questionId] = `Value must be at least ${rule.min}`
        isValid = false
      }
      if (rule.max && value > rule.max) {
        errors[questionId] = `Value must be no more than ${rule.max}`
        isValid = false
      }
    }

    // Slider group validation
    if (rule.type === 'slider_group' && typeof value === 'object' && value !== null) {
      const sliderValues = Object.values(value) as number[]
      if (rule.min && sliderValues.some(v => typeof v === 'number' && v < rule.min!)) {
        errors[questionId] = `All values must be at least ${rule.min}`
        isValid = false
      }
      if (rule.max && sliderValues.some(v => typeof v === 'number' && v > rule.max!)) {
        errors[questionId] = `All values must be no more than ${rule.max}`
        isValid = false
      }
    }

    // Ranking validation
    if (rule.type === 'ranking' && Array.isArray(value)) {
      if (rule.count && value.length !== rule.count) {
        errors[questionId] = `Please rank all ${rule.count} options`
        isValid = false
      }
    }

    // Single choice group validation
    if (rule.type === 'single_choice_group' && typeof value === 'object' && value !== null) {
      const choices = Object.values(value) as string[]
      if (choices.some(choice => !choice || choice.length === 0)) {
        errors[questionId] = 'Please make a selection for all options'
        isValid = false
      }
    }
  })

  return { isValid, errors }
}

export function getProgressPercentage(step: number, responses: Record<string, any>): number {
  const totalSteps = 5
  const baseProgress = ((step - 1) / totalSteps) * 100
  
  // Add progress within current step based on completed fields
  const stepKey = `step${step}` as keyof typeof validationRules
  const rules = validationRules[stepKey]
  
  if (!rules) return baseProgress
  
  const totalFields = Object.keys(rules).length
  const completedFields = Object.entries(rules).filter(([questionId]) => {
    const value = responses[questionId]
    return value && (
      (Array.isArray(value) && value.length > 0) ||
      (typeof value === 'object' && value !== null && Object.keys(value).length > 0) ||
      (typeof value === 'string' && value.length > 0) ||
      (typeof value === 'number' && value > 0)
    )
  }).length
  
  const stepProgress = (completedFields / totalFields) * (100 / totalSteps)
  
  return Math.min(baseProgress + stepProgress, 100)
}