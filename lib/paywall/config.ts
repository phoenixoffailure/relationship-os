// lib/paywall/config.ts
// Flexible paywall configuration - easily move features between free/premium

export type FeatureKey = 
  | 'basic_insights'
  | 'daily_checkins'
  | 'journal_entries'
  | 'health_score'
  | 'relationship_cards'
  | 'partner_suggestions_limited'
  | 'firo_compatibility'
  | 'premium_analytics'
  | 'advanced_insights'
  | 'unlimited_partner_suggestions'
  | 'priority_ai_processing'
  | 'data_export'
  | 'trend_analysis'
  | 'coaching_recommendations'
  | 'priority_support'
  | 'early_access'

export interface Feature {
  key: FeatureKey
  name: string
  description: string
  category: 'insights' | 'analytics' | 'ai' | 'support' | 'data'
  premium: boolean
  comingSoon?: boolean
}

// 🎯 EASILY CONFIGURABLE: Change premium: true/false to move features between tiers
export const FEATURES: Feature[] = [
  // FREE FEATURES
  {
    key: 'basic_insights',
    name: 'Basic Relationship Insights',
    description: 'Daily AI-generated insights about your relationship patterns',
    category: 'insights',
    premium: false
  },
  {
    key: 'daily_checkins',
    name: 'Daily Checkins & Journal',
    description: 'Track daily mood, connection, and relationship moments',
    category: 'insights',
    premium: false
  },
  {
    key: 'journal_entries',
    name: 'Journal Entries',
    description: 'Private journaling with AI analysis',
    category: 'insights',
    premium: false
  },
  {
    key: 'health_score',
    name: 'Relationship Health Score',
    description: 'Overall relationship health tracking',
    category: 'analytics',
    premium: false
  },
  {
    key: 'relationship_cards',
    name: 'Multiple Relationship Management',
    description: 'Manage different relationship types (work, family, romantic)',
    category: 'insights',
    premium: false
  },
  {
    key: 'partner_suggestions_limited',
    name: 'Partner Suggestions (Premium Only)',
    description: 'Daily AI-generated suggestions for your relationship partners',
    category: 'ai',
    premium: true
  },

  // PREMIUM FEATURES
  {
    key: 'firo_compatibility',
    name: 'FIRO Compatibility Analysis',
    description: 'Research-backed compatibility scoring based on psychological needs',
    category: 'analytics',
    premium: true
  },
  {
    key: 'premium_analytics',
    name: 'Advanced Analytics Dashboard',
    description: 'Deep insights, trends, and relationship pattern analysis',
    category: 'analytics',
    premium: true
  },
  {
    key: 'advanced_insights',
    name: 'Premium AI Insights',
    description: 'Enhanced AI analysis with deeper psychological understanding',
    category: 'ai',
    premium: true
  },
  {
    key: 'unlimited_partner_suggestions',
    name: 'Unlimited Partner Suggestions',
    description: 'Comprehensive suggestions for improving partner relationships',
    category: 'ai',
    premium: true
  },
  {
    key: 'priority_ai_processing',
    name: 'Priority AI Processing',
    description: 'Faster insight generation and AI response times',
    category: 'ai',
    premium: true
  },
  {
    key: 'data_export',
    name: 'Export Data & Reports',
    description: 'Download your relationship data and generate reports',
    category: 'data',
    premium: true
  },
  {
    key: 'trend_analysis',
    name: 'Relationship Trend Analysis',
    description: 'Long-term pattern recognition and trend forecasting',
    category: 'analytics',
    premium: true
  },
  {
    key: 'coaching_recommendations',
    name: 'Advanced Coaching Recommendations',
    description: 'Personalized coaching suggestions based on relationship science',
    category: 'ai',
    premium: true
  },
  {
    key: 'priority_support',
    name: 'Priority Support',
    description: 'Fast-track support with relationship experts',
    category: 'support',
    premium: true
  },
  {
    key: 'early_access',
    name: 'Early Access to New Features',
    description: 'Be the first to try new relationship tools and insights',
    category: 'support',
    premium: true
  }
]

// Helper functions
export function getFeature(key: FeatureKey): Feature | undefined {
  return FEATURES.find(f => f.key === key)
}

export function getFreeFeatures(): Feature[] {
  return FEATURES.filter(f => !f.premium)
}

export function getPremiumFeatures(): Feature[] {
  return FEATURES.filter(f => f.premium)
}

export function isFeaturePremium(key: FeatureKey): boolean {
  const feature = getFeature(key)
  return feature?.premium ?? false
}

export function getFeaturesByCategory(category: Feature['category']): Feature[] {
  return FEATURES.filter(f => f.category === category)
}

// Usage limits for free tier
export const FREE_TIER_LIMITS = {
  partner_suggestions_per_day: 0, // Phase 9: Partner suggestions are premium-only
  ai_insights_per_day: 1, // Now that we have Phase 8.2 optimization!
  journal_entries_per_month: 100,
  relationship_limit: 5
}

export const PREMIUM_TIER_LIMITS = {
  partner_suggestions_per_day: 'unlimited',
  ai_insights_per_day: 'unlimited',
  journal_entries_per_month: 'unlimited',
  relationship_limit: 'unlimited'
}