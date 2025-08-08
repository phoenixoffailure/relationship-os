# AI-SYSTEM.md - AI Personality & Intelligence System

## 🤖 Overview

RelationshipOS features a sophisticated AI system with 5 distinct personalities that adapt based on relationship type. The system uses xAI's Grok-4 model with custom prompting and filtering.

## 🎭 AI Personalities

### Romantic Relationship AI
**Role**: "Intimate Relationship Counselor"
**Tone**: Warm, intimate, emotionally engaged, professionally caring
**Focus**: Emotional connection, intimacy, future planning, deep support
**Example**: "I love how you're being so intentional about deepening your connection. The way you described that moment of reconnection shows real emotional awareness."

### Work Relationship AI
**Role**: "Professional Workplace Coach"  
**Tone**: Professional, respectful, goal-oriented, boundaried
**Focus**: Collaboration, professional development, workplace dynamics
**Boundaries**: No personal advice, no intimacy discussion, maintains professional distance
**Example**: "Consider scheduling a brief check-in with your colleague to align on project priorities. Clear communication often prevents workplace friction."

### Family Relationship AI
**Role**: "Family Dynamics Specialist"
**Tone**: Diplomatically supportive, wise, respectful of complexity
**Focus**: Generational awareness, boundary respect, family communication
**Example**: "Family relationships can be complex. Your balanced perspective shows real maturity in navigating these dynamics."

### Friend Relationship AI
**Role**: "Friendship and Social Connection Expert"
**Tone**: Warm, encouraging, enthusiastic, supportive
**Focus**: Mutual enjoyment, authentic connection, voluntary nature
**Example**: "It's awesome that you're putting this much thought into your friendships! That kind of intentionality creates lasting bonds."

### Other Relationship AI
**Role**: "General Relationship Advisor"
**Tone**: Balanced, adaptive, contextual
**Focus**: Adapts based on specific relationship context

## 🧠 Memory System (Tables Exist, Integration Pending)

### Available Infrastructure
```typescript
// Tables ready for use:
ai_memory_entries          // Store important memories
ai_conversation_history    // Track all conversations
relationship_context_cache // Cache frequently used context
memory_system_analytics    // Track performance

// Code ready but not integrated:
lib/ai/relationship-memory.ts // Memory management system
api/insights/generate-with-memory // Memory-enhanced endpoint
```

### Memory Types
- **Interaction Memories**: Specific interactions and responses
- **Pattern Memories**: Recurring themes and behaviors
- **Milestone Memories**: Important relationship events
- **Preference Memories**: User and partner preferences
- **Boundary Memories**: Established boundaries and limits

### Memory Lifecycle (When Integrated)
1. **Storage**: After each significant interaction
2. **Retrieval**: Before generating new insights
3. **Ranking**: By importance and recency
4. **Expiry**: Old memories fade over time
5. **Analytics**: Track memory usage and effectiveness

## 🛡️ Content Filtering System

### Relationship-Specific Boundaries

#### Romantic Relationships
**Allowed**: Intimacy, future planning, deep emotions, physical affection
**Filtered**: Nothing (full range appropriate)

#### Work Relationships  
**Allowed**: Professional topics, collaboration, career development
**Filtered**: Personal life, emotions, intimacy, physical contact, family matters

#### Family Relationships
**Allowed**: Family dynamics, traditions, support, boundaries
**Filtered**: Inappropriate intimacy, romantic advice

#### Friend Relationships
**Allowed**: Social activities, mutual support, casual topics
**Filtered**: Romantic intimacy, excessive dependency

### Filter Implementation
```typescript
// lib/ai/content-filters.ts
- Prohibited patterns per relationship type
- Boundary violation detection
- Automatic suggestion filtering
- Safety fallbacks
```

## 🔧 Prompt Building System

### Dynamic Prompt Generation
```typescript
// lib/ai/prompt-builder.ts
buildPrompt({
  relationshipType,    // Determines base personality
  userProfile,         // FIRO needs, attachment style
  relationshipProfile, // Specific relationship context
  memoryContext,      // Past interactions (when integrated)
  currentInput        // Journal entry or question
})
```

### Prompt Components
1. **System Prompt**: Core AI personality and role
2. **User Context**: Psychological profile (FIRO/Attachment)
3. **Relationship Context**: Type, duration, current state
4. **Memory Context**: Recent patterns and interactions
5. **Task Instruction**: Specific generation request
6. **Boundaries**: What to avoid for this relationship type

## 📊 AI Response Flow

```
1. Input Processing
   ↓
2. Profile Loading (FIRO, Attachment, Communication)
   ↓
3. Personality Selection (based on relationship type)
   ↓
4. Memory Retrieval (not yet active)
   ↓
5. Prompt Construction
   ↓
6. Grok-4 API Call
   ↓
7. Response Filtering (boundary enforcement)
   ↓
8. Memory Storage (not yet active)
   ↓
9. Response Delivery
```

## 🎯 Integration Points

### Current Integration
- `/api/insights/generate` - Partially uses personality system
- `/api/relationships/generate` - Partially uses personality system
- `/api/journal/unified-save-and-analyze` - Basic AI analysis

### Pending Integration
- Memory system connection
- Full personality system usage (currently has fallbacks)
- Context switching for multi-relationship users
- Cross-relationship pattern recognition

## 📈 AI Quality Metrics

### Measurement Points
- Response appropriateness per relationship type
- Boundary violation rate (should be 0%)
- User feedback (thumbs up/down)
- Memory utilization (when active)
- Generation time and costs

### Quality Assurance
```typescript
// Each response validated for:
1. Relationship-appropriate tone
2. Boundary compliance
3. Psychological accuracy
4. Research backing
5. User value
```

## 🔬 Psychological Integration

### FIRO Theory Application
- **High Inclusion**: AI emphasizes connection
- **High Control**: AI offers structured suggestions
- **High Affection**: AI uses warmer language

### Attachment Style Adaptation
- **Secure**: Direct, confident AI responses
- **Anxious**: Extra reassurance and validation
- **Avoidant**: Respect for independence
- **Disorganized**: Gentle, non-judgmental approach

### Communication Style Matching
- **Direct**: Straightforward AI language
- **Indirect**: Softer, diplomatic suggestions
- **Assertive**: Action-oriented recommendations
- **Passive**: Encouraging empowerment

## 🚀 Future Enhancements

### Near-term (Phase 8)
- Complete memory system integration
- Remove fallback logic
- Add conversation continuity

### Medium-term
- Cross-relationship insights
- Pattern recognition across relationships
- Predictive suggestions

### Long-term
- Voice interaction support
- Multi-modal understanding
- Real-time coaching

## 💡 Best Practices

### When Modifying AI System
1. Always test all 5 personality types
2. Verify boundary enforcement
3. Check memory storage (when active)
4. Validate psychological accuracy
5. Ensure research backing

### Common Issues
- **Tone Mismatch**: Check personality selection logic
- **Boundary Violations**: Review content filters
- **Generic Responses**: Ensure profile data loaded
- **Memory Gaps**: Verify memory system integration (pending)

## 📝 Configuration

### Environment Variables
```env
XAI_API_KEY=           # Grok-4 API access
AI_MODEL=grok-beta     # Model selection
AI_TEMPERATURE=0.7     # Response creativity
AI_MAX_TOKENS=1000     # Response length
```

### Personality Overrides
```typescript
// Can override personality for testing
const personality = overridePersonality || 
  getPersonalityForRelationshipType(type);
```

## 🔄 Continuous Improvement

The AI system learns through:
1. User feedback (thumbs up/down)
2. Memory accumulation (when active)
3. Pattern analysis
4. A/B testing different approaches
5. Research integration updates