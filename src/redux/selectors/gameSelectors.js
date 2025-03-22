// src/redux/selectors/gameSelectors.js
import { createSelector } from '@reduxjs/toolkit';

// Sélecteurs de base
const selectGameState = (state) => state.game;
const selectCombatState = (state) => state.combat;
const selectMapState = (state) => state.map;
const selectBonusCardsState = (state) => state.bonusCards;
const selectShopState = (state) => state.shop;

// Sélecteurs mémorisés pour l'état du jeu
export const selectGamePhase = createSelector(
  [selectGameState],
  (gameState) => gameState.gamePhase
);

export const selectIsGameOver = createSelector(
  [selectGameState],
  (gameState) => gameState.gamePhase === 'gameOver' || gameState.isGameOver
);

export const selectStage = createSelector(
  [selectGameState],
  (gameState) => gameState.stage
);

export const selectCurrentFloor = createSelector(
  [selectGameState],
  (gameState) => gameState.currentFloor
);

export const selectMaxFloors = createSelector(
  [selectGameState],
  (gameState) => gameState.maxFloors
);

export const selectTutorialStatus = createSelector(
  [selectGameState],
  (gameState) => ({
    step: gameState.tutorialStep,
    showTutorial: gameState.showTutorial,
  })
);

export const selectGameStats = createSelector(
  [selectGameState],
  (gameState) => gameState.stats
);

// Sélecteurs mémorisés pour le combat
export const selectEnemy = createSelector(
  [selectCombatState],
  (combatState) => combatState.enemy
);

export const selectPlayerHand = createSelector(
  [selectCombatState],
  (combatState) => combatState.hand
);

export const selectSelectedCards = createSelector(
  [selectCombatState],
  (combatState) => combatState.selectedCards
);

export const selectTurnPhase = createSelector(
  [selectCombatState],
  (combatState) => combatState.turnPhase
);

export const selectHandResult = createSelector(
  [selectCombatState],
  (combatState) => combatState.handResult
);

export const selectCombatLog = createSelector(
  [selectCombatState],
  (combatState) => combatState.combatLog
);

// Sélecteurs mémorisés pour la carte
export const selectMapPath = createSelector(
  [selectMapState],
  (mapState) => mapState.path
);

export const selectCurrentNodeId = createSelector(
  [selectMapState],
  (mapState) => mapState.currentNodeId
);

export const selectCurrentNode = createSelector(
  [selectMapPath, selectCurrentNodeId],
  (path, currentNodeId) => path.find((node) => node.id === currentNodeId)
);

export const selectAccessibleNodes = createSelector(
  [selectMapPath, selectCurrentNodeId],
  (path, currentNodeId) => {
    if (!currentNodeId) {
      // Au début du jeu, seul le nœud de départ est accessible
      const startNode = path.find((node) => node.type === 'start');
      return startNode ? [startNode.id] : [];
    }

    // Trouver le nœud actuel
    const currentNode = path.find((node) => node.id === currentNodeId);

    // Si le nœud actuel n'existe pas ou n'a pas d'enfants, retourner une liste vide
    if (!currentNode || !currentNode.childIds) return [];

    // Retourner les IDs des nœuds enfants
    return currentNode.childIds;
  }
);

// Sélecteurs mémorisés pour les cartes bonus
export const selectBonusCardCollection = createSelector(
  [selectBonusCardsState],
  (bonusCardsState) => bonusCardsState.collection
);

export const selectActiveBonusCards = createSelector(
  [selectBonusCardsState],
  (bonusCardsState) => bonusCardsState.active
);

export const selectMaxBonusCardSlots = createSelector(
  [selectBonusCardsState],
  (bonusCardsState) => bonusCardsState.maxSlots
);

// Sélecteurs mémorisés pour la boutique
export const selectShopItems = createSelector(
  [selectShopState],
  (shopState) => shopState.items
);

export const selectItemsPurchased = createSelector(
  [selectShopState],
  (shopState) => shopState.itemsPurchased
);

// Sélecteur combiné pour l'état complet du jeu (utile pour débogage ou sauvegarde)
export const selectGameCompleteSate = createSelector(
  [
    selectGameState,
    selectCombatState,
    selectMapState,
    selectBonusCardsState,
    selectShopState,
  ],
  (game, combat, map, bonusCards, shop) => ({
    game,
    combat,
    map,
    bonusCards,
    shop,
  })
);

// Sélectionner l'état du jeu pour une sauvegarde
export const selectGameSaveState = createSelector(
  [selectGameState, selectMapState, selectBonusCardsState, selectShopState],
  (game, map, bonusCards, shop) => ({
    version: '1.0',
    timestamp: Date.now(),
    game: {
      stage: game.stage,
      currentFloor: game.currentFloor,
      maxFloors: game.maxFloors,
      gamePhase: game.gamePhase,
      stats: { ...game.stats },
    },
    map: {
      path: map.path,
      currentNodeId: map.currentNodeId,
    },
    bonusCards: {
      collection: bonusCards.collection.map((card) => ({
        id: card.id,
        owned: card.owned !== false,
        level: card.level || 1,
      })),
      active: bonusCards.active.map((card) => ({
        id: card.id,
        usesRemaining: card.usesRemaining || 0,
      })),
      maxSlots: bonusCards.maxSlots,
    },
    shop: {
      itemsPurchased: shop.itemsPurchased,
    },
  })
);
