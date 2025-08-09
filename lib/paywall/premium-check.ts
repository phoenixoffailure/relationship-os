// lib/paywall/premium-check.ts
// Utility functions for checking premium status and feature access

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { FeatureKey, isFeaturePremium, FREE_TIER_LIMITS } from './config'

export interface PremiumStatus {
  has_premium: boolean
  subscription_status: string
  plan_type?: string
  current_period_end?: string
  trial_ends_at?: string
  trial_available: boolean
}

export interface UsageLimits {
  partner_suggestions_today: number
  ai_insights_today: number  
  journal_entries_this_month: number
  relationship_count: number
}

// Check if user has premium access
export async function checkPremiumStatus(userId?: string): Promise<PremiumStatus> {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value },
          set() {},
          remove() {},
        },
      }
    )

    // Get user if not provided
    let user_id = userId
    if (!user_id) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        return {
          has_premium: false,
          subscription_status: 'none',
          trial_available: false
        }
      }
      user_id = user.id
    }

    const { data: subscription, error } = await supabase
      .from('premium_subscriptions')
      .select('*')
      .eq('user_id', user_id)
      .single()

    if (error || !subscription) {
      return {
        has_premium: false,
        subscription_status: 'none',
        trial_available: true
      }
    }

    const now = new Date()
    const isActive = subscription.subscription_status === 'active'
    const isInTrial = subscription.trial_ends_at && new Date(subscription.trial_ends_at) > now

    return {
      has_premium: isActive || !!isInTrial,
      subscription_status: subscription.subscription_status,
      plan_type: subscription.plan_type,
      current_period_end: subscription.current_period_end,
      trial_ends_at: subscription.trial_ends_at,
      trial_available: !subscription.trial_ends_at
    }
  } catch (error) {
    console.error('Error checking premium status:', error)
    return {
      has_premium: false,
      subscription_status: 'error',
      trial_available: false
    }
  }
}

// Check if user has access to a specific feature
export async function hasFeatureAccess(featureKey: FeatureKey, userId?: string): Promise<boolean> {
  // If feature is free, always allow access
  if (!isFeaturePremium(featureKey)) {
    return true
  }

  // Check premium status for premium features
  const premiumStatus = await checkPremiumStatus(userId)
  return premiumStatus.has_premium
}

// Get current usage against limits
export async function getCurrentUsage(userId?: string): Promise<UsageLimits> {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        cookies: {
          get(name: string) { return cookieStore.get(name)?.value },
          set() {},
          remove() {},
        },
      }
    )

    // Get user if not provided
    let user_id = userId
    if (!user_id) {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('No authenticated user')
      user_id = user.id
    }

    const today = new Date().toISOString().split('T')[0]
    const thisMonth = new Date().toISOString().substring(0, 7) // YYYY-MM

    const [suggestionsToday, insightsToday, journalsThisMonth, relationshipCount] = await Promise.all([
      // Partner suggestions today
      supabase
        .from('privacy_preserving_suggestions')
        .select('id', { count: 'exact' })
        .eq('target_user_id', user_id)
        .gte('created_at', today),
      
      // AI insights today (Phase 8.2 optimized!)
      supabase
        .from('relationship_insights')
        .select('id', { count: 'exact' })
        .eq('generated_for_user', user_id)
        .gte('created_at', today),
      
      // Journal entries this month
      supabase
        .from('journal_entries')
        .select('id', { count: 'exact' })
        .eq('user_id', user_id)
        .gte('created_at', thisMonth),
      
      // Total relationships
      supabase
        .from('relationship_members')
        .select('id', { count: 'exact' })
        .eq('user_id', user_id)
    ])

    return {
      partner_suggestions_today: suggestionsToday.count || 0,
      ai_insights_today: insightsToday.count || 0,
      journal_entries_this_month: journalsThisMonth.count || 0,
      relationship_count: relationshipCount.count || 0
    }
  } catch (error) {
    console.error('Error getting usage:', error)
    return {
      partner_suggestions_today: 0,
      ai_insights_today: 0,
      journal_entries_this_month: 0,
      relationship_count: 0
    }
  }
}

// Check if user is within usage limits
export async function checkUsageLimits(
  action: 'partner_suggestion' | 'ai_insight' | 'journal_entry' | 'new_relationship',
  userId?: string
): Promise<{ allowed: boolean; reason?: string; upgradeRequired: boolean }> {
  try {
    const [premiumStatus, usage] = await Promise.all([
      checkPremiumStatus(userId),
      getCurrentUsage(userId)
    ])

    // Premium users have unlimited access
    if (premiumStatus.has_premium) {
      return { allowed: true, upgradeRequired: false }
    }

    // Check free tier limits
    switch (action) {
      case 'partner_suggestion':
        if (usage.partner_suggestions_today >= FREE_TIER_LIMITS.partner_suggestions_per_day) {
          return {
            allowed: false,
            reason: `You've reached your daily limit of ${FREE_TIER_LIMITS.partner_suggestions_per_day} partner suggestions. Upgrade to Premium for unlimited access.`,
            upgradeRequired: true
          }
        }
        break

      case 'ai_insight':
        if (usage.ai_insights_today >= FREE_TIER_LIMITS.ai_insights_per_day) {
          return {
            allowed: false,
            reason: `You've reached your daily limit of ${FREE_TIER_LIMITS.ai_insights_per_day} AI insight. Upgrade to Premium for unlimited insights.`,
            upgradeRequired: true
          }
        }
        break

      case 'journal_entry':
        if (usage.journal_entries_this_month >= FREE_TIER_LIMITS.journal_entries_per_month) {
          return {
            allowed: false,
            reason: `You've reached your monthly limit of ${FREE_TIER_LIMITS.journal_entries_per_month} journal entries. Upgrade to Premium for unlimited journaling.`,
            upgradeRequired: true
          }
        }
        break

      case 'new_relationship':
        if (usage.relationship_count >= FREE_TIER_LIMITS.relationship_limit) {
          return {
            allowed: false,
            reason: `You've reached your limit of ${FREE_TIER_LIMITS.relationship_limit} relationships. Upgrade to Premium for unlimited relationships.`,
            upgradeRequired: true
          }
        }
        break
    }

    return { allowed: true, upgradeRequired: false }
  } catch (error) {
    console.error('Error checking usage limits:', error)
    // Allow access on error to avoid blocking users
    return { allowed: true, upgradeRequired: false }
  }
}