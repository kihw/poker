// src/components/card/EnhancedHand.jsx
import React, { useState, useMemo } from 'react';
import EnhancedCard from './EnhancedCard';
import { motion } from 'framer-motion';

const EnhancedHand = ({
  cards,
  onToggleSelect,
  bestHandCards = [],
  maxSelectable = 5,
  selectionMode = 'attack', // 'attack', 'discard', 'view'
}) => {
  const [hoverIndex, setHoverIndex] = useState(null);
  const [sortByValue, setSortByValue] = useState(true); // true = valeur, false = couleur

  // Animations for cards
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardAnimation = {
    hidden: { y: 50, opacity: 0 },
    show: { y: 0, opacity: 1 },
  };

  // Calcule le nombre de cartes sélectionnées
  const selectedCount = useMemo(
    () => cards.filter((card) => card.isSelected).length,
    [cards]
  );

  // Fonction pour gérer la sélection des cartes
  const handleCardSelect = (index) => {
    if (onToggleSelect && selectionMode !== 'view') {
      onToggleSelect(index);
    }
  };

  // Fonction pour basculer entre tri par valeur et tri par couleur
  const toggleSortMethod = () => {
    setSortByValue(!sortByValue);
  };

  // Trier les cartes de façon mémoïsée
  const sortedCards = useMemo(() => {
    if (!Array.isArray(cards)) {
      console.warn('cards is not an array:', cards);
      return [];
    }

    // Créer une copie avant de trier pour éviter de modifier l'original
    let newSortedCards = [...cards];

    if (sortByValue) {
      // Trier par valeur (numérique ascendante, de gauche à droite)
      newSortedCards.sort((a, b) => {
        // Vérifier que les propriétés existent
        const aValue = a.numericValue !== undefined ? a.numericValue : 0;
        const bValue = b.numericValue !== undefined ? b.numericValue : 0;
        return aValue - bValue;
      });
    } else {
      // Trier par couleur puis par valeur
      const suitOrder = { spades: 0, hearts: 1, diamonds: 2, clubs: 3 };
      newSortedCards.sort((a, b) => {
        // S'assurer que suit existe
        const aSuit = a.suit || 'spades';
        const bSuit = b.suit || 'spades';

        // D'abord par couleur
        const suitComparison =
          (suitOrder[aSuit] !== undefined ? suitOrder[aSuit] : 0) -
          (suitOrder[bSuit] !== undefined ? suitOrder[bSuit] : 0);

        if (suitComparison !== 0) return suitComparison;

        // Ensuite par valeur (ascendante)
        const aValue = a.numericValue !== undefined ? a.numericValue : 0;
        const bValue = b.numericValue !== undefined ? b.numericValue : 0;
        return aValue - bValue;
      });
    }

    return newSortedCards;
  }, [cards, sortByValue]);

  return (
    <div className="py-6 relative">
      {/* Bouton de tri */}
      <div className="mb-3 flex justify-end">
        <button
          onClick={toggleSortMethod}
          className="bg-gray-800 hover:bg-gray-700 text-sm text-white rounded px-3 py-1 flex items-center"
        >
          <span className="mr-2">Tri:</span>
          <span className="font-medium">
            {sortByValue ? 'Par valeur' : 'Par couleur'}
          </span>
        </button>
      </div>

      <motion.div
        className="flex justify-center items-end flex-wrap gap-2"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {sortedCards.map((card, index) => {
          if (!card) {
            console.warn('Invalid card at index', index);
            return null;
          }

          return (
            <motion.div
              key={index}
              variants={cardAnimation}
              whileHover={{
                y: -15,
                transition: { duration: 0.2 },
              }}
              onHoverStart={() => setHoverIndex(index)}
              onHoverEnd={() => setHoverIndex(null)}
              className="relative"
            >
              <EnhancedCard
                value={card.value}
                suit={card.suit}
                isSelected={card.isSelected}
                isHighlighted={bestHandCards.includes(index)}
                onToggleSelect={() => handleCardSelect(index)}
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

export default EnhancedHand;
