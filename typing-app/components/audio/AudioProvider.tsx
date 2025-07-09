'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

interface AudioContextType {
  isEnabled: boolean;
  volume: number;
  isMuted: boolean;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  setEnabled: (enabled: boolean) => void;
  playKeystroke: () => void;
  playSpace: () => void;
  playError: () => void;
  playComplete: () => void;
}

const AudioContext = createContext<AudioContextType | null>(null);

interface AudioBufferPool {
  buffer: AudioBuffer | null;
  sources: AudioBufferSourceNode[];
  maxSources: number;
}

interface AudioProviderProps {
  children: React.ReactNode;
}

export function AudioProvider({ children }: AudioProviderProps) {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [gainNode, setGainNode] = useState<GainNode | null>(null);
  const [audioBuffers, setAudioBuffers] = useState<Map<string, AudioBufferPool>>(new Map());
  const [isEnabled, setIsEnabled] = useState(true);
  const [volume, setVolumeState] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Audio files mapping
  const soundFiles = {
    keystroke: ['/sounds/keystroke-1.mp3', '/sounds/keystroke-2.mp3', '/sounds/keystroke-3.mp3'],
    space: ['/sounds/space.mp3'],
    error: ['/sounds/error.mp3'],
    complete: ['/sounds/complete.mp3']
  };

  // Initialize audio context and load sounds
  const initializeAudio = useCallback(async () => {
    if (isInitialized || !isEnabled) return;

    try {
      // Create audio context
      const ctx = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const gain = ctx.createGain();
      gain.connect(ctx.destination);
      gain.gain.value = isMuted ? 0 : volume;

      setAudioContext(ctx);
      setGainNode(gain);

      // Load and decode audio files
      const bufferMap = new Map<string, AudioBufferPool>();

      for (const [soundType, files] of Object.entries(soundFiles)) {
        for (let i = 0; i < files.length; i++) {
          const soundKey = files.length > 1 ? `${soundType}-${i}` : soundType;
          
          try {
            const response = await fetch(files[i]);
            const arrayBuffer = await response.arrayBuffer();
            const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
            
            bufferMap.set(soundKey, {
              buffer: audioBuffer,
              sources: [],
              maxSources: soundType === 'keystroke' ? 10 : 3 // More sources for keystrokes
            });
          } catch {
            console.warn(`Failed to load sound: ${files[i]}`);
          }
        }
      }

      setAudioBuffers(bufferMap);
      setIsInitialized(true);
    } catch (error) {
      console.warn('Failed to initialize audio:', error);
      setIsEnabled(false);
    }
  }, [isInitialized, isEnabled, volume, isMuted]);

  // Play sound with pooling
  const playSound = useCallback((soundKey: string) => {
    if (!isEnabled || isMuted || !audioContext || !gainNode || !isInitialized) return;

    const audioBuffer = audioBuffers.get(soundKey);
    if (!audioBuffer?.buffer) return;

    // Create new audio source for each play (simple and reliable)
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer.buffer;
    source.connect(gainNode);
    
    try {
      source.start(0);
    } catch {
      // Failed to start, ignore (rare edge case)
      console.warn('Failed to start audio source');
    }
  }, [isEnabled, isMuted, audioContext, gainNode, audioBuffers, isInitialized]);

  // Sound effect functions
  const playKeystroke = useCallback(() => {
    // Randomize keystroke sounds to prevent monotony
    const randomIndex = Math.floor(Math.random() * 3);
    playSound(`keystroke-${randomIndex}`);
  }, [playSound]);

  const playSpace = useCallback(() => {
    playSound('space');
  }, [playSound]);

  const playError = useCallback(() => {
    playSound('error');
  }, [playSound]);

  const playComplete = useCallback(() => {
    playSound('complete');
  }, [playSound]);

  // Volume control
  const setVolume = useCallback((newVolume: number) => {
    setVolumeState(newVolume);
    if (gainNode && !isMuted) {
      gainNode.gain.value = newVolume;
    }
  }, [gainNode, isMuted]);

  // Mute toggle
  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const newMuted = !prev;
      if (gainNode) {
        gainNode.gain.value = newMuted ? 0 : volume;
      }
      return newMuted;
    });
  }, [gainNode, volume]);

  // Enable/disable audio
  const setEnabled = useCallback((enabled: boolean) => {
    setIsEnabled(enabled);
    if (enabled && !isInitialized) {
      initializeAudio();
    }
  }, [isInitialized, initializeAudio]);

  // Initialize on first user interaction
  useEffect(() => {
    if (isEnabled && !isInitialized) {
      const handleFirstInteraction = () => {
        initializeAudio();
        document.removeEventListener('click', handleFirstInteraction);
        document.removeEventListener('keydown', handleFirstInteraction);
      };

      document.addEventListener('click', handleFirstInteraction);
      document.addEventListener('keydown', handleFirstInteraction);

      return () => {
        document.removeEventListener('click', handleFirstInteraction);
        document.removeEventListener('keydown', handleFirstInteraction);
      };
    }
  }, [isEnabled, isInitialized, initializeAudio]);

  const value: AudioContextType = {
    isEnabled,
    volume,
    isMuted,
    setVolume,
    toggleMute,
    setEnabled,
    playKeystroke,
    playSpace,
    playError,
    playComplete
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
} 