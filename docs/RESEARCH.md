# RESEARCH.md - Psychological Foundation

## 🧠 Overview

RelationshipOS is built on peer-reviewed psychological research. Every feature must be backed by at least 3 studies with clear citations.

## 📚 Core Theories

### FIRO Theory (Fundamental Interpersonal Relations Orientation)
**Developer**: William Schutz (1958)
**Validation**: 50+ years of research, thousands of studies

#### Three Fundamental Needs
1. **Inclusion** (Social connection need)
   - Scale: 1-9 (low to high need)
   - Impacts: How much user seeks social interaction
   - AI Application: Adjusts suggestion frequency and social emphasis

2. **Control** (Influence and structure need)
   - Scale: 1-9 (low to high need)  
   - Impacts: Preference for agency vs guidance
   - AI Application: Balance between prescriptive and exploratory suggestions

3. **Affection** (Emotional closeness need)
   - Scale: 1-9 (low to high need)
   - Impacts: Comfort with intimacy and warmth
   - AI Application: Emotional intensity of language and suggestions

#### Implementation
```typescript
// Example user profile:
{
  inclusion_need: 8,  // High need for connection
  control_need: 7,    // Moderate-high need for influence
  affection_need: 8   // High need for closeness
}
```

### Attachment Theory
**Developers**: Bowlby & Ainsworth (1960s-1980s)
**Validation**: Extensive research across cultures and ages

#### Four Attachment Styles

1. **Secure Attachment** (~60% of population)
   - Comfortable with intimacy and independence
   - AI Response: Direct, confident, balanced suggestions
   - Research: Hazan & Shaver (1987), Mikulincer & Shaver (2007)

2. **Anxious Attachment** (~20% of population)
   - Craves closeness, fears abandonment
   - AI Response: Extra reassurance, validation, consistency
   - Research: Brennan et al. (1998), Wei et al. (2007)

3. **Avoidant Attachment** (~15% of population)
   - Values independence, uncomfortable with closeness
   - AI Response: Respect boundaries, gradual intimacy building
   - Research: Fraley & Shaver (2000), Joel et al. (2011)

4. **Disorganized Attachment** (~5% of population)
   - Inconsistent patterns, internal conflict
   - AI Response: Gentle, non-judgmental, flexible approach
   - Research: Main & Solomon (1986), Paetzold et al. (2015)

### Communication Styles Theory
**Foundation**: Multiple theories integrated

#### Directness Dimension
- **Direct**: Clear, straightforward communication
- **Indirect**: Diplomatic, contextual communication
- Research: Hall (1976) - High/Low Context Cultures

#### Assertiveness Dimension  
- **Assertive**: Confident expression of needs
- **Passive**: Avoids confrontation
- **Aggressive**: Forceful, dominating
- Research: Alberti & Emmons (1974)

#### Conflict Styles (Thomas-Kilmann)
- **Competing**: Win-lose approach
- **Collaborating**: Win-win seeking
- **Compromising**: Middle ground
- **Avoiding**: Conflict avoidance
- **Accommodating**: Other-focused
- Research: Thomas & Kilmann (1974)

## 🔬 Relationship-Type Research

### Romantic Relationships
**Key Research**:
- Gottman & Silver (1999) - Seven Principles
- Chapman (1992) - Five Love Languages
- Sternberg (1986) - Triangular Theory of Love

**Application**:
- High emotional intensity appropriate
- Intimacy and future planning encouraged
- Physical affection discussions normalized

### Work Relationships
**Key Research**:
- Graen & Uhl-Bien (1995) - Leader-Member Exchange
- Ferris et al. (2009) - Workplace Relationships
- Morrison (2004) - Workplace Friendships

**Application**:
- Professional boundaries essential
- Focus on task and career development
- Personal life kept separate

### Family Relationships
**Key Research**:
- Bowen (1978) - Family Systems Theory
- McGoldrick et al. (2008) - Family Life Cycle
- Minuchin (1974) - Structural Family Therapy

**Application**:
- Respect for generational differences
- Boundary awareness critical
- System-wide perspective

### Friendships
**Key Research**:
- Dunbar (1998) - Social Brain Hypothesis
- Demir et al. (2013) - Friendship and Happiness
- Hall (2019) - Friendship Development

**Application**:
- Voluntary nature emphasized
- Mutual enjoyment focus
- Independence respected

## 📊 Premium Feature Research

### FIRO Compatibility Algorithm
**Research Backing**:
1. Schutz (1958) - Original FIRO theory
2. Mahoney & Stasson (2005) - FIRO-B in relationships
3. Siegel et al. (2019) - Interpersonal compatibility

**Algorithm Components**:
- Complementary needs (inclusion matching)
- Compatible control styles
- Affection alignment
- Confidence scoring based on data points

### Communication Analysis
**Research Backing**:
1. Gottman et al. (2015) - Communication patterns
2. Christensen & Sullaway (1984) - Communication Patterns Questionnaire
3. Overall et al. (2009) - Communication strategies

**Analysis Metrics**:
- Directness score (0-100)
- Assertiveness score (0-100)
- Emotional expression (0-100)
- Conflict style identification

### Relationship Trend Analysis
**Research Backing**:
1. Karney & Bradbury (1995) - Longitudinal relationship studies
2. Gottman & Levenson (1992) - Relationship stability
3. Rusbult et al. (1998) - Investment Model

**Trend Indicators**:
- Satisfaction trajectory
- Stability score
- Risk factors (Gottman's Four Horsemen)
- Positive patterns

## 🎯 Research-Driven Features

### Love Languages Adaptation
**Original**: Chapman (1992) - Romantic context
**Adaptation**: Relationship-specific languages

#### Work Appreciation Languages
- Recognition for achievements
- Professional development support
- Collaborative assistance
- Respectful communication
- Resource provision

#### Family Support Languages
- Quality time together
- Practical help
- Emotional validation
- Respect for autonomy
- Family traditions

#### Friendship Connection Languages
- Shared activities
- Emotional support
- Humor and fun
- Reliability
- Acceptance

## 📈 Measurement & Validation

### Psychometric Standards
All assessments meet:
- **Reliability**: Cronbach's α > 0.7
- **Validity**: Construct, criterion, content validity
- **Sample Size**: Minimum 30 data points
- **Confidence**: 80% minimum confidence level

### Research Requirements
New features must:
1. Cite 3+ peer-reviewed studies
2. Include confidence scoring
3. State limitations clearly
4. Provide research references
5. Update with new research

## 🚫 Research Limitations

### What We Don't Claim
- Clinical diagnosis capability
- Replacement for therapy
- 100% prediction accuracy
- Universal applicability
- Cultural universality

### Ethical Boundaries
- Always suggest professional help when needed
- Acknowledge research limitations
- Respect cultural differences
- Avoid harmful stereotypes
- Maintain user agency

## 📖 Key References

### Books
- Bowlby, J. (1988). A Secure Base
- Chapman, G. (1992). The Five Love Languages
- Gottman, J. & Silver, N. (1999). The Seven Principles
- Schutz, W. (1958). FIRO: A Three-Dimensional Theory

### Papers
- Hazan, C. & Shaver, P. (1987). Romantic love conceptualized as attachment
- Brennan, K. et al. (1998). Self-report measurement of adult attachment
- Thomas, K. & Kilmann, R. (1974). Conflict Mode Instrument
- Mahoney & Stasson (2005). Interpersonal compatibility using FIRO-B

### Meta-Analyses
- Mikulincer & Shaver (2007). Attachment in Adulthood
- Le et al. (2010). Predicting relationship dissolution
- Finkel et al. (2017). Online dating: A critical analysis

## 🔄 Research Updates

### Update Protocol
1. Quarterly research review
2. New study integration
3. Algorithm refinement
4. User notification of updates
5. Continuous validation

### Future Research Areas
- Cross-cultural relationship dynamics
- Neurodivergent relationship patterns
- Digital communication impacts
- Generational differences
- Polyamorous relationship dynamics

## 💡 Research Application Guidelines

### For Developers
1. Always cite sources in code comments
2. Include confidence levels in outputs
3. State limitations clearly
4. Update with new research
5. Test across diverse populations

### For Users
1. Research-backed doesn't mean perfect
2. Individual differences matter
3. Cultural context important
4. Professional therapy recommended for serious issues
5. Use as tool, not prescription