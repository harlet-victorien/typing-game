'use client';

import { useEffect, useRef } from 'react';

interface WordInputProps {
  value: string;
  onChange: (value: string) => void;
  onKeyPress: (isCorrect: boolean) => void;
  onKeyDown: (key: string) => void;
  targetWord: string;
  isGameActive: boolean;
  isGameComplete: boolean;
}

export default function WordInput({
  value,
  onChange,
  onKeyPress,
  onKeyDown,
  targetWord,
  isGameActive,
  isGameComplete
}: WordInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isGameActive && !isGameComplete) {
      // Small delay to ensure the component is fully rendered
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isGameActive, isGameComplete]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    console.log('Input change:', { 
      newValue, 
      currentValue: value, 
      isGameActive, 
      isGameComplete,
      targetWord 
    });
    
    // Don't allow input longer than the target word
    if (newValue.length > targetWord.length) {
      console.log('Input too long, ignoring');
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
    // Call the parent's onKeyDown handler
    onKeyDown(e.key);
    
    // Allow backspace to correct mistakes
    if (e.key === 'Backspace') {
      return;
    }
    
    // Handle spacebar for word completion
    if (e.key === ' ') {
      e.preventDefault(); // Prevent space from being added to input
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
        {/* Empty state - no text needed */}
      </div>
    );
  }

  if (isGameComplete) {
    return (
      <div className="flex flex-col items-center space-y-4">
        {/* Empty state - no text needed */}
      </div>
    );
  }

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
        className="absolute opacity-0 -z-10"
        autoComplete="off"
        spellCheck="false"
        aria-label="Typing input"
      />
      
      {/* Progress and instructions */}
      <div className="flex flex-col items-center space-y-2">
        <div className="text-muted-foreground text-sm">
          Progress: {value.length}/{targetWord.length}
        </div>
      
      </div>
    </div>
  );
} 