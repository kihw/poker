// src/components/shop/ShopInterface.jsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Card, Badge, COLORS, ICONS } from '../ui/DesignSystem';
import ImprovedPlayerStatus from '../player/ImprovedPlayerStatus';

// Import des actions Redux
import { initShop, purchaseItem } from '../../redux/slices/shopSlice';
import { spendGold } from '../../redux/slices/playerSlice';
import { setGamePhase } from '../../redux/slices/gameSlice';
import { setActionFeedback } from '../../redux/slices/uiSlice';

const ShopInterface = () => {
  const dispatch = useDispatch();

  // Sélecteurs Redux
  const shopItems = useSelector((state) => state.shop.items);
  const playerGold = useSelector((state) => state.player.gold);
  const player = useSelector((state) => state.player);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [hoveredItem, setHoveredItem] = useState(null);
  const [purchaseAnimation, setPurchaseAnimation] = useState(null);

  // Initialiser la boutique au chargement
  useEffect(() => {
    if (shopItems.length === 0) {
      dispatch(initShop());
    }
  }, [dispatch, shopItems.length]);

  // Catégories disponibles dans la boutique
  const categories = [
    { id: 'all', name: 'Tout', icon: '🛒' },
    { id: 'consumable', name: 'Consommables', icon: '🧪' },
    { id: 'permanent', name: 'Améliorations', icon: '⬆️' },
    { id: 'bonus_card_pack', name: 'Cartes bonus', icon: '🃏' },
  ];

  // Filtrer les objets par catégorie
  const filteredItems =
    selectedCategory === 'all'
      ? shopItems
      : shopItems.filter((item) => item.type === selectedCategory);

  // Gérer l'achat d'un objet
  const handlePurchase = (itemIndex) => {
    const item = shopItems[itemIndex];

    // Vérifier si le joueur a assez d'or
    if (playerGold < item.price) {
      dispatch(
        setActionFeedback({
          message: "Pas assez d'or pour acheter cet objet",
          type: 'warning',
        })
      );
      return;
    }

    // Animer l'achat
    setPurchaseAnimation(itemIndex);

    // Après l'animation, effectuer l'achat
    setTimeout(() => {
      // Dépenser l'or
      dispatch(spendGold(item.price));

      // Enregistrer l'achat
      dispatch(purchaseItem({ itemIndex }));

      // Feedback pour l'utilisateur
      dispatch(
        setActionFeedback({
          message: `${item.name} acheté avec succès !`,
          type: 'success',
        })
      );

      // Réinitialiser l'animation
      setPurchaseAnimation(null);
    }, 500);
  };

  // Quitter la boutique
  const handleExit = () => {
    dispatch(setGamePhase('exploration'));
  };

  // Obtenir une icône pour un type d'objet
  const getItemIcon = (item) => {
    switch (item.type) {
      case 'consumable':
        return item.effect.type === 'heal'
          ? '❤️'
          : item.effect.type === 'shield'
            ? '🛡️'
            : item.effect.type === 'tempDamage'
              ? '⚔️'
              : '🧪';
      case 'permanent':
        return item.effect.type === 'maxHealth'
          ? '❤️'
          : item.effect.type === 'bonusCardSlot'
            ? '🃏'
            : '⬆️';
      case 'bonus_card_pack':
        return '🎴';
      default:
        return '📦';
    }
  };

  // Animation de la carte d'objet
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
        type: 'spring',
        stiffness: 100,
        damping: 10,
      },
    }),
    hover: {
      scale: 1.03,
      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)',
    },
    purchased: {
      scale: [1, 1.1, 0],
      opacity: [1, 1, 0],
      y: [0, -20, -50],
      transition: {
        duration: 0.5,
        times: [0, 0.3, 1],
      },
    },
    exit: {
      opacity: 0,
      scale: 0.9,
      transition: { duration: 0.3 },
    },
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
          <span className="text-yellow-300 mr-2">{ICONS.resources.gold}</span>
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
        {filteredItems.length === 0 ? (
          <div className="text-center py-12 bg-gray-800 rounded-lg">
            <p className="text-gray-400">Aucun objet disponible dans cette catégorie</p>
          </div>
        ) : (
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence>
              {filteredItems.map((item, index) => (
                <motion.div
                  key={`${item.id}-${index}`}
                  custom={index}
                  variants={itemVariants}
                  initial="hidden"
                  animate={purchaseAnimation === index ? 'purchased' : 'visible'}
                  whileHover="hover"
                  exit="exit"
                  className="relative"
                  onMouseEnter={() => setHoveredItem(item)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <Card className="p-4 bg-gray-800 border border-gray-700 h-full flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">{getItemIcon(item)}</span>
                        <h3 className="font-bold text-white">{item.name}</h3>
                      </div>
                      <Badge
                        variant={playerGold >= item.price ? 'warning' : 'danger'}
                        className="ml-2"
                      >
                        {item.price} or
                      </Badge>
                    </div>

                    <p className="text-gray-300 text-sm mb-4 flex-grow">{item.description}</p>

                    {/* Effets détaillés pour l'objet survolé */}
                    {hoveredItem === item && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 mb-4 p-2 bg-gray-700 rounded-md text-xs overflow-hidden"
                      >
                        <h4 className="font-bold text-white mb-1">Effets:</h4>
                        <div className="text-gray-300">
                          {item.effect && (
                            <div className="flex items-center">
                              {item.effect.type === 'heal' && <span className="mr-1">❤️</span>}
                              {item.effect.type === 'maxHealth' && (
                                <span className="mr-1">❤️ Max</span>
                              )}
                              {item.effect.type === 'shield' && <span className="mr-1">🛡️</span>}
                              {item.effect.type === 'tempDamage' && (
                                <span className="mr-1">⚔️</span>
                              )}
                              {item.effect.type === 'bonusCardSlot' && (
                                <span className="mr-1">🃏</span>
                              )}
                              {item.effect.value && `+${item.effect.value}`}
                              {item.effect.duration && ` (${item.effect.duration} tours)`}
                            </div>
                          )}
                          {item.count && <div>Contient {item.count} cartes</div>}
                          {item.rarityPool && <div>Raretés: {item.rarityPool.join(', ')}</div>}
                          {item.maxPurchases && <div>Achat limité: {item.maxPurchases} fois</div>}
                        </div>
                      </motion.div>
                    )}

                    <Button
                      variant={playerGold >= item.price ? 'primary' : 'outline'}
                      disabled={playerGold < item.price}
                      onClick={() => handlePurchase(index)}
                      className="w-full mt-auto"
                    >
                      {playerGold >= item.price ? 'Acheter' : "Pas assez d'or"}
                    </Button>
                  </Card>
                </motion.div>
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

        <Button variant="outline" onClick={handleExit} icon="🚪">
          Quitter la boutique
        </Button>
      </div>
    </div>
  );
};

export default ShopInterface;
