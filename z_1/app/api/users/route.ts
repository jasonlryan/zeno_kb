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
  // Use the Supabase Admin API to list users
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  // Return only basic user info for privacy
  const users = data.users.map((u: any) => ({
    id: u.id,
    email: u.email,
    created_at: u.created_at,
  }));
  return NextResponse.json({ users });
} 