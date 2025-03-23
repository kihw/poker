// src/components/shop/ShopInterface.jsx - Optimisé et refactorisé
import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/DesignSystem';
import ImprovedPlayerStatus from '../player/ImprovedPlayerStatus';
import ProductCard from './ProductCard';

// Import des actions Redux
import { initShop } from '../../redux/slices/shopSlice';
import { setGamePhase } from '../../redux/slices/gameSlice';
import { setActionFeedback } from '../../redux/slices/uiSlice';
import { fetchData } from '../../utils/apiUtils';

const ShopInterface = () => {
  const dispatch = useDispatch();

  // Sélecteurs Redux
  const shopItems = useSelector((state) => state.shop.items);
  const playerGold = useSelector((state) => state.player.gold);
  const player = useSelector((state) => state.player);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  // Initialiser la boutique au chargement
  useEffect(() => {
    const loadShopItems = async () => {
      if (shopItems.length === 0) {
        setIsLoading(true);
        
        try {
          await fetchData(
            () => dispatch(initShop()).unwrap(),
            {
              errorMessage: "Erreur lors du chargement des articles de la boutique",
              successMessage: "Boutique chargée avec succès",
            },
            dispatch
          );
        } catch (error) {
          console.error("Erreur lors de l'initialisation de la boutique:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadShopItems();
  }, [dispatch, shopItems.length]);

  // Catégories disponibles dans la boutique
  const categories = [
    { id: 'all', name: 'Tout', icon: '🛒' },
    { id: 'consumable', name: 'Consommables', icon: '🧪' },
    { id: 'permanent', name: 'Améliorations', icon: '⬆️' },
    { id: 'bonus_card_pack', name: 'Cartes bonus', icon: '🃏' },
  ];

  // Filtrer les objets par catégorie
  const filteredItems = useCallback(() => {
    return selectedCategory === 'all'
      ? shopItems
      : shopItems.filter((item) => item.type === selectedCategory);
  }, [selectedCategory, shopItems]);

  // Quitter la boutique
  const handleExit = () => {
    dispatch(setGamePhase('exploration'));
  };

  // Animation pour le titre
  const titleVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        type: 'spring',
        stiffness: 100,
      },
    },
  };

  // Styles pour le compteur d'or
  const goldCounterStyle = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    padding: '0.5rem 1rem',
    backgroundColor: '#78350f', // amber-900
    borderRadius: '9999px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
  };

  // Affichage du chargement
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <div className="text-white text-xl">Chargement de la boutique...</div>
      </div>
    );
  }

  // Filtrer les articles actifs pour l'affichage
  const itemsToShow = filteredItems();

  return (
    <div className="min-h-screen bg-gray-900 p-4 flex flex-col">
      {/* En-tête de la boutique */}
      <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
        <motion.div
          variants={titleVariants}
          initial="hidden"
          animate="visible"
          className="mb-4 md:mb-0"
        >
          <h2 className="text-2xl font-bold text-white flex items-center">
            <span className="text-2xl mr-2">🏪</span>
            Boutique du marchand
          </h2>
          <p className="text-gray-400 text-sm">
            Achetez des objets et des améliorations pour votre aventure
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          style={goldCounterStyle}
        >
          <span className="text-yellow-300 mr-2">💰</span>
          <span className="text-white font-bold">{playerGold}</span>
        </motion.div>
      </div>

      {/* Filtres des catégories */}
      <div className="mb-6">
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-3 py-2 rounded-md flex items-center whitespace-nowrap transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Liste des articles */}
      <div className="flex-grow">
        {itemsToShow.length === 0 ? (
          <div className="text-center py-12 bg-gray-800 rounded-lg">
            <p className="text-gray-400">Aucun objet disponible dans cette catégorie</p>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {itemsToShow.map((item, index) => (
                <ProductCard 
                  key={`${item.id}-${index}`} 
                  item={item} 
                  index={index} 
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Pied de page avec status du joueur et bouton de sortie */}
      <div className="mt-6 pt-4 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <ImprovedPlayerStatus
            hp={player.health}
            maxHp={player.maxHealth}
            gold={player.gold}
            xp={player.experience}
            level={player.level}
            shield={player.shield}
            compact={true}
          />
        </div>

        <Button variant="outline" onClick={handleExit}>
          <span className="mr-2">🚪</span>
          Quitter la boutique
        </Button>
      </div>
    </div>
  );
};

export default React.memo(ShopInterface);
