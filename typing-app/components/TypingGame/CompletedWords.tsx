'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface CompletedWord {
  word: string;
  timestamp: number;
}

interface CompletedWordsProps {
  words: CompletedWord[];
}

export default function CompletedWords({ words }: CompletedWordsProps) {
  // Show last 5 completed words
  const visibleWords = words.slice(-5);

  return (
    <div className="flex flex-col items-end space-y-2 min-w-[200px]">
      <AnimatePresence mode="popLayout">
        {visibleWords.map((completedWord, index) => {
          const age = Date.now() - completedWord.timestamp;
          const opacity = Math.max(0.2, 1 - (age / 10000)); // Fade over 10 seconds
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
                opacity: isLatest ? 1 : opacity,
                x: 0,
                scale: isLatest ? 1 : 0.9 - (index * 0.1)
              }}
              exit={{ 
                opacity: 0, 
                x: -50, 
                scale: 0.8 
              }}
              transition={{ 
                duration: 0.3,
                ease: "easeOut"
              }}
              className={`
                font-mono text-right transition-all duration-500
                ${isLatest ? 'text-2xl text-green-400 font-bold' : ''}
                ${index === visibleWords.length - 2 ? 'text-xl text-green-300' : ''}
                ${index <= visibleWords.length - 3 ? 'text-lg text-green-200' : ''}
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
                  ✓
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
      
      {words.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          className="text-gray-500 font-mono text-lg"
        >
          Completed words appear here...
        </motion.div>
      )}
    </div>
  );
} 