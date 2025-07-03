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
import ThemeSelector from '../ThemeSelector';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';

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
  hasStartedTyping: boolean;
  startTime: number | null;
  timeRemaining: number; // in seconds
  errors: number;
  totalKeystrokes: number;
}

interface WordsResponse {
  words: string[];
  count: number;
  theme: string;
  timestamp: string;
}

export default function TypingGame() {
  const { user } = useAuth();
  const [gameState, setGameState] = useState<GameState>({
    currentWordIndex: 0,
    completedWords: [],
    currentInput: '',
    isGameActive: false,
    hasStartedTyping: false,
    startTime: null,
    timeRemaining: 60,
    errors: 0,
    totalKeystrokes: 0
  });

  const [wordList, setWordList] = useState<string[]>(FALLBACK_WORDS);
  const [wordsError, setWordsError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('default');
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
  const fetchWords = useCallback(async (theme: string = 'default') => {
    setWordsError(null);
    
    try {
      const response = await fetch(`/api/words?theme=${theme}`);
      if (!response.ok) {
        throw new Error('Failed to fetch words');
      }
      
      const data: WordsResponse = await response.json();
      setWordList(data.words);
    } catch (error) {
      console.error('Error fetching words:', error);
      setWordsError('Failed to load new words. Using default word list.');
      setWordList(FALLBACK_WORDS);
    }
  }, []);

  const startGame = useCallback(async () => {
    // Fetch fresh words before starting the game
    await fetchWords(selectedTheme);
    
    setGameState({
      currentWordIndex: 0,
      completedWords: [],
      currentInput: '',
      isGameActive: true,
      hasStartedTyping: false,
      startTime: Date.now(),
      timeRemaining: 60,
      errors: 0,
      totalKeystrokes: 0
    });
    setScoreSaved(false);
    setSavingScore(false);
  }, [fetchWords, selectedTheme]);

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
      hasStartedTyping: false,
      startTime: null,
      timeRemaining: 60,
      errors: 0,
      totalKeystrokes: 0
    });
    setScoreSaved(false);
    setSavingScore(false);
  }, []);

  const handleInputChange = useCallback((value: string) => {
    console.log('TypingGame handleInputChange:', { 
      value, 
      isGameActive: gameState.isGameActive, 
      isGameComplete,
      hasStartedTyping: gameState.hasStartedTyping 
    });
    
    if (!gameState.isGameActive || isGameComplete) {
      console.log('Input blocked - game not active or complete');
      return;
    }

    // Set hasStartedTyping to true on first keystroke
    const isFirstKeystroke = !gameState.hasStartedTyping && value.length === 1;
    
    console.log('Processing input:', { isFirstKeystroke, value });
    
    setGameState(prev => ({
      ...prev,
      currentInput: value,
      hasStartedTyping: prev.hasStartedTyping || isFirstKeystroke,
      totalKeystrokes: prev.totalKeystrokes + 1
    }));

    // Word completion is now handled by spacebar in handleKeyDown
  }, [gameState.isGameActive, gameState.hasStartedTyping, isGameComplete]);

  const handleKeyPress = useCallback((isCorrect: boolean) => {
    if (!isCorrect) {
      setGameState(prev => ({
        ...prev,
        errors: prev.errors + 1
      }));
    }
  }, []);

  const handleKeyDown = useCallback((key: string) => {
    if (!gameState.isGameActive || isGameComplete) return;

    // Handle spacebar for word completion
    if (key === ' ') {
      const isCorrect = gameState.currentInput === currentWord;
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
  }, [gameState.isGameActive, gameState.currentInput, isGameComplete, currentWord, wordList.length]);

  // Countdown timer effect - only start when user has started typing
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (gameState.isGameActive && gameState.hasStartedTyping && gameState.timeRemaining > 0) {
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
  }, [gameState.isGameActive, gameState.hasStartedTyping, gameState.timeRemaining]);

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
      setGameState(prev => ({ 
        ...prev, 
        isGameActive: false
        // Keep completedWords and other stats visible after game ends
      }));
    }
  }, [gameState.timeRemaining, gameState.isGameActive, gameState, user, saveScore, scoreSaved]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 pb-20 sm:pb-24 md:pb-28 transition-colors duration-200 relative overflow-hidden">

      {/* Content */}
      <div className="relative z-10 w-full max-w-6xl">
        {/* Header with controls */}
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
          currentTheme={selectedTheme}
          onThemeChange={setSelectedTheme}
        />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full"
        >
          <GameStats
            gameState={gameState}
            isGameComplete={isGameComplete}
          />
          <Progress value={100 - (gameState.timeRemaining * (100 / 60))} />



          {/* Words Loading/Error Status - Only show errors */}
          {wordsError && (
            <div className="text-center mb-4">
              <div className="text-yellow-200 text-sm bg-yellow-900/20 backdrop-blur-sm px-4 py-2 rounded-lg border border-yellow-400/30">
                {wordsError}
              </div>
            </div>
          )}

          {/* Main typing area - centered with completed words on the left */}
          <div className="flex items-center justify-center min-h-[50vh] relative my-16">
            {/* Completed words - positioned on the left */}
            {!isGameComplete && (
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 hidden lg:block">
                <CompletedWords words={gameState.completedWords} />
              </div>
            )}
            
            {/* Current typing words - centered */}
            {!isGameComplete && (
              <CurrentWord 
                word={currentWord}
                currentInput={gameState.currentInput}
                isActive={gameState.isGameActive}
                upcomingWords={upcomingWords}
              />
            )}
            
            {/* Game complete message - centered */}
            {isGameComplete && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-4xl font-bold text-foreground bg-secondary backdrop-blur-lg px-8 py-4 rounded-lg"
              >
                ⏰ Time&apos;s Up!
              </motion.div>
            )}
          </div>

          <WordInput
            value={gameState.currentInput}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            onKeyDown={handleKeyDown}
            targetWord={currentWord}
            isGameActive={gameState.isGameActive}
            isGameComplete={isGameComplete}
          />
        </motion.div>
      </div>

      {/* Fixed Game Controls - Always at bottom with responsive sizing */}
      <div className="fixed bottom-0 left-0 right-0 z-5 pb-4 sm:pb-6 md:pb-8 pointer-events-none">
        <div className="flex justify-center px-4 sm:px-6 md:px-8">
          {!gameState.isGameActive && !isGameComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative pointer-events-auto"
            >
              {/* Glowing background effect */}
              <div className="absolute inset-y-0 left-8 right-8"></div>
              
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 0 12px rgba(69, 90, 120, 0.4)"
                }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="relative px-6 sm:px-8 md:px-12 py-3 sm:py-4 md:py-6 bg-primary/90 backdrop-blur-sm border border-border text-primary-foreground rounded-full font-bold text-sm sm:text-lg md:text-xl transition-all duration-300 hover:bg-primary group"
              >
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 border-2 border-primary-foreground/60 border-t-primary-foreground rounded-full"
                  ></motion.div>
                  <span className="whitespace-nowrap">Start Typing Challenge</span>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-lg sm:text-xl md:text-2xl"
                  >
                    🚀
                  </motion.div>
                </div>
                
                {/* Particle effects on hover */}
                <div className="absolute inset-0 rounded-full overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-primary-foreground/60 rounded-full animate-ping"></div>
                  <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-primary-foreground/40 rounded-full animate-pulse"></div>
                  <div className="absolute bottom-1/3 left-1/4 w-1 h-1 bg-primary-foreground/40 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                </div>
              </motion.button>
            </motion.div>
          )}

          {gameState.isGameActive && !isGameComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative pointer-events-auto"
            >
              {/* Pulsing warning effect */}
              <div className="absolute inset-y-0 left-8 right-8"></div>
              
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 0 15px rgba(140, 69, 69, 0.4)"
                }}
                whileTap={{ scale: 0.95 }}
                onClick={stopGame}
                className="relative px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-destructive/90 backdrop-blur-sm border border-border text-primary-foreground rounded-full font-bold text-sm sm:text-base md:text-lg transition-all duration-300 hover:bg-destructive group"
              >
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="text-lg sm:text-xl"
                  >
                    ⏹️
                  </motion.div>
                  <span className="whitespace-nowrap">End Session</span>
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-base sm:text-lg"
                  >
                    ⚠️
                  </motion.div>
                </div>
                
                {/* Warning pulse effect */}
                <div className="absolute inset-0 rounded-full overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute top-1/2 left-1/2 w-3 h-3 bg-destructive/60 rounded-full animate-ping"></div>
                </div>
              </motion.button>
            </motion.div>
          )}

          {isGameComplete && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative pointer-events-auto"
            >
              {/* Celebration background effect */}
              <div className="absolute inset-y-0 left-8 right-8"></div>
              
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 0 15px rgba(69, 90, 120, 0.4)"
                }}
                whileTap={{ scale: 0.95 }}
                onClick={startGame}
                className="relative px-6 sm:px-8 md:px-12 py-3 sm:py-4 md:py-6 bg-primary/90 backdrop-blur-sm border border-border text-primary-foreground rounded-full font-bold text-sm sm:text-lg md:text-xl transition-all duration-300 hover:bg-primary group"
              >
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <motion.div
                    animate={{ 
                      rotate: [0, 360],
                      scale: [1, 1.1, 1]
                    }}
                    transition={{ 
                      rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                      scale: { duration: 1, repeat: Infinity }
                    }}
                    className="text-lg sm:text-xl md:text-2xl"
                  >
                    🎯
                  </motion.div>
                  <span className="whitespace-nowrap">Play Again with New Words</span>
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="text-lg sm:text-xl md:text-2xl"
                  >
                    🚀
                  </motion.div>
                </div>
                
                {/* Celebration particles */}
                <div className="absolute inset-0 rounded-full overflow-hidden opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <motion.div 
                    animate={{ 
                      y: [0, -20, 0],
                      opacity: [0, 1, 0]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute top-1/4 left-1/4 text-accent-foreground text-lg"
                  >
                    ✨
                  </motion.div>
                  <motion.div 
                    animate={{ 
                      y: [0, -15, 0],
                      opacity: [0, 1, 0]
                    }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                    className="absolute top-1/3 right-1/4 text-accent-foreground text-lg"
                  >
                    💫
                  </motion.div>
                </div>
              </motion.button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
} 