'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from './auth/AuthProvider';

interface Score {
  id: string;
  user_id: string;
  wpm: number;
  accuracy: number;
  words_typed: number;
  errors: number;
  time_duration: number;
  created_at: string;
  profiles?: {
    email: string;
    username: string | null;
  };
}

interface LeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Leaderboard({ isOpen, onClose }: LeaderboardProps) {
  const [scores, setScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (isOpen) {
      fetchLeaderboard();
    }
  }, [isOpen]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/scores?limit=10');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch leaderboard');
      }

      setScores(data.scores);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-background/30 backdrop-blur-lg flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card backdrop-blur-lg p-8 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto border border-border"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              🏆 Leaderboard
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Best scores per player
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            ✕
          </button>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-destructive/10 border border-destructive text-destructive rounded">
            {error}
          </div>
        )}

        {!loading && !error && scores.length === 0 && (
          <div className="text-center py-8">
            <div className="text-muted-foreground">
              No scores yet. Be the first to set a record!
            </div>
          </div>
        )}

        {!loading && !error && scores.length > 0 && (
          <div className="space-y-2">
            {scores.map((score, index) => (
              <motion.div
                key={score.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  score.user_id === user?.id
                    ? 'bg-accent/20 border-accent'
                    : 'bg-secondary border-border'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`text-2xl font-bold ${
                    index === 0 ? 'text-chart-2' :
                    index === 1 ? 'text-chart-3' :
                    index === 2 ? 'text-chart-4' :
                    'text-muted-foreground'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-foreground">
                      {score.profiles?.username || score.profiles?.email || 'Anonymous'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(score.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-lg text-chart-1">
                      {score.wpm}
                    </div>
                    <div className="text-muted-foreground">WPM</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg text-chart-2">
                      {score.accuracy}%
                    </div>
                    <div className="text-muted-foreground">Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg text-chart-3">
                      {score.words_typed}
                    </div>
                    <div className="text-muted-foreground">Words</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
} 