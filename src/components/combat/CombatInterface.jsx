// src/components/combat/CombatInterface.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../context/gameHooks';

// Import sub-components
import PlayerStatus from './PlayerStatus';
import EnemyStatus from './EnemyStatus';
import EnhancedHand from '../card/EnhancedHand';
import HandCombinationDisplay from './HandCombinationDisplay';
import BonusCards from '../card/BonusCards';
import TutorialOverlay from '../ui/TutorialOverlay';

const CombatInterface = () => {
  const {
    gameState,
    dealHand,
    evaluateSelectedHand,
    useBonus,
    discardCards,
    nextStage,
  } = useGame();

  const [showDamageEffect, setShowDamageEffect] = useState(false);
  const [showHealEffect, setShowHealEffect] = useState(false);
  const [discardMode, setDiscardMode] = useState(false);
  const [selectedAttackCards, setSelectedAttackCards] = useState([]);
  const [selectedDiscards, setSelectedDiscards] = useState([]);
  const [showTutorial, setShowTutorial] = useState(true);

  // Vérifier si le tutoriel a déjà été vu
  useEffect(() => {
    const tutorialCompleted = localStorage.getItem('tutorialCompleted');
    setShowTutorial(!tutorialCompleted);
  }, []);

  // Reset local selection when a new hand is dealt
  useEffect(() => {
    if (gameState?.turnPhase === 'select') {
      setSelectedAttackCards([]);
      setSelectedDiscards([]);
      setDiscardMode(false);
    }
  }, [gameState?.turnPhase]);

  // Détecter les changements d'état qui déclenchent des animations
  useEffect(() => {
    if (
      gameState?.turnPhase === 'result' &&
      gameState.enemy &&
      gameState.enemy.health > 0
    ) {
      // Animation de dégâts
      setShowDamageEffect(true);
      setTimeout(() => setShowDamageEffect(false), 700);
    }
  }, [gameState?.turnPhase, gameState?.enemy?.health, gameState?.enemy]);
  // pour détecter si l'ennemi est vaincu pendant le rendu
  useEffect(() => {
    // Si l'ennemi est vaincu mais que nous sommes encore en phase combat
    if (
      gameState?.enemy &&
      gameState.enemy.health <= 0 &&
      gameState.gamePhase === 'combat' &&
      gameState.turnPhase === 'result'
    ) {
      console.log('Détection automatique de victoire');

      // Attendre un court délai puis rediriger
      const victoryTimer = setTimeout(() => {
        // Appeler handleContinue pour gérer la victoire
        handleContinue();
      }, 1500);

      return () => clearTimeout(victoryTimer);
    }
  }, [gameState?.enemy?.health, gameState?.gamePhase, gameState?.turnPhase]);
  // Gestion du tutoriel
  const handleNextTutorialStep = () => {
    // Logique pour faire avancer les étapes du tutoriel
    const currentStep = gameState.tutorialStep || 0;
    const nextStep = currentStep + 1;

    // Mise à jour fictive - dans une implémentation réelle, vous mettriez à jour gameState
    console.log(`Étape de tutoriel suivante: ${nextStep}`);
  };

  const completeTutorial = () => {
    // Marquer le tutoriel comme terminé
    localStorage.setItem('tutorialCompleted', 'true');
    setShowTutorial(false);
  };

  // Gestion locale de la sélection en mode attaque
  const handleAttackSelection = (index) => {
    if (!gameState || !gameState.hand || gameState.hand[index] === undefined) {
      console.error('Index de carte invalide ou main non disponible:', index);
      return;
    }

    // Créer une copie de la main actuelle pour la modifier de manière immutable
    const updatedHand = [...gameState.hand];

    // Compter les cartes actuellement sélectionnées
    const currentSelectedCount = updatedHand.filter(
      (card) => card.isSelected
    ).length;

    // Si la carte n'est pas sélectionnée et qu'on a déjà 5 cartes, ne rien faire
    if (currentSelectedCount >= 5 && !updatedHand[index].isSelected) {
      console.log('Maximum de 5 cartes déjà sélectionnées');
      return;
    }

    // Inverser l'état de sélection
    updatedHand[index] = {
      ...updatedHand[index],
      isSelected: !updatedHand[index].isSelected,
    };

    // Mettre à jour gameState.hand de manière immutable
    if (gameState.hand !== updatedHand) {
      gameState.hand = updatedHand;
    }

    // Recalculer selectedCards
    const newSelectedCards = updatedHand
      .map((card, idx) => (card.isSelected ? idx : -1))
      .filter((idx) => idx !== -1);

    // Mettre à jour gameState.selectedCards
    gameState.selectedCards = newSelectedCards;

    // Synchroniser notre état local
    setSelectedAttackCards(newSelectedCards);
  };

  const handleDiscardSelection = (index) => {
    if (!gameState || !gameState.hand || gameState.hand[index] === undefined) {
      console.error('Index de carte invalide ou main non disponible:', index);
      return;
    }

    setSelectedDiscards((prevSelected) => {
      if (prevSelected.includes(index)) {
        // Si la carte est déjà sélectionnée, la désélectionner
        return prevSelected.filter((i) => i !== index);
      } else {
        // Sinon, l'ajouter aux cartes sélectionnées (max discardLimit)
        if (prevSelected.length < (gameState?.discardLimit || 2)) {
          return [...prevSelected, index];
        }
        return prevSelected;
      }
    });
  };

  // Confirmer la défausse
  const confirmDiscard = () => {
    if (selectedDiscards.length > 0) {
      // Appeler la fonction de défausse avec notre état local
      discardCards(selectedDiscards);

      // Après la défausse, réinitialiser notre état local et mettre à jour l'UI
      setSelectedDiscards([]);

      // Si l'état des cartes a changé, mettre à jour l'état local pour refléter les nouvelles cartes
      if (gameState && gameState.hand) {
        const updatedSelectedCards = gameState.hand
          .map((card, idx) => (card.isSelected ? idx : -1))
          .filter((idx) => idx !== -1);

        setSelectedAttackCards(updatedSelectedCards);
      }
    }
    setDiscardMode(false);
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

  // Lancer l'attaque en passant les cartes sélectionnées localement
  // Pour handleAttack
  const handleAttack = () => {
    // Vérifier qu'au moins 1 carte est sélectionnée
    if (gameState.selectedCards.length === 0) {
      // Utiliser le système de feedback si disponible
      if (gameState.setActionFeedback) {
        gameState.setActionFeedback(
          'Vous devez sélectionner au moins 1 carte pour attaquer',
          'warning'
        );
      } else {
        alert('Vous devez sélectionner au moins 1 carte pour attaquer');
      }
      return;
    }

    // Vérifier qu'au maximum 5 cartes sont sélectionnées
    if (gameState.selectedCards.length > 5) {
      // Utiliser le système de feedback si disponible
      if (gameState.setActionFeedback) {
        gameState.setActionFeedback(
          'Vous ne pouvez pas sélectionner plus de 5 cartes pour attaquer',
          'warning'
        );
      } else {
        alert('Vous ne pouvez pas sélectionner plus de 5 cartes pour attaquer');
      }
      return;
    }

    // Vérifier que les propriétés isSelected des cartes correspondent à selectedCards
    if (gameState && gameState.hand) {
      // Réinitialiser toutes les cartes
      gameState.hand.forEach((card, index) => {
        card.isSelected = gameState.selectedCards.includes(index);
      });
    }

    // Évaluer la main sélectionnée
    evaluateSelectedHand();
  };

  const handleContinue = () => {
    console.log(
      'handleContinue appelé - État actuel:',
      gameState?.gamePhase,
      'Ennemi santé:',
      gameState?.enemy?.health
    );

    if (gameState?.enemy && gameState.enemy.health <= 0) {
      // L'ennemi est vaincu, on passe à l'étape suivante
      console.log('Ennemi vaincu, transition vers la phase suivante');

      // Appeler nextStage pour traiter la victoire
      nextStage();

      console.log('Après nextStage, nouveau gamePhase:', gameState.gamePhase);

      // Forcer le passage en mode exploration et la redirection
      // quelle que soit la phase actuelle
      setTimeout(() => {
        console.log('Redirection vers la carte après délai');

        // Forcer la phase d'exploration avant la redirection
        if (gameState.gamePhase !== 'exploration') {
          console.log("Forçage de la phase 'exploration'");
          gameState.gamePhase = 'exploration';
        }

        // Utiliser window.location pour une redirection complète
        // ce qui force le rechargement de la page et un état propre
        window.location.href = '/map';
      }, 500);
    } else {
      // S'assurer que toutes les cartes sont correctement marquées avant de distribuer
      console.log("Distribution d'une nouvelle main");
      dealHand();
    }
  };

  // Styles et messages conditionnels pour l'interface
  const getInterfaceMessage = () => {
    if (gameState?.turnPhase === 'draw') {
      return "Cliquez sur 'Distribuer les cartes' pour commencer";
    }
    if (gameState?.turnPhase === 'select') {
      return "Sélectionnez 1 à 5 cartes pour attaquer l'ennemi";
    }
    if (gameState?.turnPhase === 'result') {
      return gameState.enemy?.health <= 0
        ? 'Victoire ! Cliquez sur Continuer'
        : 'Regardez les résultats de votre attaque';
    }
    return '';
  };

  // Préparation des cartes à afficher selon le mode
  const getDisplayCards = () => {
    if (!gameState?.hand) return [];

    return gameState.hand.map((card, idx) => ({
      ...card,
      // En mode défausse, utiliser selectedDiscards
      // En mode attaque, synchroniser avec l'état isSelected
      isSelected: discardMode
        ? selectedDiscards.includes(idx)
        : gameState.turnPhase === 'result'
          ? card.isSelected // En mode résultat, utiliser l'état enregistré
          : selectedAttackCards.includes(idx), // Sinon utiliser notre état local
    }));
  };

  if (!gameState) {
    return (
      <div className="text-white text-center p-4">Chargement du combat...</div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 bg-gray-900 rounded-xl shadow-2xl relative overflow-hidden start-screen combat-interface">
      {/* Tutoriel */}
      {showTutorial && (
        <TutorialOverlay
          step={gameState?.tutorialStep || 0}
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
          Niveau {gameState.stage} -{' '}
          {gameState.gamePhase === 'combat' ? 'Combat' : 'Récompense'}
        </h2>
        <div className="absolute right-0 top-0 bg-yellow-600 text-black font-bold px-3 py-1 rounded-full text-sm">
          {gameState.player.gold} <span className="text-xs">or</span>
        </div>
      </div>

      {/* Zone ennemie */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-4"
      >
        {gameState.enemy && (
          <EnemyStatus
            name={gameState.enemy.name}
            hp={gameState.enemy.health}
            maxHp={gameState.enemy.maxHealth}
            nextAttack={gameState.enemy.attack}
          />
        )}
      </motion.div>

      {/* Journal de combat */}
      <div className="bg-gray-800 rounded-md p-3 max-h-32 overflow-y-auto mb-6 text-sm">
        <h3 className="text-gray-400 uppercase text-xs font-bold mb-2">
          Journal de combat
        </h3>
        {gameState.combatLog &&
          gameState.combatLog.map((entry, index) => (
            <motion.div
              key={index}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.3 }}
              className={`mb-1 pb-1 ${index !== gameState.combatLog.length - 1 ? 'border-b border-gray-700' : ''}`}
            >
              {entry}
            </motion.div>
          ))}
      </div>

      {/* Main du joueur */}
      <div className="mb-6">
        {gameState.hand && gameState.hand.length > 0 && (
          <>
            {discardMode ? (
              <div className="text-center mb-2">
                <div className="bg-amber-700 text-white rounded-md p-2 mb-4">
                  <p className="font-bold">
                    Mode défausse - Sélectionnez jusqu'à{' '}
                    {gameState.discardLimit} cartes à remplacer
                  </p>
                  <p className="text-sm">
                    {selectedDiscards.length}/{gameState.discardLimit} cartes
                    sélectionnées
                  </p>
                </div>

                {/* EnhancedHand avec tri intégré */}
                <EnhancedHand
                  cards={getDisplayCards()}
                  onToggleSelect={handleDiscardSelection}
                  maxSelectable={gameState.discardLimit}
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
                    selectionMode={
                      gameState.turnPhase === 'select' ? 'attack' : 'view'
                    }
                    bestHandCards={gameState.bestHandCards || []}
                  />
                </div>

                {gameState.turnPhase === 'select' && (
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
      {gameState.turnPhase === 'result' && gameState.handResult && (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="mb-6"
        >
          <HandCombinationDisplay
            handName={gameState.handResult.handName}
            baseDamage={gameState.handResult.baseDamage}
            totalDamage={gameState.handResult.totalDamage}
            bonusEffects={gameState.handResult.bonusEffects}
            cards={gameState.handResult.cards}
          />
        </motion.div>
      )}

      {/* Actions du joueur */}
      <div className="flex justify-between items-center mb-6">
        <PlayerStatus
          hp={gameState.player.health}
          maxHp={gameState.player.maxHealth}
          gold={gameState.player.gold}
          xp={gameState.player.experience || 0}
          level={gameState.player.level}
        />

        <div className="flex flex-col space-y-3">
          {gameState.turnPhase === 'draw' && (
            <button
              onClick={dealHand}
              className="distribute-cards-btn bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md shadow-lg"
            >
              Distribuer les cartes
            </button>
          )}

          {gameState.turnPhase === 'select' && (
            <>
              {!gameState.discardUsed && (
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
                    : `Défausser (${gameState.discardLimit} max.)`}
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

          {gameState.turnPhase === 'result' && (
            <button
              onClick={handleContinue}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-md shadow-lg"
            >
              Continuer
            </button>
          )}
        </div>
      </div>

      {/* Cartes bonus */}
      <BonusCards
        className="bonus-cards"
        bonusCards={gameState.activeBonusCards || []}
        onUseBonus={useBonus}
      />
    </div>
  );
};

export default CombatInterface;
