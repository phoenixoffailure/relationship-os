// lib/analytics/events.ts
// Phase 9: Analytics tracking for new business rules

export type AnalyticsEvent = 
  // Check-in events
  | 'checkin_completed'
  | 'checkin_blocked_daily_limit'
  
  // Journal events
  | 'journal_submitted'
  | 'journal_with_relationship_selected'
  
  // Insight events
  | 'insights_generated_free'
  | 'insights_generated_premium'
  | 'insights_denied_no_checkin'
  | 'insights_denied_daily_cap_free'
  
  // Paywall events
  | 'paywall_click_suggestion_lock'
  | 'paywall_click_insight_cap'
  | 'upgrade_started_from_insight_cap'
  | 'upgrade_started_from_suggestion_lock'
  
  // Partner suggestion events
  | 'suggestions_generated_daily'
  | 'suggestions_viewed_premium'
  | 'suggestions_clicked_premium'

interface AnalyticsEventData {
  user_id?: string
  relationship_id?: string
  subscription_status?: 'free' | 'premium'
  denial_reason?: string
  source_component?: string
  [key: string]: any
}

/**
 * Track an analytics event
 * In production, this could send to your analytics service (Mixpanel, Amplitude, etc.)
 * For now, we'll log to console and could store in database
 */
export function trackEvent(event: AnalyticsEvent, data: AnalyticsEventData = {}) {
  const eventData = {
    event,
    timestamp: new Date().toISOString(),
    ...data
  }
  
  // Log for debugging
  console.log(`📊 Analytics: ${event}`, eventData)
  
  // In production, send to your analytics service:
  // await analyticsService.track(eventData)
  
  // Store in local storage for development testing
  try {
    const existingEvents = JSON.parse(localStorage.getItem('analytics_events') || '[]')
    existingEvents.push(eventData)
    // Keep only last 100 events
    const recentEvents = existingEvents.slice(-100)
    localStorage.setItem('analytics_events', JSON.stringify(recentEvents))
  } catch (error) {
    // Ignore localStorage errors (SSR, private browsing, etc.)
  }
}

/**
 * Track conversion events specifically
 */
export function trackConversion(source: string, user_id?: string, subscription_status?: 'free' | 'premium') {
  trackEvent(`upgrade_started_from_${source}` as AnalyticsEvent, {
    user_id,
    subscription_status,
    source_component: source
  })
}

/**
 * Track paywall interactions
 */
export function trackPaywall(location: string, user_id?: string) {
  if (location === 'suggestion_lock') {
    trackEvent('paywall_click_suggestion_lock', { user_id, source_component: 'partner_suggestions' })
  } else if (location === 'insight_cap') {
    trackEvent('paywall_click_insight_cap', { user_id, source_component: 'journal_insights' })
  }
}

/**
 * Get analytics events from local storage (for development/debugging)
 */
export function getAnalyticsEvents(): any[] {
  try {
    return JSON.parse(localStorage.getItem('analytics_events') || '[]')
  } catch {
    return []
  }
}

/**
 * Clear analytics events (for development)
 */
export function clearAnalyticsEvents() {
  try {
    localStorage.removeItem('analytics_events')
  } catch {
    // Ignore errors
  }
}