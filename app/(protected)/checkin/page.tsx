'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createBrowserClient } from '@supabase/ssr'

export default function CheckinPage() {
  const [connectionScore, setConnectionScore] = useState(5)
  const [moodScore, setMoodScore] = useState(5)
  const [gratitudeNote, setGratitudeNote] = useState('')
  const [challengeNote, setChallengeNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [recentCheckins, setRecentCheckins] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [todayCompleted, setTodayCompleted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        loadRecentCheckins(user.id)
        checkTodayStatus(user.id)
      }
    }
    getUser()
  }, [])

  const loadRecentCheckins = async (userId: string) => {
    const { data, error } = await supabase
      .from('daily_checkins')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(7)

    if (data) {
      setRecentCheckins(data)
    }
  }

  const checkTodayStatus = async (userId: string) => {
    console.log('🔍 DEBUG: Checking today status for user:', userId)
    
    // Get current date in user's timezone
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    
    console.log('🔍 DEBUG: Today start:', todayStart.toISOString())
    console.log('🔍 DEBUG: Today end:', todayEnd.toISOString())
    console.log('🔍 DEBUG: Current time:', now.toISOString())

    const { data, error } = await supabase
      .from('daily_checkins')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', todayStart.toISOString())
      .lt('created_at', todayEnd.toISOString())

    console.log('🔍 DEBUG: Today checkins found:', data)
    console.log('🔍 DEBUG: Query error:', error)

    if (data && data.length > 0) {
      console.log('🔍 DEBUG: Setting today completed to true')
      setTodayCompleted(true)
    } else {
      console.log('🔍 DEBUG: No checkins today, can do new checkin')
      setTodayCompleted(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setMessage('')

    try {
      console.log('🔍 DEBUG: Submitting checkin...')
      
      const { data, error } = await supabase
        .from('daily_checkins')
        .insert([
          {
            user_id: user.id,
            relationship_id: null, // We'll add relationship support later
            connection_score: connectionScore,
            mood_score: moodScore,
            gratitude_note: gratitudeNote.trim() || null,
            challenge_note: challengeNote.trim() || null,
          }
        ])
        .select()

      console.log('🔍 DEBUG: Insert result:', data)
      console.log('🔍 DEBUG: Insert error:', error)

      if (error) {
        setMessage(`Error: ${error.message}`)
      } else {
        setMessage('Daily check-in completed! ✨')
        setTodayCompleted(true)
        
        // Reset form
        setConnectionScore(5)
        setMoodScore(5)
        setGratitudeNote('')
        setChallengeNote('')
        
        // Reload recent check-ins
        loadRecentCheckins(user.id)
        
        // Clear success message after 3 seconds
        setTimeout(() => setMessage(''), 3000)
      }
    } catch (error) {
      console.error('🔍 DEBUG: Submission error:', error)
      setMessage('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const getMoodEmoji = (score: number) => {
    if (score >= 9) return '🌟'
    if (score >= 7) return '😊'
    if (score >= 5) return '😌'
    if (score >= 3) return '😔'
    return '😢'
  }

  const getConnectionEmoji = (score: number) => {
    if (score >= 9) return '💕'
    if (score >= 7) return '💖'
    if (score >= 5) return '💛'
    if (score >= 3) return '💙'
    return '💔'
  }

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-mint-600'
    if (score >= 6) return 'text-calm-600'
    if (score >= 4) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-calm-50 to-mint-50">
      {/* Mobile-Optimized Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <h1 className="text-xl sm:text-2xl font-bold text-calm-800">Relationship OS</h1>
            </div>
            
            {/* Mobile Menu Button */}
            {isMobile ? (
              <div className="flex items-center space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-gray-600 p-2"
                  onClick={handleLogout}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                </Button>
              </div>
            ) : (
              <nav className="flex items-center space-x-6">
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-700">
                  Dashboard
                </Link>
                <Link href="/journal" className="text-gray-600 hover:text-gray-700">
                  Journal
                </Link>
                <Link href="/checkin" className="text-calm-700 hover:text-calm-800 font-medium">
                  Check-In
                </Link>
                <Link href="/insights" className="text-gray-600 hover:text-gray-700">
                  Insights
                </Link>
                <Link href="/relationships" className="text-gray-600 hover:text-gray-700">
                  Relationships
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
            )}
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
          <div className="grid grid-cols-5 py-2">
            <Link href="/dashboard" className="flex flex-col items-center py-2 text-gray-600">
              <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <span className="text-xs">Home</span>
            </Link>
            <Link href="/journal" className="flex flex-col items-center py-2 text-gray-600">
              <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span className="text-xs">Journal</span>
            </Link>
            <Link href="/insights" className="flex flex-col items-center py-2 text-gray-600">
              <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span className="text-xs">Insights</span>
            </Link>
            <Link href="/relationships" className="flex flex-col items-center py-2 text-gray-600">
              <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="text-xs">Partners</span>
            </Link>
            <Link href="/checkin" className="flex flex-col items-center py-2 text-calm-700">
              <svg className="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs">Check-In</span>
            </Link>
          </div>
        </div>
      )}

      <main className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 ${isMobile ? 'pb-20' : ''}`}>
        {/* Today's Status */}
        {todayCompleted && (
          <div className="bg-mint-50 border border-mint-200 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex items-center space-x-3">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-mint-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-semibold text-mint-800 text-sm sm:text-base">Today's Check-in Complete!</h3>
                <p className="text-mint-600 text-xs sm:text-sm">You've already completed your daily check-in. Come back tomorrow!</p>
                <Button 
                  onClick={() => {
                    console.log('🔍 DEBUG: Force refresh button clicked')
                    checkTodayStatus(user.id)
                  }}
                  size="sm"
                  variant="outline"
                  className="mt-2 border-mint-300 text-mint-700 text-xs"
                >
                  🔄 Refresh Status
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Check-in Form */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Daily Check-In</h2>
            <p className="text-gray-600 mb-6 text-sm sm:text-base">Take a moment to reflect on your relationship and mood today.</p>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Connection Score */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  How connected do you feel in your relationship today? {getConnectionEmoji(connectionScore)} ({connectionScore}/10)
                </label>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-500">💔 1</span>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={connectionScore}
                    onChange={(e) => setConnectionScore(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #ef4444 0%, #f59e0b 50%, #10b981 100%)`
                    }}
                  />
                  <span className="text-sm text-gray-500">10 💕</span>
                </div>
              </div>

              {/* Mood Score */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  What's your overall mood today? {getMoodEmoji(moodScore)} ({moodScore}/10)
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

              {/* Gratitude Note */}
              <div>
                <label htmlFor="gratitude" className="block text-sm font-medium text-gray-700 mb-2">
                  What are you grateful for today? (Optional)
                </label>
                <textarea
                  id="gratitude"
                  value={gratitudeNote}
                  onChange={(e) => setGratitudeNote(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-calm-500 focus:border-calm-500 transition-colors resize-none text-sm sm:text-base"
                  placeholder="Something you appreciate about your relationship, partner, or day..."
                />
              </div>

              {/* Challenge Note */}
              <div>
                <label htmlFor="challenge" className="block text-sm font-medium text-gray-700 mb-2">
                  Any challenges or concerns? (Optional)
                </label>
                <textarea
                  id="challenge"
                  value={challengeNote}
                  onChange={(e) => setChallengeNote(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-calm-500 focus:border-calm-500 transition-colors resize-none text-sm sm:text-base"
                  placeholder="Anything weighing on your mind or relationship..."
                />
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
                disabled={loading || todayCompleted}
                className="w-full bg-calm-600 hover:bg-calm-700 text-white py-3 text-base disabled:opacity-50"
              >
                {loading ? 'Saving...' : todayCompleted ? 'Already Completed Today' : 'Complete Check-In'}
              </Button>
            </form>
          </div>

          {/* Recent Check-ins */}
          <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">Your Recent Check-Ins</h2>
            
            {recentCheckins.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <p className="text-gray-500 text-sm sm:text-base">No check-ins yet. Complete your first one!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentCheckins.map((checkin) => (
                  <div key={checkin.id} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-900">
                        {formatDate(checkin.created_at)}
                      </span>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <span>{getConnectionEmoji(checkin.connection_score)}</span>
                          <span className={`text-sm font-medium ${getScoreColor(checkin.connection_score)}`}>
                            {checkin.connection_score}/10
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>{getMoodEmoji(checkin.mood_score)}</span>
                          <span className={`text-sm font-medium ${getScoreColor(checkin.mood_score)}`}>
                            {checkin.mood_score}/10
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {checkin.gratitude_note && (
                      <div className="mb-2">
                        <p className="text-xs font-medium text-mint-700">Grateful for:</p>
                        <p className="text-sm text-gray-700">{checkin.gratitude_note}</p>
                      </div>
                    )}
                    
                    {checkin.challenge_note && (
                      <div>
                        <p className="text-xs font-medium text-yellow-700">Challenge:</p>
                        <p className="text-sm text-gray-700">{checkin.challenge_note}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Insights Preview */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm sm:text-base">What This Helps With:</h3>
              <ul className="text-xs sm:text-sm text-gray-600 space-y-2">
                <li className="flex items-start space-x-2">
                  <span className="text-mint-600">•</span>
                  <span>Track relationship patterns over time</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-calm-600">•</span>
                  <span>Generate your connection score</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-purple-600">•</span>
                  <span>Create personalized insights for your partner</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}