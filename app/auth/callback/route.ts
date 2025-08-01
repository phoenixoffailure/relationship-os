// app/auth/callback/route.ts - FIXED VERSION
// Uses the same createServerClient pattern as your other API routes

import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch (error) {
              console.log('Cookie setting error (can be ignored):', error)
            }
          },
        },
      }
    )

    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data?.user) {
      // NEW: Check onboarding status before redirecting
      try {
        const { data: onboardingData } = await supabase
          .from('enhanced_onboarding_responses')
          .select('completed_at')
          .eq('user_id', data.user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        const hasCompletedOnboarding = onboardingData?.completed_at != null

        if (hasCompletedOnboarding) {
          // Existing behavior: redirect to intended destination
          return NextResponse.redirect(`${origin}${next}`)
        } else {
          // NEW: redirect to onboarding if not completed
          return NextResponse.redirect(`${origin}/onboarding`)
        }
      } catch (error) {
        // On any error, preserve existing behavior
        console.warn('Could not check onboarding status:', error)
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // Existing error handling
  return NextResponse.redirect(`${origin}/login?message=Could not log in`)
}