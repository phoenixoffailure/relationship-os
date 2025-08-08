// app/(protected)/relationships/page.tsx
// Clean relationships page using the new CleanRelationshipsLayout component

'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import CleanRelationshipsLayout from '@/components/relationships/CleanRelationshipsLayout'

export default function RelationshipsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
      }
      setLoading(false)
    }
    getUser()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-warm-white to-brand-cool-gray flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-brand-teal border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-brand-slate">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-warm-white to-brand-cool-gray flex items-center justify-center">
        <div className="text-center">
          <p className="text-brand-slate">Please log in to view your relationships.</p>
        </div>
      </div>
    )
  }

  return <CleanRelationshipsLayout user={user} />
}