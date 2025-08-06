// FILE LOCATION: app/(protected)/onboarding/page.tsx
// Replace entire file with this updated version

'use client'

import { Suspense, useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { createBrowserClient } from '@supabase/ssr'

// Dynamic import the new Universal Profile Onboarding
const UniversalProfileOnboarding = dynamic(
  () => import('@/components/onboarding/UniversalProfileOnboarding'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading universal profile setup...</p>
        </div>
      </div>
    )
  }
)

// Dynamic import for relationship-specific onboarding (shown after universal)
const RelationshipOnboarding = dynamic(
  () => import('@/components/onboarding/RelationshipOnboarding'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading relationship setup...</p>
        </div>
      </div>
    )
  }
)

export default function OnboardingPage() {
  const [hasUniversalProfile, setHasUniversalProfile] = useState<boolean | null>(null)
  const [relationshipId, setRelationshipId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    checkUserProfileStatus()
  }, [])

  const checkUserProfileStatus = async () => {
    try {
      // Check if user has universal profile
      const response = await fetch('/api/onboarding/universal', {
        method: 'GET',
      })
      
      if (response.ok) {
        const data = await response.json()
        setHasUniversalProfile(data.exists)
        
        // If they have universal profile, check for pending relationship onboarding
        if (data.exists) {
          // Check URL params for relationship ID (if coming from relationship creation)
          const urlParams = new URLSearchParams(window.location.search)
          const relId = urlParams.get('relationship')
          if (relId) {
            setRelationshipId(relId)
          }
        }
      }
    } catch (error) {
      console.error('Error checking profile status:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-gray-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Checking profile status...</p>
        </div>
      </div>
    )
  }

  // Show relationship onboarding if user has universal profile and a relationship ID
  if (hasUniversalProfile && relationshipId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Suspense 
              fallback={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading relationship setup...</p>
                  </div>
                </div>
              }
            >
              <RelationshipOnboarding 
                relationshipId={relationshipId}
                partnerName="Your Connection" // This could be fetched from the relationship
              />
            </Suspense>
          </div>
        </div>
      </div>
    )
  }

  // Show universal profile onboarding for new users
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome to RelationshipOS
            </h1>
            <p className="text-lg text-gray-600">
              Let's create your universal relationship intelligence profile
            </p>
            <p className="text-sm text-gray-500 mt-2">
              This one-time setup helps us understand your fundamental interpersonal needs
            </p>
          </div>
          
          <Suspense 
            fallback={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading universal profile setup...</p>
                </div>
              </div>
            }
          >
            <UniversalProfileOnboarding />
          </Suspense>
        </div>
      </div>
    </div>
  )
}