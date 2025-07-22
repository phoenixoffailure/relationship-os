'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-calm-50 to-mint-50 flex flex-col">
      {/* Header */}
      <header className="p-6 flex justify-between items-center">
        <div className="text-2xl font-bold text-calm-800">
          Relationship OS
        </div>
        <div className="space-x-4">
          <Link href="/login">
            <Button variant="ghost" className="text-calm-700">
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-calm-600 hover:bg-calm-700">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            Your Relationship
            <span className="text-calm-600 block">Intelligence Platform</span>
          </h1>
          
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A privacy-first platform that helps couples improve connection and intimacy through AI-powered insights, while keeping your personal data completely secure.
          </p>

          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-calm-600 hover:bg-calm-700 text-lg px-8 py-4">
                Start Your Journey
              </Button>
            </Link>
            <Link href="/learn-more">
              <Button size="lg" variant="outline" className="border-calm-300 text-calm-700 text-lg px-8 py-4">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Privacy-First Relationship Intelligence
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-calm-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-calm-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Complete Privacy</h3>
              <p className="text-gray-600">Your journal entries and personal data stay completely private to you. AI generates insights without sharing sensitive details.</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-mint-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-mint-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">AI-Powered Insights</h3>
              <p className="text-gray-600">Get constructive suggestions and patterns recognition to improve your relationship dynamics and communication.</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-calm-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-calm-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Connection Scoring</h3>
              <p className="text-gray-600">Track your relationship health with sophisticated scoring that factors in communication, intimacy, and personal cycles.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-gray-200">
        <div className="text-center text-gray-500">
          <p>&copy; 2025 Relationship OS. Built with privacy and love.</p>
        </div>
      </footer>
    </div>
  )
}