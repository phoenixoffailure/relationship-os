// scripts/test-batch-processing.js  
// Test script for Phase 4 Daily Batch Processing System
// Run with: node scripts/test-batch-processing.js

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

async function testBatchProcessing() {
  console.log('🧪 Testing Phase 4 Batch Processing System...')
  console.log(`🔗 Using base URL: ${BASE_URL}`)
  
  try {
    // Test 1: Manual trigger of batch processing (for yesterday)
    console.log('\n📅 Test 1: Manual Batch Processing Trigger')
    console.log('⏳ Calling batch endpoint...')
    
    const batchResponse = await fetch(`${BASE_URL}/api/batch/daily-partner-suggestions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        date: getYesterday() // Test with yesterday's date
      })
    })

    const batchResult = await batchResponse.json()
    
    if (batchResponse.ok) {
      console.log('✅ Batch processing successful!')
      console.log(`📊 Results:`)
      console.log(`   - Journals processed: ${batchResult.summary?.journalsProcessed || 0}`)
      console.log(`   - Relationships analyzed: ${batchResult.summary?.relationshipsAnalyzed || 0}`)
      console.log(`   - Suggestions generated: ${batchResult.summary?.suggestionsGenerated || 0}`)
      console.log(`   - Success rate: ${batchResult.summary?.successfulBatches || 0}/${(batchResult.summary?.successfulBatches || 0) + (batchResult.summary?.failedBatches || 0)}`)
      
      if (batchResult.alreadyProcessed) {
        console.log('ℹ️ Note: This batch was already processed (expected behavior)')
      }
    } else {
      console.error('❌ Batch processing failed:', batchResult.error)
      console.error('Details:', batchResult.details)
    }

    // Test 2: Verify journal saving still works (should NOT trigger immediate partner suggestions)
    console.log('\n💭 Test 2: Journal Saving (should trigger only personal insights)')
    console.log('⏳ Testing journal save endpoint...')
    
    const journalResponse = await fetch(`${BASE_URL}/api/journal/save-and-analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: 'Test journal entry for batch processing validation',
        mood_score: 8,
        user_id: 'test-user-id' // This would normally come from auth
      })
    })

    const journalResult = await journalResponse.json()
    
    if (journalResponse.ok) {
      console.log('✅ Journal saving successful!')
      console.log(`📝 Personal insights triggered: ${journalResult.personalInsightsTriggered}`)
      console.log(`💡 Message: ${journalResult.message}`)
      
      // Check that partner suggestions were NOT triggered immediately
      if (!journalResult.partnerSuggestionsTriggered) {
        console.log('✅ Confirmed: Partner suggestions NOT triggered immediately (correct!)')
      } else {
        console.log('❌ Warning: Partner suggestions were triggered immediately (should be batched)')
      }
    } else {
      console.error('❌ Journal saving failed:', journalResult.error)
    }

    // Test 3: Check batch processing logs (if we have database access)
    console.log('\n📋 Test 3: Batch Processing Verification')
    console.log('💡 To verify batch processing worked:')
    console.log('   1. Check Supabase batch_processing_log table')
    console.log('   2. Verify partner_suggestions have batch_date set')
    console.log('   3. Check journal_entries have batch_processed_at timestamps')
    console.log('\nSQL queries to run in Supabase:')
    console.log(`   SELECT * FROM batch_processing_log WHERE batch_date = '${getYesterday()}';`)
    console.log(`   SELECT batch_date, COUNT(*) FROM partner_suggestions WHERE batch_date IS NOT NULL GROUP BY batch_date;`)
    console.log(`   SELECT DATE(batch_processed_at), COUNT(*) FROM journal_entries WHERE batch_processed_at IS NOT NULL GROUP BY DATE(batch_processed_at);`)

    console.log('\n🎉 Batch processing tests completed!')
    console.log('📝 Next steps:')
    console.log('   1. Run the database schema update (database/batch-processing-schema.sql)')
    console.log('   2. Deploy to Vercel to activate the cron job') 
    console.log('   3. Monitor logs at 11 PM daily to see batch processing in action')

  } catch (error) {
    console.error('❌ Test suite failed:', error)
    
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure your development server is running:')
      console.log('   npm run dev')
    }
  }
}

function getYesterday() {
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  return yesterday.toISOString().split('T')[0]
}

// Run tests
testBatchProcessing()