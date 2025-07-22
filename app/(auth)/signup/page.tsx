'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { createBrowserClient } from '@supabase/ssr'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      })
      
      if (error) {
        setMessage(`Error: ${error.message}`)
      } else if (data.user) {
        // Check if email confirmation is disabled
        if (data.user.email_confirmed_at) {
          setMessage('Account created successfully! Redirecting...')
          setTimeout(() => {
            window.location.href = '/dashboard'
          }, 1500)
        } else {
          setSuccess(true)
          setMessage('Check your email for a confirmation link!')
        }
      }
    } catch (error) {
      setMessage('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-calm-50 to-mint-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-mint-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-mint-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Check Your Email!</h2>
          <p className="text-gray-600 mb-6">
            We've sent you a confirmation link at <strong>{email}</strong>. 
            Click the link to verify your account and start your relationship journey.
          </p>
          <Link href="/login">
            <Button className="bg-calm-600 hover:bg-calm-700">
              Back to Sign In
            </Button>
          </Link>
        </div>
      </div>
    )
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
            Create Your Account
          </h2>
          <p className="text-gray-600 mt-2">
            Start your privacy-first relationship intelligence journey
          </p>
        </div>

        {/* Signup Form */}
        <form onSubmit={handleSignup} className="space-y-6">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-calm-500 focus:border-calm-500 transition-colors"
              placeholder="Your name"
            />
          </div>

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
              minLength={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-calm-500 focus:border-calm-500 transition-colors"
              placeholder="At least 6 characters"
            />
          </div>

          {message && (
            <div className={`text-sm p-3 rounded-lg ${
              success ? 'text-mint-600 bg-mint-50' : 'text-red-600 bg-red-50'
            }`}>
              {message}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-calm-600 hover:bg-calm-700 text-white py-3 text-base"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            Already have an account?{' '}
            <Link href="/login" className="text-calm-600 hover:text-calm-700 font-medium">
              Sign in here
            </Link>
          </p>
        </div>

        {/* Privacy Promise */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-start space-x-2">
            <svg className="w-5 h-5 text-calm-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <div className="text-xs text-gray-600">
              <p><strong>Our Privacy Promise:</strong></p>
              <ul className="mt-1 space-y-1">
                <li>• Your journal entries stay completely private</li>
                <li>• We never sell or share your personal data</li>
                <li>• AI insights are generated without exposing sensitive details</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}