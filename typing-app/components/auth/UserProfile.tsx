'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from './AuthProvider';
import { Button } from '../ui/button';
import { User } from 'lucide-react';

interface UserProfileProps {
  onShowProfile?: () => void;
}

export default function UserProfile({ onShowProfile }: UserProfileProps) {
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
        className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-sm hover:brightness-110 transition-all duration-200 border border-primary/20 focus:outline-none focus:ring-2 focus:ring-ring"
        aria-label="Open profile menu"
      >
        {user.email?.[0]?.toUpperCase() || <User className="w-6 h-6" />}
      </button>

      {isDropdownOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          className="absolute right-0 mt-3 w-64 bg-card rounded-xl shadow-xl border border-border z-50 backdrop-blur-sm"
        >
          <div className="p-5 border-b border-border">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground rounded-full flex items-center justify-center text-xl font-bold shadow-sm">
                {user.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <p className="text-base font-semibold text-foreground">
                  {user.email?.split('@')[0] || 'User'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.email}
                </p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="bg-muted/50 rounded-lg p-2 text-center">
                <div className="text-xs text-muted-foreground">Sessions</div>
                <div className="text-sm font-semibold text-foreground">-</div>
              </div>
              <div className="bg-muted/50 rounded-lg p-2 text-center">
                <div className="text-xs text-muted-foreground">Best WPM</div>
                <div className="text-sm font-semibold text-foreground">-</div>
              </div>
            </div>
          </div>
          
          <div className="p-3 space-y-2">
            {onShowProfile && (
              <Button
                onClick={() => {
                  onShowProfile();
                  setIsDropdownOpen(false);
                }}
                variant="default"
                size="sm"
                className="w-full justify-start"
              >
                📊 View Full Profile & Stats
              </Button>
            )}
            <Button
              onClick={handleSignOut}
              variant="outline"
              size="sm"
              className="w-full justify-start text-muted-foreground hover:text-foreground"
            >
              🚪 Sign Out
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
} 