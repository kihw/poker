// src/components/card/BonusCardFusion.jsx - Amélioré pour les combinaisons de poker
import React, { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { evaluatePartialHand } from '../../core/hand-evaluation';
import { setActionFeedback } from '../../redux/slices/uiSlice';
import { addToCombatLog } from '../../redux/slices/combatSlice';
import { getSuitSymbol, getNumericValue } from '../../utils/cardValuesGenerator';

/**
 * Composant de fusion de cartes bonus qui permet au joueur de créer
 * des combinaisons de poker avec ses cartes bonus pour obtenir des effets spéciaux
 */
const BonusCardFusion = () => {
  const dispatch = useDispatch();

  // Récupérer les cartes bonus actives du state Redux
  const activeBonusCards = useSelector((state) => state.bonusCards.active || []);
  const gamePhase = useSelector((state) => state.game.gamePhase);

  // État local pour les cartes sélectionnées pour la fusion
  const [selectedCardIds, setSelectedCardIds] = useState([]);
  const [fusionResult, setFusionResult] = useState(null);

  // Ne montrer le composant qu'en combat
  if (gamePhase !== 'combat' || !activeBonusCards.length) {
    return null;
  }

  // Conversion des cartes bonus en cartes pour l'évaluation de poker
  const bonusCardsWithPlayingCardValues = useMemo(() => {
    return activeBonusCards.map((card) => {
      // S'assurer que la carte a des valeurs de carte à jouer
      if (!card.cardValue || !card.cardSuit) {
        return {
          ...card,
          cardValue: getRandomCardValue(),
          cardSuit: getRandomCardSuit(),
          isSelected: selectedCardIds.includes(card.id),
        };
      }

      return {
        ...card,
        // Propriétés nécessaires pour l'évaluation de la main
        value: card.cardValue,
        suit: card.cardSuit,
        numericValue: getNumericValue(card.cardValue),
        isSelected: selectedCardIds.includes(card.id),
      };
    });
  }, [activeBonusCards, selectedCardIds]);

  // Sélectionner/désélectionner une carte
  const toggleCardSelection = (cardId) => {
    setSelectedCardIds((prev) => {
      if (prev.includes(cardId)) {
        return prev.filter((id) => id !== cardId);
      } else {
        // Limiter à 5 cartes maximum (comme au poker)
        if (prev.length < 5) {
          return [...prev, cardId];
        }
        return prev;
      }
    });

    // Réinitialiser le résultat de fusion lors de la sélection
    setFusionResult(null);
  };

  // Évaluer la main poker formée par les cartes sélectionnées
  const evaluateBonusHand = () => {
    if (selectedCardIds.length === 0) {
      dispatch(
        setActionFeedback({
          message: 'Sélectionnez au moins une carte pour la fusion',
          type: 'warning',
        })
      );
      return;
    }

    // Obtenir les cartes sélectionnées avec leurs valeurs de poker
    const selectedCards = bonusCardsWithPlayingCardValues.filter((card) =>
      selectedCardIds.includes(card.id)
    );

    // Évaluer la main de poker
    const handResult = evaluatePartialHand(selectedCards);

    // Déterminer l'effet selon le type de main
    let effect = determineEffectFromHand(handResult);

    // Dispatch pour appliquer l'effet
    dispatch({
      type: 'bonusCards/fuseBonusCards',
      payload: {
        cardIds: selectedCardIds,
        effect,
        handResult,
      },
    });

    // Mettre à jour l'état avec le résultat
    setFusionResult({
      handName: handResult.handName,
      effect: effect,
      cards: selectedCards,
    });

    // Ajouter au journal de combat
    dispatch(
      addToCombatLog(`Fusion de cartes bonus: ${handResult.handName} - ${effect.description}`)
    );

    // Notification visuelle
    dispatch(
      setActionFeedback({
        message: `${handResult.handName}: ${effect.description}`,
        type: 'success',
        duration: 3000,
      })
    );

    // Réinitialiser la sélection
    setSelectedCardIds([]);
  };

  // Détermine l'effet en fonction du type de main
  const determineEffectFromHand = (handResult) => {
    const handRank = handResult.handRank;
    const baseDamage = handResult.baseDamage;

    switch (handRank) {
      case 0: // Carte haute
        return {
          type: 'damage',
          value: Math.ceil(baseDamage / 2),
          description: `+${Math.ceil(baseDamage / 2)} aux dégâts`,
        };
      case 1: // Paire
        return {
          type: 'damage',
          value: baseDamage,
          description: `+${baseDamage} aux dégâts`,
        };
      case 2: // Double paire
        return {
          type: 'heal',
          value: Math.ceil(baseDamage / 3),
          description: `Récupération de ${Math.ceil(baseDamage / 3)} PV`,
        };
      case 3: // Brelan
        return {
          type: 'shield',
          value: Math.ceil(baseDamage / 2),
          description: `+${Math.ceil(baseDamage / 2)} points de bouclier`,
        };
      case 4: // Suite
        return {
          type: 'damageMultiplier',
          value: 1.5,
          description: `Dégâts multipliés par 1.5`,
        };
      case 5: // Couleur
        return {
          type: 'shield',
          value: baseDamage,
          description: `+${baseDamage} points de bouclier`,
        };
      case 6: // Full
        return {
          type: 'damageMultiplier',
          value: 2,
          description: `Dégâts multipliés par 2`,
        };
      case 7: // Carré
        return {
          type: 'invulnerable',
          value: true,
          description: `Invulnérabilité pour un tour`,
        };
      default:
        return {
          type: 'damage',
          value: baseDamage,
          description: `+${baseDamage} aux dégâts`,
        };
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded-md mb-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="font-bold text-white flex items-center">
          <span className="mr-2">🔮</span>
          Fusion de Cartes Bonus
        </h2>
      </div>

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
                selectedCardIds.includes(card.id)
                  ? 'border-blue-500 bg-blue-900 bg-opacity-30'
                  : 'border-gray-700 bg-gray-700 hover:bg-gray-600'
              }
            `}
            onClick={() => toggleCardSelection(card.id)}
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

      {/* Résultat de l'évaluation de la main */}
      {fusionResult && (
        <div className="bg-gray-700 p-3 rounded-md mb-3">
          <div className="font-medium mb-1">{fusionResult.handName}</div>
          <div className="text-sm text-gray-300">{fusionResult.effect.description}</div>
        </div>
      )}

      {/* Bouton pour évaluer */}
      <button
        className={`
          w-full py-2 rounded-md text-white font-medium
          ${
            selectedCardIds.length > 0
              ? 'bg-blue-600 hover:bg-blue-700'
              : 'bg-gray-600 cursor-not-allowed'
          }
        `}
        disabled={selectedCardIds.length === 0}
        onClick={evaluateBonusHand}
      >
        Fusionner les cartes
      </button>
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

function truncate(str, maxLength) {
  if (!str) return '';
  return str.length > maxLength ? str.substring(0, maxLength) + '...' : str;
}

export default BonusCardFusion;
