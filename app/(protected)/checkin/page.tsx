// app/(protected)/checkin/page.tsx
// Updated with brand colors and typography

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { createBrowserClient } from '@supabase/ssr'
import { 
  Heart, 
  CheckCircle, 
  Calendar, 
  TrendingUp,
  Star,
  ThumbsUp,
  MessageCircle,
  Target,
  Zap,
  BarChart3
} from 'lucide-react'

interface CheckinData {
  connection_score: number
  mood_score: number
  gratitude_note: string
  challenge_note: string
  improvement_note: string
}

interface PreviousCheckin {
  id: string
  connection_score: number
  mood_score: number
  gratitude_note: string | null
  challenge_note: string | null
  improvement_note: string | null
  created_at: string
}

export default function CheckinPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false)
  const [todaysCheckin, setTodaysCheckin] = useState<PreviousCheckin | null>(null)
  const [recentCheckins, setRecentCheckins] = useState<PreviousCheckin[]>([])
  const [streak, setStreak] = useState(0)
  
  const [checkinData, setCheckinData] = useState<CheckinData>({
    connection_score: 5,
    mood_score: 5,
    gratitude_note: '',
    challenge_note: '',
    improvement_note: ''
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        await Promise.all([
          checkTodaysCheckin(user.id),
          loadRecentCheckins(user.id),
          calculateStreak(user.id)
        ])
      }
      setLoading(false)
    }
    getUser()
  }, [])

  const checkTodaysCheckin = async (userId: string) => {
    try {
      const today = new Date().toISOString().split('T')[0]
      
      const { data, error } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`)
        .order('created_at', { ascending: false })
        .limit(1)

      if (error) throw error

      if (data && data.length > 0) {
        setHasCheckedInToday(true)
        setTodaysCheckin(data[0])
      }
    } catch (error) {
      console.error('Error checking today\'s check-in:', error)
    }
  }

  const loadRecentCheckins = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('daily_checkins')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(7)

      if (error) throw error

      setRecentCheckins(data || [])
    } catch (error) {
      console.error('Error loading recent check-ins:', error)
    }
  }

  const calculateStreak = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('daily_checkins')
        .select('created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error

      if (!data || data.length === 0) {
        setStreak(0)
        return
      }

      let currentStreak = 0
      const today = new Date()
      
      for (let i = 0; i < data.length; i++) {
        const checkinDate = new Date(data[i].created_at)
        const daysDiff = Math.floor((today.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysDiff === currentStreak) {
          currentStreak++
        } else {
          break
        }
      }

      setStreak(currentStreak)
    } catch (error) {
      console.error('Error calculating streak:', error)
    }
  }

  const submitCheckin = async () => {
    if (!user) return

    setSubmitting(true)
    setMessage('')

    try {
      const { data, error } = await supabase
        .from('daily_checkins')
        .insert([{
          user_id: user.id,
          connection_score: checkinData.connection_score,
          mood_score: checkinData.mood_score,
          gratitude_note: checkinData.gratitude_note.trim() || null,
          challenge_note: checkinData.challenge_note.trim() || null,
          improvement_note: checkinData.improvement_note.trim() || null
        }])
        .select()

      if (error) throw error

      setMessage('✅ Daily check-in completed successfully! 🎉')
      setHasCheckedInToday(true)
      setTodaysCheckin(data[0])
      
      // Reset form
      setCheckinData({
        connection_score: 5,
        mood_score: 5,
        gratitude_note: '',
        challenge_note: '',
        improvement_note: ''
      })

      // Reload data
      await Promise.all([
        loadRecentCheckins(user.id),
        calculateStreak(user.id)
      ])

      setTimeout(() => setMessage(''), 5000)
    } catch (error: any) {
      console.error('Error submitting check-in:', error)
      setMessage(`❌ Error submitting check-in: ${error.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const getConnectionIcon = (score: number) => {
    if (score >= 8) return <Heart className="w-5 h-5 text-red-500" />
    if (score >= 6) return <ThumbsUp className="w-5 h-5 text-brand-teal" />
    return <MessageCircle className="w-5 h-5 text-brand-slate" />
  }

  const getMoodIcon = (score: number) => {
    if (score >= 8) return <Star className="w-5 h-5 text-yellow-500" />
    if (score >= 6) return <Zap className="w-5 h-5 text-brand-warm-peach" />
    return <Target className="w-5 h-5 text-brand-slate" />
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStreakMessage = (streak: number) => {
    if (streak === 0) return "Start your check-in streak today! 🌱"
    if (streak === 1) return "Great start! Keep it going! 🔥"
    if (streak < 7) return `${streak} days strong! Building momentum! 💪`
    if (streak < 30) return `Amazing ${streak}-day streak! You're on fire! 🚀`
    return `Incredible ${streak}-day streak! You're a champion! 🏆`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-warm-white to-brand-cool-gray flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-brand-light-gray border-t-brand-teal rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-brand-slate font-inter">Loading your check-in...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-warm-white to-brand-cool-gray">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand-teal to-brand-dark-teal rounded-2xl shadow-lg mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-heading-xl font-bold text-brand-charcoal mb-2 font-heading">Daily Check-in</h1>
            <p className="text-brand-slate font-inter">Track your relationship connection and personal wellbeing</p>
          </div>

          {/* Streak Display */}
          <div className="bg-gradient-to-r from-brand-teal/10 to-brand-coral-pink/10 border border-brand-teal/30 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-center space-x-3">
              <div className="text-2xl">🔥</div>
              <div className="text-center">
                <div className="text-2xl font-bold text-brand-teal font-heading">{streak}</div>
                <div className="text-sm text-brand-dark-teal font-inter">Day Streak</div>
              </div>
              <div className="text-sm text-brand-slate font-inter max-w-xs">
                {getStreakMessage(streak)}
              </div>
            </div>
          </div>
        </div>

        {/* Status Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl border ${
            message.includes('❌') || message.includes('Error')
              ? 'bg-red-50 text-red-700 border-red-200' 
              : 'bg-brand-teal/10 border-brand-teal/30 text-brand-dark-teal'
          }`}>
            <div className="flex items-center">
              <span className="text-sm font-medium font-inter">{message}</span>
            </div>
          </div>
        )}

        {/* Today's Check-in Status */}
        {hasCheckedInToday && todaysCheckin ? (
          <Card className="mb-8 border-green-200 bg-green-50/50">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <CardTitle className="text-green-900 font-heading">Check-in Complete!</CardTitle>
                  <CardDescription className="text-green-700 font-inter">
                    You've already checked in today. Great job staying consistent!
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    {getConnectionIcon(todaysCheckin.connection_score)}
                  </div>
                  <div className="text-sm text-brand-slate font-inter">Connection</div>
                  <div className="text-lg font-bold text-brand-charcoal font-heading">{todaysCheckin.connection_score}/10</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    {getMoodIcon(todaysCheckin.mood_score)}
                  </div>
                  <div className="text-sm text-brand-slate font-inter">Mood</div>
                  <div className="text-lg font-bold text-brand-charcoal font-heading">{todaysCheckin.mood_score}/10</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <Calendar className="w-5 h-5 text-brand-teal" />
                  </div>
                  <div className="text-sm text-brand-slate font-inter">Streak</div>
                  <div className="text-lg font-bold text-brand-charcoal font-heading">{streak} days</div>
                </div>
                <div className="text-center p-3 bg-white rounded-lg">
                  <div className="flex items-center justify-center mb-1">
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="text-sm text-brand-slate font-inter">Status</div>
                  <div className="text-sm font-bold text-green-600 font-inter">Complete</div>
                </div>
              </div>

              {todaysCheckin.gratitude_note && (
                <div className="bg-white p-3 rounded-lg mb-3">
                  <h4 className="font-medium text-brand-charcoal mb-1 font-inter">Today's Gratitude</h4>
                  <p className="text-sm text-brand-slate font-inter">{todaysCheckin.gratitude_note}</p>
                </div>
              )}

              <div className="flex space-x-3">
                <Link href="/dashboard">
                  <Button className="bg-brand-teal hover:bg-brand-dark-teal text-white">
                    View Dashboard
                  </Button>
                </Link>
                <Link href="/journal">
                  <Button variant="outline" className="border-brand-coral-pink/30 text-brand-coral-pink hover:bg-brand-coral-pink/10">
                    Write in Journal
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* Check-in Form */
          <Card className="mb-8 border-brand-light-gray bg-white/90 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="font-heading text-brand-charcoal">How are you feeling today?</CardTitle>
              <CardDescription className="font-inter">
                Take a moment to reflect on your relationship and personal wellbeing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Connection Score */}
              <div>
                <label className="block text-sm font-medium text-brand-charcoal mb-3 font-inter">
                  Connection with your partner (1-10)
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={checkinData.connection_score}
                    onChange={(e) => setCheckinData({ ...checkinData, connection_score: parseInt(e.target.value) })}
                    className="flex-1 h-3 bg-brand-light-gray rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #FF8A9B 0%, #4AB9B8 100%)`
                    }}
                  />
                  <div className="flex items-center space-x-2 min-w-[80px]">
                    {getConnectionIcon(checkinData.connection_score)}
                    <span className="text-lg font-bold text-brand-charcoal font-heading">
                      {checkinData.connection_score}/10
                    </span>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-brand-slate mt-1 font-inter">
                  <span>Distant</span>
                  <span>Very Connected</span>
                </div>
              </div>

              {/* Mood Score */}
              <div>
                <label className="block text-sm font-medium text-brand-charcoal mb-3 font-inter">
                  Overall mood today (1-10)
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={checkinData.mood_score}
                    onChange={(e) => setCheckinData({ ...checkinData, mood_score: parseInt(e.target.value) })}
                    className="flex-1 h-3 bg-brand-light-gray rounded-lg appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #FF8A9B 0%, #FFCB8A 50%, #4AB9B8 100%)`
                    }}
                  />
                  <div className="flex items-center space-x-2 min-w-[80px]">
                    {getMoodIcon(checkinData.mood_score)}
                    <span className="text-lg font-bold text-brand-charcoal font-heading">
                      {checkinData.mood_score}/10
                    </span>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-brand-slate mt-1 font-inter">
                  <span>Low</span>
                  <span>Great</span>
                </div>
              </div>

              {/* Gratitude Note */}
              <div>
                <label className="block text-sm font-medium text-brand-charcoal mb-2 font-inter">
                  What are you grateful for today? ✨
                </label>
                <Textarea
                  value={checkinData.gratitude_note}
                  onChange={(e) => setCheckinData({ ...checkinData, gratitude_note: e.target.value })}
                  placeholder="Express gratitude for something in your relationship or life..."
                  rows={3}
                  className="border-brand-light-gray focus:border-brand-teal focus:ring-brand-teal/20 resize-none"
                />
              </div>

              {/* Challenge Note */}
              <div>
                <label className="block text-sm font-medium text-brand-charcoal mb-2 font-inter">
                  Any challenges you're facing? 🤝
                </label>
                <Textarea
                  value={checkinData.challenge_note}
                  onChange={(e) => setCheckinData({ ...checkinData, challenge_note: e.target.value })}
                  placeholder="Share any difficulties or concerns (optional)..."
                  rows={3}
                  className="border-brand-light-gray focus:border-brand-teal focus:ring-brand-teal/20 resize-none"
                />
              </div>

              {/* Improvement Note */}
              <div>
                <label className="block text-sm font-medium text-brand-charcoal mb-2 font-inter">
                  What could make tomorrow better? 🚀
                </label>
                <Textarea
                  value={checkinData.improvement_note}
                  onChange={(e) => setCheckinData({ ...checkinData, improvement_note: e.target.value })}
                  placeholder="Ideas for improving your relationship or wellbeing..."
                  rows={3}
                  className="border-brand-light-gray focus:border-brand-teal focus:ring-brand-teal/20 resize-none"
                />
              </div>

              <div className="pt-4">
                <Button
                  onClick={submitCheckin}
                  disabled={submitting}
                  className="w-full bg-brand-teal hover:bg-brand-dark-teal text-white text-lg py-3"
                >
                  {submitting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Submitting...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Complete Daily Check-in
                    </div>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Check-ins */}
        {recentCheckins.length > 0 && (
          <Card className="border-brand-light-gray bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="font-heading text-brand-charcoal">Recent Check-ins</CardTitle>
                <Link href="/dashboard">
                  <Button variant="outline" size="sm" className="border-brand-teal/30 text-brand-teal hover:bg-brand-teal/10">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentCheckins.slice(0, 5).map((checkin) => (
                  <div key={checkin.id} className="flex items-center justify-between p-3 bg-brand-cool-gray rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-sm font-medium text-brand-charcoal font-inter">
                        {formatDate(checkin.created_at)}
                      </div>
                      <div className="flex items-center space-x-1">
                        {getConnectionIcon(checkin.connection_score)}
                        <span className="text-sm text-brand-slate font-inter">{checkin.connection_score}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {getMoodIcon(checkin.mood_score)}
                        <span className="text-sm text-brand-slate font-inter">{checkin.mood_score}</span>
                      </div>
                    </div>
                    {checkin.gratitude_note && (
                      <div className="text-xs text-brand-teal bg-brand-teal/10 px-2 py-1 rounded-full font-inter">
                        Gratitude
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}