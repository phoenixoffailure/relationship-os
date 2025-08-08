
# CLAUDE.md
# RelationshipOS v2.0 - Complete Universal Relationship Intelligence Platform

> **📊 BUILD STATUS**: See [BUILD.md](./BUILD.md) for current development status, phase tracking, and technical implementation details.
> 
> **🔄 CURRENT FOCUS**: Phase 4 - Daily Batch Processing System (detailed in BUILD.md)
> 
> This file contains the complete project vision and psychological foundation. For day-to-day development tracking, reference BUILD.md.

## 🎯 PROJECT VISION & TRANSFORMATION GOALS

**Mission**: Transform RelationshipOS from romantic-only app → universal relationship intelligence platform supporting ALL relationship types (romantic, family, friends, coworkers, etc.)

**Core Innovation**: AI that adapts its behavior based on relationship type using research-backed psychology (FIRO theory, attachment styles, communication preferences)

**Target Outcome**: Users can manage and improve multiple relationships simultaneously with AI that understands the unique dynamics, boundaries, and expectations of each relationship type.

---

## 📅 COMPLETE MIGRATION ROADMAP (6-Phase Transformation)

### ✅ PHASE 1 COMPLETED - Critical Integration Fixes
**Status**: 100% Complete ✅
**Achievement**: Database integration, relationship selection, onboarding triggers
**Files Modified**: Journal analysis system, relationship management
**Result**: Foundation stable and ready for enhancement

### ✅ PHASE 1.5 COMPLETED - Complete Database Integration  
**Status**: 100% Complete ✅
**Achievement**: All AI systems migrated to v2.0 psychological data structure
**Database Migration**: `enhanced_onboarding_responses` → `universal_user_profiles` + `relationship_profiles`
**Result**: All AI systems using consistent research-backed psychology data

### ✅ PHASE 2 COMPLETED - AI Personality Transformation
**Status**: 100% Complete ✅
**Achievement**: Transformed clinical AI → warm, caring therapist personality
**AI Transformation**: 
- BEFORE: "Your recent gratitude expressions regarding intimate connection events correlate with elevated mood metrics"
- AFTER: "I notice how physical intimacy is helping you rediscover your connection - that awareness of enjoying each other's company often strengthens relationships"
**Files Modified**: `app/api/insights/generate/route.ts`, `app/api/relationships/generate/route.ts`, `app/api/journal/unified-save-and-analyze/route.ts`
**Result**: AI now sounds like a warm, professional therapist while maintaining psychological accuracy and appropriate boundaries

### ✅ PHASE 3 COMPLETED - Complete User Flow Integration
**Status**: 100% Complete ✅
**Achievement**: Added relationship-type intelligence + refined AI personality to professional therapist standard
**AI Personality Refinement**: 
- Fixed overly familiar language (removed pet names like "darling", "sweetheart")
- Eliminated inappropriate personal reactions ("I'm so touched by...")
- Maintained warmth while establishing professional therapeutic boundaries
- AI now adapts behavior based on romantic/family/friend/work context appropriately
**Files Modified**: `app/api/insights/generate/route.ts`, `lib/ai/relationship-type-intelligence.ts`
**Result**: 
- Romantic AI = professionally warm, intimate insights
- Family AI = diplomatically supportive, boundary-aware
- Friend AI = casual but professional, positive guidance
- Work AI = professional, respectful, business-appropriate
- Multi-relationship users get proper context switching
- AI maintains therapeutic boundaries while being genuinely helpful

### ✅ PHASE 4 COMPLETED - Daily Batch Processing System
**Status**: 100% Complete ✅
**Achievement**: Implemented daily batch processing for partner suggestions with Vercel cron scheduling
**Technical Implementation**: 
- `/api/batch/daily-partner-suggestions/route.ts` - Daily batch processing endpoint
- `vercel.json` - Cron job configuration (runs 11 PM daily)
- Relationship-aware batching logic groups journals by relationship for processing
**Result**: Partner suggestions now generated in efficient daily batches instead of real-time, reducing AI API costs and improving performance

### ✅ PHASE 5 COMPLETED - Multi-Relationship Dashboard Enhancement
**Status**: 100% Complete ✅
**Achievement**: Complete dashboard transformation supporting all relationship types with swipeable interface
**Features Implemented**:
- **Clean Relationship Cards** (`clean-relationship-cards.tsx`) - Swipeable cards for romantic/family/friend/work relationships
- **Unified Insights Feed** (`clean-insights-feed.tsx`) - Context-aware activity feed with relationship filtering
- **Dashboard Mode Toggle** - Users can switch between Clean View (Phase 5) and Enhanced View (legacy)
- **Context Switching** - Seamless switching between relationship contexts with appropriate AI behavior
- **Relationship Health Visualization** - Visual health scores and trend indicators per relationship
**Files Modified**: `app/(protected)/dashboard/page.tsx`, dashboard components
**Result**: Users can now manage multiple relationships simultaneously with proper context switching and relationship-type-appropriate interfaces

### ✅ PHASE 6A COMPLETED - Premium Analytics Platform
**Status**: 100% Complete ✅  
**Achievement**: Research-backed premium analytics with FIRO compatibility analysis operational
**Business Model**: Premium tier ($9.99/month) successfully implemented with subscription paywall
**Safety Standard**: All features backed by peer-reviewed research with confidence scoring and clear limitations

**FEATURES IMPLEMENTED**:
- ✅ **Premium Subscription System** - Complete database schema, RLS policies, access control middleware
- ✅ **FIRO Compatibility Analysis** - Research-validated algorithm using Schutz FIRO theory (50+ years validation)
- ✅ **Premium Analytics Dashboard** (`/premium/analytics`) - Professional UI with radar charts, research citations
- ✅ **Subscription Paywall** - Access control, 7-day trial option, premium navigation integration
- ✅ **Beta User Management** - SQL scripts for granting premium access to beta testers
- ✅ **Research Foundation** - All algorithms backed by 3+ peer-reviewed studies with clear limitations

**Technical Implementation Complete**:
- ✅ Database: `premium_subscriptions`, `premium_analyses`, `firo_compatibility_results` tables with RLS
- ✅ APIs: `/api/premium/firo-compatibility`, `/api/premium/subscription-check` endpoints operational
- ✅ UI: Complete premium analytics page with paywall, charts, research citations, confidence scores
- ✅ Safety: Clear disclaimers, professional therapy referrals, research backing required for all features

**Files Modified**: 
- `database/phase-6a-premium-schema.sql` - Complete premium database schema
- `app/api/premium/firo-compatibility/route.ts` - FIRO compatibility analysis API
- `app/premium/analytics/page.tsx` - Premium analytics dashboard
- `app/(protected)/dashboard/page.tsx` - Added premium navigation link

**Result**: Premium subscribers can now access research-backed FIRO compatibility analysis with professional-grade insights, confidence scoring, and clear research citations. System is ready for beta testing and Stripe integration.

### ✅ PHASE 6B COMPLETED - Clean Insights Page Redesign
**Status**: 100% Complete ✅  
**Achievement**: Complete insights page UX overhaul with decluttered interface and enhanced functionality
**Goal**: Transform cluttered insights page into clean, focused interface that maximizes user engagement

**UX PROBLEMS SOLVED**:
- ❌ **Before**: Cognitive overload with 3 tabs, multiple info boxes, counters, feedback buttons, auto-timers
- ❌ **Before**: Competing attention between personal insights and partner suggestions  
- ❌ **Before**: UI noise from sample insights, priority dots, timestamps, complex pillar color coding
- ❌ **Before**: Complex navigation requiring users to hunt across different tab views

**FEATURES IMPLEMENTED**:
- ✅ **Clean Two-Tab Interface** - "For You" (personal) and "From Your Partner" (suggestions) with focused content
- ✅ **Smart 2-Insight Focus** - System already selects 2 most relevant insights based on pillar scoring (>70 threshold)
- ✅ **Progressive Disclosure** - "View More/Less" for historical insights organized chronologically
- ✅ **48-Hour Partner Filtering** - Only shows recent partner suggestions per active relationship
- ✅ **Complete Read State Management** - Auto-read timers + manual "Got it" buttons for both insight types
- ✅ **Unified Feedback System** - Thumbs up/down for both personal insights and partner suggestions (AI training)
- ✅ **Mark All as Read** - Bulk action buttons for both personal insights and partner suggestions
- ✅ **Relationship-Aware Display** - Partner suggestions grouped by relationship with 48-hour recency filter

**TECHNICAL IMPLEMENTATION**:
- ✅ **Component**: `components/insights/CleanInsightsLayout.tsx` - Complete redesign replacing EnhancedInsightsLayout
- ✅ **APIs**: `/api/partner-suggestions/feedback` - Partner suggestion feedback collection
- ✅ **APIs**: `/api/partner-suggestions/mark-read` - Individual partner suggestion read state
- ✅ **APIs**: `/api/insights/mark-all-read` - Bulk mark personal insights as read
- ✅ **APIs**: `/api/partner-suggestions/mark-all-read` - Bulk mark partner suggestions as read
- ✅ **Database**: Enhanced read state management for both `relationship_insights` and `partner_suggestions`
- ✅ **State Management**: Separate feedback tracking, auto-read timers, and real-time UI updates

**USER EXPERIENCE FLOW**:
1. **Generate Insights** → Always lands on "For You" tab with 2 smartly-selected insights
2. **Focused Attention** → Users see only most relevant content, reducing decision paralysis
3. **Quick Actions** → Individual "Got it" buttons or bulk "Mark All as Read" options
4. **Feedback Loop** → Thumbs up/down system trains AI for both personal and partner suggestions
5. **History Access** → "View More" reveals chronological history when needed
6. **Partner Context** → Separate tab shows recent suggestions per active relationship

**FILES MODIFIED**:
- `app/(protected)/insights/page.tsx` - Updated to use CleanInsightsLayout
- `components/insights/CleanInsightsLayout.tsx` - Complete new component (571 lines)
- `app/api/partner-suggestions/feedback/route.ts` - New feedback API
- `app/api/partner-suggestions/mark-read/route.ts` - New individual read API
- `app/api/insights/mark-all-read/route.ts` - New bulk read API for insights
- `app/api/partner-suggestions/mark-all-read/route.ts` - New bulk read API for suggestions

**RESULT**: Users now have a clean, focused insights experience that maximizes engagement with the 2 most relevant insights while maintaining full access to history and partner suggestions. The interface reduces cognitive load while enhancing functionality through smart bulk actions and unified feedback systems.

### ✅ PHASE 6C COMPLETED - Clean Journal Page Redesign
**Status**: 100% Complete ✅  
**Achievement**: Complete journal page UX overhaul with decluttered interface and read-only entries
**Goal**: Transform cluttered journal page into clean, focused interface that protects AI system integrity

**UX PROBLEMS SOLVED**:
- ❌ **Before**: ALL journal entries displayed in endless scrolling list with full content visible
- ❌ **Before**: Complex inline editing allowed post-AI-analysis modifications (system integrity risk)
- ❌ **Before**: UI noise from edit/delete buttons, tags, AI analysis boxes, private badges on every entry
- ❌ **Before**: No clear focus on recent activity - users see months/years of entries at once

**FEATURES IMPLEMENTED**:
- ✅ **Clean Tab System** - "Personal" tab for non-relationship entries + one tab per relationship
- ✅ **Most Recent Focus** - Shows only latest entry per tab with "View Older Entries" for history
- ✅ **Write-Only Flow** - Removed ALL editing capabilities to protect AI analysis integrity
- ✅ **No Delete Function** - Entries are permanent once posted (maintains data consistency)
- ✅ **Minimal UI Elements** - Removed edit/delete buttons, tags, AI boxes, keeping only essential info
- ✅ **Smart Tab Behavior** - Auto-switches to relationship tab after saving related entry
- ✅ **Relationship Pre-selection** - New entry form pre-fills based on current tab context
- ✅ **Performance Optimization** - Initial load limited to 50 recent entries

**CRITICAL DESIGN DECISION - NO EDITING**:
- **Why**: AI generates insights based on original journal content
- **Risk**: Editing after analysis could invalidate insights and break system integrity
- **Solution**: Write-only flow ensures AI analysis remains accurate
- **User Benefit**: Cleaner interface without complex edit states

**TECHNICAL IMPLEMENTATION**:
- ✅ **Component**: `components/journal/CleanJournalLayout.tsx` - Complete redesign (526 lines)
- ✅ **Page Update**: `app/(protected)/journal/page.tsx` - Simplified to 10 lines
- ✅ **Removed Code**: ~700 lines of edit/update/delete functionality removed
- ✅ **Preserved**: All AI analysis integration remains intact via unified-save-and-analyze

**USER EXPERIENCE FLOW**:
1. **View by Tab** → Personal reflections OR specific relationship entries
2. **Write New** → Select relationship (optional) → Write → Save (permanent)
3. **Most Recent** → See only latest entry per context (reduces overwhelm)
4. **History Access** → "View Older Entries" when needed (progressive disclosure)

**TAB STRUCTURE LOGIC**:
- **"Personal" Tab**: Only entries with no relationship_id (true personal reflections)
- **Relationship Tabs**: Only entries for that specific relationship_id
- **Clear Separation**: Personal thoughts vs. relationship-specific thoughts
- **Always Present**: Personal tab visible even with no relationships

**FILES MODIFIED**:
- `components/journal/CleanJournalLayout.tsx` - New clean component
- `app/(protected)/journal/page.tsx` - Updated to use CleanJournalLayout

**RESULT**: Users now have a clean, focused journaling experience that shows only relevant recent entries per relationship context. The write-only flow protects AI system integrity while dramatically reducing UI complexity. The interface went from 700+ lines with complex edit states to a clean 526-line read-only implementation.

### 🎯 PHASE 6D - Advanced Analytics Enhancement (NEXT)
**Status**: Scoped for Post-MVP 🔄
**Goal**: Enhanced premium features with more sophisticated pattern recognition
**Features**: 
- **Predictive Relationship Modeling** - Advanced trend forecasting with confidence intervals
- **Personalized Coaching Programs** - AI-driven improvement plans based on individual psychological profiles  
- **Cross-Relationship Analytics** - Pattern recognition across multiple relationship types (family/friend/work)
- **Research Integration Updates** - Continuous integration of new relationship psychology research

### ⏳ PHASE 6B - System Polish & Scale (FUTURE)
**Goal**: Performance optimization, mobile responsiveness, comprehensive testing
**Features**: Performance improvements, edge case handling, mobile app development, advanced analytics

---

## 🧠 RESEARCH FOUNDATION (Critical Context)

### **FIRO Theory Integration**:
- **Inclusion Need**: How much user needs to feel included/connected (1-9 scale)
- **Control Need**: How much user needs influence/structure (1-9 scale)  
- **Affection Need**: How much user needs closeness/intimacy (1-9 scale)
- **Current User Example**: inclusion:8/control:7/affection:8 (high needs across all areas)

### **Attachment Theory Integration**:
- **Secure**: Comfortable with intimacy and independence
- **Anxious**: Craves closeness, fears abandonment
- **Avoidant**: Values independence, uncomfortable with closeness
- **Disorganized**: Inconsistent patterns, internal conflict
- **Current User Example**: disorganized attachment style

### **Communication Style Integration**:
- **Directness**: direct vs diplomatic vs indirect
- **Assertiveness**: assertive vs passive vs aggressive
- **Current User Example**: direct + assertive communication

### **Relationship Type Psychology** (Phase 3 Core):
| Type | AI Tone | Emotional Intensity | Nudging Frequency | Boundaries |
|------|---------|-------------------|------------------|------------|
| Romantic | Emotionally warm, intimate | High | Moderate | Intimacy appropriate |
| Family | Affirming but diplomatically firm | Medium | Gentle | Respect family roles |
| Friend | Casual, supportive, encouraging | Medium | Infrequent | Maintain independence |
| Work | Respectful, professional, neutral | Low | Low | Professional boundaries essential |
| Other | Balanced, adaptive approach | Medium | Moderate | Context-appropriate |

---

## 📊 CURRENT SYSTEM STATUS (What's Working vs What Needs Building)

### ✅ WHAT'S WORKING PERFECTLY (Don't Break These):

**Database Architecture**:
- `universal_user_profiles` - FIRO needs, attachment styles, communication preferences ✅
- `relationship_profiles` - relationship-specific context (closeness, frequency, interaction preferences) ✅
- `relationships` - relationship type (romantic/family/friend/work/other) stored ✅
- `journal_entries` - with relationship_id for context ✅
- `enhanced_journal_analysis` - psychological analysis of journal content ✅
- `insights` - personal insights for journal writer ✅
- `partner_suggestions` - suggestions for partners (correctly excludes journal writer) ✅

**AI Systems Working**:
- **Unified Journal System**: `/api/journal/unified-save-and-analyze` endpoint ✅
- **Personal Insights**: Generate 4 insights with warm friend tone for journal writer ✅
- **Partner Suggestions**: Generate 3 suggestions with warm friend tone for partner only ✅
- **Enhanced Analysis**: Psychological analysis with research-backed data ✅
- **Grok AI Integration**: Working API calls to Grok-4 model ✅

**User Experience Working**:
- Journal entry saving with mood scores ✅
- Warm, caring AI personality (not clinical anymore) ✅
- Research-backed personalization using FIRO + attachment data ✅
- Privacy protection (journal content never revealed to partners) ✅
- Partner logic correct (journal writer excluded from suggestions) ✅

### ⚠️ WHAT NEEDS TO BE BUILT: Phase 3 Gap

**The Problem**: AI behavior is identical regardless of relationship type
- Romantic relationships get same prompts as work relationships
- Family relationships get same tone as friend relationships  
- No boundary awareness (risk of inappropriate suggestions)
- No context switching for multi-relationship users

**The Solution**: Relationship-Type Intelligence System

## 🚀 PHASE 3 IMPLEMENTATION REQUIREMENTS

### **Priority 1: Core Relationship-Type Intelligence**

**File to Create: `lib/ai/relationship-type-intelligence.ts`**

Must include:
- Configuration objects for each relationship type (romantic/family/friend/work/other)
- Functions to detect relationship type from context
- Functions to create relationship-type-aware AI prompts
- Behavior modifiers (emotional intensity, nudging frequency, appropriate topics)
- Boundary enforcement (no intimacy suggestions for work relationships)

### **Priority 2: Enhanced API Integration**

**Files to Modify:**

1. **`app/api/insights/generate/route.ts`** (Currently generates warm friend insights for all relationship types)
   - Import relationship-type-intelligence system
   - Detect user's primary relationship type from database
   - Use relationship-type-aware prompts for Grok API calls
   - Test: Romantic insights should be intimate, work insights should be professional

2. **`app/api/relationships/generate/route.ts`** (Currently generates warm friend partner suggestions for all relationship types)
   - Import relationship-type-intelligence system
   - Detect relationship type from relationship_id  
   - Adapt partner suggestions based on relationship type
   - Test: No intimacy suggestions for work relationships

### **Priority 3: Multi-Relationship Context Switching**

**File to Create: `lib/ai/multi-relationship-context-switcher.ts`**

Must handle:
- Users with multiple relationship types (romantic + family + friend + work)
- Context switching when user journals about different relationships
- Aggregated insights that respect boundaries across relationship types
- Proper AI behavior adaptation when switching contexts

### **Priority 4: Testing & Validation**

**File to Create: `test/relationship-type-intelligence.test.ts`**

Must verify:
- Romantic relationships generate intimate, warm insights
- Work relationships generate professional, boundaried suggestions
- Family relationships use diplomatic, boundary-aware tone
- Friend relationships use casual, supportive tone  
- No inappropriate cross-contamination (e.g., intimacy suggestions for work relationships)

---

## 🎯 SUCCESS CRITERIA FOR COMPLETE v2.0 TRANSFORMATION

### **User Experience Goals**:
- Users can manage romantic, family, friend, and work relationships in one platform
- AI adapts appropriately: intimate for romantic, professional for work, casual for friends
- Multi-relationship users get seamless context switching
- No inappropriate suggestions across relationship types

### **Technical Goals**:
- All relationship types supported with appropriate AI behavior
- Research-backed psychology integrated throughout (FIRO + Attachment + Communication)
- Database architecture supports universal relationship types
- Performance optimized for multi-relationship users

### **Business Goals**:
- Transform from niche romantic app → universal relationship platform
- Address much larger market (everyone has family, friends, coworkers)
- Maintain competitive advantage through psychological research integration
- Enable users to improve ALL their relationships, not just romantic ones

---

## 📋 TECHNICAL ARCHITECTURE OVERVIEW

### **Database Schema (v2.0 - Already Complete)**:
```sql
-- User psychological profiles (FIRO + Attachment + Communication)
universal_user_profiles (
  user_id, inclusion_need, control_need, affection_need, 
  attachment_style, communication_directness, communication_assertiveness,
  love_language_giving[], love_language_receiving[]
)

-- Relationship-specific context
relationship_profiles (
  user_id, relationship_id, perceived_closeness, communication_frequency,
  preferred_interaction_style, relationship_expectations
)

-- Relationships with type classification
relationships (
  id, name, relationship_type, created_by, created_at
)

-- Journal entries with relationship context
journal_entries (
  id, user_id, content, mood_score, relationship_id, created_at
)
```

### **AI Systems Architecture**:
```
Journal Entry → Enhanced Analysis → {
  Personal Insights (for journal writer)
  Partner Suggestions (for other people in relationship)
}

Current: Warm friend tone for all relationship types
Needed: Relationship-type-aware tone adaptation
```

### **API Endpoints (Current)**:
- `/api/journal/unified-save-and-analyze` - Saves journal + triggers all AI analysis ✅
- `/api/insights/generate` - Creates personal insights with warm friend tone ✅
- `/api/relationships/generate` - Creates partner suggestions with warm friend tone ✅
- `/api/onboarding/universal` - Universal psychological profiling ✅
- `/api/onboarding/relationship` - Relationship-specific profiling ✅

---

## 🔬 PSYCHOLOGICAL RESEARCH INTEGRATION

### **FIRO Theory Application**:
- High inclusion need (8/9) → AI emphasizes connection and involvement
- High control need (7/9) → AI offers structured suggestions and agency
- High affection need (8/9) → AI uses warm, caring language

### **Attachment Theory Application**:
- Disorganized attachment → AI is gentle about relationship struggles, validates internal conflict
- Secure attachment → AI is confident and direct
- Anxious attachment → AI provides reassurance and validation
- Avoidant attachment → AI respects independence and space needs

### **Communication Style Application**:
- Direct + Assertive → AI uses straightforward language, offers honest feedback
- Indirect + Passive → AI uses gentle suggestions, softer language
- Aggressive → AI helps channel assertiveness constructively

### **Relationship Type Psychology** (Critical for Phase 3):
Built on research from Thomas-Kilmann conflict styles, interpersonal communication theory, and relationship psychology:

**Romantic Relationships**:
- High emotional intensity, intimate communication appropriate
- Focus: emotional connection, physical affection, shared future
- AI Tone: "I love that you mentioned how having sex reminded you both..."

**Family Relationships**:  
- Complex dynamics, boundary awareness essential
- Focus: support, communication, respect for family roles
- AI Tone: "Family relationships can be complex, and your willingness to see both good and challenges..."

**Friend Relationships**:
- Light, positive, low-pressure dynamics
- Focus: fun, shared activities, mutual support without obligation
- AI Tone: "It's awesome that you're putting this much thought into your friendships!"

**Work Relationships**:
- Professional boundaries, business-appropriate communication
- Focus: collaboration, professional development, workplace harmony
- AI Tone: "Consider a professional approach that improves working relationships while maintaining boundaries"

---

## 🎯 CURRENT STATUS: WHERE WE ARE NOW

### **✅ FOUNDATION COMPLETE (Phases 1-2)**:
- **Database**: v2.0 psychological data structure fully implemented
- **AI Personality**: Warm friend tone active (no longer clinical)
- **Core Features**: Journaling, insights, partner suggestions all working
- **Research Integration**: FIRO + Attachment + Communication data flowing through all AI systems
- **Technical Stability**: No TypeScript errors, all endpoints functional
- **Privacy**: Journal content protected, anonymized partner suggestions working

### **⚠️ CURRENT GAP (Phase 3 Needed)**:
- AI behavior identical for all relationship types
- Romantic relationships get same prompts as work relationships
- No boundary awareness (potential for inappropriate suggestions)
- No context switching for multi-relationship users
- Missing relationship-type intelligence layer

### **📋 VERIFIED WORKING BEHAVIOR (Current)**:
When someone journals:
1. Journal saved with relationship context ✅
2. Enhanced psychological analysis completed ✅  
3. 4 personal insights generated with warm friend tone ✅
4. 3 partner suggestions generated for OTHER person only ✅
5. All AI uses v2.0 psychological data (FIRO: inclusion:8/control:7/affection:8, attachment: disorganized) ✅

---

## 🚀 PHASE 3: RELATIONSHIP-TYPE INTELLIGENCE (CURRENT PRIORITY)

### **What Needs to Be Built**:

1. **Core Intelligence System** (`lib/ai/relationship-type-intelligence.ts`)
   - Relationship-type configurations with research-backed behavior differences
   - AI prompt adaptation functions
   - Boundary enforcement system
   - Behavior modifiers for each relationship type

2. **API Enhancement** (Modify existing working APIs)
   - `app/api/insights/generate/route.ts` - Add relationship-type-aware prompt building
   - `app/api/relationships/generate/route.ts` - Add relationship-type-aware suggestion filtering

3. **Multi-Relationship Support** (`lib/ai/multi-relationship-context-switcher.ts`)
   - Context switching for users with multiple relationship types
   - Aggregated insights that respect boundaries
   - Session management for relationship context

4. **Testing & Validation** (`test/relationship-type-intelligence.test.ts`)
   - Verify appropriate AI behavior for each relationship type
   - Boundary compliance testing
   - Multi-relationship user scenarios

### **Expected Behavior After Phase 3**:
- **Romantic Journal**: "I love that you're being so intentional about your intimate connection..."
- **Family Journal**: "Family relationships can be complex, and your balanced perspective shows real maturity..."
- **Friend Journal**: "It's awesome that you're putting this much thought into your friendships!"
- **Work Journal**: "Consider a professional approach that improves collaboration while maintaining boundaries..."

---

## 🔬 RESEARCH-BACKED PSYCHOLOGY FOUNDATION

### **FIRO Theory (Fundamental Interpersonal Relations Orientation)**:
- **Inclusion**: Need for connection and belonging (affects how AI emphasizes social aspects)
- **Control**: Need for influence and structure (affects how AI offers agency vs guidance)
- **Affection**: Need for closeness and warmth (affects AI emotional intensity)

### **Attachment Theory Integration**:
- **Secure**: AI can be direct and confident
- **Anxious**: AI provides extra reassurance and validation
- **Avoidant**: AI respects independence and doesn't push closeness
- **Disorganized**: AI is gentle about relationship struggles, validates internal conflict

### **Communication Style Theory**:
- **Direct + Assertive**: AI uses straightforward language, honest feedback
- **Indirect + Diplomatic**: AI uses gentle suggestions, softer approaches
- **Passive**: AI provides structure and encouragement to speak up

### **Relationship Type Psychology** (Thomas-Kilmann + Interpersonal Communication Research):
Each relationship type has different expectations, boundaries, and communication norms that AI must respect.

---

## 📊 DATABASE ARCHITECTURE (v2.0 Schema)

### **User Profiles**:
```sql
universal_user_profiles (
  user_id UUID PRIMARY KEY,
  inclusion_need INTEGER (1-9),
  control_need INTEGER (1-9), 
  affection_need INTEGER (1-9),
  attachment_style TEXT (secure/anxious/avoidant/disorganized),
  communication_directness TEXT (direct/moderate/diplomatic),
  communication_assertiveness TEXT (assertive/moderate/passive),
  love_language_giving TEXT[],
  love_language_receiving TEXT[]
)
```

### **Relationship Context**:
```sql
relationships (
  id UUID PRIMARY KEY,
  name TEXT,
  relationship_type TEXT (romantic/family/friend/work/other),
  created_by UUID,
  created_at TIMESTAMP
)

relationship_profiles (
  user_id UUID,
  relationship_id UUID,
  perceived_closeness INTEGER (1-10),
  communication_frequency TEXT,
  preferred_interaction_style TEXT,
  relationship_expectations JSONB
)
```

### **Activity & Analysis**:
```sql
journal_entries (
  id UUID PRIMARY KEY,
  user_id UUID,
  content TEXT,
  relationship_id UUID (links to specific relationship),
  mood_score INTEGER (1-10),
  created_at TIMESTAMP
)

enhanced_journal_analysis (
  id UUID PRIMARY KEY,
  user_id UUID,
  sentiment_analysis JSONB,
  relationship_health_score INTEGER (1-10),
  pattern_insights JSONB,
  analysis_version TEXT
)

insights (
  id UUID PRIMARY KEY,
  generated_for_user UUID,
  insight_type TEXT (pattern/suggestion/appreciation/milestone),
  title TEXT,
  description TEXT,
  relationship_id UUID,
  priority TEXT
)

partner_suggestions (
  id UUID PRIMARY KEY,
  relationship_id UUID,
  recipient_user_id UUID (who receives the suggestion),
  source_user_id UUID (whose journal triggered it),
  suggestion_type TEXT,
  suggestion_text TEXT,
  anonymized_context TEXT,
  priority_score INTEGER,
  expires_at TIMESTAMP
)
```

---

## 🎯 CURRENT WORKING FEATURES (Preserve These)

### **Unified Journal System** (✅ Working):
1. User writes journal entry (with optional relationship_id)
2. Enhanced AI analysis extracts sentiment, patterns, health score
3. Personal insights generated for journal writer (4 insights, warm friend tone)
4. Partner suggestions generated for OTHER people in relationships (3 suggestions, warm friend tone)
5. All systems use v2.0 psychological data consistently

### **AI Personality** (✅ Working):
- Warm, caring friend tone (not clinical anymore)
- References user's specific content (gratitudes, challenges)
- Uses psychological profile (FIRO needs, attachment style) naturally
- Maintains research accuracy while being conversational

### **Privacy Protection** (✅ Working):
- Journal content never revealed to partners
- Partner suggestions are anonymized ("your partner could benefit from...")
- Enhanced analysis preserves content privacy
- Suggestions based on needs detection, not content quotation

---

## 🔧 IMPLEMENTATION STRATEGY FOR CLAUDE CODE

### **Phase 3 Step-by-Step Approach**:

1. **Start Simple**: Build relationship-type config system first
2. **Test One Type**: Implement romantic relationship support, test thoroughly
3. **Add Incrementally**: Add family, then friend, then work, then other
4. **Integrate APIs**: Modify existing working APIs to use relationship-type awareness
5. **Add Context Switching**: Build multi-relationship support
6. **Comprehensive Testing**: Validate all relationship types and user scenarios

### **Key Principles**:
- **Preserve Working Features**: Don't break the warm AI personality or unified journal system
- **Build Incrementally**: One relationship type at a time
- **Test Thoroughly**: Verify each type works before adding next
- **Maintain Research Foundation**: Keep FIRO + Attachment + Communication integration
- **Respect Boundaries**: Ensure appropriate suggestions for each relationship type

### **Quality Assurance**:
- Romantic relationships should get emotionally warm, intimate AI responses
- Work relationships should get professional, boundaried AI responses
- Family relationships should get diplomatically supportive AI responses
- Friend relationships should get casual, positive AI responses
- Multi-relationship users should get proper context switching
- No inappropriate suggestions (e.g., no intimacy suggestions for work relationships)

---

## 💡 DEVELOPMENT GUIDELINES

### **When Building New Features**:
- Always consider how it affects all relationship types
- Test across romantic, family, friend, work scenarios
- Maintain consistency with research-backed psychology
- Preserve privacy and anonymization
- Keep warm AI personality while adapting to relationship context

### **When Modifying Existing Code**:
- Understand current working behavior before changing
- Test that existing features still work after modifications
- Maintain backward compatibility
- Document changes clearly

### **When Making Design Decisions**:
- Refer to research foundation (FIRO theory, attachment styles)
- Consider multi-relationship user scenarios
- Ensure scalability for future phases (dashboard enhancement, advanced features)
- Maintain vision of universal relationship intelligence platform

---

## 🏆 END GOAL: Universal Relationship Intelligence Platform

**Vision Realized**: Users can journal about their romantic partner in the morning (getting intimate, warm insights), journal about work relationships at lunch (getting professional, boundaried suggestions), and journal about family dynamics in the evening (getting diplomatically supportive, boundary-aware guidance) - all with AI that understands the unique psychology and expectations of each relationship type.

**Technical Excellence**: Research-backed psychological intelligence (FIRO + Attachment theories) integrated with relationship-type-aware AI that maintains appropriate boundaries and adapts its behavior based on relationship context.

**User Impact**: One platform for improving ALL their relationships, with AI that truly understands the difference between romantic love, family bonds, friendships, and professional relationships.

---

*This is the complete RelationshipOS v2.0 vision and implementation roadmap. Use this as your north star for all development decisions.*

## Quick Commands

```bash
# Development
npm run dev          # Start development server

# Building
npm run build        # Build for production
npm run start        # Start production server

# Code Quality
npm run lint         # Run linting (currently errors are ignored in build)

# Testing
# No test commands configured - tests would need to be added
```

## High-Level Architecture

### Core Technologies
- **Framework**: Next.js 15.2.4 with App Router
- **Language**: TypeScript (strict mode enabled)
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **AI Provider**: xAI Grok-4 API (via @ai-sdk/xai)
- **Styling**: Tailwind CSS with shadcn/ui components
- **Authentication**: Supabase Auth

