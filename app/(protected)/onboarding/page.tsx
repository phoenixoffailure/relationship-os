// app/(protected)/onboarding/page.tsx - FIXED for Next.js 15
// Converted to Client Component to support dynamic imports with ssr: false

'use client'

import { Suspense } from 'react'
import dynamic from 'next/dynamic'

// Dynamic import to avoid SSR issues with the wizard component
const EnhancedOnboardingWizard = dynamic(
  () => import('@/components/onboarding/EnhancedOnboardingWizard'),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-brand-teal border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading onboarding...</p>
        </div>
      </div>
    )
  }
)

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-brand-teal mb-2">
              Complete Your Profile
            </h1>
            <p className="text-lg text-gray-600">
              Help us understand your relationship style and preferences
            </p>
          </div>
          
          <Suspense 
            fallback={
              <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                  <div className="w-8 h-8 border-4 border-brand-teal border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading onboarding...</p>
                </div>
              </div>
            }
          >
            <EnhancedOnboardingWizard />
          </Suspense>
        </div>
      </div>
    </div>
  )
}