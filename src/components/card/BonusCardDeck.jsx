// src/components/card/BonusCardDeck.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';

import {
  equipCard,
  unequipCard,
  upgradeCard,
  loadFromLocalStorage,
} from '../../redux/slices/bonusCardsSlice';
import { spendGold } from '../../redux/slices/playerSlice';
import { setActionFeedback } from '../../redux/slices/uiSlice';

/**
 * Composant pour gérer le deck de cartes bonus du joueur
 * Permet de gérer l'inventaire permanent et les cartes actives
 */
const BonusCardDeck = ({ readOnly = false }) => {
  const dispatch = useDispatch();

  // Sélecteurs Redux
  const bonusCardCollection = useSelector((state) => state.bonusCards?.collection || []);
  const activeBonusCards = useSelector((state) => state.bonusCards?.active || []);
  const maxBonusCardSlots = useSelector((state) => state.bonusCards?.maxSlots || 3);
  const playerGold = useSelector((state) => state.player?.gold || 0);
  const gamePhase = useSelector((state) => state.game?.gamePhase);

  // État local pour le filtrage et le tri
  const [filterOptions, setFilterOptions] = useState({
    tab: 'collection', // 'collection' ou 'equipped'
    search: '',
    sortBy: 'name', // 'name', 'rarity', 'level'
    rarity: 'all',
  });

  // État pour afficher les détails d'une carte
  const [selectedCard, setSelectedCard] = useState(null);
  const [upgradeConfirmation, setUpgradeConfirmation] = useState(false);

  // Charger les cartes bonus du localStorage au montage du composant
  useEffect(() => {
    dispatch(loadFromLocalStorage());
  }, [dispatch]);

  // Filtrage des cartes mémorisé
  const filteredCards = useMemo(() => {
    if (!bonusCardCollection || !Array.isArray(bonusCardCollection)) return [];

    let cards = [...bonusCardCollection];

    // Filtre par onglet (collection ou équipées)
    if (filterOptions.tab === 'equipped') {
      cards = activeBonusCards.slice();
    } else {
      const activeCardIds = activeBonusCards.map((card) => card.id);
      cards = cards.filter((card) => !activeCardIds.includes(card.id));
    }

    // Filtre par recherche texte
    if (filterOptions.search) {
      const searchTerm = filterOptions.search.toLowerCase();
      cards = cards.filter(
        (card) =>
          card.name.toLowerCase().includes(searchTerm) ||
          (card.description && card.description.toLowerCase().includes(searchTerm))
      );
    }

    // Filtre par rareté
    if (filterOptions.rarity !== 'all') {
      cards = cards.filter((card) => card.rarity === filterOptions.rarity);
    }

    // Tri
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
  }, [bonusCardCollection, activeBonusCards, filterOptions]);

  // Obtenir la couleur en fonction de la rareté
  const getRarityColor = (rarity) => {
    const rarityColors = {
      common: '#9CA3AF',
      uncommon: '#10B981',
      rare: '#3B82F6',
      epic: '#8B5CF6',
      legendary: '#F59E0B',
    };
    return rarityColors[rarity] || '#9CA3AF';
  };

  // Gestionnaires d'événements
  const handleEquipCard = (cardId) => {
    if (readOnly) return;

    if (activeBonusCards.length >= maxBonusCardSlots) {
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

  const handleUnequipCard = (cardId) => {
    if (readOnly) return;

    dispatch(unequipCard(cardId));

    dispatch(
      setActionFeedback({
        message: 'Carte retirée',
        type: 'info',
      })
    );
  };

  const handleUpgradeCard = (cardId) => {
    if (readOnly) return;

    const card = bonusCardCollection.find((c) => c.id === cardId);
    if (!card) return;

    // Coût d'amélioration
    const upgradeCost = 50;

    if (playerGold < upgradeCost) {
      dispatch(
        setActionFeedback({
          message: "Or insuffisant pour l'amélioration",
          type: 'warning',
        })
      );
      return;
    }

    // Vérifier si la carte a atteint son niveau maximum
    if (card.level && card.level >= 3) {
      dispatch(
        setActionFeedback({
          message: 'Cette carte est déjà au niveau maximum',
          type: 'info',
        })
      );
      return;
    }

    // Si la confirmation est demandée, afficher d'abord
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

  // Gestion de la sélection et désélection de carte
  const handleCardSelect = (card) => {
    setSelectedCard((prev) => (prev && prev.id === card.id ? null : card));
    setUpgradeConfirmation(false);
  };

  // Fermer la modale de détails
  const handleCloseDetails = () => {
    setSelectedCard(null);
    setUpgradeConfirmation(false);
  };

  // Rendu d'une carte
  const renderCardItem = (card) => {
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
        <div className="bg-gray-800 overflow-hidden rounded-lg shadow-md">
          <div className="p-4">
            <div
              className="border-l-4 px-3 py-2 rounded-sm"
              style={{ borderColor: getRarityColor(rarity) }}
            >
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-lg text-white">{card.name}</h3>
                <div className="flex items-center space-x-2">
                  <span
                    className="px-2 py-0.5 text-xs rounded bg-opacity-80 text-white"
                    style={{ backgroundColor: getRarityColor(rarity) }}
                  >
                    {rarity}
                  </span>
                  {card.level && (
                    <span className="px-2 py-0.5 text-xs rounded bg-gray-700 text-gray-300">
                      Nv. {card.level}
                    </span>
                  )}
                </div>
              </div>

              <p className="text-sm text-gray-300 mt-2 mb-3">{card.description}</p>

              <div className="border-t border-gray-700 pt-2 mt-2">
                <div className="flex text-xs text-gray-400 mb-2">
                  <span className="mr-1">Type:</span>
                  <span className="font-medium">
                    {card.effect === 'active' ? 'Actif' : 'Passif'}
                  </span>
                  {card.effect === 'active' && (
                    <span className="ml-2">(Utilisations: {card.uses || 1})</span>
                  )}
                </div>

                {!readOnly && (
                  <div className="flex justify-between mt-3">
                    {isEquipped ? (
                      <button
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded"
                        onClick={() => handleUnequipCard(card.id)}
                      >
                        Retirer
                      </button>
                    ) : (
                      <button
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded"
                        onClick={() => handleEquipCard(card.id)}
                        disabled={activeBonusCards.length >= maxBonusCardSlots}
                      >
                        Équiper
                      </button>
                    )}

                    <div className="relative group">
                      <button
                        className={`px-3 py-1 bg-gray-700 text-white text-sm rounded ${!canUpgrade || readOnly ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-600'}`}
                        disabled={!canUpgrade || readOnly}
                        onClick={() => handleUpgradeCard(card.id)}
                      >
                        Améliorer
                      </button>
                      <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs p-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Coût d'amélioration: 50 or (Niveau {card.level || 1})
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // Rendu du modal de détails
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
            <span
              className="px-2 py-0.5 text-xs rounded text-white"
              style={{ backgroundColor: getRarityColor(selectedCard.rarity) }}
            >
              {selectedCard.rarity}
            </span>
          </div>

          <p className="text-gray-300 mb-4">{selectedCard.description}</p>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="text-sm text-gray-400 mb-1">Type</h3>
              <p className="font-medium text-white">
                {selectedCard.effect === 'active' ? 'Actif' : 'Passif'}
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

          {upgradeConfirmation ? (
            <div className="border-t border-gray-700 pt-4 mt-4">
              <p className="text-yellow-300 mb-4">Confirmer l'amélioration pour 50 or ?</p>
              <div className="flex space-x-3">
                <button
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
                  onClick={() => handleUpgradeCard(selectedCard.id)}
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
            <div className="mt-4 flex justify-end">
              <button
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
                onClick={handleCloseDetails}
              >
                Fermer
              </button>
            </div>
          )}
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="bg-gray-900 p-4 rounded-lg">
      {/* En-tête et filtres */}
      <div className="flex flex-col md:flex-row justify-between mb-4">
        <h2 className="text-xl font-bold mb-3 md:mb-0 flex items-center text-white">
          <span className="mr-2">🃏</span>
          Cartes Bonus
          {readOnly && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-600 text-white rounded">
              Mode lecture seule
            </span>
          )}
        </h2>

        <div className="flex flex-wrap gap-2">
          <button
            className={`px-3 py-1 text-sm rounded ${filterOptions.tab === 'collection' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            onClick={() => setFilterOptions((prev) => ({ ...prev, tab: 'collection' }))}
          >
            Collection {bonusCardCollection.length > 0 && `(${bonusCardCollection.length})`}
          </button>
          <button
            className={`px-3 py-1 text-sm rounded ${filterOptions.tab === 'equipped' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
            onClick={() => setFilterOptions((prev) => ({ ...prev, tab: 'equipped' }))}
          >
            Équipées ({activeBonusCards.length}/{maxBonusCardSlots})
          </button>
        </div>
      </div>

      {/* Filtres avancés */}
      <div className="mb-4 flex flex-wrap gap-2">
        <input
          type="text"
          placeholder="Rechercher..."
          className="px-3 py-1 border border-gray-700 bg-gray-800 text-white rounded flex-grow md:flex-grow-0"
          value={filterOptions.search}
          onChange={(e) => setFilterOptions((prev) => ({ ...prev, search: e.target.value }))}
        />

        <select
          className="px-3 py-1 border border-gray-700 bg-gray-800 text-white rounded"
          value={filterOptions.rarity}
          onChange={(e) => setFilterOptions((prev) => ({ ...prev, rarity: e.target.value }))}
        >
          <option value="all">Toutes raretés</option>
          <option value="common">Commune</option>
          <option value="uncommon">Peu commune</option>
          <option value="rare">Rare</option>
          <option value="epic">Épique</option>
          <option value="legendary">Légendaire</option>
        </select>

        <select
          className="px-3 py-1 border border-gray-700 bg-gray-800 text-white rounded"
          value={filterOptions.sortBy}
          onChange={(e) => setFilterOptions((prev) => ({ ...prev, sortBy: e.target.value }))}
        >
          <option value="name">Trier par nom</option>
          <option value="rarity">Trier par rareté</option>
          <option value="level">Trier par niveau</option>
        </select>
      </div>

      {/* Liste des cartes */}
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
              Aucune carte {filterOptions.tab === 'equipped' ? 'équipée' : ''} trouvée.
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Modal de détails de carte */}
      <AnimatePresence>{selectedCard && renderCardDetails()}</AnimatePresence>

      {/* Informations sur les emplacements */}
      {filterOptions.tab === 'collection' && (
        <div className="mt-4 p-3 bg-blue-900 bg-opacity-30 text-blue-300 rounded-md text-sm">
          <p className="flex items-center">
            <span className="mr-2">ℹ️</span>
            Vous disposez de {maxBonusCardSlots} emplacements pour équiper des cartes bonus.
            {maxBonusCardSlots < 5 &&
              " Vous pouvez débloquer plus d'emplacements en progressant dans le jeu."}
          </p>
        </div>
      )}

      {/* Guide d'utilisation */}
      <div className="mt-4 border-t border-gray-700 pt-4 text-sm text-gray-400">
        <details>
          <summary className="cursor-pointer font-medium mb-2 text-gray-300">
            Guide d'utilisation des cartes bonus
          </summary>
          <div className="pl-4 space-y-2">
            <p>
              • Les cartes <strong>passives</strong> s'activent automatiquement lorsque leurs
              conditions sont remplies.
            </p>
            <p>
              • Les cartes <strong>actives</strong> doivent être activées manuellement pendant les
              combats.
            </p>
            <p>• Améliorez vos cartes pour augmenter leur puissance (jusqu'au niveau 3).</p>
            <p>• Les cartes équipées seront disponibles pendant les combats.</p>
          </div>
        </details>
      </div>
    </div>
  );
};

export default React.memo(BonusCardDeck);
