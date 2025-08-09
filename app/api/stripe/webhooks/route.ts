// app/api/stripe/webhooks/route.ts
// Handle Stripe webhooks for subscription events

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { stripe } from '@/lib/stripe/config'
import Stripe from 'stripe'

// Disable body parsing for webhooks
export const runtime = 'nodejs'

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('❌ Missing STRIPE_WEBHOOK_SECRET')
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      )
    } catch (err) {
      console.error('❌ Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Initialize Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get() { return undefined },
          set() {},
          remove() {},
        },
      }
    )

    console.log(`🔔 Processing webhook: ${event.type}`)

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session, supabase)
        break

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription, supabase)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionCancelled(event.data.object as Stripe.Subscription, supabase)
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice, supabase)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice, supabase)
        break

      default:
        console.log(`📝 Unhandled webhook event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('❌ Webhook processing error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
  supabase: any
) {
  const userId = session.metadata?.supabase_user_id
  const plan = session.metadata?.plan

  if (!userId) {
    console.error('❌ No user ID in checkout session metadata')
    return
  }

  console.log(`✅ Checkout completed for user: ${userId}, plan: ${plan}`)

  // The subscription will be handled by the subscription.created webhook
  // Just log the successful checkout here
  await logSubscriptionEvent(
    supabase,
    userId,
    session.subscription as string,
    'subscription_created',
    { checkout_session: session.id, plan }
  )
}

async function handleSubscriptionUpdated(
  subscription: Stripe.Subscription,
  supabase: any
) {
  const userId = subscription.metadata.supabase_user_id

  if (!userId) {
    console.error('❌ No user ID in subscription metadata')
    return
  }

  console.log(`📝 Subscription updated for user: ${userId}`)

  // Update subscription in database
  await supabase
    .from('premium_subscriptions')
    .upsert({
      user_id: userId,
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status === 'active' ? 'active' : subscription.status,
      plan_type: subscription.status === 'trialing' ? 'premium_trial' : 
                 subscription.items.data[0]?.price.recurring?.interval === 'month' ? 'premium_monthly' : 'premium_yearly',
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      trial_ends_at: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
      updated_at: new Date().toISOString()
    })

  await logSubscriptionEvent(
    supabase,
    userId,
    subscription.id,
    'subscription_updated',
    { status: subscription.status }
  )
}

async function handleSubscriptionCancelled(
  subscription: Stripe.Subscription,
  supabase: any
) {
  const userId = subscription.metadata.supabase_user_id

  if (!userId) {
    console.error('❌ No user ID in subscription metadata')
    return
  }

  console.log(`❌ Subscription cancelled for user: ${userId}`)

  // Update subscription status
  await supabase
    .from('premium_subscriptions')
    .update({
      subscription_status: 'cancelled',
      updated_at: new Date().toISOString()
    })
    .eq('stripe_subscription_id', subscription.id)

  await logSubscriptionEvent(
    supabase,
    userId,
    subscription.id,
    'subscription_cancelled',
    { cancelled_at: new Date(subscription.canceled_at! * 1000).toISOString() }
  )
}

async function handlePaymentSucceeded(
  invoice: Stripe.Invoice,
  supabase: any
) {
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
  const userId = subscription.metadata.supabase_user_id

  if (!userId) {
    console.error('❌ No user ID in subscription metadata')
    return
  }

  console.log(`💳 Payment succeeded for user: ${userId}`)

  await logSubscriptionEvent(
    supabase,
    userId,
    subscription.id,
    'payment_succeeded',
    { 
      invoice_id: invoice.id,
      amount: invoice.amount_paid,
      period_start: new Date(invoice.period_start! * 1000).toISOString(),
      period_end: new Date(invoice.period_end! * 1000).toISOString()
    }
  )
}

async function handlePaymentFailed(
  invoice: Stripe.Invoice,
  supabase: any
) {
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string)
  const userId = subscription.metadata.supabase_user_id

  if (!userId) {
    console.error('❌ No user ID in subscription metadata')
    return
  }

  console.log(`💳 Payment failed for user: ${userId}`)

  await logSubscriptionEvent(
    supabase,
    userId,
    subscription.id,
    'payment_failed',
    {
      invoice_id: invoice.id,
      amount: invoice.amount_due,
      attempt_count: invoice.attempt_count
    }
  )
}

async function logSubscriptionEvent(
  supabase: any,
  userId: string,
  subscriptionId: string,
  eventType: string,
  eventData: any
) {
  await supabase
    .from('subscription_events')
    .insert({
      user_id: userId,
      stripe_subscription_id: subscriptionId,
      event_type: eventType,
      event_data: eventData
    })
}