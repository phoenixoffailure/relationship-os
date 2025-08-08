# ARCHITECTURE.md - System Architecture

## 🏗️ System Overview

RelationshipOS is a Next.js application with Supabase backend, featuring AI-powered relationship intelligence across multiple relationship types (romantic, work, family, friend).

## 📊 Database Architecture

### Core Tables (From `database/rolling-supabase-schema`)

#### User & Profile Tables
```sql
users                          -- Base user accounts
universal_user_profiles        -- FIRO needs, attachment styles, communication preferences
enhanced_onboarding_responses  -- Detailed onboarding data
relationship_profiles          -- User's profile within each relationship
```

#### Relationship Tables
```sql
relationships                  -- All relationship records (romantic/work/family/friend)
relationship_members           -- Many-to-many user-relationship mapping
relationship_invitations       -- Pending invitations with codes
relationship_health_scores     -- Calculated health metrics
```

#### Content Tables
```sql
journal_entries               -- User journal entries with relationship context
enhanced_journal_analysis     -- AI analysis of journal content
relationship_insights         -- Generated insights for users
partner_suggestions           -- Suggestions for relationship partners
```

#### AI & Memory Tables
```sql
ai_memory_entries            -- Stored AI memories per relationship
ai_conversation_history      -- Full conversation history
relationship_context_cache   -- Cached context for performance
memory_system_analytics      -- Memory system performance tracking
```

#### Premium Features
```sql
premium_subscriptions        -- User subscription status
premium_analyses            -- Premium analysis results
firo_compatibility_results  -- FIRO-based compatibility scores
communication_analysis_results -- Communication style analysis
```

### Data Flow Architecture

```
User Action → API Route → Supabase Query → AI Processing → Response
     ↓            ↓              ↓              ↓            ↓
  Journal    Validation    RLS Policies   Personality    Insights
   Entry                                    System       Generated
```

## 🎯 API Architecture

### Core API Routes

#### Journal System
- `/api/journal/unified-save-and-analyze` - Main entry point for journaling
- `/api/journal/enhanced-analyze` - Deep psychological analysis
- `/api/journal/analyze-needs` - Need detection from content

#### Insight Generation
- `/api/insights/generate` - Personal insights with AI personality
- `/api/insights/generate-with-memory` - Memory-enhanced insights (not integrated)
- `/api/relationships/generate` - Partner suggestions generation

#### Onboarding
- `/api/onboarding/universal` - Universal profile creation (FIRO/Attachment)
- `/api/onboarding/relationship` - Relationship-specific profiling
- `/api/onboarding/process` - Process and store responses

#### Premium Features
- `/api/premium/firo-compatibility` - FIRO compatibility analysis
- `/api/premium/subscription-check` - Verify premium access

#### Batch Processing
- `/api/batch/daily-partner-suggestions` - Daily batch processing
- `/api/cron/daily-suggestions` - Vercel cron endpoint

## 🤖 AI System Architecture

### Personality System
```typescript
lib/ai/
├── personalities.ts           // 5 relationship-type personalities
├── content-filters.ts        // Boundary enforcement
├── prompt-builder.ts         // Dynamic prompt generation
├── relationship-memory.ts    // Memory management (not integrated)
└── relationship-type-intelligence.ts // Type-specific configs
```

### AI Flow
1. **Input**: User journal entry + relationship context
2. **Profile Loading**: FIRO needs, attachment style, communication preferences
3. **Personality Selection**: Based on relationship type (romantic/work/family/friend)
4. **Memory Retrieval**: Past context and patterns (not yet integrated)
5. **Generation**: Insights/suggestions with appropriate tone
6. **Filtering**: Boundary enforcement for relationship type
7. **Storage**: Save to database with metadata

## 🎨 Frontend Architecture

### Page Structure
```
app/
├── (protected)/          // Authenticated pages
│   ├── dashboard/       // Multi-relationship dashboard
│   ├── insights/        // Insight viewing
│   ├── journal/         // Journal interface
│   ├── relationships/   // Relationship management
│   └── onboarding/      // Profile setup
├── (auth)/              // Authentication pages
└── api/                 // API routes
```

### Component Architecture
```
components/
├── dashboard/           // Dashboard components
│   ├── clean-relationship-cards.tsx
│   └── clean-insights-feed.tsx
├── insights/            // Insight display
│   └── CleanInsightsLayout.tsx
├── journal/             // Journal interface
│   └── CleanJournalLayout.tsx
├── relationships/       // Relationship management
│   └── CleanRelationshipsLayout.tsx
└── ui/                  // Shared UI components
```

## 🔐 Security Architecture

### Authentication
- Supabase Auth with email/password
- Session-based authentication
- Protected routes via middleware

### Row Level Security (RLS)
**Current State**: Partially implemented
**Needed**: Comprehensive policies for all tables

### Data Privacy
- Journal content never exposed to partners
- Anonymized suggestions only
- User-controlled sharing

## 🚀 Deployment Architecture

### Infrastructure
- **Frontend**: Vercel (Next.js hosting)
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **AI**: xAI Grok-4 API
- **Cron Jobs**: Vercel cron for batch processing

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
XAI_API_KEY
```

## 📈 Performance Considerations

### Caching Strategy
- Dashboard cache (6-hour expiry)
- Relationship context cache
- AI memory cache (not implemented)

### Batch Processing
- Daily partner suggestions generation
- Off-peak processing (11 PM daily)
- Relationship-grouped processing

## 🔄 State Management

### Client State
- React hooks for local state
- SWR for data fetching
- Context for relationship selection

### Server State
- Supabase real-time subscriptions (potential)
- Server-side rendering for initial load
- API route caching

## 🎯 Key Design Decisions

1. **Modular AI Personalities**: Separate personality per relationship type
2. **Privacy-First**: Anonymized partner suggestions
3. **Research-Backed**: FIRO theory, attachment styles integrated
4. **Progressive Enhancement**: Clean and enhanced UI modes
5. **Batch Processing**: Reduce AI costs via daily batching

## 🚧 Technical Debt

1. **Missing TypeScript Types**: 30+ tables without type definitions
2. **Incomplete RLS**: Security policies needed
3. **Memory System**: Built but not integrated
4. **Test Coverage**: Limited testing infrastructure

## 📝 Architecture Principles

1. **Database as Source of Truth**: Schema drives development
2. **Type Safety**: Full TypeScript coverage (when fixed)
3. **Modular Design**: Separate concerns clearly
4. **Privacy by Design**: Protect user data always
5. **Research Foundation**: Psychology-backed features