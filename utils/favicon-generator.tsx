// utils/favicon-generator.tsx
// Use this component to generate favicon images

import React from 'react'
import { HeartLogo } from '@/components/branding/HeartLogo'

// Component to generate favicon at different sizes
export function FaviconGenerator() {
  const sizes = [16, 32, 48, 64, 96, 128, 180, 192, 512]
  
  return (
    <div className="p-8 bg-white">
      <h2 className="text-2xl font-bold mb-6 text-brand-charcoal font-heading">
        Favicon Generation
      </h2>
      <p className="text-brand-slate mb-6 font-inter">
        Right-click each logo and "Save image as..." to create favicon files.
      </p>
      
      <div className="grid grid-cols-3 gap-6">
        {sizes.map((size) => (
          <div key={size} className="text-center">
            <div 
              className="inline-block border border-brand-light-gray rounded-lg p-4 bg-white"
              style={{ 
                width: Math.max(size + 32, 64), 
                height: Math.max(size + 32, 64) 
              }}
            >
              <HeartLogo size={size} />
            </div>
            <p className="text-sm text-brand-slate mt-2 font-inter">
              {size}x{size}px
            </p>
            <p className="text-xs text-brand-slate font-inter">
              favicon-{size}.png
            </p>
          </div>
        ))}
      </div>
      
      {/* Special variations */}
      <div className="mt-8 border-t border-brand-light-gray pt-8">
        <h3 className="text-lg font-semibold mb-4 text-brand-charcoal font-heading">
          Special Variations
        </h3>
        
        <div className="grid grid-cols-2 gap-6">
          {/* White background version for iOS */}
          <div className="text-center">
            <div className="inline-block border border-brand-light-gray rounded-lg p-4 bg-white w-24 h-24">
              <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center">
                <HeartLogo size={48} />
              </div>
            </div>
            <p className="text-sm text-brand-slate mt-2 font-inter">
              iOS App Icon (White BG)
            </p>
            <p className="text-xs text-brand-slate font-inter">
              apple-touch-icon.png
            </p>
          </div>
          
          {/* Monochrome version */}
          <div className="text-center">
            <div className="inline-block border border-brand-light-gray rounded-lg p-4 bg-white w-24 h-24">
              <HeartLogo size={48} variant="monochrome" />
            </div>
            <p className="text-sm text-brand-slate mt-2 font-inter">
              Monochrome Version
            </p>
            <p className="text-xs text-brand-slate font-inter">
              favicon-mono.png
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// SVG Favicon component (modern browsers)
export function SVGFavicon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="favicon-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4AB9B8" />
          <stop offset="100%" stopColor="#FF8A9B" />
        </linearGradient>
      </defs>
      <path
        d="M16 4.5c-1.74-2.5-5.5-3.5-8 0-2.5 3.5-2.5 7.5 0 11l8 8 8-8c2.5-3.5 2.5-7.5 0-11-2.5-3.5-6.26-2.5-8 0z"
        fill="url(#favicon-gradient)"
      />
    </svg>
  )
}

// Generate manifest.json content
export const webAppManifest = {
  name: "RelationshipOS",
  short_name: "RelationshipOS",
  description: "Privacy-first AI relationship coaching",
  start_url: "/dashboard",
  display: "standalone",
  background_color: "#FFF8FB", // brand-warm-white
  theme_color: "#4AB9B8", // brand-teal
  icons: [
    {
      src: "/favicon-192.png",
      sizes: "192x192",
      type: "image/png"
    },
    {
      src: "/favicon-512.png", 
      sizes: "512x512",
      type: "image/png"
    },
    {
      src: "/favicon-512.png",
      sizes: "512x512", 
      type: "image/png",
      purpose: "maskable"
    }
  ]
}