// Quick test component to validate suggestion generation
// Add this to a page temporarily or create a test route

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { createBrowserClient } from '@supabase/ssr'

export default function TestSuggestionGeneration() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [relationshipId, setRelationshipId] = useState('')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const findUserRelationship = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: relationships } = await supabase
      .from('relationship_members')
      .select('relationship_id, relationships(*)')
      .eq('user_id', user.id)
      .limit(1)
      .single()

    return relationships?.relationship_id || null
  }

  const testSuggestionGeneration = async () => {
    setLoading(true)
    setError('')
    setResult(null)

    try {
      // Get user's relationship ID if not provided
      let testRelationshipId = relationshipId
      if (!testRelationshipId) {
        testRelationshipId = await findUserRelationship()
        if (!testRelationshipId) {
          setError('No relationship found. You need to be in a relationship to test suggestions.')
          setLoading(false)
          return
        }
        setRelationshipId(testRelationshipId)
      }

      console.log('🧪 Testing suggestion generation for relationship:', testRelationshipId)

      const response = await fetch('/api/suggestions/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          relationshipId: testRelationshipId,
          timeframeHours: 168, // Look back 1 week for testing
          maxSuggestions: 5
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'API call failed')
      }

      const data = await response.json()
      console.log('✅ Suggestion generation result:', data)
      setResult(data)

    } catch (err: any) {
      console.error('❌ Test failed:', err)
      setError(err.message || 'Unknown error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">🧪 Test Suggestion Generation Engine</h2>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Relationship ID (optional - will auto-detect):
          </label>
          <input
            type="text"
            value={relationshipId}
            onChange={(e) => setRelationshipId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Leave empty to auto-detect your relationship"
          />
        </div>

        <Button
          onClick={testSuggestionGeneration}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {loading ? 'Generating Suggestions...' : 'Test Suggestion Generation'}
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
          <h3 className="font-medium text-red-800 mb-2">❌ Error:</h3>
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {result && (
        <div className="space-y-6">
          {/* Success Summary */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <h3 className="font-medium text-green-800 mb-2">✅ Generation Successful!</h3>
            <div className="text-green-700 text-sm">
              <p>• Generated {result.result?.suggestions?.length || 0} suggestions</p>
              <p>• Analyzed {result.result?.processing_stats?.entries_analyzed || 0} journal entries</p>
              <p>• Found {result.result?.processing_stats?.needs_found || 0} relationship needs</p>
              <p>• {result.result?.processing_stats?.confidence_threshold_met || 0} high-confidence suggestions</p>
            </div>
          </div>

          {/* Generated Suggestions */}
          {result.result?.suggestions?.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4">🎯 Generated Suggestions:</h3>
              <div className="space-y-4">
                {result.result.suggestions.map((suggestion: any, index: number) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                        {suggestion.suggestion_type.replace(/_/g, ' ')}
                      </span>
                      <div className="text-sm text-gray-500">
                        Priority: {suggestion.priority_score}/10 | 
                        Confidence: {Math.round(suggestion.confidence_score * 100)}%
                      </div>
                    </div>
                    <p className="text-gray-800 mb-2">{suggestion.suggestion_text}</p>
                    <p className="text-sm text-gray-600 italic">{suggestion.anonymized_context}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Processing Stats */}
          <div>
            <h3 className="text-lg font-semibold mb-4">📊 Processing Statistics:</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                {JSON.stringify(result.result?.processing_stats, null, 2)}
              </pre>
            </div>
          </div>

          {/* Raw API Response (for debugging) */}
          <details className="border border-gray-200 rounded-lg">
            <summary className="p-4 cursor-pointer hover:bg-gray-50">
              🔧 Full API Response (Debug)
            </summary>
            <div className="p-4 bg-gray-50">
              <pre className="text-xs text-gray-600 whitespace-pre-wrap overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </details>
        </div>
      )}
    </div>
  )
}

// Alternative: Quick browser console test
// Open browser console and run this:
/*
async function testSuggestions() {
  const response = await fetch('/api/suggestions/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      relationshipId: 'YOUR_RELATIONSHIP_ID', // Replace with actual ID
      timeframeHours: 168, // Look back 1 week
      maxSuggestions: 3
    }),
  });
  
  const result = await response.json();
  console.log('Suggestion Generation Result:', result);
  return result;
}

testSuggestions();
*/