// components/ai/ContextSwitchingDemo.tsx
// Phase 7.5: Context switching demonstration component
// Shows users how AI memory and personality adapt across different relationship types

'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { useRelationshipContext } from '@/lib/contexts/RelationshipContext'
import { RelationshipType } from '@/lib/ai/relationship-type-intelligence'
import { AI_PERSONALITIES } from '@/lib/ai/personalities'
import { relationshipMemory, MemoryEntry } from '@/lib/ai/relationship-memory'
import { RelationshipIconComponent } from '@/lib/ui/relationship-aware-icons'
import { 
  Brain, 
  Zap, 
  Clock, 
  Users, 
  MessageCircle,
  Eye,
  Lightbulb,
  Shield,
  Heart,
  Briefcase,
  Home,
  Target,
  Database,
  Sparkles
} from 'lucide-react'

interface ContextSwitchingDemoProps {
  userId: string
  className?: string
}

export function ContextSwitchingDemo({ userId, className = '' }: ContextSwitchingDemoProps) {
  const { relationships, activeRelationshipId, setActiveRelationshipId } = useRelationshipContext()
  const [selectedDemo, setSelectedDemo] = useState<'personality' | 'memory' | 'adaptation'>('personality')
  const [demoInput, setDemoInput] = useState("I've been feeling stressed lately and could use some advice.")
  const [isAnimating, setIsAnimating] = useState(false)

  const handleRelationshipSwitch = (relationshipId: string) => {
    setIsAnimating(true)
    setActiveRelationshipId(relationshipId)
    
    setTimeout(() => {
      setIsAnimating(false)
    }, 1000)
  }

  const getPersonalityPreview = (relationshipType: RelationshipType) => {
    const personality = AI_PERSONALITIES[relationshipType]
    
    // Simulate how AI would respond to the demo input
    const responses = {
      romantic: "I can hear the stress in your words, and I want you to know that it's completely normal to feel overwhelmed sometimes. In relationships, stress often affects how connected we feel with our partner. Have you been able to share these feelings with them? Sometimes just being vulnerable about our struggles can bring couples closer together. Consider planning some quiet time together - even 15 minutes of undistracted conversation can help reduce stress and strengthen your bond.",
      
      work: "Workplace stress is a common challenge that many professionals face. It's important to address this systematically while maintaining appropriate professional boundaries. I'd recommend documenting the specific stressors you're experiencing and considering a conversation with your supervisor about workload management. Also, ensure you're taking proper breaks and maintaining work-life balance. Professional stress can impact team dynamics, so addressing it proactively is wise.",
      
      family: "Family dynamics can certainly be a source of stress, and it's important to address these feelings constructively. Consider whether this stress stems from specific family interactions or broader family expectations. Remember that it's okay to set healthy boundaries with family members while still maintaining loving relationships. Sometimes a calm conversation about your needs can help reduce ongoing tension and stress within the family system.",
      
      friend: "I'm sorry you're dealing with stress right now! It's totally okay to reach out when you need support - that's what friends are for. Have you been able to talk to your close friends about what's going on? Sometimes just venting to someone who cares can make a huge difference. Maybe you could plan something fun and relaxing with a good friend - laughter and good company are great stress relievers!",
      
      other: "Stress is a natural part of life, and seeking support shows good self-awareness. Consider what specific areas are contributing to your stress and whether there are people in your life who could offer appropriate support or perspective. It's important to address stress in healthy ways while maintaining proper boundaries with different people in your life."
    }
    
    return {
      personality,
      response: responses[relationshipType]
    }
  }

  const getMemoryPreview = (relationshipId: string, relationshipType: RelationshipType) => {
    // Simulate memory entries for demo purposes
    const mockMemories: Record<RelationshipType, MemoryEntry[]> = {
      romantic: [
        {
          id: 'mem1',
          userId,
          relationshipId,
          relationshipType: 'romantic',
          entryType: 'preference',
          content: 'Prefers quality time over gifts as primary love language',
          context: {},
          importance: 'high',
          emotional_tone: 'positive',
          tags: ['love_language', 'quality_time'],
          createdAt: new Date(Date.now() - 86400000 * 3), // 3 days ago
          referenceCount: 5
        },
        {
          id: 'mem2',
          userId,
          relationshipId,
          relationshipType: 'romantic',
          entryType: 'pattern',
          content: 'Shows appreciation through physical affection and verbal affirmations',
          context: {},
          importance: 'medium',
          emotional_tone: 'positive',
          tags: ['affection', 'communication'],
          createdAt: new Date(Date.now() - 86400000 * 7), // 1 week ago
          referenceCount: 3
        }
      ],
      work: [
        {
          id: 'mem3',
          userId,
          relationshipId,
          relationshipType: 'work',
          entryType: 'boundary',
          content: 'Prefers email communication over impromptu meetings',
          context: {},
          importance: 'high',
          emotional_tone: 'neutral',
          tags: ['communication', 'boundary'],
          createdAt: new Date(Date.now() - 86400000 * 5),
          referenceCount: 7
        },
        {
          id: 'mem4',
          userId,
          relationshipId,
          relationshipType: 'work',
          entryType: 'preference',
          content: 'Values clear project deadlines and regular check-ins',
          context: {},
          importance: 'medium',
          emotional_tone: 'neutral',
          tags: ['project_management', 'structure'],
          createdAt: new Date(Date.now() - 86400000 * 10),
          referenceCount: 4
        }
      ],
      family: [
        {
          id: 'mem5',
          userId,
          relationshipId,
          relationshipType: 'family',
          entryType: 'pattern',
          content: 'Values family traditions and regular gatherings',
          context: {},
          importance: 'high',
          emotional_tone: 'positive',
          tags: ['traditions', 'family_time'],
          createdAt: new Date(Date.now() - 86400000 * 14),
          referenceCount: 6
        }
      ],
      friend: [
        {
          id: 'mem6',
          userId,
          relationshipId,
          relationshipType: 'friend',
          entryType: 'preference',
          content: 'Enjoys casual hangouts and shared activities',
          context: {},
          importance: 'medium',
          emotional_tone: 'positive',
          tags: ['activities', 'casual'],
          createdAt: new Date(Date.now() - 86400000 * 4),
          referenceCount: 8
        }
      ],
      other: []
    }
    
    return mockMemories[relationshipType] || []
  }

  const getAdaptationExample = (relationshipType: RelationshipType) => {
    const adaptations = {
      romantic: {
        tone: "Warm, intimate, emotionally supportive",
        approach: "Personal growth through relationship lens",
        boundaries: "Encourages vulnerability and deep sharing",
        example: "Focuses on how stress affects romantic connection and suggests couple-focused solutions"
      },
      work: {
        tone: "Professional, structured, solution-focused",
        approach: "Systematic problem-solving",
        boundaries: "Maintains professional distance",
        example: "Addresses stress as workplace issue with systematic solutions and boundary respect"
      },
      family: {
        tone: "Respectful, diplomatic, understanding",
        approach: "Multi-generational perspective awareness",
        boundaries: "Respects family hierarchies and dynamics",
        example: "Considers family context and generational differences in stress management"
      },
      friend: {
        tone: "Casual, supportive, encouraging",
        approach: "Peer-to-peer support and fun solutions",
        boundaries: "Maintains friendship boundaries",
        example: "Suggests friend-based support systems and enjoyable stress-relief activities"
      },
      other: {
        tone: "Balanced, adaptive, appropriate",
        approach: "Context-sensitive responses",
        boundaries: "Adapts boundaries to relationship context",
        example: "Provides general advice while maintaining appropriate relationship boundaries"
      }
    }
    
    return adaptations[relationshipType]
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card className="border-brand-teal/30 bg-gradient-to-r from-brand-teal/5 to-brand-coral-pink/5">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-brand-teal rounded-xl flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl">AI Context Switching Demo</CardTitle>
              <CardDescription>
                See how our AI adapts its personality, memory, and responses for each relationship type
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Alert className="border-brand-teal/30 bg-brand-teal/10">
            <Sparkles className="w-4 h-4 text-brand-teal" />
            <AlertDescription className="text-brand-dark-teal">
              <strong>Phase 7.5 Feature:</strong> Our AI maintains separate memories and adapts its personality 
              for each relationship type, ensuring appropriate responses and building context over time.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Relationship Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Select Relationship Context</span>
          </CardTitle>
          <CardDescription>
            Choose a relationship to see how the AI adapts its behavior
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {['romantic', 'work', 'family', 'friend'].map((type) => {
              const relationshipType = type as RelationshipType
              const isActive = relationships.find(r => r.relationship_type === relationshipType)?.id === activeRelationshipId
              
              return (
                <Button
                  key={type}
                  variant={isActive ? "default" : "outline"}
                  className={`h-20 flex flex-col items-center space-y-2 ${
                    isActive ? 'bg-brand-teal text-white' : ''
                  } ${isAnimating ? 'animate-pulse' : ''}`}
                  onClick={() => {
                    const relationship = relationships.find(r => r.relationship_type === relationshipType)
                    if (relationship) {
                      handleRelationshipSwitch(relationship.id)
                    }
                  }}
                  disabled={!relationships.find(r => r.relationship_type === relationshipType)}
                >
                  <RelationshipIconComponent
                    relationshipType={relationshipType}
                    iconType="primary"
                    size="md"
                    showEmoji={true}
                    showLucide={false}
                  />
                  <span className="text-sm capitalize">{type}</span>
                </Button>
              )
            })}
          </div>
          
          {relationships.length === 0 && (
            <Alert className="mt-4">
              <Target className="w-4 h-4" />
              <AlertDescription>
                Add some relationships to see the full context switching demo in action!
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Demo Tabs */}
      <Tabs value={selectedDemo} onValueChange={(value: any) => setSelectedDemo(value)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personality" className="flex items-center space-x-2">
            <MessageCircle className="w-4 h-4" />
            <span>Personality</span>
          </TabsTrigger>
          <TabsTrigger value="memory" className="flex items-center space-x-2">
            <Database className="w-4 h-4" />
            <span>Memory</span>
          </TabsTrigger>
          <TabsTrigger value="adaptation" className="flex items-center space-x-2">
            <Zap className="w-4 h-4" />
            <span>Adaptation</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="personality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Personality Adaptation</CardTitle>
              <CardDescription>
                See how the AI's tone, communication style, and approach change for each relationship type
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Demo Input */}
              <div>
                <label className="text-sm font-medium mb-2 block">Sample User Input:</label>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-sm">"{demoInput}"</p>
                </div>
              </div>

              {/* Personality Responses */}
              {(['romantic', 'work', 'family', 'friend'] as RelationshipType[]).map((type) => {
                const { personality, response } = getPersonalityPreview(type)
                const isActive = relationships.find(r => r.relationship_type === type)?.id === activeRelationshipId
                
                return (
                  <div
                    key={type}
                    className={`p-4 rounded-lg border transition-all ${
                      isActive 
                        ? 'border-brand-teal bg-brand-teal/5' 
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <RelationshipIconComponent
                          relationshipType={type}
                          iconType="primary"
                          size="sm"
                          showEmoji={true}
                          showLucide={false}
                        />
                        <span className="font-semibold capitalize">{type} AI</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {personality.role}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        <strong>Style:</strong> {personality.communicationStyle.tone}
                      </p>
                      <p className="text-sm">
                        <strong>Response:</strong> {response}
                      </p>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="memory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Relationship Memory System</CardTitle>
              <CardDescription>
                Each relationship maintains its own memory context and learned patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(['romantic', 'work', 'family', 'friend'] as RelationshipType[]).map((type) => {
                const relationship = relationships.find(r => r.relationship_type === type)
                const memories = relationship ? getMemoryPreview(relationship.id, type) : []
                const isActive = relationship?.id === activeRelationshipId
                
                return (
                  <div
                    key={type}
                    className={`p-4 rounded-lg border mb-4 ${
                      isActive 
                        ? 'border-brand-teal bg-brand-teal/5' 
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <RelationshipIconComponent
                          relationshipType={type}
                          iconType="primary"
                          size="sm"
                          showEmoji={true}
                          showLucide={false}
                        />
                        <span className="font-semibold capitalize">{type} Memories</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {memories.length} entries
                      </Badge>
                    </div>
                    
                    {memories.length === 0 ? (
                      <p className="text-sm text-muted-foreground italic">
                        No memories stored yet. Memories will build as you interact with the AI.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {memories.map((memory, index) => (
                          <div key={index} className="text-sm p-2 bg-background rounded border-l-4 border-l-brand-teal/50">
                            <div className="flex items-center justify-between mb-1">
                              <Badge variant="outline" className="capitalize text-xs">
                                {memory.entryType}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(memory.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p>{memory.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="adaptation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Behavioral Adaptation</CardTitle>
              <CardDescription>
                How the AI adapts its behavior, boundaries, and approach for each relationship context
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(['romantic', 'work', 'family', 'friend'] as RelationshipType[]).map((type) => {
                const adaptation = getAdaptationExample(type)
                const isActive = relationships.find(r => r.relationship_type === type)?.id === activeRelationshipId
                
                return (
                  <div
                    key={type}
                    className={`p-4 rounded-lg border mb-4 ${
                      isActive 
                        ? 'border-brand-teal bg-brand-teal/5' 
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-3">
                      <RelationshipIconComponent
                        relationshipType={type}
                        iconType="primary"
                        size="sm"
                        showEmoji={true}
                        showLucide={false}
                      />
                      <span className="font-semibold capitalize">{type} Adaptation</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-muted-foreground mb-1">Tone:</p>
                        <p>{adaptation.tone}</p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground mb-1">Approach:</p>
                        <p>{adaptation.approach}</p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground mb-1">Boundaries:</p>
                        <p>{adaptation.boundaries}</p>
                      </div>
                      <div>
                        <p className="font-medium text-muted-foreground mb-1">Example:</p>
                        <p>{adaptation.example}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}