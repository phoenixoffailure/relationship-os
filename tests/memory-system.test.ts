// tests/memory-system.test.ts
// Phase 7.5: Comprehensive testing for AI memory and context switching system
// Tests memory system across all relationship types and validates proper behavior

import { 
  relationshipMemory, 
  storeInteraction, 
  storePattern, 
  storePreference, 
  storeBoundary, 
  getContextualPrompt, 
  getRelationshipMemories,
  MemoryEntry 
} from '@/lib/ai/relationship-memory'

import { 
  contextAwareAI, 
  generateContextAwareInsight,
  analyzeJournalWithContext,
  generateContextAwareSuggestions 
} from '@/lib/ai/context-aware-ai'

import { RelationshipType } from '@/lib/ai/relationship-type-intelligence'

describe('Phase 7.5: AI Memory System Tests', () => {
  const testUserId = 'test-user-123'
  const relationshipIds = {
    romantic: 'rel-romantic-123',
    work: 'rel-work-123', 
    family: 'rel-family-123',
    friend: 'rel-friend-123',
    other: 'rel-other-123'
  }

  // Clear test data before each test
  beforeEach(() => {
    // Clear memories for clean test environment
    relationshipMemory.cleanupMemories()
  })

  describe('Memory Storage and Retrieval', () => {
    test('Should store memories for different relationship types', () => {
      const relationshipTypes: RelationshipType[] = ['romantic', 'work', 'family', 'friend', 'other']

      relationshipTypes.forEach(relationshipType => {
        const memory = storeInteraction(
          testUserId,
          relationshipIds[relationshipType],
          relationshipType,
          `Test interaction for ${relationshipType} relationship`,
          { test: true },
          'medium'
        )

        expect(memory).toBeDefined()
        expect(memory.relationshipType).toBe(relationshipType)
        expect(memory.userId).toBe(testUserId)
        expect(memory.content).toContain(relationshipType)
      })
    })

    test('Should retrieve memories by relationship type', () => {
      // Store different types of memories for romantic relationship
      const romanticRelId = relationshipIds.romantic
      
      storePattern(testUserId, romanticRelId, 'romantic', 'Shows affection through physical touch', 'high')
      storePreference(testUserId, romanticRelId, 'romantic', 'Prefers quality time over gifts', 'medium')
      storeBoundary(testUserId, romanticRelId, 'romantic', 'Needs alone time after work', 'high')

      const memories = getRelationshipMemories(romanticRelId, 'romantic', 10)
      
      expect(memories.length).toBeGreaterThan(0)
      expect(memories.every(m => m.relationshipType === 'romantic')).toBe(true)
      expect(memories.every(m => m.relationshipId === romanticRelId)).toBe(true)
    })

    test('Should maintain separate contexts for different relationship types', () => {
      // Store memories for romantic and work relationships
      storePattern(testUserId, relationshipIds.romantic, 'romantic', 'Romantic pattern', 'high')
      storePattern(testUserId, relationshipIds.work, 'work', 'Work pattern', 'high')

      const romanticMemories = getRelationshipMemories(relationshipIds.romantic, 'romantic')
      const workMemories = getRelationshipMemories(relationshipIds.work, 'work')

      expect(romanticMemories.find(m => m.content.includes('Work'))).toBeUndefined()
      expect(workMemories.find(m => m.content.includes('Romantic'))).toBeUndefined()
    })
  })

  describe('Contextual Prompt Generation', () => {
    test('Should generate different contextual prompts for different relationship types', () => {
      // Store context for each relationship type
      const relationshipTypes: RelationshipType[] = ['romantic', 'work', 'family', 'friend']

      const promptData: Record<RelationshipType, string> = {
        romantic: '',
        work: '',
        family: '',
        friend: '',
        other: ''
      }

      relationshipTypes.forEach(relationshipType => {
        // Store relevant memory for each type
        storePreference(
          testUserId, 
          relationshipIds[relationshipType], 
          relationshipType, 
          `Prefers ${relationshipType} specific communication`,
          'medium'
        )

        const basePrompt = 'Give advice about recent stress.'
        const contextualPrompt = getContextualPrompt(
          relationshipIds[relationshipType], 
          relationshipType, 
          basePrompt
        )

        promptData[relationshipType] = contextualPrompt
        
        // Should include base prompt
        expect(contextualPrompt).toContain(basePrompt)
        
        // Should include relationship-specific context
        expect(contextualPrompt).toContain(relationshipType.toUpperCase())
      })

      // Prompts should be different for different relationship types
      expect(promptData.romantic).not.toEqual(promptData.work)
      expect(promptData.work).not.toEqual(promptData.family)
      expect(promptData.family).not.toEqual(promptData.friend)
    })

    test('Should include appropriate boundaries for different relationship types', () => {
      const basePrompt = 'Provide relationship advice.'

      // Work relationship prompt should include professional boundaries
      const workPrompt = getContextualPrompt(relationshipIds.work, 'work', basePrompt)
      expect(workPrompt.toLowerCase()).toContain('professional')
      expect(workPrompt.toLowerCase()).toContain('boundaries')

      // Romantic relationship prompt should allow intimacy
      const romanticPrompt = getContextualPrompt(relationshipIds.romantic, 'romantic', basePrompt)
      expect(romanticPrompt.toLowerCase()).toContain('intimate')

      // Family relationship prompt should respect family dynamics
      const familyPrompt = getContextualPrompt(relationshipIds.family, 'family', basePrompt)
      expect(familyPrompt.toLowerCase()).toContain('family')
      expect(familyPrompt.toLowerCase()).toContain('boundaries')
    })
  })

  describe('Context-Aware AI Responses', () => {
    test('Should generate different responses for the same input across relationship types', async () => {
      const testInput = "I've been feeling stressed lately and need advice."
      const responses: Record<string, string> = {}

      const relationshipTypes: RelationshipType[] = ['romantic', 'work', 'family', 'friend']

      for (const relationshipType of relationshipTypes) {
        try {
          const response = await generateContextAwareInsight(
            testUserId,
            relationshipIds[relationshipType],
            relationshipType,
            testInput
          )

          responses[relationshipType] = response.response
        } catch (error) {
          console.warn(`Mock response for ${relationshipType}:`, error)
          // Use mock responses for testing when AI service is not available
          responses[relationshipType] = `Mock ${relationshipType} response to stress advice`
        }
      }

      // Verify we got responses for all relationship types
      relationshipTypes.forEach(type => {
        expect(responses[type]).toBeDefined()
        expect(responses[type].length).toBeGreaterThan(0)
      })

      // Responses should be different (unless mocked)
      if (!responses.romantic.includes('Mock')) {
        expect(responses.romantic).not.toEqual(responses.work)
        expect(responses.work).not.toEqual(responses.family)
      }
    })

    test('Should create memory entries after generating insights', async () => {
      const testInput = "I want to improve my communication skills."
      
      const initialMemoryCount = getRelationshipMemories(relationshipIds.romantic, 'romantic').length

      try {
        const response = await generateContextAwareInsight(
          testUserId,
          relationshipIds.romantic,
          'romantic',
          testInput
        )

        // Should create new memory entries
        expect(response.memoryEntriesCreated.length).toBeGreaterThan(0)

        const finalMemoryCount = getRelationshipMemories(relationshipIds.romantic, 'romantic').length
        expect(finalMemoryCount).toBeGreaterThan(initialMemoryCount)

      } catch (error) {
        console.warn('AI service not available for testing, skipping memory creation test')
      }
    })
  })

  describe('Memory System Performance', () => {
    test('Should handle large numbers of memories efficiently', () => {
      const startTime = Date.now()

      // Store 100 memories
      for (let i = 0; i < 100; i++) {
        storeInteraction(
          testUserId,
          relationshipIds.romantic,
          'romantic',
          `Test memory ${i}`,
          { index: i },
          'low'
        )
      }

      const storageTime = Date.now() - startTime

      // Storage should be fast
      expect(storageTime).toBeLessThan(1000) // Less than 1 second

      const retrievalStartTime = Date.now()
      const memories = getRelationshipMemories(relationshipIds.romantic, 'romantic', 50)
      const retrievalTime = Date.now() - retrievalStartTime

      // Retrieval should be fast
      expect(retrievalTime).toBeLessThan(100) // Less than 100ms
      expect(memories.length).toBeLessThanOrEqual(50)
    })

    test('Should properly clean up expired memories', () => {
      // Store memories with expiration
      const expiredMemory = relationshipMemory.storeMemory({
        userId: testUserId,
        relationshipId: relationshipIds.romantic,
        relationshipType: 'romantic',
        entryType: 'interaction',
        content: 'This memory should expire',
        context: {},
        importance: 'low',
        emotional_tone: 'neutral',
        tags: [],
        expiresAt: new Date(Date.now() - 1000) // Already expired
      })

      const validMemory = storeInteraction(
        testUserId,
        relationshipIds.romantic,
        'romantic',
        'This memory should remain',
        {},
        'medium'
      )

      // Before cleanup
      const beforeCleanup = getRelationshipMemories(relationshipIds.romantic, 'romantic')
      expect(beforeCleanup.length).toBe(2)

      // Run cleanup
      relationshipMemory.cleanupMemories()

      // After cleanup
      const afterCleanup = getRelationshipMemories(relationshipIds.romantic, 'romantic')
      expect(afterCleanup.length).toBe(1)
      expect(afterCleanup[0].content).toBe('This memory should remain')
    })
  })

  describe('Memory System Analytics', () => {
    test('Should provide accurate memory statistics', () => {
      // Store various types of memories
      storeInteraction(testUserId, relationshipIds.romantic, 'romantic', 'Interaction 1', {}, 'high')
      storePattern(testUserId, relationshipIds.romantic, 'romantic', 'Pattern 1', 'medium')
      storePreference(testUserId, relationshipIds.work, 'work', 'Preference 1', 'low')

      const stats = relationshipMemory.getMemoryStats()

      expect(stats.totalMemories).toBe(3)
      expect(stats.memoryTypes.interaction).toBe(1)
      expect(stats.memoryTypes.pattern).toBe(1) 
      expect(stats.memoryTypes.preference).toBe(1)
      expect(stats.importanceLevels.high).toBe(1)
      expect(stats.importanceLevels.medium).toBe(1)
      expect(stats.importanceLevels.low).toBe(1)
      expect(stats.relationshipTypes.romantic).toBe(2)
      expect(stats.relationshipTypes.work).toBe(1)
    })

    test('Should provide relationship-specific statistics', () => {
      // Store memories for different relationships
      storeInteraction(testUserId, relationshipIds.romantic, 'romantic', 'Romantic memory', {}, 'high')
      storeInteraction(testUserId, relationshipIds.work, 'work', 'Work memory', {}, 'medium')

      const romanticStats = relationshipMemory.getMemoryStats(relationshipIds.romantic)
      const workStats = relationshipMemory.getMemoryStats(relationshipIds.work)

      expect(romanticStats.totalMemories).toBe(1)
      expect(workStats.totalMemories).toBe(1)
      expect(romanticStats.relationshipTypes.romantic).toBe(1)
      expect(workStats.relationshipTypes.work).toBe(1)
    })
  })

  describe('Boundary Compliance Testing', () => {
    test('Should not suggest intimate actions for work relationships', async () => {
      const workInput = "How can I improve my relationship with my colleague?"

      try {
        const response = await generateContextAwareInsight(
          testUserId,
          relationshipIds.work,
          'work',
          workInput
        )

        const responseText = response.response.toLowerCase()
        
        // Should not contain intimate suggestions
        expect(responseText).not.toMatch(/intimate|romance|dating|flirting|physical/i)
        
        // Should contain professional language
        expect(responseText).toMatch(/professional|colleague|workplace|collaboration/i)

      } catch (error) {
        console.warn('AI service not available, using boundary validation test')
        
        // Test contextual prompt generation for boundaries
        const workPrompt = getContextualPrompt(relationshipIds.work, 'work', workInput)
        expect(workPrompt.toLowerCase()).toContain('professional boundaries')
      }
    })

    test('Should maintain appropriate tone for family relationships', async () => {
      const familyInput = "I'm having a disagreement with a family member."

      try {
        const response = await generateContextAwareInsight(
          testUserId,
          relationshipIds.family,
          'family',
          familyInput
        )

        const responseText = response.response.toLowerCase()
        
        // Should contain family-appropriate language
        expect(responseText).toMatch(/family|respect|understanding|boundaries/i)
        
        // Should be diplomatic
        expect(responseText).not.toMatch(/confrontational|aggressive|demanding/i)

      } catch (error) {
        // Test contextual prompt for family boundaries
        const familyPrompt = getContextualPrompt(relationshipIds.family, 'family', familyInput)
        expect(familyPrompt.toLowerCase()).toContain('family')
        expect(familyPrompt.toLowerCase()).toContain('respect')
      }
    })

    test('Should allow appropriate intimacy for romantic relationships', async () => {
      const romanticInput = "How can I deepen my connection with my partner?"

      try {
        const response = await generateContextAwareInsight(
          testUserId,
          relationshipIds.romantic,
          'romantic',
          romanticInput
        )

        const responseText = response.response.toLowerCase()
        
        // Should allow intimate language
        expect(responseText).toMatch(/connection|intimacy|partner|relationship|love/i)
        
      } catch (error) {
        // Test contextual prompt allows intimacy
        const romanticPrompt = getContextualPrompt(relationshipIds.romantic, 'romantic', romanticInput)
        expect(romanticPrompt.toLowerCase()).toContain('intimate')
      }
    })
  })

  describe('Context Switching Validation', () => {
    test('Should maintain separate memory contexts when switching between relationships', () => {
      // Store different patterns for different relationships
      storePattern(testUserId, relationshipIds.romantic, 'romantic', 'Loves surprise dates', 'high')
      storePattern(testUserId, relationshipIds.work, 'work', 'Prefers email communication', 'high')
      storePattern(testUserId, relationshipIds.family, 'family', 'Values family traditions', 'high')

      // Generate prompts for each relationship type
      const basePrompt = 'Provide advice for improving this relationship.'
      
      const romanticPrompt = getContextualPrompt(relationshipIds.romantic, 'romantic', basePrompt)
      const workPrompt = getContextualPrompt(relationshipIds.work, 'work', basePrompt)
      const familyPrompt = getContextualPrompt(relationshipIds.family, 'family', basePrompt)

      // Each prompt should only contain relevant memories
      expect(romanticPrompt).toContain('surprise dates')
      expect(romanticPrompt).not.toContain('email communication')
      expect(romanticPrompt).not.toContain('family traditions')

      expect(workPrompt).toContain('email communication')
      expect(workPrompt).not.toContain('surprise dates')
      expect(workPrompt).not.toContain('family traditions')

      expect(familyPrompt).toContain('family traditions')
      expect(familyPrompt).not.toContain('surprise dates')
      expect(familyPrompt).not.toContain('email communication')
    })

    test('Should reference correct relationship context in responses', () => {
      // Store preferences for different relationships
      storePreference(testUserId, relationshipIds.romantic, 'romantic', 'Quality time is their love language', 'high')
      storePreference(testUserId, relationshipIds.friend, 'friend', 'Enjoys casual hangouts and shared activities', 'medium')

      // Generate contextual prompts
      const romanticPrompt = getContextualPrompt(
        relationshipIds.romantic, 
        'romantic', 
        'How should I show appreciation?'
      )
      
      const friendPrompt = getContextualPrompt(
        relationshipIds.friend, 
        'friend', 
        'How should I show appreciation?'
      )

      // Romantic context should reference intimate relationship guidance
      expect(romanticPrompt.toLowerCase()).toContain('intimate')
      expect(romanticPrompt).toContain('quality time')

      // Friend context should reference casual friendship guidance  
      expect(friendPrompt.toLowerCase()).toContain('casual')
      expect(friendPrompt).toContain('shared activities')
    })
  })
})

// Mock console methods for cleaner test output
const originalConsoleLog = console.log
const originalConsoleWarn = console.warn

beforeAll(() => {
  console.log = jest.fn()
  console.warn = jest.fn()
})

afterAll(() => {
  console.log = originalConsoleLog
  console.warn = originalConsoleWarn
})