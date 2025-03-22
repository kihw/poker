// src/pages/GamePage.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/gameHooks';
import { useSaveGame } from '../context/gameHooks';
import { useGameOverCheck } from '../hooks/useGameOverCheck';
import Navigation from '../components/ui/Navigation';
import CombatInterface from '../components/combat/CombatInterface';

const GamePage = () => {
  const { gameState, resetGame } = useGame();
  const { deleteSave } = useSaveGame();
  const navigate = useNavigate();

  // Nous n'utilisons pas useGameOverCheck ici pour éviter les redirections automatiques
  const isGameOver = gameState?.gamePhase === 'gameOver';

  // Check if we're in a combat phase
  const isInCombat =
    gameState?.gamePhase === 'combat' || gameState?.gamePhase === 'reward';

  // Si on est en mode exploration, rediriger vers la carte
  React.useEffect(() => {
    if (gameState?.gamePhase === 'exploration') {
      navigate('/map');
    }
  }, [gameState?.gamePhase, navigate]);

  // Fonction de redémarrage du jeu
  const handleRestart = () => {
    if (resetGame) {
      resetGame();
      window.location.reload(); // Forcer un rechargement complet
    } else {
      // Fallback
      window.location.href = '/';
    }
  };

  // Fonction pour supprimer la sauvegarde et recommencer
  const handleDeleteSaveAndRestart = () => {
    if (deleteSave) {
      deleteSave();
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  // Si le jeu est en cours de chargement
  if (!gameState) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <div className="text-white text-xl">Chargement du jeu...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4 flex flex-col items-center justify-center">
      {/* Affichage du game over */}
      {isGameOver && (
        <div className="text-white text-center bg-gray-800 p-8 rounded-xl shadow-2xl">
          <h2 className="text-4xl mb-6 text-red-500 font-bold">GAME OVER</h2>
          <p className="mb-6 text-xl">Vous avez été vaincu!</p>

          <div className="bg-gray-700 p-4 rounded-lg mb-6 text-left">
            <h3 className="text-yellow-400 mb-2">État actuel du jeu:</h3>
            <p>
              Phase: <span className="text-red-400">{gameState.gamePhase}</span>
            </p>
            <p>Niveau: {gameState.stage}</p>
            <p>
              PV du joueur: {gameState.player.health}/
              {gameState.player.maxHealth}
            </p>
          </div>

          <div className="flex flex-col space-y-4">
            <button
              onClick={handleRestart}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded"
            >
              Recommencer une nouvelle partie
            </button>

            <button
              onClick={handleDeleteSaveAndRestart}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded"
            >
              Supprimer la sauvegarde et recommencer
            </button>
          </div>
        </div>
      )}

      {/* Affichage de l'interface de combat si en phase combat */}
      {isInCombat && !isGameOver && (
        <div className="w-full max-w-4xl">
          <CombatInterface />
        </div>
      )}

      {/* Afficher un message si ce n'est ni un combat ni un game over */}
      {!isInCombat && !isGameOver && (
        <div className="text-white text-center">
          <h2 className="text-2xl mb-4">Exploration</h2>
          <p className="mb-4">Retournez à la carte pour explorer le donjon</p>
          <button
            onClick={() => navigate('/map')}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded"
          >
            Voir la carte
          </button>
        </div>
      )}

      {/* Barre de navigation */}
      <Navigation />
    </div>
  );
};

export default GamePage;
