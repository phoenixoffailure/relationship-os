'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createBrowserClient } from '@supabase/ssr'

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState({
    full_name: '',
    email: ''
  })
  const [onboardingData, setOnboardingData] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [activeTab, setActiveTab] = useState('profile')

  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    sharingPreference: 'general',
    researchConsent: false,
    cycleTracking: 'no',
    emailNotifications: true,
    insightNotifications: true
  })

  // Account actions - UPDATED for proper deletion
  const [showDataExport, setShowDataExport] = useState(false)
  const [showDeleteAccount, setShowDeleteAccount] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [deleteStep, setDeleteStep] = useState(1) // 1: confirmation, 2: processing, 3: success

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

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

      // Load onboarding responses for privacy settings
      const { data: onboardingResponse } = await supabase
        .from('onboarding_responses')
        .select('responses')
        .eq('user_id', user.id)
        .single()

      if (onboardingResponse?.responses) {
        const responses = onboardingResponse.responses
        setOnboardingData(responses)
        setPrivacySettings({
          sharingPreference: responses.sharingPreference || 'general',
          researchConsent: responses.researchConsent || false,
          cycleTracking: responses.cycleTracking || 'no',
          emailNotifications: true, // Default values for new settings
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

      setOnboardingData(updatedResponses)
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

      setOnboardingData(updatedResponses)
      setMessage('Preferences updated successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error: any) {
      setMessage(`Error: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  const exportData = async () => {
    if (!user) return

    try {
      setMessage('Preparing data export...')

      // Collect all user data - enhanced to include more tables
      const [journalData, checkinData, insightsData, relationshipData, onboardingEnhancedData] = await Promise.all([
        supabase.from('journal_entries').select('*').eq('user_id', user.id),
        supabase.from('daily_checkins').select('*').eq('user_id', user.id),
        supabase.from('relationship_insights').select('*').eq('generated_for_user', user.id),
        supabase.from('relationship_members').select(`
          *,
          relationships (*)
        `).eq('user_id', user.id),
        // Try to get enhanced onboarding if it exists
        supabase.from('enhanced_onboarding_responses').select('*').eq('user_id', user.id)
      ])

      const exportData = {
        user_profile: profile,
        onboarding: onboardingData,
        enhanced_onboarding: onboardingEnhancedData.data || [],
        journals: journalData.data || [],
        checkins: checkinData.data || [],
        insights: insightsData.data || [],
        relationships: relationshipData.data || [],
        exportedAt: new Date().toISOString(),
        export_note: 'Complete export of your RelationshipOS data'
      }

      // Create and download file
      const dataStr = JSON.stringify(exportData, null, 2)
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
      
      const exportFileDefaultName = `relationshipos-data-${new Date().toISOString().split('T')[0]}.json`
      
      const linkElement = document.createElement('a')
      linkElement.setAttribute('href', dataUri)
      linkElement.setAttribute('download', exportFileDefaultName)
      linkElement.click()

      setMessage('Data exported successfully! 📥')
      setTimeout(() => setMessage(''), 3000)
    } catch (error: any) {
      setMessage(`Export error: ${error.message}`)
      setTimeout(() => setMessage(''), 3000)
    }
  }

  // FIXED: Proper account deletion using API route
  const deleteAccount = async () => {
    if (!user || deleteConfirmText !== 'DELETE') return

    setDeleteLoading(true)
    setDeleteStep(2) // Processing step
    setMessage('')

    try {
      console.log('🗑️ Starting account deletion...')
      
      const response = await fetch('/api/account/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          isAdminDelete: false
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to delete account')
      }

      console.log('Account deletion result:', result)

      if (result.success) {
        setDeleteStep(3) // Success step
        setMessage(`Account deleted successfully! ${result.warning || ''} You will be logged out shortly.`)
        
        // Show success message then logout and redirect
        setTimeout(async () => {
          await supabase.auth.signOut()
          window.location.href = '/?deleted=true'
        }, 3000)
      } else {
        throw new Error(result.error || 'Account deletion failed')
      }

    } catch (error: any) {
      console.error('Account deletion error:', error)
      setMessage(`Error deleting account: ${error.message}`)
      setDeleteStep(1) // Back to confirmation
    } finally {
      setDeleteLoading(false)
    }
  }

  const resetDeleteState = () => {
    setShowDeleteAccount(false)
    setDeleteConfirmText('')
    setDeleteStep(1)
    setDeleteLoading(false)
    setMessage('')
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'privacy', label: 'Privacy', icon: '🔒' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
    { id: 'data', label: 'Data & Account', icon: '📊' }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-calm-50 to-mint-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-calm-300 border-t-calm-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-calm-50 to-mint-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-calm-800">Relationship OS</h1>
            </div>
            <nav className="flex items-center space-x-6">
              <Link href="/dashboard" className="text-gray-600 hover:text-gray-700">
                Dashboard
              </Link>
              <Link href="/journal" className="text-gray-600 hover:text-gray-700">
                Journal
              </Link>
              <Link href="/checkin" className="text-gray-600 hover:text-gray-700">
                Check-In
              </Link>
              <Link href="/insights" className="text-gray-600 hover:text-gray-700">
                Insights
              </Link>
              <span className="text-calm-700 font-medium">Settings</span>
              <Button 
                variant="ghost" 
                className="text-gray-600"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Settings</h2>
          <p className="text-gray-600 mt-2">Manage your account, privacy, and preferences</p>
        </div>

        {/* Success/Error Messages */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('Error') || message.includes('error') 
              ? 'bg-red-50 text-red-700 border border-red-200' 
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}>
            {message}
          </div>
        )}

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center space-x-3 ${
                    activeTab === tab.id
                      ? 'bg-calm-100 text-calm-800 border border-calm-200'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200">
              
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        id="fullName"
                        type="text"
                        value={profile.full_name}
                        onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-calm-500 focus:border-calm-500"
                        placeholder="Your full name"
                      />
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-calm-500 focus:border-calm-500"
                        placeholder="your@email.com"
                      />
                      <p className="text-sm text-gray-500 mt-2">
                        You'll receive a confirmation email if you change your email address.
                      </p>
                    </div>

                    <Button
                      onClick={updateProfile}
                      disabled={saving}
                      className="bg-calm-600 hover:bg-calm-700"
                    >
                      {saving ? 'Saving...' : 'Update Profile'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Privacy & Sharing</h3>
                  
                  <div className="space-y-6">
                    <div className="bg-calm-50 border border-calm-200 rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <svg className="w-6 h-6 text-calm-600 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        <div>
                          <h4 className="font-semibold text-calm-800 mb-1">Your Privacy Promise</h4>
                          <p className="text-calm-700 text-sm">
                            Your journal entries always stay completely private. AI insights are generated without revealing personal details.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Partner insight sharing level
                      </label>
                      <div className="space-y-3">
                        {[
                          { 
                            value: 'general', 
                            label: 'General suggestions only',
                            description: 'Basic recommendations like "Consider planning quality time"'
                          },
                          { 
                            value: 'patterns', 
                            label: 'Pattern insights',
                            description: 'Trends in your mood/connection without specific details'
                          },
                          { 
                            value: 'detailed', 
                            label: 'Detailed coaching',
                            description: 'Specific insights based on your preferences and communication style'
                          },
                        ].map((option) => (
                          <label key={option.value} className="flex items-start space-x-3 cursor-pointer">
                            <input
                              type="radio"
                              name="sharingPreference"
                              value={option.value}
                              checked={privacySettings.sharingPreference === option.value}
                              onChange={(e) => setPrivacySettings(prev => ({ ...prev, sharingPreference: e.target.value }))}
                              className="mt-1 h-4 w-4 text-calm-600 focus:ring-calm-500"
                            />
                            <div className="flex-1">
                              <div className="font-medium text-gray-900">{option.label}</div>
                              <div className="text-sm text-gray-600">{option.description}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={privacySettings.researchConsent}
                          onChange={(e) => setPrivacySettings(prev => ({ ...prev, researchConsent: e.target.checked }))}
                          className="mt-1 h-4 w-4 text-calm-600 focus:ring-calm-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">Research participation</div>
                          <div className="text-sm text-gray-600">
                            Allow anonymized data to be used for relationship research to improve the platform
                          </div>
                        </div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Menstrual cycle tracking
                      </label>
                      <div className="space-y-2">
                        {[
                          { value: 'yes', label: 'Enable cycle tracking with partner insights' },
                          { value: 'private', label: 'Track privately (no partner sharing)' },
                          { value: 'no', label: 'Disable cycle tracking' }
                        ].map((option) => (
                          <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="radio"
                              name="cycleTracking"
                              value={option.value}
                              checked={privacySettings.cycleTracking === option.value}
                              onChange={(e) => setPrivacySettings(prev => ({ ...prev, cycleTracking: e.target.value }))}
                              className="h-4 w-4 text-calm-600 focus:ring-calm-500"
                            />
                            <span className="text-gray-900">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={updatePrivacySettings}
                      disabled={saving}
                      className="bg-calm-600 hover:bg-calm-700"
                    >
                      {saving ? 'Saving...' : 'Update Privacy Settings'}
                    </Button>
                  </div>
                </div>
              )}

              {/* Preferences Tab */}
              {activeTab === 'preferences' && (
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Relationship Preferences</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Love Languages</h4>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-sm text-gray-700 mb-2">How you show love</label>
                          <div className="space-y-2">
                            {[
                              { value: 'words', label: 'Words of Affirmation' },
                              { value: 'time', label: 'Quality Time' },
                              { value: 'touch', label: 'Physical Touch' },
                              { value: 'gifts', label: 'Gifts' },
                              { value: 'acts', label: 'Acts of Service' }
                            ].map((option) => (
                              <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={onboardingData.loveLanguageGive?.includes(option.value) || false}
                                  onChange={(e) => {
                                    const current = onboardingData.loveLanguageGive || []
                                    const updated = e.target.checked 
                                      ? [...current, option.value]
                                      : current.filter((item: string) => item !== option.value)
                                    updateOnboardingPreferences({ loveLanguageGive: updated })
                                  }}
                                  className="h-4 w-4 text-calm-600 focus:ring-calm-500 border-gray-300 rounded"
                                />
                                <span className="text-gray-900">{option.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Relationship Goals</h4>
                      <div className="space-y-2">
                        {[
                          { value: 'communication', label: 'Better communication' },
                          { value: 'intimacy', label: 'Deeper intimacy' },
                          { value: 'conflict', label: 'Healthier conflict resolution' },
                          { value: 'time', label: 'More quality time' },
                          { value: 'appreciation', label: 'More appreciation' },
                          { value: 'goals', label: 'Aligning future goals' }
                        ].map((option) => (
                          <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={onboardingData.relationshipGoals?.includes(option.value) || false}
                              onChange={(e) => {
                                const current = onboardingData.relationshipGoals || []
                                const updated = e.target.checked 
                                  ? [...current, option.value]
                                  : current.filter((item: string) => item !== option.value)
                                updateOnboardingPreferences({ relationshipGoals: updated })
                              }}
                              className="h-4 w-4 text-calm-600 focus:ring-calm-500 border-gray-300 rounded"
                            />
                            <span className="text-gray-900">{option.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Notifications</h4>
                      <div className="space-y-3">
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={privacySettings.emailNotifications}
                            onChange={(e) => setPrivacySettings(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                            className="h-4 w-4 text-calm-600 focus:ring-calm-500 border-gray-300 rounded"
                          />
                          <div>
                            <div className="font-medium text-gray-900">Email notifications</div>
                            <div className="text-sm text-gray-600">Weekly relationship tips and reminders</div>
                          </div>
                        </label>

                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={privacySettings.insightNotifications}
                            onChange={(e) => setPrivacySettings(prev => ({ ...prev, insightNotifications: e.target.checked }))}
                            className="h-4 w-4 text-calm-600 focus:ring-calm-500 border-gray-300 rounded"
                          />
                          <div>
                            <div className="font-medium text-gray-900">New insight notifications</div>
                            <div className="text-sm text-gray-600">Get notified when new AI insights are ready</div>
                          </div>
                        </label>
                      </div>

                      <Button
                        onClick={updatePrivacySettings}
                        disabled={saving}
                        className="bg-calm-600 hover:bg-calm-700 mt-4"
                      >
                        {saving ? 'Saving...' : 'Update Notifications'}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Data & Account Tab - ENHANCED with proper deletion */}
              {activeTab === 'data' && (
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">Data & Account Management</h3>
                  
                  <div className="space-y-8">
                    {/* Data Export - Enhanced */}
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 mb-2">Export Your Data</h4>
                      <p className="text-gray-600 mb-4">
                        Download all your relationship data including journal entries, check-ins, insights, and onboarding responses.
                      </p>
                      <Button
                        onClick={exportData}
                        variant="outline"
                        className="border-calm-300 text-calm-700"
                      >
                        📥 Export All Data
                      </Button>
                    </div>

                    {/* Account Deletion - COMPLETELY REWRITTEN */}
                    <div className="border border-red-200 rounded-lg p-6 bg-red-50">
                      <h4 className="font-semibold text-red-900 mb-2">Delete Account</h4>
                      <p className="text-red-700 mb-4">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                      
                      {!showDeleteAccount ? (
                        <Button
                          onClick={() => setShowDeleteAccount(true)}
                          variant="outline"
                          className="border-red-300 text-red-700 hover:bg-red-100"
                        >
                          Delete Account
                        </Button>
                      ) : (
                        <div className="space-y-4">
                          {deleteStep === 1 && (
                            <div className="space-y-4">
                              <div className="bg-red-100 border border-red-300 rounded-lg p-4">
                                <h5 className="font-semibold text-red-900 mb-2">⚠️ Warning: This will permanently delete:</h5>
                                <ul className="list-disc list-inside text-sm text-red-800 space-y-1">
                                  <li>Your profile and account data</li>
                                  <li>All journal entries and check-ins</li>
                                  <li>Relationships you created (other members will lose access)</li>
                                  <li>All insights and partner suggestions</li>
                                  <li>Your onboarding responses and preferences</li>
                                </ul>
                                <p className="mt-3 font-medium text-red-900">This action cannot be undone!</p>
                              </div>
                              
                              <div>
                                <label className="block text-sm font-medium text-red-900 mb-2">
                                  Type "DELETE" to confirm account deletion
                                </label>
                                <input
                                  type="text"
                                  value={deleteConfirmText}
                                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                                  className="w-full px-3 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                                  placeholder="DELETE"
                                />
                              </div>
                              
                              <div className="flex space-x-3">
                                <Button
                                  onClick={deleteAccount}
                                  disabled={deleteConfirmText !== 'DELETE' || deleteLoading}
                                  className="bg-red-600 hover:bg-red-700 text-white"
                                >
                                  {deleteLoading ? 'Deleting...' : 'Delete Account Permanently'}
                                </Button>
                                <Button
                                  onClick={resetDeleteState}
                                  disabled={deleteLoading}
                                  variant="outline"
                                  className="border-gray-300"
                                >
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          )}

                          {deleteStep === 2 && (
                            <div className="text-center py-8">
                              <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                              <h3 className="text-lg font-medium text-red-900 mb-2">Deleting Account...</h3>
                              <p className="text-red-700">
                                We're permanently removing all your data. This may take a moment.
                              </p>
                            </div>
                          )}

                          {deleteStep === 3 && (
                            <div className="text-center py-8">
                              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </div>
                              <h3 className="text-lg font-medium text-green-900 mb-2">Account Deleted Successfully</h3>
                              <p className="text-green-700">
                                Your account and all data have been permanently removed. You will be logged out shortly.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Support */}
                    <div className="border border-gray-200 rounded-lg p-6">
                      <h4 className="font-semibold text-gray-900 mb-2">Need Help?</h4>
                      <p className="text-gray-600 mb-4">
                        Get support or provide feedback about your experience.
                      </p>
                      <div className="flex space-x-3">
                        <Button
                          variant="outline"
                          className="border-calm-300 text-calm-700"
                          onClick={() => window.open('mailto:support@relationshipos.com', '_blank')}
                        >
                          📧 Contact Support
                        </Button>
                        <Button
                          variant="outline"
                          className="border-calm-300 text-calm-700"
                          onClick={() => window.open('mailto:feedback@relationshipos.com', '_blank')}
                        >
                          💬 Send Feedback
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}