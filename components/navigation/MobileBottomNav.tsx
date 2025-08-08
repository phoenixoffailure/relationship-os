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
  Calendar,
  MessageCircle,
  BarChart3,
  Briefcase,
  Target
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useRelationshipContext, useCurrentRelationshipType } from '@/lib/contexts/RelationshipContext'
import { getCheckinIcon, getRelationshipColors } from '@/lib/ui/relationship-aware-icons'

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
// Note: Check-in icon will be dynamically determined based on relationship context
const getMainNavItems = (relationshipType: string): NavItem[] => [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/journal', label: 'Journal', icon: BookOpen },
  { 
    href: '/checkin', 
    label: 'Check-in', 
    icon: getCheckinIconComponent(relationshipType) 
  },
  { href: '/insights', label: 'Insights', icon: Lightbulb },
]

// Helper function to get appropriate check-in icon based on relationship type
function getCheckinIconComponent(relationshipType: string): React.ComponentType<{ className?: string }> {
  switch (relationshipType) {
    case 'romantic':
      return Heart // Hearts appropriate for romantic relationships
    case 'work':
      return BarChart3 // Professional check-in icon
    case 'family':
      return MessageCircle // Family conversation icon
    case 'friend':
      return MessageCircle // Friendly conversation icon
    case 'other':
    default:
      return MessageCircle // Neutral conversation icon
  }
}

// Secondary items (shown in "More" menu)
const secondaryNavItems: NavItem[] = [
  { href: '/workflows', label: 'Workflows', icon: Target },
  { href: '/relationships', label: 'Relationships', icon: Users },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/settings', label: 'Settings', icon: Settings },
]

export function MobileBottomNav({ userEmail }: { userEmail?: string }) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  
  // Phase 7.3: Use relationship context for adaptive icons
  const { hasMultipleTypes, activeRelationshipType } = useRelationshipContext()
  const currentRelationshipType = useCurrentRelationshipType()
  
  // Get context-aware navigation items
  const mainNavItems = getMainNavItems(currentRelationshipType)

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
      {/* Bottom Navigation Bar - UPDATED: Brand colors */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-brand-teal/20 z-50 md:hidden shadow-lg">
        <div className="grid grid-cols-5 h-16">
          {/* Main Navigation Items - UPDATED: Relationship-aware colors and icons */}
          {mainNavItems.map((item) => {
            const Icon = item.icon
            const active = isActive(item.href)
            
            // Use relationship-aware colors for check-in item when active
            const isCheckinItem = item.href === '/checkin'
            const relationshipColors = getRelationshipColors(currentRelationshipType)
            
            const activeClasses = isCheckinItem && active && hasMultipleTypes
              ? `${relationshipColors.primary} ${relationshipColors.bg}`
              : 'text-brand-dark-teal bg-brand-teal/10'
              
            const hoverClasses = isCheckinItem && hasMultipleTypes
              ? `text-gray-500 hover:${relationshipColors.primary} ${relationshipColors.hover}`
              : 'text-gray-500 hover:text-brand-dark-teal hover:bg-brand-teal/5'
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center space-y-1 transition-colors ${
                  active ? activeClasses : hoverClasses
                }`}
              >
                <Icon className={`w-5 h-5 ${active ? (isCheckinItem && hasMultipleTypes ? relationshipColors.primary : 'text-brand-dark-teal') : ''}`} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            )
          })}

          {/* More Menu Button - UPDATED: Brand colors */}
          <button 
            onClick={() => setIsMoreOpen(!isMoreOpen)}
            className="flex flex-col items-center justify-center space-y-1 text-gray-500 hover:text-brand-dark-teal hover:bg-brand-teal/5 transition-colors"
          >
            <MoreHorizontal className="w-5 h-5" />
            <span className="text-xs font-medium">More</span>
          </button>
        </div>
      </div>

      {/* More Menu Overlay - UPDATED: Brand colors */}
      {isMoreOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] md:hidden" onClick={() => setIsMoreOpen(false)}>
          <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-lg p-6 z-[70] border-t border-brand-teal/20" onClick={(e) => e.stopPropagation()}>
            {/* Header - UPDATED: Brand colors */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-brand-charcoal">More Options</h3>
              <button 
                onClick={() => setIsMoreOpen(false)} 
                className="p-2 hover:bg-brand-teal/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-brand-charcoal" />
              </button>
            </div>

            {/* Menu Items - UPDATED: Brand colors */}
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
                        ? 'bg-brand-teal/10 text-brand-dark-teal border border-brand-teal/20'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${active ? 'text-brand-dark-teal' : 'text-gray-400'}`} />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                )
              })}
              
              {/* Admin Link - UPDATED: Brand orange colors */}
              {isAdmin && (
                <Link
                  href="/admin/users"
                  onClick={() => setIsMoreOpen(false)}
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    isActive('/admin/users')
                      ? 'bg-orange-50 text-orange-700 border border-orange-200'
                      : 'text-orange-600 hover:bg-orange-50'
                  }`}
                >
                  <Shield className="w-5 h-5" />
                  <span className="font-medium">🛠️ Admin</span>
                </Link>
              )}

              {/* Divider */}
              <div className="border-t border-brand-teal/20 my-2"></div>
              
              {/* Logout - UPDATED: Brand coral for destructive action */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 p-3 rounded-lg transition-colors text-brand-coral-pink hover:bg-brand-coral-pink/10 border border-transparent hover:border-brand-coral-pink/20"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}