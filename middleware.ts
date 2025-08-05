// middleware.ts - BETA ACCESS CONTROL SYSTEM
// Prevents non-approved users from accessing signup AND app routes
// Addresses database orphan issue by blocking signup for non-approved users

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Updated admin emails - both administrators
const ADMIN_EMAILS = [
  'jwalkwithyou@gmail.com',
  'Chandellwalker@gmail.com'
]

// Beta approved users (includes all admins + additional testers)
const BETA_APPROVED_EMAILS = [
  ...ADMIN_EMAILS, // All admins automatically have beta access
  // Add additional beta testers here as needed:
  // 'beta-tester@example.com',
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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // NEW: BETA ACCESS CONTROL - Block signup for non-approved users
  // This prevents database orphan records
  if (request.nextUrl.pathname === '/signup') {
    console.log('🔍 Signup attempt detected, redirecting to beta signup page')
    return NextResponse.redirect(new URL('https://hellorelationshipos.com', request.url))
  }

  // EXISTING: Admin routes protection (updated with both admin emails)
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login?message=Admin access requires login', request.url))
    }

    const isAdminUser = ADMIN_EMAILS.includes(user?.email ?? '')
    
    if (!isAdminUser) {
      return NextResponse.redirect(new URL('/dashboard?message=Access denied: Admin privileges required', request.url))
    }
  }

  // EXISTING: Redirect unauthenticated users from protected routes (unchanged)
  if (!session && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // UPDATED: Redirect authenticated users from auth pages, BUT allow login for approved users
  if (session && user && request.nextUrl.pathname.startsWith('/login')) {
    const isBetaApproved = BETA_APPROVED_EMAILS.includes(user.email ?? '')
    if (isBetaApproved) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    } else {
      // Non-approved users get redirected even if they somehow have a session
      return NextResponse.redirect(new URL('https://hellorelationshipos.com', request.url))
    }
  }

  // NEW: BETA ACCESS CONTROL - Check after authentication for app access
  if (session && user) {
    const pathname = request.nextUrl.pathname
    
    // Define all protected routes that require beta access
    const protectedRoutes = [
      '/dashboard',
      '/journal', 
      '/insights',
      '/settings',
      '/relationships',
      '/checkin',
      '/calendar',
      '/onboarding' // Include onboarding in beta protection
    ]
    
    // Check if current path requires beta access
    const requiresBetaAccess = protectedRoutes.some(route => pathname.startsWith(route))
    
    if (requiresBetaAccess) {
      const isBetaApproved = BETA_APPROVED_EMAILS.includes(user.email ?? '')
      
      if (!isBetaApproved) {
        console.log('🚫 Non-approved user attempting app access:', user.email, 'redirecting to beta signup')
        // Optional: Sign them out to prevent confusion
        await supabase.auth.signOut()
        return NextResponse.redirect(new URL('https://hellorelationshipos.com', request.url))
      }
      
      console.log('✅ Beta approved user accessing:', user.email, pathname)
    }
  }

  // EXISTING: Comprehensive onboarding check for ALL protected routes (for approved users only)
  if (session && user) {
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
          .eq('user_id', user.id)
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