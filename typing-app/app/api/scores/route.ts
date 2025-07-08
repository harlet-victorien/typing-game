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
    const { user_id, wpm, accuracy, words_typed, errors, time_duration, theme } = body;

    console.log('POST /api/scores - Received data:', { user_id, wpm, accuracy, words_typed, errors, time_duration, theme });

    // Validate required fields
    if (!user_id || typeof wpm !== 'number' || typeof accuracy !== 'number') {
      console.log('Validation failed:', { user_id: !!user_id, wpm: typeof wpm, accuracy: typeof accuracy });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get theme_id from theme name
    const { data: themeData, error: themeError } = await supabaseAdmin
      .from('themes')
      .select('id')
      .eq('name', theme || 'default')
      .single();

    if (themeError || !themeData) {
      console.error('Theme lookup error:', themeError);
      return NextResponse.json(
        { error: 'Invalid theme' },
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
        time_duration: time_duration || 60,
        theme_id: themeData.id
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
    const summary = searchParams.get('summary') === 'true';
    const themes = searchParams.get('themes') === 'true';

    // Handle user stats summary request
    if (summary && user_id) {
      const { data: userScores, error: statsError } = await supabaseAdmin
        .from('scores')
        .select('wpm, accuracy, errors')
        .eq('user_id', user_id);

      if (statsError) {
        return NextResponse.json({ error: 'Failed to fetch user stats' }, { status: 500 });
      }

      if (!userScores || userScores.length === 0) {
        return NextResponse.json({ 
          stats: { wpmMean: 0, errorsMean: 0, accuracyMean: 0, totalGames: 0, bestWpm: 0 } 
        });
      }

      const totalGames = userScores.length;
      const wpmMean = Math.round(userScores.reduce((sum, score) => sum + score.wpm, 0) / totalGames);
      const errorsMean = Math.round(userScores.reduce((sum, score) => sum + score.errors, 0) / totalGames);
      const accuracyMean = Math.round(userScores.reduce((sum, score) => sum + score.accuracy, 0) / totalGames);
      const bestWpm = Math.max(...userScores.map(score => score.wpm));

      return NextResponse.json({
        stats: { wpmMean, errorsMean, accuracyMean, totalGames, bestWpm }
      });
    }

    // Handle theme distribution request
    if (themes && user_id) {
      const { data: themeScores, error: themeError } = await supabaseAdmin
        .from('scores')
        .select(`
          wpm,
          themes:theme_id (
            name,
            display_name
          )
        `)
        .eq('user_id', user_id);

      if (themeError) {
        return NextResponse.json({ error: 'Failed to fetch theme stats' }, { status: 500 });
      }

      interface ThemeAccumulator {
        [key: string]: { theme: string; count: number; totalWpm: number };
      }

      const themeStats = themeScores?.reduce((acc: ThemeAccumulator, score) => {
        const themes = score.themes as unknown;
        const themeData = Array.isArray(themes) ? themes[0] : themes;
        const themeName = (themeData as { name?: string })?.name || 'unknown';
        if (!acc[themeName]) {
          acc[themeName] = { theme: themeName, count: 0, totalWpm: 0 };
        }
        acc[themeName].count++;
        acc[themeName].totalWpm += score.wpm;
        return acc;
      }, {} as ThemeAccumulator) || {};

      const themeStatsArray = Object.values(themeStats).map((stat) => ({
        theme: stat.theme,
        count: stat.count,
        averageWpm: Math.round(stat.totalWpm / stat.count)
      }));

      return NextResponse.json({ themeStats: themeStatsArray });
    }

    // Handle user score history request
    if (user_id && !summary && !themes) {
      const { data: userScores, error: historyError } = await supabaseAdmin
        .from('scores')
        .select(`
          *,
          themes:theme_id (
            name,
            display_name
          )
        `)
        .eq('user_id', user_id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (historyError) {
        return NextResponse.json({ error: 'Failed to fetch score history' }, { status: 500 });
      }

      // Transform the data to match the expected format
      const scoreHistory = userScores?.map((score) => {
        const themes = score.themes as unknown;
        const themeData = Array.isArray(themes) ? themes[0] : themes;
        const themeName = (themeData as { name?: string })?.name || 'unknown';
        
        return {
          date: new Date(score.created_at).toLocaleDateString(),
          theme: themeName,
          wpm: score.wpm,
          accuracy: score.accuracy,
          errors: score.errors,
          words: score.words_typed,
          duration: score.time_duration
        };
      }) || [];

      return NextResponse.json({ scoreHistory });
    }

    // Handle leaderboard request (default behavior)
    const scoresQuery = supabaseAdmin
      .from('scores')
      .select('*')
      .order('wpm', { ascending: false })
      .limit(1000);

    const { data: allScores, error: scoresError } = await scoresQuery;

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

    // Fetch profiles for these users
    let profilesData: Array<{ id: string; email: string; username: string | null }> = [];
    if (userIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabaseAdmin
        .from('profiles')
        .select('id, email, username')
        .in('id', userIds);

      if (!profilesError) {
        profilesData = profiles || [];
      }
    }

    // Combine scores with profiles
    const bestScores = Array.from(userBestScores.values())
      .map(score => ({
        ...score,
        profiles: profilesData.find(profile => profile.id === score.user_id)
      }))
      .sort((a, b) => b.wpm - a.wpm)
      .slice(0, limit);

    return NextResponse.json({ scores: bestScores || [] });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 