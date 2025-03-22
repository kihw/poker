// src/components/card/EnhancedCard.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';

const EnhancedCard = ({
  value,
  suit,
  isSelected = false,
  onToggleSelect,
  isHighlighted = false,
  selectionType = 'attack', // 'attack', 'discard', 'view'
  disabled = false,
}) => {
<<<<<<< HEAD
=======
  const [isFlipped, setIsFlipped] = useState(false);
>>>>>>> 0057e418c4c4321fe4644761f151a2c134a2087c
  const [isAnimating, setIsAnimating] = useState(false);
  const [isProcessingClick, setIsProcessingClick] = useState(false); // Flag pour éviter les doubles clics

  // Dictionnaire pour afficher les symboles des couleurs
  const suitSymbols = {
    spades: '♠',
    hearts: '♥',
    diamonds: '♦',
    clubs: '♣',
  };
  const displaySuit = suitSymbols[suit] || suit;
  const isRed =
    suit === 'hearts' || suit === 'diamonds' || suit === '♥' || suit === '♦';

  // Déterminer les couleurs en fonction du type de carte
  const cardColors = isRed ? 'bg-white text-red-600' : 'bg-white text-black';

  // Styles pour les différents modes de sélection
  let selectionStyles = '';
  let selectionLabel = '';

  if (isSelected) {
    if (selectionType === 'attack') {
      selectionStyles = 'border-blue-500 shadow-lg shadow-blue-500/50';
      selectionLabel = 'Attaque';
    } else if (selectionType === 'discard') {
      selectionStyles = 'border-red-500 shadow-lg shadow-red-500/50';
      selectionLabel = 'Défausser';
    }
  }

  // Gestion du clic sur la carte avec protection contre les doubles clics
  const handleClick = (e) => {
    // Important: stopper la propagation pour éviter les doubles déclenchements
    e.stopPropagation();

    if (disabled || !onToggleSelect || isProcessingClick) return;

    // Activer le drapeau pour éviter les doubles clics
    setIsProcessingClick(true);

    // Appeler la fonction de toggle
    onToggleSelect();

    // Réinitialiser le drapeau après un court délai
    setTimeout(() => {
      setIsProcessingClick(false);
<<<<<<< HEAD
    }, 200); // Augmenter le délai pour s'assurer que tout traitement est terminé
=======
    }, 100);
>>>>>>> 0057e418c4c4321fe4644761f151a2c134a2087c
  };

  return (
    <motion.div
      className={`relative w-16 h-24 cursor-pointer perspective-500 transform-gpu ${isSelected ? 'z-10' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
<<<<<<< HEAD
=======
      onClick={handleClick}
>>>>>>> 0057e418c4c4321fe4644761f151a2c134a2087c
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.div
        className={`w-full h-full border-2 rounded-lg flex flex-col justify-center items-center
                     ${cardColors}
                     ${isSelected ? selectionStyles : 'border-gray-300'}
                     ${isHighlighted ? 'ring-2 ring-blue-500' : ''}
                     preserve-3d`}
<<<<<<< HEAD
        onClick={handleClick} // Gérer le clic uniquement ici, pas de onClick dans le parent
=======
>>>>>>> 0057e418c4c4321fe4644761f151a2c134a2087c
      >
        {/* Face avant (visible) */}
        <div className="absolute w-full h-full flex flex-col justify-between p-2 backface-hidden">
          <div className="flex justify-between items-center">
            <div className="text-lg font-bold">{value}</div>
            <div className="text-lg">{displaySuit}</div>
          </div>

          <div className="flex-grow flex justify-center items-center text-3xl font-bold">
            {displaySuit}
          </div>

          <div className="flex justify-between items-center rotate-180">
            <div className="text-lg font-bold">{value}</div>
            <div className="text-lg">{displaySuit}</div>
          </div>
        </div>
      </motion.div>

      {/* Indicateur de sélection */}
      {isSelected && selectionLabel && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className={`absolute -bottom-2 left-0 right-0 text-xs text-center font-bold py-0.5 rounded-b-md ${
            selectionType === 'attack'
              ? 'bg-blue-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {selectionLabel}
        </motion.div>
      )}
    </motion.div>
  );
};

export default EnhancedCard;
