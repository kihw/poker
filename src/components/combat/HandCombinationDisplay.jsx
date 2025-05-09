// src/components/combat/HandCombinationDisplay.jsx - Design System Enhanced
import React from 'react';
import { motion } from 'framer-motion';
import {
  DESIGN_TOKENS,
  AnimationPresets,
  Card as DesignCard, // Renommé pour éviter la confusion avec le composant Card de cartes à jouer
} from '../ui/DesignSystem';
import Card from '../card/Card'; // Import correct de notre composant Card de cartes à jouer

// Fonction locale pour obtenir la couleur d'une main de poker
const getPokerHandColor = (handName) => {
  // Mapper les mains de poker à des couleurs
  switch (handName.toLowerCase().replace(/\s+/g, '')) {
    case 'highcard':
      return '#9CA3AF'; // gris
    case 'pair':
    case 'onepair':
      return '#60A5FA'; // bleu clair
    case 'twopair':
      return '#3B82F6'; // bleu
    case 'threeofakind':
      return '#8B5CF6'; // violet
    case 'straight':
      return '#EC4899'; // rose
    case 'flush':
      return '#F59E0B'; // orange
    case 'fullhouse':
      return '#EF4444'; // rouge
    case 'fourofakind':
      return '#10B981'; // vert
    case 'straightflush':
      return '#6366F1'; // indigo
    case 'royalflush':
      return '#F59E0B'; // or
    default:
      return '#6B7280'; // gris par défaut
  }
};

const HandCombinationDisplay = ({
  handName,
  baseDamage,
  totalDamage = null,
  bonusEffects = [],
  cards = [],
}) => {
  // Determine the background and text colors based on hand type
  const handTypeColor = getPokerHandColor(handName);

  // Animation configuration
  const cardVariants = {
    ...AnimationPresets.scaleIn,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 10,
    },
  };

  return (
    <DesignCard variant="elevated" className="p-4 bg-gray-800 rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <motion.div
            className="w-3 h-3 rounded-full mr-2"
            style={{ backgroundColor: handTypeColor }}
            {...cardVariants}
          />
          <h3 className="text-lg font-bold text-white">{handName}</h3>
        </div>

        <div className="flex items-center">
          {totalDamage !== null && totalDamage !== baseDamage ? (
            <div className="text-right">
              <motion.span className="text-sm text-gray-400" {...AnimationPresets.fadeIn}>
                Base: {baseDamage}
              </motion.span>
              <motion.span className="mx-1 text-gray-400" {...AnimationPresets.fadeIn}>
                →
              </motion.span>
              <motion.span className="text-xl font-bold text-red-500" {...AnimationPresets.fadeIn}>
                {totalDamage}
              </motion.span>
              <span className="ml-1 text-sm text-gray-400">damage</span>
            </div>
          ) : (
            <div>
              <span className="text-xl font-bold text-red-500">{totalDamage || baseDamage}</span>
              <span className="ml-1 text-sm text-gray-400">damage</span>
            </div>
          )}
        </div>
      </div>

      {/* Cards Used in the Attack */}
      {cards && cards.length > 0 && (
        <motion.div
          className="flex justify-center my-2 flex-wrap gap-1"
          {...AnimationPresets.slideUp}
        >
          {cards.map((card, index) => (
            <div key={index} className="transform scale-75 origin-center">
              <Card value={card.value} suit={card.suit} selectionType="view" />
            </div>
          ))}
        </motion.div>
      )}

      {/* Bonus Effects */}
      {bonusEffects.length > 0 && (
        <motion.div className="mt-2 pt-2 border-t border-gray-700" {...AnimationPresets.fadeIn}>
          <h4 className="text-xs uppercase font-semibold text-gray-400 mb-1">Active Bonuses</h4>
          <ul className="text-sm">
            {bonusEffects.map((effect, index) => (
              <motion.li
                key={index}
                className="text-green-400 flex items-center"
                {...AnimationPresets.slideUp}
              >
                <span className="mr-1">•</span>
                {renderBonusDescription(effect)}
              </motion.li>
            ))}
          </ul>
        </motion.div>
      )}
    </DesignCard>
  );
};

// Utility function to render bonus effect descriptions
const renderBonusDescription = (effect) => {
  if (effect.includes('added')) {
    return effect.replace('added', '→ +');
  }
  if (effect.includes('healed')) {
    return effect.replace('healed', '→ Healed');
  }
  return effect;
};

export default React.memo(HandCombinationDisplay);
