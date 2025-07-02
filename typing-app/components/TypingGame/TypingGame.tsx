'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import CurrentWord from './CurrentWord';
import CompletedWords from './CompletedWords';
import WordInput from './WordInput';
import GameStats from './GameStats';
import { ThemeToggle } from '../ThemeToggle';
import { useAuth } from '../auth/AuthProvider';
import AuthModal from '../auth/AuthModal';
import UserProfile from '../auth/UserProfile';
import Leaderboard from '../Leaderboard';
import { Button } from '../ui/button';

// Default fallback words in case API fails
const FALLBACK_WORDS = [
  'javascript', 'typescript', 'react', 'nextjs', 'framer', 'motion',
  'animation', 'component', 'useState', 'useEffect', 'tailwind',
  'programming', 'developer', 'frontend', 'backend', 'fullstack',
  'nodejs', 'express', 'mongodb', 'postgresql', 'firebase',
  'vercel', 'github', 'coding', 'algorithms', 'functions'
];

export interface GameState {
  currentWordIndex: number;
  completedWords: Array<{ word: string; timestamp: number; isCorrect: boolean }>;
  currentInput: string;
  isGameActive: boolean;
  startTime: number | null;
  timeRemaining: number; // in seconds
  errors: number;
  totalKeystrokes: number;
}

interface WordsResponse {
  words: string[];
  count: number;
  timestamp: string;
}

export default function TypingGame() {
  const { user } = useAuth();
  const [gameState, setGameState] = useState<GameState>({
    currentWordIndex: 0,
    completedWords: [],
    currentInput: '',
    isGameActive: false,
    startTime: null,
    timeRemaining: 60,
    errors: 0,
    totalKeystrokes: 0
  });

  const [wordList, setWordList] = useState<string[]>(FALLBACK_WORDS);
  const [isLoadingWords, setIsLoadingWords] = useState(false);
  const [wordsError, setWordsError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [scoreSaved, setScoreSaved] = useState(false);
  const [savingScore, setSavingScore] = useState(false);

  const currentWord = wordList[gameState.currentWordIndex];
  const isGameComplete = gameState.timeRemaining === 0;

  // Calculate upcoming words for preview
  const upcomingWords = [
    wordList[(gameState.currentWordIndex + 1) % wordList.length],
    wordList[(gameState.currentWordIndex + 2) % wordList.length]
  ];

  // Fetch fresh words from API
  const fetchWords = useCallback(async () => {
    setIsLoadingWords(true);
    setWordsError(null);
    
    try {
      const response = await fetch('/api/words');
      if (!response.ok) {
        throw new Error('Failed to fetch words');
      }
      
      const data: WordsResponse = await response.json();
      setWordList(data.words);
    } catch (error) {
      console.error('Error fetching words:', error);
      setWordsError('Failed to load new words. Using default word list.');
      setWordList(FALLBACK_WORDS);
    } finally {
      setIsLoadingWords(false);
    }
  }, []);

  const startGame = useCallback(async () => {
    // Fetch fresh words before starting the game
    await fetchWords();
    
    setGameState({
      currentWordIndex: 0,
      completedWords: [],
      currentInput: '',
      isGameActive: true,
      startTime: Date.now(),
      timeRemaining: 60,
      errors: 0,
      totalKeystrokes: 0
    });
    setScoreSaved(false);
    setSavingScore(false);
  }, [fetchWords]);

  const saveScore = useCallback(async (finalGameState: GameState) => {
    console.log('saveScore called with:', { 
      user: user?.id, 
      scoreSaved, 
      savingScore, 
      completedWords: finalGameState.completedWords.length,
      totalKeystrokes: finalGameState.totalKeystrokes 
    });
    
    if (!user || scoreSaved || savingScore) {
      console.log('Skipping score save:', { 
        noUser: !user, 
        alreadySaved: scoreSaved, 
        alreadySaving: savingScore 
      });
      return;
    }

    const timeElapsed = (60 - finalGameState.timeRemaining) / 60;
    const correctWords = finalGameState.completedWords.filter(word => word.isCorrect).length;
    const wpm = timeElapsed > 0 ? Math.round(correctWords / timeElapsed) : 0;
    const accuracy = finalGameState.totalKeystrokes > 0 
      ? Math.round(((finalGameState.totalKeystrokes - finalGameState.errors) / finalGameState.totalKeystrokes) * 100)
      : 100;

    // Only save scores with meaningful data
    if (correctWords === 0 && finalGameState.totalKeystrokes === 0) {
      console.log('Skipping score save - no meaningful activity');
      return;
    }

    console.log('Attempting to save score:', { 
      user_id: user.id,
      wpm, 
      accuracy, 
      correctWords, 
      errors: finalGameState.errors, 
      timeElapsed: 60 - finalGameState.timeRemaining,
      timeRemaining: finalGameState.timeRemaining
    });
    
    setSavingScore(true);

    try {
      const scoreData = {
        user_id: user.id,
        wpm,
        accuracy,
        words_typed: correctWords,
        errors: finalGameState.errors,
        time_duration: 60 - finalGameState.timeRemaining // Actual time played
      };
      
      console.log('POST /api/scores with data:', scoreData);
      
      const response = await fetch('/api/scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scoreData),
      });

      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response data:', result);

      if (response.ok) {
        setScoreSaved(true);
        console.log('Score saved successfully:', result);
      } else {
        console.error('Failed to save score - API error:', result);
      }
    } catch (error) {
      console.error('Failed to save score - Network error:', error);
    } finally {
      setSavingScore(false);
    }
  }, [user, scoreSaved, savingScore]);

  const stopGame = useCallback(() => {
    console.log('Stop game called - not saving score (incomplete session)');

    setGameState({
      currentWordIndex: 0,
      completedWords: [],
      currentInput: '',
      isGameActive: false,
      startTime: null,
      timeRemaining: 60,
      errors: 0,
      totalKeystrokes: 0
    });
    setScoreSaved(false);
    setSavingScore(false);
  }, []);

  const handleInputChange = useCallback((value: string) => {
    if (!gameState.isGameActive || isGameComplete) return;

    setGameState(prev => ({
      ...prev,
      currentInput: value,
      totalKeystrokes: prev.totalKeystrokes + 1
    }));

    // Check if word is completed (either correctly or with errors)
    if (value.length === currentWord.length) {
      const isCorrect = value === currentWord;
      const newCompletedWord = {
        word: currentWord,
        timestamp: Date.now(),
        isCorrect: isCorrect
      };

      setGameState(prev => ({
        ...prev,
        currentWordIndex: (prev.currentWordIndex + 1) % wordList.length, // Loop through words
        completedWords: [...prev.completedWords, newCompletedWord],
        currentInput: ''
      }));
    }
  }, [gameState.isGameActive, isGameComplete, currentWord, wordList.length]);

  const handleKeyPress = useCallback((isCorrect: boolean) => {
    if (!isCorrect) {
      setGameState(prev => ({
        ...prev,
        errors: prev.errors + 1
      }));
    }
  }, []);

  // Countdown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (gameState.isGameActive && gameState.timeRemaining > 0) {
      interval = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          timeRemaining: prev.timeRemaining - 1
        }));
      }, 1000);
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [gameState.isGameActive, gameState.timeRemaining]);

  // End game when time runs out and save score
  useEffect(() => {
    console.log('Game state check:', { 
      timeRemaining: gameState.timeRemaining, 
      isGameActive: gameState.isGameActive,
      user: user?.id,
      scoreSaved 
    });
    
    if (gameState.timeRemaining === 0 && gameState.isGameActive) {
      console.log('Game ending - time ran out');
      // Save score BEFORE setting isGameActive to false
      if (user && !scoreSaved) {
        console.log('Calling saveScore from timer end');
        saveScore(gameState);
      } else {
        console.log('Not saving score:', { noUser: !user, alreadySaved: scoreSaved });
      }
      setGameState(prev => ({ ...prev, isGameActive: false }));
    }
  }, [gameState.timeRemaining, gameState.isGameActive, gameState, user, saveScore, scoreSaved]);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col items-center justify-center p-8 transition-colors duration-200">
      {/* Header with controls */}
      <div className="fixed top-4 left-4 right-4 flex justify-between items-center z-10">
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => setShowLeaderboard(true)}
            variant="secondary"
            className="px-4 py-2"
          >
            🏆 Leaderboard
          </Button>
        </div>
        
        <div className="flex items-center space-x-4">
          {user ? (
            <UserProfile />
          ) : (
            <Button
              onClick={() => setShowAuthModal(true)}
              className="px-4 py-2"
            >
              Sign In
            </Button>
          )}
          <ThemeToggle />
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
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-6xl"
      >
        <GameStats
          gameState={gameState}
          isGameComplete={isGameComplete}
        />

        {/* Stop Button - only show during active game */}
        {gameState.isGameActive && !isGameComplete && (
          <div className="text-center mb-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={stopGame}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium text-sm transition-colors"
            >
              Stop Game
            </motion.button>
          </div>
        )}

        {/* Score Saving Indicator */}
        {savingScore && (
          <div className="text-center mb-4">
            <div className="text-blue-600 dark:text-blue-400 text-sm flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 dark:border-blue-400"></div>
              <span>Saving your score...</span>
            </div>
          </div>
        )}

        {/* Score Saved Confirmation */}
        {scoreSaved && !savingScore && isGameComplete && (
          <div className="text-center mb-4">
            <div className="text-green-600 dark:text-green-400 text-sm flex items-center justify-center space-x-2">
              <span>✅ Score saved to leaderboard!</span>
            </div>
          </div>
        )}

        {/* Words Loading/Error Status */}
        {isLoadingWords && (
          <div className="text-center mb-4">
            <div className="text-gray-600 dark:text-gray-400">
              Loading fresh words...
            </div>
          </div>
        )}
        
        {wordsError && (
          <div className="text-center mb-4">
            <div className="text-yellow-600 dark:text-yellow-400 text-sm">
              {wordsError}
            </div>
          </div>
        )}

        <div className="flex items-center justify-center space-x-8 my-16">
          <CompletedWords words={gameState.completedWords} />
          
          {!isGameComplete && (
            <CurrentWord 
              word={currentWord}
              currentInput={gameState.currentInput}
              isActive={gameState.isGameActive}
              upcomingWords={upcomingWords}
            />
          )}
          
          {isGameComplete && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="text-4xl font-bold text-green-500 dark:text-green-400"
            >
              ⏰ Time&apos;s Up!
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