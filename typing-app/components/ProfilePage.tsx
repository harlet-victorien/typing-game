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
import { ChartPieLegend, createChartConfig } from './PieChart';

interface ProfileStats {
  wpmMean: number;
  errorsMean: number;
  accuracyMean: number;
  totalGames: number;
  bestWpm: number;
}

interface ScoreRecord {
  date: string;
  theme: string;
  wpm: number;
  accuracy: number;
  errors: number;
  words: number;
  duration: number;
}

interface ThemeStats {
  theme: string;
  count: number;
  averageWpm: number;
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
    wpmMean: 0,
    errorsMean: 0,
    accuracyMean: 0,
    totalGames: 0,
    bestWpm: 0
  });
  const [scoreHistory, setScoreHistory] = useState<ScoreRecord[]>([]);
  const [themeStats, setThemeStats] = useState<ThemeStats[]>([]);

  // Fetch user stats and score history
  useEffect(() => {
    if (user) {
      fetchUserStats();
      fetchScoreHistory();
      fetchThemeStats();
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

  const fetchScoreHistory = async () => {
    try {
      const response = await fetch(`/api/scores?user_id=${user?.id}&limit=200`);
      if (response.ok) {
        const data = await response.json();
        setScoreHistory(data.scoreHistory || []);
      }
    } catch (error) {
      console.error('Error fetching score history:', error);
    }
  };

  const fetchThemeStats = async () => {
    try {
      const response = await fetch(`/api/scores?user_id=${user?.id}&themes=true`);
      if (response.ok) {
        const data = await response.json();
        setThemeStats(data.themeStats || []);
      }
    } catch (error) {
      console.error('Error fetching theme stats:', error);
    }
  };

  // Create chart data for theme distribution pie chart
  const themeChartData = themeStats.map((theme) => ({
    theme: theme.theme,
    games: theme.count,
    fill: `var(--color-${theme.theme})`
  }));

  const themeChartConfig = createChartConfig(
    themeStats.map((theme, index) => ({
      key: theme.theme,
      label: theme.theme.charAt(0).toUpperCase() + theme.theme.slice(1),
      color: `var(--chart-${(index % 5) + 1})`
    }))
  );

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

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      WPM Mean
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-chart-2">{stats.wpmMean}</div>
                    <p className="text-sm text-muted-foreground">Average typing speed</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Errors Mean
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-chart-1">{stats.errorsMean}</div>
                    <p className="text-sm text-muted-foreground">Average errors per game</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Accuracy Mean
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-chart-4">{stats.accuracyMean}%</div>
                    <p className="text-sm text-muted-foreground">Average accuracy rate</p>
                  </CardContent>
                </Card>
              </div>

              {/* Theme Distribution Chart */}
              {themeStats.length > 0 && (
                <div className="mb-8">
                  <ChartPieLegend
                    title="Scores per Theme"
                    description="Distribution of games across different themes"
                    data={themeChartData}
                    config={themeChartConfig}
                    dataKey="games"
                    nameKey="theme"
                  />
                </div>
              )}

              {/* Score History Table */}
              <Card className='max-h-128 overflow-y-auto'>
                <CardHeader>
                  <CardTitle>Score History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2">Date</th>
                          <th className="text-left py-2">Theme</th>
                          <th className="text-left py-2">WPM</th>
                          <th className="text-left py-2">Accuracy</th>
                          <th className="text-left py-2">Errors</th>
                          <th className="text-left py-2">Words</th>
                          <th className="text-left py-2">Duration</th>
                        </tr>
                      </thead>
                      <tbody>
                        {scoreHistory.length > 0 ? (
                          scoreHistory.map((score, index) => (
                            <tr key={`${score.date}-${score.wpm}-${index}`} className="border-b hover:bg-muted/50">
                              <td className="py-2">
                                {score.date}
                              </td>
                              <td className="py-2">
                                <span className="px-2 py-1 bg-secondary rounded text-xs">
                                  {score.theme}
                                </span>
                              </td>
                              <td className="py-2 font-medium">{score.wpm}</td>
                              <td className="py-2">{score.accuracy}%</td>
                              <td className="py-2 text-destructive">{score.errors}</td>
                              <td className="py-2">{score.words}</td>
                              <td className="py-2">{score.duration}s</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={7} className="text-center text-muted-foreground py-8">
                              No games played yet. Start typing to see your history!
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
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