'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface WordInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyPress: (isCorrect: boolean) => void;
  targetWord: string;
  isGameActive: boolean;
  isGameComplete: boolean;
  onStart: () => Promise<void>;
}

export default function WordInput({
  value,
  onChange,
  onKeyPress,
  targetWord,
  isGameActive,
  isGameComplete,
  onStart
}: WordInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isGameActive && !isGameComplete) {
      inputRef.current?.focus();
    }
  }, [isGameActive, isGameComplete]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Don't allow input longer than the target word
    if (newValue.length > targetWord.length) {
      return;
    }
    
    // Allow all input changes (including incorrect characters)
    onChange(newValue);
    
    // Track keypress accuracy when typing (not backspacing)
    if (newValue.length > value.length) {
      const lastChar = newValue[newValue.length - 1];
      const targetChar = targetWord[newValue.length - 1];
      onKeyPress(lastChar === targetChar);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow backspace to correct mistakes
    if (e.key === 'Backspace') {
      return;
    }
    
    // Prevent typing beyond the word length
    if (value.length >= targetWord.length && e.key !== 'Backspace') {
      e.preventDefault();
    }
  };

  if (!isGameActive && !isGameComplete) {
    return (
      <div className="flex flex-col items-center space-y-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
          className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-xl transition-colors"
        >
          Start Typing Game
        </motion.button>
        <p className="text-gray-600 dark:text-gray-400 text-center">
          Just start typing! Watch the word above change colors as you type.<br />
          Fresh words loaded each game!
        </p>
      </div>
    );
  }

  if (isGameComplete) {
    return (
      <div className="flex flex-col items-center space-y-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onStart}
          className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold text-xl transition-colors"
        >
          Play Again with New Words
        </motion.button>
      </div>
    );
  }

  const isCorrect = value === targetWord.slice(0, value.length);
  const hasErrors = value.length > 0 && !isCorrect;

    const handleFocus = () => {
    if (isGameActive && !isGameComplete) {
      inputRef.current?.focus();
    }
  };

  return (
    <div 
      className="flex flex-col items-center space-y-4 cursor-text" 
      onClick={handleFocus}
    >
      {/* Hidden input field - invisible but captures keystrokes */}
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className="absolute opacity-0 pointer-events-none -z-10"
        autoComplete="off"
        spellCheck="false"
        aria-label="Typing input"
      />
      
      {/* Progress and instructions */}
      <div className="flex flex-col items-center space-y-2">
        <div className="text-gray-600 dark:text-gray-400 text-sm">
          Progress: {value.length}/{targetWord.length}
        </div>
        
        <div className="text-center text-gray-500 dark:text-gray-500 text-xs">
          Just start typing - no input field needed!
        </div>
        
        {hasErrors && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-600 dark:text-red-400 text-sm"
          >
            Incorrect! Use backspace to fix errors
          </motion.div>
        )}
      </div>
    </div>
  );
} 