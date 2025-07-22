'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createBrowserClient } from '@supabase/ssr'

export default function JournalPage() {
  const [content, setContent] = useState('')
  const [moodScore, setMoodScore] = useState(5)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [entries, setEntries] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  // Get current user and load journal entries
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        loadJournalEntries(user.id)
      }
    }
    getUser()
  }, [])

  const loadJournalEntries = async (userId: string) => {
    const { data, error } = await supabase
      .from('journal_entries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (data) {
      setEntries(data)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !content.trim()) return

    setLoading(true)
    setMessage('')

    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .insert([
          {
            user_id: user.id,
            content: content.trim(),
            mood_score: moodScore,
          }
        ])
        .select()

      if (error) {
        setMessage(`Error: ${error.message}`)
      } else {
        setMessage('Journal entry saved! 📝')
        setContent('')
        setMoodScore(5)
        // Reload entries
        loadJournalEntries(user.id)
        
        // Clear success message after 3 seconds
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      setMessage('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getMoodEmoji = (score: number) => {
    if (score >= 9) return '🌟'
    if (score >= 7) return '😊'
    if (score >= 5) return '😌'
    if (score >= 3) return '😔'
    return '😢'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-calm-50 to-mint-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-calm-800">Relationship OS</h1>
            </div>
            <nav className="flex items-center space-x-6">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-700">
                Dashboard
              </Link>
              <Link href="/journal" className="text-calm-700 hover:text-calm-800 font-medium">
                Journal
              </Link>
              <Link href="/checkin" className="text-gray-600 hover:text-gray-700">
                Check-In
              </Link>
              <Link href="/insights" className="text-gray-600 hover:text-gray-700">
                Insights
              </Link>
              <Link href="/settings" className="text-gray-600 hover:text-gray-700">
                Settings
              </Link>
              <Button 
                variant="ghost" 
                className="text-gray-600"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Privacy Notice */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-l-4 border-calm-500">
          <div className="flex items-start space-x-3">
            <svg className="w-6 h-6 text-calm-600 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Your Private Space</h4>
              <p className="text-gray-600 text-sm">
                Everything you write here is completely private to you. AI analyzes patterns to generate insights for your partner without sharing your actual words or personal details.
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* New Entry Form */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">New Journal Entry</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Mood Score */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  How are you feeling right now? {getMoodEmoji(moodScore)} ({moodScore}/10)
                </label>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">😢 1</span>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={moodScore}
                    onChange={(e) => setMoodScore(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <span className="text-sm text-gray-500">10 🌟</span>
                </div>
              </div>

              {/* Journal Content */}
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  What's on your mind?
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-calm-500 focus:border-calm-500 transition-colors resize-none"
                  placeholder="Write about your thoughts, feelings, relationship experiences, or anything else on your mind. This is your private space..."
                  required
                />
                <div className="mt-2 text-sm text-gray-500">
                  {content.length} characters
                </div>
              </div>

              {message && (
                <div className={`text-sm p-3 rounded-lg ${
                  message.includes('Error') ? 'text-red-600 bg-red-50' : 'text-mint-600 bg-mint-50'
                }`}>
                  {message}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || !content.trim()}
                className="w-full bg-calm-600 hover:bg-calm-700 text-white py-3 text-base"
              >
                {loading ? 'Saving...' : 'Save Entry'}
              </Button>
            </form>
          </div>

          {/* Previous Entries */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Journal History</h2>
            
            {entries.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <p className="text-gray-500">No journal entries yet. Start writing to begin your journey!</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {entries.map((entry) => (
                  <div key={entry.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getMoodEmoji(entry.mood_score)}</span>
                        <span className="text-sm font-medium text-gray-900">
                          Mood: {entry.mood_score}/10
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDate(entry.created_at)}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
                      {entry.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}