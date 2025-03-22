// src/pages/RestPage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import RestSite from '../components/rest/RestSite';
import { useGame } from '../context/gameHooks';
import { useGameOverCheck } from '../hooks/useGameOverCheck';

const RestPage = () => {
  const { isGameOver } = useGameOverCheck();
  const navigate = useNavigate();
  const {
    purchaseShopItem,
    leaveShop,
    gameState,
    bonusCardSystem,
    completeRest,
  } = useGame();

  // Handle rest completion
  const handleRestComplete = (result) => {
    completeRest(result);
    navigate('/map');
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <RestSite
        playerStats={gameState.player}
        bonusCards={gameState.bonusCardCollection}
        onRestComplete={handleRestComplete}
        onClose={() => navigate('/map')}
      />
    </div>
  );
};

export default RestPage;
