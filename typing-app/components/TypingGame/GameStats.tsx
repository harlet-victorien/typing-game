'use client';

import { motion } from 'framer-motion';
import { GameState } from './TypingGame';

interface GameStatsProps {
  gameState: GameState;
  isGameComplete: boolean;
}

export default function GameStats({ gameState, isGameComplete }: GameStatsProps) {
  const calculateWPM = () => {
    if (!gameState.isGameActive && gameState.timeRemaining === 60) return 0; // Game hasn't started
    
    // Calculate elapsed time from the 60-second countdown
    const timeElapsed = (60 - gameState.timeRemaining) / 60; // minutes
    
    // Only count correctly typed words for WPM
    const correctWords = gameState.completedWords.filter(word => word.isCorrect).length;
    
    // Need at least some time and correct words for calculation
    if (timeElapsed <= 0 || correctWords === 0) return 0;
    
    // Standard WPM calculation: correct words per minute
    const wpm = correctWords / timeElapsed;
    
    return Math.round(wpm);
  };

  const calculateAccuracy = () => {
    if (gameState.totalKeystrokes === 0) return 100;
    return Math.round(((gameState.totalKeystrokes - gameState.errors) / gameState.totalKeystrokes) * 100);
  };

  const getTimeRemaining = () => {
    return gameState.timeRemaining;
  };

  const stats = [
    {
      label: 'Words',
      value: `${gameState.completedWords.filter(word => word.isCorrect).length}/${gameState.completedWords.length}`,
      color: 'text-blue-700 dark:text-blue-400'
    },
    {
      label: 'WPM',
      value: calculateWPM(),
      color: 'text-green-700 dark:text-green-400'
    },
    {
      label: 'Accuracy',
      value: `${calculateAccuracy()}%`,
      color: 'text-yellow-700 dark:text-yellow-400'
    },
    {
      label: 'Time',
      value: `${getTimeRemaining()}s`,
      color: 'text-purple-700 dark:text-purple-400'
    },
    {
      label: 'Errors',
      value: gameState.errors,
      color: 'text-red-700 dark:text-red-400'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-center space-x-8 mb-8"
    >
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
          className="text-center bg-background/30 backdrop-blur-sm px-4 py-3 rounded-lg border border-background/50"
        >
          <div className={`text-2xl font-bold ${stat.color}`}>
            {stat.value}
          </div>
          <div className="text-foreground/80 text-sm uppercase tracking-wider">
            {stat.label}
          </div>
        </motion.div>
      ))}
      
      {isGameComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center ml-8 pl-8 border-l border-white/30 bg-black/20 backdrop-blur-sm px-4 py-3 rounded-lg border border-white/20"
        >
          <div className="text-2xl font-bold text-white">
            🏆
          </div>
          <div className="text-white/80 text-sm uppercase tracking-wider">
            Complete
          </div>
        </motion.div>
      )}
    </motion.div>
  );
} 