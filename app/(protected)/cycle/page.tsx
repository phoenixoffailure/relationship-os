// app/(protected)/cycle/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { EnhancedCycleTracker } from '@/components/cycle/enhanced-cycle-tracker'

export default function CyclePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    getUser()
  }, [])

  if (loading) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>
  }

  if (!user) {
    return <div className="flex justify-center items-center min-h-screen">Please log in</div>
  }

  return <EnhancedCycleTracker userId={user.id} supabase={supabase} />
}