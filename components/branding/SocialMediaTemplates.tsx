// components/branding/SocialMediaTemplates.tsx
// Templates for generating social media images

import React from 'react'
import { HeartLogo } from '@/components/branding/HeartLogo'

// Open Graph Image Template (1200x630px)
export function OGImageTemplate() {
  return (
    <div 
      className="relative bg-gradient-to-br from-brand-warm-white to-brand-cool-gray flex items-center justify-center overflow-hidden"
      style={{ width: '1200px', height: '630px' }}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10">
          <HeartLogo size={40} variant="outline" />
        </div>
        <div className="absolute top-20 right-20">
          <HeartLogo size={30} variant="outline" />
        </div>
        <div className="absolute bottom-20 left-20">
          <HeartLogo size={35} variant="outline" />
        </div>
        <div className="absolute bottom-10 right-10">
          <HeartLogo size={25} variant="outline" />
        </div>
      </div>
      
      {/* Main content */}
      <div className="text-center z-10 max-w-4xl px-8">
        <div className="mb-8">
          <HeartLogo size={120} className="mx-auto mb-6" />
        </div>
        <h1 className="text-6xl font-bold text-brand-charcoal mb-4 font-heading">
          RelationshipOS
        </h1>
        <p className="text-2xl text-brand-slate font-inter leading-relaxed">
          Privacy-first AI relationship coaching
        </p>
        <p className="text-xl text-brand-slate font-inter mt-4">
          Strengthen your bond with intelligent insights
        </p>
      </div>
      
      {/* Subtle brand elements */}
      <div className="absolute bottom-6 right-6 text-brand-slate font-inter text-lg">
        relationshipos.app
      </div>
    </div>
  )
}

// Twitter Image Template (1200x600px)
export function TwitterImageTemplate() {
  return (
    <div 
      className="relative bg-gradient-to-r from-brand-teal to-brand-coral-pink flex items-center justify-center overflow-hidden"
      style={{ width: '1200px', height: '600px' }}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-white/90"></div>
      
      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl px-8">
        <HeartLogo size={100} className="mx-auto mb-8" />
        <h1 className="text-5xl font-bold text-brand-charcoal mb-6 font-heading">
          RelationshipOS
        </h1>
        <p className="text-xl text-brand-slate font-inter">
          🤖 AI-powered insights • 🔒 Privacy-first • 💕 Relationship coaching
        </p>
      </div>
    </div>
  )
}

// Square Image Template (1200x1200px) for Instagram/LinkedIn
export function SquareImageTemplate() {
  return (
    <div 
      className="relative bg-white flex flex-col items-center justify-center p-16"
      style={{ width: '1200px', height: '1200px' }}
    >
      {/* Large logo */}
      <div className="mb-12">
        <HeartLogo size={200} />
      </div>
      
      {/* Text content */}
      <div className="text-center">
        <h1 className="text-7xl font-bold text-brand-charcoal mb-8 font-heading">
          RelationshipOS
        </h1>
        <p className="text-3xl text-brand-slate font-inter leading-relaxed max-w-2xl">
          Privacy-first AI relationship coaching platform
        </p>
        
        <div className="mt-12 flex items-center justify-center space-x-8 text-2xl text-brand-slate font-inter">
          <span>🤖 AI Insights</span>
          <span>🔒 Private</span>
          <span>💕 Couples</span>
        </div>
      </div>
      
      {/* Bottom branding */}
      <div className="absolute bottom-8 text-brand-slate font-inter text-2xl">
        relationshipos.app
      </div>
    </div>
  )
}

// App Store Screenshot Template (1242x2688px - iPhone Pro Max)
export function AppStoreTemplate() {
  return (
    <div 
      className="relative bg-gradient-to-b from-brand-warm-white to-brand-cool-gray flex flex-col"
      style={{ width: '1242px', height: '2688px' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-12 bg-white shadow-sm">
        <HeartLogo size={60} />
        <h1 className="text-4xl font-bold text-brand-charcoal font-heading">
          RelationshipOS
        </h1>
        <div className="w-15"></div> {/* Spacer */}
      </div>
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col items-center justify-center p-16 text-center">
        <HeartLogo size={180} className="mb-12" />
        
        <h2 className="text-6xl font-bold text-brand-charcoal mb-8 font-heading">
          Strengthen Your
          <br />
          Relationship
        </h2>
        
        <p className="text-3xl text-brand-slate font-inter leading-relaxed mb-12 max-w-2xl">
          AI-powered insights and partner suggestions to help you connect deeper
        </p>
        
        <div className="space-y-6 text-2xl text-brand-slate font-inter">
          <div className="flex items-center space-x-4">
            <span className="text-3xl">🔒</span>
            <span>Your privacy is protected</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-3xl">🤖</span>
            <span>Personalized AI coaching</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-3xl">💕</span>
            <span>Partner suggestions</span>
          </div>
        </div>
      </div>
      
      {/* Bottom CTA area */}
      <div className="p-16 text-center">
        <div className="bg-brand-teal text-white px-12 py-6 rounded-full text-3xl font-semibold font-inter">
          Start Your Journey
        </div>
      </div>
    </div>
  )
}

// Favicon SVG Template (for /favicon.svg)
export function FaviconSVG() {
  return `
<svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="favicon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4AB9B8" />
      <stop offset="100%" stop-color="#FF8A9B" />
    </linearGradient>
  </defs>
  <path
    d="M16 4.5c-1.74-2.5-5.5-3.5-8 0-2.5 3.5-2.5 7.5 0 11l8 8 8-8c2.5-3.5 2.5-7.5 0-11-2.5-3.5-6.26-2.5-8 0z"
    fill="url(#favicon-gradient)"
  />
</svg>
  `.trim()
}

// Export component for generating all templates
export function SocialMediaGenerator() {
  return (
    <div className="space-y-12 p-8">
      <h1 className="text-3xl font-bold text-brand-charcoal font-heading">
        Social Media Image Templates
      </h1>
      
      <div className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-4 text-brand-charcoal font-heading">
            Open Graph Image (1200x630px)
          </h2>
          <div className="transform scale-50 origin-top-left border border-brand-light-gray">
            <OGImageTemplate />
          </div>
          <p className="text-sm text-brand-slate mt-2 font-inter">
            Use for: Facebook, LinkedIn, website previews
          </p>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4 text-brand-charcoal font-heading">
            Twitter Image (1200x600px)
          </h2>
          <div className="transform scale-50 origin-top-left border border-brand-light-gray">
            <TwitterImageTemplate />
          </div>
          <p className="text-sm text-brand-slate mt-2 font-inter">
            Use for: Twitter cards, social sharing
          </p>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-4 text-brand-charcoal font-heading">
            Square Image (1200x1200px)
          </h2>
          <div className="transform scale-50 origin-top-left border border-brand-light-gray">
            <SquareImageTemplate />
          </div>
          <p className="text-sm text-brand-slate mt-2 font-inter">
            Use for: Instagram, LinkedIn square posts
          </p>
        </div>
      </div>
      
      <div className="bg-brand-cool-gray p-6 rounded-xl">
        <h3 className="text-lg font-semibold mb-3 text-brand-charcoal font-heading">
          Favicon SVG Code
        </h3>
        <pre className="text-sm bg-white p-4 rounded border overflow-x-auto font-mono">
          {FaviconSVG()}
        </pre>
        <p className="text-sm text-brand-slate mt-2 font-inter">
          Save this as /public/favicon.svg for modern browsers
        </p>
      </div>
    </div>
  )
}