// middleware.ts - CONSERVATIVE ENHANCEMENT
// Adds minimal onboarding check without changing existing logic

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Existing admin emails (unchanged)
const ADMIN_EMAILS = [
  'jwalkwithyou@gmail.com' // Replace with your actual email
]

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // EXISTING: Admin routes protection (unchanged)
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login?message=Admin access requires login', request.url))
    }

    const isAdminUser = ADMIN_EMAILS.includes(session.user.email || '')
    
    if (!isAdminUser) {
      return NextResponse.redirect(new URL('/dashboard?message=Access denied: Admin privileges required', request.url))
    }
  }

  // EXISTING: Redirect unauthenticated users from protected routes (unchanged)
  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // EXISTING: Redirect authenticated users from auth pages (unchanged)
  if (session && (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup'))) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // NEW: Comprehensive onboarding check for ALL protected routes
  if (session && session.user) {
    const pathname = request.nextUrl.pathname
    
    // Define all protected routes that require onboarding completion
    const protectedRoutes = [
      '/dashboard',
      '/journal', 
      '/insights',
      '/settings',
      '/relationships',
      '/checkin',
      '/calendar'
    ]
    
    // Check if current path is a protected route (but not onboarding itself)
    const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
    const isOnboardingRoute = pathname.startsWith('/onboarding')
    
    if (isProtectedRoute && !isOnboardingRoute) {
      try {
        const { data: onboardingData } = await supabase
          .from('enhanced_onboarding_responses')
          .select('completed_at')
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        const hasCompletedOnboarding = onboardingData?.completed_at != null

        if (!hasCompletedOnboarding) {
          console.log('🚀 Redirecting to onboarding from:', pathname)
          return NextResponse.redirect(new URL('/onboarding', request.url))
        }
      } catch (error) {
        // On error, allow access to prevent auth loops
        console.warn('Could not check onboarding status in middleware:', error)
      }
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
}