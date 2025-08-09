// app/premium/pricing/page.tsx
// Flexible pricing page with Stripe integration

'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { 
  Check, 
  Crown,
  Heart,
  TrendingUp,
  Users,
  Brain,
  Star,
  Zap
} from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false)
  const [isLoading, setIsLoading] = useState<'monthly' | 'yearly' | null>(null)

  const handleSubscribe = async (plan: 'monthly' | 'yearly') => {
    try {
      setIsLoading(plan)
      
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      })

      const { url, error } = await response.json()

      if (error) {
        throw new Error(error)
      }

      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Subscription error:', error)
      alert('Failed to start subscription. Please try again.')
    } finally {
      setIsLoading(null)
    }
  }

  const pricing = {
    monthly: {
      price: '$9.99',
      interval: 'month',
      description: 'Perfect for getting started with premium features',
      features: [
        'Unlimited AI insights after check-in',
        'Daily partner suggestions (premium-only)',
        'FIRO compatibility analysis',
        'Advanced analytics dashboard', 
        'Unlimited relationships',
        'Priority AI processing',
        'Export data & reports'
      ]
    },
    yearly: {
      price: '$99.99', 
      interval: 'year',
      description: 'Best value - 2 months free!',
      savings: 'Save $19.89',
      features: [
        'All Monthly Features',
        '2 Months Free (16% savings)',
        'Priority Support',
        'Early Access to New Features', 
        'Advanced Coaching Recommendations',
        'Relationship Trend Analysis'
      ]
    }
  }

  const freeFeatures = [
    'Daily check-ins (1 per relationship)',
    'Unlimited journal entries', 
    'AI insights (1 per day after check-in)',
    'Relationship health tracking',
    'Up to 5 relationships'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            <Crown className="w-4 h-4 mr-1" />
            Premium Plans
          </Badge>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Relationship Growth Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Unlock advanced insights and accelerate your relationship growth with our research-backed premium features.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center mt-8 gap-3">
            <span className={`text-sm ${!isYearly ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
              Monthly
            </span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
              className="data-[state=checked]:bg-purple-600"
            />
            <span className={`text-sm ${isYearly ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
              Yearly
            </span>
            {isYearly && (
              <Badge variant="secondary" className="ml-2 bg-green-100 text-green-700">
                Save 16%
              </Badge>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <Card className="relative border-2 border-gray-200">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Heart className="w-6 h-6 text-gray-600" />
              </div>
              <CardTitle className="text-xl">Free</CardTitle>
              <CardDescription>Get started with basic relationship tools</CardDescription>
              <div className="text-3xl font-bold text-gray-900 mt-4">
                $0
                <span className="text-base font-normal text-gray-500">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {freeFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full" variant="outline" disabled>
                Current Plan
              </Button>
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className="relative border-2 border-purple-200 shadow-lg scale-105">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-purple-600 text-white px-4 py-1">
                <Star className="w-4 h-4 mr-1" />
                Most Popular
              </Badge>
            </div>
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Crown className="w-6 h-6 text-purple-600" />
              </div>
              <CardTitle className="text-xl">Premium</CardTitle>
              <CardDescription>
                {isYearly ? pricing.yearly.description : pricing.monthly.description}
              </CardDescription>
              <div className="text-3xl font-bold text-gray-900 mt-4">
                {isYearly ? pricing.yearly.price : pricing.monthly.price}
                <span className="text-base font-normal text-gray-500">
                  /{isYearly ? pricing.yearly.interval : pricing.monthly.interval}
                </span>
              </div>
              {isYearly && (
                <Badge variant="secondary" className="bg-green-100 text-green-700 mt-2">
                  {pricing.yearly.savings}
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {(isYearly ? pricing.yearly.features : pricing.monthly.features).map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700" 
                onClick={() => handleSubscribe(isYearly ? 'yearly' : 'monthly')}
                disabled={isLoading !== null}
              >
                {isLoading === (isYearly ? 'yearly' : 'monthly') ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    Processing...
                  </>
                ) : (
                  'Start Premium'
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Enterprise Placeholder */}
          <Card className="relative border-2 border-gray-200 opacity-75">
            <CardHeader className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-gray-600" />
              </div>
              <CardTitle className="text-xl">Enterprise</CardTitle>
              <CardDescription>For relationship coaches and organizations</CardDescription>
              <div className="text-3xl font-bold text-gray-900 mt-4">
                Custom
                <span className="text-base font-normal text-gray-500">/pricing</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-500">All Premium Features</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-500">White-label Solution</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-500">API Access</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-500">Dedicated Support</span>
                </li>
              </ul>
              <Button className="w-full" variant="outline" disabled>
                Coming Soon
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Can I change my plan anytime?
              </h3>
              <p className="text-gray-600 text-sm">
                Yes! You can upgrade, downgrade, or cancel your subscription at any time through your account settings.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Is my data secure?
              </h3>
              <p className="text-gray-600 text-sm">
                Absolutely. We use bank-level encryption and never share your personal relationship data with third parties.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                What's included in FIRO analysis?
              </h3>
              <p className="text-gray-600 text-sm">
                Research-backed compatibility scoring based on inclusion, control, and affection needs with detailed insights.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Do you offer refunds?
              </h3>
              <p className="text-gray-600 text-sm">
                Yes, we offer a 30-day money-back guarantee if you're not satisfied with your premium experience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}