// src/components/card/EnhancedCard.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { SHADOWS, COLORS, TRANSITIONS } from '../ui/DesignSystem';

const EnhancedCard = ({
  value,
  suit,
  isSelected = false,
  onToggleSelect,
  isHighlighted = false,
  selectionType = 'attack', // 'attack', 'discard', 'view'
  disabled = false,
  scale = 1, // Facteur d'échelle pour ajuster la taille
}) => {
  const [isProcessingClick, setIsProcessingClick] = useState(false);

  // Vérification des valeurs
  const safeValue = value || 'A';
  const safeSuit = suit || 'spades';

  // Dictionnaire pour afficher les symboles des couleurs
  const suitSymbols = {
    spades: '♠',
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
  };
  const displaySuit = suitSymbols[safeSuit] || safeSuit;
  const isRed =
    safeSuit === 'hearts' ||
    safeSuit === 'diamonds' ||
    safeSuit === '♥' ||
    safeSuit === '♦';

  // Couleurs avec un design plus vivant
  const bgColor = isRed ? 'white' : 'white';
  const textColor = isRed ? COLORS.danger.main : COLORS.gray[900];

  // Styles pour les différents modes de sélection
  let selectionStyles = '';
  let selectionBorderColor = '';
  let selectionLabel = '';

  if (isSelected) {
    if (selectionType === 'attack') {
      selectionBorderColor = COLORS.primary.main;
      selectionLabel = 'Attaque';
    } else if (selectionType === 'discard') {
      selectionBorderColor = COLORS.danger.main;
      selectionLabel = 'Défausser';
    }
  }

  // Dimensions de base avec échelle
  const width = 64 * scale;
  const height = 96 * scale;

  // Gestion du clic sur la carte avec protection contre les doubles clics
  const handleClick = (e) => {
    e.stopPropagation();

    if (disabled || !onToggleSelect || isProcessingClick) return;

    setIsProcessingClick(true);
    onToggleSelect();

    setTimeout(() => {
      setIsProcessingClick(false);
    }, 100);
  };

  return (
    <motion.div
      className={`relative perspective-500 transform-gpu cursor-pointer ${isSelected ? 'z-10' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      style={{ width: `${width}px`, height: `${height}px` }}
      onClick={handleClick}
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
        {/* Face avant (visible) */}
        <div className="absolute w-full h-full flex flex-col justify-between p-2 backface-hidden">
          <div className="flex justify-between items-center">
            <div className={`text-lg font-bold`} style={{ color: textColor }}>
              {safeValue}
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
              {safeValue}
            </div>
            <div className={`text-lg`} style={{ color: textColor }}>
              {displaySuit}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Indicateur de sélection */}
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

export default EnhancedCard;
