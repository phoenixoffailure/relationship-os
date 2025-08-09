// app/api/stripe/create-checkout-session/route.ts
// Create Stripe checkout session for subscription

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { stripe, STRIPE_CONFIG, StripePlan } from '@/lib/stripe/config'

interface CheckoutRequest {
  plan: StripePlan
  successUrl?: string
  cancelUrl?: string
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: CheckoutRequest = await request.json()
    const { plan, successUrl, cancelUrl } = body

    // Validate plan
    if (!STRIPE_CONFIG.plans[plan]) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 })
    }

    // Get authenticated user
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value },
          set(name: string, value: string, options: any) {
            cookieStore.set(name, value, options)
          },
          remove(name: string, options: any) {
            cookieStore.delete(name)
          },
        },
      }
    )

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Check if user already has active subscription
    const { data: existingSubscription } = await supabase
      .from('premium_subscriptions')
      .select('subscription_status, stripe_subscription_id')
      .eq('user_id', user.id)
      .single()

    if (existingSubscription?.subscription_status === 'active') {
      return NextResponse.json({ 
        error: 'User already has active subscription',
        redirectUrl: '/premium/manage'
      }, { status: 409 })
    }

    // Create or retrieve Stripe customer
    let stripeCustomer
    const { data: existingCustomer } = await supabase
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single()

    if (existingCustomer?.stripe_customer_id) {
      stripeCustomer = await stripe.customers.retrieve(existingCustomer.stripe_customer_id)
    } else {
      stripeCustomer = await stripe.customers.create({
        email: user.email!,
        metadata: {
          supabase_user_id: user.id,
        },
      })

      // Store customer ID in database
      await supabase.from('stripe_customers').upsert({
        user_id: user.id,
        stripe_customer_id: stripeCustomer.id,
        email: user.email!
      })
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomer.id,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: STRIPE_CONFIG.plans[plan].priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl || STRIPE_CONFIG.checkout.successUrl,
      cancel_url: cancelUrl || STRIPE_CONFIG.checkout.cancelUrl,
      allow_promotion_codes: STRIPE_CONFIG.checkout.allowPromotionCodes,
      subscription_data: {
        metadata: {
          supabase_user_id: user.id,
          plan: plan,
        },
      },
      metadata: {
        supabase_user_id: user.id,
        plan: plan,
      },
    })

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url 
    })

  } catch (error) {
    console.error('❌ Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}