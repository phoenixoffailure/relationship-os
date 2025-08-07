import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const insightId = params.id
    const { userId } = await request.json()

    if (!userId || !insightId) {
      return NextResponse.json(
        { error: 'User ID and insight ID are required' },
        { status: 400 }
      )
    }

    // Use the database function to mark insight as read
    const { data: result, error } = await supabase
      .rpc('mark_insight_as_read', {
        insight_id: insightId,
        user_id: userId
      })

    if (error) {
      console.error('Error marking insight as read:', error)
      return NextResponse.json(
        { error: 'Failed to mark insight as read' },
        { status: 500 }
      )
    }

    if (!result) {
      return NextResponse.json(
        { error: 'Insight not found or already read' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Insight marked as read'
    })

  } catch (error) {
    console.error('Mark insight as read API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const insightId = params.id
    const { userId } = await request.json()

    if (!userId || !insightId) {
      return NextResponse.json(
        { error: 'User ID and insight ID are required' },
        { status: 400 }
      )
    }

    // Use the database function to dismiss insight from dashboard
    const { data: result, error } = await supabase
      .rpc('dismiss_insight_from_dashboard', {
        insight_id: insightId,
        user_id: userId
      })

    if (error) {
      console.error('Error dismissing insight:', error)
      return NextResponse.json(
        { error: 'Failed to dismiss insight' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Insight dismissed from dashboard'
    })

  } catch (error) {
    console.error('Dismiss insight API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}