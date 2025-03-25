// src/components/card/ActiveBonusCards.jsx - Optimized version combining BonusCards.jsx functionality
import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { setActionFeedback } from '../../redux/slices/uiSlice';

/**
 * Enhanced component to display and manage active bonus cards during combat
 * Allows activation of cards with active effects
 * Shows passive card status
 */
const ActiveBonusCards = () => {
  const dispatch = useDispatch();

  // Get active bonus cards from Redux state
  const activeBonusCards = useSelector((state) => state.bonusCards.active || []);
  const gamePhase = useSelector((state) => state.game.gamePhase);
  const combatPhase = useSelector((state) => state.combat.turnPhase);

  // If no active cards, don't render anything
  if (!activeBonusCards || activeBonusCards.length === 0) {
    return null;
  }

  // Animations
  const containerAnimation = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemAnimation = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  // Get color based on rarity
  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common':
        return 'bg-gray-600 hover:bg-gray-700';
      case 'uncommon':
        return 'bg-green-600 hover:bg-green-700';
      case 'rare':
        return 'bg-blue-600 hover:bg-blue-700';
      case 'epic':
        return 'bg-purple-600 hover:bg-purple-700';
      case 'legendary':
        return 'bg-yellow-600 hover:bg-yellow-700';
      default:
        return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  // Get appropriate icon based on effect type
  const getEffectIcon = (card) => {
    if (card.effect === 'passive') {
      return '🔄'; // Passive effect
    }

    if (!card.bonus) return '🎮'; // Default case

    switch (card.bonus.type) {
      case 'damage':
        return '⚔️'; // Damage
      case 'heal':
        return '❤️'; // Healing
      case 'shield':
        return '🛡️'; // Shield
      case 'discard':
        return '🔄'; // Discard
      case 'invulnerable':
        return '✨'; // Invulnerability
      case 'damageMultiplier':
        return '🔥'; // Multiplier
      default:
        return '🎮'; // Default case
    }
  };

  // Handle using a bonus card
  const handleUseBonus = (index) => {
    const card = activeBonusCards[index];

    // Check if the card can be used
    if (card.effect !== 'active' || card.usesRemaining <= 0 || card.available === false) {
      dispatch(
        setActionFeedback({
          message: 'This card cannot be used right now',
          type: 'warning',
        })
      );
      return;
    }

    // Outside of combat or in draw phase, don't allow activation
    if (gamePhase !== 'combat' || combatPhase === 'draw') {
      dispatch(
        setActionFeedback({
          message: 'Cards can only be used in combat',
          type: 'warning',
        })
      );
      return;
    }

    // Dispatch action to use the card
    dispatch({ type: 'bonusCards/useCard', payload: index });

    // Visual feedback
    dispatch(
      setActionFeedback({
        message: `${card.name} activated`,
        type: 'success',
      })
    );
  };

  return (
    <div className="p-4 bg-gray-800 rounded-md">
      <h2 className="font-bold mb-2 text-white">Bonus Cards</h2>
      <motion.div
        className="flex flex-wrap gap-2"
        variants={containerAnimation}
        initial="hidden"
        animate="show"
      >
        {activeBonusCards.map((card, index) => (
          <motion.button
            key={`bonus-card-${card.id}-${index}`}
            variants={itemAnimation}
            onClick={() => handleUseBonus(index)}
            className={`
              px-3 py-2 text-xs font-semibold rounded-md text-white
              transition-all transform ${getRarityColor(card.rarity)}
              ${
                card.available === false ||
                card.usesRemaining <= 0 ||
                card.effect !== 'active' ||
                gamePhase !== 'combat' ||
                combatPhase === 'draw'
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:scale-105'
              }
            `}
            disabled={
              card.available === false ||
              card.usesRemaining <= 0 ||
              card.effect !== 'active' ||
              gamePhase !== 'combat' ||
              combatPhase === 'draw'
            }
            title={card.description}
            aria-label={`${card.name} - ${card.description} - ${card.effect === 'active' ? 'Click to use' : 'Passive effect'}`}
            whileHover={{
              scale:
                card.effect === 'active' && card.usesRemaining > 0 && gamePhase === 'combat'
                  ? 1.05
                  : 1,
            }}
            whileTap={{
              scale:
                card.effect === 'active' && card.usesRemaining > 0 && gamePhase === 'combat'
                  ? 0.95
                  : 1,
            }}
          >
            <div className="flex items-center">
              <span className="mr-1">{getEffectIcon(card)}</span>
              <span>{card.name}</span>
              {card.effect === 'active' && card.uses > 0 && (
                <span className="ml-2 bg-gray-700 px-1 rounded-md">
                  {card.usesRemaining}/{card.uses}
                </span>
              )}
            </div>
          </motion.button>
        ))}
      </motion.div>

      <div className="mt-2 text-xs text-gray-400">
        <p>Passive effects (🔄) activate automatically. Click on active effects to use them.</p>
      </div>
    </div>
  );
};

export default React.memo(ActiveBonusCards);
