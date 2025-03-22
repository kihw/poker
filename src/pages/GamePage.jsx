// src/pages/GamePage.jsx
import React from 'react';
import CombatInterface from '../components/combat/CombatInterface';
import Navigation from '../components/ui/Navigation';
import { useGame } from '../context/GameContext';

const GamePage = () => {
  const { gameState } = useGame();

  // Check if we're in a combat phase
  const isInCombat =
    gameState?.gamePhase === 'combat' || gameState?.gamePhase === 'reward';

  return (
    <div className="min-h-screen bg-gray-900 p-4 flex flex-col items-center justify-center">
      {isInCombat ? (
        <CombatInterface />
      ) : (
        <div className="text-white text-center">
          <h2 className="text-2xl mb-4">Pas de combat en cours</h2>
          <p>Rendez-vous à la carte pour commencer une nouvelle aventure</p>
        </div>
      )}
      <Navigation />
    </div>
  );
};

export default GamePage;
