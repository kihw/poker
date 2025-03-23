// src/pages/ShopPage.jsx - Version corrigée et améliorée
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';

// Redux selectors and actions
import { selectPlayerGold } from '../redux/selectors/playerSelectors';
import { initShop, purchaseItem } from '../redux/slices/shopSlice';
import { setGamePhase } from '../redux/slices/gameSlice';
import { spendGold } from '../redux/slices/playerSlice';
import { setActionFeedback } from '../redux/slices/uiSlice';

// Components
import Navigation from '../components/ui/Navigation';

const ShopPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  // Selectors
  const shopItems = useSelector((state) => state.shop?.items || []);
  const playerGold = useSelector(selectPlayerGold) || 0;
  const isGameOver = useSelector((state) => state.game?.isGameOver || false);
  const gamePhase = useSelector((state) => state.game?.gamePhase);
  const player = useSelector((state) => state.player || {
    health: 50,
    maxHealth: 50,
    gold: 100,
    level: 1
  });

  // Initialiser la boutique au chargement
  useEffect(() => {
    // Vérifier si on est bien en phase de boutique
    if (gamePhase !== 'shop') {
      navigate('/map');
      return;
    }

    // Si le jeu est terminé, retourner à la page principale
    if (isGameOver) {
      navigate('/');
      return;
    }

    // Initialiser la boutique si nécessaire
    if (shopItems.length === 0) {
      setIsLoading(true);
      dispatch(initShop())
        .then(() => setIsLoading(false))
        .catch(() => {
          setIsLoading(false);
          dispatch(setActionFeedback({
            message: "Erreur lors de l'initialisation de la boutique",
            type: "error"
          }));
        });
    }
  }, [gamePhase, isGameOver, shopItems.length, dispatch, navigate]);

  // Gestion de l'achat d'un article
  const handlePurchase = (itemIndex) => {
    if (itemIndex >= 0 && itemIndex < shopItems.length) {
      const item = shopItems[itemIndex];

      // Vérifier si le joueur a assez d'or
      if (playerGold >= item.price) {
        // Dépenser l'or
        dispatch(spendGold(item.price));
        
        // Enregistrer l'achat
        dispatch(purchaseItem({ itemIndex }));
        
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
    }
  };

  // Quitter la boutique
  const handleExit = () => {
    dispatch(setGamePhase('exploration'));
    navigate('/map');
  };

  // Animations
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

  // Affichage d'un article
  const ShopItem = ({ item, index }) => (
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
            {item.type === 'consumable' ? '🧪 Consommable' : 
             item.type === 'permanent' ? '⬆️ Permanent' : 
             '🃏 Cartes bonus'}
          </div>
          <button
            onClick={() => handlePurchase(index)}
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

  // Écran de chargement
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
        <div className="text-white text-xl">Chargement de la boutique...</div>
      </div>
    );
  }

  // Si boutique vide ou indisponible
  if (!shopItems || shopItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 flex flex-col items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl mb-4">Boutique fermée</h2>
          <p className="mb-4">Le marchand n'a actuellement aucun article à proposer</p>
          <button
            onClick={handleExit}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Retour à la carte
          </button>
        </div>
        <Navigation />
      </div>
    );
  }

  // Affichage normal de la boutique
  return (
    <div className="min-h-screen bg-gray-900 p-4 flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex justify-between items-center"
      >
        <div>
          <h1 className="text-2xl font-bold text-white">Boutique du marchand</h1>
          <p className="text-gray-400">Achetez des objets pour votre aventure</p>
        </div>
        <div className="bg-yellow-900 text-yellow-300 px-4 py-2 rounded-full flex items-center">
          <span className="mr-2">💰</span>
          <span className="font-bold">{playerGold}</span>
        </div>
      </motion.div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <AnimatePresence>
          {shopItems.map((item, index) => (
            <ShopItem key={`${item.id}-${index}`} item={item} index={index} />
          ))}
        </AnimatePresence>
      </div>

      <div className="mt-auto pt-4 border-t border-gray-800 flex justify-between items-center">
        <div className="text-gray-400 flex space-x-4">
          <div>❤️ {player.health}/{player.maxHealth}</div>
          <div>💰 {player.gold}</div>
          <div>📊 Niveau {player.level}</div>
        </div>
        <button
          onClick={handleExit}
          className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded flex items-center"
        >
          <span className="mr-2">🚪</span>
          Quitter la boutique
        </button>
      </div>

      <Navigation />
    </div>
  );
};

export default ShopPage;
