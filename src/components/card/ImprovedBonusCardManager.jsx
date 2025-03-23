// src/components/card/ImprovedBonusCardManager.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectBonusCardCollection,
  selectActiveBonusCards,
  selectMaxBonusCardSlots,
} from '../../redux/selectors/gameSelectors';
import { equipCard, unequipCard } from '../../redux/slices/bonusCardsSlice';
import { setActionFeedback } from '../../redux/slices/uiSlice';
import { COLORS } from '../ui/DesignSystem';

const ImprovedBonusCardManager = () => {
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
  const [hoveredCard, setHoveredCard] = useState(null);

  // Éviter de recréer ce tableau à chaque render
  const rarityColors = useMemo(
    () => ({
      common: { bg: '#6b7280', border: '#9ca3af' }, // gray-600, gray-400
      uncommon: { bg: '#10b981', border: '#34d399' }, // emerald-600, emerald-400
      rare: { bg: '#2563eb', border: '#60a5fa' }, // blue-600, blue-400
      epic: { bg: '#7c3aed', border: '#a78bfa' }, // violet-600, violet-400
      legendary: { bg: '#d97706', border: '#fbbf24' }, // amber-600, amber-400
    }),
    []
  );

  // Obtenir la couleur de rareté
  const getCardColor = useCallback(
    (rarity) => {
      return rarityColors[rarity] || rarityColors.common;
    },
    [rarityColors]
  );

  // Loading state
  if (!bonusCardCollection || !activeBonusCards) {
    return (
      <div className="flex justify-center items-center h-48 bg-gray-900 rounded-xl p-4 shadow-xl">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <span className="ml-2 text-white">Chargement des cartes bonus...</span>
      </div>
    );
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

  // Animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: 'beforeChildren',
        staggerChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24,
      },
    },
  };

  // Composant pour la bulle d'information sur survol
  const CardTooltip = ({ card }) => {
    if (!card) return null;

    const cardColor = getCardColor(card.rarity);

    return (
      <AnimatePresence>
        {hoveredCard && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed z-50 p-4 rounded-lg shadow-xl max-w-xs"
            style={{
              backgroundColor: '#1f2937', // gray-800
              border: `2px solid ${cardColor.border}`,
              boxShadow: `0 0 10px ${cardColor.border}80`,
            }}
          >
            <h3 className="text-lg font-bold text-white mb-1">{card.name}</h3>
            {card.level && (
              <div className="bg-yellow-600 text-black text-xs font-bold px-2 py-1 rounded inline-block mb-2">
                Niveau {card.level}
              </div>
            )}
            <p className="text-gray-200 mb-2">{card.description}</p>

            <div className="text-sm border-t border-gray-700 pt-2 mt-2">
              <div className="text-gray-400">
                <span className="font-semibold">Type:</span>{' '}
                {card.effect === 'passive' ? 'Passif' : 'Actif'}
              </div>
              {card.effect === 'active' && (
                <div className="text-gray-400">
                  <span className="font-semibold">Utilisations:</span>{' '}
                  {card.uses || 1} par combat
                </div>
              )}
              <div className="text-gray-400">
                <span className="font-semibold">Rareté:</span>{' '}
                {card.rarity.charAt(0).toUpperCase() + card.rarity.slice(1)}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  return (
    <div className="bg-gray-900 rounded-xl p-6 shadow-xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">
          Gestion des cartes bonus
        </h2>
        <div className="text-sm font-medium text-yellow-400 bg-gray-800 px-3 py-1 rounded-full">
          {activeBonusCards.length}/{maxBonusCardSlots || 3} emplacements
          utilisés
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700 mb-6">
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
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Rechercher une carte..."
          className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm flex-grow text-white"
        />

        <select
          value={sortBy}
          onChange={handleSortChange}
          className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white"
        >
          <option value="name">Trier par nom</option>
          <option value="rarity">Trier par rareté</option>
        </select>

        <select
          value={filterRarity}
          onChange={handleRarityFilterChange}
          className="bg-gray-800 border border-gray-700 rounded px-3 py-2 text-sm text-white"
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
      <div className="relative">
        {/* Tooltip */}
        <CardTooltip card={hoveredCard} />

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto p-2"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {displayedCards.length === 0 ? (
            <div className="col-span-full text-center text-gray-400 py-8">
              Aucune carte trouvée
            </div>
          ) : (
            displayedCards.map((card) => {
              const cardColor = getCardColor(card.rarity);

              return (
                <motion.div
                  key={card.id}
                  className="relative rounded-lg p-4 border"
                  style={{
                    backgroundColor: 'rgba(31, 41, 55, 0.8)', // gray-800 with transparency
                    borderColor: cardColor.border,
                  }}
                  variants={cardVariants}
                  whileHover={{
                    scale: 1.02,
                    boxShadow: `0 0 10px ${cardColor.border}70`,
                  }}
                  onMouseEnter={() => setHoveredCard(card)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  {/* Card header with name and level */}
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-white">{card.name}</h3>
                    {card.level && (
                      <span className="bg-yellow-600 text-black text-xs font-bold px-2 py-1 rounded">
                        Nv. {card.level}
                      </span>
                    )}
                  </div>

                  {/* Card description */}
                  <div className="text-sm text-gray-300 mt-2 mb-3 min-h-[40px]">
                    {card.description}
                  </div>

                  {/* Card footer with effect type and action button */}
                  <div className="flex justify-between items-center mt-auto pt-2 border-t border-gray-700">
                    <div className="text-xs uppercase font-semibold">
                      {card.effect === 'passive' ? (
                        <span className="text-green-400 flex items-center">
                          <span className="mr-1">🔄</span> Passif
                        </span>
                      ) : (
                        <span className="text-blue-400 flex items-center">
                          <span className="mr-1">⚡</span> Actif •{' '}
                          {card.uses || 1}x/combat
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

                  {/* Rarity indicator */}
                  <div
                    className="absolute top-0 right-0 w-3 h-3 rounded-full m-1"
                    style={{ backgroundColor: cardColor.bg }}
                  />
                </motion.div>
              );
            })
          )}
        </motion.div>
      </div>

      {/* Help message */}
      <div className="mt-6 text-sm text-gray-400 border-t border-gray-700 pt-4">
        <p>
          Les cartes bonus vous accordent des effets spéciaux pendant les
          combats. Les effets passifs s'activent automatiquement lorsque les
          conditions sont remplies, tandis que les effets actifs doivent être
          déclenchés manuellement.
        </p>
        <p className="mt-2">
          <span className="text-blue-400 font-semibold">Astuce:</span> Survolez
          une carte pour afficher plus de détails.
        </p>
      </div>
    </div>
  );
};

export default ImprovedBonusCardManager;
