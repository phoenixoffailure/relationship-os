// app/api/account/delete/route.ts
// Fixed version that matches your existing setup

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  console.log('🗑️ Starting account deletion process...')
  
  try {
    const { userId, isAdminDelete = false } = await request.json()
    
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch (error) {
              console.log('Cookie setting error (can be ignored):', error)
            }
          },
        },
      }
    )

    // Create admin client early (needed for auth user deletion)
    const adminSupabase = process.env.SUPABASE_SERVICE_ROLE_KEY 
      ? createServerClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!,
          {
            cookies: {
              getAll() {
                return cookieStore.getAll()
              },
              setAll() {
                // No-op for admin client
              },
            },
          }
        )
      : null

    // Get current user for authorization
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Security check - user can only delete their own account unless admin
    const targetUserId = userId || user.id
    if (!isAdminDelete && targetUserId !== user.id) {
      return NextResponse.json({ error: 'Can only delete your own account' }, { status: 403 })
    }

    console.log('🗑️ Deleting account for user:', targetUserId)

    // Step 1: Get all relationships this user is involved in
    const { data: userRelationships, error: relationshipsError } = await supabase
      .from('relationship_members')
      .select(`
        relationship_id,
        role,
        relationships (
          id,
          name,
          created_by
        )
      `)
      .eq('user_id', targetUserId)

    if (relationshipsError && relationshipsError.code !== 'PGRST116') {
      console.error('Error fetching user relationships:', relationshipsError)
      // Don't fail completely for this - continue with other cleanup
    }

    console.log(`🔍 Found ${userRelationships?.length || 0} relationships for user`)

    // Step 2: Handle relationship cleanup
    if (userRelationships && userRelationships.length > 0) {
      for (const membership of userRelationships) {
        const relationshipId = membership.relationship_id
        // Fix TypeScript error: safely access nested relationship data
        const relationshipData = Array.isArray(membership.relationships) 
          ? membership.relationships[0] 
          : membership.relationships
        const isCreator = relationshipData?.created_by === targetUserId

        if (isCreator) {
          // If user created the relationship, delete entire relationship and all its data
          console.log(`🗑️ Deleting relationship as creator: ${relationshipId}`)
          
          // Delete all members first
          await supabase
            .from('relationship_members')
            .delete()
            .eq('relationship_id', relationshipId)

          // Delete relationship insights
          await supabase
            .from('relationship_insights')
            .delete()
            .eq('relationship_id', relationshipId)

          // Delete relationship invitations
          await supabase
            .from('relationship_invitations')
            .delete()
            .eq('relationship_id', relationshipId)

          // Delete the relationship itself
          const { error: deleteRelError } = await supabase
            .from('relationships')
            .delete()
            .eq('id', relationshipId)

          if (deleteRelError) {
            console.error(`Error deleting relationship ${relationshipId}:`, deleteRelError)
          } else {
            console.log(`✅ Deleted relationship: ${relationshipId}`)
          }
        } else {
          // If user is just a member, remove them from the relationship
          console.log(`🚪 Leaving relationship: ${relationshipId}`)
          await supabase
            .from('relationship_members')
            .delete()
            .eq('relationship_id', relationshipId)
            .eq('user_id', targetUserId)
        }
      }
    }

    // Step 3: Delete all user's personal data
    console.log('🗑️ Deleting personal data...')

    // Delete enhanced onboarding responses (if table exists)
    try {
      const { error: onboardingEnhancedError } = await supabase
        .from('enhanced_onboarding_responses')
        .delete()
        .eq('user_id', targetUserId)

      if (onboardingEnhancedError && onboardingEnhancedError.code !== 'PGRST116') {
        console.log('Warning - enhanced onboarding responses deletion:', onboardingEnhancedError)
      }
    } catch (error: any) {
      if (error.code === '42P01') {
        console.log('ℹ️ enhanced_onboarding_responses table does not exist (skipping)')
      } else {
        console.log('Warning - enhanced onboarding deletion error:', error)
      }
    }

    // Delete regular onboarding responses (if table exists)
    try {
      const { error: onboardingError } = await supabase
        .from('onboarding_responses')
        .delete()
        .eq('user_id', targetUserId)

      if (onboardingError && onboardingError.code !== 'PGRST116') {
        console.log('Warning - onboarding responses deletion:', onboardingError)
      }
    } catch (error: any) {
      if (error.code === '42P01') {
        console.log('ℹ️ onboarding_responses table does not exist (skipping)')
      } else {
        console.log('Warning - onboarding deletion error:', error)
      }
    }

    // Delete journal entries
    const { error: journalError } = await supabase
      .from('journal_entries')
      .delete()
      .eq('user_id', targetUserId)

    if (journalError && journalError.code !== 'PGRST116') {
      console.log('Warning - journal entries deletion:', journalError)
    }

    // Delete daily check-ins
    const { error: checkinError } = await supabase
      .from('daily_checkins')
      .delete()
      .eq('user_id', targetUserId)

    if (checkinError && checkinError.code !== 'PGRST116') {
      console.log('Warning - daily check-ins deletion:', checkinError)
    }

    // Delete insights generated for this user
    const { error: insightsError } = await supabase
      .from('relationship_insights')
      .delete()
      .eq('generated_for_user', targetUserId)

    if (insightsError && insightsError.code !== 'PGRST116') {
      console.log('Warning - insights deletion:', insightsError)
    }

    // Delete user profile data (only if it exists in your custom users table)
    const { error: userDataError } = await supabase
      .from('users')
      .delete()
      .eq('id', targetUserId)

    if (userDataError && userDataError.code !== 'PGRST116') {
      console.log('Warning - user profile deletion:', userDataError)
    } else if (!userDataError) {
      console.log('✅ User profile data deleted')
    } else {
      console.log('ℹ️ No profile data to delete (user only existed in auth)')
    }

    // Step 4: Delete the auth user (requires service role key)
    if (adminSupabase) {
      console.log('🗑️ Deleting auth user...')
      
      try {
        const { error: authDeleteError } = await adminSupabase.auth.admin.deleteUser(
          targetUserId
        )

        if (authDeleteError) {
          console.error('Auth user deletion error:', authDeleteError)
          
          // Return success for data cleanup but warn about auth user
          return NextResponse.json({ 
            success: true,
            warning: 'User data deleted but auth user deletion failed. The user account may still exist in authentication but all profile data has been removed.',
            auth_error: authDeleteError.message
          })
        }

        console.log('✅ Auth user deleted successfully')
      } catch (error: any) {
        console.error('Exception during auth user deletion:', error)
        
        return NextResponse.json({ 
          success: true,
          warning: 'User data deleted but auth user deletion failed with exception. The user account may still exist in authentication but all profile data has been removed.',
          auth_error: error.message
        })
      }
    } else {
      console.log('⚠️ Service role key not found - cannot delete auth user')
      return NextResponse.json({ 
        success: true,
        warning: 'User data deleted but auth user requires manual deletion. Add SUPABASE_SERVICE_ROLE_KEY to environment variables.',
      })
    }

    console.log('🎉 Account deletion completed successfully')

    return NextResponse.json({ 
      success: true,
      message: 'Account deleted successfully',
      deletedData: {
        relationships: userRelationships?.length || 0,
        personalData: true,
        authUser: true
      }
    })

  } catch (error: any) {
    console.error('❌ Account deletion error:', error)
    return NextResponse.json({ 
      error: 'Failed to delete account',
      details: error.message 
    }, { status: 500 })
  }
}

// GET route for admin to list users (development/testing purposes)
export async function GET() {
  try {
    // CRITICAL: Must use service role key to see all users
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ 
        error: 'Service role key required for admin functions. Add SUPABASE_SERVICE_ROLE_KEY to your .env.local file.' 
      }, { status: 401 })
    }

    const cookieStore = await cookies()
    
    // Create admin client with service role key (bypasses RLS)
    const adminSupabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!, // This is the key difference!
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll() {
            // No-op for admin client
          },
        },
      }
    )

    // FIXED: Get users from auth.users (where all 23 users actually exist)
    const { data: authResult, error: authError } = await adminSupabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('Error fetching auth users:', authError)
      throw authError
    }

    // Get custom profile data to enrich the auth users
    const { data: profileUsers, error: profileError } = await adminSupabase
      .from('users')
      .select('id, full_name, onboarding_completed, age_range, location, zip_code')

    if (profileError) {
      console.warn('Could not fetch profile users:', profileError)
    }

    // Combine auth users with profile data
    const users = authResult.users.map(authUser => {
      const profile = profileUsers?.find(p => p.id === authUser.id)
      
      return {
        id: authUser.id,
        email: authUser.email,
        full_name: profile?.full_name || 'No name set',
        created_at: authUser.created_at,
        onboarding_completed: profile?.onboarding_completed || false,
        age_range: profile?.age_range,
        location: profile?.location,
        zip_code: profile?.zip_code,
        last_sign_in_at: authUser.last_sign_in_at,
        email_confirmed_at: authUser.email_confirmed_at
      }
    })

    // Sort by creation date (newest first)
    users.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    console.log(`✅ Admin client fetched ${users.length} users from auth.users`)
    console.log(`✅ Profile data available for ${profileUsers?.length || 0} users`)
    
    return NextResponse.json({ 
      users,
      total_users: users.length,
      profile_users_count: profileUsers?.length || 0
    })

  } catch (error: any) {
    console.error('Error fetching users:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch users',
      details: error.message,
      hint: 'Make sure SUPABASE_SERVICE_ROLE_KEY is set in your environment variables'
    }, { status: 500 })
  }
}