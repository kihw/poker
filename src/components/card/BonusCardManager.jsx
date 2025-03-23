// src/components/card/BonusCardManager.jsx - Optimized Performance
import React, { useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';

// Design System Imports
import { 
  Button, 
  Badge, 
  Card, 
  Tooltip, 
  DESIGN_TOKENS,
  Icons 
} from '../ui/DesignSystem';

// Redux Actions and Selectors
import { 
  equipCard, 
  unequipCard, 
  upgradeCard 
} from '../../redux/slices/bonusCardsSlice';

const BonusCardManager = () => {
  const dispatch = useDispatch();

  // Performance-optimized Selectors
  const bonusCardCollection = useSelector(state => state.bonusCards.collection);
  const activeBonusCards = useSelector(state => state.bonusCards.active);
  const maxBonusCardSlots = useSelector(state => state.bonusCards.maxSlots);
  const playerGold = useSelector(state => state.player.gold);

  // Memoized Card Filtering
  const filterAndSortCards = useCallback((cards, options = {}) => {
    const { 
      tab = 'collection', 
      search = '', 
      sortBy = 'name', 
      rarity = 'all' 
    } = options;

    let filteredCards = cards;

    // Filter by tab
    if (tab === 'equipped') {
      filteredCards = activeBonusCards;
    } else {
      filteredCards = cards.filter(
        card => !activeBonusCards.some(activeCard => activeCard.id === card.id)
      );
    }

    // Search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredCards = filteredCards.filter(card => 
        card.name.toLowerCase().includes(searchLower) ||
        card.description?.toLowerCase().includes(searchLower)
      );
    }

    // Rarity filter
    if (rarity !== 'all') {
      filteredCards = filteredCards.filter(card => card.rarity === rarity);
    }

    // Sorting
    return filteredCards.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'rarity') {
        const rarityOrder = {
          common: 0, 
          uncommon: 1, 
          rare: 2, 
          epic: 3, 
          legendary: 4
        };
        return rarityOrder[a.rarity] - rarityOrder[b.rarity];
      }
      return 0;
    });
  }, [activeBonusCards]);

  // Memoize filtered cards with filtering options
  const [filteredCards, setFilteredCards] = React.useState([]);
  const [filterOptions, setFilterOptions] = React.useState({
    tab: 'collection',
    search: '',
    sortBy: 'name',
    rarity: 'all'
  });

  React.useEffect(() => {
    const filtered = filterAndSortCards(bonusCardCollection, filterOptions);
    setFilteredCards(filtered);
  }, [bonusCardCollection, filterOptions, filterAndSortCards]);

  // Card Interaction Handlers
  const handleEquipCard = useCallback((cardId) => {
    dispatch(equipCard(cardId));
  }, [dispatch]);

  const handleUnequipCard = useCallback((cardId) => {
    dispatch(unequipCard(cardId));
  }, [dispatch]);

  const handleUpgradeCard = useCallback((cardId) => {
    // Implement upgrade cost logic
    const upgradeCost = 50;
    if (playerGold >= upgradeCost) {
      dispatch(upgradeCard({ cardId }));
    }
  }, [dispatch, playerGold]);

  // Render Card Method
  const renderCard = useCallback((card) => {
    const cardColor = DESIGN_TOKENS.colors.rarity[card.rarity];
    const isEquipped = activeBonusCards.some(c => c.id === card.id);

    return (
      <motion.div 
        key={card.id}
        layoutId={`card-${card.id}`}
        className="mb-2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
      >
        <Card>
          <div className="p-3">
            <div className="flex justify-between items-start">
              <h3 className="font-bold text-lg">{card.name}</h3>
              <Badge 
                variant={isEquipped ? 'success' : 'primary'}
                size="sm"
              >
                {card.rarity}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mt-2">{card.description}</p>
            
            <div className="mt-4 flex justify-between items-center">
              {isEquipped ? (
                <Button 
                  variant="danger" 
                  size="sm" 
                  onClick={() => handleUnequipCard(card.id)}
                >
                  Unequip
                </Button>
              ) : (
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={() => handleEquipCard(card.id)}
                  disabled={activeBonusCards.length >= maxBonusCardSlots}
                >
                  Equip
                </Button>
              )}
              
              {(card.level || 0) < 3 && (
                <Tooltip content={`Upgrade Cost: 50 Gold (Level ${card.level || 1})`}>
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={playerGold < 50}
                    onClick={() => handleUpgradeCard(card.id)}
                  >
                    Upgrade
                  </Button>
                </Tooltip>
              )}
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }, [
    activeBonusCards, 
    maxBonusCardSlots, 
    playerGold, 
    handleEquipCard, 
    handleUnequipCard, 
    handleUpgradeCard
  ]);

  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      <div className="flex justify-between mb-4">
        <div className="flex space-x-2">
          <Button 
            variant={filterOptions.tab === 'collection' ? 'primary' : 'outline'}
            onClick={() => setFilterOptions(prev => ({...prev, tab: 'collection'}))}
          >
            Collection
          </Button>
          <Button 
            variant={filterOptions.tab === 'equipped' ? 'primary' : 'outline'}
            onClick={() => setFilterOptions(prev => ({...prev, tab: 'equipped'}))}
          >
            Equipped
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <input 
            type="text" 
            placeholder="Search cards..."
            className="px-2 py-1 border rounded"
            value={filterOptions.search}
            onChange={(e) => setFilterOptions(prev => ({...prev, search: e.target.value}))}
          />
          <select 
            className="px-2 py-1 border rounded"
            value={filterOptions.rarity}
            onChange={(e) => setFilterOptions(prev => ({...prev, rarity: e.target.value}))}
          >
            <option value="all">All Rarities</option>
            <option value="common">Common</option>
            <option value="uncommon">Uncommon</option>
            <option value="rare">Rare</option>
            <option value="epic">Epic</option>
            <option value="legendary">Legendary</option>
          </select>
        </div>
      </div>

      <AnimatePresence>
        {filteredCards.map(renderCard)}
      </AnimatePresence>

      {filteredCards.length === 0 && (
        <div className="text-center text-gray-500">
          No cards found matching your filters.
        </div>
      )}
    </div>
  );
};

export default React.memo(BonusCardManager);
