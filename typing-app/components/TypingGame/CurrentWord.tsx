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
      className="flex flex-col pt-20 items-center space-y-4 overflow-hidden max-h-[calc(60vh-4rem)]"
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
                ${status === 'correct' ? 'text-chart-2' : ''}
                ${status === 'incorrect' ? 'text-destructive bg-destructive/10' : ''}
                ${status === 'current' ? 'text-chart-4' : ''}
                ${status === 'upcoming' ? 'text-foreground' : ''}
              `}
              animate={{
                scale: status === 'current' ? 1.1 : 1,
              }}
              transition={{ duration: 0.2 }}
            >
              {letter}
              {status === 'current' && (
                <motion.div
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-chart-4"
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
          className="text-5xl font-mono font-medium tracking-wide text-foreground opacity-60"
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
          className="text-4xl font-mono tracking-wide text-foreground opacity-40"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.4, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {upcomingWords[1]}
        </motion.div>
      )}

      {/* Third Next Word - Smaller Size */}
      {upcomingWords[2] && (
        <motion.div 
          className="text-3xl font-mono tracking-wide text-foreground opacity-30"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.3, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          {upcomingWords[2]}
        </motion.div>
      )}

      {/* Fourth Next Word - Even Smaller Size */}
      {upcomingWords[3] && (
        <motion.div 
          className="text-2xl font-mono tracking-wide text-foreground opacity-25"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.25, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          {upcomingWords[3]}
        </motion.div>
      )}

      {/* Fifth Next Word - Smallest Size */}
      {upcomingWords[4] && (
        <motion.div 
          className="text-xl font-mono tracking-wide text-foreground opacity-20"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 0.2, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {upcomingWords[4]}
        </motion.div>
      )}
    </motion.div>
  );
} 