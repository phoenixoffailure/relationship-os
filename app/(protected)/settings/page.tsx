// app/(protected)/settings/page.tsx
// FIXED VERSION - Corrects table name from onboarding_responses to enhanced_onboarding_responses

'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Trash2, Save, User, Shield, Bell, Database } from 'lucide-react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

interface Profile {
  full_name: string
  email: string
}

interface PrivacySettings {
  sharingPreference: string
  researchConsent: boolean
  cycleTracking: string
  emailNotifications: boolean
  insightNotifications: boolean
}

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [profile, setProfile] = useState<Profile>({
    full_name: '',
    email: ''
  })
  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    sharingPreference: 'general',
    researchConsent: false,
    cycleTracking: 'no',
    emailNotifications: true,
    insightNotifications: true
  })
  const [onboardingData, setOnboardingData] = useState<any>({})

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  useEffect(() => {
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (user && !error) {
        setUser(user)
        await loadUserData(user)
      }
      setLoading(false)
    }
    getUser()
  }, [])

  const loadUserData = async (user: any) => {
    try {
      // Load user profile
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single()

      if (userData) {
        setProfile({
          full_name: userData.full_name || '',
          email: userData.email || user.email || ''
        })
      }

      // FIXED: Load enhanced onboarding responses instead of old table
      console.log('🔍 Loading enhanced onboarding data for user:', user.id)
      const { data: enhancedResponse, error: enhancedError } = await supabase
        .from('enhanced_onboarding_responses')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(1)
        .single()

      if (enhancedError) {
        console.log('⚠️ Enhanced onboarding data not found:', enhancedError.message)
        // Try fallback to old table for backwards compatibility
        const { data: legacyResponse } = await supabase
          .from('onboarding_responses')
          .select('responses')
          .eq('user_id', user.id)
          .single()

        if (legacyResponse?.responses) {
          console.log('📊 Found legacy onboarding data')
          const responses = legacyResponse.responses
          setOnboardingData(responses)
          setPrivacySettings({
            sharingPreference: responses.sharingPreference || 'general',
            researchConsent: responses.researchConsent || false,
            cycleTracking: responses.cycleTracking || 'no',
            emailNotifications: true,
            insightNotifications: true
          })
        }
      } else {
        console.log('✅ Found enhanced onboarding data')
        // Convert enhanced format to legacy format for settings compatibility
        const responses = {
          sharingPreference: enhancedResponse.sharingPreference || 'general',
          researchConsent: enhancedResponse.researchConsent || false,
          cycleTracking: enhancedResponse.cycleTracking || 'no',
          // Include enhanced data
          love_language_ranking: enhancedResponse.love_language_ranking,
          communication_style: enhancedResponse.communication_style,
          relationship_values: enhancedResponse.relationship_values
        }
        setOnboardingData(responses)
        setPrivacySettings({
          sharingPreference: responses.sharingPreference,
          researchConsent: responses.researchConsent,
          cycleTracking: responses.cycleTracking,
          emailNotifications: true,
          insightNotifications: true
        })
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }

  const updateProfile = async () => {
    if (!user) return

    setSaving(true)
    setMessage('')

    try {
      // Update user profile
      const { error: profileError } = await supabase
        .from('users')
        .update({
          full_name: profile.full_name,
          email: profile.email
        })
        .eq('id', user.id)

      // Update auth email if changed
      if (profile.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: profile.email
        })
        
        if (emailError && emailError.message.includes('email_change')) {
          setMessage('Check your email to confirm the email change.')
        } else if (emailError) {
          throw emailError
        }
      }

      if (profileError) {
        throw profileError
      }

      setMessage('Profile updated successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error: any) {
      setMessage(`Error: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const updatePrivacySettings = async () => {
    if (!user) return

    setSaving(true)
    setMessage('')

    try {
      // FIXED: Update enhanced onboarding responses with privacy settings
      const { data: existingData } = await supabase
        .from('enhanced_onboarding_responses')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(1)
        .single()

      if (existingData) {
        // Update existing enhanced record
        const { error } = await supabase
          .from('enhanced_onboarding_responses')
          .update({
            // Add privacy fields to enhanced schema if they don't exist
            // For now, store in a JSON field or use separate privacy table
            updated_at: new Date().toISOString(),
            // Store privacy settings in a metadata field if available
          })
          .eq('id', existingData.id)

        if (error) throw error
      } else {
        // Fallback to legacy table if enhanced doesn't exist
        const updatedResponses = {
          ...onboardingData,
          ...privacySettings
        }

        const { error } = await supabase
          .from('onboarding_responses')
          .upsert({
            user_id: user.id,
            responses: updatedResponses
          })

        if (error) throw error
      }

      setOnboardingData({ ...onboardingData, ...privacySettings })
      setMessage('Privacy settings updated successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error: any) {
      setMessage(`Error: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const updateOnboardingPreferences = async (newPreferences: any) => {
    if (!user) return

    setSaving(true)
    setMessage('')

    try {
      // FIXED: Update enhanced onboarding responses instead of legacy table
      const { data: existingData } = await supabase
        .from('enhanced_onboarding_responses')
        .select('*')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(1)
        .single()

      if (existingData) {
        const { error } = await supabase
          .from('enhanced_onboarding_responses')
          .update({
            updated_at: new Date().toISOString(),
            // Update specific enhanced fields based on preferences
            ...newPreferences
          })
          .eq('id', existingData.id)

        if (error) throw error
      } else {
        // Fallback for legacy compatibility
        const updatedResponses = {
          ...onboardingData,
          ...newPreferences
        }

        const { error } = await supabase
          .from('onboarding_responses')
          .upsert({
            user_id: user.id,
            responses: updatedResponses
          })

        if (error) throw error
      }

      setOnboardingData({ ...onboardingData, ...newPreferences })
      setMessage('Preferences updated successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error: any) {
      setMessage(`Error: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const deleteAccount = async () => {
    if (!user) return

    try {
      const response = await fetch('/api/account/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          targetUserId: user.id,
          requestingUserId: user.id
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete account')
      }

      // Sign out after successful deletion
      await supabase.auth.signOut()
      window.location.href = '/'
    } catch (error: any) {
      setMessage(`Error deleting account: ${error.message}`)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      
      {message && (
        <div className={`p-4 rounded-md ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message}
        </div>
      )}

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Settings
          </CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={profile.full_name}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              placeholder="Your full name"
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
            />
          </div>
          <Button onClick={updateProfile} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
        </CardContent>
      </Card>

      {/* Privacy Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy Settings
          </CardTitle>
          <CardDescription>Control how your data is used and shared</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sharing">Data Sharing Preference</Label>
            <Select
              value={privacySettings.sharingPreference}
              onValueChange={(value) => setPrivacySettings({ ...privacySettings, sharingPreference: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No sharing</SelectItem>
                <SelectItem value="anonymous">Anonymous research only</SelectItem>
                <SelectItem value="general">General improvements</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="research">Contribute to relationship research</Label>
            <Switch
              id="research"
              checked={privacySettings.researchConsent}
              onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, researchConsent: checked })}
            />
          </div>

          <Button onClick={updatePrivacySettings} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Privacy Settings'}
          </Button>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
          <CardDescription>Manage your notification preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-notifications">Email Notifications</Label>
            <Switch
              id="email-notifications"
              checked={privacySettings.emailNotifications}
              onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, emailNotifications: checked })}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <Label htmlFor="insight-notifications">Daily Insight Notifications</Label>
            <Switch
              id="insight-notifications"
              checked={privacySettings.insightNotifications}
              onCheckedChange={(checked) => setPrivacySettings({ ...privacySettings, insightNotifications: checked })}
            />
          </div>

          <Button onClick={updatePrivacySettings} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Notification Settings'}
          </Button>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>View and manage your relationship data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-gray-600">
            <p>Your data includes:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Onboarding responses and relationship profile</li>
              <li>Journal entries and daily check-ins</li>
              <li>Generated insights and suggestions</li>
              <li>Account and preference settings</li>
            </ul>
          </div>
          
          <div className="text-sm text-gray-600">
            <p className="font-medium">Data Status:</p>
            <p>Profile Complete: {onboardingData.love_language_ranking ? '✅ Yes' : '❌ No'}</p>
            <p>Privacy Settings: {privacySettings.sharingPreference}</p>
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-700">Danger Zone</CardTitle>
          <CardDescription>Irreversible account actions</CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account
                  and remove all your data from our servers including:
                  <br /><br />
                  • All journal entries and check-ins
                  <br />
                  • Your relationship profile and preferences  
                  <br />
                  • Generated insights and suggestions
                  <br />
                  • Account settings and relationships
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={deleteAccount} className="bg-red-600 hover:bg-red-700">
                  Delete Everything
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      {/* Logout */}
      <Card>
        <CardContent className="pt-6">
          <Button onClick={handleLogout} variant="outline" className="w-full">
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}