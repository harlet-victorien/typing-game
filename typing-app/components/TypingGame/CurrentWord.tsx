'use client';

import { motion } from 'framer-motion';

interface CurrentWordProps {
  word: string;
  currentInput: string;
  isActive: boolean;
  upcomingWords?: string[];
}

export default function CurrentWord({ word, currentInput, isActive, upcomingWords = [] }: CurrentWordProps) {
  return (
    <motion.div
      key={word}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="flex flex-col justify-center items-center space-y-6"
    >
      {/* Current Word - Largest */}
      <div className="text-6xl font-mono font-bold tracking-wider">
        {word.split('').map((letter, index) => {
          let status = 'upcoming';
          
          if (index < currentInput.length) {
            status = currentInput[index] === letter ? 'correct' : 'incorrect';
          } else if (index === currentInput.length && isActive) {
            status = 'current';
          }

          return (
            <motion.span
              key={`${word}-${index}`}
              className={`
                relative transition-all duration-200
                ${status === 'correct' ? 'text-green-600 dark:text-green-400' : ''}
                ${status === 'incorrect' ? 'text-red-600 dark:text-red-400 bg-red-500/20' : ''}
                ${status === 'current' ? 'text-yellow-600 dark:text-yellow-400' : ''}
                ${status === 'upcoming' ? 'text-gray-400 dark:text-gray-500' : ''}
              `}
              animate={{
                scale: status === 'current' ? 1.1 : 1,
              }}
              transition={{ duration: 0.2 }}
            >
              {letter}
              {status === 'current' && (
                <motion.div
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-yellow-600 dark:bg-yellow-400"
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </motion.span>
          );
        })}
      </div>

      {/* Next Word - Medium Size */}
      {upcomingWords[0] && (
        <motion.div 
          className="text-4xl font-mono font-medium tracking-wide text-gray-500 dark:text-gray-400 opacity-60"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.6, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {upcomingWords[0]}
        </motion.div>
      )}

      {/* Second Next Word - Small Size */}
      {upcomingWords[1] && (
        <motion.div 
          className="text-2xl font-mono tracking-wide text-gray-400 dark:text-gray-500 opacity-40"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.4, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {upcomingWords[1]}
        </motion.div>
      )}
    </motion.div>
  );
} 