// src/components/card/Hand.jsx - Corrigé et optimisé
import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import Card from './Card'; // Import du composant Card standard

const Hand = ({
  cards = [],
  onToggleSelect,
  bestHandCards = [],
  maxSelectable = 5,
  selectionMode = 'attack', // 'attack', 'discard', 'view'
}) => {
  const [hoverIndex, setHoverIndex] = useState(null);
  const [sortByValue, setSortByValue] = useState(true); // true = valeur, false = couleur

  // Validation pour éviter les erreurs
  const validCards = useMemo(() => {
    if (!Array.isArray(cards)) {
      console.warn('cards is not an array:', cards);
      return [];
    }
    // Filtrer les cartes invalides
    return cards.filter(card => card && typeof card === 'object');
  }, [cards]);

  // Animations pour les cartes
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
    () => validCards.filter((card) => card.isSelected).length,
    [validCards]
  );

  // Fonction pour gérer la sélection des cartes
  const handleCardSelect = useCallback(
    (index) => {
      if (onToggleSelect && selectionMode !== 'view' && index >= 0 && index < validCards.length) {
        // Log pour déboguer la sélection
        console.log('Selecting card at index:', index);
        onToggleSelect(index);
      }
    },
    [onToggleSelect, selectionMode, validCards.length]
  );

  // Fonction pour basculer entre tri par valeur et tri par couleur
  const toggleSortMethod = useCallback(() => {
    setSortByValue((prev) => !prev);
  }, []);

  // Créer une clé unique pour chaque carte basée sur ses propriétés
  const getCardKey = useCallback((card, index) => {
    // Utiliser un fallback en cas de valeurs manquantes
    const value = card.value || '';
    const suit = card.suit || '';
    return `${value}-${suit}-${index}`;
  }, []);

  // Trier les cartes de façon mémoïsée
  const sortedCards = useMemo(() => {
    // Ajouter l'index original à chaque carte avant de trier
    const cardsWithIndex = validCards.map((card, idx) => ({
      ...card,
      originalIndex: idx,
    }));

    if (sortByValue) {
      // Trier par valeur (numérique ascendante, de gauche à droite)
      cardsWithIndex.sort((a, b) => {
        // Vérifier que les propriétés existent
        const aValue = a.numericValue !== undefined ? a.numericValue : 0;
        const bValue = b.numericValue !== undefined ? b.numericValue : 0;
        return aValue - bValue;
      });
    } else {
      // Trier par couleur puis par valeur
      const suitOrder = { spades: 0, hearts: 1, diamonds: 2, clubs: 3 };
      cardsWithIndex.sort((a, b) => {
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

    return cardsWithIndex;
  }, [validCards, sortByValue]);

  // Rendu sécurisé en cas d'absence de cartes
  if (!validCards.length) {
    return (
      <div className="py-6 text-center text-gray-400">
        Aucune carte disponible
      </div>
    );
  }

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
        {sortedCards.map((card) => {
          // Utiliser l'index original stocké lors du tri
          const originalIndex = card.originalIndex;

          return (
            <motion.div
              key={getCardKey(card, originalIndex)}
              variants={cardAnimation}
              whileHover={{
                y: -15,
                transition: { duration: 0.2 },
              }}
              onHoverStart={() => setHoverIndex(originalIndex)}
              onHoverEnd={() => setHoverIndex(null)}
              className="relative"
            >
              <Card
                value={card.value}
                suit={card.suit}
                isSelected={card.isSelected}
                isHighlighted={bestHandCards.includes(originalIndex)}
                onToggleSelect={() => handleCardSelect(originalIndex)}
                selectionType={selectionMode}
                disabled={
                  !card.isSelected &&
                  selectedCount >= maxSelectable &&
                  selectionMode === 'attack'
                }
                rarity={card.rarity || 'common'}
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

      {/* Debugging - Afficher les indices des cartes sélectionnées */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-center text-xs text-yellow-400 mt-2">
          Cartes sélectionnées: {validCards.filter((c) => c.isSelected).length}
        </div>
      )}
    </div>
  );
};

export default React.memo(Hand);
