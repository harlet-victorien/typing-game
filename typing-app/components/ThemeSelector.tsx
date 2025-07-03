'use client';

import { motion } from 'framer-motion';

interface ThemeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: string;
  onThemeChange: (theme: string) => void;
}

const AVAILABLE_THEMES = [
  { 
    id: 'default', 
    name: 'Default', 
    description: 'Most common English words',
    emoji: '📚',
    color: 'from-blue-500 to-purple-500'
  },
  { 
    id: 'programming', 
    name: 'Programming', 
    description: 'Code-related terms and concepts',
    emoji: '💻',
    color: 'from-green-500 to-teal-500'
  },
  { 
    id: 'animals', 
    name: 'Animals', 
    description: 'Wildlife and domestic animals',
    emoji: '🦁',
    color: 'from-orange-500 to-red-500'
  },
  { 
    id: 'python', 
    name: 'Python', 
    description: 'Python programming language terms',
    emoji: '🐍',
    color: 'from-yellow-500 to-green-500'
  },
  { 
    id: 'nextjs', 
    name: 'Next.js', 
    description: 'Next.js and React framework terms',
    emoji: '⚡',
    color: 'from-gray-600 to-blue-600'
  },
  { 
    id: 'french', 
    name: 'Français', 
    description: 'Most commonly used French words',
    emoji: '🇫🇷',
    color: 'from-blue-600 to-red-600'
  }
];

export default function ThemeSelector({ isOpen, onClose, currentTheme, onThemeChange }: ThemeSelectorProps) {
  const handleThemeSelect = (themeId: string) => {
    onThemeChange(themeId);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-background/30 backdrop-blur-lg flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-card backdrop-blur-lg p-8 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto border border-border"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              🎨 Select Theme
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Choose a word theme for your typing practice
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-2">
          {AVAILABLE_THEMES.map((theme, index) => (
            <motion.div
              key={theme.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => handleThemeSelect(theme.id)}
              className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all hover:bg-accent/20 ${
                currentTheme === theme.id
                  ? 'bg-accent/20 border-accent'
                  : 'bg-secondary border-border'
              }`}
            >
              <div className="flex items-center space-x-4">
                <div className="text-2xl">
                  {theme.emoji}
                </div>
                <div>
                  <div className="font-medium text-foreground">
                    {theme.name}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {theme.description}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {currentTheme === theme.id && (
                  <div className="text-sm text-accent font-medium">
                    Selected
                  </div>
                )}
                <div className="w-2 h-2 rounded-full bg-gradient-to-r bg-muted-foreground opacity-60"></div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
