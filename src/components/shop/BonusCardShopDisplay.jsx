// src/components/shop/BonusCardShopDisplay.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { getSuitSymbol, getCardDisplayName } from '../../utils/bonusCardValuesGenerator';

/**
 * Composant pour afficher une carte bonus dans la boutique
 * avec sa valeur de carte à jouer visible
 */
const BonusCardShopDisplay = ({ card, onPurchase, disabled = false }) => {
  // Fonction pour obtenir la couleur en fonction de la rareté
  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common':
        return '#9CA3AF';
      case 'uncommon':
        return '#10B981';
      case 'rare':
        return '#3B82F6';
      case 'epic':
        return '#8B5CF6';
      case 'legendary':
        return '#F59E0B';
      default:
        return '#9CA3AF';
    }
  };

  // Obtenir la couleur du texte pour la carte selon la couleur
  const getTextColor = (suit) => {
    return ['hearts', 'diamonds'].includes(suit) ? 'text-red-500' : 'text-white';
  };

  if (!card) return null;

  return (
    <motion.div
      className="relative bg-gray-800 rounded-lg overflow-hidden shadow-lg"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
    >
      {/* Badge de rareté */}
      <div
        className="absolute top-0 right-0 px-2 py-1 text-xs font-bold text-white rounded-bl-lg"
        style={{ backgroundColor: getRarityColor(card.rarity) }}
      >
        {card.rarity}
      </div>

      {/* En-tête de la carte */}
      <div className="p-4 border-b border-gray-700">
        <h3 className="text-lg font-bold text-white">{card.name}</h3>
        <p className="text-sm text-gray-400">{card.description}</p>
      </div>

      {/* Valeur de la carte à jouer */}
      <div className="p-4 bg-gray-900">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-400">Valeur de la carte:</span>
          <div className={`font-bold ${getTextColor(card.cardSuit)}`}>
            {card.cardValue}
            {getSuitSymbol(card.cardSuit)}
          </div>
        </div>
        <div className="mt-2 text-center text-white">{getCardDisplayName(card)}</div>
      </div>

      {/* Infos et bouton d'achat */}
      <div className="p-4 bg-gray-800 border-t border-gray-700">
        <div className="flex justify-between items-center mb-3">
          <span className="text-sm text-gray-400">Type:</span>
          <span className="text-white">{card.effect === 'active' ? 'Actif' : 'Passif'}</span>
        </div>

        <button
          onClick={onPurchase}
          disabled={disabled}
          className={`
            w-full py-2 rounded text-white font-bold
            ${disabled ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
          `}
        >
          Acheter
        </button>
      </div>
    </motion.div>
  );
};

export default BonusCardShopDisplay;
