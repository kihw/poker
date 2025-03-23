// src/components/combat/CombatInterface.jsx - Version améliorée
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

// Import sub-components
import PlayerStatus from './PlayerStatus';
import EnemyStatus from './EnemyStatus';
import EnhancedHand from '../card/EnhancedHand';
import HandCombinationDisplay from './HandCombinationDisplay';
import BonusCards from '../card/BonusCards';
import TutorialOverlay from '../ui/TutorialOverlay';

// Import Redux actions
import {
  toggleCardSelection,
  dealHand,
  discardCards,
} from '../../redux/slices/combatSlice';
import {
  attackEnemy,
  processCombatVictory,
} from '../../redux/thunks/combatThunks';
import { setActionFeedback } from '../../redux/slices/uiSlice';
import {
  setGamePhase,
  setTutorialStep,
  completeTutorial,
} from '../../redux/slices/gameSlice';

const CombatInterface = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Extraire les données nécessaires du Redux store
  const enemy = useSelector((state) => state.combat.enemy);
  const hand = useSelector((state) => state.combat.hand);
  const selectedCards = useSelector((state) => state.combat.selectedCards);
  const turnPhase = useSelector((state) => state.combat.turnPhase);
  const discardLimit = useSelector((state) => state.combat.discardLimit);
  const discardUsed = useSelector((state) => state.combat.discardUsed);
  const handResult = useSelector((state) => state.combat.handResult);
  const combatLog = useSelector((state) => state.combat.combatLog);
  const gamePhase = useSelector((state) => state.game.gamePhase);
  const activeBonusCards = useSelector((state) => state.bonusCards.active);
  const stage = useSelector((state) => state.game.stage);
  const playerGold = useSelector((state) => state.player.gold);
  const playerHealth = useSelector((state) => state.player.health);
  const playerMaxHealth = useSelector((state) => state.player.maxHealth);
  const tutorialStep = useSelector((state) => state.game.tutorialStep);
  const playerExperience = useSelector((state) => state.player.experience);
  const playerLevel = useSelector((state) => state.player.level);

  // États locaux pour les animations et la gestion d'UI
  const [showDamageEffect, setShowDamageEffect] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [isProcessingContinue, setIsProcessingContinue] = useState(false);

  // Recréer gameData à partir des sélecteurs
  const gameData = {
    stage,
    player: {
      health: playerHealth,
      maxHealth: playerMaxHealth,
      gold: playerGold,
      tutorialStep,
      experience: playerExperience,
      level: playerLevel,
    },
  };

  // Vérifier si le tutoriel a déjà été vu
  useEffect(() => {
    const tutorialCompleted = localStorage.getItem('tutorialCompleted');
    setShowTutorial(!tutorialCompleted);
  }, []);

  // Distribution automatique des cartes au début du combat
  useEffect(() => {
    if (turnPhase === 'draw' && hand.length === 0) {
      dispatch(dealHand());
    }
  }, [turnPhase, hand.length, dispatch]);

  // Détecter les changements d'état qui déclenchent des animations
  useEffect(() => {
    if (turnPhase === 'result' && enemy && enemy.health > 0) {
      // Animation de dégâts
      setShowDamageEffect(true);
      setTimeout(() => setShowDamageEffect(false), 700);
    }
  }, [turnPhase, enemy]);

  // Détection automatique de victoire
  useEffect(() => {
    if (
      enemy &&
      enemy.health <= 0 &&
      gamePhase === 'combat' &&
      turnPhase === 'result'
    ) {
      console.log('Détection automatique de victoire');

      const victoryTimer = setTimeout(() => {
        handleContinue();
      }, 1500);

      return () => clearTimeout(victoryTimer);
    }
  }, [enemy?.health, gamePhase, turnPhase, dispatch, navigate]);

  // Gérer le tutoriel
  const handleNextTutorialStep = () => {
    const nextStep = (tutorialStep || 0) + 1;
    dispatch(setTutorialStep(nextStep));
    console.log(`Étape de tutoriel suivante: ${nextStep}`);
  };

  const handleCompleteTutorial = () => {
    dispatch(completeTutorial());
    setShowTutorial(false);
  };

  // Préparer les cartes à afficher selon le mode
  const getDisplayCards = () => {
    if (!hand) return [];

    return hand.map((card, idx) => ({
      ...card,
      isSelected:
        turnPhase === 'result' ? card.isSelected : selectedCards.includes(idx),
    }));
  };

  // Handler pour les actions sur les cartes
  const handleCardAction = (index) => {
    // Mode attaque normal
    const currentSelectedCount = selectedCards.length;
    if (currentSelectedCount >= 5 && !selectedCards.includes(index)) {
      dispatch(
        setActionFeedback({
          message: 'Vous ne pouvez sélectionner que 5 cartes maximum',
          type: 'warning',
        })
      );
      return;
    }
    dispatch(toggleCardSelection(index));
  };

  // Lancer l'attaque
  const handleAttack = () => {
    if (selectedCards.length === 0 || selectedCards.length > 5) {
      dispatch(
        setActionFeedback({
          message: 'Sélectionnez 1 à 5 cartes pour attaquer',
          type: 'warning',
        })
      );
      return;
    }

    dispatch(attackEnemy());
  };

  // Défausser les cartes sélectionnées
  const handleDiscard = () => {
    if (selectedCards.length === 0) {
      dispatch(
        setActionFeedback({
          message: 'Sélectionnez des cartes à défausser',
          type: 'warning',
        })
      );
      return;
    }

    if (selectedCards.length > discardLimit) {
      dispatch(
        setActionFeedback({
          message: `Vous ne pouvez défausser que ${discardLimit} cartes`,
          type: 'warning',
        })
      );
      return;
    }

    if (discardUsed) {
      dispatch(
        setActionFeedback({
          message: 'Vous avez déjà utilisé la défausse ce tour',
          type: 'warning',
        })
      );
      return;
    }

    // Défausser directement les cartes sélectionnées
    dispatch(discardCards(selectedCards));
  };

  // Gérer la continuation après un combat
  const handleContinue = () => {
    const callId = Date.now() + Math.random().toString(16).slice(2);
    console.log(
      `[DEBUG ${callId}] handleContinue appelé - État actuel:`,
      gamePhase,
      'Ennemi santé:',
      enemy?.health
    );

    if (isProcessingContinue) {
      console.warn(
        `[DEBUG ${callId}] handleContinue déjà en cours d'exécution, ignoré`
      );
      return;
    }

    setIsProcessingContinue(true);

    try {
      if (enemy && enemy.health <= 0) {
        console.log(
          `[DEBUG ${callId}] Ennemi vaincu, transition vers la phase suivante`
        );

        // Process victory
        dispatch(processCombatVictory())
          .then(() => {
            console.log(
              `[DEBUG ${callId}] Redirection vers la carte après délai`
            );
            dispatch(setGamePhase('exploration'));
            navigate('/map');
          })
          .catch((error) => {
            console.error(
              `[DEBUG ${callId}] Erreur lors du traitement de la victoire:`,
              error
            );
          });
      } else {
        console.log(`[DEBUG ${callId}] Distribution d'une nouvelle main`);

        if (!window._dealHandLock) {
          window._dealHandLock = true;
          dispatch(dealHand());

          setTimeout(() => {
            window._dealHandLock = false;
          }, 500);
        } else {
          console.warn(`[DEBUG ${callId}] Distribution déjà en cours, ignorée`);
        }
      }
    } catch (error) {
      console.error(`[DEBUG ${callId}] Erreur dans handleContinue:`, error);
    } finally {
      setTimeout(() => {
        setIsProcessingContinue(false);
        console.log(
          `[DEBUG ${callId}] Traitement terminé, drapeau réinitialisé`
        );
      }, 1000);
    }
  };

  // Messages d'interface conditionnels
  const getInterfaceMessage = () => {
    if (turnPhase === 'draw') {
      return 'Préparation du combat...';
    }
    if (turnPhase === 'select') {
      return "Sélectionnez 1 à 5 cartes pour attaquer l'ennemi";
    }
    if (turnPhase === 'result') {
      return enemy?.health <= 0
        ? 'Victoire ! Cliquez sur Continuer'
        : 'Regardez les résultats de votre attaque';
    }
    return '';
  };

  return (
    <div className="max-w-4xl mx-auto p-4 bg-gray-900 rounded-xl shadow-2xl relative overflow-hidden start-screen combat-interface">
      {/* Tutoriel */}
      {showTutorial && (
        <TutorialOverlay
          step={tutorialStep}
          onNextStep={handleNextTutorialStep}
          onComplete={handleCompleteTutorial}
        />
      )}

      {/* Message d'interface */}
      <div className="text-center mb-4 text-white text-lg">
        {getInterfaceMessage()}
      </div>

      {/* Effet de dommages */}
      <AnimatePresence>
        {showDamageEffect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.7 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-red-600 pointer-events-none z-50"
            style={{ mixBlendMode: 'overlay' }}
          />
        )}
      </AnimatePresence>

      {/* En-tête de combat */}
      <div className="mb-6 text-center relative">
        <h2 className="text-2xl font-bold text-white">
          Niveau {gameData.stage} -{' '}
          {gamePhase === 'combat' ? 'Combat' : 'Récompense'}
        </h2>
        <div className="absolute right-0 top-0 bg-yellow-600 text-black font-bold px-3 py-1 rounded-full text-sm">
          {gameData.player.gold} <span className="text-xs">or</span>
        </div>
      </div>

      {/* Zone ennemie */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-4"
      >
        {enemy && (
          <EnemyStatus
            name={enemy.name}
            hp={enemy.health}
            maxHp={enemy.maxHealth}
            nextAttack={enemy.attack}
          />
        )}
      </motion.div>

      {/* Journal de combat */}
      <div className="bg-gray-800 rounded-md p-3 max-h-32 overflow-y-auto mb-6 text-sm">
        <h3 className="text-gray-400 uppercase text-xs font-bold mb-2">
          Journal de combat
        </h3>
        {combatLog &&
          combatLog.map((entry, index) => (
            <motion.div
              key={index}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className={`mb-1 pb-1 ${index !== combatLog.length - 1 ? 'border-b border-gray-700' : ''}`}
            >
              {entry}
            </motion.div>
          ))}
      </div>

      {/* Main du joueur */}
      <div className="mb-6">
        {hand && hand.length > 0 && (
          <>
            <div className="combat-hand">
              <EnhancedHand
                cards={getDisplayCards()}
                onToggleSelect={handleCardAction}
                maxSelectable={5}
                selectionMode={turnPhase === 'select' ? 'attack' : 'view'}
              />
            </div>

            {/* Actions de combat - Boutons d'attaque et de défausse simplifiés */}
            {turnPhase === 'select' && (
              <div className="flex justify-center space-x-6 mt-6">
                <button
                  onClick={handleAttack}
                  disabled={
                    selectedCards.length === 0 || selectedCards.length > 5
                  }
                  className={`px-6 py-2 rounded-md font-bold uppercase ${
                    selectedCards.length > 0 && selectedCards.length <= 5
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  Attaquer ({selectedCards.length})
                </button>

                <button
                  onClick={handleDiscard}
                  disabled={
                    selectedCards.length === 0 ||
                    selectedCards.length > discardLimit ||
                    discardUsed
                  }
                  className={`px-6 py-2 rounded-md font-bold uppercase ${
                    !discardUsed &&
                    selectedCards.length > 0 &&
                    selectedCards.length <= discardLimit
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  Défausser ({selectedCards.length}/{discardLimit})
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Résultat de la main (si disponible) */}
      {turnPhase === 'result' && handResult && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-6"
        >
          <HandCombinationDisplay
            handName={handResult.handName}
            baseDamage={handResult.baseDamage}
            totalDamage={handResult.totalDamage}
            bonusEffects={handResult.bonusEffects}
            cards={handResult.cards}
          />
          {turnPhase === 'result' &&
            selectedCards &&
            selectedCards.length > 0 && (
              <div className="mt-2 text-sm text-gray-400">
                <p>
                  Les cartes utilisées dans cette attaque seront remplacées, les
                  autres resteront en main.
                </p>
              </div>
            )}
        </motion.div>
      )}

      {/* Actions du joueur */}
      <div className="flex justify-between items-center mb-6">
        <PlayerStatus
          hp={gameData.player.health}
          maxHp={gameData.player.maxHealth}
          gold={gameData.player.gold}
          xp={gameData.player.experience || 0}
          level={gameData.player.level}
        />

        <div className="flex flex-col space-y-3">
          {turnPhase === 'result' && (
            <button
              onClick={(e) => {
                // Empêcher la propagation de l'événement
                e.preventDefault();
                e.stopPropagation();

                // Désactiver le bouton immédiatement pour éviter les doubles clics
                e.currentTarget.disabled = true;

                // Délai court avant de traiter le clic
                setTimeout(() => {
                  handleContinue();

                  // Réactiver le bouton après un délai plus long
                  setTimeout(() => {
                    if (e.currentTarget) {
                      e.currentTarget.disabled = false;
                    }
                  }, 1000);
                }, 50);
              }}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-md shadow-lg"
            >
              Continuer
            </button>
          )}
        </div>
      </div>

      {/* Cartes bonus */}
      <BonusCards className="bonus-cards" />
    </div>
  );
};

export default CombatInterface;
