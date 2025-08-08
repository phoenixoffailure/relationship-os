// app/(protected)/onboarding/relationship/[id]/page.tsx
// Relationship onboarding page that uses the RelationshipOnboarding component

'use client'

import { useEffect, useState } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import RelationshipOnboarding from '@/components/onboarding/RelationshipOnboarding'
import { createBrowserClient } from '@supabase/ssr'

export default function RelationshipOnboardingPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const relationshipId = params.id as string
  const isNew = searchParams.get('isNew') === 'true'
  
  const [loading, setLoading] = useState(true)
  const [partnerName, setPartnerName] = useState<string>('')
  const [hasProfile, setHasProfile] = useState(false)
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const checkRelationshipAndProfile = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          window.location.href = '/login'
          return
        }

        // Check if user is a member of this relationship
        const { data: memberData, error: memberError } = await supabase
          .from('relationship_members')
          .select(`
            relationship_id,
            relationships (
              id,
              name,
              relationship_type
            )
          `)
          .eq('user_id', user.id)
          .eq('relationship_id', relationshipId)
          .single()

        if (memberError || !memberData) {
          console.error('User is not a member of this relationship')
          window.location.href = '/relationships'
          return
        }

        // Get partner name for display
        const { data: otherMembers } = await supabase
          .from('relationship_members')
          .select(`
            users (
              full_name,
              email
            )
          `)
          .eq('relationship_id', relationshipId)
          .neq('user_id', user.id)
          .single()

        if (otherMembers?.users) {
          setPartnerName(otherMembers.users.full_name || otherMembers.users.email || 'Your Partner')
        } else {
          setPartnerName(memberData.relationships?.name || 'Your Partner')
        }

        // Check if profile already exists
        const { data: profileData } = await supabase
          .from('relationship_profiles')
          .select('id')
          .eq('user_id', user.id)
          .eq('relationship_id', relationshipId)
          .single()

        if (profileData && !isNew) {
          // Profile exists and not forcing new onboarding
          setHasProfile(true)
        }

        setLoading(false)
      } catch (error) {
        console.error('Error checking relationship:', error)
        setLoading(false)
      }
    }

    checkRelationshipAndProfile()
  }, [relationshipId, isNew])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading relationship onboarding...</p>
        </div>
      </div>
    )
  }

  if (hasProfile && !isNew) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Relationship Profile Already Complete
            </h2>
            <p className="text-gray-600 mb-6">
              You've already set up your profile for this relationship with {partnerName}.
            </p>
            <div className="space-y-4">
              <button
                onClick={() => window.location.href = `/onboarding/relationship/${relationshipId}?isNew=true`}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:shadow-lg transition-all"
              >
                Update Relationship Profile
              </button>
              <button
                onClick={() => window.location.href = '/dashboard'}
                className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-all"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return <RelationshipOnboarding relationshipId={relationshipId} partnerName={partnerName} />
}