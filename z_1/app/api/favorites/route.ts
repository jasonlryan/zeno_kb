import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use environment variables for security
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Only allow if service role key is present
if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Supabase URL or Service Role Key is missing');
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

// Get user favorites
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const { data: favorites, error } = await supabase
      .from('user_favorites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching favorites:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ favorites: favorites || [] });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Add a favorite
export async function POST(request: Request) {
  try {
    const { userId, toolId, note } = await request.json();

    if (!userId || !toolId) {
      return NextResponse.json({ error: 'User ID and Tool ID are required' }, { status: 400 });
    }

    // Check if already favorited
    const { data: existing, error: checkError } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('tool_id', toolId)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error checking existing favorite:', checkError);
      return NextResponse.json({ error: checkError.message }, { status: 500 });
    }

    if (existing) {
      return NextResponse.json({ error: 'Tool is already in favorites' }, { status: 409 });
    }

    // Add to favorites
    const { data: favorite, error: insertError } = await supabase
      .from('user_favorites')
      .insert({
        user_id: userId,
        tool_id: toolId,
        note: note || null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error adding favorite:', insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, favorite });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Update a favorite (mainly for updating notes)
export async function PUT(request: Request) {
  try {
    const { userId, toolId, note } = await request.json();

    if (!userId || !toolId) {
      return NextResponse.json({ error: 'User ID and Tool ID are required' }, { status: 400 });
    }

    const { data: favorite, error } = await supabase
      .from('user_favorites')
      .update({ 
        note: note || null,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('tool_id', toolId)
      .select()
      .single();

    if (error) {
      console.error('Error updating favorite:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, favorite });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Remove a favorite
export async function DELETE(request: Request) {
  try {
    const { userId, toolId } = await request.json();

    if (!userId || !toolId) {
      return NextResponse.json({ error: 'User ID and Tool ID are required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('user_favorites')
      .delete()
      .eq('user_id', userId)
      .eq('tool_id', toolId);

    if (error) {
      console.error('Error removing favorite:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 