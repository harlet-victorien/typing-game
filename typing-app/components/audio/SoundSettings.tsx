'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../ui/button';
import { useAudio } from './AudioProvider';
import { Volume2, VolumeX, Settings } from 'lucide-react';

interface SoundSettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SoundSettings({ isOpen, onClose }: SoundSettingsProps) {
  const { volume, setVolume, isMuted, toggleMute, isEnabled, setEnabled, playKeystroke, playSpace } = useAudio();
  const [localVolume, setLocalVolume] = useState(volume);

  if (!isOpen) return null;

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setLocalVolume(newVolume);
    setVolume(newVolume);
  };

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
        className="bg-card backdrop-blur-lg p-8 rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[80vh] overflow-y-auto border border-border"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              🔊 Sound Settings
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Customize your typing experience
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Enable/Disable Audio */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between p-4 rounded-lg border bg-secondary border-border">
            <div className="flex items-center space-x-3">
              <Settings className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="font-medium text-foreground">Enable Sounds</div>
                <div className="text-sm text-muted-foreground">Keyboard feedback</div>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isEnabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-background after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-chart-1"></div>
            </label>
          </div>
        </div>

        {/* Volume Control */}
        <div className="space-y-4 mb-6">
          <div className="p-4 rounded-lg border bg-secondary border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                {isMuted ? <VolumeX className="w-5 h-5 text-muted-foreground" /> : <Volume2 className="w-5 h-5 text-muted-foreground" />}
                <div>
                  <div className="font-medium text-foreground">Volume</div>
                  <div className="text-sm text-muted-foreground">{Math.round(localVolume * 100)}%</div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="p-2"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
            </div>
            
            <div className="space-y-2">
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={localVolume}
                onChange={handleVolumeChange}
                disabled={!isEnabled || isMuted}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sound Preview */}
        <div className="space-y-4 mb-6">
          <div className="p-4 rounded-lg border bg-secondary border-border">
            <div className="mb-4">
              <div className="font-medium text-foreground">Test Sounds</div>
              <div className="text-sm text-muted-foreground">Preview your settings</div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={playKeystroke}
                disabled={!isEnabled}
                className="flex-1"
              >
                Key Press
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={playSpace}
                disabled={!isEnabled}
                className="flex-1"
              >
                Spacebar
              </Button>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg border border-border">
          <p><strong>💡 Tip:</strong> Keyboard sounds enhance the typing experience and provide audio feedback for each keystroke.</p>
        </div>
      </motion.div>
    </div>
  );
} 