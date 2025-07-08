'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import CurrentWord from './CurrentWord';
import WordInput from './WordInput';
import { ThemeToggle } from '../ThemeToggle';
import { useAuth } from '../auth/AuthProvider';
import AuthModal from '../auth/AuthModal';
import UserProfile from '../auth/UserProfile';
import Leaderboard from '../Leaderboard';
import ThemeSelector from '../ThemeSelector';
import { Button } from '../ui/button';
import { ChartLineDefault } from '../LineChart';
import { Card } from '../ui/card';
import { CardFooter } from '@/components/ui/card';

// Default fallback words in case API fails
const FALLBACK_WORDS = [
  'javascript', 'typescript', 'react', 'nextjs', 'framer', 'motion',
  'animation', 'component', 'useState', 'useEffect', 'tailwind',
  'programming', 'developer', 'frontend', 'backend', 'fullstack',
  'nodejs', 'express', 'mongodb', 'postgresql', 'firebase',
  'vercel', 'github', 'coding', 'algorithms', 'functions'
];

// WPM tracking interval in seconds - change this to adjust how often WPM data points are recorded
const WPM_TRACKING_INTERVAL = 5;

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

interface WPMDataPoint {
  time: number;
  wpm: number;
}

interface WordsResponse {
  words: string[];
  count: number;
  theme: string;
  timestamp: string;
}

// Helper function to get theme display name
const getThemeName = (themeId: string): string => {
  const themeMap: Record<string, string> = {
    'default': 'Default',
    'programming': 'Programming',
    'animals': 'Animals',
    'python': 'Python',
    'nextjs': 'Next.js',
    'french': 'Français'
  };
  return themeMap[themeId] || themeId;
};

interface TypingGameProps {
  onShowProfile?: () => void;
}

export default function TypingGame({ onShowProfile }: TypingGameProps) {
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
  const [chartData, setChartData] = useState<WPMDataPoint[]>([{ time: 0, wpm: 50 }]);
  const gameStateRef = useRef(gameState);

  // Update the ref whenever gameState changes
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const currentWord = wordList[gameState.currentWordIndex];
  const isGameComplete = gameState.timeRemaining === 0;

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

  // Fetch words when component mounts or theme changes
  useEffect(() => {
    fetchWords(selectedTheme);
  }, [selectedTheme, fetchWords]);

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
    setChartData([{ time: 0, wpm: 50 }]); // Reset chart data
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
        time_duration: 60 - finalGameState.timeRemaining, // Actual time played
        theme: selectedTheme
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
  }, [user, scoreSaved, savingScore, selectedTheme]);

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
    setChartData([{ time: 0, wpm: 50 }]); // Reset chart data
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

  // WPM tracking effect - record WPM every 5 seconds
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (gameState.isGameActive && gameState.hasStartedTyping) {
      interval = setInterval(() => {
        const currentState = gameStateRef.current;
        if (currentState.timeRemaining > 0 && currentState.isGameActive) {
          const timeElapsed = (60 - currentState.timeRemaining) / 60; // in minutes
          const correctWords = currentState.completedWords.filter(word => word.isCorrect).length;
          const wpm = timeElapsed > 0 ? Math.round(correctWords / timeElapsed) : 0;
          const currentTime = 60 - currentState.timeRemaining; // seconds elapsed
          
                    console.log('Adding WPM data point:', { time: currentTime, wpm, correctWords, timeElapsed });
          setChartData(prev => {
            const newData = [...prev, { time: currentTime, wpm }];
            console.log('Chart data updated with', newData.length, 'data points');
            return newData;
          });
          }
        }, WPM_TRACKING_INTERVAL * 1000); // Convert seconds to milliseconds
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [gameState.isGameActive, gameState.hasStartedTyping]); // Simplified dependencies

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
      
      // Add final WPM point at 60 seconds
      const correctWords = gameState.completedWords.filter(word => word.isCorrect).length;
      const wpm = Math.round(correctWords / 1); // 1 minute elapsed
      console.log('Adding final WPM data point:', { time: 60, wpm, correctWords });
      setChartData(prev => {
        const newData = [...prev, { time: 60, wpm }];
        console.log('Chart data updated with', newData.length, 'data points');
        return newData;
      });
      
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
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-8 transition-colors duration-200 relative overflow-hidden">

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
              <UserProfile onShowProfile={onShowProfile} />
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

        {/* Game Controls - Absolutely centered on screen */}
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-20">
          {!gameState.isGameActive && !isGameComplete && (
            <Button
              onClick={startGame}
              variant="default"
              size="lg"
            >
              🚀 Start Typing Challenge
            </Button>
          )}

          {gameState.isGameActive && !isGameComplete && (
            <Button
              onClick={stopGame}
              variant="destructive"
              size="lg"
            >
              ⏹️ End Session
            </Button>
          )}

          {isGameComplete && (
            <Button
              onClick={startGame}
              variant="default"
              size="lg"
            >
              🎯 Play Again
            </Button>
          )}
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
         <div className="flex flex-col items-center justify-center h-[calc(40vh-4rem)] relative mt-12">
              <div className="w-full h-full">
                <Card className="w-full h-full border-none bg-transparent shadow-none backdrop-blur-none">
                  <ChartLineDefault data={chartData} />
                  <CardFooter className="flex justify-center space-x-12">
                    <p className="text-sm text-muted-foreground">Theme : {getThemeName(selectedTheme)}</p>
                    <p className="text-sm text-muted-foreground">WPM : {(() => {
                      const timeElapsed = (60 - gameState.timeRemaining) / 60;
                      const correctWords = gameState.completedWords.filter(word => word.isCorrect).length;
                      return timeElapsed > 0 ? Math.round(correctWords / timeElapsed) : 0;
                    })()}</p>
                    <p className="text-sm text-muted-foreground">Accuracy : {(() => {
                      return gameState.totalKeystrokes > 0 
                        ? Math.round(((gameState.totalKeystrokes - gameState.errors) / gameState.totalKeystrokes) * 100)
                        : 100;
                    })()}%</p>
                    <p className="text-sm text-muted-foreground">Errors : {gameState.errors} / {gameState.totalKeystrokes}</p>
                  </CardFooter> 
                </Card>
              </div>
             </div>



          {/* Words Loading/Error Status - Only show errors */}
          {wordsError && (
            <div className="text-center mb-4">
              <div className="text-yellow-200 text-sm bg-yellow-900/20 backdrop-blur-sm px-4 py-2 rounded-lg border border-yellow-400/30">
                {wordsError}
              </div>
            </div>
          )}

          {/* Main typing area - paragraph view */}
          <div className="flex justify-center min-h-[calc(60vh)] relative mt-8 overflow-hidden">
            {/* Line-based word display */}
            <CurrentWord 
              wordList={wordList}
              currentWordIndex={gameState.currentWordIndex}
              currentInput={gameState.currentInput}
              isActive={gameState.isGameActive}
              completedWords={gameState.completedWords}
              isGameComplete={isGameComplete}
            />
          </div>

          {/* Hidden input for capturing keystrokes */}
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


    </div>
  );
} 