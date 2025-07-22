'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { createBrowserClient } from '@supabase/ssr'

interface OnboardingResponses {
  // Demographics (NEW)
  ageRange?: string
  location?: string
  zipCode?: string
  
  // Existing fields
  relationshipType?: string
  relationshipDuration?: string
  livingTogether?: string
  conflictStyle?: string
  stressResponse?: string
  loveLanguageGive?: string[]
  loveLanguageReceive?: string[]
  relationshipGoals?: string[]
  additionalGoals?: string
  sharingPreference?: string
  researchConsent?: boolean
  cycleTracking?: string
  cycleLength?: string
  periodLength?: string
}

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [responses, setResponses] = useState<OnboardingResponses>({})
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)

  const totalSteps = 8

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
      }
    }
    getUser()
  }, [])

  const updateResponse = (field: string, value: any) => {
    setResponses((prev: OnboardingResponses) => ({
      ...prev,
      [field]: value
    }))
  }

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const completeOnboarding = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Save responses to database
      const { error: responseError } = await supabase
        .from('onboarding_responses')
        .insert([{
          user_id: user.id,
          responses: responses
        }])

      // Update user profile with demographics
      const { error: userError } = await supabase
        .from('users')
        .update({ 
          onboarding_completed: true,
          age_range: responses.ageRange,
          location: responses.location,
          zip_code: responses.zipCode
        })
        .eq('id', user.id)

      if (responseError || userError) {
        throw new Error('Failed to save onboarding data')
      }

      // Redirect to dashboard
      window.location.href = '/dashboard'
    } catch (error) {
      console.error('Error completing onboarding:', error)
      alert('Error saving your responses. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return 'Welcome to Relationship OS'
      case 2: return 'About You (Optional)'
      case 3: return 'About Your Relationship'
      case 4: return 'Communication Style'
      case 5: return 'How You Connect'
      case 6: return 'Relationship Goals'
      case 7: return 'Privacy & Sharing'
      case 8: return 'Cycle Tracking (Optional)'
      default: return 'Onboarding'
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 bg-calm-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-calm-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Welcome to Your Relationship Journey!</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We'll ask you some questions to understand your relationship better. This helps our AI provide personalized insights that actually matter to you.
            </p>
            <div className="bg-calm-50 border border-calm-200 rounded-lg p-4 max-w-md mx-auto">
              <div className="flex items-start space-x-3">
                <svg className="w-5 h-5 text-calm-600 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <div className="text-sm">
                  <p className="font-medium text-calm-800">Your data stays private</p>
                  <p className="text-calm-700">All responses are used only to generate better insights for you.</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500">Takes about 5 minutes • 8 quick steps</p>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Tell us a bit about you</h2>
              <p className="text-gray-600">Optional information to help us provide better insights and research</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Age Range (Optional - helps us provide age-appropriate insights)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: '18-24', label: '18-24' },
                    { value: '25-34', label: '25-34' },
                    { value: '35-44', label: '35-44' },
                    { value: '45-54', label: '45-54' },
                    { value: '55-64', label: '55-64' },
                    { value: '65+', label: '65+' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => updateResponse('ageRange', option.value)}
                      className={`p-4 rounded-lg border text-left transition-colors ${
                        responses.ageRange === option.value
                          ? 'border-calm-500 bg-calm-50 text-calm-800'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location (Optional - City, State or Country)
                </label>
                <input
                  id="location"
                  type="text"
                  value={responses.location || ''}
                  onChange={(e) => updateResponse('location', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-calm-500 focus:border-calm-500"
                  placeholder="e.g., San Francisco, CA or London, UK"
                />
              </div>

              <div>
                <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP/Postal Code (Optional)
                </label>
                <input
                  id="zipCode"
                  type="text"
                  value={responses.zipCode || ''}
                  onChange={(e) => updateResponse('zipCode', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-calm-500 focus:border-calm-500"
                  placeholder="e.g., 94103"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm">
                    <p className="font-medium text-blue-800 mb-1">Why we ask this</p>
                    <p className="text-blue-700">
                      Demographics help us understand our users better and improve our insights. 
                      This data is kept private and only used in aggregate for research purposes.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Tell us about your relationship</h2>
              <p className="text-gray-600">Help us understand your relationship context</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What type of relationship are you in?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'dating', label: '💕 Dating' },
                    { value: 'engaged', label: '💍 Engaged' },
                    { value: 'married', label: '👫 Married' },
                    { value: 'partnership', label: '🤝 Life Partners' },
                    { value: 'family', label: '👨‍👩‍👧‍👦 Family' },
                    { value: 'friendship', label: '👯 Close Friends' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => updateResponse('relationshipType', option.value)}
                      className={`p-4 rounded-lg border text-left transition-colors ${
                        responses.relationshipType === option.value
                          ? 'border-calm-500 bg-calm-50 text-calm-800'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  How long have you been in this relationship?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'new', label: 'Less than 6 months' },
                    { value: 'developing', label: '6 months - 2 years' },
                    { value: 'established', label: '2 - 5 years' },
                    { value: 'longterm', label: 'More than 5 years' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => updateResponse('relationshipDuration', option.value)}
                      className={`p-4 rounded-lg border text-left transition-colors ${
                        responses.relationshipDuration === option.value
                          ? 'border-calm-500 bg-calm-50 text-calm-800'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Do you live/work together regularly?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'yes', label: 'Yes, we spend most days together' },
                    { value: 'no', label: 'No, we connect regularly but separately' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => updateResponse('livingTogether', option.value)}
                      className={`p-4 rounded-lg border text-left transition-colors ${
                        responses.livingTogether === option.value
                          ? 'border-calm-500 bg-calm-50 text-calm-800'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your communication style</h2>
              <p className="text-gray-600">Understanding how you communicate helps us provide better insights</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  How do you prefer to handle conflicts?
                </label>
                <div className="space-y-3">
                  {[
                    { value: 'direct', label: 'Address issues directly and immediately' },
                    { value: 'thoughtful', label: 'Take time to think before discussing' },
                    { value: 'avoid', label: 'Prefer to avoid conflict when possible' },
                    { value: 'collaborative', label: 'Focus on finding solutions together' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => updateResponse('conflictStyle', option.value)}
                      className={`w-full p-4 rounded-lg border text-left transition-colors ${
                        responses.conflictStyle === option.value
                          ? 'border-calm-500 bg-calm-50 text-calm-800'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  When you're stressed or upset, you typically:
                </label>
                <div className="space-y-3">
                  {[
                    { value: 'talk', label: 'Want to talk it through immediately' },
                    { value: 'space', label: 'Need some space to process first' },
                    { value: 'distraction', label: 'Prefer distraction or activities together' },
                    { value: 'support', label: 'Just want emotional support and understanding' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => updateResponse('stressResponse', option.value)}
                      className={`w-full p-4 rounded-lg border text-left transition-colors ${
                        responses.stressResponse === option.value
                          ? 'border-calm-500 bg-calm-50 text-calm-800'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">How you connect and show care</h2>
              <p className="text-gray-600">Understanding how you express and receive care helps create better insights for any relationship</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  How do you prefer to show care and appreciation? (Select up to 2)
                </label>
                <div className="space-y-3">
                  {[
                    { value: 'words', label: '💬 Words of Affirmation - Verbal appreciation and encouragement' },
                    { value: 'time', label: '⏰ Quality Time - Focused attention and shared activities' },
                    { value: 'touch', label: '🤗 Physical Touch - Hugs, appropriate physical closeness' },
                    { value: 'gifts', label: '🎁 Gifts - Thoughtful surprises and meaningful gestures' },
                    { value: 'acts', label: '🛠️ Acts of Service - Doing helpful things for each other' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        const current = responses.loveLanguageGive || []
                        if (current.includes(option.value)) {
                          updateResponse('loveLanguageGive', current.filter((item: string) => item !== option.value))
                        } else if (current.length < 2) {
                          updateResponse('loveLanguageGive', [...current, option.value])
                        }
                      }}
                      className={`w-full p-4 rounded-lg border text-left transition-colors ${
                        responses.loveLanguageGive?.includes(option.value)
                          ? 'border-calm-500 bg-calm-50 text-calm-800'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  How do you prefer to receive care and appreciation? (Select up to 2)
                </label>
                <div className="space-y-3">
                  {[
                    { value: 'words', label: '💬 Words of Affirmation - Hearing appreciation and compliments' },
                    { value: 'time', label: '⏰ Quality Time - Undivided attention and meaningful conversations' },
                    { value: 'touch', label: '🤗 Physical Touch - Appropriate physical affection and closeness' },
                    { value: 'gifts', label: '🎁 Gifts - Receiving thoughtful tokens of appreciation' },
                    { value: 'acts', label: '🛠️ Acts of Service - Having others help with meaningful tasks' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        const current = responses.loveLanguageReceive || []
                        if (current.includes(option.value)) {
                          updateResponse('loveLanguageReceive', current.filter((item: string) => item !== option.value))
                        } else if (current.length < 2) {
                          updateResponse('loveLanguageReceive', [...current, option.value])
                        }
                      }}
                      className={`w-full p-4 rounded-lg border text-left transition-colors ${
                        responses.loveLanguageReceive?.includes(option.value)
                          ? 'border-calm-500 bg-calm-50 text-calm-800'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Your relationship goals</h2>
              <p className="text-gray-600">What would you like to improve or strengthen in this relationship?</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What areas would you like to focus on? (Select all that apply)
                </label>
                <div className="space-y-3">
                  {[
                    { value: 'communication', label: '💬 Better communication and understanding' },
                    { value: 'intimacy', label: '💕 Deeper emotional connection and closeness' },
                    { value: 'conflict', label: '🤝 Healthier conflict resolution' },
                    { value: 'time', label: '⏰ More quality time together' },
                    { value: 'appreciation', label: '🌟 Showing more appreciation for each other' },
                    { value: 'goals', label: '🎯 Aligning on shared goals and plans' },
                    { value: 'stress', label: '😌 Managing stress and supporting each other' },
                    { value: 'boundaries', label: '🛡️ Setting healthy boundaries' },
                    { value: 'trust', label: '🤞 Building deeper trust and reliability' },
                    { value: 'fun', label: '🎉 Having more fun and positive experiences together' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        const current = responses.relationshipGoals || []
                        if (current.includes(option.value)) {
                          updateResponse('relationshipGoals', current.filter((item: string) => item !== option.value))
                        } else {
                          updateResponse('relationshipGoals', [...current, option.value])
                        }
                      }}
                      className={`w-full p-4 rounded-lg border text-left transition-colors ${
                        responses.relationshipGoals?.includes(option.value)
                          ? 'border-calm-500 bg-calm-50 text-calm-800'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="additionalGoals" className="block text-sm font-medium text-gray-700 mb-2">
                  Anything else you'd like to work on? (Optional)
                </label>
                <textarea
                  id="additionalGoals"
                  value={responses.additionalGoals || ''}
                  onChange={(e) => updateResponse('additionalGoals', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-calm-500 focus:border-calm-500 transition-colors resize-none"
                  placeholder="Tell us about any specific areas you'd like to focus on..."
                />
              </div>
            </div>
          </div>
        )

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Privacy & sharing preferences</h2>
              <p className="text-gray-600">Control what insights are shared and how</p>
            </div>

            <div className="space-y-6">
              <div className="bg-calm-50 border border-calm-200 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                  <svg className="w-6 h-6 text-calm-600 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-calm-800 mb-1">Privacy-First Promise</h4>
                    <p className="text-calm-700 text-sm">
                      Your journal entries always stay completely private. AI insights are generated without revealing your personal writing to anyone.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  If you connect with others later, what kind of insights would you be comfortable sharing?
                </label>
                <div className="space-y-3">
                  {[
                    { 
                      value: 'general', 
                      label: 'General suggestions only',
                      description: 'Basic recommendations like "Consider planning quality time"'
                    },
                    { 
                      value: 'patterns', 
                      label: 'Pattern insights',
                      description: 'Trends in your mood/connection without specific details'
                    },
                    { 
                      value: 'detailed', 
                      label: 'Detailed coaching',
                      description: 'Specific insights based on your communication style and preferences'
                    },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => updateResponse('sharingPreference', option.value)}
                      className={`w-full p-4 rounded-lg border text-left transition-colors ${
                        responses.sharingPreference === option.value
                          ? 'border-calm-500 bg-calm-50 text-calm-800'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    checked={responses.researchConsent || false}
                    onChange={(e) => updateResponse('researchConsent', e.target.checked)}
                    className="mt-1 h-4 w-4 text-calm-600 focus:ring-calm-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">
                    I'm comfortable with my anonymized data being used for relationship research to help improve the platform (completely optional)
                  </span>
                </label>
              </div>
            </div>
          </div>
        )

      case 8:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Menstrual cycle tracking</h2>
              <p className="text-gray-600">Optional feature that can provide insights about mood and energy patterns</p>
            </div>

            <div className="space-y-6">
              <div className="bg-mint-50 border border-mint-200 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                  <svg className="w-6 h-6 text-mint-600 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-mint-800 mb-1">How This Helps</h4>
                    <p className="text-mint-700 text-sm">
                      Cycle tracking helps AI understand mood patterns and can provide gentle insights to partners about when extra support might be appreciated.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Would you like to use cycle tracking?
                </label>
                <div className="space-y-3">
                  {[
                    { 
                      value: 'yes', 
                      label: 'Yes, I want cycle tracking',
                      description: 'Track cycles and get personalized insights'
                    },
                    { 
                      value: 'no', 
                      label: 'No thanks, not for me',
                      description: 'Skip this feature completely'
                    },
                    { 
                      value: 'later', 
                      label: 'Maybe later',
                      description: 'I can enable this in settings anytime'
                    },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => updateResponse('cycleTracking', option.value)}
                      className={`w-full p-4 rounded-lg border text-left transition-colors ${
                        responses.cycleTracking === option.value
                          ? 'border-mint-500 bg-mint-50 text-mint-800'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {responses.cycleTracking === 'yes' && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-4">Quick cycle info</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Typical cycle length
                      </label>
                      <select
                        value={responses.cycleLength || '28'}
                        onChange={(e) => updateResponse('cycleLength', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-calm-500 focus:border-calm-500"
                      >
                        {Array.from({ length: 21 }, (_, i) => 21 + i).map(days => (
                          <option key={days} value={days}>{days} days</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Typical period length
                      </label>
                      <select
                        value={responses.periodLength || '5'}
                        onChange={(e) => updateResponse('periodLength', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-calm-500 focus:border-calm-500"
                      >
                        {Array.from({ length: 8 }, (_, i) => i + 3).map(days => (
                          <option key={days} value={days}>{days} days</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="text-center">
                <p className="text-lg font-medium text-gray-900 mb-2">
                  🎉 You're all set!
                </p>
                <p className="text-gray-600">
                  Ready to start your personalized relationship journey
                </p>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1: return true
      case 2: return true // Demographics are optional
      case 3: return responses.relationshipType && responses.relationshipDuration && responses.livingTogether
      case 4: return responses.conflictStyle && responses.stressResponse
      case 5: return responses.loveLanguageGive?.length && responses.loveLanguageGive.length > 0 && responses.loveLanguageReceive?.length && responses.loveLanguageReceive.length > 0
      case 6: return responses.relationshipGoals?.length && responses.relationshipGoals.length > 0
      case 7: return responses.sharingPreference
      case 8: return responses.cycleTracking
      default: return false
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-calm-50 to-mint-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm text-gray-500">{Math.round((currentStep / totalSteps) * 100)}% complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-calm-600 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-8">
            <h1 className="text-xl font-bold text-calm-800 text-center mb-2">
              {getStepTitle(currentStep)}
            </h1>
          </div>

          {renderStep()}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Previous
            </Button>

            <div className="flex space-x-2">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i + 1 <= currentStep ? 'bg-calm-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {currentStep === totalSteps ? (
              <Button
                onClick={completeOnboarding}
                disabled={!canProceed() || loading}
                className="bg-calm-600 hover:bg-calm-700 text-white px-8"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Completing...</span>
                  </div>
                ) : (
                  'Complete Setup →'
                )}
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                disabled={!canProceed()}
                className="bg-calm-600 hover:bg-calm-700 text-white px-8"
              >
                Next →
              </Button>
            )}
          </div>

          {/* Help Text */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              All responses are kept private and used only to personalize your experience
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}