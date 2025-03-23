// src/components/card/BonusCardManager.jsx - Optimized Performance & Fixed Bugs
import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';

// Import Design System components and styles
import { Button, Badge, Card, Tooltip } from '../ui/DesignSystem';
import { DESIGN_TOKENS } from '../ui/DesignSystem';

// Import Redux actions
import { 
  equipCard, 
  unequipCard, 
  upgradeCard 
} from '../../redux/slices/bonusCardsSlice';
import { setActionFeedback } from '../../redux/slices/uiSlice';
import { spendGold } from '../../redux/slices/playerSlice';

// Mock Icons object if not available in DesignSystem
const Icons = {
  card: '🃏'
};

const BonusCardManager = () => {
  const dispatch = useDispatch();

  // Performance-optimized Selectors
  const bonusCardCollection = useSelector(state => state.bonusCards.collection || []);
  const activeBonusCards = useSelector(state => state.bonusCards.active || []);
  const maxBonusCardSlots = useSelector(state => state.bonusCards.maxSlots || 3);
  const playerGold = useSelector(state => state.player.gold || 0);

  // Local state for filtering and sorting
  const [filterOptions, setFilterOptions] = useState({
    tab: 'collection',
    search: '',
    sortBy: 'name',
    rarity: 'all'
  });

  // Memoized Card Filtering
  const filterAndSortCards = useCallback((cards, options = {}) => {
    if (!Array.isArray(cards)) return [];
    
    const { 
      tab = 'collection', 
      search = '', 
      sortBy = 'name', 
      rarity = 'all' 
    } = options;

    let filteredCards = [...cards];

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
        (card.description && card.description.toLowerCase().includes(searchLower))
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

  // Memoize filtered cards
  const [filteredCards, setFilteredCards] = useState([]);
  
  // Update filtered cards when relevant state changes
  useEffect(() => {
    const filtered = filterAndSortCards(bonusCardCollection, filterOptions);
    setFilteredCards(filtered);
  }, [bonusCardCollection, filterOptions, filterAndSortCards]);

  // Card Interaction Handlers
  const handleEquipCard = useCallback((cardId) => {
    dispatch(equipCard(cardId));
    
    dispatch(setActionFeedback({
      message: "Carte équipée",
      type: "success"
    }));
  }, [dispatch]);

  const handleUnequipCard = useCallback((cardId) => {
    dispatch(unequipCard(cardId));
    
    dispatch(setActionFeedback({
      message: "Carte retirée",
      type: "info"
    }));
  }, [dispatch]);

  const handleUpgradeCard = useCallback((cardId) => {
    // Fixed upgrade cost logic
    const upgradeCost = 50;
    if (playerGold >= upgradeCost) {
      dispatch(spendGold(upgradeCost));
      dispatch(upgradeCard({ cardId }));
      
      dispatch(setActionFeedback({
        message: "Carte améliorée",
        type: "success"
      }));
    } else {
      dispatch(setActionFeedback({
        message: "Or insuffisant pour l'amélioration",
        type: "warning"
      }));
    }
  }, [dispatch, playerGold]);

  // Get color for card rarity
  const getRarityColor = (rarity) => {
    const rarityColors = {
      common: '#9CA3AF',
      uncommon: '#10B981',
      rare: '#3B82F6',
      epic: '#8B5CF6',
      legendary: '#F59E0B'
    };
    return rarityColors[rarity] || '#9CA3AF';
  };

  // Render Card Method
  const renderCard = useCallback((card) => {
    if (!card) return null;
    
    const cardColor = getRarityColor(card.rarity);
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
              <Badge>{card.rarity}</Badge>
            </div>
            <p className="text-sm text-gray-600 mt-2">{card.description}</p>
            
            <div className="mt-4 flex justify-between items-center">
              {isEquipped ? (
                <Button 
                  variant="danger" 
                  onClick={() => handleUnequipCard(card.id)}
                >
                  Retirer
                </Button>
              ) : (
                <Button 
                  variant="primary" 
                  onClick={() => handleEquipCard(card.id)}
                  disabled={activeBonusCards.length >= maxBonusCardSlots}
                >
                  Équiper
                </Button>
              )}
              
              {(!card.level || card.level < 3) && (
                <Tooltip content={`Coût d'amélioration: 50 or (Niveau ${card.level || 1})`}>
                  <Button 
                    variant="outline" 
                    disabled={playerGold < 50}
                    onClick={() => handleUpgradeCard(card.id)}
                  >
                    Améliorer
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
            Équipées
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          <input 
            type="text" 
            placeholder="Rechercher..."
            className="px-2 py-1 border rounded"
            value={filterOptions.search}
            onChange={(e) => setFilterOptions(prev => ({...prev, search: e.target.value}))}
          />
          <select 
            className="px-2 py-1 border rounded"
            value={filterOptions.rarity}
            onChange={(e) => setFilterOptions(prev => ({...prev, rarity: e.target.value}))}
          >
            <option value="all">Toutes raretés</option>
            <option value="common">Commune</option>
            <option value="uncommon">Peu commune</option>
            <option value="rare">Rare</option>
            <option value="epic">Épique</option>
            <option value="legendary">Légendaire</option>
          </select>
        </div>
      </div>

      <AnimatePresence>
        {filteredCards.map(renderCard)}
      </AnimatePresence>

      {filteredCards.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          Aucune carte trouvée.
        </div>
      )}
    </div>
  );
};

export default React.memo(BonusCardManager);
