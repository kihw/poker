// src/components/card/Card.jsx - Enhanced Design System Card
import React from 'react';
import { motion } from 'framer-motion';
import { 
  DESIGN_TOKENS, 
  COLORS, 
  getRarityColor 
} from '../ui/DesignSystem';

const Card = ({
  value,
  suit,
  rarity = 'common', // Add rarity prop
  isSelected = false,
  onToggleSelect,
  isHighlighted = false,
  selectionType = 'attack', 
  disabled = false,
  scale = 1,
}) => {
  // Color and styling based on suit and rarity
  const suitSymbols = {
    spades: '♠',
    hearts: '♥',
    diamonds: '♦', 
    clubs: '♣',
  };

  const displayValue = value || 'A';
  const displaySuit = suitSymbols[suit] || suit;
  const isRed = ['hearts', 'diamonds', '♥', '♦'].includes(suit);

  // Rarity-based styling
  const rarityColor = getRarityColor(rarity);
  const textColor = isRed 
    ? COLORS.danger.main 
    : COLORS.primary.dark;

  // Card border and shadow effects
  const borderStyle = {
    base: {
      borderWidth: isSelected ? 2 : 1,
      borderColor: isSelected 
        ? COLORS.primary.main 
        : DESIGN_TOKENS.colors.neutral[300],
      boxShadow: isSelected 
        ? `0 0 10px ${COLORS.primary.light}80` 
        : isHighlighted
          ? `0 0 8px ${COLORS.primary.light}80`
          : DESIGN_TOKENS.shadows.md,
    },
    rarity: {
      borderColor: rarityColor,
      background: `linear-gradient(45deg, ${rarityColor}10, ${rarityColor}30)`,
    }
  };

  // Animation configurations
  const cardAnimations = {
    initial: { scale: 0.9, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: 'spring', 
        stiffness: 300,
        damping: 10
      }
    },
    whileHover: { 
      scale: disabled ? 1 : 1.05,
      transition: { duration: 0.2 }
    },
    whileTap: { 
      scale: disabled ? 1 : 0.95,
      transition: { duration: 0.1 }
    }
  };

  // Card dimensions based on scale
  const width = 64 * scale;
  const height = 96 * scale;

  return (
    <motion.div
      {...cardAnimations}
      className={`
        relative cursor-pointer transform-gpu 
        ${isSelected ? 'z-10' : ''} 
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
      style={{ width, height }}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled && onToggleSelect) onToggleSelect();
      }}
    >
      <motion.div
        className="w-full h-full rounded-lg flex flex-col justify-center items-center"
        style={{
          ...borderStyle.base,
          ...borderStyle.rarity,
          transition: DESIGN_TOKENS.transitions.DEFAULT,
        }}
      >
        {/* Card Content */}
        <div className="absolute w-full h-full flex flex-col justify-between p-2 backface-hidden">
          {/* Top Left */}
          <div className="flex justify-between items-center">
            <div 
              className="text-lg font-bold" 
              style={{ color: textColor }}
            >
              {displayValue}
            </div>
            <div 
              className="text-lg" 
              style={{ color: textColor }}
            >
              {displaySuit}
            </div>
          </div>

          {/* Center */}
          <div 
            className="flex-grow flex justify-center items-center text-3xl font-bold" 
            style={{ color: textColor }}
          >
            {displaySuit}
          </div>

          {/* Bottom Right (Inverted) */}
          <div className="flex justify-between items-center rotate-180">
            <div 
              className="text-lg font-bold" 
              style={{ color: textColor }}
            >
              {displayValue}
            </div>
            <div 
              className="text-lg" 
              style={{ color: textColor }}
            >
              {displaySuit}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Selection Indicator */}
      {isSelected && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute -bottom-2 left-0 right-0 text-xs text-center font-bold py-0.5 rounded-b-md"
          style={{
            backgroundColor: selectionType === 'attack' 
              ? COLORS.primary.main 
              : COLORS.danger.main,
            color: 'white',
          }}
        >
          {selectionType === 'attack' ? 'Attack' : 'Discard'}
        </motion.div>
      )}
    </motion.div>
  );
};

export default Card;