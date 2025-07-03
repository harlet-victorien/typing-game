'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

interface CompletedWord {
  word: string;
  timestamp: number;
  isCorrect: boolean;
}

interface CompletedWordsProps {
  words: CompletedWord[];
}

export default function CompletedWords({ words }: CompletedWordsProps) {
  // Show last 5 completed words
  const visibleWords = words.slice(-5);
  const [hasWords, setHasWords] = useState(words.length > 0);

  // Track when we have words to prevent showing placeholder during exit animations
  useEffect(() => {
    if (words.length > 0) {
      setHasWords(true);
    } else {
      // Delay hiding placeholder to let exit animations complete
      const timer = setTimeout(() => {
        setHasWords(false);
      }, 500); // Wait for exit animation
      return () => clearTimeout(timer);
    }
  }, [words.length]);

  return (
    <div className="flex flex-col items-end space-y-2 min-w-[200px]">
      <AnimatePresence mode="popLayout">
        {visibleWords.map((completedWord, index) => {
          const isLatest = index === visibleWords.length - 1;

          return (
            <motion.div
              key={`${completedWord.word}-${completedWord.timestamp}`}
              initial={{ 
                opacity: 0, 
                x: 50, 
                scale: 0.8 
              }}
              animate={{ 
                opacity: [0, 1, 1, 0.2],
                x: 0,
                scale: isLatest ? 1 : 0.9 - (index * 0.1)
              }}
              exit={{ 
                opacity: 0, 
                x: -50, 
                scale: 0.8 
              }}
              transition={{ 
                opacity: {
                  duration: 10,
                  times: [0, 0.05, 0.9, 1],
                  ease: ["easeOut", "linear", "easeIn"]
                },
                x: { duration: 0.3, ease: "easeOut" },
                scale: { duration: 0.3, ease: "easeOut" },
                exit: { duration: 0.3 }
              }}
              className={`
                font-mono text-right transition-all duration-500
                ${completedWord.isCorrect 
                  ? isLatest ? 'text-2xl text-primary font-bold' : 
                    index === visibleWords.length - 2 ? 'text-xl text-primary/80' : 
                    'text-lg text-primary/60'
                  : isLatest ? 'text-2xl text-destructive font-bold' :
                    index === visibleWords.length - 2 ? 'text-xl text-destructive/80' :
                    'text-lg text-destructive/60'
                }
              `}
              style={{
                filter: isLatest ? 'none' : `blur(${(visibleWords.length - index - 1) * 0.5}px)`
              }}
            >
              {completedWord.word}
              {isLatest && (
                <motion.div
                  className="inline-block ml-2"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    rotate: [0, 10, -10, 0]
                  }}
                  transition={{ duration: 0.5 }}
                >
                  {completedWord.isCorrect ? '✓' : '✗'}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
      
      {!hasWords && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          className="text-muted-foreground font-mono text-lg"
        >
          Completed words appear here...
        </motion.div>
      )}
    </div>
  );
} 