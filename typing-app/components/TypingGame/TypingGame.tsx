'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import CurrentWord from './CurrentWord';
import CompletedWords from './CompletedWords';
import WordInput from './WordInput';
import GameStats from './GameStats';

const WORD_LIST = [
  'javascript', 'typescript', 'react', 'nextjs', 'framer', 'motion',
  'animation', 'component', 'useState', 'useEffect', 'tailwind',
  'programming', 'developer', 'frontend', 'backend', 'fullstack',
  'nodejs', 'express', 'mongodb', 'postgresql', 'firebase',
  'vercel', 'github', 'coding', 'algorithms', 'functions'
];

export interface GameState {
  currentWordIndex: number;
  completedWords: Array<{ word: string; timestamp: number }>;
  currentInput: string;
  isGameActive: boolean;
  startTime: number | null;
  errors: number;
  totalKeystrokes: number;
}

export default function TypingGame() {
  const [gameState, setGameState] = useState<GameState>({
    currentWordIndex: 0,
    completedWords: [],
    currentInput: '',
    isGameActive: false,
    startTime: null,
    errors: 0,
    totalKeystrokes: 0
  });

  const currentWord = WORD_LIST[gameState.currentWordIndex];
  const isGameComplete = gameState.currentWordIndex >= WORD_LIST.length;

  const startGame = useCallback(() => {
    setGameState({
      currentWordIndex: 0,
      completedWords: [],
      currentInput: '',
      isGameActive: true,
      startTime: Date.now(),
      errors: 0,
      totalKeystrokes: 0
    });
  }, []);

  const handleInputChange = useCallback((value: string) => {
    if (!gameState.isGameActive || isGameComplete) return;

    setGameState(prev => ({
      ...prev,
      currentInput: value,
      totalKeystrokes: prev.totalKeystrokes + 1
    }));

    // Check if word is completed
    if (value === currentWord) {
      const newCompletedWord = {
        word: currentWord,
        timestamp: Date.now()
      };

      setGameState(prev => ({
        ...prev,
        currentWordIndex: prev.currentWordIndex + 1,
        completedWords: [...prev.completedWords, newCompletedWord],
        currentInput: ''
      }));
    }
  }, [gameState.isGameActive, isGameComplete, currentWord]);

  const handleKeyPress = useCallback((isCorrect: boolean) => {
    if (!isCorrect) {
      setGameState(prev => ({
        ...prev,
        errors: prev.errors + 1
      }));
    }
  }, []);

  useEffect(() => {
    if (isGameComplete && gameState.isGameActive) {
      setGameState(prev => ({ ...prev, isGameActive: false }));
    }
  }, [isGameComplete, gameState.isGameActive]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-6xl"
      >
        <GameStats
          gameState={gameState}
          isGameComplete={isGameComplete}
          totalWords={WORD_LIST.length}
        />

        <div className="flex items-center justify-center space-x-8 my-16">
          <CompletedWords words={gameState.completedWords} />
          
          {!isGameComplete && (
            <CurrentWord 
              word={currentWord}
              currentInput={gameState.currentInput}
              isActive={gameState.isGameActive}
            />
          )}
          
          {isGameComplete && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-4xl font-bold text-green-400"
            >
              🎉 Complete!
            </motion.div>
          )}
        </div>

        <WordInput
          value={gameState.currentInput}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          targetWord={currentWord}
          isGameActive={gameState.isGameActive}
          isGameComplete={isGameComplete}
          onStart={startGame}
        />
      </motion.div>
    </div>
  );
} 