import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log('BODY:', body)
    const { insightId, rating, comment } = body

    if (!insightId || !rating) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const { error } = await supabase.from('insight_feedback').insert({
      insight_id: insightId,
      rating,
      comment,
    })

    if (error) {
      console.error('SUPABASE ERROR:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('UNEXPECTED ERROR:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}


