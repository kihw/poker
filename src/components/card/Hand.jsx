// src/components/card/Hand.jsx - Version améliorée pour sélection flexible
import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import Card from './Card'; // Import du composant Card standard

const Hand = ({
  cards = [],
  onToggleSelect,
  bestHandCards = [],
  maxSelectable = 5,
  onActionSelect, // Nouvelle prop pour gérer le choix d'action après sélection
}) => {
  const [hoverIndex, setHoverIndex] = useState(null);
  const [sortByValue, setSortByValue] = useState(true); // true = valeur, false = couleur
  const [selectionMode, setSelectionMode] = useState(null); // null = aucune sélection en cours

  // Validation pour éviter les erreurs
  const validCards = useMemo(() => {
    if (!Array.isArray(cards)) {
      console.warn('cards is not an array:', cards);
      return [];
    }
    // Filtrer les cartes invalides
    return cards.filter((card) => card && typeof card === 'object');
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
  const selectedCards = useMemo(() => validCards.filter((card) => card.isSelected), [validCards]);

  // Fonction pour gérer la sélection des cartes
  const handleCardSelect = useCallback(
    (index) => {
      if (onToggleSelect && index >= 0 && index < validCards.length) {
        const card = validCards[index];

        // Si aucune carte n'est sélectionnée, initialiser le mode de sélection
        if (selectedCards.length === 0) {
          onToggleSelect(index);
          setSelectionMode('choosing');
          return;
        }

        // Mode défausse : limite de 2 cartes
        if (selectionMode === 'discard') {
          if (selectedCards.length < 2 || card.isSelected) {
            onToggleSelect(index);
          }
          return;
        }

        // Mode attaque : limite de 5 cartes
        if (selectionMode === 'attack') {
          if (selectedCards.length < 5 || card.isSelected) {
            onToggleSelect(index);
          }
          return;
        }
      }
    },
    [onToggleSelect, validCards, selectedCards, selectionMode]
  );

  // Fonction pour choisir l'action après sélection d'une carte
  const handleActionChoice = useCallback(
    (action) => {
      setSelectionMode(action);
      if (onActionSelect) {
        onActionSelect(action);
      }
    },
    [onActionSelect]
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
    return <div className="py-6 text-center text-gray-400">Aucune carte disponible</div>;
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
          <span className="font-medium">{sortByValue ? 'Par valeur' : 'Par couleur'}</span>
        </button>
      </div>

      {/* Menu de choix d'action après sélection de carte */}
      {selectionMode === 'choosing' && selectedCards.length > 0 && (
        <div className="mb-4 flex justify-center space-x-4">
          <button
            onClick={() => handleActionChoice('attack')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            ⚔️ Attaquer
          </button>
          <button
            onClick={() => handleActionChoice('discard')}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
          >
            🔄 Défausser
          </button>
        </div>
      )}

      <motion.div
        className="flex justify-center items-end flex-wrap gap-2"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {sortedCards.map((card, index) => {
          // Utiliser l'index original stocké lors du tri
          const originalIndex = card.originalIndex;

          // Déterminer si cette carte est désactivée
          const isDisabled =
            !card.isSelected &&
            selectedCards.length > 0 &&
            ((selectionMode === 'attack' && selectedCards.length >= 5) ||
              (selectionMode === 'discard' && selectedCards.length >= 2));

          return (
            <motion.div
              key={getCardKey(card, originalIndex)}
              variants={cardAnimation}
              whileHover={{
                y: isDisabled ? 0 : -15,
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
                selectionType={selectionMode === 'discard' ? 'discard' : 'attack'}
                disabled={isDisabled}
                rarity={card.rarity || 'common'}
              />
            </motion.div>
          );
        })}
      </motion.div>

      {/* Instructions */}
      {selectionMode === 'attack' && (
        <div className="text-center text-sm text-gray-300 mt-4">
          Sélectionnez 1 à 5 cartes pour attaquer
        </div>
      )}
      {selectionMode === 'discard' && (
        <div className="text-center text-sm text-gray-300 mt-4">
          Sélectionnez jusqu'à 2 cartes à défausser
        </div>
      )}
      {(!selectionMode || selectionMode === 'choosing') && (
        <div className="text-center text-sm text-gray-300 mt-4">
          Sélectionnez une carte puis choisissez une action
        </div>
      )}

      {/* Debugging - Afficher les indices des cartes sélectionnées */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-center text-xs text-yellow-400 mt-2">
          Cartes sélectionnées: {selectedCards.length}
          {selectionMode && ` (Mode: ${selectionMode})`}
        </div>
      )}
    </div>
  );
};

export default React.memo(Hand);
