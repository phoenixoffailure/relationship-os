import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log('Partner Suggestion Feedback BODY:', body)
    const { suggestionId, rating, comment } = body

    if (!suggestionId || !rating) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Create partner suggestion feedback table if it doesn't exist, or use generic feedback table
    // For now, we'll use a generic approach that can handle both insights and partner suggestions
    const { error } = await supabase.from('suggestion_feedback').insert({
      suggestion_id: suggestionId,
      suggestion_type: 'partner_suggestion',
      rating,
      comment,
    })

    if (error) {
      console.error('SUPABASE ERROR:', error)
      // If the table doesn't exist, let's create a record in a more generic way
      // or fallback to the existing insight_feedback table with a type indicator
      const { error: fallbackError } = await supabase.from('insight_feedback').insert({
        insight_id: suggestionId,
        rating,
        comment,
        feedback_type: 'partner_suggestion'
      })
      
      if (fallbackError) {
        console.error('FALLBACK SUPABASE ERROR:', fallbackError)
        return NextResponse.json({ error: fallbackError.message }, { status: 500 })
      }
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('UNEXPECTED ERROR:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}