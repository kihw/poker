import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGameActions } from '../../hooks/useGameActions';

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
  setTurnPhase,
  dealHand,
  discardCards,
  toggleDiscardMode,
} from '../../redux/slices/combatSlice';
import {
  attackEnemy,
  continueAfterVictory,
} from '../../redux/thunks/combatThunks';
import { setActionFeedback } from '../../redux/slices/uiSlice';
import { setGamePhase } from '../../redux/slices/gameSlice';

const CombatInterface = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const gameActions = useGameActions();

  // Extraire les données nécessaires du Redux store
  const enemy = useSelector((state) => state.combat.enemy);
  const hand = useSelector((state) => state.combat.hand);
  const selectedCards = useSelector((state) => state.combat.selectedCards);
  const turnPhase = useSelector((state) => state.combat.turnPhase);
  const discardLimit = useSelector((state) => state.combat.discardLimit);
  const discardUsed = useSelector((state) => state.combat.discardUsed);
  const discardMode = useSelector((state) => state.combat.discardMode);
  const handResult = useSelector((state) => state.combat.handResult);
  const combatLog = useSelector((state) => state.combat.combatLog);
  const gamePhase = useSelector((state) => state.game.gamePhase);
  const activeBonusCards = useSelector((state) => state.bonusCards.active);

  // États locaux pour les animations et la gestion d'UI
  const [showDamageEffect, setShowDamageEffect] = useState(false);
  const [showTutorial, setShowTutorial] = useState(true);
  const [isProcessingContinue, setIsProcessingContinue] = useState(false);

  // Vérifier si le tutoriel a déjà été vu
  useEffect(() => {
    const tutorialCompleted = localStorage.getItem('tutorialCompleted');
    setShowTutorial(!tutorialCompleted);
  }, []);

  // Reset de la sélection quand une nouvelle main est distribuée
  useEffect(() => {
    if (turnPhase === 'select') {
      // Réinitialiser la sélection et le mode de défausse
      dispatch(toggleDiscardMode(false));
    }
  }, [turnPhase, dispatch]);

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
    const currentStep = gameData.tutorialStep || 0;
    const nextStep = currentStep + 1;
    console.log(`Étape de tutoriel suivante: ${nextStep}`);
  };

  const completeTutorial = () => {
    localStorage.setItem('tutorialCompleted', 'true');
    setShowTutorial(false);
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
  // Vérifier si le tutoriel a déjà été vu
  useEffect(() => {
    const tutorialCompleted = localStorage.getItem('tutorialCompleted');
    setShowTutorial(!tutorialCompleted);
  }, []);

  // Préparer les cartes à afficher selon le mode
  const getDisplayCards = () => {
    if (!hand) return [];

    return hand.map((card, idx) => ({
      ...card,
      isSelected: discardMode
        ? selectedCards.includes(idx)
        : turnPhase === 'result'
          ? card.isSelected
          : selectedCards.includes(idx),
    }));
  };
  const handleCardAction = (index) => {
    if (discardMode) {
      // Mode défausse
      const currentDiscardCount = selectedCards.length;
      if (
        currentDiscardCount >= discardLimit &&
        !selectedCards.includes(index)
      ) {
        dispatch(
          setActionFeedback({
            message: `Vous ne pouvez défausser que ${discardLimit} cartes`,
            type: 'warning',
          })
        );
        return;
      }
      dispatch(toggleCardSelection(index));
    } else {
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
    }
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

        dispatch(continueAfterVictory());

        setTimeout(() => {
          console.log(
            `[DEBUG ${callId}] Redirection vers la carte après délai`
          );
          dispatch(setGamePhase('exploration'));
          navigate('/map');
        }, 500);
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
      return "Cliquez sur 'Distribuer les cartes' pour commencer";
    }
    if (turnPhase === 'select') {
      return discardMode
        ? `Sélectionnez jusqu'à ${discardLimit} cartes à défausser`
        : "Sélectionnez 1 à 5 cartes pour attaquer l'ennemi";
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
          step={0}
          onNextStep={handleNextTutorialStep}
          onComplete={completeTutorial}
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
                onToggleSelect={(index) => dispatch(toggleCardSelection(index))}
                maxSelectable={discardMode ? discardLimit : 5}
                selectionMode={
                  discardMode
                    ? 'discard'
                    : turnPhase === 'select'
                      ? 'attack'
                      : 'view'
                }
              />
            </div>

            {/* Actions de combat */}
            {turnPhase === 'select' && (
              <div className="flex flex-col space-y-3 mt-4">
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => {
                      if (
                        selectedCards.length > 0 &&
                        selectedCards.length <= 5
                      ) {
                        handleAttack();
                      } else {
                        dispatch(
                          setActionFeedback({
                            message: 'Sélectionnez 1 à 5 cartes pour attaquer',
                            type: 'warning',
                          })
                        );
                      }
                    }}
                    disabled={
                      selectedCards.length === 0 || selectedCards.length > 5
                    }
                    className={`px-6 py-2 rounded-md font-bold uppercase transition-all ${
                      selectedCards.length > 0 && selectedCards.length <= 5
                        ? 'bg-red-600 hover:bg-red-700 text-white'
                        : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                    }`}
                  >
                    Attaquer ({selectedCards.length})
                  </button>

                  <button
                    onClick={() => {
                      if (!discardUsed) {
                        dispatch(toggleDiscardMode());
                      } else {
                        dispatch(
                          setActionFeedback({
                            message:
                              'Vous avez déjà utilisé la défausse ce tour',
                            type: 'warning',
                          })
                        );
                      }
                    }}
                    className={`px-6 py-2 rounded-md font-bold uppercase ${
                      !discardUsed
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                    }`}
                  >
                    Défausser ({discardLimit} max.)
                  </button>
                </div>
              </div>
            )}

            {/* Mode défausse */}
            {discardMode && (
              <div className="flex justify-center space-x-4 mt-4">
                <button
                  onClick={() => {
                    if (
                      selectedCards.length > 0 &&
                      selectedCards.length <= discardLimit
                    ) {
                      dispatch(discardCards(selectedCards));
                    } else {
                      dispatch(
                        setActionFeedback({
                          message: `Sélectionnez 1 à ${discardLimit} cartes à défausser`,
                          type: 'warning',
                        })
                      );
                    }
                  }}
                  disabled={
                    selectedCards.length === 0 ||
                    selectedCards.length > discardLimit
                  }
                  className={`px-6 py-2 rounded-md font-bold uppercase ${
                    selectedCards.length > 0 &&
                    selectedCards.length <= discardLimit
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                  }`}
                >
                  Confirmer la défausse ({selectedCards.length})
                </button>

                <button
                  onClick={() => dispatch(toggleDiscardMode())}
                  className="px-6 py-2 rounded-md font-bold uppercase bg-red-600 hover:bg-red-700 text-white"
                >
                  Annuler
                </button>
              </div>
            )}
            <>
              {/* EnhancedHand avec tri intégré */}
              <div className="combat-hand">
                <EnhancedHand
                  cards={getDisplayCards()}
                  onToggleSelect={handleCardAction}
                  maxSelectable={discardMode ? discardLimit : 5}
                  selectionMode={
                    discardMode
                      ? 'discard'
                      : turnPhase === 'select'
                        ? 'attack'
                        : 'view'
                  }
                />
              </div>

              {turnPhase === 'select' && (
                <div className="text-center mt-3 mb-2 hand-ranking">
                  <p className="text-gray-300 mb-2">
                    Sélectionnez 1 à 5 cartes pour attaquer.
                    {selectedAttackCards.length >= 1 &&
                      selectedAttackCards.length <= 5 && (
                        <span className="text-green-400">
                          {' '}
                          ({selectedAttackCards.length} sélectionnée
                          {selectedAttackCards.length > 1 ? 's' : ''})
                        </span>
                      )}
                    {selectedAttackCards.length > 5 && (
                      <span className="text-red-400">
                        {' '}
                        (Trop de cartes sélectionnées)
                      </span>
                    )}
                  </p>
                  <div className="text-sm text-gray-400">
                    {selectedAttackCards.length === 5 && (
                      <p>
                        Une combinaison de 5 cartes utilise les règles du poker
                        pour les dégâts
                      </p>
                    )}
                    {selectedAttackCards.length > 0 &&
                      selectedAttackCards.length < 5 && (
                        <p>
                          Les dégâts sont basés sur la somme des valeurs des
                          cartes
                        </p>
                      )}
                  </div>
                </div>
              )}
            </>
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
          {turnPhase === 'draw' && (
            <button
              onClick={() => dispatch(dealHand())}
              className="distribute-cards-btn bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md shadow-lg"
            >
              Distribuer les cartes
            </button>
          )}

          {turnPhase === 'select' && (
            <>
              {!discardUsed && (
                <button
                  onClick={toggleDiscardMode}
                  className={`${
                    discardMode
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-amber-600 hover:bg-amber-700'
                  } text-white font-bold py-2 px-4 rounded-md`}
                >
                  {discardMode
                    ? 'Annuler défausse'
                    : `Défausser (${discardLimit} max.)`}
                </button>
              )}

              <button
                onClick={handleAttack}
                disabled={
                  selectedAttackCards.length < 1 ||
                  selectedAttackCards.length > 5 ||
                  discardMode
                }
                className={`bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-md shadow-lg ${
                  selectedAttackCards.length < 1 ||
                  selectedAttackCards.length > 5 ||
                  discardMode
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                Attaquer
              </button>
            </>
          )}

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
