// src/components/card/Card.jsx - Merged version of ImprovedCard and previous Card
import React from 'react';
import { motion } from 'framer-motion';
import { SHADOWS, COLORS, TRANSITIONS } from '../ui/DesignSystem';

const Card = ({
  value,
  suit,
  isSelected = false,
  onToggleSelect,
  isHighlighted = false,
  selectionType = 'attack', // 'attack', 'discard', 'view'
  disabled = false,
  scale = 1, // Scale factor to adjust size
}) => {
  // Dictionary to display color symbols
  const suitSymbols = {
    spades: '♠',
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
  };

  // Conversion of values for display
  const displayValue = value || 'A';
  const displaySuit = suitSymbols[suit] || suit;
  const isRed =
    suit === 'hearts' || suit === 'diamonds' || suit === '♥' || suit === '♦';

  // Colors with a more vibrant design
  const bgColor = 'white';
  const textColor = isRed ? '#e11d48' : '#111827'; // rose-600 for red, gray-900 for black

  // Styles for different selection types
  let selectionBorderColor = '';
  let selectionLabel = '';

  if (isSelected) {
    if (selectionType === 'attack') {
      selectionBorderColor = COLORS.primary.main;
      selectionLabel = 'Attack';
    } else if (selectionType === 'discard') {
      selectionBorderColor = COLORS.danger.main;
      selectionLabel = 'Discard';
    }
  }

  // Base dimensions with scale
  const width = 64 * scale;
  const height = 96 * scale;

  return (
    <motion.div
      className={`relative perspective-500 transform-gpu cursor-pointer ${isSelected ? 'z-10' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      style={{ width: `${width}px`, height: `${height}px` }}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled && onToggleSelect) onToggleSelect();
      }}
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
    >
      <motion.div
        className={`w-full h-full rounded-lg flex flex-col justify-center items-center preserve-3d shadow-md`}
        style={{
          backgroundColor: bgColor,
          border: `${isSelected ? '2px' : '1px'} solid ${isSelected ? selectionBorderColor : '#d1d5db'}`,
          boxShadow: isSelected
            ? `0 0 10px ${selectionBorderColor}80`
            : isHighlighted
              ? `0 0 8px ${COLORS.primary.light}80`
              : SHADOWS.md,
          transition: TRANSITIONS.DEFAULT,
        }}
      >
        {/* Front face (visible) */}
        <div className="absolute w-full h-full flex flex-col justify-between p-2 backface-hidden">
          <div className="flex justify-between items-center">
            <div className={`text-lg font-bold`} style={{ color: textColor }}>
              {displayValue}
            </div>
            <div className={`text-lg`} style={{ color: textColor }}>
              {displaySuit}
            </div>
          </div>

          <div
            className={`flex-grow flex justify-center items-center text-3xl font-bold`}
            style={{ color: textColor }}
          >
            {displaySuit}
          </div>

          <div className="flex justify-between items-center rotate-180">
            <div className={`text-lg font-bold`} style={{ color: textColor }}>
              {displayValue}
            </div>
            <div className={`text-lg`} style={{ color: textColor }}>
              {displaySuit}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Selection indicator */}
      {isSelected && selectionLabel && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute -bottom-2 left-0 right-0 text-xs text-center font-bold py-0.5 rounded-b-md"
          style={{
            backgroundColor:
              selectionType === 'attack'
                ? COLORS.primary.main
                : COLORS.danger.main,
            color: 'white',
          }}
        >
          {selectionLabel}
        </motion.div>
      )}
    </motion.div>
  );
};

// Component to display a hand of cards
export const Hand = ({
  cards,
  onToggleSelect,
  bestHandCards = [],
  maxSelectable = 5,
  selectionMode = 'attack', // 'attack', 'discard', 'view'
}) => {
  const selectedCount = React.useMemo(
    () => cards.filter((card) => card.isSelected).length,
    [cards]
  );

  // Card entry animation
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07,
      },
    },
  };

  const cardAnimation = {
    hidden: { y: 50, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  return (
    <div className="py-6 relative">
      <motion.div
        className="flex justify-center items-end flex-wrap gap-2"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {cards.map((card, index) => {
          if (!card) return null;

          const isHighlighted = bestHandCards.includes(index);

          return (
            <motion.div
              key={`${card.value}-${card.suit}-${index}`}
              variants={cardAnimation}
              whileHover={{
                y: -15,
                transition: { duration: 0.2 },
              }}
              className="relative"
            >
              <Card
                value={card.value}
                suit={card.suit}
                isSelected={card.isSelected}
                isHighlighted={isHighlighted}
                onToggleSelect={() => onToggleSelect && onToggleSelect(index)}
                selectionType={selectionMode}
                disabled={
                  !card.isSelected &&
                  selectedCount >= maxSelectable &&
                  selectionMode === 'attack'
                }
              />
            </motion.div>
          );
        })}
      </motion.div>

      {/* Instructions */}
      {selectionMode === 'attack' && (
        <div className="text-center text-sm text-gray-400 mt-4">
          Select 1 to 5 cards to attack
        </div>
      )}
      {selectionMode === 'discard' && (
        <div className="text-center text-sm text-gray-400 mt-4">
          Select cards to discard
        </div>
      )}
    </div>
  );
};

export default Card;
