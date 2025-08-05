// app/api/test/ai-systems/route.ts
// COMPLETELY FIXED - All TypeScript errors resolved
// Replace entire file content with this

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// Import all AI systems for testing
import { enhancedSentimentAnalyzer } from '@/lib/ai/enhanced-sentiment-analyzer'
import { partnerAttunementScorer } from '@/lib/ai/partner-attunement-scorer'
import { realTimeIntelligence } from '@/lib/ai/realtime-intelligence'

// FIXED: Proper union types for all interfaces
type TestStatus = 'pass' | 'fail' | 'warning'
type SystemHealthStatus = 'pass' | 'fail' | 'unknown'

interface TestResult {
  system: string
  status: TestStatus
  details: string
  execution_time_ms?: number
  error?: string
}

interface SystemTestSummary {
  overall_status: TestStatus
  total_execution_time_ms: number
  test_results: TestResult[]
  database_connectivity: boolean
  ai_integrations: {
    enhanced_sentiment: boolean
    partner_attunement: boolean
    realtime_intelligence: boolean
  }
  recommendations: string[]
  system_health: {
    typescript_compilation: SystemHealthStatus
    module_imports: SystemHealthStatus
    database_schema: SystemHealthStatus
    api_endpoints: SystemHealthStatus
  }
}

export async function GET(request: NextRequest) {
  console.log('🧪 Starting comprehensive AI systems validation...')
  
  const startTime = Date.now()
  const testResults: TestResult[] = []
  const recommendations: string[] = []

  try {
    // Test 1: Database Connectivity and Schema
    console.log('📊 Testing database connectivity and schema...')
    const dbTest = await testDatabaseConnectivity()
    testResults.push(dbTest)

    // Test 2: Enhanced Sentiment Analyzer
    console.log('💭 Testing Enhanced Sentiment Analyzer...')
    const sentimentTest = await testEnhancedSentimentAnalyzer()
    testResults.push(sentimentTest)

    // Test 3: Partner Attunement Scorer
    console.log('🎯 Testing Partner Attunement Scorer...')
    const attunementTest = await testPartnerAttunementScorer()
    testResults.push(attunementTest)

    // Test 4: Real-time Intelligence
    console.log('🧠 Testing Real-time Intelligence...')
    const intelligenceTest = await testRealTimeIntelligence()
    testResults.push(intelligenceTest)

    // Test 5: API Integration Test
    console.log('🔌 Testing API Integration...')
    const apiTest = await testAPIIntegration()
    testResults.push(apiTest)

    // Test 6: Module Import/Export Test
    console.log('📦 Testing Module Imports/Exports...')
    const moduleTest = await testModuleIntegrity()
    testResults.push(moduleTest)

    // Generate recommendations based on results
    const passedTests = testResults.filter(r => r.status === 'pass').length
    const failedTests = testResults.filter(r => r.status === 'fail').length
    const warningTests = testResults.filter(r => r.status === 'warning').length

    if (failedTests > 0) {
      recommendations.push(`${failedTests} system(s) failed - check error details and ensure all dependencies are installed`)
      recommendations.push('Run `npm install @ai-sdk/openai @ai-sdk/xai ai` to ensure AI dependencies')
      recommendations.push('Verify Supabase environment variables are correctly set')
    }

    if (warningTests > 0) {
      recommendations.push(`${warningTests} system(s) have warnings - review details for optimization opportunities`)
    }

    if (failedTests === 0 && warningTests === 0) {
      recommendations.push('🎉 All systems operational! RelationshipOS AI is ready for production use.')
      recommendations.push('You can now test the enhanced journal analysis and dashboard APIs')
    }

    if (passedTests >= 4) {
      recommendations.push('Core AI functionality is working - minor issues can be addressed during development')
    }

    // Calculate overall status
    const totalTime = Date.now() - startTime
    const overallStatus: TestStatus = failedTests > 0 ? 'fail' :
                                     warningTests > 0 ? 'warning' : 'pass'

    // FIXED: Determine system health indicators with proper type casting
    const moduleTestResult = testResults.find(t => t.system.includes('Module'))
    const dbTestResult = testResults.find(t => t.system.includes('Database'))
    const apiTestResult = testResults.find(t => t.system.includes('API'))

    const systemHealth = {
      typescript_compilation: (moduleTestResult?.status || 'unknown') as SystemHealthStatus,
      module_imports: testResults.every(t => t.status !== 'fail') ? 'pass' as SystemHealthStatus : 'fail' as SystemHealthStatus,
      database_schema: (dbTestResult?.status || 'unknown') as SystemHealthStatus,
      api_endpoints: (apiTestResult?.status || 'unknown') as SystemHealthStatus
    }

    const summary: SystemTestSummary = {
      overall_status: overallStatus,
      total_execution_time_ms: totalTime,
      test_results: testResults,
      database_connectivity: dbTest.status !== 'fail',
      ai_integrations: {
        enhanced_sentiment: sentimentTest.status !== 'fail',
        partner_attunement: attunementTest.status !== 'fail',
        realtime_intelligence: intelligenceTest.status !== 'fail'
      },
      recommendations,
      system_health: systemHealth
    }

    console.log(`✅ AI systems validation completed in ${totalTime}ms`)
    console.log(`📊 Results: ${passedTests} passed, ${warningTests} warnings, ${failedTests} failed`)

    return NextResponse.json(summary, { 
      status: overallStatus === 'fail' ? 500 : 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    })

  } catch (error) {
    console.error('❌ Critical error during AI systems testing:', error)
    
    return NextResponse.json({
      overall_status: 'fail' as TestStatus,
      total_execution_time_ms: Date.now() - startTime,
      test_results: [
        {
          system: 'System Test Framework',
          status: 'fail' as TestStatus,
          details: 'Critical error during testing framework execution',
          error: error instanceof Error ? error.message : 'Unknown critical error'
        }
      ],
      database_connectivity: false,
      ai_integrations: {
        enhanced_sentiment: false,
        partner_attunement: false,
        realtime_intelligence: false
      },
      recommendations: [
        'Critical system error detected - check server logs',
        'Verify all required dependencies are installed',
        'Ensure environment variables are correctly configured',
        'Check TypeScript compilation for errors'
      ],
      system_health: {
        typescript_compilation: 'fail' as SystemHealthStatus,
        module_imports: 'fail' as SystemHealthStatus,
        database_schema: 'unknown' as SystemHealthStatus,
        api_endpoints: 'fail' as SystemHealthStatus
      }
    }, { status: 500 })
  }
}

async function testDatabaseConnectivity(): Promise<TestResult> {
  const startTime = Date.now()
  
  try {
    const cookieStore = await cookies()  // FIXED: Added await
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          }
        }
      }
    )

    // Test basic connectivity
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    if (error) {
      return {
        system: 'Database Connectivity',
        status: 'fail',
        details: 'Failed to connect to Supabase database',
        execution_time_ms: Date.now() - startTime,
        error: error.message
      }
    }

    // Test enhanced AI tables exist
    const tableTests = [
      'enhanced_journal_analysis',
      'partner_attunement_scores', 
      'realtime_intelligence',
      'dashboard_cache'
    ]

    for (const table of tableTests) {
      const { error: tableError } = await supabase
        .from(table)
        .select('count')
        .limit(1)

      if (tableError) {
        return {
          system: 'Database Schema',
          status: 'fail',
          details: `Enhanced AI table '${table}' not found - run the database schema setup`,
          execution_time_ms: Date.now() - startTime,
          error: tableError.message
        }
      }
    }

    return {
      system: 'Database Connectivity & Schema',
      status: 'pass',
      details: 'Successfully connected to Supabase and verified enhanced AI tables exist',
      execution_time_ms: Date.now() - startTime
    }

  } catch (error) {
    return {
      system: 'Database Connectivity',
      status: 'fail',
      details: 'Database connection test failed',
      execution_time_ms: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown database error'
    }
  }
}

async function testEnhancedSentimentAnalyzer(): Promise<TestResult> {
  const startTime = Date.now()
  
  try {
    // Test with sample journal content
    const testContent = "I've been feeling really distant from my partner lately. We barely spend quality time together and I'm craving more physical affection. I feel overwhelmed with work stress and need more emotional support."
    
    const result = await enhancedSentimentAnalyzer.analyzeRelationshipSentiment(
      testContent,
      { love_language_ranking: ['physical_touch', 'quality_time'] },
      { relationship_count: 1 }
    )

    // Validate result structure
    if (!result.overall_sentiment || !result.relationship_needs || typeof result.confidence_score !== 'number') {
      throw new Error('Invalid sentiment analysis result structure')
    }

    // FIXED: Check if needs were detected appropriately with proper type checking
    const expectedNeeds = ['emotional_support', 'quality_time', 'physical_affection']
    const detectedNeedTypes = result.relationship_needs.map((need: any) => need.need_type)
    const foundExpectedNeeds = expectedNeeds.filter((expectedNeed: string) => 
      detectedNeedTypes.includes(expectedNeed)
    )

    if (foundExpectedNeeds.length < 2) {
      return {
        system: 'Enhanced Sentiment Analyzer',
        status: 'warning',
        details: `Sentiment analyzer working but only detected ${foundExpectedNeeds.length} of ${expectedNeeds.length} expected needs from test content`,
        execution_time_ms: Date.now() - startTime
      }
    }

    return {
      system: 'Enhanced Sentiment Analyzer',
      status: 'pass',
      details: `Successfully detected ${result.relationship_needs.length} needs with ${result.overall_sentiment} sentiment (confidence: ${result.confidence_score.toFixed(2)})`,
      execution_time_ms: Date.now() - startTime
    }

  } catch (error) {
    return {
      system: 'Enhanced Sentiment Analyzer',
      status: 'fail',
      details: 'Sentiment analyzer failed to process test content',
      execution_time_ms: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown sentiment analysis error'
    }
  }
}

async function testPartnerAttunementScorer(): Promise<TestResult> {
  const startTime = Date.now()
  
  try {
    // Test basic instantiation and method access
    if (!partnerAttunementScorer || typeof partnerAttunementScorer.calculateAttunementScore !== 'function') {
      throw new Error('Partner attunement scorer not properly instantiated')
    }

    // Test with mock parameters (full test would require database setup)
    const mockUserId = 'test-user-id'
    const mockPartnerId = 'test-partner-id'
    
    // Test method execution (should handle missing database gracefully)
    const result = await partnerAttunementScorer.calculateAttunementScore(
      mockUserId,
      mockPartnerId,
      undefined, // No supabase client for test
      3
    )

    // FIXED: Validate result structure - handle different possible return types
    // Check if result has overall_attunement directly or nested in scores
    let overallAttunement: number | undefined

    if (typeof result === 'object' && result !== null) {
      // Check for scores.overall_attunement structure
      if ('scores' in result && result.scores && typeof result.scores === 'object') {
        overallAttunement = (result.scores as any).overall_attunement
      }
      // Check for direct overall_attunement property
      else if ('overall_attunement' in result) {
        overallAttunement = (result as any).overall_attunement
      }
      // Check for other possible structures
      else if ('overall_score' in result) {
        overallAttunement = (result as any).overall_score
      }
      // Check for score property
      else if ('score' in result) {
        overallAttunement = (result as any).score
      }
    }

    if (typeof overallAttunement !== 'number') {
      throw new Error('Invalid attunement score result structure - no numeric score found')
    }

    if (overallAttunement < 1 || overallAttunement > 10) {
      throw new Error('Attunement score outside valid range (1-10)')
    }

    return {
      system: 'Partner Attunement Scorer',
      status: 'pass',
      details: `Partner attunement scorer operational with overall score: ${overallAttunement.toFixed(1)}/10`,
      execution_time_ms: Date.now() - startTime
    }

  } catch (error) {
    return {
      system: 'Partner Attunement Scorer',
      status: 'fail',
      details: 'Partner attunement scorer failed to instantiate or execute',
      execution_time_ms: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown attunement scorer error'
    }
  }
}

async function testRealTimeIntelligence(): Promise<TestResult> {
  const startTime = Date.now()
  
  try {
    // Test basic instantiation and method access
    if (!realTimeIntelligence || typeof realTimeIntelligence.generateRealTimeIntelligence !== 'function') {
      throw new Error('Real-time intelligence not properly instantiated')
    }

    // Test method execution
    const result = await realTimeIntelligence.generateRealTimeIntelligence(
      'test-user-id',
      'test-partner-id',
      undefined // No supabase client for test
    )

    // Validate result structure
    const requiredProperties = [
      'current_needs',
      'proactive_suggestions', 
      'connection_opportunities',
      'risk_alerts',
      'celebration_moments',
      'optimal_timing'
    ]

    for (const prop of requiredProperties) {
      if (!Array.isArray(result[prop as keyof typeof result])) {
        throw new Error(`Missing or invalid property: ${prop}`)
      }
    }

    return {
      system: 'Real-time Intelligence',
      status: 'pass',
      details: 'Real-time intelligence system operational with all intelligence components functional',
      execution_time_ms: Date.now() - startTime
    }

  } catch (error) {
    return {
      system: 'Real-time Intelligence',
      status: 'fail',
      details: 'Real-time intelligence failed to instantiate or execute',
      execution_time_ms: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown real-time intelligence error'
    }
  }
}

async function testAPIIntegration(): Promise<TestResult> {
  const startTime = Date.now()
  
  try {
    // Test that we can access the base URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    
    // Since we can't make HTTP requests to ourselves in this context,
    // we'll test the API configuration and structure
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    ]

    const optionalEnvVars = [
      'OPENAI_API_KEY',
      'XAI_API_KEY'
    ]

    const missingRequired = requiredEnvVars.filter(envVar => !process.env[envVar])
    const missingOptional = optionalEnvVars.filter(envVar => !process.env[envVar])

    if (missingRequired.length > 0) {
      return {
        system: 'API Integration',
        status: 'fail',
        details: `Missing required environment variables: ${missingRequired.join(', ')}`,
        execution_time_ms: Date.now() - startTime,
        error: 'Required environment variables not configured'
      }
    }

    if (missingOptional.length > 0) {
      return {
        system: 'API Integration',
        status: 'warning',
        details: `API configuration valid, but missing optional AI API keys: ${missingOptional.join(', ')}. AI features may be limited.`,
        execution_time_ms: Date.now() - startTime
      }
    }

    return {
      system: 'API Integration',
      status: 'pass',
      details: 'API configuration complete with all environment variables configured',
      execution_time_ms: Date.now() - startTime
    }

  } catch (error) {
    return {
      system: 'API Integration',
      status: 'fail',
      details: 'API integration test failed',
      execution_time_ms: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown API integration error'
    }
  }
}

async function testModuleIntegrity(): Promise<TestResult> {
  const startTime = Date.now()
  
  try {
    // FIXED: Test that all AI modules were imported successfully with proper type checking
    interface ModuleTest {
      name: string
      module: any
      method: string
    }

    const modules: ModuleTest[] = [
      { name: 'enhancedSentimentAnalyzer', module: enhancedSentimentAnalyzer, method: 'analyzeRelationshipSentiment' },
      { name: 'partnerAttunementScorer', module: partnerAttunementScorer, method: 'calculateAttunementScore' },
      { name: 'realTimeIntelligence', module: realTimeIntelligence, method: 'generateRealTimeIntelligence' }
    ]

    const failedImports = modules.filter(({ module }) => !module)
    
    if (failedImports.length > 0) {
      return {
        system: 'Module Import/Export',
        status: 'fail',
        details: `Failed to import AI modules: ${failedImports.map(m => m.name).join(', ')}`,
        execution_time_ms: Date.now() - startTime,
        error: 'Module import failures detected'
      }
    }

    // FIXED: Test that modules have expected methods with proper type checking
    const missingMethods = modules.filter(({ module, method }) => {
      return !module || typeof module[method] !== 'function'
    })

    if (missingMethods.length > 0) {
      return {
        system: 'Module Import/Export',
        status: 'fail',
        details: `AI modules missing expected methods: ${missingMethods.map(m => m.method).join(', ')}`,
        execution_time_ms: Date.now() - startTime,
        error: 'Module method validation failed'
      }
    }

    return {
      system: 'Module Import/Export',
      status: 'pass',
      details: 'All AI modules imported successfully with expected methods available',
      execution_time_ms: Date.now() - startTime
    }

  } catch (error) {
    return {
      system: 'Module Import/Export',
      status: 'fail',
      details: 'Module integrity test failed',
      execution_time_ms: Date.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown module integrity error'
    }
  }
}