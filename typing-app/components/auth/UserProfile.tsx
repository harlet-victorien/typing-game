'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from './AuthProvider';
import { Button } from '../ui/button';

export default function UserProfile() {
  const { user, signOut } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  if (!user) return null;

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
      >
        <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
          {user.email?.[0]?.toUpperCase() || 'U'}
        </div>
        <span className="text-sm text-gray-700 dark:text-gray-300">
          {user.email}
        </span>
      </button>

      {isDropdownOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
        >
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Signed in as
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {user.email}
            </p>
          </div>
          <div className="p-2">
            <Button
              onClick={handleSignOut}
              variant="secondary"
              className="w-full justify-start"
            >
              Sign Out
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
} 