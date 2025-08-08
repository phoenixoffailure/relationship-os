// app/api/premium/subscription-check/route.ts
// Check if user has active premium subscription

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Check for active premium subscription
    const { data: subscription, error } = await supabase
      .from('premium_subscriptions')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('❌ Error checking premium subscription:', error)
      return NextResponse.json(
        { error: 'Failed to check subscription status' },
        { status: 500 }
      )
    }
    
    // No subscription found
    if (!subscription) {
      return NextResponse.json({
        has_premium: false,
        subscription_status: 'none',
        trial_available: true
      })
    }
    
    // Check if subscription is active and not expired
    const now = new Date()
    const isActive = subscription.subscription_status === 'active' || subscription.subscription_status === 'trial'
    const notExpired = !subscription.current_period_end || new Date(subscription.current_period_end) > now
    const trialNotExpired = !subscription.trial_ends_at || new Date(subscription.trial_ends_at) > now
    
    const hasPremiumAccess = isActive && (notExpired || (subscription.subscription_status === 'trial' && trialNotExpired))
    
    return NextResponse.json({
      has_premium: hasPremiumAccess,
      subscription_status: subscription.subscription_status,
      plan_type: subscription.plan_type,
      current_period_end: subscription.current_period_end,
      trial_ends_at: subscription.trial_ends_at,
      trial_available: !subscription || subscription.subscription_status !== 'trial'
    })
    
  } catch (error) {
    console.error('❌ Error in subscription check:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}