// src/pages/GamePage.jsx - Migré vers Redux
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectGamePhase,
  selectIsGameOver,
} from '../redux/selectors/gameSelectors';
import { resetEntireGame, deleteSave } from '../redux/thunks/saveThunks';
import Navigation from '../components/ui/Navigation';
import CombatInterface from '../components/combat/CombatInterface';

const GamePage = () => {
  const gamePhase = useSelector(selectGamePhase);
  const isGameOver = useSelector(selectIsGameOver);
  const player = useSelector((state) => state.player);
  const stage = useSelector((state) => state.game.stage);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Check if we're in a combat phase
  const isInCombat = gamePhase === 'combat' || gamePhase === 'reward';

  // Redirection automatique vers la carte lorsqu'on est en phase 'reward'
  useEffect(() => {
    if (gamePhase === 'reward') {
      console.log(
        "Phase 'reward' détectée, redirection vers la carte dans 1 seconde"
      );

      // Utiliser un timeout pour laisser le temps aux animations de se terminer
      const timer = setTimeout(() => {
        // Rediriger vers la carte
        navigate('/map');
        console.log('Redirection vers la carte effectuée');
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [gamePhase, navigate]);

  // Si on est en mode exploration, rediriger vers la carte
  useEffect(() => {
    if (gamePhase === 'exploration') {
      navigate('/map');
    }
  }, [gamePhase, navigate]);

  // Fonction de redémarrage du jeu
  const handleRestart = () => {
    dispatch(resetEntireGame());
    window.location.reload(); // Forcer un rechargement complet
  };

  // Fonction pour supprimer la sauvegarde et recommencer
  const handleDeleteSaveAndRestart = () => {
    dispatch(deleteSave());
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

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
              Phase: <span className="text-red-400">{gamePhase}</span>
            </p>
            <p>Niveau: {stage}</p>
            <p>
              PV du joueur: {player.health}/{player.maxHealth}
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
