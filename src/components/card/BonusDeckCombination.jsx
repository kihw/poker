// src/components/card/BonusDeckCombination.jsx - Version améliorée
import React from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Card as DesignCard, Badge } from '../ui/DesignSystem';
import Card from './Card';

const BonusDeckCombination = () => {
  const deckCombination = useSelector((state) => state.bonusCards.deckCombination);
  const activeBonusCards = useSelector((state) => state.bonusCards.active || []);
  const maxSlots = useSelector((state) => state.bonusCards.maxSlots || 5);

  // Si aucune combinaison active ou pas assez de cartes, afficher un message d'aide
  if (!deckCombination?.isActive) {
    return (
      <DesignCard variant="elevated" className="p-4 bg-gray-800 rounded-lg mb-4 opacity-75">
        <h3 className="text-lg font-bold text-center text-gray-400 mb-3">
          Pas de combinaison active
        </h3>
        <p className="text-sm text-gray-500 text-center">
          {activeBonusCards.length === 0
            ? 'Équipez des cartes bonus pour activer des combinaisons'
            : activeBonusCards.length < 5
              ? `Équipez ${5 - activeBonusCards.length} cartes supplémentaires pour une combinaison complète`
              : 'Aucune combinaison valide détectée'}
        </p>
      </DesignCard>
    );
  }

  // Obtenir la couleur en fonction du type de combinaison
  const getCombinationColor = (type) => {
    switch (type) {
      case 'HIGH_CARD':
        return '#9CA3AF'; // gris
      case 'PAIR':
        return '#60A5FA'; // bleu clair
      case 'TWO_PAIR':
        return '#3B82F6'; // bleu
      case 'THREE_OF_A_KIND':
        return '#8B5CF6'; // violet
      case 'STRAIGHT':
        return '#EC4899'; // rose
      case 'FLUSH':
        return '#F59E0B'; // orange
      case 'FULL_HOUSE':
        return '#EF4444'; // rouge
      case 'FOUR_OF_A_KIND':
        return '#10B981'; // vert
      case 'STRAIGHT_FLUSH':
        return '#6366F1'; // indigo
      case 'ROYAL_FLUSH':
        return '#F59E0B'; // or
      default:
        return '#6B7280'; // gris par défaut
    }
  };

  const combinationColor = getCombinationColor(deckCombination.combination?.type);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mb-4"
      >
        <DesignCard
          variant="elevated"
          className="p-4 overflow-hidden border-l-4"
          style={{ borderLeftColor: combinationColor }}
        >
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: combinationColor }}
              />
              <h3 className="font-bold text-lg">{deckCombination.combination?.name || 'Aucune'}</h3>
            </div>
            <Badge style={{ backgroundColor: combinationColor }}>
              {deckCombination.effect?.type === 'multistat' ? 'Multi-effet' : 'Actif'}
            </Badge>
          </div>

          {/* Description de l'effet */}
          <div className="mb-4 p-3 bg-gray-800 rounded-lg text-gray-300">
            <div className="mb-2 font-medium">{deckCombination.description}</div>

            {/* Détails de l'effet selon le type */}
            {deckCombination.effect?.type === 'multistat' && (
              <div className="mt-1 grid grid-cols-2 gap-2">
                {Object.entries(deckCombination.effect.values || {}).map(([stat, value]) => (
                  <div key={stat} className="flex items-center">
                    <span className="text-xs bg-gray-700 px-2 py-1 rounded">
                      {stat}: +{value}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cartes qui forment la combinaison */}
          <div>
            <h4 className="text-sm text-gray-400 mb-2">Cartes de la combinaison:</h4>
            <div className="flex flex-wrap justify-center gap-2">
              {activeBonusCards.map((card, index) => (
                <div key={`deck-card-${index}`} className="transform scale-75 origin-center">
                  <Card
                    value={card.cardValue}
                    suit={card.cardSuit}
                    selectionType="view"
                    scale={0.8}
                  />
                </div>
              ))}

              {/* Indique les emplacements vides */}
              {activeBonusCards.length < 5 && (
                <div className="flex items-center">
                  <span className="text-sm bg-gray-700 px-2 py-1 rounded text-gray-400">
                    + {5 - activeBonusCards.length} carte(s) manquante(s)
                  </span>
                </div>
              )}
            </div>
          </div>
        </DesignCard>
      </motion.div>
    </AnimatePresence>
  );
};

export default React.memo(BonusDeckCombination);
