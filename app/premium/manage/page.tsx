// app/premium/manage/page.tsx
// Subscription management page

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Crown,
  CreditCard,
  Calendar,
  AlertCircle,
  ExternalLink,
  Settings
} from 'lucide-react'

interface SubscriptionStatus {
  has_premium: boolean
  subscription_status: string
  plan_type?: string
  current_period_end?: string
  trial_ends_at?: string
  trial_available: boolean
}

export default function ManageSubscriptionPage() {
  const [subscription, setSubscription] = useState<SubscriptionStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPortalLoading, setIsPortalLoading] = useState(false)

  useEffect(() => {
    fetchSubscriptionStatus()
  }, [])

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await fetch('/api/premium/subscription-check')
      const data = await response.json()
      setSubscription(data)
    } catch (error) {
      console.error('Failed to fetch subscription status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleManageBilling = async () => {
    try {
      setIsPortalLoading(true)
      const response = await fetch('/api/stripe/create-customer-portal', {
        method: 'POST'
      })
      
      const { url, error } = await response.json()
      
      if (error) {
        throw new Error(error)
      }
      
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Failed to create portal session:', error)
      alert('Failed to open billing portal. Please try again.')
    } finally {
      setIsPortalLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-700">Active</Badge>
      case 'trial':
        return <Badge className="bg-blue-100 text-blue-700">Trial</Badge>
      case 'cancelled':
        return <Badge className="bg-yellow-100 text-yellow-700">Cancelled</Badge>
      case 'expired':
        return <Badge className="bg-red-100 text-red-700">Expired</Badge>
      default:
        return <Badge variant="outline">Free</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Manage Your Subscription
          </h1>
          <p className="text-gray-600">
            View and manage your RelationshipOS premium subscription
          </p>
        </div>

        {/* Subscription Status Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-purple-600" />
              <CardTitle>Subscription Status</CardTitle>
            </div>
            {subscription && getStatusBadge(subscription.subscription_status)}
          </CardHeader>
          <CardContent className="space-y-4">
            {subscription?.has_premium ? (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Plan</h3>
                    <p className="text-gray-600">
                      {subscription.plan_type === 'premium_monthly' ? 'Premium Monthly' :
                       subscription.plan_type === 'premium_yearly' ? 'Premium Yearly' :
                       subscription.plan_type === 'premium_trial' ? 'Premium Trial' :
                       'Premium'}
                    </p>
                  </div>
                  
                  {subscription.current_period_end && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {subscription.subscription_status === 'cancelled' ? 'Access Until' : 'Renews On'}
                      </h3>
                      <p className="text-gray-600">
                        {formatDate(subscription.current_period_end)}
                      </p>
                    </div>
                  )}
                  
                  {subscription.trial_ends_at && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">Trial Ends</h3>
                      <p className="text-gray-600">
                        {formatDate(subscription.trial_ends_at)}
                      </p>
                    </div>
                  )}
                </div>

                {subscription.subscription_status === 'cancelled' && (
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-yellow-800">Subscription Cancelled</h3>
                      <p className="text-sm text-yellow-700">
                        You'll continue to have premium access until {formatDate(subscription.current_period_end!)}.
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-600 mb-4">
                  You're currently on the free plan.
                </p>
                <Button className="bg-purple-600 hover:bg-purple-700" asChild>
                  <a href="/premium/pricing">Upgrade to Premium</a>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Billing Management */}
        {subscription?.has_premium && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Billing & Payment
              </CardTitle>
              <CardDescription>
                Manage your payment method, billing history, and subscription settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={handleManageBilling}
                disabled={isPortalLoading}
                className="w-full"
              >
                {isPortalLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Opening Billing Portal...
                  </>
                ) : (
                  <>
                    <Settings className="w-4 h-4 mr-2" />
                    Manage Billing
                    <ExternalLink className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
              <p className="text-sm text-gray-500 mt-2 text-center">
                Opens secure Stripe portal to manage payment methods, view invoices, and update subscription
              </p>
            </CardContent>
          </Card>
        )}

        {/* Premium Features */}
        <Card>
          <CardHeader>
            <CardTitle>Premium Features</CardTitle>
            <CardDescription>
              {subscription?.has_premium 
                ? 'Features included in your premium subscription'
                : 'Unlock these features with premium'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <div className={`flex items-center gap-3 p-3 rounded-lg ${
                subscription?.has_premium ? 'bg-purple-50' : 'bg-gray-50'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  subscription?.has_premium ? 'bg-purple-600' : 'bg-gray-400'
                }`} />
                <span className={subscription?.has_premium ? 'text-gray-900' : 'text-gray-500'}>
                  FIRO Compatibility Analysis
                </span>
              </div>
              
              <div className={`flex items-center gap-3 p-3 rounded-lg ${
                subscription?.has_premium ? 'bg-purple-50' : 'bg-gray-50'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  subscription?.has_premium ? 'bg-purple-600' : 'bg-gray-400'
                }`} />
                <span className={subscription?.has_premium ? 'text-gray-900' : 'text-gray-500'}>
                  Advanced Analytics Dashboard
                </span>
              </div>
              
              <div className={`flex items-center gap-3 p-3 rounded-lg ${
                subscription?.has_premium ? 'bg-purple-50' : 'bg-gray-50'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  subscription?.has_premium ? 'bg-purple-600' : 'bg-gray-400'
                }`} />
                <span className={subscription?.has_premium ? 'text-gray-900' : 'text-gray-500'}>
                  Priority AI Processing
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Back to Dashboard */}
        <div className="text-center">
          <Button variant="outline" asChild>
            <a href="/dashboard">Back to Dashboard</a>
          </Button>
        </div>
      </div>
    </div>
  )
}