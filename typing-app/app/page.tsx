'use client';

import { useState } from 'react';
import TypingGame from "../components/TypingGame/TypingGame";
import ProfilePage from "../components/ProfilePage";

export default function Home() {
  const [currentView, setCurrentView] = useState<'game' | 'profile'>('game');

  const showProfile = () => setCurrentView('profile');
  const showGame = () => setCurrentView('game');

  return (
    <>
      {currentView === 'game' && <TypingGame onShowProfile={showProfile} />}
      {currentView === 'profile' && <ProfilePage onBackToGame={showGame} />}
    </>
  );
}
