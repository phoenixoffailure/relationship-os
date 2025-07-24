// app/api/onboarding/enhanced-save/route.ts - ENVIRONMENT VARIABLE FIX
// Fixed to use correct environment variables

// app/api/onboarding/enhanced-save/route.ts - MINIMAL TIMING FIX
// Only changes the timing issue - keeps all your existing logic

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

interface EnhancedOnboardingRequest {
  responses: Record<string, any>
  completedAt?: string
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse and validate request body
    let requestData: EnhancedOnboardingRequest
    try {
      requestData = await request.json()
    } catch (parseError) {
      return NextResponse.json({ 
        error: 'Invalid JSON in request body' 
      }, { status: 400 })
    }

    const { responses, completedAt } = requestData

    if (!responses || typeof responses !== 'object') {
      return NextResponse.json({ 
        error: 'Missing or invalid responses data' 
      }, { status: 400 })
    }
    
    // Create Supabase client - FIXED ENVIRONMENT VARIABLES
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

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error('Auth error:', userError)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('✅ User authenticated:', user.id)

    // Process and validate responses with proper defaults (KEEP ALL YOUR EXISTING LOGIC)
    const processedResponses = {
      user_id: user.id,
      
      // Step 1: Love Languages
      love_language_ranking: Array.isArray(responses.love_language_ranking) 
        ? responses.love_language_ranking 
        : [],
      love_language_scores: typeof responses.love_language_intensity === 'object' 
        ? responses.love_language_intensity 
        : {},
      love_language_examples: typeof responses.love_language_examples === 'object' 
        ? responses.love_language_examples 
        : {},
      
      // Step 2: Communication Style
      communication_style: typeof responses.communication_approach === 'string' 
        ? responses.communication_approach 
        : '',
      conflict_approach: typeof responses.conflict_style === 'string' 
        ? responses.conflict_style 
        : '',
      stress_response: typeof responses.stress_response === 'string' 
        ? responses.stress_response 
        : '',
      expression_preferences: typeof responses.expression_preferences === 'object' 
        ? responses.expression_preferences 
        : {},
      communication_timing: Array.isArray(responses.communication_timing) 
        ? responses.communication_timing 
        : [],
      
      // Step 3: Intimacy Preferences
      intimacy_priorities: typeof responses.intimacy_priorities === 'object' 
        ? responses.intimacy_priorities 
        : {},
      intimacy_enhancers: Array.isArray(responses.intimacy_enhancers) 
        ? responses.intimacy_enhancers 
        : [],
      intimacy_barriers: Array.isArray(responses.intimacy_barriers) 
        ? responses.intimacy_barriers 
        : [],
      connection_frequency: typeof responses.connection_frequency === 'object' 
        ? responses.connection_frequency 
        : {},
      
      // Step 4: Relationship Goals
      primary_goals: Array.isArray(responses.primary_goals) 
        ? responses.primary_goals 
        : [],
      goal_timeline: typeof responses.goal_timeline === 'string' 
        ? responses.goal_timeline 
        : '',
      specific_challenges: typeof responses.specific_challenges === 'string' 
        ? responses.specific_challenges 
        : '',
      relationship_values: Array.isArray(responses.relationship_values) 
        ? responses.relationship_values 
        : [],
      success_metrics: typeof responses.success_metrics === 'string' 
        ? responses.success_metrics 
        : '',
      
      // Step 5: Need Expression Patterns
      expression_directness: typeof responses.expression_directness === 'string' 
        ? responses.expression_directness 
        : '',
      expression_frequency: typeof responses.expression_frequency === 'string' 
        ? responses.expression_frequency 
        : '',
      preferred_methods: Array.isArray(responses.preferred_methods) 
        ? responses.preferred_methods 
        : [],
      need_categories_difficulty: typeof responses.need_categories_ranking === 'object' 
        ? responses.need_categories_ranking 
        : {},
      partner_reading_ability: typeof responses.partner_reading_ability === 'number' 
        ? responses.partner_reading_ability 
        : 5,
      successful_communication_example: typeof responses.successful_communication === 'string' 
        ? responses.successful_communication 
        : '',
      communication_barriers: Array.isArray(responses.communication_barriers) 
        ? responses.communication_barriers 
        : [],
      
      completed_at: completedAt || new Date().toISOString(),
      ai_processing_status: 'pending' as const
    }

    console.log('📝 Saving enhanced onboarding responses...')

    // Save enhanced onboarding responses with better error handling
    try {
      const { data: savedResponse, error: saveError } = await supabase
        .from('enhanced_onboarding_responses')
        .insert(processedResponses)
        .select('id')
        .single()

      if (saveError) {
        console.error('Database save error:', saveError)
        
        // Check if it's a table not found error
        if (saveError.code === 'PGRST116' || saveError.message.includes('relation') || saveError.message.includes('does not exist')) {
          return NextResponse.json({ 
            error: 'Database table not found. Please run the database schema setup first.',
            details: 'The enhanced_onboarding_responses table does not exist in your database.'
          }, { status: 500 })
        }
        
        return NextResponse.json({ 
          error: 'Failed to save responses',
          details: saveError.message 
        }, { status: 500 })
      }

      console.log('✅ Responses saved successfully:', savedResponse.id)

      // Update user onboarding status (optional, don't fail if this fails)
      try {
        await supabase
          .from('users')
          .update({ onboarding_completed: true })
          .eq('id', user.id)
      } catch (userUpdateError) {
        console.warn('Could not update user status:', userUpdateError)
      }

      // ============ TIMING FIX STARTS HERE ============
      // Add delay and verification before triggering profile generation
      console.log('⏳ Ensuring data is committed before profile generation...')
      
      // Wait for database transaction to commit
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Verify the data was actually saved and is readable
      const { data: verificationData, error: verifyError } = await supabase
        .from('enhanced_onboarding_responses')
        .select('id, user_id, love_language_ranking, communication_style, completed_at')
        .eq('id', savedResponse.id)
        .single()

      if (verifyError || !verificationData) {
        console.error('❌ Data verification failed:', verifyError)
        console.log('⚠️ Profile generation will be skipped due to verification failure')
      } else {
        console.log('✅ Data verified successfully, triggering profile generation')
        
        // Trigger AI profile generation (async - don't wait for completion)
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || request.nextUrl.origin
        fetch(`${baseUrl}/api/onboarding/generate-profile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            responseId: savedResponse.id,
            userId: user.id 
          })
        }).catch(error => {
          console.error('Failed to trigger profile generation:', error)
        })
      }
      // ============ TIMING FIX ENDS HERE ============

      return NextResponse.json({ 
        success: true, 
        responseId: savedResponse.id,
        message: 'Onboarding responses saved successfully',
        debug: {
          dataVerified: !verifyError,
          userId: user.id,
          savedFields: Object.keys(processedResponses).length
        }
      })
      
    } catch (dbError) {
      console.error('Database connection error:', dbError)
      return NextResponse.json({ 
        error: 'Database connection failed',
        details: 'Could not connect to database. Please check your environment variables.'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Enhanced onboarding save error:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}