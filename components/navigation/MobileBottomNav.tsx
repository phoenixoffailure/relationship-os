'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { 
  Home, 
  BookOpen, 
  Heart, 
  Lightbulb, 
  MoreHorizontal,
  Users,
  Settings,
  Shield,
  LogOut,
  X,
  Calendar
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

// Import Supabase client directly
import { createBrowserClient } from '@supabase/ssr'

function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

interface NavItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

// Main navigation items (always visible in bottom nav)
const mainNavItems: NavItem[] = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/journal', label: 'Journal', icon: BookOpen },
  { href: '/checkin', label: 'Check-in', icon: Heart },
  { href: '/insights', label: 'Insights', icon: Lightbulb },
]

// Secondary items (shown in "More" menu)
const secondaryNavItems: NavItem[] = [
  { href: '/relationships', label: 'Relationships', icon: Users },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function MobileBottomNav({ userEmail }: { userEmail?: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMoreOpen, setIsMoreOpen] = useState(false)

  // Check if current page is active
  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/')
  }

  // Handle logout
  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  // Check if user is admin
  const isAdmin = userEmail && ['jwalkwithyou@gmail.com'].includes(userEmail)

  return (
    <>
      {/* Bottom Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:hidden">
        <div className="grid grid-cols-5 h-16">
          {/* Main Navigation Items */}
          {mainNavItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
                  active
                    ? 'text-calm-600 bg-calm-50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? 'text-calm-600' : ''}`} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            )
          })}

          {/* More Menu Button */}
          <button 
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            className="flex flex-col items-center justify-center space-y-1 text-gray-500 hover:text-gray-700 transition-colors"
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-xs font-medium">More</span>
          </button>
        </div>
      </div>

      {/* More Menu Overlay */}
      {isMoreOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] md:hidden" onClick={() => setIsMoreOpen(false)}>
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-lg p-6 z-[70]" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">More Options</h3>
              <button onClick={() => setIsMoreOpen(false)} className="p-2">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Items */}
            <div className="grid gap-4">
              {/* Secondary Navigation */}
              {secondaryNavItems.map((item) => {
                const Icon = item.icon
                const active = isActive(item.href)
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMoreOpen(false)}
                    className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                      active
                        ? 'bg-calm-50 text-calm-700'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )
              })}

              {/* Admin Link (if applicable) */}
              {isAdmin && (
                <Link
                  href="/admin/users"
                  onClick={() => setIsMoreOpen(false)}
                  className="flex items-center space-x-3 p-3 rounded-lg hover:bg-orange-50 text-orange-600"
                >
                  <Shield className="w-5 h-5" />
                  <span className="font-medium">Admin</span>
                </Link>
              )}

              {/* Logout */}
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-red-50 text-red-600 justify-start h-auto"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Spacer to prevent content from being hidden behind fixed nav */}
      <div className="h-16 md:hidden" />
    </>
  )
}