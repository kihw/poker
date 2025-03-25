// src/components/card/BonusCardCollection.jsx
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import BonusCard from './BonusCardCollection';
import { equipCard, unequipCard, upgradeCard } from '../../redux/slices/bonusCardsSlice';
import { spendGold } from '../../redux/slices/playerSlice';
import { setActionFeedback } from '../../redux/slices/uiSlice';

const BonusCardCollection = () => {
  const dispatch = useDispatch();

  // Sélecteurs Redux
  const collection = useSelector((state) => state.bonusCards.collection || []);
  const activeCards = useSelector((state) => state.bonusCards.active || []);
  const maxSlots = useSelector((state) => state.bonusCards.maxSlots);
  const playerGold = useSelector((state) => state.player.gold || 0);
  const gamePhase = useSelector((state) => state.game.gamePhase);

  // État local pour le filtrage et le tri
  const [filterOptions, setFilterOptions] = useState({
    tab: 'collection', // 'collection' ou 'equipped'
    search: '',
    rarity: 'all',
    sort: 'name', // 'name', 'rarity', 'level'
  });

  // État pour les cartes sélectionnées
  const [selectedCard, setSelectedCard] = useState(null);
  const [upgradeConfirmation, setUpgradeConfirmation] = useState(false);

  // Filtrer les cartes
  const filteredCards = React.useMemo(() => {
    let cards = [...collection];

    // Filtrer par onglet
    if (filterOptions.tab === 'equipped') {
      cards = activeCards.slice();
    } else {
      // Dans l'onglet collection, exclure les cartes équipées
      const equippedIds = activeCards.map((card) => card.id);
      cards = cards.filter((card) => !equippedIds.includes(card.id));
    }

    // Filtre de recherche
    if (filterOptions.search) {
      const searchTerm = filterOptions.search.toLowerCase();
      cards = cards.filter(
        (card) =>
          card.name.toLowerCase().includes(searchTerm) ||
          card.description.toLowerCase().includes(searchTerm)
      );
    }

    // Filtre de rareté
    if (filterOptions.rarity !== 'all') {
      cards = cards.filter((card) => card.rarity === filterOptions.rarity);
    }

    // Tri
    cards.sort((a, b) => {
      switch (filterOptions.sort) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'rarity':
          const rarityOrder = { common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4 };
          return rarityOrder[a.rarity] - rarityOrder[b.rarity];
        case 'level':
          return (b.level || 1) - (a.level || 1);
        default:
          return 0;
      }
    });

    return cards;
  }, [collection, activeCards, filterOptions]);

  // Gestion de l'équipement d'une carte
  const handleEquip = (cardId) => {
    if (activeCards.length >= maxSlots) {
      dispatch(
        setActionFeedback({
          message: 'Nombre maximum de cartes équipées atteint',
          type: 'warning',
        })
      );
      return;
    }

    dispatch(equipCard(cardId));
    dispatch(
      setActionFeedback({
        message: 'Carte équipée',
        type: 'success',
      })
    );
  };

  // Gestion du retrait d'une carte
  const handleUnequip = (cardId) => {
    dispatch(unequipCard(cardId));
    dispatch(
      setActionFeedback({
        message: 'Carte retirée',
        type: 'info',
      })
    );
  };

  // Gestion de l'amélioration d'une carte
  const handleUpgrade = (cardId) => {
    const card = collection.find((c) => c.id === cardId);
    if (!card) return;

    // Coût d'amélioration
    const upgradeCost = 50;

    if (playerGold < upgradeCost) {
      dispatch(
        setActionFeedback({
          message: "Pas assez d'or pour l'amélioration",
          type: 'warning',
        })
      );
      return;
    }

    // Vérifier si la carte a atteint le niveau maximum
    if (card.level && card.level >= 3) {
      dispatch(
        setActionFeedback({
          message: 'Cette carte est déjà au niveau maximum',
          type: 'info',
        })
      );
      return;
    }

    // Demander confirmation avant d'améliorer
    if (!upgradeConfirmation) {
      setSelectedCard(card);
      setUpgradeConfirmation(true);
      return;
    }

    // Effectuer l'amélioration
    dispatch(spendGold(upgradeCost));
    dispatch(upgradeCard({ cardId }));

    dispatch(
      setActionFeedback({
        message: 'Carte améliorée avec succès',
        type: 'success',
      })
    );

    // Réinitialiser l'état de confirmation
    setUpgradeConfirmation(false);
    setSelectedCard(null);
  };

  // Gestion de la sélection d'une carte
  const handleCardSelect = (card) => {
    setSelectedCard((prev) => (prev && prev.id === card.id ? null : card));
    setUpgradeConfirmation(false);
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg">
      {/* En-tête et filtres */}
      <div className="flex flex-col md:flex-row justify-between mb-4">
        <h2 className="text-xl font-bold mb-3 md:mb-0 text-white">
          <span className="mr-2">🃏</span>
          Cartes Bonus
          {gamePhase === 'combat' && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-600 text-white rounded">
              Mode Combat - Lecture seule
            </span>
          )}
        </h2>

        <div className="flex flex-wrap gap-2">
          <button
            className={`px-3 py-1 text-sm rounded ${
              filterOptions.tab === 'collection'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            onClick={() => setFilterOptions((prev) => ({ ...prev, tab: 'collection' }))}
          >
            Collection {collection.length > 0 && `(${collection.length})`}
          </button>
          <button
            className={`px-3 py-1 text-sm rounded ${
              filterOptions.tab === 'equipped'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
            onClick={() => setFilterOptions((prev) => ({ ...prev, tab: 'equipped' }))}
          >
            Équipées ({activeCards.length}/{maxSlots})
          </button>
        </div>
      </div>

      {/* Filtres avancés */}
      <div className="mb-4 flex flex-wrap gap-2">
        <input
          type="text"
          placeholder="Rechercher..."
          className="px-3 py-1 border border-gray-700 bg-gray-800 text-white rounded"
          value={filterOptions.search}
          onChange={(e) => setFilterOptions((prev) => ({ ...prev, search: e.target.value }))}
        />

        <select
          className="px-3 py-1 border border-gray-700 bg-gray-800 text-white rounded"
          value={filterOptions.rarity}
          onChange={(e) => setFilterOptions((prev) => ({ ...prev, rarity: e.target.value }))}
        >
          <option value="all">Toutes les raretés</option>
          <option value="common">Commune</option>
          <option value="uncommon">Peu commune</option>
          <option value="rare">Rare</option>
          <option value="epic">Épique</option>
          <option value="legendary">Légendaire</option>
        </select>

        <select
          className="px-3 py-1 border border-gray-700 bg-gray-800 text-white rounded"
          value={filterOptions.sort}
          onChange={(e) => setFilterOptions((prev) => ({ ...prev, sort: e.target.value }))}
        >
          <option value="name">Trier par nom</option>
          <option value="rarity">Trier par rareté</option>
          <option value="level">Trier par niveau</option>
        </select>
      </div>

      {/* Liste des cartes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        <AnimatePresence>
          {filteredCards.length > 0 ? (
            filteredCards.map((card) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <BonusCard
                  card={card}
                  onClick={() => handleCardSelect(card)}
                  isSelected={filterOptions.tab === 'equipped'}
                  onEquip={gamePhase !== 'combat' ? handleEquip : undefined}
                  onUnequip={gamePhase !== 'combat' ? handleUnequip : undefined}
                  onUpgrade={gamePhase !== 'combat' ? handleUpgrade : undefined}
                  disabled={gamePhase === 'combat'}
                />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-400">
              Aucune carte {filterOptions.tab === 'equipped' ? 'équipée' : ''} trouvée.
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal de détails de carte */}
      {selectedCard && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => {
            setSelectedCard(null);
            setUpgradeConfirmation(false);
          }}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="bg-gray-800 p-6 rounded-lg max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-xl font-bold text-white">{selectedCard.name}</h2>
              <span
                className="px-2 py-0.5 text-xs rounded-full"
                style={{
                  backgroundColor: getRarityColor(selectedCard.rarity),
                  color: 'white',
                }}
              >
                {selectedCard.rarity}
              </span>
            </div>

            <div className="mb-4">
              <div className="text-center mb-4">
                <span
                  className={`text-4xl font-bold ${
                    selectedCard.cardSuit === 'hearts' || selectedCard.cardSuit === 'diamonds'
                      ? 'text-red-500'
                      : 'text-blue-300'
                  }`}
                >
                  {selectedCard.cardValue}
                  {getSuitSymbol(selectedCard.cardSuit)}
                </span>
              </div>

              <p className="text-gray-300 mb-4">{selectedCard.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <h3 className="text-sm text-gray-400 mb-1">Type</h3>
                  <p className="font-medium text-white">
                    {selectedCard.effect === 'active' ? 'Active' : 'Passive'}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm text-gray-400 mb-1">Niveau</h3>
                  <p className="font-medium text-white">{selectedCard.level || 1}</p>
                </div>
                {selectedCard.bonus && (
                  <div className="col-span-2">
                    <h3 className="text-sm text-gray-400 mb-1">Effet</h3>
                    <p className="font-medium text-white">
                      {selectedCard.bonus.type}: {selectedCard.bonus.value}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {upgradeConfirmation ? (
              <div className="border-t border-gray-700 pt-4 mt-4">
                <p className="text-yellow-300 mb-4">Confirmer l'amélioration pour 50 or ?</p>
                <div className="flex space-x-3">
                  <button
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
                    onClick={() => handleUpgrade(selectedCard.id)}
                  >
                    Confirmer
                  </button>
                  <button
                    className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded"
                    onClick={() => {
                      setUpgradeConfirmation(false);
                      setSelectedCard(null);
                    }}
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-end space-x-3 mt-4">
                {gamePhase !== 'combat' && (
                  <>
                    {!activeCards.some((c) => c.id === selectedCard.id) ? (
                      <button
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
                        onClick={() => {
                          handleEquip(selectedCard.id);
                          setSelectedCard(null);
                        }}
                        disabled={activeCards.length >= maxSlots}
                      >
                        Équiper
                      </button>
                    ) : (
                      <button
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
                        onClick={() => {
                          handleUnequip(selectedCard.id);
                          setSelectedCard(null);
                        }}
                      >
                        Retirer
                      </button>
                    )}

                    {(!selectedCard.level || selectedCard.level < 3) && (
                      <button
                        className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded"
                        onClick={() => handleUpgrade(selectedCard.id)}
                        disabled={playerGold < 50}
                      >
                        Améliorer (50 or)
                      </button>
                    )}
                  </>
                )}

                <button
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded"
                  onClick={() => {
                    setSelectedCard(null);
                    setUpgradeConfirmation(false);
                  }}
                >
                  Fermer
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* Information sur les emplacements */}
      <div className="mt-4 p-3 bg-blue-900 bg-opacity-30 text-blue-300 rounded-md text-sm">
        <p className="flex items-center">
          <span className="mr-2">ℹ️</span>
          Vous disposez de {maxSlots} emplacements pour les cartes bonus.
          {maxSlots < 5 &&
            " Vous pourrez débloquer plus d'emplacements en progressant dans le jeu."}
        </p>
      </div>
    </div>
  );
};

export default BonusCardCollection;
