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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            🏆 Leaderboard
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        {loading && (
          <div className="text-center py-8">
            <div className="text-gray-600 dark:text-gray-400">Loading...</div>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {!loading && !error && scores.length === 0 && (
          <div className="text-center py-8">
            <div className="text-gray-600 dark:text-gray-400">
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
                    ? 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800'
                    : 'bg-gray-50 border-gray-200 dark:bg-gray-700 dark:border-gray-600'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`text-2xl font-bold ${
                    index === 0 ? 'text-yellow-500' :
                    index === 1 ? 'text-gray-400' :
                    index === 2 ? 'text-amber-600' :
                    'text-gray-600 dark:text-gray-400'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {score.profiles?.username || score.profiles?.email || 'Anonymous'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(score.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6 text-sm">
                  <div className="text-center">
                    <div className="font-bold text-lg text-blue-600 dark:text-blue-400">
                      {score.wpm}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">WPM</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg text-green-600 dark:text-green-400">
                      {score.accuracy}%
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="font-bold text-lg text-purple-600 dark:text-purple-400">
                      {score.words_typed}
                    </div>
                    <div className="text-gray-600 dark:text-gray-400">Words</div>
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