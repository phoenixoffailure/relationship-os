// app/(protected)/settings/page.tsx
// Fixed for mobile responsiveness and unified calm/mint color scheme

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { createBrowserClient } from '@supabase/ssr'
import { 
  User, 
  Save, 
  Trash2, 
  Shield, 
  Bell, 
  Heart,
  Calendar,
  Mail,
  Lock,
  Settings as SettingsIcon,
  AlertTriangle,
  Download,
  Upload
} from 'lucide-react'

interface UserProfile {
  id: string
  full_name: string
  email: string
  bio?: string
  anniversary_date?: string
  relationship_stage?: string
  notification_preferences?: {
    daily_reminders: boolean
    partner_suggestions: boolean
    relationship_insights: boolean
    email_notifications: boolean
  }
}

interface OnboardingData {
  anniversary_date?: string
  relationship_stage?: string
  relationship_length?: string
  love_language?: string
  communication_style?: string
  partner_love_language?: string
}

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<UserProfile>({
    id: '',
    full_name: '',
    email: '',
    bio: '',
    anniversary_date: '',
    relationship_stage: '',
    notification_preferences: {
      daily_reminders: true,
      partner_suggestions: true,
      relationship_insights: true,
      email_notifications: false
    }
  })
  
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) return

      setUser(authUser)

      // Load user profile
      const { data: userProfile } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      // Load onboarding data
      const { data: onboarding } = await supabase
        .from('enhanced_onboarding_responses')
        .select('*')
        .eq('user_id', authUser.id)
        .single()

      if (userProfile) {
        setProfile({
          id: userProfile.id,
          full_name: userProfile.full_name || '',
          email: userProfile.email || authUser.email || '',
          bio: userProfile.bio || '',
          anniversary_date: userProfile.anniversary_date || '',
          relationship_stage: userProfile.relationship_stage || '',
          notification_preferences: userProfile.notification_preferences || {
            daily_reminders: true,
            partner_suggestions: true,
            relationship_insights: true,
            email_notifications: false
          }
        })
      } else {
        // Create basic profile from auth user
        setProfile(prev => ({
          ...prev,
          id: authUser.id,
          full_name: authUser.user_metadata?.full_name || '',
          email: authUser.email || ''
        }))
      }

      if (onboarding) {
        setOnboardingData(onboarding)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
      setMessage('Error loading user data')
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async () => {
    if (!user) return

    try {
      setSaving(true)
      setMessage('')

      // Update user profile
      const { error: profileError } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          full_name: profile.full_name,
          email: profile.email,
          bio: profile.bio,
          anniversary_date: profile.anniversary_date || null,
          relationship_stage: profile.relationship_stage || null,
          notification_preferences: profile.notification_preferences,
          updated_at: new Date().toISOString()
        })

      if (profileError) throw profileError

      // Update onboarding data if changed
      if (profile.anniversary_date !== onboardingData.anniversary_date || 
          profile.relationship_stage !== onboardingData.relationship_stage) {
        
        const { error: onboardingError } = await supabase
          .from('enhanced_onboarding_responses')
          .upsert({
            user_id: user.id,
            anniversary_date: profile.anniversary_date || null,
            relationship_stage: profile.relationship_stage || null,
            relationship_length: onboardingData.relationship_length,
            love_language: onboardingData.love_language,
            communication_style: onboardingData.communication_style,
            partner_love_language: onboardingData.partner_love_language,
            updated_at: new Date().toISOString()
          })

        if (onboardingError) throw onboardingError
      }

      setMessage('Profile updated successfully!')
    } catch (error: any) {
      console.error('Error updating profile:', error)
      setMessage(`Error updating profile: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const exportData = async () => {
    try {
      // Get all user data
      const [
        { data: journals },
        { data: checkins },
        { data: insights },
        { data: suggestions }
      ] = await Promise.all([
        supabase.from('journal_entries').select('*').eq('user_id', user.id),
        supabase.from('daily_checkins').select('*').eq('user_id', user.id),
        supabase.from('relationship_insights').select('*').eq('user_id', user.id),
        supabase.from('partner_suggestions').select('*').eq('user_id', user.id)
      ])

      const exportData = {
        profile,
        onboardingData,
        journals: journals || [],
        checkins: checkins || [],
        insights: insights || [],
        suggestions: suggestions || [],
        exportDate: new Date().toISOString()
      }

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `relationshipos-data-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      setMessage('Data exported successfully!')
    } catch (error: any) {
      console.error('Error exporting data:', error)
      setMessage(`Error exporting data: ${error.message}`)
    }
  }

  const deleteAccount = async () => {
    if (!user || !showDeleteConfirm) return

    try {
      setSaving(true)
      setMessage('')

      // Delete user data in order (respecting foreign key constraints)
      await Promise.all([
        supabase.from('partner_suggestions').delete().eq('user_id', user.id),
        supabase.from('relationship_insights').delete().eq('user_id', user.id),
        supabase.from('daily_checkins').delete().eq('user_id', user.id),
        supabase.from('journal_entries').delete().eq('user_id', user.id),
        supabase.from('enhanced_onboarding_responses').delete().eq('user_id', user.id)
      ])

      // Delete relationship memberships
      await supabase.from('relationship_members').delete().eq('user_id', user.id)

      // Delete user profile
      await supabase.from('users').delete().eq('id', user.id)

      // Delete auth user (this will sign them out)
      await supabase.auth.admin.deleteUser(user.id)

      setMessage('Account deleted successfully. You will be redirected to the login page.')
      
      setTimeout(() => {
        window.location.href = '/login'
      }, 2000)
    } catch (error: any) {
      console.error('Error deleting account:', error)
      setMessage(`Error deleting account: ${error.message}`)
    } finally {
      setSaving(false)
      setShowDeleteConfirm(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-calm-50 to-mint-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-calm-300 border-t-calm-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-calm-600 font-medium">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-calm-50 to-mint-50">
      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-calm-500 to-mint-500 rounded-2xl shadow-lg mb-4">
              <SettingsIcon className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
            <p className="text-gray-600">Manage your account and preferences</p>
          </div>
        </div>

        {/* Status Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-xl border ${
            message.includes('Error') || message.includes('error')
              ? 'bg-red-50 text-red-700 border-red-200' 
              : 'bg-mint-50 text-mint-700 border-mint-200'
          }`}>
            <div className="flex items-center">
              {message.includes('Error') ? (
                <AlertTriangle className="w-5 h-5 mr-2 flex-shrink-0" />
              ) : (
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
              <span className="text-sm font-medium">{message}</span>
            </div>
          </div>
        )}

        <div className="space-y-6 sm:space-y-8">
          {/* Profile Settings */}
          <Card className="border-calm-200 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-6 h-6 text-calm-600 mr-2" />
                Profile Settings
              </CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    value={profile.full_name}
                    onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                    placeholder="Your full name"
                    className="border-gray-300 focus:border-calm-500 focus:ring-calm-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    placeholder="your.email@example.com"
                    className="border-gray-300 focus:border-calm-500 focus:ring-calm-500"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                  placeholder="Tell us a bit about yourself..."
                  rows={3}
                  className="border-gray-300 focus:border-calm-500 focus:ring-calm-500 resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Relationship Settings */}
          <Card className="border-calm-200 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="w-6 h-6 text-red-500 mr-2" />
                Relationship Settings
              </CardTitle>
              <CardDescription>Configure your relationship details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="anniversary_date">Anniversary Date</Label>
                  <Input
                    id="anniversary_date"
                    type="date"
                    value={profile.anniversary_date}
                    onChange={(e) => setProfile({ ...profile, anniversary_date: e.target.value })}
                    className="border-gray-300 focus:border-calm-500 focus:ring-calm-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="relationship_stage">Relationship Stage</Label>
                  <select
                    id="relationship_stage"
                    value={profile.relationship_stage}
                    onChange={(e) => setProfile({ ...profile, relationship_stage: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-calm-500 focus:ring-calm-500 focus:outline-none"
                  >
                    <option value="">Select stage...</option>
                    <option value="new">New (0-6 months)</option>
                    <option value="exploring">Exploring (6-18 months)</option>
                    <option value="committed">Committed (1.5-3 years)</option>
                    <option value="longterm">Long-term (3+ years)</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Preferences */}
          <Card className="border-calm-200 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="w-6 h-6 text-mint-600 mr-2" />
                Notification Preferences
              </CardTitle>
              <CardDescription>Choose what notifications you'd like to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Daily Reminders</p>
                    <p className="text-xs text-gray-500">Get reminded to complete your daily check-in</p>
                  </div>
                  <Switch
                    checked={profile.notification_preferences?.daily_reminders}
                    onCheckedChange={(checked) => 
                      setProfile({
                        ...profile,
                        notification_preferences: {
                          ...profile.notification_preferences!,
                          daily_reminders: checked
                        }
                      })
                    }
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Partner Suggestions</p>
                    <p className="text-xs text-gray-500">Receive AI-generated suggestions for your partner</p>
                  </div>
                  <Switch
                    checked={profile.notification_preferences?.partner_suggestions}
                    onCheckedChange={(checked) => 
                      setProfile({
                        ...profile,
                        notification_preferences: {
                          ...profile.notification_preferences!,
                          partner_suggestions: checked
                        }
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Relationship Insights</p>
                    <p className="text-xs text-gray-500">Get notified when new insights are available</p>
                  </div>
                  <Switch
                    checked={profile.notification_preferences?.relationship_insights}
                    onCheckedChange={(checked) => 
                      setProfile({
                        ...profile,
                        notification_preferences: {
                          ...profile.notification_preferences!,
                          relationship_insights: checked
                        }
                      })
                    }
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Email Notifications</p>
                    <p className="text-xs text-gray-500">Receive notifications via email</p>
                  </div>
                  <Switch
                    checked={profile.notification_preferences?.email_notifications}
                    onCheckedChange={(checked) => 
                      setProfile({
                        ...profile,
                        notification_preferences: {
                          ...profile.notification_preferences!,
                          email_notifications: checked
                        }
                      })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Data */}
          <Card className="border-calm-200 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-6 h-6 text-blue-600 mr-2" />
                Privacy & Data
              </CardTitle>
              <CardDescription>Manage your data and privacy settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gradient-to-r from-calm-50 to-mint-50 p-4 rounded-xl border border-calm-100">
                <div className="flex items-start space-x-3">
                  <Lock className="w-5 h-5 text-calm-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm font-semibold text-calm-700 mb-1">Your Privacy is Protected</h4>
                    <p className="text-xs text-gray-700 leading-relaxed">
                      Your journal entries and personal data remain completely private. We use advanced anonymization 
                      techniques to generate partner suggestions without exposing your private thoughts.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={exportData}
                  variant="outline"
                  className="flex-1 border-calm-300 text-calm-700 hover:bg-calm-50"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export My Data
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                  disabled
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Import Data (Coming Soon)
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              onClick={updateProfile}
              disabled={saving}
              className="flex-1 bg-gradient-to-r from-calm-600 to-mint-600 hover:from-calm-700 hover:to-mint-700 text-white py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {saving ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Save className="w-5 h-5 mr-2" />
                  Save Changes
                </div>
              )}
            </Button>
          </div>

          {/* Danger Zone */}
          <Card className="border-red-200 bg-red-50/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center text-red-700">
                <AlertTriangle className="w-6 h-6 text-red-600 mr-2" />
                Danger Zone
              </CardTitle>
              <CardDescription className="text-red-600">
                Irreversible actions that will permanently affect your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-white/60 p-4 rounded-xl border border-red-200">
                <h4 className="text-sm font-semibold text-red-700 mb-2">Delete Account</h4>
                <p className="text-xs text-red-600 mb-4">
                  This will permanently delete your account and all associated data. This action cannot be undone.
                </p>
                
                {!showDeleteConfirm ? (
                  <Button
                    onClick={() => setShowDeleteConfirm(true)}
                    variant="outline"
                    className="border-red-300 text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-red-700">
                      Are you absolutely sure? This cannot be undone.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={deleteAccount}
                        disabled={saving}
                        className="bg-red-600 hover:bg-red-700 text-white"
                      >
                        {saving ? (
                          <div className="flex items-center">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                            Deleting...
                          </div>
                        ) : (
                          'Yes, Delete Forever'
                        )}
                      </Button>
                      <Button
                        onClick={() => setShowDeleteConfirm(false)}
                        variant="outline"
                        className="border-gray-300"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}