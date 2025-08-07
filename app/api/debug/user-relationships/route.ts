import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      // Try to get current user from auth
      const authHeader = request.headers.get('authorization')
      if (!authHeader) {
        return NextResponse.json({
          error: 'Please provide userId parameter or auth header',
          example: '/api/debug/user-relationships?userId=YOUR_USER_ID',
          help: 'You can find your user ID in browser dev tools > Application > Local Storage > supabase.auth.token'
        }, { status: 400 })
      }
    }

    console.log(`🔍 Getting relationships for user: ${userId}`)

    // Get user's relationships
    const { data: membershipData, error: relationshipsError } = await supabase
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

    if (relationshipsError) {
      return NextResponse.json({
        error: 'Failed to fetch relationships',
        details: relationshipsError
      }, { status: 500 })
    }

    const relationships = (membershipData || [])
      .filter(member => member.relationships !== null)
      .map(member => ({
        id: member.relationships!.id,
        name: member.relationships!.name,
        type: member.relationships!.relationship_type,
        role: member.role,
        created_at: member.relationships!.created_at
      }))

    // Get some recent activity for context
    const { data: recentJournals } = await supabase
      .from('journal_entries')
      .select('id, relationship_id, created_at, mood_score')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5)

    const { data: recentCheckins } = await supabase
      .from('daily_checkins')
      .select('id, created_at, connection_score, mood_score')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5)

    return NextResponse.json({
      user_id: userId,
      relationships_count: relationships.length,
      relationships: relationships.map(rel => ({
        ...rel,
        health_score_debug_url: `/api/debug/health-score?userId=${userId}&relationshipId=${rel.id}`
      })),
      recent_activity: {
        journal_entries: recentJournals?.length || 0,
        daily_checkins: recentCheckins?.length || 0,
        last_journal: recentJournals?.[0]?.created_at,
        last_checkin: recentCheckins?.[0]?.created_at
      },
      next_steps: relationships.length > 0 ? 
        `Use this URL to debug the first relationship: /api/debug/health-score?userId=${userId}&relationshipId=${relationships[0].id}` :
        'No relationships found - you may need to create one first'
    })

  } catch (error) {
    console.error('User relationships debug error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}