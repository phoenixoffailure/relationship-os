import { Inter, Merriweather } from 'next/font/google'
import './globals.css'
import type { Metadata } from 'next'

// Configure Inter font (for UI elements)
const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
})

// Configure Merriweather font (for headings and emphasis)
const merriweather = Merriweather({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-merriweather',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'RelationshipOS - Privacy-First AI Relationship Coaching',
  description: 'Strengthen your relationship with AI-powered insights and partner suggestions. Privacy-first journaling and relationship coaching platform.',
  keywords: [
    'relationship coaching',
    'AI relationship advice',
    'couples therapy',
    'relationship insights',
    'privacy-first',
    'relationship journal',
    'partner suggestions',
    'love language',
    'relationship tracker'
  ],
  authors: [{ name: 'RelationshipOS Team' }],
  creator: 'RelationshipOS',
  publisher: 'RelationshipOS',
  
  // Open Graph / Facebook
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://relationshipos.app',
    title: 'RelationshipOS - Privacy-First AI Relationship Coaching',
    description: 'Strengthen your relationship with AI-powered insights and partner suggestions. Privacy-first journaling and relationship coaching platform.',
    siteName: 'RelationshipOS',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'RelationshipOS - AI Relationship Coaching Platform',
      },
      {
        url: '/og-image-square.png', 
        width: 1200,
        height: 1200,
        alt: 'RelationshipOS Heart Logo',
      }
    ],
  },
  
  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'RelationshipOS - Privacy-First AI Relationship Coaching',
    description: 'Strengthen your relationship with AI-powered insights and partner suggestions. Privacy-first journaling and relationship coaching platform.',
    images: ['/twitter-image.png'],
    creator: '@RelationshipOS',
  },
  
  // App-specific meta
  applicationName: 'RelationshipOS',
  category: 'Lifestyle',
  classification: 'Relationship Coaching',
  
  // Favicon and icons
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
  
  // Theme colors
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#4AB9B8' },
    { media: '(prefers-color-scheme: dark)', color: '#78B3B3' },
  ],
  
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
        {/* Additional meta tags for enhanced SEO */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="RelationshipOS" />
        <meta name="application-name" content="RelationshipOS" />
        
        {/* Theme colors for different contexts */}
        <meta name="theme-color" content="#4AB9B8" />
        <meta name="msapplication-TileColor" content="#4AB9B8" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Additional iOS meta tags */}
        <meta name="apple-touch-fullscreen" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        
        {/* Modern favicon (SVG) for supported browsers */}
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        
        {/* Preload critical fonts */}
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
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}