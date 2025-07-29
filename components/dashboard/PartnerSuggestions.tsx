// components/dashboard/PartnerSuggestions.tsx
// DEFINITIVE FIX: Using exact database schema types without assumptions

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/lib/types/database'

// Use EXACT database schema types
type PartnerSuggestionRow = Database['public']['Tables']['partner_suggestions']['Row']
type RelationshipRow = Database['public']['Tables']['relationships']['Row']
type UserRow = Database['public']['Tables']['users']['Row']

// Define the shape of joined data explicitly
interface PartnerSuggestionWithJoins extends PartnerSuggestionRow {
  relationship?: RelationshipRow | null
  source_user?: UserRow | null
}

export function PartnerSuggestions() {
  const [suggestions, setSuggestions] = useState<PartnerSuggestionWithJoins[]>([])
  const [loading, setLoading] = useState(true)
  const [processingFeedback, setProcessingFeedback] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        await loadSuggestions(user.id)
      }
    }
    getUser()
  }, [])

  const loadSuggestions = async (userId: string) => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('🔍 Loading partner suggestions for user:', userId)

      const { data, error } = await supabase
        .from('partner_suggestions')
        .select(`
          *,
          relationship:relationships(*),
          source_user:users!partner_suggestions_source_user_id_fkey(*)
        `)
        .eq('recipient_user_id', userId)
        .or('expires_at.is.null,expires_at.gte.' + new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) {
        console.error('❌ Error loading suggestions:', error)
        setError('Failed to load suggestions')
        return
      }

      console.log(`✅ Loaded ${data?.length || 0} partner suggestions`)
      setSuggestions(data as PartnerSuggestionWithJoins[] || [])

    } catch (error) {
      console.error('❌ Unexpected error loading suggestions:', error)
      setError('Unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleFeedback = async (suggestionId: string, rating: number, feedback?: string) => {
    try {
      setProcessingFeedback(suggestionId)

      const { error } = await supabase
        .from('partner_suggestions')
        .update({
          effectiveness_rating: rating,
          response: feedback || null,
          viewed_at: new Date().toISOString()
        })
        .eq('id', suggestionId)

      if (error) {
        console.error('❌ Error submitting feedback:', error)
        return
      }

      // Update local state
      setSuggestions(prev => prev.map(s => 
        s.id === suggestionId 
          ? { 
              ...s, 
              effectiveness_rating: rating, 
              response: feedback || null, 
              viewed_at: new Date().toISOString() 
            }
          : s
      ))

      console.log('✅ Feedback submitted successfully')

    } catch (error) {
      console.error('❌ Error submitting feedback:', error)
    } finally {
      setProcessingFeedback(null)
    }
  }

  const getSuggestionIcon = (type: string | null) => {
    if (!type) return '💡'
    
    switch (type) {
      case 'love_language_action':
        return '💝'
      case 'quality_time':
        return '⏰'
      case 'communication_improvement':
        return '💬'
      case 'intimacy_connection':
        return '💕'
      case 'goal_support':
        return '🎯'
      case 'conflict_resolution':
        return '🤝'
      case 'stress_support':
        return '🤗'
      default:
        return '💡'
    }
  }

  const getPriorityColor = (priority: number | null) => {
    if (!priority) return 'bg-gray-500'
    if (priority >= 8) return 'bg-red-500'
    if (priority >= 6) return 'bg-orange-500'
    if (priority >= 4) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const formatSuggestionType = (type: string | null) => {
    if (!type) return 'General Suggestion'
    
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ')
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-6">
        <p className="text-red-600 mb-4">{error}</p>
        <Button 
          onClick={() => user && loadSuggestions(user.id)}
          variant="outline"
          size="sm"
        >
          Try Again
        </Button>
      </div>
    )
  }

  if (suggestions.length === 0) {
    return (
      <div className="text-center py-8 bg-pink-50 rounded-lg border border-pink-200">
        <span className="text-4xl mb-4 block">💕</span>
        <h3 className="font-semibold text-pink-800 mb-2">No New Suggestions</h3>
        <p className="text-pink-700 text-sm mb-4">
          Partner suggestions will appear here when your partner writes in their journal.
        </p>
        <Button 
          onClick={() => user && loadSuggestions(user.id)}
          variant="outline"
          size="sm"
          className="border-pink-300 text-pink-700"
        >
          Check for Updates
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {suggestions.map((suggestion) => (
        <div 
          key={suggestion.id} 
          className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">{getSuggestionIcon(suggestion.suggestion_type)}</span>
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-semibold text-gray-900">
                    {formatSuggestionType(suggestion.suggestion_type)}
                  </h4>
                  <div className={`w-2 h-2 rounded-full ${getPriorityColor(suggestion.priority_score)}`} />
                </div>
                <p className="text-xs text-gray-500">
                  {suggestion.relationship?.name || 'Unknown Relationship'} • Priority {suggestion.priority_score || 5}/10
                </p>
              </div>
            </div>
            <div className="text-xs text-gray-400">
              {suggestion.created_at ? new Date(suggestion.created_at).toLocaleDateString() : 'Recently'}
            </div>
          </div>

          <div className="mb-4">
            <p className="text-gray-800 leading-relaxed mb-2">
              {suggestion.suggestion_text}
            </p>
            {suggestion.anonymized_context && (
              <p className="text-gray-600 text-sm italic">
                {suggestion.anonymized_context}
              </p>
            )}
          </div>

          {!suggestion.effectiveness_rating && (
            <div className="border-t border-gray-100 pt-3">
              <p className="text-sm text-gray-600 mb-3">Was this suggestion helpful?</p>
              <div className="flex space-x-2">
                <Button
                  onClick={() => handleFeedback(suggestion.id, 5, 'Very helpful')}
                  disabled={processingFeedback === suggestion.id}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700"
                >
                  👍 Yes
                </Button>
                <Button
                  onClick={() => handleFeedback(suggestion.id, 3, 'Somewhat helpful')}
                  disabled={processingFeedback === suggestion.id}
                  size="sm"
                  variant="outline"
                  className="border-yellow-300 text-yellow-700"
                >
                  👌 Maybe
                </Button>
                <Button
                  onClick={() => handleFeedback(suggestion.id, 1, 'Not helpful')}
                  disabled={processingFeedback === suggestion.id}
                  size="sm"
                  variant="outline"
                  className="border-red-300 text-red-700"
                >
                  👎 No
                </Button>
              </div>
            </div>
          )}

          {suggestion.effectiveness_rating && (
            <div className="border-t border-gray-100 pt-3">
              <p className="text-sm text-green-600">
                ✅ Thank you for your feedback! (Rating: {suggestion.effectiveness_rating}/5)
              </p>
            </div>
          )}
        </div>
      ))}

      <div className="text-center pt-4">
        <Button 
          onClick={() => user && loadSuggestions(user.id)}
          variant="outline"
          size="sm"
          className="border-pink-300 text-pink-700"
        >
          Refresh Suggestions
        </Button>
      </div>
    </div>
  )
}