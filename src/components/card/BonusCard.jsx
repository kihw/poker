import React from 'react';
import { motion } from 'framer-motion';

// Fonction utilitaire pour obtenir la couleur basée sur la rareté
const getRarityColor = (rarity) => {
  switch (rarity) {
    case 'common':
      return '#9CA3AF'; // gris
    case 'uncommon':
      return '#10B981'; // vert
    case 'rare':
      return '#3B82F6'; // bleu
    case 'epic':
      return '#8B5CF6'; // violet
    case 'legendary':
      return '#F59E0B'; // or
    default:
      return '#9CA3AF'; // gris par défaut
  }
};

// Fonction pour obtenir le symbole de la couleur
const getSuitSymbol = (suit) => {
  switch (suit) {
    case 'hearts':
      return '♥';
    case 'diamonds':
      return '♦';
    case 'clubs':
      return '♣';
    case 'spades':
      return '♠';
    default:
      return '';
  }
};

const BonusCard = ({
  card,
  onClick,
  isSelected = false,
  onUpgrade,
  onEquip,
  onUnequip,
  disabled = false,
}) => {
  // Obtenir la couleur de la rareté pour les styles
  const rarityColor = getRarityColor(card.rarity);
  const isRed = card.cardSuit === 'hearts' || card.cardSuit === 'diamonds';

  // Déterminer si la carte peut être améliorée
  const canUpgrade = card.level < 3 && onUpgrade;

  // Animation
  const cardAnimation = {
    initial: { scale: 0.9, opacity: 0.6 },
    animate: { scale: 1, opacity: 1 },
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
  };

  return (
    <motion.div
      className={`relative overflow-hidden rounded-lg border ${
        isSelected ? 'border-blue-500 shadow-blue-500/50 shadow-lg' : 'border-gray-700'
      } bg-gray-800 hover:bg-gray-700 transition-all`}
      onClick={disabled ? undefined : onClick}
      {...cardAnimation}
    >
      {/* En-tête de la carte (nom et rareté) */}
      <div className="p-3 border-b border-gray-700">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-white">{card.name}</h3>
          <div className="flex items-center">
            <span
              className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ backgroundColor: rarityColor, color: 'white' }}
            >
              {card.rarity}
            </span>
            {card.level > 1 && (
              <span className="ml-1 text-xs px-2 py-0.5 bg-yellow-500 text-black rounded-full">
                Nv. {card.level}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Valeur de la carte à jouer */}
      <div className="p-3 flex justify-between items-center">
        <div className="text-gray-400 text-xs">Carte:</div>
        <div className={`text-xl font-bold ${isRed ? 'text-red-500' : 'text-blue-300'}`}>
          {card.cardValue}
          {getSuitSymbol(card.cardSuit)}
        </div>
      </div>

      {/* Description et effet */}
      <div className="p-3 border-t border-gray-700">
        <p className="text-sm text-gray-300 mb-3">{card.description}</p>
        <div className="flex justify-between items-center text-xs text-gray-400">
          <div>
            Type:{' '}
            <span className="font-medium">{card.effect === 'active' ? 'Active' : 'Passive'}</span>
          </div>
          {card.effect === 'active' && (
            <div>
              Utilisations: <span className="font-medium">{card.uses || 1}</span>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      {!disabled && (
        <div className="p-3 bg-gray-900 flex justify-between">
          {onEquip && !isSelected && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEquip(card.id);
              }}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded"
            >
              Équiper
            </button>
          )}
          {onUnequip && isSelected && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUnequip(card.id);
              }}
              className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded"
            >
              Retirer
            </button>
          )}
          {canUpgrade && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUpgrade(card.id);
              }}
              className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded"
            >
              Améliorer
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default BonusCard;
