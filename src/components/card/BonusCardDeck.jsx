// src/components/card/BonusCardDeck.jsx - Unified from BonusCardManager.jsx and BonusCardDeck.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';

import {
  equipCard,
  unequipCard,
  upgradeCard,
  initCollection,
} from '../../redux/slices/bonusCardsSlice';
import { spendGold } from '../../redux/slices/playerSlice';
import { setActionFeedback } from '../../redux/slices/uiSlice';
import { Card, Badge, Tooltip } from '../ui/DesignSystem';

/**
 * Enhanced component for managing the player's bonus card collection
 * Handles both permanent inventory and active cards
 */
const BonusCardDeck = ({ readOnly = false }) => {
  const dispatch = useDispatch();

  // Redux selectors
  const BonusCardDeck = useSelector((state) => state.bonusCards?.collection || []);
  const activeBonusCards = useSelector((state) => state.bonusCards?.active || []);
  const maxBonusCardSlots = useSelector((state) => state.bonusCards?.maxSlots || 3);
  const playerGold = useSelector((state) => state.player?.gold || 0);
  const gamePhase = useSelector((state) => state.game?.gamePhase);

  // Local state for filtering and sorting
  const [filterOptions, setFilterOptions] = useState({
    tab: 'collection', // 'collection' or 'equipped'
    search: '',
    sortBy: 'name', // 'name', 'rarity', 'level'
    rarity: 'all',
  });

  // State for showing card details
  const [selectedCard, setSelectedCard] = useState(null);
  const [upgradeConfirmation, setUpgradeConfirmation] = useState(false);

  // Load bonus cards from localStorage on component mount
  useEffect(() => {
    dispatch(initCollection());
  }, [dispatch]);

  // Memoized filtering of cards
  const filteredCards = useMemo(() => {
    if (!BonusCardDeck || !Array.isArray(BonusCardDeck)) return [];

    let cards = [...BonusCardDeck];

    // Filter by tab (collection or equipped)
    if (filterOptions.tab === 'equipped') {
      cards = activeBonusCards.slice();
    } else {
      const activeCardIds = activeBonusCards.map((card) => card.id);
      cards = cards.filter((card) => !activeCardIds.includes(card.id));
    }

    // Filter by text search
    if (filterOptions.search) {
      const searchTerm = filterOptions.search.toLowerCase();
      cards = cards.filter(
        (card) =>
          card.name.toLowerCase().includes(searchTerm) ||
          (card.description && card.description.toLowerCase().includes(searchTerm))
      );
    }

    // Filter by rarity
    if (filterOptions.rarity !== 'all') {
      cards = cards.filter((card) => card.rarity === filterOptions.rarity);
    }

    // Sort cards
    return cards.sort((a, b) => {
      if (filterOptions.sortBy === 'name') {
        return a.name.localeCompare(b.name);
      } else if (filterOptions.sortBy === 'rarity') {
        const rarityOrder = {
          common: 0,
          uncommon: 1,
          rare: 2,
          epic: 3,
          legendary: 4,
        };
        return rarityOrder[a.rarity] - rarityOrder[b.rarity];
      } else if (filterOptions.sortBy === 'level') {
        return (b.level || 1) - (a.level || 1);
      }
      return 0;
    });
  }, [BonusCardDeck, activeBonusCards, filterOptions]);

  // Get color based on rarity
  const getRarityColor = useCallback((rarity) => {
    const rarityColors = {
      common: '#9CA3AF',
      uncommon: '#10B981',
      rare: '#3B82F6',
      epic: '#8B5CF6',
      legendary: '#F59E0B',
    };
    return rarityColors[rarity] || '#9CA3AF';
  }, []);

  // Event handlers
  const handleEquipCard = useCallback(
    (cardId) => {
      if (readOnly) return;

      if (activeBonusCards.length >= maxBonusCardSlots) {
        dispatch(
          setActionFeedback({
            message: 'Maximum number of equipped cards reached',
            type: 'warning',
          })
        );
        return;
      }

      dispatch(equipCard(cardId));

      dispatch(
        setActionFeedback({
          message: 'Card equipped',
          type: 'success',
        })
      );
    },
    [dispatch, activeBonusCards.length, maxBonusCardSlots, readOnly]
  );

  const handleUnequipCard = useCallback(
    (cardId) => {
      if (readOnly) return;

      dispatch(unequipCard(cardId));

      dispatch(
        setActionFeedback({
          message: 'Card removed',
          type: 'info',
        })
      );
    },
    [dispatch, readOnly]
  );

  const handleUpgradeCard = useCallback(
    (cardId) => {
      if (readOnly) return;

      const card = BonusCardDeck.find((c) => c.id === cardId);
      if (!card) return;

      // Upgrade cost
      const upgradeCost = 50;

      if (playerGold < upgradeCost) {
        dispatch(
          setActionFeedback({
            message: 'Not enough gold for the upgrade',
            type: 'warning',
          })
        );
        return;
      }

      // Check if card has reached maximum level
      if (card.level && card.level >= 3) {
        dispatch(
          setActionFeedback({
            message: 'This card is already at maximum level',
            type: 'info',
          })
        );
        return;
      }

      // If confirmation is requested, show it first
      if (!upgradeConfirmation) {
        setSelectedCard(card);
        setUpgradeConfirmation(true);
        return;
      }

      // Perform the upgrade
      dispatch(spendGold(upgradeCost));
      dispatch(upgradeCard({ cardId }));

      dispatch(
        setActionFeedback({
          message: 'Card successfully upgraded',
          type: 'success',
        })
      );

      // Reset confirmation state
      setUpgradeConfirmation(false);
      setSelectedCard(null);
    },
    [dispatch, playerGold, BonusCardDeck, upgradeConfirmation, readOnly]
  );

  // Card selection and deselection handler
  const handleCardSelect = useCallback((card) => {
    setSelectedCard((prev) => (prev && prev.id === card.id ? null : card));
    setUpgradeConfirmation(false);
  }, []);

  // Close details modal
  const handleCloseDetails = useCallback(() => {
    setSelectedCard(null);
    setUpgradeConfirmation(false);
  }, []);

  // Render a card item
  const renderCardItem = useCallback(
    (card) => {
      const isEquipped = activeBonusCards.some((c) => c.id === card.id);
      const canUpgrade = (!card.level || card.level < 3) && playerGold >= 50;
      const rarity = card.rarity || 'common';

      return (
        <motion.div
          key={card.id}
          layoutId={`card-${card.id}`}
          className="mb-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          whileHover={{ scale: 1.02 }}
        >
          <Card className="overflow-hidden">
            <div className="p-4">
              <div
                className="border-l-4 px-3 py-2 rounded-sm"
                style={{ borderColor: getRarityColor(rarity) }}
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg">{card.name}</h3>
                  <div className="flex items-center space-x-2">
                    <Badge style={{ backgroundColor: getRarityColor(rarity) }}>{rarity}</Badge>
                    {card.level && <Badge variant="outline">Lv. {card.level}</Badge>}
                  </div>
                </div>

                <p className="text-sm text-gray-300 mt-2 mb-3">{card.description}</p>

                <div className="border-t border-gray-700 pt-2 mt-2">
                  <div className="flex text-xs text-gray-400 mb-2">
                    <span className="mr-1">Type:</span>
                    <span className="font-medium">
                      {card.effect === 'active' ? 'Active' : 'Passive'}
                    </span>
                    {card.effect === 'active' && (
                      <span className="ml-2">(Uses: {card.uses || 1})</span>
                    )}
                  </div>

                  {!readOnly && (
                    <div className="flex justify-between mt-3">
                      {isEquipped ? (
                        <button
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded"
                          onClick={() => handleUnequipCard(card.id)}
                        >
                          Remove
                        </button>
                      ) : (
                        <button
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded"
                          onClick={() => handleEquipCard(card.id)}
                          disabled={activeBonusCards.length >= maxBonusCardSlots}
                        >
                          Equip
                        </button>
                      )}

                      <Tooltip content={`Upgrade cost: 50 gold (Level ${card.level || 1})`}>
                        <button
                          className={`px-3 py-1 bg-gray-700 text-white text-sm rounded ${!canUpgrade || readOnly ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-600'}`}
                          disabled={!canUpgrade || readOnly}
                          onClick={() => handleUpgradeCard(card.id)}
                        >
                          Upgrade
                        </button>
                      </Tooltip>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      );
    },
    [
      activeBonusCards,
      maxBonusCardSlots,
      playerGold,
      handleEquipCard,
      handleUnequipCard,
      handleUpgradeCard,
      getRarityColor,
      readOnly,
    ]
  );

  // Render card details modal
  const renderCardDetails = () => {
    if (!selectedCard) return null;

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        onClick={handleCloseDetails}
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
            <Badge style={{ backgroundColor: getRarityColor(selectedCard.rarity) }}>
              {selectedCard.rarity}
            </Badge>
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
              <h3 className="text-sm text-gray-400 mb-1">Level</h3>
              <p className="font-medium text-white">{selectedCard.level || 1}</p>
            </div>
            {selectedCard.bonus && (
              <div className="col-span-2">
                <h3 className="text-sm text-gray-400 mb-1">Effect</h3>
                <p className="font-medium text-white">
                  {selectedCard.bonus.type}: {selectedCard.bonus.value}
                </p>
              </div>
            )}
          </div>

          {upgradeConfirmation ? (
            <div className="border-t border-gray-700 pt-4 mt-4">
              <p className="text-yellow-300 mb-4">Confirm upgrade for 50 gold?</p>
              <div className="flex space-x-3">
                <button
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
                  onClick={() => handleUpgradeCard(selectedCard.id)}
                >
                  Confirm
                </button>
                <button
                  className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded"
                  onClick={() => {
                    setUpgradeConfirmation(false);
                    setSelectedCard(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-4 flex justify-end">
              <button
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
                onClick={handleCloseDetails}
              >
                Close
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg">
      {/* Header and filters */}
      <div className="flex flex-col md:flex-row justify-between mb-4">
        <h2 className="text-xl font-bold mb-3 md:mb-0 flex items-center text-white">
          <span className="mr-2">🃏</span>
          Bonus Cards
          {readOnly && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-600 text-white rounded">
              Read-only mode
            </span>
          )}
        </h2>

        <div className="flex flex-wrap gap-2">
          <button
            className={`px-3 py-1 text-sm rounded ${filterOptions.tab === 'collection' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            onClick={() => setFilterOptions((prev) => ({ ...prev, tab: 'collection' }))}
          >
            Collection {BonusCardDeck.length > 0 && `(${BonusCardDeck.length})`}
          </button>
          <button
            className={`px-3 py-1 text-sm rounded ${filterOptions.tab === 'equipped' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            onClick={() => setFilterOptions((prev) => ({ ...prev, tab: 'equipped' }))}
          >
            Equipped ({activeBonusCards.length}/{maxBonusCardSlots})
          </button>
        </div>
      </div>

      {/* Advanced filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        <input
          type="text"
          placeholder="Search..."
          className="px-3 py-1 border border-gray-700 bg-gray-800 text-white rounded flex-grow md:flex-grow-0"
          value={filterOptions.search}
          onChange={(e) => setFilterOptions((prev) => ({ ...prev, search: e.target.value }))}
        />

        <select
          className="px-3 py-1 border border-gray-700 bg-gray-800 text-white rounded"
          value={filterOptions.rarity}
          onChange={(e) => setFilterOptions((prev) => ({ ...prev, rarity: e.target.value }))}
        >
          <option value="all">All rarities</option>
          <option value="common">Common</option>
          <option value="uncommon">Uncommon</option>
          <option value="rare">Rare</option>
          <option value="epic">Epic</option>
          <option value="legendary">Legendary</option>
        </select>

        <select
          className="px-3 py-1 border border-gray-700 bg-gray-800 text-white rounded"
          value={filterOptions.sortBy}
          onChange={(e) => setFilterOptions((prev) => ({ ...prev, sortBy: e.target.value }))}
        >
          <option value="name">Sort by name</option>
          <option value="rarity">Sort by rarity</option>
          <option value="level">Sort by level</option>
        </select>
      </div>

      {/* Card list */}
      <div className="mt-4">
        <AnimatePresence>
          {filteredCards.length > 0 ? (
            filteredCards.map((card) => renderCardItem(card))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8 text-gray-400"
            >
              No {filterOptions.tab === 'equipped' ? 'equipped ' : ''}cards found.
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Card details modal */}
      <AnimatePresence>{selectedCard && renderCardDetails()}</AnimatePresence>

      {/* Slot information */}
      {filterOptions.tab === 'collection' && (
        <div className="mt-4 p-3 bg-blue-900 bg-opacity-30 text-blue-300 rounded-md text-sm">
          <p className="flex items-center">
            <span className="mr-2">ℹ️</span>
            You have {maxBonusCardSlots} slots available for bonus cards.
            {maxBonusCardSlots < 5 &&
              ' You can unlock more slots as you progress through the game.'}
          </p>
        </div>
      )}

      {/* Usage guide */}
      <div className="mt-4 border-t border-gray-700 pt-4 text-sm text-gray-400">
        <details>
          <summary className="cursor-pointer font-medium mb-2 text-gray-300">
            Bonus Cards Usage Guide
          </summary>
          <div className="pl-4 space-y-2">
            <p>
              • <strong>Passive</strong> cards activate automatically when their conditions are met.
            </p>
            <p>
              • <strong>Active</strong> cards must be manually activated during combat.
            </p>
            <p>• Upgrade your cards to increase their power (up to level 3).</p>
            <p>• Equipped cards will be available during combat.</p>
          </div>
        </details>
      </div>
    </div>
  );
};

export default React.memo(BonusCardDeck);
