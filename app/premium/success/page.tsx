// app/premium/success/page.tsx
// Subscription success page

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  CheckCircle, 
  Crown,
  Heart,
  TrendingUp,
  ArrowRight,
  Gift
} from 'lucide-react'

export default function SuccessPage() {
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    // Give Stripe webhook time to process
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 3000)
    
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {isLoading ? (
          <Card className="text-center">
            <CardHeader>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
              </div>
              <CardTitle className="text-2xl">Processing Your Subscription...</CardTitle>
              <CardDescription>
                Please wait while we set up your premium account.
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <>
            {/* Success Message */}
            <Card className="text-center mb-8">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-green-600" />
                </div>
                <CardTitle className="text-3xl text-gray-900 mb-2">
                  Welcome to Premium! 🎉
                </CardTitle>
                <CardDescription className="text-lg">
                  Your subscription is now active. Let's unlock your relationship potential!
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Badge className="bg-purple-600 text-white px-4 py-2 text-sm">
                  <Crown className="w-4 h-4 mr-1" />
                  Premium Active
                </Badge>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="w-5 h-5 text-purple-600" />
                  Your Premium Features Are Ready
                </CardTitle>
                <CardDescription>
                  Here's what you can do now with your premium account:
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Advanced Analytics</h3>
                      <p className="text-sm text-gray-600">Deep insights into your relationship patterns</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <Heart className="w-5 h-5 text-purple-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">FIRO Compatibility</h3>
                      <p className="text-sm text-gray-600">Research-backed compatibility analysis</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <Crown className="w-5 h-5 text-purple-600" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Premium AI Insights</h3>
                      <p className="text-sm text-gray-600">Priority processing and enhanced recommendations</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="grid gap-4">
              <Link href="/premium/analytics">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-lg py-3">
                  Explore Premium Analytics
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              
              <Link href="/dashboard">
                <Button variant="outline" className="w-full text-lg py-3">
                  Back to Dashboard
                </Button>
              </Link>
              
              <Link href="/premium/manage">
                <Button variant="ghost" className="w-full">
                  Manage Subscription
                </Button>
              </Link>
            </div>

            {/* Support Note */}
            <div className="text-center mt-8 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Need help getting started? 
                <Link href="/contact" className="text-purple-600 hover:underline ml-1">
                  Contact our support team
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}