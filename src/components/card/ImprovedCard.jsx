// src/components/card/ImprovedCard.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { SHADOWS, COLORS, TRANSITIONS } from '../ui/DesignSystem';

const ImprovedCard = ({
  value,
  suit,
  isSelected = false,
  onToggleSelect,
  isHighlighted = false,
  selectionType = 'attack', // 'attack', 'discard', 'view'
  disabled = false,
  scale = 1, // Facteur d'échelle pour ajuster la taille
}) => {
  // Dictionnaire pour afficher les symboles des couleurs
  const suitSymbols = {
    spades: '♠',
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
  };

  // Conversion des valeurs pour l'affichage
  const displayValue = value || 'A';
  const displaySuit = suitSymbols[suit] || suit;
  const isRed =
    suit === 'hearts' || suit === 'diamonds' || suit === '♥' || suit === '♦';

  // Couleurs avec un design plus vivant
  const bgColor = isRed ? 'white' : 'white';
  const textColor = isRed ? '#e11d48' : '#111827'; // rose-600 pour le rouge, gray-900 pour le noir

  // Styles pour les différents types de sélection
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
        {/* Face avant (visible) */}
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

// Composant pour afficher une main de cartes
export const ImprovedHand = ({
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
              <ImprovedCard
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
          Sélectionnez 1 à 5 cartes pour attaquer
        </div>
      )}
      {selectionMode === 'discard' && (
        <div className="text-center text-sm text-gray-400 mt-4">
          Sélectionnez les cartes à défausser
        </div>
      )}
    </div>
  );
};

export default ImprovedCard;
