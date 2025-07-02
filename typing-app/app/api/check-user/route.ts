import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase-client';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get('user_id');

    if (!user_id) {
      return NextResponse.json({ error: 'user_id required' }, { status: 400 });
    }

    console.log('Checking user profile for:', user_id);

    // Check if user has a profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user_id)
      .single();

    if (profileError) {
      console.error('Profile check error:', profileError);
      return NextResponse.json({
        hasProfile: false,
        profileError: profileError,
        message: 'User profile not found'
      });
    }

    console.log('User profile found:', profile);

    return NextResponse.json({
      hasProfile: !!profile,
      profile: profile
    });

  } catch (error) {
    console.error('Check user API error:', error);
    return NextResponse.json({
      error: 'Failed to check user',
      details: error
    }, { status: 500 });
  }
} 