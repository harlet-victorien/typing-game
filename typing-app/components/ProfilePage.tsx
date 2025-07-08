'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from './auth/AuthProvider';
import AuthModal from './auth/AuthModal';
import UserProfile from './auth/UserProfile';
import Leaderboard from './Leaderboard';
import ThemeSelector from './ThemeSelector';
import { ThemeToggle } from './ThemeToggle';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ChartPieLegend, createChartConfig, createChartData } from './PieChart';

interface ProfileStats {
  totalGames: number;
  averageWpm: number;
  bestWpm: number;
  averageAccuracy: number;
  totalWordsTyped: number;
  totalErrors: number;
}

interface RecentScore {
  wpm: number;
  accuracy: number;
  created_at: string;
  words_typed: number;
  errors: number;
}

interface ProfilePageProps {
  onBackToGame?: () => void;
}

export default function ProfilePage({ onBackToGame }: ProfilePageProps) {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [stats, setStats] = useState<ProfileStats>({
    totalGames: 0,
    averageWpm: 0,
    bestWpm: 0,
    averageAccuracy: 0,
    totalWordsTyped: 0,
    totalErrors: 0
  });
  const [recentScores, setRecentScores] = useState<RecentScore[]>([]);

  // Fetch user stats and recent scores
  useEffect(() => {
    if (user) {
      fetchUserStats();
      fetchRecentScores();
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      const response = await fetch(`/api/scores?user_id=${user?.id}&summary=true`);
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats || stats);
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const fetchRecentScores = async () => {
    try {
      const response = await fetch(`/api/scores?user_id=${user?.id}&limit=10`);
      if (response.ok) {
        const data = await response.json();
        setRecentScores(data.scores || []);
      }
    } catch (error) {
      console.error('Error fetching recent scores:', error);
    }
  };

  // Create chart data for accuracy pie chart
  const accuracyChartData = createChartData([
    { status: 'correct', words: stats.totalWordsTyped - stats.totalErrors },
    { status: 'incorrect', words: stats.totalErrors }
  ]);

  const accuracyChartConfig = createChartConfig([
    { key: 'correct', label: 'Correct Words', color: 'var(--chart-2)' },
    { key: 'incorrect', label: 'Incorrect Words', color: 'var(--chart-1)' }
  ]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 transition-colors duration-200 relative overflow-hidden">
      
      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl">
        {/* Header with controls - same as main page */}
        <div className="fixed top-4 left-4 right-4 flex justify-between items-center z-20">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => setShowLeaderboard(true)}
              variant="default"
            >
              🏆 Leaderboard
            </Button>
            <Button
              onClick={() => setShowThemeSelector(true)}
              variant="outline"
            >
              🎨 Themes
            </Button>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <UserProfile />
            ) : (
              <Button
                onClick={() => setShowAuthModal(true)}
                variant="ghost"
              >
                Sign In
              </Button>
            )}
            <ThemeToggle />
          </div>
        </div>

        {/* Profile Controls - centered */}
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex items-center space-x-4">
            {onBackToGame && (
              <Button
                onClick={onBackToGame}
                variant="outline"
                size="lg"
              >
                ← Back to Game
              </Button>
            )}
            <Button
              variant="default"
              size="lg"
            >
              👤 Profile
            </Button>
          </div>
        </div>

        {/* Modals */}
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={() => setShowAuthModal(false)} 
        />
        <Leaderboard 
          isOpen={showLeaderboard} 
          onClose={() => setShowLeaderboard(false)} 
        />
        <ThemeSelector 
          isOpen={showThemeSelector} 
          onClose={() => setShowThemeSelector(false)}
          currentTheme="default"
          onThemeChange={() => {}}
        />

        {/* Profile Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full mt-20"
        >
          {user ? (
            <div className="space-y-8">
              {/* Welcome Section */}
              <div className="text-center">
                <h1 className="text-4xl font-bold text-foreground mb-2">
                  Welcome back, {user.user_metadata?.full_name || user.email}!
                </h1>
                                 <p className="text-muted-foreground">
                   Here&apos;s your typing journey so far
                 </p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Games
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalGames}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Average WPM
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.averageWpm}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Best WPM
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-chart-2">{stats.bestWpm}</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Average Accuracy
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.averageAccuracy}%</div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts and Recent Games */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Accuracy Chart */}
                {stats.totalWordsTyped > 0 && (
                  <ChartPieLegend
                    title="Overall Accuracy"
                    description="Words typed correctly vs incorrectly"
                    data={accuracyChartData}
                    config={accuracyChartConfig}
                    dataKey="words"
                    nameKey="status"
                  />
                )}

                {/* Recent Games */}
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Games</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {recentScores.length > 0 ? (
                        recentScores.slice(0, 5).map((score, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center p-3 bg-muted/50 rounded-lg"
                          >
                            <div>
                              <div className="font-medium">{score.wpm} WPM</div>
                              <div className="text-sm text-muted-foreground">
                                {score.accuracy}% accuracy
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(score.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center text-muted-foreground py-8">
                          No games played yet. Start typing to see your progress!
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Achievement Badges (Future Feature) */}
              <Card>
                <CardHeader>
                  <CardTitle>Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg">
                      <div className="text-2xl mb-2">🚀</div>
                      <div className="text-sm text-center">Speed Demon</div>
                      <div className="text-xs text-muted-foreground">60+ WPM</div>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg opacity-50">
                      <div className="text-2xl mb-2">🎯</div>
                      <div className="text-sm text-center">Accuracy Master</div>
                      <div className="text-xs text-muted-foreground">95+ Accuracy</div>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg opacity-50">
                      <div className="text-2xl mb-2">📚</div>
                      <div className="text-sm text-center">Bookworm</div>
                      <div className="text-xs text-muted-foreground">1000+ Words</div>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-muted/50 rounded-lg opacity-50">
                      <div className="text-2xl mb-2">🔥</div>
                      <div className="text-sm text-center">Streak Master</div>
                      <div className="text-xs text-muted-foreground">7 Day Streak</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-16">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Sign in to view your profile
              </h2>
              <p className="text-muted-foreground mb-8">
                Track your progress, view statistics, and compete with others
              </p>
              <Button
                onClick={() => setShowAuthModal(true)}
                size="lg"
              >
                Sign In
              </Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
} 