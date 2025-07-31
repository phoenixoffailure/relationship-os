// app/api/scores/calculate/route.ts
import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { relationshipId, userId } = body
    
    // Support both old format (just relationshipId) and new format (userId + relationshipId)
    if (!userId && !relationshipId) {
      return NextResponse.json({ error: 'Missing userId or relationshipId' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { 
        cookies: { 
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )
    
    // Get current user if not provided
    let currentUserId = userId
    if (!currentUserId) {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
      }
      currentUserId = user.id
    }

    console.log(`🔄 Calculating enhanced connection score for user: ${currentUserId}`)

    // Fetch comprehensive check-in data (last 90 days for trend analysis)
    const { data: checkins, error: checkinsError } = await supabase
      .from('daily_checkins')
      .select('*')
      .eq('user_id', currentUserId)
      .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false })

    if (checkinsError) {
      console.error('Error fetching check-ins:', checkinsError)
      return NextResponse.json({ error: 'Failed to fetch check-in data' }, { status: 500 })
    }

    if (!checkins || checkins.length === 0) {
      return NextResponse.json({
        score: 50,
        trend: 'stable',
        components: {
          connection: 50,
          consistency: 50,
          positivity: 50,
          growth: 50
        },
        analytics: {
          weeklyTrend: 0,
          monthlyTrend: 0,
          streakDays: 0,
          totalCheckins: 0,
          avgDailyMood: 5,
          avgConnection: 5,
          gratitudeFrequency: 0,
          challengeAwareness: 0,
          recentActivity: 0,
          consistencyRating: 'Getting Started'
        },
        insights: ['Start with your first check-in to see your personalized score!']
      })
    }

    // Advanced Score Calculation Algorithm
    const enhancedScore = calculateEnhancedConnectionScore(checkins)
    
    // Save the calculated score to connection_scores table (optional)
    try {
      await supabase
        .from('connection_scores')
        .upsert({
          relationship_id: relationshipId,
          score: enhancedScore.score,
          factors: {
            components: enhancedScore.components,
            analytics: enhancedScore.analytics,
            trend: enhancedScore.trend
          },
          calculated_at: new Date().toISOString()
        })
    } catch (saveError) {
      console.log('Note: Could not save to connection_scores table (table may not exist)')
    }

    console.log(`✅ Enhanced score calculated: ${enhancedScore.score}/100`)
    return NextResponse.json(enhancedScore)

  } catch (error) {
    console.error('Error in enhanced score calculation:', error)
    return NextResponse.json({ error: 'Failed to calculate enhanced scores' }, { status: 500 })
  }
}

function calculateEnhancedConnectionScore(checkins: any[]) {
  // Time-based data segmentation
  const last7Days = filterByDays(checkins, 7)
  const last30Days = filterByDays(checkins, 30)
  const previous7Days = filterByDays(checkins, 14).slice(7) // Days 8-14
  const previous30Days = filterByDays(checkins, 60).slice(30) // Days 31-60

  // 1. CONNECTION COMPONENT (40% weight)
  const connectionScore = calculateWeightedConnectionScore(checkins)
  
  // 2. CONSISTENCY COMPONENT (25% weight)
  const consistencyScore = calculateConsistencyScore(checkins)
  
  // 3. POSITIVITY COMPONENT (25% weight)
  const positivityScore = calculatePositivityScore(checkins)
  
  // 4. GROWTH COMPONENT (10% weight)
  const growthScore = calculateGrowthScore(checkins, last7Days, previous7Days)

  // COMPOSITE SCORE CALCULATION
  const rawScore = (
    connectionScore * 0.40 +
    consistencyScore * 0.25 +
    positivityScore * 0.25 +
    growthScore * 0.10
  )

  // Apply engagement bonus (up to +5 points for highly active users)
  const engagementBonus = Math.min(5, checkins.length * 0.2)
  const finalScore = Math.min(100, Math.max(10, Math.round(rawScore + engagementBonus)))

  // TREND ANALYSIS
  const weeklyTrend = calculateTrendChange(last7Days, previous7Days, 'connection_score')
  const monthlyTrend = calculateTrendChange(last30Days, previous30Days, 'connection_score')
  
  const trend = determineTrendCategory(weeklyTrend, monthlyTrend)

  // STREAK CALCULATION
  const streakDays = calculateCheckInStreak(checkins)

  // DETAILED ANALYTICS
  const analytics = {
    weeklyTrend: Math.round(weeklyTrend * 100) / 100,
    monthlyTrend: Math.round(monthlyTrend * 100) / 100,
    streakDays,
    totalCheckins: checkins.length,
    avgDailyMood: calculateAverage(checkins, 'mood_score'),
    avgConnection: calculateAverage(checkins, 'connection_score'),
    gratitudeFrequency: (checkins.filter(c => c.gratitude_note?.trim()).length / checkins.length) * 100,
    challengeAwareness: (checkins.filter(c => c.challenge_note?.trim()).length / checkins.length) * 100,
    recentActivity: last7Days.length,
    consistencyRating: getConsistencyRating(consistencyScore)
  }

  return {
    score: finalScore,
    trend,
    components: {
      connection: Math.round(connectionScore),
      consistency: Math.round(consistencyScore), 
      positivity: Math.round(positivityScore),
      growth: Math.round(growthScore)
    },
    analytics,
    insights: generateScoreInsights(finalScore, trend, analytics)
  }
}

// HELPER FUNCTIONS FOR SCORE CALCULATION

function filterByDays(checkins: any[], days: number) {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
  return checkins.filter(c => new Date(c.created_at) >= cutoff)
}

function calculateWeightedConnectionScore(checkins: any[]) {
  if (checkins.length === 0) return 50

  // Apply recency weighting - more recent scores matter more
  let weightedSum = 0
  let totalWeight = 0
  
  checkins.forEach((checkin) => {
    const daysSinceCheckin = (Date.now() - new Date(checkin.created_at).getTime()) / (1000 * 60 * 60 * 24)
    const weight = Math.exp(-daysSinceCheckin / 14) // Exponential decay over 14 days
    
    weightedSum += (checkin.connection_score || 5) * weight * 10 // Convert to 100-point scale
    totalWeight += weight
  })
  
  return totalWeight > 0 ? weightedSum / totalWeight : 50
}

function calculateConsistencyScore(checkins: any[]) {
  if (checkins.length === 0) return 50
  
  const last30Days = filterByDays(checkins, 30)
  const uniqueDays = new Set(last30Days.map(c => new Date(c.created_at).toDateString())).size
  
  // Perfect consistency = 30 days, scale to 100 points
  const consistencyRatio = Math.min(uniqueDays / 30, 1)
  
  // Bonus for streaks
  const streakBonus = Math.min(calculateCheckInStreak(checkins) * 2, 20)
  
  return Math.min(100, (consistencyRatio * 80) + streakBonus)
}

function calculatePositivityScore(checkins: any[]) {
  if (checkins.length === 0) return 50
  
  // Mood component (70% of positivity score)
  const avgMood = calculateAverage(checkins, 'mood_score') * 10 // Scale to 100
  
  // Gratitude component (30% of positivity score)
  const gratitudeFreq = checkins.filter(c => c.gratitude_note?.trim()).length / checkins.length
  const gratitudeScore = gratitudeFreq * 100
  
  return (avgMood * 0.7) + (gratitudeScore * 0.3)
}

function calculateGrowthScore(allCheckins: any[], recent: any[], previous: any[]) {
  if (recent.length === 0 || previous.length === 0) return 60 // Neutral growth
  
  const recentAvg = calculateAverage(recent, 'connection_score')
  const previousAvg = calculateAverage(previous, 'connection_score')
  
  const improvement = recentAvg - previousAvg
  
  // Scale improvement to 0-100 range (centered at 60)
  const growthScore = 60 + (improvement * 20) // Each point improvement = 20 growth points
  
  return Math.min(100, Math.max(10, growthScore))
}

function calculateTrendChange(recent: any[], previous: any[], field: string) {
  if (recent.length === 0 || previous.length === 0) return 0
  
  const recentAvg = calculateAverage(recent, field)
  const previousAvg = calculateAverage(previous, field)
  
  return recentAvg - previousAvg
}

function determineTrendCategory(weeklyTrend: number, monthlyTrend: number): 'improving' | 'declining' | 'stable' {
  const combinedTrend = (weeklyTrend * 0.7) + (monthlyTrend * 0.3)
  
  if (combinedTrend > 0.5) return 'improving'
  if (combinedTrend < -0.5) return 'declining'
  return 'stable'
}

function calculateCheckInStreak(checkins: any[]) {
  if (checkins.length === 0) return 0
  
  const sortedDates = checkins
    .map(c => new Date(c.created_at).toDateString())
    .filter((date, index, arr) => arr.indexOf(date) === index) // Remove duplicates
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
  
  let streak = 0
  
  for (let i = 0; i < sortedDates.length; i++) {
    const expectedDate = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toDateString()
    if (sortedDates[i] === expectedDate) {
      streak++
    } else {
      break
    }
  }
  
  return streak
}

function calculateAverage(data: any[], field: string) {
  if (data.length === 0) return 5
  
  const values = data.map(item => item[field]).filter(val => val != null)
  return values.length > 0 ? values.reduce((sum, val) => sum + val, 0) / values.length : 5
}

function getConsistencyRating(score: number) {
  if (score >= 90) return 'Excellent'
  if (score >= 75) return 'Good'
  if (score >= 60) return 'Fair'
  return 'Needs Improvement'
}

function generateScoreInsights(score: number, trend: string, analytics: any) {
  const insights = []
  
  if (score >= 85) {
    insights.push("🌟 Outstanding relationship health! Your connection is thriving.")
  } else if (score >= 70) {
    insights.push("💚 Strong relationship foundation with room for growth.")
  } else if (score >= 55) {
    insights.push("🌱 Building positive momentum - keep up the daily check-ins!")
  } else {
    insights.push("🎯 Focus on consistency to strengthen your connection.")
  }
  
  if (trend === 'improving') {
    insights.push("📈 Your relationship is on an upward trajectory!")
  } else if (trend === 'declining') {
    insights.push("⚠️ Consider what might help reconnect and communicate more.")
  }
  
  if (analytics.streakDays >= 7) {
    insights.push(`🔥 Amazing ${analytics.streakDays}-day check-in streak!`)
  }
  
  if (analytics.gratitudeFrequency >= 60) {
    insights.push("🙏 Your gratitude practice is strengthening your relationship.")
  }
  
  return insights
}