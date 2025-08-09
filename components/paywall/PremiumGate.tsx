// components/paywall/PremiumGate.tsx  
// Flexible paywall component - easily gate any feature

'use client'

import { useState, useEffect, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Crown, 
  Lock, 
  ArrowRight, 
  Star,
  Zap,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'
import { FeatureKey, getFeature } from '@/lib/paywall/config'

interface PremiumGateProps {
  featureKey: FeatureKey
  children: ReactNode
  fallback?: ReactNode
  showUpgrade?: boolean
  className?: string
}

interface PremiumStatus {
  has_premium: boolean
  subscription_status: string
}

export default function PremiumGate({ 
  featureKey, 
  children, 
  fallback, 
  showUpgrade = true,
  className = ""
}: PremiumGateProps) {
  const [premiumStatus, setPremiumStatus] = useState<PremiumStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const feature = getFeature(featureKey)
  
  useEffect(() => {
    checkPremiumAccess()
  }, [])

  const checkPremiumAccess = async () => {
    try {
      const response = await fetch('/api/premium/subscription-check')
      const data = await response.json()
      setPremiumStatus(data)
    } catch (error) {
      console.error('Failed to check premium status:', error)
      // Default to allowing access on error
      setPremiumStatus({ has_premium: true, subscription_status: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  // If feature doesn't exist, show children (assume it's free)
  if (!feature) {
    return <>{children}</>
  }

  // If feature is free, always show children
  if (!feature.premium) {
    return <>{children}</>
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-32 bg-gray-200 rounded-lg"></div>
      </div>
    )
  }

  // If user has premium, show the feature
  if (premiumStatus?.has_premium) {
    return <>{children}</>
  }

  // If fallback provided, show that instead of upgrade prompt
  if (fallback) {
    return <>{fallback}</>
  }

  // Show upgrade prompt
  if (!showUpgrade) {
    return null
  }

  return (
    <div className={className}>
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-purple-600" />
          </div>
          <Badge className="bg-purple-600 text-white w-fit mx-auto mb-2">
            <Star className="w-3 h-3 mr-1" />
            Premium Feature
          </Badge>
          <CardTitle className="text-xl text-gray-900">
            {feature.name}
          </CardTitle>
          <CardDescription className="text-gray-600">
            {feature.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-sm text-purple-600 font-medium">
            <Lock className="w-4 h-4" />
            Premium subscribers only
          </div>
          
          <div className="space-y-3">
            <Link href="/premium/pricing">
              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                <Zap className="w-4 h-4 mr-2" />
                Upgrade to Premium
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            
            <Button variant="outline" className="w-full" asChild>
              <Link href="/premium/pricing">
                View All Premium Features
              </Link>
            </Button>
          </div>
          
          <div className="text-xs text-gray-500 pt-2 border-t">
            <div className="flex items-center justify-center gap-2">
              <TrendingUp className="w-3 h-3" />
              Join thousands improving their relationships
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Convenience hook for checking premium status in components
export function usePremiumStatus() {
  const [status, setStatus] = useState<PremiumStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetch('/api/premium/subscription-check')
      .then(response => response.json())
      .then(data => setStatus(data))
      .catch(error => {
        console.error('Failed to check premium status:', error)
        setStatus({ has_premium: false, subscription_status: 'error' })
      })
      .finally(() => setIsLoading(false))
  }, [])

  return { status, isLoading }
}