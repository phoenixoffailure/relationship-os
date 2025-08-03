'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { YourLogo } from '@/components/branding/YourLogo'
import { Heart, Shield, Brain, Star, ArrowRight, Lock, Sparkles } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-cool-gray to-white flex flex-col">
      {/* Header */}
      <header className="p-6 flex justify-between items-center bg-white/80 backdrop-blur-sm border-b border-brand-light-gray">
        <Link href="/" className="flex items-center space-x-3 group">
          <YourLogo 
            size={32} 
            variant="default" 
            animate={true}
            className="group-hover:scale-105 transition-transform duration-200"
          />
          <span className="text-xl font-bold text-brand-charcoal font-heading group-hover:text-brand-teal transition-colors duration-200">
            RelationshipOS
          </span>
        </Link>
        <div className="space-x-4">
          <Link href="/login">
            <Button variant="ghost" className="text-brand-charcoal hover:text-brand-teal font-inter">
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-brand-teal hover:bg-brand-dark-teal text-white font-inter">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <YourLogo size={80} variant="default" className="mb-6" />
              <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-brand-coral-pink animate-pulse" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-brand-charcoal mb-6 font-heading">
            Your Relationship
            <span className="text-brand-teal block bg-gradient-to-r from-brand-teal to-brand-coral-pink bg-clip-text text-transparent">
              Intelligence Platform
            </span>
          </h1>
          
          <p className="text-xl text-brand-charcoal mb-8 max-w-2xl mx-auto font-inter leading-relaxed">
            A privacy-first platform that helps couples improve connection and intimacy through AI-powered insights, while keeping your personal data completely secure.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/signup">
              <Button size="lg" className="bg-brand-teal hover:bg-brand-dark-teal text-white text-lg px-8 py-4 font-inter shadow-lg hover:shadow-xl transition-all duration-200 group">
                Start Your Journey
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="border-brand-teal text-brand-teal hover:bg-brand-teal hover:text-white text-lg px-8 py-4 font-inter">
                Learn More
              </Button>
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex justify-center items-center space-x-8 text-brand-charcoal text-sm font-inter font-medium">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-brand-teal" />
              <span>Privacy-First</span>
            </div>
            <div className="flex items-center space-x-2">
              <Lock className="w-4 h-4 text-brand-teal" />
              <span>Encrypted</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-brand-coral-pink" />
              <span>AI-Powered</span>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-brand-charcoal mb-4 font-heading">
              Privacy-First Relationship Intelligence
            </h2>
            <p className="text-xl text-brand-charcoal max-w-2xl mx-auto font-inter">

              The only comprehensive four-pillar coaching system that analyzes your relationship patterns without compromising your privacy.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1: Complete Privacy */}
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-brand-cool-gray to-white border border-brand-light-gray hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-brand-teal to-brand-dark-teal rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-brand-charcoal font-heading">Complete Privacy</h3>
              <p className="text-brand-charcoal font-inter leading-relaxed opacity-80">
                Your journal entries and personal data stay completely private to you. AI generates insights without revealing sensitive details.
              </p>
            </div>

            {/* Feature 2: AI-Powered Insights */}
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-brand-cool-gray to-white border border-brand-light-gray hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-brand-coral-pink to-orange-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-brand-charcoal font-heading">AI-Powered Insights</h3>
              <p className="text-brand-charcoal font-inter leading-relaxed opacity-80">
                Get constructive suggestions and patterns recognition to improve your relationship dynamics and communication.
              </p>
            </div>

            {/* Feature 3: Connection Scoring */}
            <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-brand-cool-gray to-white border border-brand-light-gray hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-brand-teal rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-brand-charcoal font-heading">Connection Scoring</h3>
              <p className="text-brand-charcoal font-inter leading-relaxed opacity-80">
                Track your relationship health with sophisticated scoring that factors in communication, intimacy, and personal cycles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Four-Pillar System Preview */}
      <section className="py-20 px-6 bg-gradient-to-br from-brand-cool-gray to-brand-light-gray">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-brand-charcoal mb-6 font-heading">
            The Four-Pillar Coaching System
          </h2>
          <p className="text-xl text-brand-slate mb-12 font-inter">
            The industry's only comprehensive pillar-based relationship coaching framework
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pillar 1: Pattern Analysis */}
            <div className="bg-white p-6 rounded-xl border-l-4 border-blue-500 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                <span className="text-blue-600 font-bold">📊</span>
              </div>
              <h4 className="font-semibold text-brand-charcoal mb-2 font-heading">Pattern Analysis</h4>
              <p className="text-sm text-brand-charcoal font-inter opacity-80">Identify relationship trends and behavioral patterns</p>
            </div>
            
            {/* Pillar 2: Action Steps */}
            <div className="bg-white p-6 rounded-xl border-l-4 border-emerald-500 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center mb-4">
                <span className="text-emerald-600 font-bold">💡</span>
              </div>
              <h4 className="font-semibold text-brand-charcoal mb-2 font-heading">Action Steps</h4>
              <p className="text-sm text-brand-charcoal font-inter opacity-80">Concrete steps to improve connection and intimacy</p>
            </div>
            
            {/* Pillar 3: Gratitude */}
            <div className="bg-white p-6 rounded-xl border-l-4 border-pink-500 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-pink-50 rounded-lg flex items-center justify-center mb-4">
                <span className="text-pink-600 font-bold">❤️</span>
              </div>
              <h4 className="font-semibold text-brand-charcoal mb-2 font-heading">Strengths & Gratitude</h4>
              <p className="text-sm text-brand-charcoal font-inter opacity-80">Celebrate what's working in your relationship</p>
            </div>
            
            {/* Pillar 4: Milestones */}
            <div className="bg-white p-6 rounded-xl border-l-4 border-purple-500 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center mb-4">
                <span className="text-purple-600 font-bold">🏆</span>
              </div>
              <h4 className="font-semibold text-brand-charcoal mb-2 font-heading">Progress & Achievements</h4>
              <p className="text-sm text-brand-charcoal font-inter opacity-80">Track meaningful relationship milestones</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-brand-teal to-brand-dark-teal text-white">
        <div className="max-w-4xl mx-auto text-center">
          <YourLogo size={60} variant="white" className="mx-auto mb-8" />
          <h2 className="text-3xl md:text-4xl font-bold mb-6 font-heading">
            Ready to Transform Your Relationship?
          </h2>
          <p className="text-xl mb-8 opacity-90 font-inter">
            Join the privacy-first relationship intelligence revolution
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-white text-brand-teal hover:bg-gray-50 text-lg px-8 py-4 font-inter shadow-lg hover:shadow-xl transition-all duration-200">
              Start Your Journey Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-charcoal text-white py-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <YourLogo size={24} variant="white" />
            <span className="text-lg font-semibold font-heading">RelationshipOS</span>
          </div>
          <p className="text-gray-300 mb-4 font-inter">
            © 2025 RelationshipOS. Built with privacy and love.
          </p>
          <div className="flex justify-center items-center space-x-6 text-sm text-gray-300 font-inter">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}