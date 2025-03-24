// src/components/card/BonusCardFusion.jsx - New component for bonus card poker combinations
import React, { useState, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { evaluatePartialHand } from '../../core/hand-evaluation';
import { DESIGN_TOKENS } from '../ui/DesignSystem';
import { setActionFeedback } from '../../redux/slices/uiSlice';
import { addToCombatLog } from '../../redux/slices/combatSlice';

/**
 * Composant pour fusionner des cartes bonus en combinaisons de poker
 * Ce composant permet d'utiliser les valeurs de cartes classiques des cartes bonus
 * pour créer des combinaisons et obtenir des bonus en combat
 */
const BonusCardFusion = () => {
  const dispatch = useDispatch();

  // Récupérer les cartes bonus actives du state Redux
  const activeBonusCards = useSelector((state) => state.bonusCards.active || []);
  const gamePhase = useSelector((state) => state.game.gamePhase);
  const combatPhase = useSelector((state) => state.combat.turnPhase);

  // État local pour les cartes sélectionnées pour la fusion
  const [selectedCards, setSelectedCards] = useState([]);
  // État pour afficher/masquer le panel de fusion
  const [showFusionPanel, setShowFusionPanel] = useState(false);

  // Ajouter la propriété de carte à jouer à chaque carte bonus
  const bonusCardsWithPlayingCardValues = useMemo(() => {
    return activeBonusCards.map((card) => {
      // Générer aléatoirement une valeur de carte et une couleur si pas déjà définis
      // Dans une implémentation réelle, ces valeurs seraient définies lors de l'acquisition de la carte
      const cardValue = card.cardValue || getRandomCardValue();
      const cardSuit = card.cardSuit || getRandomCardSuit();

      return {
        ...card,
        cardValue,
        cardSuit,
        // Ajouter les propriétés nécessaires pour l'évaluation de la main
        value: cardValue,
        suit: cardSuit,
        numericValue: getNumericValue(cardValue),
        isSelected: selectedCards.includes(card.id),
      };
    });
  }, [activeBonusCards, selectedCards]);

  // Évaluation de la main actuelle (si des cartes sont sélectionnées)
  const handEvaluation = useMemo(() => {
    if (selectedCards.length === 0) return null;

    const selectedBonusCards = bonusCardsWithPlayingCardValues.filter((card) =>
      selectedCards.includes(card.id)
    );

    // Utiliser la fonction d'évaluation partielle de main pour les mains de moins de 5 cartes
    return evaluatePartialHand(selectedBonusCards);
  }, [selectedCards, bonusCardsWithPlayingCardValues]);

  // Gérer la sélection d'une carte
  const handleCardSelect = useCallback((cardId) => {
    setSelectedCards((prev) => {
      // Si la carte est déjà sélectionnée, la retirer
      if (prev.includes(cardId)) {
        return prev.filter((id) => id !== cardId);
      }

      // Sinon, l'ajouter (maximum 5 cartes)
      if (prev.length < 5) {
        return [...prev, cardId];
      }

      return prev;
    });
  }, []);

  // Appliquer l'effet de la combinaison
  const applyFusionEffect = useCallback(() => {
    if (!handEvaluation) return;

    // Déterminer le bonus en fonction du type de main
    let bonusEffect = null;
    let message = '';

    switch (handEvaluation.handRank) {
      case 0: // Carte haute
        bonusEffect = { type: 'damage', value: Math.ceil(handEvaluation.baseDamage / 2) };
        message = `Fusion simple: +${bonusEffect.value} aux dégâts`;
        break;
      case 1: // Paire
        bonusEffect = { type: 'damage', value: handEvaluation.baseDamage };
        message = `Fusion Paire: +${bonusEffect.value} aux dégâts`;
        break;
      case 2: // Double paire
        bonusEffect = { type: 'heal', value: Math.ceil(handEvaluation.baseDamage / 3) };
        message = `Fusion Double Paire: Récupération de ${bonusEffect.value} PV`;
        break;
      case 3: // Brelan
        bonusEffect = { type: 'shield', value: Math.ceil(handEvaluation.baseDamage / 2) };
        message = `Fusion Brelan: +${bonusEffect.value} points de bouclier`;
        break;
      case 4: // Suite
        bonusEffect = { type: 'damageMultiplier', value: 1.5 };
        message = `Fusion Suite: Dégâts multipliés par 1.5`;
        break;
      case 5: // Couleur
        bonusEffect = { type: 'shield', value: handEvaluation.baseDamage };
        message = `Fusion Couleur: +${bonusEffect.value} points de bouclier`;
        break;
      case 6: // Full
        bonusEffect = { type: 'damageMultiplier', value: 2 };
        message = `Fusion Full: Dégâts multipliés par 2`;
        break;
      case 7: // Carré
        bonusEffect = { type: 'invulnerable', value: true };
        message = `Fusion Carré: Invulnérabilité pour un tour`;
        break;
      default:
        bonusEffect = { type: 'damage', value: handEvaluation.baseDamage };
        message = `Fusion: +${bonusEffect.value} aux dégâts`;
    }

    // Envoyer l'effet au state global (logique à adapter selon votre implémentation)
    if (bonusEffect.type === 'damage') {
      dispatch({ type: 'combat/setPendingDamageBonus', payload: bonusEffect.value });
    } else if (bonusEffect.type === 'damageMultiplier') {
      dispatch({ type: 'combat/setPendingDamageMultiplier', payload: bonusEffect.value });
    } else if (bonusEffect.type === 'heal') {
      dispatch({ type: 'player/heal', payload: bonusEffect.value });
    } else if (bonusEffect.type === 'shield') {
      dispatch({ type: 'player/addShield', payload: bonusEffect.value });
    } else if (bonusEffect.type === 'invulnerable') {
      dispatch({ type: 'combat/setInvulnerableNextTurn', payload: true });
    }

    // Ajouter au journal de combat
    dispatch(addToCombatLog(message));

    // Feedback visuel
    dispatch(
      setActionFeedback({
        message,
        type: 'success',
        duration: 3000,
      })
    );

    // Réinitialiser les cartes sélectionnées
    setSelectedCards([]);
    setShowFusionPanel(false);
  }, [handEvaluation, dispatch]);

  // Ne montrer le composant qu'en combat
  if (gamePhase !== 'combat' || !activeBonusCards.length) {
    return null;
  }

  return (
    <div className="p-4 bg-gray-800 rounded-md mb-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-bold text-white flex items-center">
          <span className="mr-2">🔮</span>
          Fusion de Cartes Bonus
        </h2>
        <button
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md"
          onClick={() => setShowFusionPanel(!showFusionPanel)}
        >
          {showFusionPanel ? 'Masquer' : 'Afficher'}
        </button>
      </div>

      <AnimatePresence>
        {showFusionPanel && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="text-sm text-gray-300 mb-3">
              Sélectionnez des cartes bonus pour créer une combinaison de poker et obtenir un bonus
              spécial.
            </div>

            {/* Cartes bonus disponibles */}
            <div className="flex flex-wrap gap-2 mb-4">
              {bonusCardsWithPlayingCardValues.map((card) => (
                <motion.div
                  key={card.id}
                  className={`
                    p-2 rounded-md border cursor-pointer transition-all
                    ${
                      selectedCards.includes(card.id)
                        ? 'border-blue-500 bg-blue-900 bg-opacity-30'
                        : 'border-gray-700 bg-gray-700 hover:bg-gray-600'
                    }
                  `}
                  onClick={() => handleCardSelect(card.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-10 bg-gray-800 rounded flex items-center justify-center text-lg">
                      {card.cardValue}
                      {getSuitSymbol(card.cardSuit)}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{card.name}</div>
                      <div className="text-xs text-gray-400">{truncate(card.description, 20)}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Évaluation de la main actuelle */}
            {handEvaluation && (
              <div className="bg-gray-700 p-3 rounded-md mb-3">
                <div className="flex justify-between items-center mb-2">
                  <div className="font-medium">{handEvaluation.handName}</div>
                  <div>{handEvaluation.baseDamage} points</div>
                </div>
                <div className="text-sm text-gray-300">
                  {getFusionEffectDescription(handEvaluation.handRank)}
                </div>
              </div>
            )}

            {/* Bouton pour appliquer la fusion */}
            <button
              className={`
                w-full py-2 rounded-md text-white font-medium
                ${
                  selectedCards.length > 0
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-600 cursor-not-allowed'
                }
              `}
              disabled={selectedCards.length === 0}
              onClick={applyFusionEffect}
            >
              Fusionner les cartes
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Fonctions utilitaires
function getRandomCardValue() {
  const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
  return values[Math.floor(Math.random() * values.length)];
}

function getRandomCardSuit() {
  const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
  return suits[Math.floor(Math.random() * suits.length)];
}

function getNumericValue(value) {
  const valueMap = {
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 9,
    10: 10,
    J: 11,
    Q: 12,
    K: 13,
    A: 14,
  };
  return valueMap[value] || parseInt(value) || 2;
}

function getSuitSymbol(suit) {
  const suitSymbols = {
    hearts: '♥️',
    diamonds: '♦️',
    clubs: '♣️',
    spades: '♠️',
  };
  return suitSymbols[suit] || '♠️';
}

function truncate(str, maxLength) {
  if (!str) return '';
  return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
}

function getFusionEffectDescription(handRank) {
  switch (handRank) {
    case 0:
      return 'Bonus de dégâts basique';
    case 1:
      return 'Dégâts supplémentaires';
    case 2:
      return 'Récupération de PV';
    case 3:
      return 'Gain de points de bouclier';
    case 4:
      return 'Dégâts multipliés par 1.5';
    case 5:
      return 'Gain important de points de bouclier';
    case 6:
      return 'Dégâts multipliés par 2';
    case 7:
      return 'Invulnérabilité pour un tour';
    default:
      return 'Bonus de dégâts';
  }
}

export default BonusCardFusion;
