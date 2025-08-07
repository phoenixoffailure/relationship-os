import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { itemId, itemType, userId } = await request.json()

    if (!userId || !itemId || !itemType) {
      return NextResponse.json(
        { error: 'User ID, item ID, and item type are required' },
        { status: 400 }
      )
    }

    let result = null
    let error = null

    if (itemType === 'insight') {
      // Mark insight as read
      const { data, error: insightError } = await supabase
        .from('relationship_insights')
        .update({
          read_status: 'read',
          read_at: new Date().toISOString()
        })
        .eq('id', itemId)
        .eq('generated_for_user', userId)
        .select('id')

      result = data
      error = insightError

    } else if (itemType === 'partner_suggestion') {
      // Mark partner suggestion as read
      const { data, error: suggestionError } = await supabase
        .from('partner_suggestions')
        .update({
          read_status: 'read',
          read_at: new Date().toISOString()
        })
        .eq('id', itemId)
        .eq('recipient_user_id', userId)
        .select('id')

      result = data
      error = suggestionError

    } else {
      return NextResponse.json(
        { error: 'Invalid item type. Must be "insight" or "partner_suggestion"' },
        { status: 400 }
      )
    }

    if (error) {
      console.error(`Error marking ${itemType} as read:`, error)
      return NextResponse.json(
        { error: `Failed to mark ${itemType} as read`, details: error },
        { status: 500 }
      )
    }

    if (!result || result.length === 0) {
      return NextResponse.json(
        { error: `${itemType} not found or already read` },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `${itemType} marked as read`,
      item_id: itemId,
      item_type: itemType
    })

  } catch (error) {
    console.error('Mark as read API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Bulk mark as read for cleanup
export async function PUT(request: NextRequest) {
  try {
    const { userId, itemType, olderThanDays = 30 } = await request.json()

    if (!userId || !itemType) {
      return NextResponse.json(
        { error: 'User ID and item type are required' },
        { status: 400 }
      )
    }

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)

    let result = null
    let error = null

    if (itemType === 'partner_suggestion') {
      // Bulk mark old partner suggestions as read
      const { data, error: suggestionError } = await supabase
        .from('partner_suggestions')
        .update({
          read_status: 'read',
          read_at: new Date().toISOString()
        })
        .eq('recipient_user_id', userId)
        .or('read_status.is.null,read_status.eq.unread')
        .lt('created_at', cutoffDate.toISOString())
        .select('id')

      result = data
      error = suggestionError

    } else if (itemType === 'insight') {
      // Bulk mark old insights as read
      const { data, error: insightError } = await supabase
        .from('relationship_insights')
        .update({
          read_status: 'read',
          read_at: new Date().toISOString()
        })
        .eq('generated_for_user', userId)
        .or('read_status.is.null,read_status.eq.unread')
        .lt('created_at', cutoffDate.toISOString())
        .select('id')

      result = data
      error = insightError

    } else {
      return NextResponse.json(
        { error: 'Invalid item type for bulk operation' },
        { status: 400 }
      )
    }

    if (error) {
      console.error(`Error bulk marking ${itemType} as read:`, error)
      return NextResponse.json(
        { error: `Failed to bulk mark ${itemType} as read`, details: error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Bulk marked ${result?.length || 0} ${itemType}s as read`,
      marked_count: result?.length || 0,
      cutoff_date: cutoffDate.toISOString()
    })

  } catch (error) {
    console.error('Bulk mark as read API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}