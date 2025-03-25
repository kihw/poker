// src/pages/ShopPage.jsx - Implémentation complète de la boutique
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';

// Redux selectors and actions
import { selectPlayerGold } from '../redux/selectors/playerSelectors';
import { initShop, purchaseItem } from '../redux/slices/shopSlice';
import { setGamePhase } from '../redux/slices/gameSlice';
import { setActionFeedback } from '../redux/slices/uiSlice';
import { spendGold, addShield, heal, addToInventory } from '../redux/slices/playerSlice';
import { addCard } from '../redux/slices/bonusCardsSlice';

// Components
import Navigation from '../components/ui/Navigation';
import { Button, Badge, Card, Tooltip, DESIGN_TOKENS } from '../components/ui/DesignSystem';

const ShopPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Selectors
  const shopItems = useSelector((state) => state.shop?.items || []);
  const playerGold = useSelector(selectPlayerGold) || 0;
  const isGameOver = useSelector((state) => state.game?.isGameOver || false);
  const gamePhase = useSelector((state) => state.game?.gamePhase);
  const shopAccessible = useSelector((state) => state.game.shopAccessible);
  const player = useSelector(
    (state) =>
      state.player || {
        health: 50,
        maxHealth: 50,
        gold: 100,
        level: 1,
      }
  );
  const itemsPurchased = useSelector((state) => state.shop.itemsPurchased || {});

  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [purchaseConfirm, setPurchaseConfirm] = useState(null);

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
          dispatch(
            setActionFeedback({
              message: "Erreur lors de l'initialisation de la boutique",
              type: 'error',
            })
          );
        });
    }
  }, [gamePhase, isGameOver, shopItems.length, dispatch, navigate, shopAccessible]);

  // Catégories disponibles dans la boutique
  const categories = [
    { id: 'all', name: 'Tous les articles', icon: '🛒' },
    { id: 'consumable', name: 'Potions & Consommables', icon: '🧪' },
    { id: 'permanent', name: 'Améliorations permanentes', icon: '⬆️' },
    { id: 'bonus_card_pack', name: 'Packs de cartes bonus', icon: '🃏' },
  ];

  // Filtrer les objets par catégorie
  const filteredItems = shopItems.filter(
    (item) => selectedCategory === 'all' || item.type === selectedCategory
  );

  // Vérifier si un article est limité et a atteint sa limite
  const isItemLimited = (item) => {
    if (!item.maxPurchases) return false;
    const purchases = itemsPurchased[item.id] || 0;
    return purchases >= item.maxPurchases;
  };

  // Gérer l'achat d'un article
  const handlePurchase = (item) => {
    // Vérifier si l'article a une limite d'achat
    if (isItemLimited(item)) {
      dispatch(
        setActionFeedback({
          message: "Vous avez atteint la limite d'achat pour cet article",
          type: 'warning',
        })
      );
      return;
    }

    // Vérifier si le joueur a assez d'or
    if (playerGold < item.price) {
      dispatch(
        setActionFeedback({
          message: "Pas assez d'or pour acheter cet article",
          type: 'warning',
        })
      );
      return;
    }

    // Pour les achats importants, demander confirmation
    if (item.price >= 100 && !purchaseConfirm) {
      setPurchaseConfirm(item);
      return;
    }

    // Fermer la confirmation si c'est la même
    if (purchaseConfirm && purchaseConfirm.id === item.id) {
      setPurchaseConfirm(null);
    }

    // Dépenser l'or
    dispatch(spendGold(item.price));

    // Enregistrer l'achat
    dispatch(purchaseItem({ itemIndex: shopItems.indexOf(item) }));

    // Appliquer les effets de l'article selon son type
    applyItemEffect(item);

    // Feedback
    dispatch(
      setActionFeedback({
        message: `${item.name} acheté !`,
        type: 'success',
      })
    );
  };

  // Appliquer les effets de l'article acheté
  const applyItemEffect = (item) => {
    switch (item.type) {
      case 'consumable':
        // Ajouter à l'inventaire pour utilisation future
        dispatch(
          addToInventory({
            id: item.id,
            name: item.name,
            description: item.description,
            effect: item.effect,
            usableInCombat: item.usableInCombat || false,
          })
        );
        break;

      case 'permanent':
        // Appliquer immédiatement l'effet permanent
        if (item.effect.type === 'maxHealth') {
          // Augmentation des PV max
          dispatch(heal(item.effect.value)); // Guérison du montant ajouté
        } else if (item.effect.type === 'bonusCardSlot') {
          // Augmentation du nombre d'emplacements de cartes bonus
          // L'effet est géré via itemsPurchased dans le reducer
        } else if (item.effect.type === 'shield') {
          // Ajout d'un bouclier
          dispatch(addShield(item.effect.value));
        }
        break;

      case 'bonus_card_pack':
        // Générer des cartes bonus aléatoires
        for (let i = 0; i < (item.count || 1); i++) {
          // Simulons une génération de carte (à remplacer par la vraie logique)
          const cardIds = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
          const randomIndex = Math.floor(Math.random() * cardIds.length);
          dispatch(addCard(cardIds[randomIndex]));
        }
        break;

      default:
        console.warn("Type d'article inconnu:", item.type);
    }
  };

  // Annuler la confirmation d'achat
  const cancelPurchase = () => {
    setPurchaseConfirm(null);
  };

  // Quitter la boutique
  const handleExit = () => {
    dispatch(setGamePhase('exploration'));
    navigate('/map');
  };

  // Afficher un message explicatif pour les types d'articles
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

  // Animation pour les articles
  const itemAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
      },
    }),
    exit: { opacity: 0, y: -10 },
  };

  // Rendu de l'article de boutique
  const renderShopItem = (item, index) => {
    const canAfford = playerGold >= item.price;
    const isLimited = isItemLimited(item);
    const itemTypeIcon =
      item.type === 'consumable'
        ? '🧪'
        : item.type === 'permanent'
          ? '⬆️'
          : item.type === 'bonus_card_pack'
            ? '🃏'
            : '📦';

    return (
      <motion.div
        key={`${item.id}-${index}`}
        custom={index}
        variants={itemAnimation}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden shadow-lg"
      >
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-bold text-white">{item.name}</h3>
            <div className="bg-yellow-600 text-black px-2 py-1 rounded text-sm font-bold flex items-center">
              <span className="mr-1">💰</span>
              {item.price}
            </div>
          </div>

          <p className="text-gray-300 text-sm mb-3">{item.description}</p>

          <div className="flex justify-between items-center">
            <Tooltip content={getItemTypeDescription(item.type)}>
              <div className="text-xs text-gray-400 flex items-center">
                <span className="mr-1">{itemTypeIcon}</span>
                {item.type === 'consumable'
                  ? 'Consommable'
                  : item.type === 'permanent'
                    ? 'Permanent'
                    : item.type === 'bonus_card_pack'
                      ? 'Pack de cartes'
                      : 'Divers'}
                {item.maxPurchases && (
                  <span className="ml-2">
                    ({itemsPurchased[item.id] || 0}/{item.maxPurchases})
                  </span>
                )}
              </div>
            </Tooltip>

            {purchaseConfirm && purchaseConfirm.id === item.id ? (
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePurchase(item)}
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
                onClick={() => handlePurchase(item)}
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
      {/* En-tête de la boutique */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center"
      >
        <div className="mb-4 md:mb-0">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <span className="text-2xl mr-2">🏪</span>
            Boutique du marchand
          </h2>
          <p className="text-gray-400 text-sm">
            Achetez des objets et des améliorations pour votre aventure
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-yellow-900 text-yellow-300 px-4 py-2 rounded-full flex items-center shadow-lg"
        >
          <span className="mr-2">💰</span>
          <span className="font-bold">{playerGold}</span>
        </motion.div>
      </motion.div>

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

      {/* Affichage du guide d'achat */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mb-6 bg-blue-900 bg-opacity-30 p-4 rounded-lg"
      >
        <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
          <span className="mr-2">ℹ️</span>
          Guide du marchand
        </h3>
        <ul className="text-blue-100 text-sm space-y-1">
          <li>
            • Les <strong>potions</strong> sont utilisables pendant le combat pour obtenir un
            avantage immédiat
          </li>
          <li>
            • Les <strong>améliorations permanentes</strong> s'appliquent instantanément et
            perdurent jusqu'à la fin de l'aventure
          </li>
          <li>
            • Les <strong>packs de cartes bonus</strong> ajoutent de nouvelles cartes à votre
            collection
          </li>
          <li>
            • Certains objets ont une <strong>limite d'achat</strong>, profitez-en tant qu'ils sont
            disponibles!
          </li>
        </ul>
      </motion.div>

      {/* Liste des articles */}
      <div className="flex-grow">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 bg-gray-800 rounded-lg">
            <p className="text-gray-400">Aucun objet disponible dans cette catégorie</p>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {filteredItems.map((item, index) => renderShopItem(item, index))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Pied de page avec status du joueur et bouton de sortie */}
      <div className="mt-6 pt-4 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0 bg-gray-800 p-3 rounded-lg flex space-x-6">
          <div className="flex items-center">
            <span className="text-red-500 mr-2">❤️</span>
            <span>
              {player.health}/{player.maxHealth}
            </span>
          </div>
          <div className="flex items-center">
            <span className="text-yellow-500 mr-2">💰</span>
            <span>{player.gold}</span>
          </div>
          <div className="flex items-center">
            <span className="text-blue-500 mr-2">📊</span>
            <span>Niveau {player.level}</span>
          </div>
        </div>

        <Button variant="outline" onClick={handleExit} className="flex items-center">
          <span className="mr-2">🚪</span>
          Quitter la boutique
        </Button>
      </div>

      <Navigation />
    </div>
  );
};

export default ShopPage;
