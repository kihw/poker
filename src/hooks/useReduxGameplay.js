// src/hooks/useReduxGameplay.js
import { useSelector, useDispatch } from 'react-redux';
import {
  startNewCombat,
  attackEnemy,
  continueAfterVictory,
} from '../redux/thunks/combatThunks';
import { generateNewMap, handleNodeSelection } from '../redux/thunks/mapThunks';
import {
  saveGame,
  loadGame,
  deleteSave,
  hasSave,
  resetEntireGame,
} from '../redux/thunks/saveThunks';
import {
  equipCard,
  unequipCard,
  upgradeCard,
  useCard,
  resetCardUses,
} from '../redux/slices/bonusCardsSlice';
import {
  toggleCardSelection,
  discardCards,
  toggleDiscardMode,
} from '../redux/slices/combatSlice';
import { purchaseItem } from '../redux/slices/shopSlice';
import {
  setGamePhase,
  incrementStage,
  completeTutorial,
  setTutorialStep,
} from '../redux/slices/gameSlice';

/**
 * Hook personnalisé pour interagir avec l'état du jeu via Redux
 * Ceci facilite la migration depuis l'ancienne approche basée sur le Contexte
 * en fournissant une API similaire
 */
export const useGameplay = () => {
  const dispatch = useDispatch();

  // Sélecteurs pour récupérer l'état du jeu
  const gameState = useSelector((state) => ({
    // Général
    stage: state.game.stage,
    gamePhase: state.game.gamePhase,
    isGameOver: state.game.isGameOver,

    // Joueur
    player: state.player,

    // Combat
    enemy: state.combat.enemy,
    hand: state.combat.hand,
    selectedCards: state.combat.selectedCards,
    turnPhase: state.combat.turnPhase,
    discardLimit: state.combat.discardLimit,
    discardUsed: state.combat.discardUsed,
    discardMode: state.combat.discardMode,
    handResult: state.combat.handResult,
    combatLog: state.combat.combatLog,

    // Cartes bonus
    bonusCardCollection: state.bonusCards.collection,
    activeBonusCards: state.bonusCards.active,
    maxBonusCardSlots: state.bonusCards.maxSlots,

    // Carte
    path: state.map.path,
    currentNodeId: state.map.currentNodeId,
    isGeneratingMap: state.map.isGenerating,

    // Interface utilisateur
    tutorialStep: state.game.tutorialStep,
    showTutorial: state.game.showTutorial,

    // Boutique
    shopItems: state.shop.items,
    itemsPurchased: state.shop.itemsPurchased,

    // Statistiques
    stats: state.game.stats,

    // État de l'UI
    loading: state.ui.loading,
    error: state.ui.error,
  }));

  // Fonctions pour les actions du jeu
  const gameActions = {
    // Combat
    startCombat: (options) => dispatch(startNewCombat(options)),
    dealHand: () => dispatch(toggleDiscardMode()),
    toggleCardSelection: (index) => dispatch(toggleCardSelection(index)),
    evaluateSelectedHand: () => dispatch(attackEnemy()),
    discardCards: (indices) => dispatch(discardCards(indices)),
    toggleDiscardMode: () => dispatch(toggleDiscardMode()),

    // Cartes bonus
    equipBonusCard: (cardId) => dispatch(equipCard(cardId)),
    unequipBonusCard: (cardId) => dispatch(unequipCard(cardId)),
    upgradeCard: (cardId, cost) => dispatch(upgradeCard({ cardId, cost })),
    useBonus: (index) => dispatch(useCard(index)),
    resetCardUses: () => dispatch(resetCardUses()),

    // Carte et navigation
    generateMap: (options) => dispatch(generateNewMap(options)),
    selectNode: (nodeId) => dispatch(handleNodeSelection(nodeId)),

    // Progression du jeu
    nextStage: () => dispatch(continueAfterVictory()),
    setGamePhase: (phase) => dispatch(setGamePhase(phase)),
    incrementStage: () => dispatch(incrementStage()),

    // Boutique
    purchaseShopItem: (itemIndex) => dispatch(purchaseItem({ itemIndex })),
    leaveShop: () => dispatch(setGamePhase('exploration')),

    // Tutoriel
    setTutorialStep: (step) => dispatch(setTutorialStep(step)),
    completeTutorial: () => dispatch(completeTutorial()),

    // Sauvegarde
    saveGame: () => dispatch(saveGame()),
    loadGame: () => dispatch(loadGame()),
    deleteSave: () => dispatch(deleteSave()),
    hasSave: hasSave,
    resetGame: () => dispatch(resetEntireGame()),
  };

  return {
    gameState,
    ...gameActions,
  };
};

/**
 * Hook pour vérifier si le jeu est terminé et gérer les redirections
 */
export const useGameOverCheck = () => {
  const isGameOver = useSelector(
    (state) => state.game.gamePhase === 'gameOver' || state.game.isGameOver
  );
  const playerHealth = useSelector((state) => state.player.health);

  // En option, vous pouvez implémenter ici la logique de redirection

  return {
    isGameOver,
    isDead: playerHealth <= 0,
  };
};

/**
 * Hook pour accéder et gérer les cartes bonus
 */
export const useBonusCards = () => {
  const dispatch = useDispatch();
  const collection = useSelector((state) => state.bonusCards.collection);
  const active = useSelector((state) => state.bonusCards.active);
  const maxSlots = useSelector((state) => state.bonusCards.maxSlots);

  return {
    collection,
    active,
    maxSlots,
    equipCard: (cardId) => dispatch(equipCard(cardId)),
    unequipCard: (cardId) => dispatch(unequipCard(cardId)),
    upgradeCard: (cardId) => dispatch(upgradeCard({ cardId })),
    useCard: (index) => dispatch(useCard(index)),
  };
};

/**
 * Hook pour accéder aux statistiques du jeu
 */
export const useGameStats = () => {
  return useSelector((state) => state.game.stats);
};

/**
 * Hook pour gérer les sauvegardes
 */
export const useSaveGame = () => {
  const dispatch = useDispatch();

  return {
    saveGame: () => dispatch(saveGame()),
    loadGame: () => dispatch(loadGame()),
    deleteSave: () => dispatch(deleteSave()),
    hasSave: hasSave,
    resetGame: () => dispatch(resetEntireGame()),
  };
};

// Exporter tous les hooks ensemble
export default {
  useGameplay,
  useGameOverCheck,
  useBonusCards,
  useGameStats,
  useSaveGame,
};
