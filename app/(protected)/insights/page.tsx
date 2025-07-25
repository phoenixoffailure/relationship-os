// app/(protected)/insights/page.tsx
// Updated to use the new EnhancedInsightsLayout

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createBrowserClient } from '@supabase/ssr'
import { EnhancedInsightsLayout } from '@/components/insights/EnhancedInsightsLayout'

export default function InsightsPage() {
  const [user, setUser] = useState<any>(null)
  const [generatingInsights, setGeneratingInsights] = useState(false)

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
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
      }
    }
    getUser()
  }, [])

  const generateInsights = async () => {
    if (!user) return
    
    setGeneratingInsights(true)
    try {
      const response = await fetch('/api/insights/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()
      
      if (result.success) {
        // The EnhancedInsightsLayout will automatically refresh its data
        console.log('✅ Insights generated successfully')
      } else {
        alert('Error generating insights. Please try again.')
      }
    } catch (error) {
      console.error('Error generating insights:', error)
      alert('Error generating insights. Please try again.')
    } finally {
      setGeneratingInsights(false)
    }
  }

  const unreadCount = 0 // This will be calculated inside EnhancedInsightsLayout

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
              <Link href="/insights" className="text-calm-700 hover:text-calm-800 font-medium">
                Insights {unreadCount > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </Link>
              <Link href="/settings" className="text-gray-600 hover:text-gray-700">
                Settings
              </Link>
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

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Use the new EnhancedInsightsLayout component */}
        {user ? (
          <EnhancedInsightsLayout 
            user={user}
            onGenerateInsights={generateInsights}
            generatingInsights={generatingInsights}
          />
        ) : (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-calm-300 border-t-calm-600 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-500">Loading...</p>
          </div>
        )}
      </main>
    </div>
  )
}