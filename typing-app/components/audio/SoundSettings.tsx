'use client';

import { useState } from 'react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-96 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Sound Settings
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>

        {/* Enable/Disable Audio */}
        <div className="space-y-2">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="rounded"
            />
            <span>Enable keyboard sounds</span>
          </label>
        </div>

        {/* Volume Control */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Volume</span>
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
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>{Math.round(localVolume * 100)}%</span>
              <span>100%</span>
            </div>
          </div>
        </div>

        {/* Sound Preview */}
        <div className="space-y-2">
          <span className="text-sm font-medium">Test Sounds</span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={playKeystroke}
              disabled={!isEnabled}
            >
              Key Press
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={playSpace}
              disabled={!isEnabled}
            >
              Spacebar
            </Button>
          </div>
        </div>

        {/* Info */}
        <div className="text-xs text-muted-foreground bg-muted p-3 rounded-lg">
          <p><strong>Tip:</strong> Keyboard sounds enhance the typing experience and provide audio feedback for each keystroke.</p>
        </div>
      </Card>
    </div>
  );
} 