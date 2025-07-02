'use client';

import { motion } from 'framer-motion';

interface CurrentWordProps {
  word: string;
  currentInput: string;
  isActive: boolean;
}

export default function CurrentWord({ word, currentInput, isActive }: CurrentWordProps) {
  return (
    <motion.div
      key={word}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="flex justify-center items-center"
    >
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
                ${status === 'correct' ? 'text-green-400' : ''}
                ${status === 'incorrect' ? 'text-red-400 bg-red-500/20' : ''}
                ${status === 'current' ? 'text-yellow-400' : ''}
                ${status === 'upcoming' ? 'text-gray-400' : ''}
              `}
              animate={{
                scale: status === 'current' ? 1.1 : 1,
              }}
              transition={{ duration: 0.2 }}
            >
              {letter}
              {status === 'current' && (
                <motion.div
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-yellow-400"
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </motion.span>
          );
        })}
      </div>
    </motion.div>
  );
} 