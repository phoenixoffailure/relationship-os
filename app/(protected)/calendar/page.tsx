// STEP 3: Replace the ENTIRE contents of app/(protected)/calendar/page.tsx with this

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

interface OnboardingTimelineData {
  relationship_start_date?: string
  anniversary_date?: string
  relationship_duration_years?: number
  relationship_duration_months?: number
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
  dataSource: 'anniversary' | 'duration' | 'start_date' | 'database_fallback'
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
  const [onboardingData, setOnboardingData] = useState<OnboardingTimelineData | null>(null)
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
          loadOnboardingTimelineData(user.id),
          generateDateIdeas(user.id)
        ])
      }
      setLoading(false)
    }
    getUser()
  }, [])

  // Load onboarding timeline data
  const loadOnboardingTimelineData = async (userId: string) => {
    try {
      const { data: onboardingData, error } = await supabase
        .from('enhanced_onboarding_responses')
        .select('relationship_start_date, anniversary_date, relationship_duration_years, relationship_duration_months')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (onboardingData && !error) {
        console.log('📅 Loaded timeline data:', onboardingData)
        setOnboardingData(onboardingData)
      } else {
        console.log('📅 No timeline data found:', error?.message)
        setOnboardingData(null)
      }
    } catch (error) {
      console.error('Error loading onboarding timeline data:', error)
      setOnboardingData(null)
    }
  }

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
        
        // Generate milestones once we have both relationships and timeline data
        if (onboardingData !== undefined) { // Wait for timeline data to load
          generateMilestones(relationshipsList, onboardingData)
        }
      }
    } catch (error) {
      console.error('Error loading relationships:', error)
    }
  }

  // Updated milestone generation with real timeline data
  const generateMilestones = (relationships: Relationship[], timelineData: OnboardingTimelineData | null) => {
    console.log('🎯 Generating milestones with timeline data:', { relationships: relationships.length, hasTimelineData: !!timelineData })
    
    const milestonesData = relationships.map((rel: Relationship) => {
      let anniversaryDate: Date
      let dataSource: 'anniversary' | 'duration' | 'start_date' | 'database_fallback' = 'database_fallback'
      let yearsAgo = 0
      
      // Priority 1: Use anniversary_date from onboarding
      if (timelineData?.anniversary_date) {
        anniversaryDate = new Date(timelineData.anniversary_date)
        dataSource = 'anniversary'
        yearsAgo = Math.floor((new Date().getTime() - anniversaryDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25))
        console.log('📅 Using anniversary date:', anniversaryDate.toDateString(), 'Years ago:', yearsAgo)
        
      } 
      // Priority 2: Use relationship_start_date from onboarding
      else if (timelineData?.relationship_start_date) {
        anniversaryDate = new Date(timelineData.relationship_start_date)
        dataSource = 'start_date'
        yearsAgo = Math.floor((new Date().getTime() - anniversaryDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25))
        console.log('📅 Using start date:', anniversaryDate.toDateString(), 'Years ago:', yearsAgo)
        
      }
      // Priority 3: Calculate from duration data
      else if (timelineData?.relationship_duration_years || timelineData?.relationship_duration_months) {
        const totalMonths = (timelineData.relationship_duration_years || 0) * 12 + (timelineData.relationship_duration_months || 0)
        anniversaryDate = new Date()
        anniversaryDate.setMonth(anniversaryDate.getMonth() - totalMonths)
        dataSource = 'duration'
        yearsAgo = timelineData.relationship_duration_years || 0
        console.log('📅 Using duration calculation:', totalMonths, 'months, Years:', yearsAgo)
        
      }
      // Fallback: Use database created_at
      else {
        anniversaryDate = new Date(rel.created_at)
        dataSource = 'database_fallback'
        yearsAgo = Math.floor((new Date().getTime() - anniversaryDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25))
        console.log('⚠️ Using database fallback:', anniversaryDate.toDateString(), 'Years ago:', yearsAgo)
      }

      // Calculate next anniversary
      const nextAnniversary = getNextAnniversary(anniversaryDate)
      const daysUntil = Math.ceil((nextAnniversary.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

      return {
        id: `anniversary-${rel.id}`,
        title: `${rel.name} Anniversary${yearsAgo > 0 ? ` (${yearsAgo + 1} years)` : ''}`,
        date: anniversaryDate.toISOString(),
        type: 'anniversary',
        relationship_id: rel.id,
        isAnnual: true,
        nextDate: nextAnniversary,
        daysUntil: daysUntil,
        yearsAgo: yearsAgo,
        dataSource: dataSource
      }
    })

    console.log('🎯 Generated milestones:', milestonesData)
    setMilestones(milestonesData)
  }

  // Re-generate milestones when both relationships and timeline data are loaded
  useEffect(() => {
    if (relationships.length > 0 && onboardingData !== undefined) {
      generateMilestones(relationships, onboardingData)
    }
  }, [relationships, onboardingData])

  const getNextAnniversary = (originalDate: Date): Date => {
    const nextAnniversary = new Date(originalDate)
    const currentYear = new Date().getFullYear()
    
    // Set to current year
    nextAnniversary.setFullYear(currentYear)
    
    // If it's already passed this year, move to next year
    if (nextAnniversary < new Date()) {
      nextAnniversary.setFullYear(currentYear + 1)
    }
    
    return nextAnniversary
  }

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const getRelationshipStage = (relationship: Relationship): string => {
    if (!onboardingData) {
      // Fallback calculation using database timestamp
      const monthsAgo = Math.floor((new Date().getTime() - new Date(relationship.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30))
      if (monthsAgo < 6) return 'new'
      if (monthsAgo < 24) return 'developing'
      if (monthsAgo < 60) return 'established'
      return 'longterm'
    }

    // Use timeline data for accurate calculation
    let monthsOld = 0

    if (onboardingData.anniversary_date) {
      const anniversaryDate = new Date(onboardingData.anniversary_date)
      monthsOld = (new Date().getTime() - anniversaryDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
    } else if (onboardingData.relationship_duration_years || onboardingData.relationship_duration_months) {
      monthsOld = (onboardingData.relationship_duration_years || 0) * 12 + (onboardingData.relationship_duration_months || 0)
    } else if (onboardingData.relationship_start_date) {
      const startDate = new Date(onboardingData.relationship_start_date)
      monthsOld = (new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
    } else {
      // Final fallback to database timestamp
      monthsOld = (new Date().getTime() - new Date(relationship.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30.44)
    }

    if (monthsOld < 6) return 'new'
    if (monthsOld < 24) return 'developing'
    if (monthsOld < 60) return 'established'
    return 'longterm'
  }

  const generateDateIdeas = async (userId: string) => {
    // Generate contextual date ideas based on relationship stage and timeline
    const stage = relationships.length > 0 ? getRelationshipStage(relationships[0]) : 'new'
    
    const stageBasedIdeas: { [key: string]: DateIdea[] } = {
      new: [
        { title: "Coffee Date", description: "Simple coffee date to continue getting to know each other", category: "Casual", icon: "☕" },
        { title: "Walk in the Park", description: "Relaxed outdoor activity for meaningful conversation", category: "Outdoor", icon: "🌳" },
        { title: "Cooking Together", description: "Prepare a simple meal together and learn about each other's tastes", category: "Home", icon: "👨‍🍳" }
      ],
      developing: [
        { title: "Weekend Getaway", description: "Short trip to explore a new place together", category: "Adventure", icon: "🗺️" },
        { title: "Double Date", description: "Socialize with friends and see each other in different contexts", category: "Social", icon: "👥" },
        { title: "Try New Activity", description: "Take a class or try something neither of you has done before", category: "Learning", icon: "🎯" }
      ],
      established: [
        { title: "Date Night Routine", description: "Establish a regular weekly date night tradition", category: "Routine", icon: "📅" },
        { title: "Surprise Adventure", description: "Plan a surprise outing based on their interests", category: "Surprise", icon: "🎁" },
        { title: "Deep Conversation Night", description: "Set aside time for meaningful, uninterrupted conversation", category: "Connection", icon: "💬" }
      ],
      longterm: [
        { title: "Recreate First Date", description: "Revisit where you first met or had your first date", category: "Nostalgia", icon: "💕" },
        { title: "Dream Planning Session", description: "Discuss and plan future goals and dreams together", category: "Future", icon: "🌟" },
        { title: "Appreciation Evening", description: "Share what you're most grateful for in your relationship", category: "Gratitude", icon: "🙏" }
      ]
    }

    // Use type assertion to ensure stage is valid, with fallback
    const validStage = (['new', 'developing', 'established', 'longterm'].includes(stage)) ? stage : 'new'
    setDateIdeas(stageBasedIdeas[validStage])
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your relationship calendar...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Relationship Calendar</h1>
              <p className="mt-1 text-sm text-gray-500">Important dates and milestone planning</p>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="outline">Dashboard</Button>
              </Link>
              <Button variant="outline" onClick={handleLogout}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          {/* Timeline Data Source Info */}
          {onboardingData && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Timeline Data Source</h3>
              <div className="text-sm text-blue-700">
                {onboardingData.anniversary_date && (
                  <p>✅ Using your anniversary date: {new Date(onboardingData.anniversary_date).toLocaleDateString()}</p>
                )}
                {!onboardingData.anniversary_date && onboardingData.relationship_start_date && (
                  <p>✅ Using your relationship start date: {new Date(onboardingData.relationship_start_date).toLocaleDateString()}</p>
                )}
                {!onboardingData.anniversary_date && !onboardingData.relationship_start_date && (onboardingData.relationship_duration_years || onboardingData.relationship_duration_months) && (
                  <p>✅ Using your duration: {onboardingData.relationship_duration_years || 0} years, {onboardingData.relationship_duration_months || 0} months</p>
                )}
              </div>
            </div>
          )}

          {!onboardingData && relationships.length > 0 && (
            <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-yellow-900 mb-2">Timeline Data Missing</h3>
              <p className="text-sm text-yellow-700">
                ⚠️ Using database creation dates. For accurate relationship stages, please complete your onboarding with anniversary information.
              </p>
              <Link href="/onboarding">
                <Button size="sm" className="mt-2">Update Timeline Info</Button>
              </Link>
            </div>
          )}

          {/* Upcoming Milestones */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Upcoming Milestones</h3>
              
              {milestones.length > 0 ? (
                <div className="space-y-4">
                  {milestones
                    .filter(milestone => milestone.daysUntil && milestone.daysUntil <= 90)
                    .sort((a, b) => (a.daysUntil || 0) - (b.daysUntil || 0))
                    .map((milestone) => (
                      <div key={milestone.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <span className="text-2xl">💕</span>
                          <div>
                            <h4 className="font-semibold text-gray-900">{milestone.title}</h4>
                            <p className="text-sm text-gray-600">
                              {milestone.nextDate && formatDate(milestone.nextDate)}
                              {milestone.dataSource === 'database_fallback' && (
                                <span className="ml-2 text-yellow-600">(estimated from database)</span>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-purple-600">
                            {milestone.daysUntil} days
                          </div>
                          <div className="text-sm text-gray-500">until anniversary</div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <p>No upcoming milestones in the next 90 days</p>
                </div>
              )}
            </div>
          </div>

          {/* Relationship Timeline */}
          <div className="bg-white shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">Relationship Timeline</h3>
              
              <div className="space-y-6">
                {relationships.map((relationship) => {
                  const milestone = milestones.find(m => m.relationship_id === relationship.id)
                  const stage = getRelationshipStage(relationship)
                  const stageColors: { [key: string]: string } = {
                    'new': 'bg-green-100 text-green-800',
                    'developing': 'bg-blue-100 text-blue-800', 
                    'established': 'bg-purple-100 text-purple-800',
                    'longterm': 'bg-yellow-100 text-yellow-800'
                  }
                  
                  return (
                    <div key={relationship.id} className="border-l-4 border-purple-300 pl-6">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className="text-2xl">💕</span>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{relationship.name}</h4>
                          <p className="text-sm text-gray-600">
                            {milestone ? (
                              <>
                                Started {formatDate(new Date(milestone.date))} • {milestone.yearsAgo || 0} years ago
                                {milestone.dataSource === 'database_fallback' && (
                                  <span className="ml-2 text-yellow-600">(estimated)</span>
                                )}
                              </>
                            ) : (
                              `Created ${formatDate(new Date(relationship.created_at))}`
                            )}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${stageColors[stage] || 'bg-gray-100 text-gray-800'}`}>
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
          </div>

          {/* Date Ideas Based on Relationship Stage */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Date Ideas for Your Relationship Stage
              </h3>
              
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {dateIdeas.map((idea, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl">{idea.icon}</span>
                      <div>
                        <h4 className="font-semibold text-gray-900">{idea.title}</h4>
                        <span className="text-xs text-purple-600 font-medium">{idea.category}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">{idea.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}