// components/branding/YourLogo.tsx
import React from 'react'
import { cn } from '@/lib/utils'

interface LogoProps {
  size?: number
  variant?: 'default' | 'white' | 'dark'
  className?: string
  animate?: boolean
}

export function YourLogo({ 
  size = 32, 
  variant = 'default', 
  className,
  animate = false 
}: LogoProps) {
  
  return (
    <div className={cn("inline-flex items-center justify-center", className)}>
      <img
        src="/relationshipos-logo.svg"
        alt="RelationshipOS Logo"
        width={size}
        height={size}
        className={cn(
          "transition-all duration-300",
          animate && "hover:scale-110"
        )}
        style={{ width: size, height: size, objectFit: 'contain' }}
      />
    </div>
  )
}