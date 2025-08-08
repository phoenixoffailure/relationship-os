// lib/ai/context-aware-ai.ts
// Phase 7.5: Context-aware AI system with relationship memory integration
// Enhanced AI that remembers past interactions and adapts based on relationship context

import { RelationshipType } from '@/lib/ai/relationship-type-intelligence'
import { AIPersonality, AI_PERSONALITIES } from '@/lib/ai/personalities'
import { 
  relationshipMemory, 
  storeInteraction, 
  storePattern, 
  storePreference,
  storeBoundary,
  getContextualPrompt,
  MemoryEntry
} from '@/lib/ai/relationship-memory'

export interface ContextAwareAIRequest {
  userId: string
  relationshipId: string
  relationshipType: RelationshipType
  userInput: string
  conversationType: 'insight_generation' | 'journal_analysis' | 'suggestion_creation' | 'general_conversation'
  additionalContext?: Record<string, any>
}

export interface ContextAwareAIResponse {
  response: string
  responseType: 'insight' | 'suggestion' | 'analysis' | 'conversation'
  confidence: number
  memoryEntriesCreated: MemoryEntry[]
  contextUsed: {
    memoryCount: number
    relationshipType: RelationshipType
    personalityUsed: string
  }
}

class ContextAwareAI {
  // Generate context-aware AI response
  async generateResponse(request: ContextAwareAIRequest): Promise<ContextAwareAIResponse> {
    const { userId, relationshipId, relationshipType, userInput, conversationType, additionalContext = {} } = request
    
    // Get relationship-specific AI personality
    const personality = AI_PERSONALITIES[relationshipType]
    
    // Build contextual prompt with memory
    const basePrompt = this.buildBasePrompt(conversationType, personality, userInput)
    const contextualPrompt = getContextualPrompt(relationshipId, relationshipType, basePrompt)
    
    console.log(`🧠 Phase 7.5: Generating ${relationshipType} AI response with memory context`)
    
    // Store this interaction
    const interactionMemory = storeInteraction(
      userId,
      relationshipId,
      relationshipType,
      `User input: ${userInput}`,
      { conversationType, ...additionalContext },
      'medium'
    )
    
    // Generate AI response (simulated - in real app would call actual AI API)
    const aiResponse = await this.callContextAwareAI(contextualPrompt, personality, relationshipType)
    
    // Analyze response for patterns and preferences to store
    const memoryEntries = await this.analyzeAndStoreMemories(
      userId,
      relationshipId,
      relationshipType,
      userInput,
      aiResponse
    )
    
    // Add the interaction memory to the list
    memoryEntries.unshift(interactionMemory)
    
    // Store AI response interaction
    const responseMemory = storeInteraction(
      userId,
      relationshipId,
      relationshipType,
      `AI response: ${aiResponse.substring(0, 200)}...`,
      { conversationType, confidence: 0.8 },
      'low'
    )
    memoryEntries.push(responseMemory)
    
    return {
      response: aiResponse,
      responseType: this.mapConversationTypeToResponseType(conversationType),
      confidence: 0.8,
      memoryEntriesCreated: memoryEntries,
      contextUsed: {
        memoryCount: contextualPrompt.length - basePrompt.length > 100 ? 5 : 0, // Approximate
        relationshipType,
        personalityUsed: personality.role
      }
    }
  }
  
  // Build base prompt for different conversation types
  private buildBasePrompt(
    conversationType: ContextAwareAIRequest['conversationType'],
    personality: AIPersonality,
    userInput: string
  ): string {
    let basePrompt = `${personality.systemPrompt}\n\nCommunication Style: ${personality.communicationStyle}\nBoundary Guidelines: ${personality.boundaryGuidelines}\n\n`
    
    switch (conversationType) {
      case 'insight_generation':
        basePrompt += `Generate personalized insights based on the following user input. Provide 2-3 specific, actionable insights that would be valuable for this relationship type:\n\nUser Input: ${userInput}`
        break
        
      case 'journal_analysis':
        basePrompt += `Analyze the following journal entry and provide thoughtful, supportive analysis appropriate for this relationship context:\n\nJournal Entry: ${userInput}`
        break
        
      case 'suggestion_creation':
        basePrompt += `Create helpful suggestions for improving this relationship based on the following context:\n\nContext: ${userInput}`
        break
        
      case 'general_conversation':
        basePrompt += `Respond to the following message in a way that's appropriate for this relationship type and maintains the proper tone:\n\nMessage: ${userInput}`
        break
    }
    
    return basePrompt
  }
  
  // Call AI API with contextual prompt (simulated implementation)
  private async callContextAwareAI(
    prompt: string, 
    personality: AIPersonality, 
    relationshipType: RelationshipType
  ): Promise<string> {
    // In real implementation, this would call the actual AI API (Grok, OpenAI, etc.)
    // For now, we'll return a simulated response based on relationship type
    
    const responses = {
      romantic: [
        "I can see how much you care about deepening your connection. Based on our previous conversations, it seems like quality time continues to be important to you both. Consider planning a regular date night where you can focus on each other without distractions.",
        "Your willingness to be vulnerable and share your feelings shows real emotional maturity. I remember you mentioning that physical touch is meaningful in your relationship - perhaps incorporating more non-sexual affection throughout the day could strengthen your bond.",
        "It's beautiful how you're both growing together. From what I recall about your communication style, having honest conversations about your needs seems to work well for you. Keep nurturing that openness."
      ],
      work: [
        "Your professional approach to this situation is commendable. Based on our previous discussions about workplace dynamics, it might be helpful to document this conversation and follow up with a brief email summarizing the key points discussed.",
        "I appreciate how you're maintaining appropriate boundaries while still being collaborative. Given what you've shared about your team's communication preferences, consider scheduling a brief check-in meeting to ensure everyone is aligned.",
        "Your focus on professional growth is evident. Remember the collaboration techniques we discussed previously - they might be particularly relevant to this current challenge you're facing."
      ],
      family: [
        "Family relationships can be complex, and your patience with this situation shows real maturity. Considering what you've shared about your family dynamics, approaching this with empathy while maintaining your boundaries seems like a wise path forward.",
        "I can hear how much your family means to you. Based on our previous conversations about generational differences, it might help to acknowledge different perspectives while staying true to your own values.",
        "Your commitment to family harmony is admirable. Remember the communication strategies we've discussed - they could be especially helpful in navigating this particular family situation."
      ],
      friend: [
        "It's wonderful how much you value this friendship! From what I remember about your social connections, it sounds like honest communication has always been important to you. Maybe reaching out with a simple 'thinking of you' message could be a great way to reconnect.",
        "Your thoughtfulness toward your friends really shines through. Based on our past conversations about maintaining friendships, planning something fun together might be just what you both need right now.",
        "I love how intentional you are about your relationships. Remember what you mentioned about quality time being important in your friendships - perhaps suggesting a specific activity you could do together would help strengthen this connection."
      ],
      other: [
        "Thank you for sharing this with me. Based on our previous conversations, it seems like clear communication is something you value. Consider approaching this situation with openness while respecting everyone's boundaries.",
        "Your thoughtful approach to relationships is really evident. From what we've discussed before, taking time to understand different perspectives seems to work well for you in these situations.",
        "I appreciate how you're navigating this relationship dynamic. The communication skills we've talked about previously could be really helpful here."
      ]
    }
    
    const responseList = responses[relationshipType] || responses.other
    const selectedResponse = responseList[Math.floor(Math.random() * responseList.length)]
    
    // Add some delay to simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return selectedResponse
  }
  
  // Analyze user input and AI response to extract patterns, preferences, and boundaries
  private async analyzeAndStoreMemories(
    userId: string,
    relationshipId: string,
    relationshipType: RelationshipType,
    userInput: string,
    aiResponse: string
  ): Promise<MemoryEntry[]> {
    const memoryEntries: MemoryEntry[] = []
    
    // Simple pattern detection (in real app, this would use more sophisticated NLP)
    const patterns = this.detectPatterns(userInput, relationshipType)
    const preferences = this.detectPreferences(userInput, relationshipType)
    const boundaries = this.detectBoundaries(userInput, relationshipType)
    
    // Store detected patterns
    patterns.forEach(pattern => {
      const memory = storePattern(userId, relationshipId, relationshipType, pattern, 'high')
      memoryEntries.push(memory)
    })
    
    // Store detected preferences
    preferences.forEach(preference => {
      const memory = storePreference(userId, relationshipId, relationshipType, preference, 'medium')
      memoryEntries.push(memory)
    })
    
    // Store detected boundaries
    boundaries.forEach(boundary => {
      const memory = storeBoundary(userId, relationshipId, relationshipType, boundary, 'high')
      memoryEntries.push(memory)
    })
    
    return memoryEntries
  }
  
  // Simple pattern detection
  private detectPatterns(userInput: string, relationshipType: RelationshipType): string[] {
    const patterns: string[] = []
    const input = userInput.toLowerCase()
    
    // Common patterns across relationship types
    if (input.includes('always') || input.includes('never')) {
      patterns.push('Uses absolute language when describing relationship patterns')
    }
    
    if (input.includes('stress') || input.includes('overwhelm')) {
      patterns.push('Experiences stress in relationship contexts')
    }
    
    if (input.includes('appreciate') || input.includes('grateful')) {
      patterns.push('Expresses gratitude and appreciation frequently')
    }
    
    // Relationship-specific patterns
    switch (relationshipType) {
      case 'romantic':
        if (input.includes('quality time') || input.includes('together time')) {
          patterns.push('Values quality time as primary connection method')
        }
        if (input.includes('physical') || input.includes('touch') || input.includes('affection')) {
          patterns.push('Physical affection is important for connection')
        }
        break
        
      case 'work':
        if (input.includes('meeting') || input.includes('communication')) {
          patterns.push('Prefers structured communication in workplace settings')
        }
        if (input.includes('deadline') || input.includes('project')) {
          patterns.push('Task-oriented approach to work relationships')
        }
        break
        
      case 'family':
        if (input.includes('tradition') || input.includes('family time')) {
          patterns.push('Values family traditions and gatherings')
        }
        if (input.includes('respect') || input.includes('boundary')) {
          patterns.push('Prioritizes mutual respect and healthy boundaries in family')
        }
        break
        
      case 'friend':
        if (input.includes('fun') || input.includes('laugh')) {
          patterns.push('Values humor and enjoyment in friendships')
        }
        if (input.includes('support') || input.includes('listen')) {
          patterns.push('Seeks emotional support and understanding from friends')
        }
        break
    }
    
    return patterns
  }
  
  // Simple preference detection
  private detectPreferences(userInput: string, relationshipType: RelationshipType): string[] {
    const preferences: string[] = []
    const input = userInput.toLowerCase()
    
    // Communication preferences
    if (input.includes('direct') || input.includes('honest')) {
      preferences.push('Prefers direct, honest communication')
    }
    
    if (input.includes('gentle') || input.includes('soft')) {
      preferences.push('Responds well to gentle, considerate communication')
    }
    
    // Activity preferences
    if (input.includes('quiet') || input.includes('calm')) {
      preferences.push('Enjoys quiet, peaceful activities')
    }
    
    if (input.includes('active') || input.includes('adventure')) {
      preferences.push('Enjoys active, adventurous experiences')
    }
    
    return preferences
  }
  
  // Simple boundary detection
  private detectBoundaries(userInput: string, relationshipType: RelationshipType): string[] {
    const boundaries: string[] = []
    const input = userInput.toLowerCase()
    
    if (input.includes('boundary') || input.includes('limit')) {
      boundaries.push('Has expressed specific boundaries that should be respected')
    }
    
    if (input.includes('privacy') || input.includes('personal')) {
      boundaries.push('Values privacy and personal space')
    }
    
    if (input.includes('work-life balance') && relationshipType === 'work') {
      boundaries.push('Maintains clear work-life boundaries')
    }
    
    if (input.includes('family business') && relationshipType === 'family') {
      boundaries.push('Prefers to keep certain topics within immediate family')
    }
    
    return boundaries
  }
  
  // Map conversation type to response type
  private mapConversationTypeToResponseType(conversationType: ContextAwareAIRequest['conversationType']): ContextAwareAIResponse['responseType'] {
    switch (conversationType) {
      case 'insight_generation': return 'insight'
      case 'suggestion_creation': return 'suggestion'
      case 'journal_analysis': return 'analysis'
      case 'general_conversation': return 'conversation'
      default: return 'conversation'
    }
  }
  
  // Get memory-enhanced personality for relationship
  getEnhancedPersonality(relationshipId: string, relationshipType: RelationshipType): AIPersonality & { memoryContext: string } {
    const basePersonality = AI_PERSONALITIES[relationshipType]
    const memoryContext = getContextualPrompt(relationshipId, relationshipType, '')
    
    return {
      ...basePersonality,
      memoryContext
    }
  }
}

// Export singleton instance
export const contextAwareAI = new ContextAwareAI()

// Convenience functions
export async function generateContextAwareInsight(
  userId: string,
  relationshipId: string,
  relationshipType: RelationshipType,
  userInput: string
): Promise<ContextAwareAIResponse> {
  return contextAwareAI.generateResponse({
    userId,
    relationshipId,
    relationshipType,
    userInput,
    conversationType: 'insight_generation'
  })
}

export async function analyzeJournalWithContext(
  userId: string,
  relationshipId: string,
  relationshipType: RelationshipType,
  journalEntry: string
): Promise<ContextAwareAIResponse> {
  return contextAwareAI.generateResponse({
    userId,
    relationshipId,
    relationshipType,
    userInput: journalEntry,
    conversationType: 'journal_analysis'
  })
}

export async function generateContextAwareSuggestions(
  userId: string,
  relationshipId: string,
  relationshipType: RelationshipType,
  context: string
): Promise<ContextAwareAIResponse> {
  return contextAwareAI.generateResponse({
    userId,
    relationshipId,
    relationshipType,
    userInput: context,
    conversationType: 'suggestion_creation'
  })
}

export default contextAwareAI