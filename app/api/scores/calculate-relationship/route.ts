// app/api/scores/calculate-relationship/route.ts
// Phase 7.2: Relationship-specific score calculation
// Replace universal romantic metrics with relationship-appropriate ones

import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { RelationshipType } from '@/lib/ai/relationship-type-intelligence'
import { 
  calculateRelationshipHealthScore,
  getRelationshipMetrics,
  migrateUniversalToRelationshipMetrics
} from '@/lib/metrics/relationship-metrics'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { relationshipId, userId, relationshipType } = body
    
    if (!relationshipId || !relationshipType) {
      return NextResponse.json({ 
        error: 'Missing relationshipId or relationshipType' 
      }, { status: 400 })
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

    console.log(`🔄 Phase 7.2: Calculating ${relationshipType} relationship health score for user: ${currentUserId}`)

    // Get relationship-specific check-ins (last 30 days for current calculation)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data: relationshipCheckins, error: checkinsError } = await supabase
      .from('relationship_checkins')
      .select('*')
      .eq('user_id', currentUserId)
      .eq('relationship_id', relationshipId)
      .eq('relationship_type', relationshipType)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })

    if (checkinsError) {
      console.error('❌ Error fetching relationship check-ins:', checkinsError)
      
      // Fallback to legacy check-ins and migrate
      return await fallbackToLegacyCheckins(
        supabase, 
        currentUserId, 
        relationshipId, 
        relationshipType as RelationshipType
      )
    }

    const checkins = relationshipCheckins || []
    console.log(`📊 Found ${checkins.length} relationship-specific check-ins for ${relationshipType} relationship`)

    if (checkins.length === 0) {
      console.log('📊 No relationship-specific check-ins found, falling back to legacy system')
      return await fallbackToLegacyCheckins(
        supabase, 
        currentUserId, 
        relationshipId, 
        relationshipType as RelationshipType
      )
    }

    // Calculate relationship-specific health score
    const relationshipConfig = getRelationshipMetrics(relationshipType as RelationshipType)
    
    // Aggregate recent metric values (average of last 7 check-ins or all if less)
    const recentCheckins = checkins.slice(0, 7)
    const aggregatedMetrics: Record<string, number> = {}

    // Calculate averages for each metric
    relationshipConfig.primaryMetrics.forEach(metric => {
      const values = recentCheckins
        .map(checkin => checkin.metric_values?.[metric.name])
        .filter(value => value !== undefined && value !== null)
        .map(value => Number(value))

      if (values.length > 0) {
        aggregatedMetrics[metric.name] = values.reduce((sum, val) => sum + val, 0) / values.length
      }
    })

    relationshipConfig.secondaryMetrics.forEach(metric => {
      const values = recentCheckins
        .map(checkin => checkin.metric_values?.[metric.name])
        .filter(value => value !== undefined && value !== null)
        .map(value => Number(value))

      if (values.length > 0) {
        aggregatedMetrics[metric.name] = values.reduce((sum, val) => sum + val, 0) / values.length
      }
    })

    console.log(`📊 Aggregated metrics for ${relationshipType}:`, aggregatedMetrics)

    // Calculate relationship health score
    const healthScore = calculateRelationshipHealthScore(
      relationshipType as RelationshipType,
      aggregatedMetrics
    )

    // Calculate trends (last 7 vs previous 7)
    const previousCheckins = checkins.slice(7, 14)
    let trendData: Record<string, { current: number; previous: number; trend: 'up' | 'down' | 'stable' }> = {}

    relationshipConfig.primaryMetrics.forEach(metric => {
      const currentValues = recentCheckins
        .map(c => c.metric_values?.[metric.name])
        .filter(v => v !== undefined)
        .map(v => Number(v))
      
      const previousValues = previousCheckins
        .map(c => c.metric_values?.[metric.name])
        .filter(v => v !== undefined)
        .map(v => Number(v))

      if (currentValues.length > 0) {
        const currentAvg = currentValues.reduce((s, v) => s + v, 0) / currentValues.length
        const previousAvg = previousValues.length > 0 
          ? previousValues.reduce((s, v) => s + v, 0) / previousValues.length 
          : currentAvg

        const diff = currentAvg - previousAvg
        let trend: 'up' | 'down' | 'stable' = 'stable'
        if (diff > 0.5) trend = 'up'
        else if (diff < -0.5) trend = 'down'

        trendData[metric.name] = {
          current: Math.round(currentAvg * 10) / 10,
          previous: Math.round(previousAvg * 10) / 10,
          trend
        }
      }
    })

    // Save calculated score and trends
    const scoreData = {
      user_id: currentUserId,
      relationship_id: relationshipId,
      relationship_type: relationshipType,
      health_score: healthScore,
      metric_scores: aggregatedMetrics,
      trend_data: trendData,
      calculation_date: new Date().toISOString(),
      checkins_analyzed: recentCheckins.length
    }

    const { error: saveError } = await supabase
      .from('relationship_health_scores')
      .upsert([scoreData], {
        onConflict: 'user_id,relationship_id',
        ignoreDuplicates: false
      })

    if (saveError) {
      console.error('❌ Error saving relationship health score:', saveError)
    }

    console.log(`✅ Phase 7.2: Calculated ${relationshipType} health score: ${healthScore}/100`)

    return NextResponse.json({
      success: true,
      relationshipType,
      healthScore,
      metricScores: aggregatedMetrics,
      trends: trendData,
      checkinsAnalyzed: recentCheckins.length,
      message: `${relationshipConfig.displayName} health score calculated successfully`
    })

  } catch (error) {
    console.error('❌ Phase 7.2: Relationship score calculation error:', error)
    
    return NextResponse.json({ 
      error: 'Relationship score calculation failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Fallback function for when no relationship-specific check-ins exist
async function fallbackToLegacyCheckins(
  supabase: any,
  userId: string,
  relationshipId: string,
  relationshipType: RelationshipType
) {
  console.log('📊 Phase 7.2: Migrating from legacy universal metrics...')

  // Get legacy check-ins
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: legacyCheckins, error: legacyError } = await supabase
    .from('daily_checkins')
    .select('connection_score, mood_score, created_at')
    .eq('user_id', userId)
    .eq('relationship_id', relationshipId)
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: false })
    .limit(7)

  if (legacyError || !legacyCheckins || legacyCheckins.length === 0) {
    console.log('📊 No legacy check-ins found either')
    
    return NextResponse.json({
      success: true,
      relationshipType,
      healthScore: 50, // Default neutral score
      metricScores: {},
      trends: {},
      checkinsAnalyzed: 0,
      message: `No check-in data available for ${relationshipType} relationship. Start checking in to see your relationship health score!`
    })
  }

  // Migrate legacy metrics to relationship-specific metrics
  const avgConnectionScore = legacyCheckins.reduce((sum, c) => sum + (c.connection_score || 5), 0) / legacyCheckins.length
  const avgMoodScore = legacyCheckins.reduce((sum, c) => sum + (c.mood_score || 5), 0) / legacyCheckins.length

  const migratedMetrics = migrateUniversalToRelationshipMetrics(
    avgConnectionScore,
    avgMoodScore,
    relationshipType
  )

  const healthScore = calculateRelationshipHealthScore(relationshipType, migratedMetrics)

  console.log(`✅ Phase 7.2: Migrated legacy metrics for ${relationshipType}: ${healthScore}/100`)

  return NextResponse.json({
    success: true,
    relationshipType,
    healthScore,
    metricScores: migratedMetrics,
    trends: {},
    checkinsAnalyzed: legacyCheckins.length,
    migrated: true,
    message: `Migrated from legacy metrics to ${relationshipType}-specific scoring`
  })
}

// GET endpoint for manual testing
export async function GET(request: Request) {
  const url = new URL(request.url)
  const relationshipId = url.searchParams.get('relationshipId')
  const relationshipType = url.searchParams.get('relationshipType')
  const userId = url.searchParams.get('userId')
  
  if (!relationshipId || !relationshipType) {
    return NextResponse.json({ 
      error: 'Missing relationshipId or relationshipType parameter' 
    }, { status: 400 })
  }

  return POST(new Request(request.url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ relationshipId, relationshipType, userId })
  }))
}