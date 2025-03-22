// src/pages/CollectionPage.jsx
import React from 'react';
import BonusCardManager from '../components/card/BonusCardManager';
import Navigation from '../components/ui/Navigation';
import { useGameOverCheck } from '../hooks/useGameOverCheck';

const CollectionPage = () => {
  const { isGameOver } = useGameOverCheck();
  return (
    <div className="min-h-screen bg-gray-900 p-4 flex flex-col items-center">
      <div className="w-full max-w-4xl">
        <BonusCardManager />
      </div>
      <Navigation />
    </div>
  );
};

export default CollectionPage;
