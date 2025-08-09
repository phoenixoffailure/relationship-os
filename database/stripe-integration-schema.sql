-- Stripe Integration Schema
-- Add missing tables and columns for Stripe payment processing

-- Table for storing Stripe customer relationships
CREATE TABLE IF NOT EXISTS public.stripe_customers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid UNIQUE NOT NULL,
  stripe_customer_id text UNIQUE NOT NULL,
  email text NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT stripe_customers_pkey PRIMARY KEY (id),
  CONSTRAINT stripe_customers_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Table for tracking subscription events and changes
CREATE TABLE IF NOT EXISTS public.subscription_events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  stripe_subscription_id text NOT NULL,
  event_type text NOT NULL CHECK (event_type = ANY (ARRAY[
    'subscription_created'::text, 
    'subscription_updated'::text, 
    'subscription_cancelled'::text,
    'subscription_reactivated'::text,
    'payment_succeeded'::text,
    'payment_failed'::text,
    'invoice_payment_succeeded'::text,
    'invoice_payment_failed'::text
  ])),
  event_data jsonb,
  processed_at timestamp without time zone DEFAULT now(),
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT subscription_events_pkey PRIMARY KEY (id),
  CONSTRAINT subscription_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_stripe_customers_user_id ON public.stripe_customers(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_customers_stripe_id ON public.stripe_customers(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_user_id ON public.subscription_events(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_events_stripe_subscription_id ON public.subscription_events(stripe_subscription_id);

-- RLS policies for stripe_customers
ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own stripe customer info" ON public.stripe_customers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stripe customer info" ON public.stripe_customers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stripe customer info" ON public.stripe_customers
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for subscription_events  
ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription events" ON public.subscription_events
  FOR SELECT USING (auth.uid() = user_id);

-- Service role can manage all stripe data (for webhooks)
CREATE POLICY "Service role can manage stripe customers" ON public.stripe_customers
  FOR ALL USING (current_user = 'service_role');

CREATE POLICY "Service role can manage subscription events" ON public.subscription_events
  FOR ALL USING (current_user = 'service_role');

-- Grant permissions
GRANT ALL ON public.stripe_customers TO authenticated;
GRANT ALL ON public.subscription_events TO authenticated;
GRANT ALL ON public.stripe_customers TO service_role;
GRANT ALL ON public.subscription_events TO service_role;