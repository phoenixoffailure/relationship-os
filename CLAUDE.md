
# CLAUDE.md
# RelationshipOS v2.0 - Complete Universal Relationship Intelligence Platform

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

### 🎯 PHASE 4 - Dashboard Enhancement (NEXT PHASE)
**Status**: Ready for Implementation 🔄  
**Goal**: Multi-relationship dashboard with swipable relationship cards
**Vision**: Top section = relationship cards, bottom section = unified activity feed
**Features**: Relationship health visualization, context switching, aggregated insights

### ⏳ PHASE 5 - System Verification & Polish (FUTURE)
**Goal**: Comprehensive testing across all relationship types and user scenarios
**Features**: Quality assurance, performance optimization, edge case handling

### ⏳ PHASE 6 - Advanced Features (FUTURE)  
**Goal**: Research-backed intelligence features
**Features**: FIRO compatibility analysis, attachment pattern recognition, communication style matching

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

