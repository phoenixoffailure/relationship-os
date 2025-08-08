// app/(protected)/ai-context-demo/page.tsx
// Phase 7.5: Context Switching Demonstration Page
// Shows users how AI memory and personality adapt across different relationship types

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { ContextSwitchingDemo } from '@/components/ai/ContextSwitchingDemo'
import { createBrowserClient } from '@supabase/ssr'
import { useRelationshipContext } from '@/lib/contexts/RelationshipContext'
import { RelationshipType } from '@/lib/ai/relationship-type-intelligence'
import { 
  Brain,
  Lightbulb,
  Users,
  Zap,
  ArrowLeft,
  MessageSquare,
  Heart,
  Briefcase,
  Home,
  UserCheck,
  Sparkles,
  TestTube,
  PlayCircle,
  RotateCcw
} from 'lucide-react'
import Link from 'next/link'

interface TestResult {
  relationshipType: RelationshipType
  input: string
  response: string
  memoryEntriesCreated: number
  contextUsed: {
    memoryCount: number
    personalityUsed: string
  }
  timestamp: Date
}

export default function AIContextDemoPage() {
  const [user, setUser] = useState<any>(null)
  const [testInput, setTestInput] = useState("I've been feeling stressed lately and could use some advice.")
  const [isLoading, setIsLoading] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [selectedRelationshipType, setSelectedRelationshipType] = useState<RelationshipType>('romantic')
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { relationships } = useRelationshipContext()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()
  }, [supabase])

  const testContextSwitching = async () => {
    if (!user || !testInput.trim()) return

    setIsLoading(true)

    try {
      const response = await fetch('/api/insights/generate-with-memory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: user.id,
          relationship_type: selectedRelationshipType,
          journal_context: testInput,
          additional_context: {
            test_mode: true,
            demo_page: true
          }
        })
      })

      const data = await response.json()

      if (data.success && data.ai_context) {
        const result: TestResult = {
          relationshipType: selectedRelationshipType,
          input: testInput,
          response: data.insights?.[0]?.description || 'No response generated',
          memoryEntriesCreated: data.memory_entries_created || 0,
          contextUsed: data.ai_context,
          timestamp: new Date()
        }

        setTestResults(prev => [result, ...prev.slice(0, 4)]) // Keep last 5 results
      } else {
        console.error('Failed to generate context-aware response:', data)
      }
    } catch (error) {
      console.error('Error testing context switching:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const clearResults = () => {
    setTestResults([])
  }

  const relationshipTypeOptions = [
    { type: 'romantic' as RelationshipType, icon: Heart, color: 'text-red-500', label: 'Romantic' },
    { type: 'work' as RelationshipType, icon: Briefcase, color: 'text-blue-500', label: 'Work' },
    { type: 'family' as RelationshipType, icon: Home, color: 'text-green-500', label: 'Family' },
    { type: 'friend' as RelationshipType, icon: UserCheck, color: 'text-yellow-500', label: 'Friend' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-teal/5 via-brand-coral-pink/5 to-brand-deep-coral/5">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-brand-teal to-brand-coral-pink rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-brand-dark-teal">AI Context Switching Demo</h1>
                <p className="text-brand-dark-teal/70">Experience how our AI adapts across relationship types</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-brand-teal/10 text-brand-teal border-brand-teal">
              <Sparkles className="w-3 h-3 mr-1" />
              Phase 7.5
            </Badge>
            <Badge variant="outline" className="bg-brand-coral-pink/10 text-brand-coral-pink border-brand-coral-pink">
              Memory-Enhanced
            </Badge>
          </div>
        </div>

        {/* Introduction */}
        <Alert className="mb-8 border-brand-teal/30 bg-brand-teal/5">
          <Brain className="w-4 h-4 text-brand-teal" />
          <AlertDescription className="text-brand-dark-teal">
            <strong>Phase 7.5 Advanced Context Switching:</strong> This demonstration shows how our AI maintains 
            separate memories, personalities, and behavioral patterns for each relationship type. The AI remembers 
            past interactions and adapts its responses based on the specific relationship context.
          </AlertDescription>
        </Alert>

        {/* Interactive Testing Section */}
        <Card className="mb-8 border-brand-teal/20">
          <CardHeader className="bg-gradient-to-r from-brand-teal/5 to-brand-coral-pink/5">
            <CardTitle className="flex items-center space-x-2">
              <TestTube className="w-5 h-5 text-brand-teal" />
              <span>Interactive AI Testing</span>
            </CardTitle>
            <CardDescription>
              Test how the AI responds differently to the same input across relationship types
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Test Input */}
            <div>
              <label className="text-sm font-medium mb-2 block">Test Input:</label>
              <Textarea
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder="Enter a message to test how different AI personalities respond..."
                className="min-h-[80px]"
              />
            </div>

            {/* Relationship Type Selection */}
            <div>
              <label className="text-sm font-medium mb-2 block">Select Relationship Type:</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {relationshipTypeOptions.map(({ type, icon: Icon, color, label }) => (
                  <Button
                    key={type}
                    variant={selectedRelationshipType === type ? "default" : "outline"}
                    className={`h-16 flex flex-col items-center space-y-1 ${
                      selectedRelationshipType === type 
                        ? 'bg-brand-teal text-white' 
                        : 'hover:bg-brand-teal/5'
                    }`}
                    onClick={() => setSelectedRelationshipType(type)}
                  >
                    <Icon className={`w-5 h-5 ${selectedRelationshipType === type ? 'text-white' : color}`} />
                    <span className="text-sm">{label}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Test Actions */}
            <div className="flex items-center justify-between">
              <Button 
                onClick={testContextSwitching}
                disabled={isLoading || !testInput.trim()}
                className="bg-brand-teal hover:bg-brand-dark-teal"
              >
                {isLoading ? (
                  <>
                    <Brain className="w-4 h-4 mr-2 animate-spin" />
                    Generating Response...
                  </>
                ) : (
                  <>
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Test {selectedRelationshipType.charAt(0).toUpperCase() + selectedRelationshipType.slice(1)} AI
                  </>
                )}
              </Button>

              {testResults.length > 0 && (
                <Button 
                  onClick={clearResults}
                  variant="outline"
                  size="sm"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Clear Results
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Test Results */}
        {testResults.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5 text-brand-teal" />
                <span>Test Results</span>
              </CardTitle>
              <CardDescription>
                Recent AI responses showing personality and memory adaptation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border border-brand-teal/20 bg-gradient-to-r from-brand-teal/5 to-transparent"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="capitalize">
                        {result.relationshipType}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {result.contextUsed.personalityUsed}
                      </Badge>
                      {result.memoryEntriesCreated > 0 && (
                        <Badge variant="outline" className="bg-brand-coral-pink/10 text-brand-coral-pink border-brand-coral-pink text-xs">
                          +{result.memoryEntriesCreated} memories
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {result.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Input:</p>
                      <p className="text-sm bg-background p-2 rounded border-l-4 border-l-brand-teal/50">
                        "{result.input}"
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {result.relationshipType.charAt(0).toUpperCase() + result.relationshipType.slice(1)} AI Response:
                      </p>
                      <p className="text-sm bg-brand-teal/5 p-2 rounded border-l-4 border-l-brand-teal">
                        {result.response}
                      </p>
                    </div>
                    
                    {result.contextUsed.memoryCount > 0 && (
                      <div className="text-xs text-muted-foreground bg-background p-2 rounded">
                        💡 Used {result.contextUsed.memoryCount} existing memories to inform this response
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Full Context Switching Demo Component */}
        {user && (
          <ContextSwitchingDemo 
            userId={user.id} 
            className="mb-8"
          />
        )}

        {/* Technical Information */}
        <Card className="border-brand-coral-pink/20">
          <CardHeader className="bg-gradient-to-r from-brand-coral-pink/5 to-brand-deep-coral/5">
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-brand-coral-pink" />
              <span>How It Works</span>
            </CardTitle>
            <CardDescription>
              Technical details about the Phase 7.5 context switching system
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3 text-brand-dark-teal flex items-center">
                  <Brain className="w-4 h-4 mr-2" />
                  Memory System
                </h4>
                <ul className="space-y-2 text-sm">
                  <li>• Stores relationship-specific interactions and patterns</li>
                  <li>• Maintains separate contexts for each relationship type</li>
                  <li>• Learns preferences, boundaries, and communication styles</li>
                  <li>• Automatically expires old or irrelevant memories</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3 text-brand-dark-teal flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  Context Switching
                </h4>
                <ul className="space-y-2 text-sm">
                  <li>• Different AI personalities for each relationship type</li>
                  <li>• Appropriate boundaries and communication styles</li>
                  <li>• Contextual memory retrieval based on relationship</li>
                  <li>• Seamless adaptation between relationship contexts</li>
                </ul>
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-brand-teal/5 rounded-lg border border-brand-teal/20">
              <div className="flex items-start space-x-2">
                <Lightbulb className="w-5 h-5 text-brand-teal mt-0.5" />
                <div>
                  <p className="font-medium text-brand-dark-teal">Phase 7.5 Innovation</p>
                  <p className="text-sm text-brand-dark-teal/80 mt-1">
                    This advanced system represents the culmination of the Universal Relationship OS vision - 
                    AI that truly understands and adapts to different relationship contexts while maintaining 
                    appropriate boundaries and building long-term relationship understanding.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}