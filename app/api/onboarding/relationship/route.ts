// ===========================================
// app/api/onboarding/relationship/route.ts
// ===========================================
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';


// Save or update relationship-specific profile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is a member of this relationship
    const { data: memberCheck, error: memberError } = await supabase
      .from('relationship_members')
      .select('id')
      .eq('user_id', user.id)
      .eq('relationship_id', body.relationship_id)
      .single();

    if (memberError || !memberCheck) {
      return NextResponse.json({ 
        error: 'You are not a member of this relationship' 
      }, { status: 403 });
    }

    // Update the relationship type if provided
    if (body.relationship_type) {
      const { error: updateError } = await supabase
        .from('relationships')
        .update({ relationship_type: body.relationship_type })
        .eq('id', body.relationship_id);

      if (updateError) {
        console.error('Error updating relationship type:', updateError);
      }
    }

    // Prepare relationship profile data
    const profileData = {
      user_id: user.id,
      relationship_id: body.relationship_id,
      perceived_closeness: body.perceived_closeness,
      communication_frequency: body.communication_frequency,
      preferred_interaction_style: body.preferred_interaction_style,
      relationship_expectations: body.relationship_expectations || {},
      interaction_preferences: body.interaction_preferences || {},
    };

    // Upsert relationship profile
    const { data, error } = await supabase
      .from('relationship_profiles')
      .upsert(profileData, {
        onConflict: 'user_id,relationship_id',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving relationship profile:', error);
      return NextResponse.json({ 
        error: 'Failed to save relationship profile' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      profile: data,
      message: 'Relationship profile saved successfully'
    });

  } catch (error) {
    console.error('Relationship profile save error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// Get relationship profiles for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const relationshipId = searchParams.get('relationshipId');
    
    const cookieStore = await cookies();
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let query = supabase
      .from('relationship_profiles')
      .select(`
        *,
        relationships (
          id,
          name,
          relationship_type,
          created_at
        )
      `)
      .eq('user_id', user.id);

    if (relationshipId) {
      query = query.eq('relationship_id', relationshipId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching relationship profiles:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch relationship profiles' 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      profiles: data || [],
      count: data?.length || 0
    });

  } catch (error) {
    console.error('Relationship profiles fetch error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}