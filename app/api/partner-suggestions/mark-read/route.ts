import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log('Mark Partner Suggestion Read BODY:', body)
    const { suggestionId } = body

    if (!suggestionId) {
      return NextResponse.json({ error: 'Missing suggestion ID' }, { status: 400 })
    }

    // Update the partner suggestion read status
    const { error } = await supabase
      .from('partner_suggestions')
      .update({ 
        read_status: 'read',
        read_at: new Date().toISOString()
      })
      .eq('id', suggestionId)

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