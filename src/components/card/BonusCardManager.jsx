// src/components/card/BonusCardManager.jsx
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';

// Import des actions Redux
import { equipCard, unequipCard, upgradeCard } from '../../redux/slices/bonusCardsSlice';
import { setActionFeedback } from '../../redux/slices/uiSlice';
import { spendGold } from '../../redux/slices/playerSlice';

// Import des composants UI
import { Button, Badge, Card, Tooltip } from '../ui/DesignSystem';

/**
 * Gestionnaire amélioré de cartes bonus avec optimisations de performance
 * et interface utilisateur améliorée
 */
const BonusCardManager = ({ readOnly = false }) => {
  const dispatch = useDispatch();

  // Sélecteurs Redux optimisés
  const bonusCardCollection = useSelector((state) => state.bonusCards.collection || []);
  const activeBonusCards = useSelector((state) => state.bonusCards.active || []);
  const maxBonusCardSlots = useSelector((state) => state.bonusCards.maxSlots || 3);
  const playerGold = useSelector((state) => state.player.gold || 0);
  const gamePhase = useSelector((state) => state.game.gamePhase);

  // État local pour le filtrage et le tri
  const [filterOptions, setFilterOptions] = useState({
    tab: 'collection',
    search: '',
    sortBy: 'name',
    rarity: 'all',
  });

  // État pour afficher les détails d'une carte
  const [selectedCard, setSelectedCard] = useState(null);
  const [upgradeConfirmation, setUpgradeConfirmation] = useState(false);

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

  // Gestionnaires d'événements
  const handleEquipCard = useCallback(
    (cardId) => {
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
    },
    [dispatch, activeBonusCards.length, maxBonusCardSlots, readOnly]
  );

  const handleUnequipCard = useCallback(
    (cardId) => {
      if (readOnly) return;

      dispatch(unequipCard(cardId));

      dispatch(
        setActionFeedback({
          message: 'Carte retirée',
          type: 'info',
        })
      );
    },
    [dispatch, readOnly]
  );

  const handleUpgradeCard = useCallback(
    (cardId) => {
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
    },
    [dispatch, playerGold, bonusCardCollection, upgradeConfirmation, readOnly]
  );

  // Gestion de la sélection et désélection de carte
  const handleCardSelect = useCallback((card) => {
    setSelectedCard((prev) => (prev && prev.id === card.id ? null : card));
    setUpgradeConfirmation(false);
  }, []);

  // Fermer la modale de détails
  const handleCloseDetails = useCallback(() => {
    setSelectedCard(null);
    setUpgradeConfirmation(false);
  }, []);

  // Rendu d'une carte
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
                    {card.level && <Badge variant="outline">Nv. {card.level}</Badge>}
                  </div>
                </div>

                <p className="text-sm text-gray-600 mt-2 mb-3">{card.description}</p>

                <div className="border-t pt-2 mt-2">
                  <div className="flex text-xs text-gray-500 mb-2">
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
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleUnequipCard(card.id)}
                        >
                          Retirer
                        </Button>
                      ) : (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleEquipCard(card.id)}
                          disabled={activeBonusCards.length >= maxBonusCardSlots}
                        >
                          Équiper
                        </Button>
                      )}

                      <Tooltip content={`Coût d'amélioration: 50 or (Niveau ${card.level || 1})`}>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!canUpgrade || readOnly}
                          onClick={() => handleUpgradeCard(card.id)}
                        >
                          Améliorer
                        </Button>
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
            <Badge style={{ backgroundColor: getRarityColor(selectedCard.rarity) }}>
              {selectedCard.rarity}
            </Badge>
          </div>

          <p className="text-gray-300 mb-4">{selectedCard.description}</p>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <h3 className="text-sm text-gray-400 mb-1">Type</h3>
              <p className="font-medium">{selectedCard.effect === 'active' ? 'Actif' : 'Passif'}</p>
            </div>
            <div>
              <h3 className="text-sm text-gray-400 mb-1">Niveau</h3>
              <p className="font-medium">{selectedCard.level || 1}</p>
            </div>
            {selectedCard.bonus && (
              <div className="col-span-2">
                <h3 className="text-sm text-gray-400 mb-1">Effet</h3>
                <p className="font-medium">
                  {selectedCard.bonus.type}: {selectedCard.bonus.value}
                </p>
              </div>
            )}
          </div>

          {upgradeConfirmation ? (
            <div className="border-t border-gray-700 pt-4 mt-4">
              <p className="text-yellow-300 mb-4">Confirmer l'amélioration pour 50 or ?</p>
              <div className="flex space-x-3">
                <Button variant="primary" onClick={() => handleUpgradeCard(selectedCard.id)}>
                  Confirmer
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setUpgradeConfirmation(false);
                    setSelectedCard(null);
                  }}
                >
                  Annuler
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-4 flex justify-end">
              <Button variant="primary" onClick={handleCloseDetails}>
                Fermer
              </Button>
            </div>
          )}
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="bg-gray-100 p-4 rounded-lg">
      {/* En-tête et filtres */}
      <div className="flex flex-col md:flex-row justify-between mb-4">
        <h2 className="text-xl font-bold mb-3 md:mb-0 flex items-center">
          <span className="mr-2">🃏</span>
          Cartes Bonus
          {readOnly && (
            <Badge variant="warning" className="ml-2">
              Mode lecture seule
            </Badge>
          )}
        </h2>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={filterOptions.tab === 'collection' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilterOptions((prev) => ({ ...prev, tab: 'collection' }))}
          >
            Collection {bonusCardCollection.length > 0 && `(${bonusCardCollection.length})`}
          </Button>
          <Button
            variant={filterOptions.tab === 'equipped' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilterOptions((prev) => ({ ...prev, tab: 'equipped' }))}
          >
            Équipées ({activeBonusCards.length}/{maxBonusCardSlots})
          </Button>
        </div>
      </div>

      {/* Filtres avancés */}
      <div className="mb-4 flex flex-wrap gap-2">
        <input
          type="text"
          placeholder="Rechercher..."
          className="px-3 py-1 border border-gray-300 rounded flex-grow md:flex-grow-0"
          value={filterOptions.search}
          onChange={(e) => setFilterOptions((prev) => ({ ...prev, search: e.target.value }))}
        />

        <select
          className="px-3 py-1 border border-gray-300 rounded"
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
          className="px-3 py-1 border border-gray-300 rounded"
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
              className="text-center py-8 text-gray-500"
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
        <div className="mt-4 p-3 bg-blue-50 text-blue-800 rounded-md text-sm">
          <p className="flex items-center">
            <span className="mr-2">ℹ️</span>
            Vous disposez de {maxBonusCardSlots} emplacements pour équiper des cartes bonus.
            {maxBonusCardSlots < 5 &&
              " Vous pouvez débloquer plus d'emplacements en progressant dans le jeu."}
          </p>
        </div>
      )}

      {/* Guide d'utilisation */}
      <div className="mt-4 border-t border-gray-200 pt-4 text-sm text-gray-500">
        <details>
          <summary className="cursor-pointer font-medium mb-2">
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

export default React.memo(BonusCardManager);
