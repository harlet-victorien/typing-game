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

    let query = supabase
      .from('scores')
      .select(`
        *,
        profiles (
          email,
          username
        )
      `)
      .order('wpm', { ascending: false })
      .limit(limit);

    // If user_id is provided, get user's scores
    if (user_id) {
      query = query.eq('user_id', user_id);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch scores' },
        { status: 500 }
      );
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