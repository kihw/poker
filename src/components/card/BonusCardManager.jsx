// src/components/card/BonusCardManager.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../../context/gameHooks';

const BonusCardManager = () => {
  const { gameState, equipBonusCard, unequipBonusCard } = useGame();
  const [selectedTab, setSelectedTab] = useState('equipped');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterRarity, setFilterRarity] = useState('all');
  const [displayedCards, setDisplayedCards] = useState([]);

  // Loading state
  if (!gameState?.bonusCardCollection || !gameState?.activeBonusCards) {
    return <div className="text-white">Loading bonus cards...</div>;
  }

  // Define colors for each rarity
  const rarityColors = {
    common: 'bg-gray-600',
    uncommon: 'bg-green-600',
    rare: 'bg-blue-600',
    epic: 'bg-purple-600',
    legendary: 'bg-orange-600',
  };

  // Update displayed cards whenever filters, sort or selected tab changes
  useEffect(() => {
    let cards;
    if (selectedTab === 'equipped') {
      cards = [...gameState.activeBonusCards];
    } else {
      cards = gameState.bonusCardCollection.filter(
        (card) => !gameState.activeBonusCards.some((ec) => ec.id === card.id)
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

    setDisplayedCards(cards);
  }, [
    selectedTab,
    searchTerm,
    sortBy,
    filterRarity,
    gameState?.activeBonusCards,
    gameState?.bonusCardCollection,
  ]);

  const handleEquip = (cardId) => {
    equipBonusCard(cardId);
  };

  const handleUnequip = (cardId) => {
    unequipBonusCard(cardId);
  };

  return (
    <div className="bg-gray-900 rounded-xl p-4 shadow-xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">
          Gestion des cartes bonus
        </h2>
        <div className="text-sm font-medium text-yellow-400">
          {gameState.activeBonusCards.length}/{gameState.maxBonusCardSlots || 3}{' '}
          emplacements utilisés
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-700 mb-4">
        <button
          className={`px-4 py-2 ${selectedTab === 'equipped' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
          onClick={() => setSelectedTab('equipped')}
        >
          Cartes équipées
        </button>
        <button
          className={`px-4 py-2 ${selectedTab === 'collection' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
          onClick={() => setSelectedTab('collection')}
        >
          Collection
        </button>
      </div>

      {/* Filters and search */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher une carte..."
          className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm flex-grow text-white"
        />

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="bg-gray-800 border border-gray-700 rounded px-3 py-1 text-sm text-white"
        >
          <option value="name">Trier par nom</option>
          <option value="rarity">Trier par rareté</option>
        </select>

        <select
          value={filterRarity}
          onChange={(e) => setFilterRarity(e.target.value)}
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
                    disabled={
                      gameState.activeBonusCards.length >=
                      (gameState.maxBonusCardSlots || 3)
                    }
                    className={`text-xs px-2 py-1 rounded ${
                      gameState.activeBonusCards.length >=
                      (gameState.maxBonusCardSlots || 3)
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

export default BonusCardManager;
