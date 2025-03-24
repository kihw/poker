// src/pages/GamePage.jsx - Correction pour la phase de récompense

import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectGamePhase, selectIsGameOver } from '../redux/selectors/gameSelectors';
import { resetEntireGame, deleteSave } from '../redux/thunks/saveThunks';
import { setGamePhase } from '../redux/slices/gameSlice';
import Navigation from '../components/ui/Navigation';
import CombatInterface from '../components/combat/CombatInterface';
import { useNavigate, useLocation } from 'react-router-dom';
const GamePage = () => {
  const gamePhase = useSelector(selectGamePhase);
  const isGameOver = useSelector(selectIsGameOver);
  const player = useSelector((state) => state.player);
  const stage = useSelector((state) => state.game.stage);
  const combatState = useSelector((state) => state.combat);

  const [hasRedirected, setHasRedirected] = useState(false);
  const [showDebugInfo, setShowDebugInfo] = useState(false);
  const [rewardScreenVisible, setRewardScreenVisible] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Check if we're in a combat phase
  const isInCombat = gamePhase === 'combat';
  const isInReward = gamePhase === 'reward';

  // Gérer l'affichage du screen de récompense
  useEffect(() => {
    // Si on entre en phase de récompense, afficher l'écran
    if (gamePhase === 'reward') {
      setRewardScreenVisible(true);
    } else {
      // Réinitialiser lorsqu'on quitte la phase de récompense
      setRewardScreenVisible(false);
      setHasRedirected(false);
    }
  }, [gamePhase]);

  // Redirection automatique vers la carte après un délai en phase 'reward'
  useEffect(() => {
    // Seulement si l'écran de récompense est visible et qu'on n'a pas déjà redirigé
    if (rewardScreenVisible && !hasRedirected) {
      console.log("Phase 'reward' détectée, redirection vers la carte dans 3 secondes");

      // Marquer qu'une redirection a déjà été initiée
      setHasRedirected(true);

      // Utiliser un timeout plus long pour permettre de voir les récompenses
      const timer = setTimeout(() => {
        // Passer à la phase d'exploration explicitement
        dispatch(setGamePhase('exploration'));

        // Rediriger vers la carte
        navigate('/map');
        console.log('Redirection vers la carte effectuée');
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [rewardScreenVisible, hasRedirected, navigate, dispatch]);

  // Si on est en mode exploration, rediriger vers la carte
  useEffect(() => {
    if (gamePhase === 'exploration' && location.pathname === '/') {
      navigate('/map');
    }
  }, [gamePhase, navigate]);

  // Fonction de redémarrage du jeu
  const handleRestart = () => {
    dispatch(resetEntireGame());
    window.location.reload();
  };

  // Fonction pour supprimer la sauvegarde et recommencer
  const handleDeleteSaveAndRestart = () => {
    dispatch(deleteSave());
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  // Fonction pour continuer après la récompense
  const handleContinueAfterReward = () => {
    dispatch(setGamePhase('exploration'));
    navigate('/map');
  };

  // Informations de débogage pour le combat
  const renderDebugInfo = () => {
    if (!showDebugInfo) return null;

    return (
      <div className="bg-gray-800 p-4 rounded-lg mt-4 text-xs overflow-auto max-h-60">
        <h3 className="font-bold text-yellow-400 mb-2">Informations de débogage:</h3>

        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <div className="col-span-2 font-semibold mt-2 text-blue-300">État du jeu:</div>
          <div>Phase de jeu:</div>
          <div className="text-green-300">{gamePhase}</div>
          <div>Game Over:</div>
          <div className="text-green-300">{isGameOver ? 'Oui' : 'Non'}</div>

          <div className="col-span-2 font-semibold mt-2 text-blue-300">État du combat:</div>
          <div>Ennemi:</div>
          <div className="text-green-300">
            {combatState.enemy
              ? `${combatState.enemy.name} (${combatState.enemy.health}/${combatState.enemy.maxHealth} PV)`
              : 'Aucun'}
          </div>
          <div>Phase de tour:</div>
          <div className="text-green-300">{combatState.turnPhase || 'N/A'}</div>
          <div>Cartes en main:</div>
          <div className="text-green-300">{combatState.hand ? combatState.hand.length : 0}</div>
          <div>Cartes sélectionnées:</div>
          <div className="text-green-300">
            {combatState.selectedCards ? combatState.selectedCards.length : 0}
          </div>
        </div>
      </div>
    );
  };

  // Rendu de l'écran de récompense
  const renderRewardScreen = () => {
    if (!rewardScreenVisible) return null;

    // Récupérer les récompenses
    const goldReward = 25 + stage * 5;
    const xpReward = 15 + stage * 3;

    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-800 p-6 rounded-lg max-w-md w-full text-center shadow-xl"
      >
        <h2 className="text-2xl font-bold text-yellow-400 mb-4">Victoire !</h2>

        <div className="my-6 flex flex-col items-center space-y-4">
          <div className="bg-gray-700 p-4 rounded-lg flex items-center space-x-4">
            <span className="text-2xl">💰</span>
            <div>
              <div className="text-sm text-gray-400">Or gagné</div>
              <div className="text-xl font-bold text-yellow-300">+{goldReward}</div>
            </div>
          </div>

          <div className="bg-gray-700 p-4 rounded-lg flex items-center space-x-4">
            <span className="text-2xl">⭐</span>
            <div>
              <div className="text-sm text-gray-400">Expérience gagnée</div>
              <div className="text-xl font-bold text-blue-300">+{xpReward}</div>
            </div>
          </div>
        </div>

        <button
          onClick={handleContinueAfterReward}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-8 rounded-lg"
        >
          Continuer →
        </button>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4 flex flex-col items-center justify-center">
      {/* Bouton de débogage (accessible en mode développement uniquement) */}
      {process.env.NODE_ENV !== 'production' && (
        <button
          onClick={() => setShowDebugInfo(!showDebugInfo)}
          className="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 text-xs px-2 py-1 rounded"
        >
          {showDebugInfo ? 'Masquer Débogage' : 'Afficher Débogage'}
        </button>
      )}

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

      {/* Écran de récompense (après combat) */}
      {isInReward && renderRewardScreen()}

      {/* Affichage de l'interface de combat si en phase combat */}
      {isInCombat && !isGameOver && (
        <div className="w-full max-w-4xl">
          {/* Message si l'ennemi n'est pas défini */}
          {!combatState.enemy && (
            <div className="bg-red-800 p-4 rounded-lg mb-4 text-white text-center">
              <p className="font-bold">⚠️ Aucun ennemi détecté dans le combat</p>
              <p className="text-sm mt-2">Problème de chargement de l'état de combat</p>
              <button
                onClick={handleRestart}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              >
                Redémarrer le jeu
              </button>
            </div>
          )}

          <CombatInterface />

          {/* Afficher les informations de débogage si activées */}
          {renderDebugInfo()}
        </div>
      )}

      {/* Afficher un message si ce n'est ni un combat ni un game over */}
      {!isInCombat && !isInReward && !isGameOver && (
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
