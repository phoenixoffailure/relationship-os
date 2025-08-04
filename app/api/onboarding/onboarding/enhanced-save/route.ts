// app/api/onboarding/enhanced-save/route.ts
// UPDATED: Add relationship timeline field processing

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json()
    const { responses } = body

    console.log('📋 Enhanced onboarding save request received')
    console.log('📊 Response data keys:', Object.keys(responses))

    // Get user from auth
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

    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('❌ User authentication failed:', userError)
      return NextResponse.json({ 
        error: 'Authentication required' 
      }, { status: 401 })
    }

    console.log('✅ User authenticated:', user.id)

    // Process and validate all responses
    const processedResponses = {
      user_id: user.id,
      session_id: responses.session_id || crypto.randomUUID(),
      completed_at: new Date().toISOString(),
      version: 2,
      ai_processing_status: 'pending',

      // NEW: Relationship Timeline Fields
      relationship_start_date: responses.relationship_start_date || null,
      anniversary_date: responses.anniversary_date || null,
      relationship_duration_years: typeof responses.relationship_duration_years === 'number' 
        ? responses.relationship_duration_years 
        : null,
      relationship_duration_months: typeof responses.relationship_duration_months === 'number' 
        ? responses.relationship_duration_months 
        : null,
      
      // Step 1: Love Languages Assessment (Enhanced)
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
        : []
    }

    console.log('🔄 Processing enhanced onboarding data...')
    console.log('📊 Processed fields:', {
      hasTimelineData: !!(processedResponses.relationship_start_date || processedResponses.anniversary_date || processedResponses.relationship_duration_years),
      timelineFields: {
        startDate: processedResponses.relationship_start_date,
        anniversaryDate: processedResponses.anniversary_date,
        durationYears: processedResponses.relationship_duration_years,
        durationMonths: processedResponses.relationship_duration_months
      },
      loveLanguagesCount: processedResponses.love_language_ranking.length,
      communicationStyle: processedResponses.communication_style,
      primaryGoalsCount: processedResponses.primary_goals.length
    })

    try {
      // Save to enhanced_onboarding_responses table
      const { data: savedResponse, error: saveError } = await supabase
        .from('enhanced_onboarding_responses')
        .insert(processedResponses)
        .select('id')
        .single()

      if (saveError) {
        console.error('❌ Database save error:', saveError)
        
        if (saveError.code === '42P01') {
          return NextResponse.json({ 
            error: 'Database table not found',
            message: 'Please run the database schema setup first.',
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

      // Add delay and verification before triggering profile generation
      console.log('⏳ Ensuring data is committed before profile generation...')
      
      // Wait for database transaction to commit
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Verify the data was actually saved and is readable
      const { data: verificationData, error: verifyError } = await supabase
        .from('enhanced_onboarding_responses')
        .select('id, user_id, love_language_ranking, communication_style, completed_at, relationship_start_date, anniversary_date, relationship_duration_years')
        .eq('id', savedResponse.id)
        .single()

      if (verifyError || !verificationData) {
        console.error('❌ Data verification failed:', verifyError)
        console.log('⚠️ Profile generation will be skipped due to verification failure')
      } else {
        console.log('✅ Data verified successfully, including timeline data:', {
          hasStartDate: !!verificationData.relationship_start_date,
          hasAnniversary: !!verificationData.anniversary_date,
          hasDuration: !!verificationData.relationship_duration_years
        })
        
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

      return NextResponse.json({ 
        success: true, 
        responseId: savedResponse.id,
        message: 'Onboarding responses saved successfully',
        debug: {
          dataVerified: !verifyError,
          userId: user.id,
          savedFields: Object.keys(processedResponses).length,
          timelineDataSaved: {
            startDate: !!processedResponses.relationship_start_date,
            anniversary: !!processedResponses.anniversary_date,
            duration: !!processedResponses.relationship_duration_years
          }
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