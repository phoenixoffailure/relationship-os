'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createBrowserClient } from '@supabase/ssr'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        setMessage(error.message)
      } else if (data.user) {
        window.location.href = '/dashboard'
      }
    } catch (error) {
      setMessage('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-cool-gray to-brand-warm-white flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Header - UPDATED: Brand typography and colors */}
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-heading font-bold text-brand-charcoal">
            RelationshipOS
          </Link>
          <h2 className="text-heading-lg text-brand-charcoal mt-4 font-heading">
            Welcome Back
          </h2>
          <p className="text-brand-slate mt-2 font-inter">
            Sign in to your relationship intelligence dashboard
          </p>
        </div>

        {/* Login Form - UPDATED: Brand colors and typography */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-ui-base font-medium text-brand-charcoal mb-2 font-inter">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-200 bg-white rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-brand-teal transition-colors font-inter placeholder:text-gray-500"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-ui-base font-medium text-brand-charcoal mb-2 font-inter">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-200 bg-white rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-brand-teal transition-colors font-inter placeholder:text-gray-500"
              placeholder="Enter your password"
            />
          </div>

          {message && (
            <div className="text-ui-base text-red-600 bg-red-50 p-3 rounded-lg border border-red-200 font-inter">
              {message}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-teal hover:bg-brand-dark-teal text-white py-3 text-ui-lg font-inter"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        {/* Footer - UPDATED: Brand colors and typography */}
        <div className="mt-8 text-center text-ui-base text-brand-slate font-inter">
          <p>
            Don't have an account?{' '}
            <Link href="/signup" className="text-brand-teal hover:text-brand-dark-teal font-medium underline">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}