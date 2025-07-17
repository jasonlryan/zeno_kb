import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL as string;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error('Supabase environment variables are not set');
}

const supabase = createClient(supabaseUrl, serviceRoleKey);

export async function GET() {
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const { data: roleData } = await supabase.from('users').select('email, role');
  const roleMap: Record<string, string> = {};
  roleData?.forEach((r: any) => {
    roleMap[r.email] = r.role;
  });

  const users = (data?.users || []).map((u: any) => ({
    id: u.id,
    email: u.email,
    role: roleMap[u.email] || 'standard',
  }));

  return NextResponse.json({ users });
}

export async function POST(request: NextRequest) {
  const { email, role } = await request.json();
  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: 'zeno2025',
    email_confirm: true,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await supabase.from('users').upsert({ email, role: role || 'standard' });

  return NextResponse.json({ user: { id: data.user?.id, email, role } });
}

export async function PUT(request: NextRequest) {
  const { email, role } = await request.json();
  if (!email || !role) {
    return NextResponse.json({ error: 'Email and role required' }, { status: 400 });
  }

  const { error } = await supabase.from('users').update({ role }).eq('email', email);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  const email = searchParams.get('email');
  if (!id || !email) {
    return NextResponse.json({ error: 'id and email required' }, { status: 400 });
  }

  await supabase.auth.admin.deleteUser(id);
  await supabase.from('users').delete().eq('email', email);

  return NextResponse.json({ success: true });
}
