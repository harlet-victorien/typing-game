import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key for admin operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function GET() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const { error: connectionError } = await supabaseAdmin
      .from('scores')
      .select('count')
      .limit(1);
    
    if (connectionError) {
      console.error('Connection error:', connectionError);
      return NextResponse.json({
        success: false,
        error: 'Database connection failed',
        details: connectionError
      }, { status: 500 });
    }
    
    // Test profiles table
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (profilesError) {
      console.error('Profiles table error:', profilesError);
      return NextResponse.json({
        success: false,
        error: 'Profiles table access failed',
        details: profilesError
      }, { status: 500 });
    }
    
    // Test scores table
    const { data: scores, error: scoresError } = await supabaseAdmin
      .from('scores')
      .select('count')
      .limit(1);
    
    if (scoresError) {
      console.error('Scores table error:', scoresError);
      return NextResponse.json({
        success: false,
        error: 'Scores table access failed',
        details: scoresError
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      tablesAccessible: {
        profiles: !!profiles,
        scores: !!scores
      }
    });
  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Test API failed',
      details: error
    }, { status: 500 });
  }
} 