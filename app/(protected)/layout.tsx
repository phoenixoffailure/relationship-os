'use client'

import { useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { ResponsiveHeader } from '@/components/navigation/ResponsiveHeader'
import { MobileBottomNav } from '@/components/navigation/MobileBottomNav'

// Import Supabase client directly to avoid module issues
import { createBrowserClient } from '@supabase/ssr'

// Create client inline to avoid import issues
function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    
    // Check if user is authenticated
    const checkUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error || !user) {
          router.push('/login')
          return
        }
        
        setUser(user)
      } catch (error) {
        console.error('Error checking authentication:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }

    checkUser()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (event === 'SIGNED_OUT' || !session) {
          setUser(null)
          router.push('/login')
        } else if (session?.user) {
          setUser(session.user)
        }
      } catch (error) {
        console.error('Error handling auth state change:', error)
        setUser(null)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [router])

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-3 border-calm-300 border-t-calm-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-calm-600 font-medium">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't render anything if no user (will redirect)
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Responsive Header */}
      <ResponsiveHeader userEmail={user.email} />
      
      {/* Main Content */}
      <main className="min-h-[calc(100vh-4rem)] pb-16 md:pb-0">
        {children}
      </main>
      
      {/* Mobile Bottom Navigation */}
      <MobileBottomNav userEmail={user.email} />
    </div>
  )
}