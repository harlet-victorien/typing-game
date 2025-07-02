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
  onStart: () => void;
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
          Type the words as they appear. Press the button to begin!
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
          Play Again
        </motion.button>
      </div>
    );
  }

  const isCorrect = value === targetWord.slice(0, value.length);
  const hasErrors = value.length > 0 && !isCorrect;

  return (
    <div className="flex flex-col items-center space-y-4">
      <motion.div
        className="relative"
        animate={{
          scale: hasErrors ? [1, 1.02, 1] : 1
        }}
        transition={{ duration: 0.2 }}
      >
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
                      className={`
            px-6 py-3 text-2xl font-mono text-center rounded-lg border-2 transition-all duration-200 
            bg-white dark:bg-gray-800 text-gray-900 dark:text-white w-96
            ${isCorrect ? 'border-green-500 focus:border-green-400' : ''}
            ${hasErrors ? 'border-red-500 focus:border-red-400' : ''}
            ${value.length === 0 ? 'border-gray-300 dark:border-gray-600 focus:border-blue-500' : ''}
            focus:outline-none focus:ring-2 focus:ring-opacity-50
            ${isCorrect ? 'focus:ring-green-500' : ''}
            ${hasErrors ? 'focus:ring-red-500' : ''}
            ${value.length === 0 ? 'focus:ring-blue-500' : ''}
          `}
          placeholder="Start typing..."
          autoComplete="off"
          spellCheck="false"
        />
        
        {hasErrors && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-red-600 dark:text-red-400 text-sm"
          >
            Incorrect! Use backspace to fix errors
          </motion.div>
        )}
      </motion.div>
      
      <div className="text-gray-600 dark:text-gray-400 text-sm">
        Progress: {value.length}/{targetWord.length}
      </div>
    </div>
  );
} 