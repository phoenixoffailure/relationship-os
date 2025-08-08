import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  try {
    const body = await req.json()
    console.log('Mark All Insights Read BODY:', body)
    const { userId } = body

    if (!userId) {
      return NextResponse.json({ error: 'Missing user ID' }, { status: 400 })
    }

    // Mark all unread insights for this user as read
    const { error } = await supabase
      .from('relationship_insights')
      .update({ 
        is_read: true,
        read_status: 'read',
        read_at: new Date().toISOString()
      })
      .eq('generated_for_user', userId)
      .eq('is_read', false)

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