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
        // Redirect to dashboard on success
        window.location.href = '/dashboard'
      }
    } catch (error) {
      setMessage('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-calm-50 to-mint-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-calm-800">
            Relationship OS
          </Link>
          <h2 className="text-xl font-semibold text-gray-900 mt-4">
            Welcome Back
          </h2>
          <p className="text-gray-600 mt-2">
            Sign in to your account to continue your relationship journey
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-calm-500 focus:border-calm-500 transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-calm-500 focus:border-calm-500 transition-colors"
              placeholder="Enter your password"
            />
          </div>

          {message && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              {message}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-calm-600 hover:bg-calm-700 text-white py-3 text-base"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            Don't have an account?{' '}
            <Link href="/signup" className="text-calm-600 hover:text-calm-700 font-medium">
              Sign up here
            </Link>
          </p>
          <p className="mt-2">
            <Link href="/forgot-password" className="text-calm-600 hover:text-calm-700">
              Forgot your password?
            </Link>
          </p>
        </div>

        {/* Privacy Notice */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-start space-x-2">
            <svg className="w-5 h-5 text-calm-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p className="text-xs text-gray-600">
              <strong>Privacy-First:</strong> Your personal data and journal entries remain completely private to you. We never share or sell your information.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}