// src/components/shop/ShopItem.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tooltip } from '../ui/DesignSystem';

/**
 * Composant pour afficher un article individuel dans la boutique
 *
 * @param {Object} item - L'article à afficher
 * @param {Function} onPurchase - Fonction appelée lors de l'achat
 * @param {boolean} canAfford - Si le joueur a assez d'or pour acheter
 * @param {boolean} isLimited - Si l'article a atteint sa limite d'achat
 * @param {number} currentPurchases - Nombre d'exemplaires déjà achetés
 * @param {number} index - Index pour l'animation
 */
const ShopItem = ({ item, onPurchase, canAfford, isLimited, currentPurchases = 0, index = 0 }) => {
  const [confirmPurchase, setConfirmPurchase] = useState(false);

  // Animation pour l'entrée de l'article
  const itemAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delay: index * 0.1,
        duration: 0.5,
      },
    },
    exit: { opacity: 0, y: -10 },
  };

  // Obtenir l'icône du type d'article
  const getItemTypeIcon = () => {
    switch (item.type) {
      case 'consumable':
        return '🧪';
      case 'permanent':
        return '⬆️';
      case 'bonus_card_pack':
        return '🃏';
      default:
        return '📦';
    }
  };

  // Obtenir la description du type d'article
  const getItemTypeDescription = (type) => {
    switch (type) {
      case 'consumable':
        return 'Objet à usage unique, utilisable pendant un combat';
      case 'permanent':
        return "Amélioration permanente qui s'applique immédiatement";
      case 'bonus_card_pack':
        return 'Contient des cartes bonus aléatoires qui rejoignent votre collection';
      default:
        return 'Article de boutique';
    }
  };

  // Obtenir le libellé du type d'article
  const getItemTypeLabel = (type) => {
    switch (type) {
      case 'consumable':
        return 'Consommable';
      case 'permanent':
        return 'Permanent';
      case 'bonus_card_pack':
        return 'Pack de cartes';
      default:
        return 'Divers';
    }
  };

  // Gérer le clic sur le bouton d'achat
  const handlePurchaseClick = () => {
    // Pour les achats coûteux, demander confirmation
    if (item.price >= 100 && !confirmPurchase) {
      setConfirmPurchase(true);
      return;
    }

    // Appeler la fonction d'achat fournie par le parent
    onPurchase(item);

    // Réinitialiser l'état de confirmation
    setConfirmPurchase(false);
  };

  // Annuler l'achat
  const cancelPurchase = (e) => {
    e.stopPropagation();
    setConfirmPurchase(false);
  };

  return (
    <motion.div
      variants={itemAnimation}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
    >
      {/* En-tête de l'article avec nom et prix */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-white">{item.name}</h3>
          <div className="bg-yellow-600 text-black px-2 py-1 rounded text-sm font-bold flex items-center">
            <span className="mr-1">💰</span>
            {item.price}
          </div>
        </div>

        {/* Description de l'article */}
        <p className="text-gray-300 text-sm mb-3">{item.description}</p>

        {/* Détails du type et bouton d'achat */}
        <div className="flex justify-between items-center">
          <Tooltip content={getItemTypeDescription(item.type)}>
            <div className="text-xs text-gray-400 flex items-center">
              <span className="mr-1">{getItemTypeIcon()}</span>
              {getItemTypeLabel(item.type)}
              {item.maxPurchases && (
                <span className="ml-2">
                  ({currentPurchases}/{item.maxPurchases})
                </span>
              )}
            </div>
          </Tooltip>

          {/* Bouton d'achat ou confirmation */}
          {confirmPurchase ? (
            <div className="flex space-x-2">
              <button
                onClick={handlePurchaseClick}
                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
              >
                Confirmer
              </button>
              <button
                onClick={cancelPurchase}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm"
              >
                Annuler
              </button>
            </div>
          ) : (
            <button
              onClick={handlePurchaseClick}
              disabled={!canAfford || isLimited}
              className={`px-3 py-1 rounded ${
                !canAfford
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : isLimited
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {isLimited ? 'Limite atteinte' : canAfford ? 'Acheter' : "Pas assez d'or"}
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ShopItem;
