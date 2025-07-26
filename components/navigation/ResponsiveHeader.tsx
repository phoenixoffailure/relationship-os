'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
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

interface HeaderProps {
  userEmail?: string
  currentPageTitle?: string
}

// Desktop navigation items
const desktopNavItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/journal', label: 'Journal' },
  { href: '/checkin', label: 'Check-In' },
  { href: '/insights', label: 'Insights' },
  { href: '/relationships', label: 'Relationships' },
  { href: '/settings', label: 'Settings' },
]

export function ResponsiveHeader({ userEmail, currentPageTitle }: HeaderProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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

  // Get current page name for mobile header
  const getCurrentPageName = () => {
    if (currentPageTitle) return currentPageTitle
    
    const pageMap: Record<string, string> = {
      '/dashboard': 'Dashboard',
      '/journal': 'Journal',
      '/checkin': 'Check-In',
      '/insights': 'Insights',
      '/relationships': 'Relationships',
      '/settings': 'Settings',
      '/admin/users': 'Admin',
    }
    
    return pageMap[pathname] || 'RelationshipOS'
  }

  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-calm-500 to-mint-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">R</span>
                </div>
                <span className="text-xl font-bold text-calm-800 hidden sm:block">
                  RelationshipOS
                </span>
              </Link>
            </div>

            {/* Mobile: Page Title + Menu Button */}
            <div className="md:hidden flex items-center justify-between flex-1 ml-4">
              <h1 className="text-lg font-semibold text-gray-900">
                {getCurrentPageName()}
              </h1>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-2"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <Menu className="w-5 h-5" />
              </Button>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {desktopNavItems.map((item) => {
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      active
                        ? 'text-calm-700 bg-calm-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              })}
              
              {/* Admin Link (if applicable) */}
              {isAdmin && (
                <Link
                  href="/admin/users"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/admin/users')
                      ? 'text-orange-700 bg-orange-50'
                      : 'text-orange-600 hover:text-orange-700 hover:bg-orange-50'
                  }`}
                >
                  🛠️ Admin
                </Link>
              )}
              
              {/* Logout */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-600"
              >
                Logout
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-lg z-60" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold">Menu</h2>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Items */}
            <nav className="flex flex-col p-4 space-y-2">
              {desktopNavItems.map((item) => {
                const active = isActive(item.href)
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-lg transition-colors ${
                      active
                        ? 'bg-calm-50 text-calm-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {item.label}
                  </Link>
                )
              })}
              
              {/* Admin Link (if applicable) */}
              {isAdmin && (
                <Link
                  href="/admin/users"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`px-4 py-3 rounded-lg transition-colors ${
                    isActive('/admin/users')
                      ? 'bg-orange-50 text-orange-700 font-medium'
                      : 'text-orange-600 hover:bg-orange-50'
                  }`}
                >
                  🛠️ Admin
                </Link>
              )}
              
              {/* Logout */}
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="justify-start px-4 py-3 h-auto text-red-600 hover:bg-red-50"
              >
                Logout
              </Button>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}