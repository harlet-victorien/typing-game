'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface CompletedWord {
  word: string;
  timestamp: number;
  isCorrect: boolean;
}

interface CurrentWordProps {
  wordList: string[];
  currentWordIndex: number;
  currentInput: string;
  isActive: boolean;
  completedWords: CompletedWord[];
  isGameComplete?: boolean;
}

interface Line {
  words: string[];
  wordIndices: number[];
  isCompleted: boolean;
}

export default function CurrentWord({ 
  wordList, 
  currentWordIndex, 
  currentInput, 
  isActive, 
  completedWords,
  isGameComplete = false
}: CurrentWordProps) {
  const [lines, setLines] = useState<Line[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);

  // Calculate words per line based on screen width and word length
  // Assuming average word length and container width
  const WORDS_PER_LINE = 12;
  const MAX_VISIBLE_LINES = 4;

  // Generate lines from word list
  useEffect(() => {
    const newLines: Line[] = [];
    for (let i = 0; i < wordList.length; i += WORDS_PER_LINE) {
      const lineWords = wordList.slice(i, i + WORDS_PER_LINE);
      const wordIndices = Array.from({ length: lineWords.length }, (_, idx) => i + idx);
      newLines.push({
        words: lineWords,
        wordIndices,
        isCompleted: false
      });
    }
    setLines(newLines);
  }, [wordList]);

  // Update current line and completion status
  useEffect(() => {
    if (lines.length === 0) return;

    const newCurrentLineIndex = Math.floor(currentWordIndex / WORDS_PER_LINE);
    setCurrentLineIndex(newCurrentLineIndex);

    // Mark completed lines
    setLines(prevLines => 
      prevLines.map((line, index) => ({
        ...line,
        isCompleted: index < newCurrentLineIndex
      }))
    );
  }, [currentWordIndex, lines.length]);

  const getWordStatus = (wordIndex: number) => {
    if (wordIndex < currentWordIndex) {
      const completedWord = completedWords[wordIndex];
      return completedWord?.isCorrect ? 'completed-correct' : 'completed-incorrect';
    } else if (wordIndex === currentWordIndex) {
      return 'current';
    } else {
      return 'upcoming';
    }
  };

  const getCurrentLetterStatus = (word: string, letterIndex: number) => {
    if (letterIndex < currentInput.length) {
      return currentInput[letterIndex] === word[letterIndex] ? 'correct' : 'incorrect';
    } else if (letterIndex === currentInput.length && isActive) {
      return 'current';
    }
    return 'upcoming';
  };

  // Show only started lines in completion view
  if (isGameComplete) {
    // Filter to show only lines that have been started (up to current line + 1)
    const completedAndCurrentLines = lines.slice(0, currentLineIndex + 1);
    
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="pt-20 px-8 max-w-screen mx-auto h-[60vh] overflow-y-auto"
      >
        <div className="space-y-4">
          {completedAndCurrentLines.map((line, lineIndex) => (
            <div key={lineIndex} className="text-lg font-mono leading-relaxed">
              {line.words.map((word, wordInLineIndex) => {
                const globalWordIndex = line.wordIndices[wordInLineIndex];
                const wordStatus = getWordStatus(globalWordIndex);
                
                return (
                  <span
                    key={`${word}-${globalWordIndex}`}
                    className={`
                      inline-block px-1 py-0.5 mx-0.5 rounded
                      ${wordStatus === 'completed-correct' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : ''}
                      ${wordStatus === 'completed-incorrect' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' : ''}
                      ${wordStatus === 'current' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' : ''}
                      ${wordStatus === 'upcoming' ? 'text-muted-foreground' : ''}
                    `}
                  >
                    {word}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  // Main typing view - show limited lines with current line prominent
  const startLineIndex = Math.max(0, currentLineIndex);
  const visibleLines = lines.slice(startLineIndex, startLineIndex + MAX_VISIBLE_LINES);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pt-20 px-8 max-w-screen mx-auto"
    >
      <div className="space-y-6">
        {visibleLines.map((line, lineIndexInVisible) => {
          const actualLineIndex = startLineIndex + lineIndexInVisible;
          const isCurrentLine = actualLineIndex === currentLineIndex;
          
          return (
            <motion.div
              key={actualLineIndex}
              className={`
                text-2xl font-mono leading-relaxed transition-all duration-300
                ${isCurrentLine ? 'opacity-100' : 'opacity-50'}
                ${line.isCompleted ? 'opacity-30' : ''}
              `}
              animate={{
                y: line.isCompleted ? -20 : 0,
                opacity: line.isCompleted ? 0.3 : isCurrentLine ? 1 : 0.5
              }}
              transition={{ duration: 0.5 }}
            >
              {line.words.map((word: string, wordInLineIndex: number) => {
                const globalWordIndex = line.wordIndices[wordInLineIndex];
                const wordStatus = getWordStatus(globalWordIndex);
                const isCurrentWord = globalWordIndex === currentWordIndex;

                return (
                  <motion.span
                    key={`${word}-${globalWordIndex}`}
                    className={`
                      inline-block transition-all duration-200 px-1 py-0.5 mx-0.5 rounded
                      ${wordStatus === 'completed-correct' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : ''}
                      ${wordStatus === 'completed-incorrect' ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' : ''}
                      ${wordStatus === 'current' ? 'bg-blue-50 text-blue-800 border border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-700' : ''}
                      ${wordStatus === 'upcoming' ? 'text-gray-600 dark:text-gray-400' : ''}
                    `}
                    animate={{
                      scale: isCurrentWord ? 1.05 : 1,
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {isCurrentWord ? (
                      // Current word with letter-by-letter coloring
                      word.split('').map((letter: string, letterIndex: number) => {
                        const letterStatus = getCurrentLetterStatus(word, letterIndex);
                        
                        return (
                          <motion.span
                            key={`${word}-${globalWordIndex}-${letterIndex}`}
                            className={`
                              relative
                              ${letterStatus === 'correct' ? 'text-green-600 dark:text-green-400' : ''}
                              ${letterStatus === 'incorrect' ? 'text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30' : ''}
                              ${letterStatus === 'current' ? 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30' : ''}
                              ${letterStatus === 'upcoming' ? 'text-gray-800 dark:text-gray-200' : ''}
                            `}
                            animate={{
                              scale: letterStatus === 'current' ? 1.1 : 1,
                            }}
                            transition={{ duration: 0.2 }}
                          >
                            {letter}
                            {letterStatus === 'current' && (
                              <motion.div
                                className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-500"
                                animate={{ opacity: [1, 0, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                              />
                            )}
                          </motion.span>
                        );
                      })
                    ) : (
                      // Completed or upcoming words
                      <span>{word}</span>
                    )}
                  </motion.span>
                );
              })}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
} 