// src/components/combat/CombatInterface.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../../context/GameContext';

// Import sub-components
import PlayerStatus from './PlayerStatus';
import EnemyStatus from './EnemyStatus';
import EnhancedHand from '../card/EnhancedHand';
import HandCombinationDisplay from './HandCombinationDisplay';
import BonusCards from '../card/BonusCards';

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

  // Reset local selection when a new hand is dealt
  useEffect(() => {
    if (gameState?.turnPhase === 'select') {
      setSelectedAttackCards([]);
      setSelectedDiscards([]);
      setDiscardMode(false);
    }
  }, [gameState?.turnPhase]);

  // Detect state changes that trigger animations
  useEffect(() => {
    if (
      gameState?.turnPhase === 'result' &&
      gameState.enemy &&
      gameState.enemy.health > 0
    ) {
      // Damage animation
      setShowDamageEffect(true);
      setTimeout(() => setShowDamageEffect(false), 700);
    }
  }, [gameState?.turnPhase, gameState?.enemy?.health, gameState?.enemy]);

  // Gestion locale de la sélection en mode attaque
  const handleAttackSelection = (index) => {
    console.log(
      `CombatInterface: handleAttackSelection called with index ${index}`
    );

    // Approche directe qui reflète l'état actuel de sélection
    if (gameState && gameState.hand && gameState.hand[index]) {
      // La propriété isSelected sera inversée dans cette fonction
      gameState.toggleCardSelection(index);

      // Reconstruire le tableau local selectedAttackCards à partir de l'état isSelected des cartes
      setSelectedAttackCards(
        gameState.hand
          .map((card, idx) => (card.isSelected ? idx : -1))
          .filter((idx) => idx !== -1)
      );
    }
  };

  const handleDiscardSelection = (index) => {
    console.log(
      `CombatInterface: handleDiscardSelection called with index ${index}`
    );

    // On ne modifie pas directement l'état isSelected ici, uniquement notre état local
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
        setSelectedAttackCards(
          gameState.hand
            .map((card, idx) => (card.isSelected ? idx : -1))
            .filter((idx) => idx !== -1)
        );
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
  const handleAttack = () => {
    // Vérifier qu'au moins 1 carte est sélectionnée
    if (selectedAttackCards.length === 0) {
      alert('Vous devez sélectionner au moins 1 carte pour attaquer');
      return;
    }

    // Vérifier qu'au maximum 5 cartes sont sélectionnées
    if (selectedAttackCards.length > 5) {
      alert('Vous ne pouvez pas sélectionner plus de 5 cartes pour attaquer');
      return;
    }

    // Important: S'assurer que l'état visuel correspond à l'état interne avant d'évaluer
    // Mettre à jour l'état isSelected dans gameState.hand
    if (gameState && gameState.hand) {
      // Réinitialiser toutes les cartes
      gameState.hand.forEach((card) => {
        card.isSelected = false;
      });

      // Sélectionner uniquement les cartes dans selectedAttackCards
      selectedAttackCards.forEach((index) => {
        if (gameState.hand[index]) {
          gameState.hand[index].isSelected = true;
        }
      });

      // Mettre à jour selectedCards dans gameState
      gameState.selectedCards = [...selectedAttackCards];
    }

    // Évaluer la main sélectionnée
    evaluateSelectedHand();
  };

  // Continuer au prochain tour/étage
  const handleContinue = () => {
    if (gameState?.enemy && gameState.enemy.health <= 0) {
      nextStage();
    } else {
      dealHand();
    }
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

  return (
    <div className="max-w-4xl mx-auto p-4 bg-gray-900 rounded-xl shadow-2xl relative overflow-hidden">
      {/* Damage effect overlay */}
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

      {/* Combat header */}
      <div className="mb-6 text-center relative">
        <h2 className="text-2xl font-bold text-white">
          Niveau {gameState.stage} -{' '}
          {gameState.gamePhase === 'combat' ? 'Combat' : 'Récompense'}
        </h2>
        <div className="absolute right-0 top-0 bg-yellow-600 text-black font-bold px-3 py-1 rounded-full text-sm">
          {gameState.player.gold} <span className="text-xs">or</span>
        </div>
      </div>

      {/* Enemy zone */}
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

      {/* Combat log */}
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

      {/* Player's hand */}
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
                <EnhancedHand
                  cards={getDisplayCards()}
                  onToggleSelect={handleAttackSelection}
                  maxSelectable={5}
                  selectionMode={
                    gameState.turnPhase === 'select' ? 'attack' : 'view'
                  }
                  bestHandCards={gameState.bestHandCards || []}
                />

                {gameState.turnPhase === 'select' && (
                  <div className="text-center mt-3 mb-2">
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

      {/* Hand result (if available) */}
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

      {/* Player actions */}
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
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-md shadow-lg"
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

      {/* Bonus cards */}
      <BonusCards
        bonusCards={gameState.activeBonusCards || []}
        onUseBonus={useBonus}
      />
    </div>
  );
};

export default CombatInterface;
