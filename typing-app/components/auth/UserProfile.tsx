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
        className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors"
      >
        <div className="w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
          {user.email?.[0]?.toUpperCase() || 'U'}
        </div>
        <span className="text-sm text-foreground">
          {user.email}
        </span>
      </button>

      {isDropdownOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute right-0 mt-2 w-48 bg-card rounded-lg shadow-lg border border-border z-50"
        >
          <div className="p-4 border-b border-border">
            <p className="text-sm font-medium text-foreground">
              Signed in as
            </p>
            <p className="text-sm text-muted-foreground truncate">
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