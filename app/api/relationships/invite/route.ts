{
  ;`import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  try {
    const { relationshipId, invitedUserEmail, inviterUserId } = await req.json()
    const supabase = createServerSupabaseClient()

    // 1. Verify inviter has admin rights or is creator of the relationship
    const { data: member, error: memberError } = await supabase
      .from('relationship_members')
      .select('role')
      .eq('relationship_id', relationshipId)
      .eq('user_id', inviterUserId)
      .single()

    if (memberError || (member?.role !== 'admin' && member?.role !== 'member')) { // Allow any member to invite for simplicity, or restrict to 'admin'
      return NextResponse.json({ error: 'Unauthorized to invite to this relationship' }, { status: 403 })
    }

    // 2. Find the invited user's ID by email
    const { data: invitedUser, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', invitedUserEmail)
      .single()

    if (userError || !invitedUser) {
      return NextResponse.json({ error: 'Invited user not found or email is incorrect' }, { status: 404 })
    }

    // 3. Check if user is already a member
    const { data: existingMember, error: existingMemberError } = await supabase
      .from('relationship_members')
      .select('id')
      .eq('relationship_id', relationshipId)
      .eq('user_id', invitedUser.id)
      .single()

    if (existingMemberError && existingMemberError.code !== 'PGRST116') { // PGRST116 means no rows found
      console.error('Error checking existing member:', existingMemberError)
      return NextResponse.json({ error: 'Failed to check existing member status' }, { status: 500 })
    }

    if (existingMember) {
      return NextResponse.json({ message: 'User is already a member of this relationship' }, { status: 200 })
    }

    // 4. Add the invited user to relationship_members
    const { error: insertError } = await supabase
      .from('relationship_members')
      .insert({
        relationship_id: relationshipId,
        user_id: invitedUser.id,
        role: 'member', // Default role for invited members
      })

    if (insertError) {
      console.error('Error adding relationship member:', insertError)
      return NextResponse.json({ error: 'Failed to add user to relationship' }, { status: 500 })
    }

    // In a real app, you might send an in-app notification or email to the invited user.

    return NextResponse.json({ message: 'User successfully invited and added to relationship' })
  } catch (error) {
    console.error('Error inviting user to relationship:', error)
    return NextResponse.json({ error: 'Failed to invite user' }, { status: 500 })
  }
}
`
}
