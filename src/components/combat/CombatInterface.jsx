// src/components/combat/CombatInterface.jsx - Fixed imports
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGameActions, useGameData } from '../../hooks/useGameActions';

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
  dealHand, // Import this from combatSlice directly
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
  const gameData = useGameData();

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

  // États locaux pour les animations et la gestion d'UI
  const [showDamageEffect, setShowDamageEffect] = useState(false);
  const [showHealEffect, setShowHealEffect] = useState(false);
  const [discardMode, setDiscardMode] = useState(false);
  const [selectedAttackCards, setSelectedAttackCards] = useState([]);
  const [selectedDiscards, setSelectedDiscards] = useState([]);
  const [showTutorial, setShowTutorial] = useState(true);
  const [isProcessingContinue, setIsProcessingContinue] = useState(false);

  // Vérifier si le tutoriel a déjà été vu
  useEffect(() => {
    const tutorialCompleted = localStorage.getItem('tutorialCompleted');
    setShowTutorial(!tutorialCompleted);
  }, []);

  // Reset local selection when a new hand is dealt
  useEffect(() => {
    if (turnPhase === 'select') {
      setSelectedAttackCards([]);
      setSelectedDiscards([]);
      setDiscardMode(false);
    }
  }, [turnPhase]);

  // Détecter les changements d'état qui déclenchent des animations
  useEffect(() => {
    if (turnPhase === 'result' && enemy && enemy.health > 0) {
      // Animation de dégâts
      setShowDamageEffect(true);
      setTimeout(() => setShowDamageEffect(false), 700);
    }
  }, [turnPhase, enemy]);

  // Pour détecter si l'ennemi est vaincu pendant le rendu
  useEffect(() => {
    // Si l'ennemi est vaincu mais que nous sommes encore en phase combat
    if (
      enemy &&
      enemy.health <= 0 &&
      gamePhase === 'combat' &&
      turnPhase === 'result'
    ) {
      console.log('Détection automatique de victoire');

      // Attendre un court délai puis rediriger
      const victoryTimer = setTimeout(() => {
        // Appeler handleContinue pour gérer la victoire
        handleContinue();
      }, 1500);

      return () => clearTimeout(victoryTimer);
    }
  }, [enemy?.health, gamePhase, turnPhase, dispatch, navigate]);

  // Gestion du tutoriel
  const handleNextTutorialStep = () => {
    // Mise à jour du state tutorialStep dans le Redux store
    const currentStep = gameData.tutorialStep || 0;
    const nextStep = currentStep + 1;
    console.log(`Étape de tutoriel suivante: ${nextStep}`);
  };

  const completeTutorial = () => {
    // Marquer le tutoriel comme terminé
    localStorage.setItem('tutorialCompleted', 'true');
    setShowTutorial(false);
  };

  // Gestion locale de la sélection en mode attaque
  const handleAttackSelection = (index) => {
    if (!hand || hand[index] === undefined) {
      console.error('Index de carte invalide ou main non disponible:', index);
      return;
    }

    // Dispatcher l'action Redux pour modifier la sélection
    dispatch(toggleCardSelection(index));

    // Mettre à jour l'état local pour refléter le changement
    const newSelectedCards = [...selectedAttackCards];

    if (newSelectedCards.includes(index)) {
      // Si la carte est déjà sélectionnée, la désélectionner
      const cardIndex = newSelectedCards.indexOf(index);
      newSelectedCards.splice(cardIndex, 1);
    } else {
      // Sinon, l'ajouter (si moins de 5 cartes sont déjà sélectionnées)
      if (newSelectedCards.length < 5) {
        newSelectedCards.push(index);
      } else {
        return; // Ne pas sélectionner plus de 5 cartes
      }
    }

    setSelectedAttackCards(newSelectedCards);
  };

  const handleDiscardSelection = (index) => {
    if (!hand || hand[index] === undefined) {
      console.error('Index de carte invalide ou main non disponible:', index);
      return;
    }

    setSelectedDiscards((prevSelected) => {
      if (prevSelected.includes(index)) {
        // Si la carte est déjà sélectionnée, la désélectionner
        return prevSelected.filter((i) => i !== index);
      } else {
        // Sinon, l'ajouter aux cartes sélectionnées (max discardLimit)
        if (prevSelected.length < (discardLimit || 2)) {
          return [...prevSelected, index];
        }
        return prevSelected;
      }
    });
  };

  // Confirmer la défausse
  const confirmDiscard = () => {
    if (selectedDiscards.length > 0) {
      // Appeler l'action Redux pour défausser les cartes
      gameActions.discardCards(selectedDiscards);

      // Après la défausse, réinitialiser notre état local
      setSelectedDiscards([]);
      setDiscardMode(false);
    }
  };

  // Annuler la défausse
  const cancelDiscard = () => {
    setDiscardMode(false);
    setSelectedDiscards([]);
  };

  // Basculer entre mode attaque et défausse
  const toggleDiscardMode = () => {
    setDiscardMode(!discardMode);
    setSelectedDiscards([]);
  };

  // Lancer l'attaque
  const handleAttack = () => {
    // Vérifier qu'au moins 1 carte est sélectionnée
    if (selectedCards.length === 0) {
      dispatch(
        setActionFeedback({
          message: 'Vous devez sélectionner au moins 1 carte pour attaquer',
          type: 'warning',
        })
      );
      return;
    }

    // Vérifier qu'au maximum 5 cartes sont sélectionnées
    if (selectedCards.length > 5) {
      dispatch(
        setActionFeedback({
          message:
            'Vous ne pouvez pas sélectionner plus de 5 cartes pour attaquer',
          type: 'warning',
        })
      );
      return;
    }

    // Évaluer la main sélectionnée via Redux
    dispatch(attackEnemy());
  };

  const handleContinue = () => {
    // Identifiant unique pour ce cycle de traitement
    const callId = Date.now() + Math.random().toString(16).slice(2);
    console.log(
      `[DEBUG ${callId}] handleContinue appelé - État actuel:`,
      gamePhase,
      'Ennemi santé:',
      enemy?.health
    );

    // Vérifier si un traitement est déjà en cours
    if (isProcessingContinue) {
      console.warn(
        `[DEBUG ${callId}] handleContinue déjà en cours d'exécution, ignoré`
      );
      return;
    }

    // Définir le drapeau de traitement
    setIsProcessingContinue(true);

    try {
      if (enemy && enemy.health <= 0) {
        // L'ennemi est vaincu, on passe à l'étape suivante
        console.log(
          `[DEBUG ${callId}] Ennemi vaincu, transition vers la phase suivante`
        );

        // Appeler l'action Redux pour traiter la victoire
        dispatch(continueAfterVictory());

        // Forcer le passage en mode exploration et la redirection après un délai
        setTimeout(() => {
          console.log(
            `[DEBUG ${callId}] Redirection vers la carte après délai`
          );
          dispatch(setGamePhase('exploration'));
          navigate('/map');
        }, 500);
      } else {
        // S'assurer que toutes les cartes sont correctement marquées avant de distribuer
        console.log(`[DEBUG ${callId}] Distribution d'une nouvelle main`);

        // Définir un verrou pour dealHand au niveau local
        if (!window._dealHandLock) {
          window._dealHandLock = true;

          // Appeler dealHand pour distribuer une nouvelle main
          dispatch(dealHand());

          // Libérer le verrou après un délai
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
      // Réinitialiser le drapeau après un court délai pour éviter les problèmes d'état
      setTimeout(() => {
        setIsProcessingContinue(false);
        console.log(
          `[DEBUG ${callId}] Traitement terminé, drapeau réinitialisé`
        );
      }, 1000);
    }
  };

  // Styles et messages conditionnels pour l'interface
  const getInterfaceMessage = () => {
    if (turnPhase === 'draw') {
      return "Cliquez sur 'Distribuer les cartes' pour commencer";
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

  // Préparation des cartes à afficher selon le mode
  const getDisplayCards = () => {
    if (!hand) return [];

    return hand.map((card, idx) => ({
      ...card,
      // En mode défausse, utiliser selectedDiscards
      // En mode attaque, synchroniser avec l'état isSelected
      isSelected: discardMode
        ? selectedDiscards.includes(idx)
        : turnPhase === 'result'
          ? card.isSelected // En mode résultat, utiliser l'état enregistré
          : selectedAttackCards.includes(idx), // Sinon utiliser notre état local
    }));
  };

  if (!enemy) {
    return (
      <div className="text-white text-center p-4">Chargement du combat...</div>
    );
  }

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

      {/* Dommages */}
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
            {discardMode ? (
              <div className="text-center mb-2">
                <div className="bg-amber-700 text-white rounded-md p-2 mb-4">
                  <p className="font-bold">
                    Mode défausse - Sélectionnez jusqu'à {discardLimit} cartes à
                    remplacer
                  </p>
                  <p className="text-sm">
                    {selectedDiscards.length}/{discardLimit} cartes
                    sélectionnées
                  </p>
                </div>

                {/* EnhancedHand avec tri intégré */}
                <EnhancedHand
                  cards={getDisplayCards()}
                  onToggleSelect={handleDiscardSelection}
                  maxSelectable={discardLimit}
                  selectionMode="discard"
                />

                <div className="flex justify-center space-x-4 mt-4">
                  <button
                    onClick={confirmDiscard}
                    disabled={selectedDiscards.length === 0}
                    className={`px-4 py-2 rounded-md font-bold ${selectedDiscards.length === 0 ? 'bg-gray-600 text-gray-400' : 'bg-green-600 text-white'}`}
                  >
                    Confirmer la défausse
                  </button>
                  <button
                    onClick={cancelDiscard}
                    className="bg-red-600 text-white px-4 py-2 rounded-md font-bold"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* EnhancedHand avec tri intégré */}
                <div className="combat-hand">
                  <EnhancedHand
                    cards={getDisplayCards()}
                    onToggleSelect={handleAttackSelection}
                    maxSelectable={5}
                    selectionMode={turnPhase === 'select' ? 'attack' : 'view'}
                    bestHandCards={[]} // À remplacer par la vraie valeur une fois disponible
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
                          Une combinaison de 5 cartes utilise les règles du
                          poker pour les dégâts
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
