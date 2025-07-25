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

export async function GET() {
  try {
    // Use the Supabase Admin API to list users
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    // Get user roles from the users table
    const { data: roleData, error: roleError } = await supabase
      .from('users')
      .select('email, role');
    
    if (roleError) {
      console.warn('Could not fetch roles:', roleError.message);
    }

    // Create a map of email to role
    const roleMap = new Map();
    if (roleData) {
      roleData.forEach(user => {
        roleMap.set(user.email, user.role);
      });
    }

    // Return user info with roles
    const users = authData.users.map((u: any) => ({
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      role: roleMap.get(u.email) || 'standard', // Default to 'standard' if no role found
    }));

    return NextResponse.json({ users });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { userId, email, role } = await request.json();

    if (!userId || !email || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // First, check if user exists in the users table
    const { data: existingUser, error: selectError } = await supabase
      .from('users')
      .select('id, email')
      .eq('email', email)
      .single();

    if (selectError && selectError.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error checking existing user:', selectError);
      return NextResponse.json({ error: selectError.message }, { status: 500 });
    }

    let result;
    if (existingUser) {
      // Update existing user
      result = await supabase
        .from('users')
        .update({ role })
        .eq('email', email);
    } else {
      // Insert new user
      result = await supabase
        .from('users')
        .insert({ 
          id: userId,  // Use the auth user ID
          email, 
          role 
        });
    }

    if (result.error) {
      console.error('Database error:', result.error);
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // First, get the user's email to delete from users table
    const { data: authUser, error: getUserError } = await supabase.auth.admin.getUserById(userId);
    if (getUserError) {
      return NextResponse.json({ error: getUserError.message }, { status: 500 });
    }

    // Delete user from Supabase Auth
    const { error: authError } = await supabase.auth.admin.deleteUser(userId);
    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 500 });
    }

    // Also delete from users table if we have the email
    if (authUser?.user?.email) {
      const { error: tableError } = await supabase
        .from('users')
        .delete()
        .eq('email', authUser.user.email);
      
      if (tableError) {
        console.warn('Could not delete from users table:', tableError.message);
        // Don't fail the whole operation if this fails
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 