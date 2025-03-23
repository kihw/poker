// src/components/card/Card.jsx - Enhanced Design System Card
import React from 'react';
import { motion } from 'framer-motion';
import { DESIGN_TOKENS } from '../ui/DesignSystem';

// Définit ces constantes localement puisqu'elles ne sont pas exportées par DesignSystem
const COLORS = {
  primary: { main: '#3B82F6', light: '#60A5FA', dark: '#2563EB' },
  danger: { main: '#EF4444', light: '#FCA5A5', dark: '#B91C1C' },
};

// Fonction locale pour obtenir la couleur de rareté
const getRarityColor = (rarity) => {
  switch (rarity) {
    case 'common':
      return '#9CA3AF'; // gris
    case 'uncommon':
      return '#60A5FA'; // bleu
    case 'rare':
      return '#8B5CF6'; // violet
    case 'epic':
      return '#EC4899'; // rose
    case 'legendary':
      return '#F59E0B'; // or
    default:
      return '#9CA3AF'; // gris par défaut
  }
};

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
  const textColor = isRed ? COLORS.danger.main : COLORS.primary.dark;

  // Card border and shadow effects
  const borderStyle = {
    base: {
      borderWidth: isSelected ? 2 : 1,
      borderColor: isSelected ? COLORS.primary.main : DESIGN_TOKENS.colors.neutral[300],
      boxShadow: isSelected
        ? `0 0 10px ${COLORS.primary.light}80`
        : isHighlighted
          ? `0 0 8px ${COLORS.primary.light}80`
          : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', // Shadow MD équivalent
    },
    rarity: {
      borderColor: rarityColor,
      background: `linear-gradient(45deg, ${rarityColor}10, ${rarityColor}30)`,
    },
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
        damping: 10,
      },
    },
    whileHover: {
      scale: disabled ? 1 : 1.05,
      transition: { duration: 0.2 },
    },
    whileTap: {
      scale: disabled ? 1 : 0.95,
      transition: { duration: 0.1 },
    },
  };

  // Card dimensions based on scale
  const width = 64 * scale;
  const height = 96 * scale;

  return (
    <motion.div
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
          transition: 'all 0.3s ease',
        }}
      >
        {/* Card Content */}
        <div className="absolute w-full h-full flex flex-col justify-between p-2 backface-hidden">
          {/* Top Left */}
          <div className="flex justify-between items-center">
            <div className="text-lg font-bold" style={{ color: textColor }}>
              {displayValue}
            </div>
            <div className="text-lg" style={{ color: textColor }}>
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
            <div className="text-lg font-bold" style={{ color: textColor }}>
              {displayValue}
            </div>
            <div className="text-lg" style={{ color: textColor }}>
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
            backgroundColor: selectionType === 'attack' ? COLORS.primary.main : COLORS.danger.main,
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
