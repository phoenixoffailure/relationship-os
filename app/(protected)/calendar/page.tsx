'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createBrowserClient } from '@supabase/ssr'

interface Relationship {
  id: string
  name: string
  relationship_type: string
  created_at: string
}

interface Milestone {
  id: string
  title: string
  date: string
  type: string
  relationship_id: string
  isAnnual: boolean
  nextDate?: Date
  daysUntil?: number
  yearsAgo?: number
}

interface DateIdea {
  title: string
  description: string
  category: string
  icon: string
}

export default function CalendarPage() {
  const [user, setUser] = useState<any>(null)
  const [relationships, setRelationships] = useState<Relationship[]>([])
  const [milestones, setMilestones] = useState<Milestone[]>([])
  const [dateIdeas, setDateIdeas] = useState<DateIdea[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        await Promise.all([
          loadRelationships(user.id),
          loadMilestones(user.id),
          generateDateIdeas(user.id)
        ])
      }
      setLoading(false)
    }
    getUser()
  }, [])

  const loadRelationships = async (userId: string) => {
    try {
      const { data: relationshipData, error } = await supabase
        .from('relationship_members')
        .select(`
          relationship_id,
          role,
          relationships (
            id,
            name,
            relationship_type,
            created_at
          )
        `)
        .eq('user_id', userId)

      if (relationshipData && !error) {
        const relationshipsList = relationshipData
          .map((r: any) => r.relationships)
          .filter((rel: any) => rel !== null) as Relationship[]
        setRelationships(relationshipsList)
      }
    } catch (error) {
      console.error('Error loading relationships:', error)
    }
  }

  const loadMilestones = async (userId: string) => {
    try {
      const milestonesData = relationships.map((rel: Relationship) => ({
        id: `anniversary-${rel.id}`,
        title: `${rel.name} Anniversary`,
        date: rel.created_at,
        type: 'anniversary',
        relationship_id: rel.id,
        isAnnual: true
      }))
      
      setMilestones(milestonesData)
    } catch (error) {
      console.error('Error loading milestones:', error)
    }
  }

  const generateDateIdeas = async (userId: string) => {
    try {
      const { data: onboardingData } = await supabase
        .from('onboarding_responses')
        .select('responses')
        .eq('user_id', userId)
        .single()

      const responses = onboardingData?.responses || {}
      const relationshipStage = getRelationshipStage(relationships[0])
      
      const ideas = generatePersonalizedDateIdeas(relationshipStage, responses)
      setDateIdeas(ideas)
    } catch (error) {
      console.error('Error generating date ideas:', error)
    }
  }

  const getRelationshipStage = (relationship: Relationship | undefined): string => {
    if (!relationship) return 'single'
    
    const monthsOld = (new Date().getTime() - new Date(relationship.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30)
    
    if (monthsOld < 6) return 'new'
    if (monthsOld < 24) return 'developing'
    if (monthsOld < 60) return 'established'
    return 'longterm'
  }

  const generatePersonalizedDateIdeas = (stage: string, responses: any): DateIdea[] => {
    const baseIdeas: { [key: string]: DateIdea[] } = {
      new: [
        { title: 'Coffee Shop Conversation', description: 'Get to know each other better over coffee', category: 'low-key', icon: '☕' },
        { title: 'Local Market Stroll', description: 'Walk through a farmers market or local shops', category: 'activity', icon: '🛍️' },
        { title: 'Picnic in the Park', description: 'Simple outdoor meal together', category: 'outdoor', icon: '🧺' },
        { title: 'Museum Visit', description: 'Explore art or history together', category: 'cultural', icon: '🏛️' }
      ],
      developing: [
        { title: 'Cooking Class Together', description: 'Learn something new as a team', category: 'activity', icon: '👨‍🍳' },
        { title: 'Weekend Getaway', description: 'Short trip to nearby city or nature spot', category: 'adventure', icon: '🗺️' },
        { title: 'Game Night', description: 'Board games or video games at home', category: 'home', icon: '🎮' },
        { title: 'Hiking Adventure', description: 'Explore nature trails together', category: 'outdoor', icon: '🥾' }
      ],
      established: [
        { title: 'Couples Spa Day', description: 'Relax and reconnect together', category: 'relaxation', icon: '💆‍♀️' },
        { title: 'Wine Tasting', description: 'Try new wines and enjoy each other\'s company', category: 'experiential', icon: '🍷' },
        { title: 'Dance Lessons', description: 'Learn a new skill together', category: 'activity', icon: '💃' },
        { title: 'Sunset Dinner', description: 'Romantic dinner with a view', category: 'romantic', icon: '🌅' }
      ],
      longterm: [
        { title: 'Recreation of First Date', description: 'Revisit where it all began', category: 'nostalgic', icon: '💕' },
        { title: 'Surprise Weekend Trip', description: 'Plan a surprise for your partner', category: 'adventure', icon: '✈️' },
        { title: 'Professional Photoshoot', description: 'Capture your love professionally', category: 'memorable', icon: '📸' },
        { title: 'Volunteer Together', description: 'Give back to the community as a team', category: 'meaningful', icon: '🤝' }
      ]
    }

    const stageIdeas = baseIdeas[stage] || baseIdeas.developing

    // Customize based on love languages
    const customIdeas = [...stageIdeas]
    
    if (responses.loveLanguageReceive?.includes('time')) {
      customIdeas.push({
        title: 'Device-Free Evening',
        description: 'Undivided attention and quality conversation',
        category: 'quality-time',
        icon: '📵'
      })
    }

    if (responses.loveLanguageReceive?.includes('acts')) {
      customIdeas.push({
        title: 'Plan Each Other\'s Day',
        description: 'Take care of tasks for each other',
        category: 'service',
        icon: '📝'
      })
    }

    return customIdeas.slice(0, 6)
  }

  const getUpcomingMilestones = (): (Milestone & { nextDate: Date; daysUntil: number; yearsAgo: number })[] => {
    const upcoming: (Milestone & { nextDate: Date; daysUntil: number; yearsAgo: number })[] = []
    const today = new Date()
    
    milestones.forEach(milestone => {
      if (milestone.isAnnual) {
        const originalDate = new Date(milestone.date)
        const thisYear = new Date(today.getFullYear(), originalDate.getMonth(), originalDate.getDate())
        const nextYear = new Date(today.getFullYear() + 1, originalDate.getMonth(), originalDate.getDate())
        
        const nextOccurrence = thisYear > today ? thisYear : nextYear
        const daysUntil = Math.ceil((nextOccurrence.getTime() - today.getTime()) / (24 * 60 * 60 * 1000))
        
        if (daysUntil <= 60) {
          upcoming.push({
            ...milestone,
            nextDate: nextOccurrence,
            daysUntil,
            yearsAgo: today.getFullYear() - originalDate.getFullYear()
          })
        }
      }
    })
    
    return upcoming.sort((a, b) => a.daysUntil - b.daysUntil)
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    })
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'low-key': 'bg-blue-100 text-blue-800',
      'activity': 'bg-green-100 text-green-800',
      'outdoor': 'bg-emerald-100 text-emerald-800',
      'cultural': 'bg-purple-100 text-purple-800',
      'home': 'bg-orange-100 text-orange-800',
      'adventure': 'bg-red-100 text-red-800',
      'relaxation': 'bg-pink-100 text-pink-800',
      'experiential': 'bg-indigo-100 text-indigo-800',
      'romantic': 'bg-rose-100 text-rose-800',
      'nostalgic': 'bg-amber-100 text-amber-800',
      'memorable': 'bg-violet-100 text-violet-800',
      'meaningful': 'bg-teal-100 text-teal-800',
      'quality-time': 'bg-cyan-100 text-cyan-800',
      'service': 'bg-lime-100 text-lime-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const upcomingMilestones = getUpcomingMilestones()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-calm-50 to-mint-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-calm-300 border-t-calm-600 rounded-full animate-spin"></div>
      </div>
    )
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
              <Link href="/journal" className="text-gray-600 hover:text-gray-700">
                Journal
              </Link>
              <Link href="/checkin" className="text-gray-600 hover:text-gray-700">
                Check-In
              </Link>
              <Link href="/insights" className="text-gray-600 hover:text-gray-700">
                Insights
              </Link>
              <Link href="/relationships" className="text-gray-600 hover:text-gray-700">
                Relationships
              </Link>
              <Link href="/cycle" className="text-gray-600 hover:text-gray-700">
                Cycle Tracker
              </Link>
              <Link href="/calendar" className="text-purple-700 hover:text-purple-800 font-medium">
                Calendar
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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">Relationship Calendar</h2>
              <p className="text-gray-600 mt-2">
                Track milestones and discover new ways to connect
              </p>
            </div>
          </div>

          {/* Success/Error Messages */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.includes('Error') || message.includes('error') 
                ? 'bg-red-50 text-red-700 border border-red-200' 
                : 'bg-purple-50 text-purple-700 border border-purple-200'
            }`}>
              {message}
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upcoming Milestones */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Upcoming Milestones</h3>
            
            {relationships.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <p className="text-gray-500 mb-2">No relationships connected</p>
                <p className="text-sm text-gray-400 mb-4">Connect with your partner to track milestones together</p>
                <Link href="/relationships">
                  <Button className="bg-purple-600 hover:bg-purple-700">
                    Connect with Partner
                  </Button>
                </Link>
              </div>
            ) : upcomingMilestones.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-500">No upcoming milestones in the next 60 days</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingMilestones.map((milestone) => (
                  <div key={milestone.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">🎉</span>
                        <div>
                          <h4 className="font-semibold text-gray-900">{milestone.title}</h4>
                          <p className="text-sm text-gray-600">
                            {formatDate(milestone.nextDate)} • {milestone.yearsAgo > 0 ? `${milestone.yearsAgo} year anniversary` : 'First year!'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
                          {milestone.daysUntil === 0 ? 'Today!' : 
                           milestone.daysUntil === 1 ? 'Tomorrow' : 
                           `${milestone.daysUntil} days`}
                        </div>
                      </div>
                    </div>
                    
                    {milestone.daysUntil <= 7 && (
                      <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                        <p className="text-sm text-purple-800">
                          💡 <strong>Suggestion:</strong> Plan something special! This is a perfect time for a romantic dinner or recreating your first date.
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Date Ideas */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Personalized Date Ideas</h3>
              <Button 
                onClick={() => generateDateIdeas(user?.id)}
                size="sm"
                variant="outline"
                className="border-purple-300 text-purple-700"
              >
                🔄 Refresh Ideas
              </Button>
            </div>
            
            {relationships.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <p className="text-gray-500 mb-2">Connect with your partner</p>
                <p className="text-sm text-gray-400">Get personalized date ideas based on your relationship stage and preferences</p>
              </div>
            ) : (
              <div className="space-y-4">
                {dateIdeas.map((idea, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{idea.icon}</span>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{idea.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{idea.description}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(idea.category)}`}>
                        {idea.category.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
                
                <div className="text-center pt-4">
                  <p className="text-sm text-gray-500">
                    💡 Ideas are personalized based on your relationship stage and love languages
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Relationship Timeline (if connected) */}
        {relationships.length > 0 && (
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Relationship Timeline</h3>
            
            <div className="space-y-6">
              {relationships.map((relationship) => {
                const startDate = new Date(relationship.created_at)
                const monthsAgo = Math.floor((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30))
                const stage = getRelationshipStage(relationship)
                
                return (
                  <div key={relationship.id} className="border-l-4 border-purple-300 pl-6">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl">💕</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">{relationship.name}</h4>
                        <p className="text-sm text-gray-600">
                          Started {formatDate(startDate)} • {monthsAgo} months ago
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        stage === 'new' ? 'bg-green-100 text-green-800' :
                        stage === 'developing' ? 'bg-blue-100 text-blue-800' :
                        stage === 'established' ? 'bg-purple-100 text-purple-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {stage} relationship
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      <p>
                        {stage === 'new' && 'You\'re in the exciting early phase! Focus on getting to know each other and building trust.'}
                        {stage === 'developing' && 'Your relationship is growing stronger. This is a great time to deepen your connection and navigate challenges together.'}
                        {stage === 'established' && 'You have a solid foundation! Focus on maintaining intimacy and continuing to grow together.'}
                        {stage === 'longterm' && 'Congratulations on your lasting partnership! Keep the romance alive and celebrate your journey together.'}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Privacy Notice */}
        <div className="mt-8 bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-start space-x-3">
            <svg className="w-6 h-6 text-purple-600 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <div>
              <h4 className="font-semibold text-gray-900 mb-1">Relationship Milestones</h4>
              <p className="text-gray-600 text-sm">
                Milestone dates are shared with connected partners to help you both remember important occasions. 
                Personal notes and details remain private unless you choose to share them.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}