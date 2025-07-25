// components/dashboard/PartnerSuggestions.tsx
// The core MVP interface - where partners see AI-generated suggestions

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/lib/types/database'

type PartnerSuggestion = Database['public']['Tables']['partner_suggestions']['Row'] & {
  relationship?: {
    name: string
  }
  source_user?: {
    full_name: string | null
    email: string
  }
}

export function PartnerSuggestions() {
  const [suggestions, setSuggestions] = useState<PartnerSuggestion[]>([])
  const [loading, setLoading] = useState(true)
  const [processingFeedback, setProcessingFeedback] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    loadSuggestions()
  }, [])

  const loadSuggestions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      setUser(user)

      // Get suggestions for this user (as recipient)
      const { data: suggestionsData, error } = await supabase
        .from('partner_suggestions')
        .select(`
          *,
          relationships!inner(name),
          users!partner_suggestions_source_user_id_fkey(full_name, email)
        `)
        .eq('recipient_user_id', user.id)
        .is('delivered_at', null) // Only undelivered suggestions
        .gte('expires_at', new Date().toISOString()) // Not expired
        .order('priority_score', { ascending: false })
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Error loading suggestions:', error)
        return
      }

      console.log('📬 Loaded suggestions:', suggestionsData?.length || 0)
      setSuggestions(suggestionsData || [])

      // Mark suggestions as delivered
      if (suggestionsData && suggestionsData.length > 0) {
        await markSuggestionsAsDelivered(suggestionsData.map(s => s.id))
      }

    } catch (error) {
      console.error('❌ Failed to load suggestions:', error)
    } finally {
      setLoading(false)
    }
  }

  const markSuggestionsAsDelivered = async (suggestionIds: string[]) => {
    const { error } = await supabase
      .from('partner_suggestions')
      .update({ 
        delivered_at: new Date().toISOString(),
        viewed_at: new Date().toISOString()
      })
      .in('id', suggestionIds)

    if (error) {
      console.error('⚠️ Failed to mark suggestions as delivered:', error)
    } else {
      console.log('✅ Marked suggestions as delivered')
    }
  }

  const handleSuggestionResponse = async (
    suggestionId: string, 
    response: 'helpful' | 'not_helpful' | 'will_try',
    effectivenessRating: number
  ) => {
    setProcessingFeedback('Saving your feedback...')

    try {
      const responseText = response === 'helpful' ? 'This was helpful!' : 
                          response === 'will_try' ? 'I will try this!' : 
                          'This wasn\'t quite right for our situation.'

      const { error } = await supabase
        .from('partner_suggestions')
        .update({
          response: responseText,
          effectiveness_rating: effectivenessRating,
          viewed_at: new Date().toISOString()
        })
        .eq('id', suggestionId)

      if (error) throw error

      // Update local state
      setSuggestions(prev => prev.map(s => 
        s.id === suggestionId 
          ? { ...s, response: responseText, effectiveness_rating: effectivenessRating }
          : s
      ))

      setProcessingFeedback('Thank you for your feedback! 💕')
      setTimeout(() => setProcessingFeedback(null), 3000)

    } catch (error) {
      console.error('❌ Failed to save feedback:', error)
      setProcessingFeedback('Failed to save feedback. Please try again.')
      setTimeout(() => setProcessingFeedback(null), 3000)
    }
  }

  const getSuggestionIcon = (type: string) => {
    const icons: Record<string, string> = {
      love_language_action: '💕',
      communication_improvement: '💬', 
      intimacy_connection: '🤗',
      goal_support: '🎯',
      conflict_resolution: '🤝',
      quality_time: '⏰',
      stress_support: '🌟'
    }
    return icons[type] || '💡'
  }

  const getSuggestionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      love_language_action: 'Love & Affection',
      communication_improvement: 'Communication', 
      intimacy_connection: 'Connection',
      goal_support: 'Support & Goals',
      conflict_resolution: 'Understanding',
      quality_time: 'Quality Time',
      stress_support: 'Support & Care'
    }
    return labels[type] || 'Relationship Care'
  }

  const getPriorityColor = (score: number) => {
    if (score >= 8) return 'bg-red-100 text-red-800 border-red-200'
    if (score >= 6) return 'bg-orange-100 text-orange-800 border-orange-200'
    if (score >= 4) return 'bg-blue-100 text-blue-800 border-blue-200'
    return 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getPriorityLabel = (score: number) => {
    if (score >= 8) return 'High Priority'
    if (score >= 6) return 'Medium Priority'
    return 'Low Priority'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
        <span className="ml-3 text-gray-600">Loading suggestions...</span>
      </div>
    )
  }

  if (suggestions.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">💕</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No New Suggestions
          </h3>
          <p className="text-gray-600 mb-4">
            When your partner expresses needs in their journal, you'll see personalized suggestions here to help strengthen your relationship.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-700 text-sm">
              💡 <strong>How it works:</strong> Our AI analyzes your partner's journal entries (privately and anonymously) 
              to understand their relationship needs, then generates specific, actionable suggestions for you.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-xl p-6 border border-pink-200">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-lg">💕</span>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Relationship Insights for You
            </h2>
            <p className="text-gray-700 text-sm">
              Based on your partner's recent reflections, here are some thoughtful ways to strengthen your connection. 
              These suggestions are generated from patterns in their private journal - their actual words remain completely private.
            </p>
          </div>
        </div>
      </div>

      {/* Processing Feedback */}
      {processingFeedback && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            <span className="text-blue-700">{processingFeedback}</span>
          </div>
        </div>
      )}

      {/* Suggestions List */}
      <div className="space-y-4">
        {suggestions.map((suggestion) => (
          <div key={suggestion.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Suggestion Header */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getSuggestionIcon(suggestion.suggestion_type)}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {getSuggestionTypeLabel(suggestion.suggestion_type)}
                    </h3>
                    <p className="text-sm text-gray-600">{suggestion.anonymized_context}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(suggestion.priority_score)}`}>
                    {getPriorityLabel(suggestion.priority_score)}
                  </span>
                  <span className="text-xs text-gray-500">
                    {Math.round((suggestion.confidence_score || 0.5) * 100)}% confidence
                  </span>
                </div>
              </div>
            </div>

            {/* Suggestion Content */}
            <div className="px-6 py-6">
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                <h4 className="font-medium text-blue-900 mb-2">💡 Suggestion:</h4>
                <p className="text-blue-800 leading-relaxed">{suggestion.suggestion_text}</p>
              </div>

              {/* Response Buttons */}
              {!suggestion.response ? (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-gray-700">How does this suggestion feel to you?</p>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      onClick={() => handleSuggestionResponse(suggestion.id, 'helpful', 5)}
                      className="bg-green-600 hover:bg-green-700 text-white"
                      size="sm"
                    >
                      💚 This is really helpful!
                    </Button>
                    <Button
                      onClick={() => handleSuggestionResponse(suggestion.id, 'will_try', 4)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      size="sm"
                    >
                      👍 I'll try this
                    </Button>
                    <Button
                      onClick={() => handleSuggestionResponse(suggestion.id, 'not_helpful', 2)}
                      variant="outline"
                      size="sm"
                    >
                      🤔 Not quite right
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-600">✅</span>
                    <span className="text-green-800 font-medium">Your response: {suggestion.response}</span>
                  </div>
                  <p className="text-green-700 text-sm mt-1">
                    Thank you for your feedback! This helps us provide better suggestions.
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Note */}
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-gray-600 text-sm text-center">
          💝 These suggestions are based on relationship patterns and your partner's communication style. 
          Every relationship is unique - trust your instincts about what feels right for both of you.
        </p>
      </div>
    </div>
  )
}