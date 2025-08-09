// lib/stripe/config.ts
// Stripe configuration and initialization

import Stripe from 'stripe'

// Server-side Stripe instance
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
})

// Product configuration
export const STRIPE_CONFIG = {
  // Subscription plans
  plans: {
    monthly: {
      name: 'RelationshipOS Premium Monthly',
      priceId: process.env.STRIPE_PRICE_ID_MONTHLY!,
      amount: 999, // $9.99 in cents
      interval: 'month' as const,
      features: [
        'FIRO Compatibility Analysis',
        'Advanced Analytics Dashboard',
        'Premium Relationship Insights',
        'Unlimited Partner Suggestions',
        'Priority AI Processing',
        'Export Data & Reports'
      ]
    },
    yearly: {
      name: 'RelationshipOS Premium Yearly',
      priceId: process.env.STRIPE_PRICE_ID_YEARLY!,
      amount: 9999, // $99.99 in cents
      interval: 'year' as const,
      features: [
        'All Monthly Features',
        '2 Months Free (16% savings)',
        'Priority Support',
        'Early Access to New Features',
        'Advanced Coaching Recommendations'
      ]
    }
  },
  
  // Checkout session configuration
  checkout: {
    successUrl: `${process.env.NEXT_PUBLIC_APP_URL}/premium/success`,
    cancelUrl: `${process.env.NEXT_PUBLIC_APP_URL}/premium/pricing`,
    allowPromotionCodes: true,
  }
} as const

export type StripePlan = keyof typeof STRIPE_CONFIG.plans
export type SubscriptionInterval = 'month' | 'year'