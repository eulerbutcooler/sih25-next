import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';

  if (!query || query.length < 2) {
    return NextResponse.json({ error: 'Query too short' }, { status: 400 });
  }

  try {
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('id, username, full_name, email, avatar_url, role')
      .or(`username.ilike.%${query}%,full_name.ilike.%${query}%,email.ilike.%${query}%`)
      .limit(10);

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json({ error: 'Database error', details: error }, { status: 500 });
    }

    const formattedUsers = (users || []).map(user => ({
      id: user.id.toString(),
      display_name: user.full_name || user.username,
      email: user.email,
      role: user.role
    }));

    return NextResponse.json({ 
      query,
      results: formattedUsers,
      count: formattedUsers.length
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ error: 'Server error', details: error }, { status: 500 });
  }
}
