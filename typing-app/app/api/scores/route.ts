import { NextRequest, NextResponse } from 'next/server';
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, wpm, accuracy, words_typed, errors, time_duration } = body;

    console.log('POST /api/scores - Received data:', { user_id, wpm, accuracy, words_typed, errors, time_duration });

    // Validate required fields
    if (!user_id || typeof wpm !== 'number' || typeof accuracy !== 'number') {
      console.log('Validation failed:', { user_id: !!user_id, wpm: typeof wpm, accuracy: typeof accuracy });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    console.log('Validation passed, attempting database insert...');

    // Insert score into database
    const { data, error } = await supabaseAdmin
      .from('scores')
      .insert({
        user_id,
        wpm,
        accuracy,
        words_typed: words_typed || 0,
        errors: errors || 0,
        time_duration: time_duration || 60
      })
      .select('*')
      .single();

    if (error) {
      console.error('Database error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return NextResponse.json(
        { error: 'Failed to save score', dbError: error },
        { status: 500 }
      );
    }

    console.log('Score saved successfully:', data);
    return NextResponse.json({ success: true, score: data });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const user_id = searchParams.get('user_id');

    // Get all scores first
    let scoresQuery = supabaseAdmin
      .from('scores')
      .select('*')
      .order('wpm', { ascending: false })
      .limit(1000); // Get more scores to find best per user

    if (user_id) {
      scoresQuery = scoresQuery.eq('user_id', user_id);
    }

    const { data: allScores, error: scoresError } = await scoresQuery;

    console.log('Scores query result:', { allScores, scoresError });

    if (scoresError) {
      console.error('Scores query error:', scoresError);
      return NextResponse.json(
        { error: 'Failed to fetch scores', details: scoresError },
        { status: 500 }
      );
    }

    // Group by user and get the best score for each user
    const userBestScores = new Map();
    
    if (allScores && allScores.length > 0) {
      allScores.forEach(score => {
        const existingScore = userBestScores.get(score.user_id);
        if (!existingScore || score.wpm > existingScore.wpm) {
          userBestScores.set(score.user_id, score);
        }
      });
    }

    // Get unique user IDs from the best scores
    const userIds = Array.from(userBestScores.keys());

    console.log('Found best scores for users:', userIds);

    // Fetch profiles for these users
    let profilesData: Array<{ id: string; email: string; username: string | null }> = [];
    if (userIds.length > 0) {
      console.log('Fetching profiles for user IDs:', userIds);
      const { data: profiles, error: profilesError } = await supabaseAdmin
        .from('profiles')
        .select('id, email, username')
        .in('id', userIds);

      console.log('Profiles query result:', { profiles, profilesError });

      if (!profilesError) {
        profilesData = profiles || [];
      }
    } else {
      console.log('No scores found in database');
    }

    // Combine scores with profiles
    const bestScores = Array.from(userBestScores.values())
      .map(score => ({
        ...score,
        profiles: profilesData.find(profile => profile.id === score.user_id)
      }))
      .sort((a, b) => b.wpm - a.wpm)
      .slice(0, limit);

    console.log('Final best scores:', bestScores);

    return NextResponse.json({ scores: bestScores || [] });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 