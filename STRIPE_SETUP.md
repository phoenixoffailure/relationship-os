# Stripe Integration Setup Guide

## Step 1: Add Environment Variables

Add these to your `.env.local` file:

```bash
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... # Get from Stripe Dashboard
STRIPE_SECRET_KEY=sk_live_...                  # Get from Stripe Dashboard  
STRIPE_WEBHOOK_SECRET=whsec_...               # Get after setting up webhooks
NEXT_PUBLIC_APP_URL=http://localhost:3000     # Your app URL

# Premium Product IDs (will create these in Stripe)
STRIPE_PRICE_ID_MONTHLY=9.99     # Monthly subscription price ID
STRIPE_PRICE_ID_YEARLY=99       # Yearly subscription price ID
```

## Step 2: Get Your Stripe Keys

1. Go to https://dashboard.stripe.com
2. Navigate to **Developers** → **API Keys**
3. Copy your:
   - **Publishable Key** (starts with `pk_test_`)
   - **Secret Key** (starts with `sk_test_`)

## Step 3: Create Products in Stripe

We'll create these programmatically, but you can also do it in the Stripe Dashboard:

1. **Premium Monthly**: $9.99/month
2. **Premium Yearly**: $99.99/year (2 months free)

## Step 4: Test the Integration

After setting up environment variables, we'll create:
- Subscription flow
- Webhook handling
- Payment success/cancel pages
- Customer portal

## Current Premium Features

Based on your codebase:
- ✅ FIRO Compatibility Analysis
- ✅ Premium Analytics Dashboard  
- ✅ Advanced Relationship Insights
- ✅ Database schema ready

## Flexible Premium System

Your system is already designed to be flexible:
- Database-driven premium checks
- Feature flags ready for any component
- Easy to move features between free/premium tiers