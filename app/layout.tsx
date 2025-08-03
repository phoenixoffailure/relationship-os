import { Inter, Merriweather } from 'next/font/google'
import type { Metadata, Viewport } from 'next'
import './globals.css'

// Font configurations with optimized loading
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  preload: true,
  fallback: ['ui-sans-serif', 'system-ui', 'sans-serif'],
})

const merriweather = Merriweather({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-merriweather',
  display: 'swap',
  preload: true,
  fallback: ['ui-serif', 'Georgia', 'serif'],
})

// Enhanced viewport configuration to prevent mobile yellow
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
  // Prevent zoom yellow flash
  interactiveWidget: 'resizes-content',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#4AB9B8' },
    { media: '(prefers-color-scheme: dark)', color: '#4AB9B8' },
  ]
}

export const metadata: Metadata = {
  title: {
    default: 'RelationshipOS - AI-Powered Relationship Intelligence',
    template: '%s | RelationshipOS'
  },
  description: 'Transform your relationship with AI-powered insights, personalized coaching, and evidence-based strategies. Privacy-first journaling and relationship coaching platform.',
  
  // Open Graph for social sharing
  openGraph: {
    title: 'RelationshipOS - AI-Powered Relationship Intelligence',
    description: 'Transform your relationship with AI-powered insights, personalized coaching, and evidence-based strategies.',
    url: 'https://relationshipos.ai',
    siteName: 'RelationshipOS',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'RelationshipOS - AI-Powered Relationship Intelligence'
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  
  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'RelationshipOS - AI-Powered Relationship Intelligence',
    description: 'Privacy-first journaling and relationship coaching platform.',
    images: ['/twitter-image.png'],
    creator: '@RelationshipOS',
  },
  
  // App-specific meta
  applicationName: 'RelationshipOS',
  category: 'Lifestyle',
  classification: 'Relationship Coaching',
  
  // Enhanced favicon and icons
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '32x32' },
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/favicon-64.png', sizes: '64x64', type: 'image/png' },
      { url: '/favicon-96.png', sizes: '96x96', type: 'image/png' },
      { url: '/favicon-128.png', sizes: '128x128', type: 'image/png' },
      { url: '/favicon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/favicon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
      { url: '/apple-touch-icon-152.png', sizes: '152x152' },
      { url: '/apple-touch-icon-144.png', sizes: '144x144' },
      { url: '/apple-touch-icon-120.png', sizes: '120x120' },
      { url: '/apple-touch-icon-114.png', sizes: '114x114' },
      { url: '/apple-touch-icon-76.png', sizes: '76x76' },
      { url: '/apple-touch-icon-72.png', sizes: '72x72' },
      { url: '/apple-touch-icon-60.png', sizes: '60x60' },
      { url: '/apple-touch-icon-57.png', sizes: '57x57' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/safari-pinned-tab.svg',
        color: '#4AB9B8', // brand-teal
      },
    ],
  },
  
  // Additional meta
  manifest: '/manifest.json',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Verification
  verification: {
    // google: 'verification-token', // Add when ready
    // yandex: 'verification-token', // Add when ready  
    // yahoo: 'verification-token', // Add when ready
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${merriweather.variable}`}>
      <head>
        {/* CRITICAL: Enhanced mobile meta tags to prevent yellow */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="RelationshipOS" />
        <meta name="application-name" content="RelationshipOS" />
        
        {/* ENHANCED: Theme colors for ALL contexts - prevent any yellow */}
        <meta name="theme-color" content="#4AB9B8" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#4AB9B8" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#4AB9B8" />
        <meta name="msapplication-TileColor" content="#4AB9B8" />
        <meta name="msapplication-navbutton-color" content="#4AB9B8" />
        <meta name="apple-mobile-web-app-status-bar-style" content="#4AB9B8" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* MOBILE SAFARI: Additional yellow prevention */}
        <meta name="apple-touch-fullscreen" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="full-screen" content="yes" />
        <meta name="browsermode" content="application" />
        
        {/* ANDROID: Chrome theme colors */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-status-bar-style" content="default" />
        
        {/* Simple mobile optimization */}
        <style dangerouslySetInnerHTML={{
          __html: `
            html, body {
              background-color: #FFF8FB;
              overscroll-behavior: none;
    }
  `
}} />
        
        {/* Modern favicon (SVG) for supported browsers */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        
        {/* ENHANCED: Preload critical fonts with better error handling */}
        <link
          rel="preload"
          href="/fonts/inter-var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/merriweather-var.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        
        {/* CRITICAL: Preload brand background color for instant loading */}
        <link rel="preload" as="style" href="data:text/css,html{background-color:%23FFF8FB!important}" />
      </head>
      <body className={`${inter.className} bg-background text-foreground`}>
        {/* CRITICAL: Immediate background color enforcement */}
        <div 
          style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            backgroundColor: '#FFF8FB', 
            zIndex: -1000,
            pointerEvents: 'none'
          }} 
        />
        {children}
      </body>
    </html>
  )
}