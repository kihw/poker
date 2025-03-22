// src/pages/ShopPage.jsx - Migré vers Redux
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectShopItems,
  selectIsGameOver,
  selectGamePhase,
} from '../redux/selectors/gameSelectors';
import { selectPlayerGold } from '../redux/selectors/playerSelectors';
import { initShop, purchaseItem } from '../redux/slices/shopSlice';
import { setGamePhase } from '../redux/slices/gameSlice';
import { spendGold } from '../redux/slices/playerSlice';
import Navigation from '../components/ui/Navigation';

const ShopPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Sélecteurs Redux
  const shopItems = useSelector(selectShopItems);
  const playerGold = useSelector(selectPlayerGold);
  const isGameOver = useSelector(selectIsGameOver);
  const gamePhase = useSelector(selectGamePhase);

  // Vérifier l'état du jeu au chargement
  useEffect(() => {
    // S'assurer que la boutique est initialisée
    if (shopItems.length === 0 && gamePhase === 'shop') {
      dispatch(initShop());
    }

    // Rediriger vers la page principale si le jeu est terminé
    if (isGameOver) {
      navigate('/');
    }
  }, [isGameOver, gamePhase, shopItems.length, dispatch, navigate]);

  // Ajout d'un gestionnaire de secours pour fermer la boutique
  const handleForceExit = () => {
    // Changer la phase du jeu à exploration
    dispatch(setGamePhase('exploration'));
    // Rediriger vers la carte
    navigate('/map');
  };

  // Gérer l'achat d'un article
  const handlePurchase = (itemIndex) => {
    if (itemIndex >= 0 && itemIndex < shopItems.length) {
      const item = shopItems[itemIndex];

      // Vérifier si le joueur a assez d'or
      if (playerGold >= item.price) {
        // Dépenser l'or
        dispatch(spendGold(item.price));
        // Enregistrer l'achat
        dispatch(purchaseItem({ itemIndex }));
      }
    }
  };

  // If shop is not available
  if (!shopItems || shopItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-900 p-4 flex flex-col items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl mb-4">Boutique fermée</h2>
          <p>Revenez plus tard lorsque la boutique sera disponible</p>
          <button
            onClick={handleForceExit}
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Retour à la carte
          </button>
        </div>
        <Navigation />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-gray-800 rounded-xl p-6 shadow-xl">
        <h2 className="text-2xl font-bold mb-6 text-white">Boutique</h2>

        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {shopItems.map((item, index) => (
            <div
              key={index}
              className="bg-gray-700 rounded-lg p-4 border border-gray-600 flex justify-between items-start"
            >
              <div>
                <h3 className="text-lg font-bold text-white">{item.name}</h3>
                <p className="text-sm text-gray-300 mt-1">{item.description}</p>
                <div className="mt-2 text-yellow-400">{item.price} or</div>
              </div>
              <button
                className={`px-3 py-1 rounded ${
                  playerGold >= item.price
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-gray-500 text-gray-300 cursor-not-allowed'
                }`}
                disabled={playerGold < item.price}
                onClick={() => handlePurchase(index)}
              >
                Acheter
              </button>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-between items-center">
          <div className="text-white">
            <span className="text-yellow-400 mr-2">💰</span>
            Votre or: {playerGold}
          </div>
          <div>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              onClick={() => dispatch(setGamePhase('exploration'))}
            >
              Quitter la boutique
            </button>
            {/* Bouton de secours qui redirige directement */}
            <button
              className="ml-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
              onClick={handleForceExit}
            >
              Forcer le retour à la carte
            </button>
          </div>
        </div>
      </div>
      <Navigation />
    </div>
  );
};

export default ShopPage;
