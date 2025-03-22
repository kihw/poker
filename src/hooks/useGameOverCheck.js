// src/hooks/useGameOverCheck.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/gameHooks';

export function useGameOverCheck() {
  const { gameState } = useGame();
  const navigate = useNavigate();

  useEffect(() => {
    // Si le jeu est terminé, rediriger vers la page principale
    if (
      gameState &&
      (gameState.gamePhase === 'gameOver' || gameState.isGameOver)
    ) {
      console.log(
        'État Game Over détecté, redirection vers la page principale'
      );
      navigate('/');
    }
  }, [gameState, navigate]);

  return {
    isGameOver: gameState?.gamePhase === 'gameOver' || gameState?.isGameOver,
  };
}
