'use client';

import { motion } from 'framer-motion';
import { GameState } from './TypingGame';

interface GameStatsProps {
  gameState: GameState;
  isGameComplete: boolean;
  totalWords: number;
}

export default function GameStats({ gameState, isGameComplete, totalWords }: GameStatsProps) {
  const calculateWPM = () => {
    if (!gameState.startTime || gameState.completedWords.length === 0) return 0;
    
    const timeElapsed = (Date.now() - gameState.startTime) / 1000 / 60; // minutes
    const wordsTyped = gameState.completedWords.length;
    return Math.round(wordsTyped / timeElapsed);
  };

  const calculateAccuracy = () => {
    if (gameState.totalKeystrokes === 0) return 100;
    return Math.round(((gameState.totalKeystrokes - gameState.errors) / gameState.totalKeystrokes) * 100);
  };

  const getElapsedTime = () => {
    if (!gameState.startTime) return 0;
    return Math.round((Date.now() - gameState.startTime) / 1000);
  };

  const stats = [
    {
      label: 'Words',
      value: `${gameState.completedWords.length}/${totalWords}`,
      color: 'text-blue-400'
    },
    {
      label: 'WPM',
      value: calculateWPM(),
      color: 'text-green-400'
    },
    {
      label: 'Accuracy',
      value: `${calculateAccuracy()}%`,
      color: 'text-yellow-400'
    },
    {
      label: 'Time',
      value: `${getElapsedTime()}s`,
      color: 'text-purple-400'
    },
    {
      label: 'Errors',
      value: gameState.errors,
      color: 'text-red-400'
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
          className="text-center"
        >
          <div className={`text-2xl font-bold ${stat.color}`}>
            {stat.value}
          </div>
          <div className="text-gray-400 text-sm uppercase tracking-wider">
            {stat.label}
          </div>
        </motion.div>
      ))}
      
      {isGameComplete && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center ml-8 pl-8 border-l border-gray-600"
        >
          <div className="text-2xl font-bold text-green-400">
            🏆
          </div>
          <div className="text-gray-400 text-sm uppercase tracking-wider">
            Complete
          </div>
        </motion.div>
      )}
    </motion.div>
  );
} 