// components/branding/HeartLogo.tsx
// Professional heart logo component for RelationshipOS

import React from 'react'
import { cn } from '@/lib/utils'

interface HeartLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number
  variant?: 'default' | 'white' | 'outline' | 'monochrome'
  className?: string
  animate?: boolean
}

const sizeMap = {
  xs: 16,
  sm: 24,
  md: 32,
  lg: 48,
  xl: 64
}

export function HeartLogo({ 
  size = 'md', 
  variant = 'default', 
  className,
  animate = false 
}: HeartLogoProps) {
  const dimension = typeof size === 'number' ? size : sizeMap[size]
  
  const getGradientId = () => `heart-gradient-${variant}-${dimension}`
  
  const renderHeart = () => {
    switch (variant) {
      case 'white':
        return (
          <path
            d="M16 4.5c-1.74-2.5-5.5-3.5-8 0-2.5 3.5-2.5 7.5 0 11l8 8 8-8c2.5-3.5 2.5-7.5 0-11-2.5-3.5-6.26-2.5-8 0z"
            fill="white"
            className="drop-shadow-sm"
          />
        )
      
      case 'outline':
        return (
          <path
            d="M16 4.5c-1.74-2.5-5.5-3.5-8 0-2.5 3.5-2.5 7.5 0 11l8 8 8-8c2.5-3.5 2.5-7.5 0-11-2.5-3.5-6.26-2.5-8 0z"
            fill="none"
            stroke="url(#brand-gradient)"
            strokeWidth="2"
            className="stroke-current"
          />
        )
      
      case 'monochrome':
        return (
          <path
            d="M16 4.5c-1.74-2.5-5.5-3.5-8 0-2.5 3.5-2.5 7.5 0 11l8 8 8-8c2.5-3.5 2.5-7.5 0-11-2.5-3.5-6.26-2.5-8 0z"
            fill="currentColor"
            className="text-brand-charcoal"
          />
        )
      
      default:
        return (
          <>
            <path
              d="M16 4.5c-1.74-2.5-5.5-3.5-8 0-2.5 3.5-2.5 7.5 0 11l8 8 8-8c2.5-3.5 2.5-7.5 0-11-2.5-3.5-6.26-2.5-8 0z"
              fill={`url(#${getGradientId()})`}
              className="drop-shadow-sm"
            />
            {/* Subtle highlight for depth */}
            <path
              d="M12 8c-1-1.5-3-2-4.5 0-1.5 2-1.5 4 0 6l4.5 4.5L16.5 14c1.5-2 1.5-4 0-6-1.5-2-3.5-1.5-4.5 0z"
              fill="url(#heart-highlight)"
              opacity="0.3"
            />
          </>
        )
    }
  }

  return (
    <div className={cn("inline-flex items-center justify-center", className)}>
      <svg
        width={dimension}
        height={dimension}
        viewBox="0 0 32 32"
        fill="none"
        className={cn(
          "transition-all duration-300",
          animate && "hover:scale-110",
          animate && variant === 'default' && "hover:drop-shadow-lg"
        )}
      >
        <defs>
          {/* Main brand gradient */}
          <linearGradient
            id={getGradientId()}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
            gradientUnits="objectBoundingBox"
          >
            <stop offset="0%" stopColor="#4AB9B8" />
            <stop offset="100%" stopColor="#FF8A9B" />
          </linearGradient>
          
          {/* Highlight gradient for depth */}
          <linearGradient
            id="heart-highlight"
            x1="0%"
            y1="0%"
            x2="50%"
            y2="50%"
            gradientUnits="objectBoundingBox"
          >
            <stop offset="0%" stopColor="white" />
            <stop offset="100%" stopColor="white" opacity="0" />
          </linearGradient>
          
          {/* Brand gradient for outline variant */}
          <linearGradient
            id="brand-gradient"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#4AB9B8" />
            <stop offset="100%" stopColor="#FF8A9B" />
          </linearGradient>
        </defs>
        
        {renderHeart()}
      </svg>
    </div>
  )
}

// Preset variations for common use cases
export const LogoVariants = {
  // Header logo
  Header: (props: Omit<HeartLogoProps, 'size' | 'animate'>) => (
    <HeartLogo size={32} animate {...props} />
  ),
  
  // Favicon size
  Favicon: (props: Omit<HeartLogoProps, 'size'>) => (
    <HeartLogo size={32} {...props} />
  ),
  
  // Large logo for landing pages
  Hero: (props: Omit<HeartLogoProps, 'size' | 'animate'>) => (
    <HeartLogo size={64} animate {...props} />
  ),
  
  // Small inline logo
  Inline: (props: Omit<HeartLogoProps, 'size'>) => (
    <HeartLogo size={20} {...props} />
  ),
  
  // Loading spinner size
  Loading: (props: Omit<HeartLogoProps, 'size' | 'animate'>) => (
    <HeartLogo size={24} {...props} />
  )
}

// Export individual variants for convenience
export const HeaderLogo = LogoVariants.Header
export const FaviconLogo = LogoVariants.Favicon
export const HeroLogo = LogoVariants.Hero
export const InlineLogo = LogoVariants.Inline
export const LoadingLogo = LogoVariants.Loading