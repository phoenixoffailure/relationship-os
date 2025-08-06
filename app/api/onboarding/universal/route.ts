// app/api/onboarding/universal/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Save or update universal user profile
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

    // Get authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Infer attachment style from responses
    const attachmentStyle = inferAttachmentStyle(body.attachment_responses || []);

    // Prepare universal profile data
    const profileData = {
      user_id: user.id,
      inclusion_need: body.inclusion_need,
      control_need: body.control_need,
      affection_need: body.affection_need,
      attachment_style: attachmentStyle.style,
      attachment_confidence: attachmentStyle.confidence,
      communication_directness: body.communication_directness,
      communication_assertiveness: body.communication_assertiveness,
      communication_context: body.communication_context,
      support_preference: body.support_preference,
      conflict_style: body.conflict_style,
    };

    // Upsert universal profile (insert or update if exists)
    const { data, error } = await supabase
      .from('universal_user_profiles')
      .upsert(profileData, {
        onConflict: 'user_id',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving universal profile:', error);
      return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      profile: data,
      message: 'Universal profile saved successfully'
    });

  } catch (error) {
    console.error('Universal profile save error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// Get universal user profile
export async function GET(request: NextRequest) {
  try {
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

    const { data, error } = await supabase
      .from('universal_user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error fetching profile:', error);
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
    }

    return NextResponse.json({ 
      profile: data,
      exists: !!data
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}

// Helper function to infer attachment style from scenario responses
function inferAttachmentStyle(responses: Array<{id: string, value: string}>) {
  if (responses.length === 0) {
    return { style: null, confidence: 0 };
  }

  const styleCounts = {
    secure: 0,
    anxious: 0,
    avoidant: 0,
    disorganized: 0
  };

  responses.forEach(response => {
    if (response.value in styleCounts) {
      styleCounts[response.value as keyof typeof styleCounts]++;
    }
  });

  // Find the most common style
  let maxCount = 0;
  let inferredStyle = 'secure';
  
  Object.entries(styleCounts).forEach(([style, count]) => {
    if (count > maxCount) {
      maxCount = count;
      inferredStyle = style;
    }
  });

  // Calculate confidence based on consistency
  const confidence = maxCount / responses.length;

  return {
    style: inferredStyle,
    confidence: Math.round(confidence * 100) / 100
  };
}
