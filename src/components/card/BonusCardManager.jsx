// src/components/card/BonusCardManager.jsx - Version optimisée
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectBonusCardCollection,
  selectActiveBonusCards,
  selectMaxBonusCardSlots,
} from '../../redux/selectors/gameSelectors';
import { equipCard, unequipCard } from '../../redux/slices/bonusCardsSlice';
import { setActionFeedback } from '../../redux/slices/uiSlice';

const BonusCardManager = () => {
  const dispatch = useDispatch();

  // Sélecteurs Redux optimisés
  const bonusCardCollection = useSelector(selectBonusCardCollection);
  const activeBonusCards = useSelector(selectActiveBonusCards);
  const maxBonusCardSlots = useSelector(selectMaxBonusCardSlots);

  // État local pour la gestion de l'UI
  const [selectedTab, setSelectedTab] = useState('equipped');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterRarity, setFilterRarity] = useState('all');

  // Éviter de recréer ce tableau à chaque render
  const rarityColors = useMemo(
    () => ({
      common: 'bg-gray-600',
      uncommon: 'bg-green-600',
      rare: 'bg-blue-600',
      epic: 'bg-purple-600',
      legendary: 'bg-orange-600',
    }),
    []
  );

  // Loading state
  if (!bonusCardCollection || !activeBonusCards) {
    return <div className="text-white">Loading bonus cards...</div>;
  }

  // Création mémorisée des cartes à afficher basée sur les filtres
  const displayedCards = useMemo(() => {
    // Code de filtrage existant, mais mémorisé pour éviter des calculs inutiles
    let cards;
    if (selectedTab === 'equipped') {
      cards = [...activeBonusCards];
    } else {
      cards = bonusCardCollection.filter(
        (card) => !activeBonusCards.some((ec) => ec.id === card.id)
      );
    }

    // Apply search filter
    if (searchTerm) {
      cards = cards.filter((card) => {
        const nameMatch = card.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const descMatch = card.description
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase());
        return nameMatch || descMatch;
      });
    }

    // Apply rarity filter
    if (filterRarity !== 'all') {
      cards = cards.filter((card) => card.rarity === filterRarity);
    }

    // Apply sorting
    if (sortBy === 'name') {
      cards.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'rarity') {
      const rarityOrder = {
        common: 0,
        uncommon: 1,
        rare: 2,
        epic: 3,
        legendary: 4,
      };
      cards.sort(
        (a, b) =>
          rarityOrder[a.rarity || 'common'] - rarityOrder[b.rarity || 'common']
      );
    }

    return cards;
  }, [
    selectedTab,
    searchTerm,
    sortBy,
    filterRarity,
    activeBonusCards,
    bonusCardCollection,
  ]);

  // Mémoriser les handlers pour éviter les redéfinitions à chaque render
  const handleEquip = useCallback(
    (cardId) => {
      dispatch(equipCard(cardId));

      // Feedback
      dispatch(
        setActionFeedback({
          message: 'Carte équipée',
          type: 'success',
          duration: 2000,
        })
      );
    },
    [dispatch]
  );

  const handleUnequip = useCallback(
    (cardId) => {
      dispatch(unequipCard(cardId));

      // Feedback
      dispatch(
        setActionFeedback({
          message: 'Carte retirée',
          type: 'info',
          duration: 2000,
        })
      );
    },
    [dispatch]
  );

  // Handlers pour les changements de filtre
  const handleTabChange = useCallback((tab) => {
    setSelectedTab(tab);
  }, []);

  const handleSearchChange = useCallback((event) => {
    setSearchTerm(event.target.value);
  }, []);

  const handleSortChange = useCallback((event) => {
    setSortBy(event.target.value);
  }, []);

  const handleRarityFilterChange = useCallback((event) => {
    setFilterRarity(event.target.value);
  }, []);

  return (
    <div className="bg-gray-900 rounded-xl p-4 shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">
          Gestion des cartes bonus
        </h2>
        <div className="text-sm font-medium text-yellow-400">
          {activeBonusCards.length}/{maxBonusCardSlots || 3} emplacements
          utilisés
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700 mb-4">
        <button
          className={`px-4 py-2 ${selectedTab === 'equipped' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
          onClick={() => handleTabChange('equipped')}
        >
          Cartes équipées
        </button>
        <button
          className={`px-4 py-2 ${selectedTab === 'collection' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
          onClick={() => handleTabChange('collection')}
        >
          Collection
        </button>
      </div>

      {/* Filters and search */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Rechercher une carte..."
          className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm flex-grow text-white"
        />

        <select
          value={sortBy}
          onChange={handleSortChange}
          className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm text-white"
        >
          <option value="name">Trier par nom</option>
          <option value="rarity">Trier par rareté</option>
        </select>

        <select
          value={filterRarity}
          onChange={handleRarityFilterChange}
          className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm text-white"
        >
          <option value="all">Toutes les raretés</option>
          <option value="common">Commune</option>
          <option value="uncommon">Peu commune</option>
          <option value="rare">Rare</option>
          <option value="epic">Épique</option>
          <option value="legendary">Légendaire</option>
        </select>
      </div>

      {/* Card list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto p-2">
        {displayedCards.length === 0 ? (
          <div className="col-span-full text-center text-gray-400 py-8">
            Aucune carte trouvée
          </div>
        ) : (
          displayedCards.map((card) => (
            <motion.div
              key={card.id}
              className={`relative border border-gray-700 rounded-lg p-3 ${rarityColors[card.rarity] || 'bg-gray-800'}`}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-white">{card.name}</h3>
                {card.level && (
                  <span className="bg-yellow-600 text-black text-xs font-bold px-2 py-1 rounded">
                    Nv. {card.level}
                  </span>
                )}
              </div>

              <div className="text-sm text-gray-300 mt-1 mb-2">
                {card.description}
              </div>

              <div className="flex justify-between items-center mt-auto pt-2 border-t border-gray-700">
                <div className="text-xs uppercase font-semibold">
                  {card.effect === 'passive' ? (
                    <span className="text-green-400">Passif</span>
                  ) : (
                    <span className="text-blue-400">
                      Actif • {card.uses || 1}x/combat
                    </span>
                  )}
                </div>

                {selectedTab === 'equipped' ? (
                  <button
                    onClick={() => handleUnequip(card.id)}
                    className="text-xs bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded"
                  >
                    Retirer
                  </button>
                ) : (
                  <button
                    onClick={() => handleEquip(card.id)}
                    disabled={activeBonusCards.length >= maxBonusCardSlots}
                    className={`text-xs px-2 py-1 rounded ${
                      activeBonusCards.length >= maxBonusCardSlots
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    Équiper
                  </button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Help message */}
      <div className="mt-4 text-sm text-gray-400 border-t border-gray-700 pt-3">
        <p>
          Les cartes bonus vous accordent des effets spéciaux pendant les
          combats. Les effets passifs s'activent automatiquement lorsque les
          conditions sont remplies, tandis que les effets actifs doivent être
          déclenchés manuellement.
        </p>
      </div>
    </div>
  );
};

// Utiliser React.memo pour éviter les re-renders inutiles
export default React.memo(BonusCardManager);
