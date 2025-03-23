// src/components/shop/ProductCard.jsx
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { selectPlayerGold } from '../../redux/selectors/playerSelectors';
import { purchaseItem } from '../../redux/slices/shopSlice';
import { spendGold } from '../../redux/slices/playerSlice';
import { setActionFeedback } from '../../redux/slices/uiSlice';

// Animation pour les éléments de boutique
const itemAnimation = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5
    }
  }),
  exit: { opacity: 0, y: -10 }
};

/**
 * Composant pour afficher et gérer un article de la boutique
 * @param {Object} item - L'article à afficher
 * @param {number} index - L'index de l'article dans la liste
 */
const ProductCard = ({ item, index }) => {
  const dispatch = useDispatch();
  const playerGold = useSelector(selectPlayerGold) || 0;
  
  // Détermination du type d'icône en fonction du type d'article
  const itemTypeIcon = useMemo(() => {
    switch(item.type) {
      case 'consumable': return '🧪 Consommable';
      case 'permanent': return '⬆️ Permanent';
      case 'bonus_card_pack': return '🃏 Cartes bonus';
      default: return '📦 Divers';
    }
  }, [item.type]);

  // Gestion de l'achat d'un article
  const handlePurchase = () => {
    // Vérifier si le joueur a assez d'or
    if (playerGold >= item.price) {
      // Dépenser l'or
      dispatch(spendGold(item.price));
      
      // Enregistrer l'achat
      dispatch(purchaseItem({ itemIndex: index }));
      
      // Feedback
      dispatch(setActionFeedback({
        message: `${item.name} acheté !`,
        type: "success"
      }));
    } else {
      dispatch(setActionFeedback({
        message: "Or insuffisant pour cet achat",
        type: "warning"
      }));
    }
  };

  return (
    <motion.div
      custom={index}
      variants={itemAnimation}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden"
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-white">{item.name}</h3>
          <div className="bg-yellow-600 text-black px-2 py-1 rounded text-sm font-bold">
            {item.price} or
          </div>
        </div>
        <p className="text-gray-300 text-sm mb-3">{item.description}</p>
        <div className="flex justify-between items-center">
          <div className="text-xs text-gray-400">
            {itemTypeIcon}
          </div>
          <button
            onClick={handlePurchase}
            disabled={playerGold < item.price}
            className={`px-3 py-1 rounded ${
              playerGold >= item.price
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            }`}
          >
            Acheter
          </button>
        </div>
      </div>
    </motion.div>
  );
};

// Optimisation avec React.memo pour éviter les re-renders inutiles
export default React.memo(ProductCard);
