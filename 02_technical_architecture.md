# RelationshipOS Technical Architecture

> **Status**: Production Ready - Phase 9 Complete
> **Last Updated**: January 2025

## System Overview

RelationshipOS is built as a Next.js 15.2.4 application with a Supabase PostgreSQL backend, featuring AI-powered relationship intelligence through xAI's Grok-4 API. The architecture supports multi-relationship management with strict privacy boundaries and cost-optimized AI processing.

## Current Tech Stack

### Frontend Stack
- **Framework**: Next.js 15.2.4 with App Router
- **Language**: TypeScript 5+ (full type coverage)
- **Styling**: Tailwind CSS 3.4.17 with shadcn/ui components
- **State Management**: React 19 hooks + SWR for data fetching
- **UI Components**: Radix UI primitives with custom styling
- **Charts**: Recharts for analytics and health score visualization

### Backend Infrastructure
- **Database**: Supabase PostgreSQL with Row Level Security (RLS)
- **Authentication**: Supabase Auth (email/password)
- **API**: Next.js API routes with server-side rendering
- **File Storage**: Supabase Storage (for future file uploads)
- **Real-time**: Supabase real-time subscriptions (available, not implemented)

### AI & External Services
- **AI Provider**: xAI Grok-4 ("grok-beta") via @ai-sdk/xai
- **AI SDK**: Vercel AI SDK v4.3.19 for streaming and structured outputs
- **Payment Processing**: Stripe for subscription management
- **Deployment**: Vercel with cron jobs for batch processing
- **Monitoring**: Built-in Next.js analytics

## Data Flow Architecture

### Core User Journey Flow
```
User Input → Next.js API → Supabase Query → AI Processing → Response Storage → UI Update
     ↓              ↓              ↓              ↓                ↓             ↓
Check-in      Validation     RLS Policies    Grok-4 API      Database      Dashboard
Journal       Type Safety    User Isolation  Personality     Insights      Updates
```

### AI Processing Pipeline
```
1. Journal Entry Submission
   ↓
2. Check-in Validation (Phase 9: Required for insights)
   ↓
3. User Profile Loading (FIRO needs, attachment style)
   ↓
4. Relationship Type Detection & AI Personality Selection
   ↓
5. Prompt Construction (personality + context + user profile)
   ↓
6. Grok-4 API Call with Content Filtering
   ↓
7. Response Storage & Memory System Updates
   ↓
8. Partner Suggestion Generation (Premium Only, Batched)
```

## Database Architecture Details

### Core Tables (41 total)
```sql
-- User Management
users                          -- Base user accounts (linked to auth.users)
universal_user_profiles        -- FIRO needs, attachment styles
enhanced_onboarding_responses  -- Detailed onboarding data
premium_subscriptions          -- Subscription status and billing

-- Relationship Management  
relationships                  -- All relationship records
relationship_members           -- Many-to-many user-relationship mapping
relationship_profiles          -- User profile within each relationship
relationship_invitations       -- Invite system with codes

-- Content & Insights
journal_entries               -- Private user journaling
enhanced_journal_analysis     -- AI analysis results
relationship_insights         -- Generated insights for users
partner_suggestions           -- Anonymized suggestions for partners

-- AI Memory System (Built, Integration Pending)
ai_memory_entries            -- Stored AI memories per relationship
ai_conversation_history      -- Full conversation tracking
relationship_context_cache   -- Cached context for performance
memory_system_analytics      -- Memory system performance metrics

-- Phase 9: Generation Controls (NEW)
generation_controls          -- Daily limits and check-in tracking
```

### Security Architecture
- **Row Level Security (RLS)**: 1212+ lines of comprehensive policies
- **User Isolation**: All data scoped to authenticated user via `auth.uid()`
- **Relationship Privacy**: Users only see their own relationship data
- **Journal Privacy**: Journal content never exposed to relationship partners
- **API Security**: Service role key for admin operations, anon key for client

## API Architecture

### Core API Endpoints

#### User & Onboarding
- `POST /api/onboarding/universal` - FIRO needs and attachment style assessment
- `POST /api/onboarding/relationship` - Relationship-specific profiling
- `POST /api/onboarding/process` - Process and store onboarding responses

#### Journal & Analysis System
- `POST /api/journal/save-and-analyze` - Primary journal entry with AI analysis
- `POST /api/journal/enhanced-analyze` - Deep psychological analysis
- `POST /api/journal/analyze-needs` - Extract FIRO needs from content

#### Check-in System (Phase 9 Enhanced)
- `POST /api/checkins/submit` - Daily relationship check-ins (1 per day limit)
- `GET /api/checkins/status` - Check if user can check in today
- `POST /api/checkins/relationship-specific` - Relationship-type specific metrics

#### AI Insight Generation
- `POST /api/insights/generate` - Personal insights (requires check-in completion)
- `GET /api/insights/list` - Retrieve user's insights with read status
- `POST /api/insights/feedback` - Thumbs up/down feedback collection

#### Partner Suggestions (Premium Only)
- `POST /api/relationships/generate` - Generate partner suggestions
- `POST /api/batch/daily-partner-suggestions` - Batch processing endpoint
- `GET /api/cron/daily-suggestions` - Vercel cron job trigger

#### Premium Features
- `POST /api/premium/firo-compatibility` - FIRO compatibility analysis
- `GET /api/premium/subscription-check` - Verify premium access
- `POST /api/stripe/create-checkout` - Subscription checkout
- `POST /api/stripe/webhooks` - Stripe webhook processing

## AI System Architecture Details

### Personality System (5 Types)
```typescript
// lib/ai/personalities.ts
{
  romantic: {
    role: "Intimate Relationship Counselor",
    tone: "Warm, intimate, emotionally engaged",
    focus: "Emotional connection, intimacy, future planning"
  },
  work: {
    role: "Professional Workplace Coach", 
    tone: "Professional, respectful, boundaried",
    focus: "Collaboration, professional development"
  },
  family: {
    role: "Family Dynamics Specialist",
    tone: "Diplomatically supportive, wise",
    focus: "Generational awareness, family communication"
  },
  friend: {
    role: "Friendship Expert",
    tone: "Warm, encouraging, enthusiastic", 
    focus: "Mutual enjoyment, authentic connection"
  },
  other: {
    role: "General Relationship Advisor",
    tone: "Balanced, adaptive, contextual",
    focus: "Adapts based on specific relationship context"
  }
}
```

### Content Filtering & Boundaries
- **Work Relationships**: Filter personal/intimate content, maintain professional boundaries
- **Family Relationships**: Filter romantic advice, respect generational dynamics
- **Romantic Relationships**: Full range appropriate, intimate communication allowed
- **Friend Relationships**: Filter excessive dependency, maintain voluntary nature

### AI Prompt Construction
```typescript
// Dynamic prompt building process
buildPrompt({
  relationshipType,     // Determines AI personality
  userProfile: {
    firoNeeds,          // Inclusion, Control, Affection scores
    attachmentStyle,    // Secure, Anxious, Avoidant, Disorganized
    communicationStyle  // Direct/Indirect, Assertive/Passive
  },
  relationshipContext: {
    duration,           // Relationship timeline
    currentHealthScore, // Latest health score
    recentPatterns     // Pattern analysis from journals
  },
  currentInput,         // Journal entry or question
  boundaries           // What to avoid for this relationship type
})
```

## Cost Optimization Architecture

### Phase 8.2: Smart Insight Optimization (Implemented)
- **Trigger Logic**: Insights only generate after daily check-in completion
- **Single Quality Insight**: 1 high-quality insight per trigger (not 4 separate)
- **Smart Content Analysis**: Only analyze new content since last insight
- **75% Cost Reduction**: Achieved through smart triggering and content optimization

### Phase 9: Premium Gating (Implemented)
- **Check-in Required**: All insight generation gated behind daily check-in
- **Free Tier Limit**: 1 insight per day (first journal after check-in only)
- **Premium Unlimited**: Every journal after check-in generates insights
- **Partner Suggestions**: Premium-only feature with daily batching

### Batch Processing Architecture
```typescript
// Daily batch processing flow
11 PM Daily → Fetch Premium Users → Group by Relationships → 
Generate Suggestions → Store with Batch ID → Update Processing Log
```

## Deployment & Infrastructure

### Vercel Configuration
- **Deployment**: Automatic deploys from main branch
- **Environment**: Production environment variables securely stored
- **Cron Jobs**: Daily partner suggestion processing at 11 PM
- **Edge Functions**: API routes deployed to edge for low latency

### Environment Variables
```env
# Database
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# AI
XAI_API_KEY=
AI_MODEL=grok-beta
AI_TEMPERATURE=0.7
AI_MAX_TOKENS=1000

# Payments
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Application
NEXT_PUBLIC_BASE_URL=
```

## Performance & Scalability

### Caching Strategy
- **Dashboard Cache**: 6-hour expiry for relationship health scores
- **Context Cache**: Relationship context cached for AI generation
- **SWR Client-Side**: Automatic data fetching with cache management

### Database Performance
- **Indexes**: Strategic indexes on frequently queried columns
- **RLS Optimization**: Policies optimized for user-scoped queries
- **Connection Pooling**: Supabase handles connection management

### API Performance
- **Parallel Processing**: Multiple AI calls processed concurrently where possible
- **Streaming Responses**: AI responses streamed for better UX
- **Batch Processing**: Daily batch reduces real-time API load

## Security Implementation

### Data Privacy Architecture
- **Journal Isolation**: Journal content never shared between users
- **Anonymized Suggestions**: Partners receive suggestions without source content
- **Relationship Scoping**: All data queries scoped to user's relationships only

### Authentication & Authorization
- **JWT Tokens**: Supabase Auth handles token management
- **RLS Enforcement**: Database-level security policies
- **API Route Protection**: Middleware validates authentication on all protected routes

### Content Security
- **Input Validation**: All user inputs validated and sanitized
- **AI Content Filtering**: Response filtering per relationship type
- **Boundary Enforcement**: Hard limits on inappropriate content generation

## Monitoring & Analytics

### System Health Monitoring
- **Database Metrics**: Query performance and connection health
- **AI API Monitoring**: Response times and error rates
- **User Engagement**: Check-in rates, journal entries, insight engagement

### Business Intelligence
- **Conversion Tracking**: Free-to-premium conversion events
- **Feature Usage**: Premium feature adoption and usage patterns
- **Cost Tracking**: AI API costs per user and feature

## Future Architecture Considerations

### Near-term Enhancements
- **Memory System Integration**: Connect existing AI memory tables to active system
- **Real-time Features**: Implement Supabase real-time for live updates
- **Mobile API**: Optimize API responses for mobile app development

### Scalability Preparations
- **Database Sharding**: Prepared for user-based sharding if needed
- **CDN Integration**: Static asset optimization and global distribution
- **Microservices**: API structure ready for service separation if required

This architecture supports RelationshipOS's current scale and provides clear paths for growth while maintaining cost efficiency and user privacy.