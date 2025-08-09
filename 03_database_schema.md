# RelationshipOS Database Schema

> **Source of Truth**: `database/latest-rolling-supabase-schema`
> **Tables**: 39 operational tables with comprehensive RLS policies
> **Status**: Production Ready - Phase 9 Complete

## Schema Overview

RelationshipOS uses a PostgreSQL database hosted on Supabase with comprehensive Row Level Security (RLS) policies. The schema consists of 41 operational tables supporting multi-relationship management, AI memory systems, premium features, and strict privacy isolation.

## Core Entity Relationships

### User Management Chain
```
auth.users (Supabase Auth)
    ↓
users (public.users)
    ↓
universal_user_profiles (FIRO needs, attachment styles)
    ↓
enhanced_onboarding_responses (detailed user data)
```

### Relationship Management Chain
```
relationships
    ↓
relationship_members (many-to-many)
    ↓
relationship_profiles (user context within relationship)
    ↓
relationship_checkins (daily metrics)
    ↓
relationship_health_scores (calculated health)
```

### Content & AI Chain
```
journal_entries (private content)
    ↓
enhanced_journal_analysis (AI analysis)
    ↓
relationship_insights (generated insights)
    ↓
partner_suggestions (anonymized suggestions)
```

## Key Tables by Category

### 1. User & Identity Tables

#### `users`
- **Purpose**: Core user profiles linked to Supabase auth
- **Key Columns**: `id` (uuid, FK to auth.users), `email`, `full_name`, `onboarding_completed`
- **Security**: RLS policies ensure users only see their own data

#### `universal_user_profiles`
- **Purpose**: FIRO psychological needs and attachment styles
- **Key Columns**:
  - `inclusion_need` (1-10): Need for social connection
  - `control_need` (1-10): Need for structure/control
  - `affection_need` (1-10): Need for emotional intimacy
  - `attachment_style`: secure, anxious, avoidant, disorganized
  - `communication_directness`: direct, indirect
  - `conflict_style`: competing, collaborating, avoiding, accommodating, compromising

#### `enhanced_onboarding_responses`
- **Purpose**: Detailed onboarding questionnaire responses
- **Key Columns**: Love language rankings, communication preferences, intimacy priorities, relationship goals
- **AI Integration**: Used for personalized insight generation

### 2. Relationship Management Tables

#### `relationships`
- **Purpose**: Core relationship records
- **Key Columns**: 
  - `id` (uuid, primary key)
  - `name` (relationship name/title)
  - `relationship_type`: romantic, work, family, friend, other
  - `created_by` (FK to users)

#### `relationship_members`
- **Purpose**: Many-to-many mapping of users to relationships
- **Key Columns**: `relationship_id`, `user_id`, `role` (admin/member)
- **Note**: Supports multi-user relationships (couples, families, teams)

#### `relationship_profiles`
- **Purpose**: User's specific profile/behavior within each relationship
- **Key Columns**: `perceived_closeness` (1-10), `communication_frequency`, `interaction_preferences`

#### `relationship_checkins`
- **Purpose**: Daily relationship check-ins with type-specific metrics
- **Key Columns**:
  - `metric_values` (jsonb): Stores different metrics per relationship type
  - `text_responses` (jsonb): Free-form responses
  - `relationship_type`: Determines which metrics are collected

#### `relationship_health_scores`
- **Purpose**: Calculated relationship health with trend analysis
- **Key Columns**:
  - `health_score` (0-100): Overall relationship health
  - `trend`: improving, stable, declining
  - `metric_scores` (jsonb): Component scores
  - `checkins_analyzed`: Number of data points used

### 3. Content & Analysis Tables

#### `journal_entries`
- **Purpose**: Private user journaling with AI processing status
- **Key Columns**:
  - `content` (text): Private journal content
  - `relationship_id`: Optional relationship context
  - `ai_processing_status`: pending, processing, completed
  - `ready_for_batch_processing`: Flag for partner suggestion batching

#### `enhanced_journal_analysis`
- **Purpose**: AI analysis results for journal entries
- **Key Columns**:
  - `sentiment_analysis` (jsonb): Emotional tone analysis
  - `relationship_needs` (jsonb): Detected FIRO needs
  - `relationship_health_score` (1-10): Perceived health from entry
  - `pattern_insights` (jsonb): Behavioral patterns detected

#### `relationship_insights`
- **Purpose**: AI-generated insights for users
- **Key Columns**:
  - `insight_type`: pattern, suggestion, appreciation, milestone, growth
  - `title`, `description`: Insight content
  - `pillar_type`: pattern, growth, appreciation, milestone
  - `relevance_score` (0-100): Algorithm-determined relevance
  - `read_status`: unread, read, acknowledged

#### `partner_suggestions`
- **Purpose**: Anonymized suggestions for relationship partners
- **Key Columns**:
  - `recipient_user_id`: Who receives the suggestion
  - `source_user_id`: Who's data generated it (for analytics)
  - `suggestion_text`: Anonymized actionable suggestion
  - `pillar_type`: Category of suggestion
  - `batch_date`, `batch_id`: Batch processing tracking

### 4. AI Memory System (Built, Integration Pending)

#### `ai_memory_entries`
- **Purpose**: Stored AI memories for context and personalization
- **Key Columns**:
  - `entry_type`: interaction, insight, pattern, milestone, preference, boundary
  - `content`: Memory content
  - `importance`: low, medium, high, critical
  - `emotional_tone`: positive, neutral, negative, mixed
  - `confidence_score`: Reliability of memory

#### `ai_conversation_history`
- **Purpose**: Complete AI interaction history
- **Key Columns**:
  - `conversation_type`: insight_generation, journal_analysis, suggestion_creation
  - `user_input`, `ai_response`: Full conversation content
  - `ai_personality_used`: Which AI personality was active
  - `memory_entries_referenced`: Number of memories used

#### `relationship_context_cache`
- **Purpose**: Cached relationship context for performance
- **Key Columns**:
  - `recent_interactions` (jsonb): Recent relationship events
  - `important_patterns` (jsonb): Identified behavioral patterns
  - `preferences` (jsonb): User/partner preferences
  - `milestones` (jsonb): Important relationship events

### 5. Premium Features Tables

#### `premium_subscriptions`
- **Purpose**: User subscription status and billing
- **Key Columns**:
  - `subscription_status`: active, cancelled, expired, trial
  - `plan_type`: premium_monthly, premium_yearly, premium_trial
  - `stripe_subscription_id`: Stripe integration
  - `current_period_start`, `current_period_end`: Billing periods

#### `firo_compatibility_results`
- **Purpose**: FIRO-based compatibility analysis (premium feature)
- **Key Columns**:
  - `user1_inclusion`, `user1_control`, `user1_affection`: User 1 FIRO scores
  - `user2_inclusion`, `user2_control`, `user2_affection`: User 2 FIRO scores
  - `overall_compatibility_score` (0-100): Calculated compatibility
  - `confidence_level`: Analysis confidence

#### `communication_analysis_results`
- **Purpose**: Communication style analysis (premium feature)
- **Key Columns**:
  - `directness_score`, `assertiveness_score` (0-100)
  - `conflict_style`: User's conflict management approach
  - `journal_entries_analyzed`: Minimum 10 entries required

### 6. Phase 9: Generation Controls (NEW)

#### `generation_controls`
- **Purpose**: Track daily limits and check-in requirements (Phase 9)
- **Key Columns**:
  - `last_checkin_at`: Timestamp of last check-in
  - `checkins_today`: Always 0 or 1 (daily limit enforced)
  - `checkin_date`: Date tracking for daily reset
  - `first_journal_after_checkin_today`: Free tier insight limit tracking
  - `insights_generated_today`: Daily insight count
  - `suggestions_generated_today`: Daily suggestion count

**Helper Functions**:
- `can_user_checkin(user_id, relationship_id)`: Check if check-in allowed today
- `can_generate_insight(user_id, relationship_id, is_premium)`: Check insight generation eligibility
- `record_checkin(user_id, relationship_id)`: Record successful check-in
- `record_insight_generation(user_id, relationship_id)`: Track insight creation

### 7. Analytics & Monitoring Tables

#### `batch_processing_log`
- **Purpose**: Track daily batch processing for partner suggestions
- **Key Columns**:
  - `batch_date`: Date of processing
  - `entries_processed`, `suggestions_generated`: Processing metrics
  - `processing_status`: running, completed, failed
  - `error_message`: Failure details

#### `memory_system_analytics`
- **Purpose**: Monitor AI memory system performance
- **Key Columns**:
  - `memory_operation`: store, retrieve, update, delete, cleanup
  - `operation_success`: Success/failure tracking
  - `operation_time_ms`: Performance monitoring

## Data Storage Patterns

### JSONB Usage
- **Flexible Schemas**: `metric_values`, `text_responses` in check-ins adapt per relationship type
- **Analysis Results**: AI analysis stored as structured JSON for complex queries
- **User Preferences**: Complex preference structures stored efficiently

### Temporal Patterns
- **Daily Reset Logic**: Generation controls reset counters based on date comparison
- **Trend Analysis**: Health scores track changes over time with calculation dates
- **Batch Processing**: Daily batch processing with date-based grouping

## Security & Privacy Implementation

### Row Level Security (RLS)
- **User Isolation**: All policies enforce `auth.uid() = user_id`
- **Relationship Scoping**: Users only access their own relationships
- **Content Privacy**: Journal entries never cross user boundaries

### Key RLS Policies
```sql
-- Example: Users can only see their own insights
CREATE POLICY "Users can view own insights" 
  ON relationship_insights
  FOR SELECT
  USING (generated_for_user = auth.uid());

-- Example: Partner suggestions use recipient isolation
CREATE POLICY "Users can view suggestions sent to them" 
  ON partner_suggestions
  FOR SELECT
  USING (recipient_user_id = auth.uid());
```

### Privacy Boundaries
- **Journal Content**: Never exposed to other users, even relationship partners
- **Suggestions**: Anonymized and actionable, no source content revealed
- **Analytics**: Aggregated data only, individual content protected

## Data Migration & Versioning

### Schema Evolution
- **Phase 1-8**: Core relationship and AI features
- **Phase 9**: Generation controls and premium gating
- **Future Phases**: Schema designed for additional relationship types

### Migration Pattern
```sql
-- Example: Add new columns with defaults
ALTER TABLE relationship_health_scores 
  ADD COLUMN calculation_date timestamptz DEFAULT now();

-- Update existing records
UPDATE relationship_health_scores 
  SET calculation_date = created_at 
  WHERE calculation_date IS NULL;
```

## Performance Considerations

### Indexing Strategy
- **Primary Keys**: UUID primary keys on all tables
- **Foreign Keys**: Indexed for join performance
- **Query Patterns**: Indexes on commonly filtered columns (`user_id`, `relationship_id`, `created_at`)

### Query Optimization
- **RLS Performance**: Policies optimized for user-scoped queries
- **JSONB Queries**: GIN indexes on JSONB columns where needed
- **Temporal Queries**: Date-based partitioning considered for high-volume tables

This schema supports RelationshipOS's multi-relationship intelligence while maintaining strict privacy boundaries and enabling sustainable premium features through cost-optimized AI processing.