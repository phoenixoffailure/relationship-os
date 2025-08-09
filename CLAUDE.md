# CLAUDE.md - RelationshipOS Development Guide

> **📊 CURRENT STATUS**: Post-Phase 8 Polish - Database integration complete, addressing memory system bugs
> 
> **🚀 BUILD STATUS**: See [BUILD.md](./BUILD.md) for development tracking and phase status

## 📁 Documentation Structure

This project uses modular documentation to keep context manageable. Start here, then reference specific docs as needed:

### Core Documents (Read in Order)
1. **[CURRENT-ISSUES.md](./docs/CURRENT-ISSUES.md)** - 🔴 CRITICAL: Current bugs and immediate fix plan
2. **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - System architecture, database schema, API structure  
3. **[AI-SYSTEM.md](./docs/AI-SYSTEM.md)** - AI personalities, memory system, behavioral differentiation
4. **[RESEARCH.md](./docs/RESEARCH.md)** - Psychological foundation (FIRO, Attachment, Communication theories)

### Reference Documents
- **[VISION.md](./docs/VISION.md)** - Product vision and transformation goals
- **[PHASE-HISTORY.md](./docs/PHASE-HISTORY.md)** - Completed phases and implementation details
- **[TESTING.md](./docs/TESTING.md)** - Testing strategy and quality assurance

## 🎯 Quick Start for Development

### What's Working ✅
- **Database**: 39 tables fully operational with comprehensive schema
- **TypeScript**: Complete type coverage for all database tables 
- **AI System**: 5 sophisticated personality types with Grok API integration ✅
- **Personalized Insights**: Grok API generating context-aware insights based on actual journal content ✅
- **Relationship Checkins**: Phase 7.2 relationship-specific metrics system operational
- **Health Scoring**: Weighted relationship health calculation (89/100 achieved)
- **Dashboard**: Clean multi-relationship interface
- **Premium**: FIRO compatibility analysis operational
- **RLS Security**: 1212+ lines of comprehensive security policies
- **Batch Processing**: Daily partner suggestions via Vercel cron

### Recently Fixed (Phase 8.1) ✅
1. **Memory System** - Fixed user ID passing, memory context working
2. **Pillar Scoring** - Fixed content retrieval, scoring algorithm operational
3. **Static Assets** - Generated all favicons, screenshots, and social images
4. **Metadata Config** - Added metadataBase for proper social media previews
5. **AI Insights** - Fixed to use actual Grok API instead of fallback responses

### Development Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run linting
```

## 🏗️ Current Development Focus

**PHASE 8: Database Integration & Type Safety** ✅ **COMPLETE** (January 2025)
- ✅ Generated TypeScript types for all 39 database tables
- ✅ Verified comprehensive RLS security policies (1212+ lines)
- ✅ Created AI memory system database connectivity
- ✅ Fixed API type safety with complete database type coverage
- ✅ Fixed missing database columns (`relationship_type`, `calculation_date`, etc.)
- ✅ Completed relationship-specific checkin system (Phase 7.2)
- ✅ Verified sophisticated health scoring algorithm

**PHASE 8.1: Post-Integration Polish** ✅ **COMPLETE** (January 2025)
- ✅ Fixed memory system user ID passing bug
- ✅ Fixed pillar scoring algorithm (now using actual content)
- ✅ Added all missing static assets (favicons, fonts, screenshots)
- ✅ Configured Next.js metadata for social media
- ✅ Fixed AI insights to use actual Grok API with personalized responses

**PHASE 8.2: Smart Insight Optimization** ✅ **COMPLETE** (January 2025)
- ✅ Implemented single high-quality insight per trigger (instead of 4 separate insights)
- ✅ Added triggering logic: require new journal entry + daily checkin
- ✅ Analysis optimized to use only new content since last insight
- ✅ 75% API cost reduction achieved through smart triggering
- 🎯 **Goal ACHIEVED**: API costs reduced, quality improved, insight spam prevented

**Next Phase**: Performance optimization, comprehensive testing, and production readiness

## 💡 Key Principles

1. **Database First**: All tables exist in Supabase - check `database/rolling-supabase-schema` for truth
2. **Type Safety**: Always generate types from database schema
3. **AI Adaptation**: Use relationship type to determine AI personality
4. **Privacy**: Never expose journal content to partners
5. **Research-Backed**: All features must cite psychological research

## 🔧 Technical Stack

- **Frontend**: Next.js 15.2.4, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL + Auth + RLS)
- **AI**: xAI Grok-4 API with custom personality system
- **Deployment**: Vercel with cron jobs

## 📝 For Claude Code

When working on this project:
1. Start by reading [CURRENT-ISSUES.md](./docs/CURRENT-ISSUES.md) for immediate priorities
2. Reference [ARCHITECTURE.md](./docs/ARCHITECTURE.md) for system understanding
3. Use [AI-SYSTEM.md](./docs/AI-SYSTEM.md) when modifying AI behavior
4. Consult [RESEARCH.md](./docs/RESEARCH.md) for psychological foundations

**Remember**: The database schema in `database/rolling-supabase-schema` is the source of truth. All claimed features should be verified against actual database tables.