// app/api/onboarding/profile-status/route.ts - COMPLETE FIXED VERSION
// Fixed all import errors and TypeScript issues

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { 
        cookies: { 
          get: (name: string) => cookieStore.get(name)?.value 
        } 
      }
    )

    // Get current user if userId not provided
    let targetUserId = userId
    if (!targetUserId) {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (userError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      targetUserId = user.id
    }

    // Check if user has completed enhanced onboarding
    const { data: response, error: responseError } = await supabase
      .from('enhanced_onboarding_responses')
      .select('ai_processing_status, completed_at, version')
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    // Check if enhanced profile exists
    const { data: profile, error: profileError } = await supabase
      .from('enhanced_user_profiles')
      .select('completeness_score, confidence_score, created_at, ai_summary')
      .eq('user_id', targetUserId)
      .single()

    return NextResponse.json({
      hasCompletedOnboarding: !!response?.completed_at,
      aiProcessingStatus: response?.ai_processing_status || 'not_started',
      onboardingVersion: response?.version || 1,
      hasProfile: !!profile,
      profileQuality: profile ? {
        completeness: profile.completeness_score,
        confidence: profile.confidence_score,
        createdAt: profile.created_at
      } : null,
      profileSummary: profile?.ai_summary || null,
      errors: {
        onboarding: responseError ? responseError.message : null,
        profile: profileError ? profileError.message : null
      }
    })

  } catch (error) {
    console.error('Profile status check error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}