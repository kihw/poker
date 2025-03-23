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
  selectionType = 'attack', 
  disabled = false,
  scale = 1,
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
  const isRed = ['hearts', 'diamonds', '♥', '♦'].includes(safeSuit);

  // Couleurs avec un design plus vivant
  const bgColor = 'white';
  const textColor = isRed ? COLORS.danger.main : COLORS.gray[900];

  // Styles pour les différents modes de sélection
  let selectionStyles = '';
  let selectionLabel = '';

  if (isSelected) {
    if (selectionType === 'attack') {
      selectionStyles = `border-${COLORS.primary.main} shadow-lg`;
      selectionLabel = 'Attaque';
    } else if (selectionType === 'discard') {
      selectionStyles = `border-${COLORS.danger.main} shadow-lg`;
      selectionLabel = 'Défausser';
    }
  }

  // Dimensions de base avec échelle
  const width = 64 * scale;
  const height = 96 * scale;

  // Gestion du clic sur la carte
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
          border: `${isSelected ? '2px' : '1px'} solid ${isSelected ? COLORS.primary.main : '#d1d5db'}`,
          boxShadow: isSelected
            ? `0 0 10px ${COLORS.primary.main}80`
            : isHighlighted
              ? `0 0 8px ${COLORS.primary.light}80`
              : SHADOWS.md,
          transition: TRANSITIONS.DEFAULT,
        }}
      >
        {/* Face avant (visible) */}
        <div className="absolute w-full h-full flex flex-col justify-between p-2 backface-hidden">
          <div className="flex justify-between items-center">
            <div style={{ color: textColor }} className="text-lg font-bold">
              {safeValue}
            </div>
            <div style={{ color: textColor }} className="text-lg">
              {displaySuit}
            </div>
          </div>

          <div 
            className="flex-grow flex justify-center items-center text-3xl font-bold"
            style={{ color: textColor }}
          >
            {displaySuit}
          </div>

          <div className="flex justify-between items-center rotate-180">
            <div style={{ color: textColor }} className="text-lg font-bold">
              {safeValue}
            </div>
            <div style={{ color: textColor }} className="text-lg">
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
            backgroundColor: selectionType === 'attack' ? COLORS.primary.main : COLORS.danger.main,
            color: 'white',
          }}
        >
          {selectionLabel}
        </motion.div>
      )}
    </motion.div>
  );
};

// Ajouter la version avec Hand incluse
export const ImprovedHand = ({
  cards,
  onToggleSelect,
  bestHandCards = [],
  maxSelectable = 5,
  selectionMode = 'attack',
}) => {
  const selectedCount = React.useMemo(
    () => cards.filter((card) => card.isSelected).length,
    [cards]
  );

  // Animation pour l'entrée des cartes
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
              <EnhancedCard
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
    </div>
  );
};

export default EnhancedCard;
