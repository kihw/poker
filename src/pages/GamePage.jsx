// src/pages/GamePage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import CombatInterface from '../components/combat/CombatInterface';
import Navigation from '../components/ui/Navigation';
import { useGame } from '../context/gameHooks';

const GamePage = () => {
  const { gameState } = useGame();
  const navigate = useNavigate();

  // Check if we're in a combat phase
  const isInCombat =
    gameState?.gamePhase === 'combat' || gameState?.gamePhase === 'reward';

  // Si on est en mode exploration, rediriger vers la carte
  React.useEffect(() => {
    if (gameState?.gamePhase === 'exploration') {
      navigate('/map');
    }
  }, [gameState?.gamePhase, navigate]);

  return (
    <div className="min-h-screen bg-gray-900 p-4 flex flex-col items-center justify-center">
      {isInCombat ? (
        <CombatInterface />
      ) : (
        <div className="text-white text-center">
          <h2 className="text-2xl mb-4">Pas de combat en cours</h2>
          <p>Rendez-vous à la carte pour commencer une nouvelle aventure</p>
          <button
            onClick={() => navigate('/map')}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded"
          >
            Aller à la carte
          </button>
        </div>
      )}
      <Navigation />
    </div>
  );
};

export default GamePage;
