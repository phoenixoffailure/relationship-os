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
      <div className="min-h-screen bg-gradient-to-br from-brand-cool-gray to-brand-warm-white flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center">
          <div className="w-16 h-16 bg-brand-teal/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-brand-teal" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-heading-lg text-brand-charcoal mb-4 font-heading">Check Your Email!</h2>
          <p className="text-brand-slate mb-6 font-inter">
            We've sent you a confirmation link at <strong>{email}</strong>. 
            Click the link to verify your account and start your relationship journey.
          </p>
          <Link href="/login">
            <Button className="bg-brand-teal hover:bg-brand-dark-teal font-inter">
              Back to Sign In
            </Button>
          </Link>
        </div>
      </div>
    )
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
            Create Your Account
          </h2>
          <p className="text-brand-slate mt-2 font-inter">
            Start your privacy-first relationship intelligence journey
          </p>
        </div>

        {/* Signup Form - UPDATED: Brand colors and typography */}
        <form onSubmit={handleSignup} className="space-y-6">
          <div>
            <label htmlFor="fullName" className="block text-ui-base font-medium text-brand-charcoal mb-2 font-inter">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="w-full px-4 py-3 border border-brand-light-gray rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-brand-teal transition-colors font-inter"
              placeholder="Your name"
            />
          </div>

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
              className="w-full px-4 py-3 border border-brand-light-gray rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-brand-teal transition-colors font-inter"
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
              minLength={6}
              className="w-full px-4 py-3 border border-brand-light-gray rounded-lg focus:ring-2 focus:ring-brand-teal focus:border-brand-teal transition-colors font-inter"
              placeholder="At least 6 characters"
            />
          </div>

          {message && (
            <div className={`text-ui-base p-3 rounded-lg border font-inter ${
              success 
                ? 'text-brand-teal bg-brand-teal/5 border-brand-teal/20' 
                : 'text-red-600 bg-red-50 border-red-200'
            }`}>
              {message}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-teal hover:bg-brand-dark-teal text-white py-3 text-ui-lg font-inter"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        {/* Footer - UPDATED: Brand colors and typography */}
        <div className="mt-8 text-center text-ui-base text-brand-slate font-inter">
          <p>
            Already have an account?{' '}
            <Link href="/login" className="text-brand-teal hover:text-brand-dark-teal font-medium">
              Sign in here
            </Link>
          </p>
        </div>

        {/* Privacy Promise - UPDATED: Brand colors and typography */}
        <div className="mt-6 p-4 bg-brand-highlight/10 rounded-lg border border-brand-highlight/20">
          <div className="flex items-start space-x-2">
            <svg className="w-5 h-5 text-brand-teal mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <div className="text-ui-sm text-brand-charcoal font-inter">
              <p className="font-medium mb-1">Our Privacy Promise:</p>
              <ul className="space-y-1">
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