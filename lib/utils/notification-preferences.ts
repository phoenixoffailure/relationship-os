import { createBrowserClient } from '@supabase/ssr'

interface NotificationPreferences {
  daily_reminders: boolean
  partner_suggestions: boolean
  relationship_insights: boolean
  email_notifications: boolean
}

export async function getUserNotificationPreferences(userId: string): Promise<NotificationPreferences | null> {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  try {
    const { data, error } = await supabase
      .from('users')
      .select('notification_preferences')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching notification preferences:', error)
      return null
    }

    return data?.notification_preferences || {
      daily_reminders: true,
      partner_suggestions: true,
      relationship_insights: true,
      email_notifications: false
    }
  } catch (error) {
    console.error('Error in getUserNotificationPreferences:', error)
    return null
  }
}

export function shouldShowDailyReminders(preferences: NotificationPreferences | null): boolean {
  return preferences?.daily_reminders ?? true
}

export function shouldShowPartnerSuggestions(preferences: NotificationPreferences | null): boolean {
  return preferences?.partner_suggestions ?? true
}

export function shouldShowRelationshipInsights(preferences: NotificationPreferences | null): boolean {
  return preferences?.relationship_insights ?? true
}

export function shouldSendEmailNotifications(preferences: NotificationPreferences | null): boolean {
  return preferences?.email_notifications ?? false
}