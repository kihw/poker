// src/components/card/BonusDeckCombination.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Card as DesignCard, Badge, Tooltip, DESIGN_TOKENS } from '../ui/DesignSystem';
import Card from './Card';

/**
 * Composant qui affiche la combinaison active des cartes bonus et ses effets
 */
const BonusDeckCombination = () => {
  const deckCombination = useSelector((state) => state.bonusCards.deckCombination);
  const activeBonusCards = useSelector((state) => state.bonusCards.active || []);

  // Si aucune combinaison active ou pas assez de cartes, ne rien afficher
  if (!deckCombination?.isActive || activeBonusCards.length === 0) {
    return null;
  }

  // Définir les couleurs en fonction du type de combinaison
  const getCombinationColor = (combinationType) => {
    switch (combinationType) {
      case 'HIGH_CARD':
        return DESIGN_TOKENS.colors.neutral[500];
      case 'PAIR':
        return DESIGN_TOKENS.colors.primary.main;
      case 'TWO_PAIR':
        return DESIGN_TOKENS.colors.secondary.main;
      case 'THREE_OF_A_KIND':
        return DESIGN_TOKENS.colors.success.main;
      case 'STRAIGHT':
        return '#10B981'; // teal
      case 'FLUSH':
        return DESIGN_TOKENS.colors.warning.main;
      case 'FULL_HOUSE':
        return '#8B5CF6'; // purple
      case 'FOUR_OF_A_KIND':
        return DESIGN_TOKENS.colors.danger.main;
      case 'STRAIGHT_FLUSH':
        return '#EC4899'; // pink
      case 'ROYAL_FLUSH':
        return '#F59E0B'; // amber
      default:
        return DESIGN_TOKENS.colors.neutral[500];
    }
  };

  // Définir l'icône en fonction du type d'effet
  const getEffectIcon = (effectType) => {
    switch (effectType) {
      case 'criticalChance':
        return '💥';
      case 'defense':
        return '🛡️';
      case 'nextSkillDamage':
        return '⚔️';
      case 'actionSpeed':
        return '⚡';
      case 'globalDamage':
        return '🔥';
      case 'specialEffect':
        return '✨';
      case 'ultimateSkill':
      case 'ultimate':
        return '💫';
      case 'multistat':
        return '🌟';
      default:
        return '🎮';
    }
  };

  const combinationColor = getCombinationColor(deckCombination.combination?.type);

  // Animations
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1,
      },
    },
    exit: { opacity: 0, y: -20 },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
  };

  return (
    <AnimatePresence>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="mb-4"
      >
        <DesignCard variant="elevated" className="p-4 overflow-hidden">
          <motion.div className="flex justify-between items-center mb-3" variants={itemVariants}>
            <div className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: combinationColor }}
              />
              <h3 className="font-bold text-lg">
                Combinaison Bonus: {deckCombination.combination?.name || 'Aucune'}
              </h3>
            </div>
            <Badge style={{ backgroundColor: combinationColor }}>
              {deckCombination.effect?.type === 'multistat' ? 'Multi-effet' : 'Actif'}
            </Badge>
          </motion.div>

          {/* Description de l'effet */}
          <motion.div
            className="mb-4 p-3 bg-gray-800 rounded-lg text-gray-300"
            variants={itemVariants}
          >
            <div className="flex items-center mb-2">
              <span className="text-xl mr-2">{getEffectIcon(deckCombination.effect?.type)}</span>
              <span className="font-medium">{deckCombination.description}</span>
            </div>

            {/* Détails de l'effet selon le type */}
            {deckCombination.effect?.type === 'multistat' && (
              <div className="mt-1 grid grid-cols-2 gap-2">
                {Object.entries(deckCombination.effect.values || {}).map(([stat, value]) => (
                  <div key={stat} className="flex items-center">
                    <span className="text-xs bg-gray-700 px-2 py-1 rounded">
                      {stat}: +{value}%
                    </span>
                  </div>
                ))}
              </div>
            )}

            {deckCombination.effect?.details && (
              <div className="mt-1 text-sm text-gray-400">{deckCombination.effect.details}</div>
            )}
          </motion.div>

          {/* Cartes qui forment la combinaison */}
          <motion.div variants={itemVariants}>
            <h4 className="text-sm text-gray-400 mb-2">Cartes de la combinaison:</h4>
            <div className="flex flex-wrap justify-center gap-1">
              {activeBonusCards.map((card, index) => (
                <div key={`deck-card-${index}`} className="transform scale-75 origin-center">
                  <Tooltip content={card.name}>
                    <Card
                      value={card.cardValue}
                      suit={card.cardSuit}
                      rarity={card.rarity}
                      selectionType="view"
                      scale={0.8}
                    />
                  </Tooltip>
                </div>
              ))}

              {/* Indique les emplacements vides */}
              {activeBonusCards.length < 5 && (
                <div className="flex items-center">
                  <span className="text-sm bg-gray-700 px-2 py-1 rounded text-gray-400">
                    + {5 - activeBonusCards.length} carte(s) manquante(s)
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        </DesignCard>
      </motion.div>
    </AnimatePresence>
  );
};

export default React.memo(BonusDeckCombination);
