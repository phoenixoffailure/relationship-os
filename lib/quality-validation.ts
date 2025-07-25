// lib/quality-validation.ts
// Quality Validation System for Partner Suggestions

export interface QualityMetrics {
  relevance_score: number;      // 1-10: How relevant is this suggestion?
  actionability_score: number; // 1-10: How actionable is this suggestion?
  privacy_score: number;        // 1-10: How well does this protect privacy?
  naturalness_score: number;    // 1-10: How natural/non-demanding does this feel?
  overall_quality: number;      // 1-10: Overall quality score
  feedback_integration: number; // 1-10: How well does this incorporate past feedback?
}

export interface ValidationResult {
  isValid: boolean;
  quality_metrics: QualityMetrics;
  improvement_suggestions: string[];
  confidence_adjustment: number; // -3 to +3 adjustment to original confidence
}

interface PartnerSuggestion {
  type: string
  text: string
  context: string
  priority: number
  confidence: number
  quality_metrics?: QualityMetrics
}

/**
 * Main quality validation function
 * Call this after generating any partner suggestion
 */
export async function validateSuggestionQuality(
  suggestion: any,
  originalJournal: string,
  userOnboarding: any,
  relationship: any,
  pastFeedback?: any[]
): Promise<ValidationResult> {
  
  console.log('🔍 Starting quality validation for suggestion:', suggestion.type);
  
  // Calculate individual quality metrics
  const relevance = calculateRelevanceScore(suggestion, originalJournal, userOnboarding);
  const actionability = calculateActionabilityScore(suggestion);
  const privacy = calculatePrivacyScore(suggestion, originalJournal);
  const naturalness = calculateNaturalnessScore(suggestion);
  const feedbackIntegration = calculateFeedbackIntegration(suggestion, pastFeedback || []);
  
  // Calculate overall quality (weighted average)
  const overall = calculateOverallQuality({
    relevance_score: relevance,
    actionability_score: actionability,
    privacy_score: privacy,
    naturalness_score: naturalness,
    feedback_integration: feedbackIntegration
  });
  
  const quality_metrics: QualityMetrics = {
    relevance_score: relevance,
    actionability_score: actionability,
    privacy_score: privacy,
    naturalness_score: naturalness,
    overall_quality: overall,
    feedback_integration: feedbackIntegration
  };
  
  // Determine if suggestion passes quality threshold
  const isValid = overall >= 7.0; // Minimum 7/10 for MVP
  
  // Generate improvement suggestions if quality is low
  const improvement_suggestions = generateImprovementSuggestions(quality_metrics, suggestion);
  
  // Adjust confidence based on quality
  const confidence_adjustment = calculateConfidenceAdjustment(overall, suggestion.confidence);
  
  console.log(`✅ Quality validation complete: ${overall.toFixed(1)}/10 (${isValid ? 'PASS' : 'FAIL'})`);
  
  return {
    isValid,
    quality_metrics,
    improvement_suggestions,
    confidence_adjustment
  };
}

/**
 * Calculate how relevant the suggestion is to the journal content
 */
function calculateRelevanceScore(suggestion: any, journalContent: string, onboarding: any): number {
  let score = 5.0; // Start with neutral
  
  const journal = journalContent.toLowerCase();
  const suggestionText = suggestion.text.toLowerCase();
  
  // Check if suggestion addresses journal themes
  const emotionalKeywords = ['tired', 'stressed', 'overwhelmed', 'sad', 'frustrated', 'anxious'];
  const connectionKeywords = ['miss', 'together', 'quality time', 'date', 'connection', 'close'];
  const supportKeywords = ['help', 'support', 'overwhelmed', 'busy', 'alone'];
  
  // Emotional support relevance
  if (emotionalKeywords.some(word => journal.includes(word))) {
    if (suggestion.type === 'support' || suggestion.type === 'affection') {
      score += 2.0;
    } else {
      score += 0.5;
    }
  }
  
  // Connection relevance
  if (connectionKeywords.some(word => journal.includes(word))) {
    if (suggestion.type === 'quality_time' || suggestion.type === 'affection') {
      score += 2.0;
    } else {
      score += 0.5;
    }
  }
  
  // Support relevance
  if (supportKeywords.some(word => journal.includes(word))) {
    if (suggestion.type === 'support') {
      score += 2.0;
    } else {
      score += 0.5;
    }
  }
  
  // Love language alignment
  const loveLanguages = onboarding?.love_language_ranking || [];
  if (loveLanguages.length > 0) {
    const primaryLoveLanguage = loveLanguages[0];
    if (
      (primaryLoveLanguage === 'acts_of_service' && suggestion.type === 'support') ||
      (primaryLoveLanguage === 'quality_time' && suggestion.type === 'quality_time') ||
      (primaryLoveLanguage === 'physical_touch' && suggestion.type === 'affection') ||
      (primaryLoveLanguage === 'words_of_affirmation' && suggestion.type === 'appreciation')
    ) {
      score += 1.5;
    }
  }
  
  return Math.min(10, Math.max(1, score));
}

/**
 * Calculate how actionable and specific the suggestion is
 */
function calculateActionabilityScore(suggestion: any): number {
  let score = 5.0; // Start with neutral
  const text = suggestion.text.toLowerCase();
  
  // Check for specific action words
  const actionWords = ['plan', 'offer', 'suggest', 'schedule', 'prepare', 'organize', 'ask', 'propose'];
  const vagueWords = ['maybe', 'perhaps', 'consider', 'might', 'could', 'try to'];
  
  // Reward specific actions
  if (actionWords.some(word => text.includes(word))) {
    score += 2.0;
  }
  
  // Penalize vague language
  if (vagueWords.filter(word => text.includes(word)).length > 1) {
    score -= 1.5;
  }
  
  // Check for specificity
  const specificWords = ['tonight', 'this weekend', 'tomorrow', 'specific', 'particular'];
  if (specificWords.some(word => text.includes(word))) {
    score += 1.0;
  }
  
  // Check length (too short or too long reduces actionability)
  if (text.length < 30) {
    score -= 1.0; // Too vague
  } else if (text.length > 200) {
    score -= 1.0; // Too complex
  }
  
  return Math.min(10, Math.max(1, score));
}

/**
 * Calculate how well the suggestion protects user privacy
 */
function calculatePrivacyScore(suggestion: any, originalJournal: string): number {
  let score = 8.0; // Start high - privacy is default
  
  const journal = originalJournal.toLowerCase();
  const suggestionText = suggestion.text.toLowerCase();
  const context = suggestion.context.toLowerCase();
  
  // Check for direct quote or paraphrasing
  const journalWords = journal.split(' ').filter(word => word.length > 3);
  const suggestionWords = suggestionText.split(' ');
  
  let directMatches = 0;
  journalWords.forEach((journalWord: string) => {
    if (suggestionWords.some((suggestionWord: string) => 
      suggestionWord.includes(journalWord) || journalWord.includes(suggestionWord)
    )) {
      directMatches++;
    }
  });
  
  // Penalize direct content revelation
  const matchRatio = directMatches / Math.max(journalWords.length, 1);
  if (matchRatio > 0.3) {
    score -= 4.0; // Major privacy violation
  } else if (matchRatio > 0.15) {
    score -= 2.0; // Minor privacy concern
  }
  
  // Check for emotional revelation
  const privateEmotions = ['angry', 'frustrated', 'sad', 'disappointed', 'hurt', 'confused'];
  if (privateEmotions.some(emotion => 
    journal.includes(emotion) && (suggestionText.includes(emotion) || context.includes(emotion))
  )) {
    score -= 1.5;
  }
  
  return Math.min(10, Math.max(1, score));
}

/**
 * Calculate how natural and non-demanding the suggestion feels
 */
function calculateNaturalnessScore(suggestion: any): number {
  let score = 6.0; // Start slightly positive
  
  const text = suggestion.text.toLowerCase();
  
  // Check for demanding language
  const demandingWords = ['should', 'must', 'need to', 'have to', 'required'];
  const gentleWords = ['might', 'could', 'consider', 'perhaps', 'maybe'];
  const naturalWords = ['how about', 'what if', 'you could', 'it might be nice'];
  
  // Penalize demanding language
  demandingWords.forEach(word => {
    if (text.includes(word)) score -= 1.5;
  });
  
  // Reward gentle suggestions
  if (gentleWords.some(word => text.includes(word))) {
    score += 1.0;
  }
  
  // Reward natural phrasing
  if (naturalWords.some(phrase => text.includes(phrase))) {
    score += 2.0;
  }
  
  // Check for partner-focused language (good)
  if (text.includes('your partner') || text.includes('they might')) {
    score += 1.0;
  }
  
  return Math.min(10, Math.max(1, score));
}

/**
 * Calculate how well the suggestion incorporates past feedback
 */
function calculateFeedbackIntegration(suggestion: any, pastFeedback: any[]): number {
  if (pastFeedback.length === 0) return 7.0; // Neutral if no feedback
  
  let score = 5.0;
  
  // Analyze feedback patterns
  const negativeFeedback = pastFeedback.filter(f => f.rating && f.rating <= 2);
  const positiveFeedback = pastFeedback.filter(f => f.rating && f.rating >= 4);
  
  // Check if suggestion type has been poorly received
  const negativeForType = negativeFeedback.filter(f => f.suggestion_type === suggestion.type);
  if (negativeForType.length > 2) {
    score -= 2.0; // This type has been consistently disliked
  }
  
  // Check if suggestion type has been well received
  const positiveForType = positiveFeedback.filter(f => f.suggestion_type === suggestion.type);
  if (positiveForType.length > 2) {
    score += 1.5; // This type has been consistently liked
  }
  
  return Math.min(10, Math.max(1, score));
}

/**
 * Calculate overall quality score (weighted average)
 */
function calculateOverallQuality(metrics: Omit<QualityMetrics, 'overall_quality'>): number {
  const weights = {
    relevance_score: 30,      // 30% - most important
    actionability_score: 25,  // 25% 
    privacy_score: 25,        // 25% - critical for trust
    naturalness_score: 15,    // 15%
    feedback_integration: 5   // 5% - nice to have
  };
  
  const weightedSum = 
    (metrics.relevance_score * weights.relevance_score) +
    (metrics.actionability_score * weights.actionability_score) +
    (metrics.privacy_score * weights.privacy_score) +
    (metrics.naturalness_score * weights.naturalness_score) +
    (metrics.feedback_integration * weights.feedback_integration);
  
  return weightedSum / 100;
}

/**
 * Generate specific improvement suggestions based on quality metrics
 */
function generateImprovementSuggestions(quality_metrics: QualityMetrics, suggestion: any): string[] {
  const improvements: string[] = [];
  
  if (quality_metrics.relevance_score < 6) {
    improvements.push("Suggestion doesn't clearly address the user's emotional needs from their journal");
  }
  
  if (quality_metrics.actionability_score < 6) {
    improvements.push("Make the suggestion more specific and actionable with concrete steps");
  }
  
  if (quality_metrics.privacy_score < 6) {
    improvements.push("Suggestion reveals too much private information from the journal");
  }
  
  if (quality_metrics.naturalness_score < 6) {
    improvements.push("Language feels too demanding - use gentler, more natural phrasing");
  }
  
  if (quality_metrics.feedback_integration < 5) {
    improvements.push("Consider past feedback patterns for this suggestion type");
  }
  
  return improvements;
}

/**
 * Adjust confidence score based on quality validation
 */
function calculateConfidenceAdjustment(qualityScore: number, originalConfidence: number): number {
  if (qualityScore >= 9) return 2;      // Excellent quality
  if (qualityScore >= 8) return 1;      // Good quality  
  if (qualityScore >= 7) return 0;      // Acceptable quality
  if (qualityScore >= 6) return -1;     // Below average
  if (qualityScore >= 5) return -2;     // Poor quality
  return -3;                            // Very poor quality
}

/**
 * Enhanced suggestion generation with quality validation
 * This wraps your existing generation function
 */
export async function generateValidatedPartnerSuggestion(
  journalEntry: any,
  onboardingData: any,
  relationship: any,
  partner: any,
  pastFeedback?: any[]
): Promise<PartnerSuggestion | null> {
  
  // Generate initial suggestion using fallback method first
  const initialSuggestion = await generatePartnerSuggestionFromJournalInternal(
    journalEntry, onboardingData, relationship, partner
  );
  
  if (!initialSuggestion) return null;
  
  // Validate the suggestion
  const validation = await validateSuggestionQuality(
    initialSuggestion,
    journalEntry.content,
    onboardingData,
    relationship,
    pastFeedback
  );
  
  // If suggestion fails validation, try to improve it
  if (!validation.isValid) {
    console.log('⚠️ Suggestion failed validation, attempting improvement...');
    
    // Try regenerating with improvement context
    const improvedSuggestion = await regenerateImprovedSuggestion(
      initialSuggestion,
      validation,
      journalEntry,
      onboardingData
    );
    
    if (improvedSuggestion) {
      // Validate the improved suggestion
      const revalidation = await validateSuggestionQuality(
        improvedSuggestion,
        journalEntry.content,
        onboardingData,
        relationship,
        pastFeedback
      );
      
      if (revalidation.isValid) {
        console.log('✅ Improved suggestion passed validation');
        return {
          ...improvedSuggestion,
          confidence: Math.max(1, Math.min(10, improvedSuggestion.confidence + revalidation.confidence_adjustment)),
          quality_metrics: revalidation.quality_metrics
        };
      }
    }
    
    // If still fails, return null (don't send poor suggestions)
    console.log('❌ Unable to generate quality suggestion, skipping');
    return null;
  }
  
  // Apply confidence adjustment for valid suggestions
  return {
    ...initialSuggestion,
    confidence: Math.max(1, Math.min(10, initialSuggestion.confidence + validation.confidence_adjustment)),
    quality_metrics: validation.quality_metrics
  };
}

/**
 * Internal suggestion generation (your existing logic)
 */
async function generatePartnerSuggestionFromJournalInternal(
  journalEntry: any,
  onboardingData: any,
  relationship: any,
  partner: any
): Promise<PartnerSuggestion | null> {

  if (!process.env.XAI_API_KEY) {
    return generateRuleBasedPartnerSuggestion(journalEntry, onboardingData);
  }

  const prompt = `You are an AI relationship coach analyzing a private journal entry to generate an actionable suggestion for their partner. The suggestion should help meet the user's needs WITHOUT revealing the private journal content.

Journal Entry (PRIVATE): "${journalEntry.content}"

User's Preferences:
- Love Languages: ${onboardingData?.love_language_ranking?.join(', ') || 'unknown'}
- Communication Style: ${onboardingData?.communication_style || 'unknown'}
- Relationship Type: ${relationship?.relationships?.relationship_type || 'unknown'}

Generate a partner suggestion that:
1. Addresses the underlying need without revealing the journal content
2. Is actionable and specific
3. Feels natural, not demanding
4. Considers the user's love languages
5. Maintains privacy while being helpful

Return JSON:
{
  "type": "affection|quality_time|support|communication|appreciation",
  "text": "Specific actionable suggestion for the partner",
  "context": "Brief anonymized context (why this would help)",
  "priority": 1-10,
  "confidence": 1-10
}`;

  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'You are a relationship coach creating partner suggestions. Always respond with valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        model: 'grok-beta',
        temperature: 0.6
      })
    });

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error('❌ Grok API error for partner suggestion:', error);
    return generateRuleBasedPartnerSuggestion(journalEntry, onboardingData);
  }
}

/**
 * Fallback rule-based suggestion generation
 */
function generateRuleBasedPartnerSuggestion(journalEntry: any, onboardingData: any): PartnerSuggestion | null {
  const content = journalEntry.content.toLowerCase();
  
  if (content.includes('tired') || content.includes('exhausted') || content.includes('overwhelmed')) {
    return {
      type: 'support',
      text: 'Consider offering to help with household tasks or suggesting they take some time to relax',
      context: 'Your partner might benefit from some extra support right now',
      priority: 8,
      confidence: 7
    };
  }
  
  if (content.includes('miss') || content.includes('time together') || content.includes('date')) {
    return {
      type: 'quality_time',
      text: 'Plan a special date night or quality time activity together',
      context: 'Connection and quality time would strengthen your relationship right now',
      priority: 9,
      confidence: 8
    };
  }
  
  return null;
}

/**
 * Attempt to regenerate an improved suggestion based on validation feedback
 */
async function regenerateImprovedSuggestion(
  originalSuggestion: any,
  validation: ValidationResult,
  journalEntry: any,
  onboardingData: any
): Promise<PartnerSuggestion | null> {
  
  if (!process.env.XAI_API_KEY) return null;
  
  const improvementContext = validation.improvement_suggestions.join('. ');
  
  const prompt = `The previous suggestion had quality issues: ${improvementContext}

Original suggestion: "${originalSuggestion.text}"
Journal context: "${journalEntry.content}"

Generate an improved suggestion that:
1. Addresses the quality issues mentioned above
2. Is more relevant, actionable, and naturally phrased
3. Better protects privacy while being helpful
4. Considers love languages: ${onboardingData?.love_language_ranking?.join(', ') || 'unknown'}

Return JSON in the same format:
{
  "type": "affection|quality_time|support|communication|appreciation",
  "text": "Improved suggestion text",
  "context": "Brief context",
  "priority": 1-10,
  "confidence": 1-10
}`;

  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.XAI_API_KEY}`,
      },
      body: JSON.stringify({
        messages: [
          { role: 'system', content: 'You are a relationship coach improving suggestion quality. Always respond with valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        model: 'grok-beta',
        temperature: 0.5
      })
    });

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error('❌ Failed to regenerate improved suggestion:', error);
    return null;
  }
}