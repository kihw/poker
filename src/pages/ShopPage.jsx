// src/pages/ShopPage.jsx - Version refactorisée avec ProductCard
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';

// Redux selectors and actions
import { selectPlayerGold } from '../redux/selectors/playerSelectors';
import { initShop } from '../redux/slices/shopSlice';
import { setGamePhase } from '../redux/slices/gameSlice';
import { setActionFeedback } from '../redux/slices/uiSlice';

// Components
import Navigation from '../components/ui/Navigation';
import ProductCard from '../components/shop/ProductCard';

const ShopPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Selectors
  const shopItems = useSelector((state) => state.shop?.items || []);
  const playerGold = useSelector(selectPlayerGold) || 0;
  const isGameOver = useSelector((state) => state.game?.isGameOver || false);
  const gamePhase = useSelector((state) => state.game?.gamePhase);
  const shopAccessible = useSelector((state) => state.game.shopAccessible);
  const player = useSelector((state) => state.player || {
    health: 50,
    maxHealth: 50,
    gold: 100,
    level: 1
  });

  const [isLoading, setIsLoading] = useState(false);

  // Initialiser la boutique au chargement
  useEffect(() => {
    // Vérifier l'accessibilité de la boutique
    if (!shopAccessible) {
      navigate('/map');
      return;
    }

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
        .catch((error) => {
          console.error("Erreur d'initialisation de la boutique:", error);
          setIsLoading(false);
          dispatch(setActionFeedback({
            message: "Erreur lors de l'initialisation de la boutique",
            type: "error"
          }));
        });
    }
  }, [gamePhase, isGameOver, shopItems.length, dispatch, navigate, shopAccessible]);

  // Quitter la boutique
  const handleExit = () => {
    dispatch(setGamePhase('exploration'));
    navigate('/map');
  };

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
  if (!shopItems || shopItems.length === 0 || !shopAccessible) {
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
            <ProductCard key={`${item.id}-${index}`} item={item} index={index} />
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
