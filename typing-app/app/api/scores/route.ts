import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, wpm, accuracy, words_typed, errors, time_duration } = body;

    // Validate required fields
    if (!user_id || typeof wpm !== 'number' || typeof accuracy !== 'number') {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Insert score into database
    const { data, error } = await supabase
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
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to save score' },
        { status: 500 }
      );
    }

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

    // Use a more explicit approach to join tables
    const query = supabase
      .rpc('get_scores_with_profiles', {
        score_limit: limit,
        filter_user_id: user_id
      });

    // Fallback to direct query if RPC doesn't exist
    const { error } = await query;
    let { data } = await query;

    if (error) {
      console.log('RPC failed, falling back to direct query:', error.message);
      
      // Fallback: Get scores first, then fetch profiles separately
      let scoresQuery = supabase
        .from('scores')
        .select('*')
        .order('wpm', { ascending: false })
        .limit(limit);

      if (user_id) {
        scoresQuery = scoresQuery.eq('user_id', user_id);
      }

      const { data: scoresData, error: scoresError } = await scoresQuery;

      if (scoresError) {
        console.error('Scores query error:', scoresError);
        return NextResponse.json(
          { error: 'Failed to fetch scores' },
          { status: 500 }
        );
      }

      // Fetch profiles for the users in the scores
      const userIds = [...new Set(scoresData?.map(score => score.user_id) || [])];
      
      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email, username')
          .in('id', userIds);

        if (!profilesError && profilesData) {
          // Combine scores with profiles
          data = scoresData?.map(score => ({
            ...score,
            profiles: profilesData.find(profile => profile.id === score.user_id)
          }));
        } else {
          // If profiles fetch fails, return scores without profile info
          data = scoresData;
        }
      } else {
        data = scoresData;
      }
    }

    return NextResponse.json({ scores: data || [] });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 