'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { YourLogo } from '@/components/branding/YourLogo'

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
  { href: '/workflows', label: 'Workflows' },
  { href: '/relationships', label: 'Relationships' },
  { href: '/calendar', label: 'Calendar' },
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
              <Link href="/dashboard" className="flex items-center space-x-3 group">
                <YourLogo 
                  size={32} 
                  variant="default" 
                  animate={true}
                  className="group-hover:scale-105 transition-transform duration-200"
                />
                <span className="text-xl font-bold text-brand-charcoal hidden sm:block font-heading group-hover:text-brand-teal transition-colors duration-200">
                  RelationshipOS
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1">
              {desktopNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-brand-teal/10 text-brand-teal'
                      : 'text-brand-slate hover:text-brand-charcoal hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Admin Link */}
              {isAdmin && (
                <Link
                  href="/admin/users"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive('/admin')
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
                className="text-red-600 hover:bg-red-50"
              >
                Logout
              </Button>
            </nav>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-brand-slate hover:text-brand-charcoal hover:bg-gray-50"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-brand-light-gray shadow-lg">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <nav className="flex flex-col space-y-1">
              {desktopNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 h-auto rounded-md text-base font-medium transition-colors duration-200 ${
                    isActive(item.href)
                      ? 'bg-brand-teal text-white'
                      : 'text-brand-slate hover:text-brand-teal hover:bg-brand-teal/5'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Admin Link */}
              {isAdmin && (
                <Link
                  href="/admin/users"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 h-auto rounded-md text-base font-medium transition-colors duration-200 ${
                    isActive('/admin')
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