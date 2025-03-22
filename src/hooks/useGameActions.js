// src/hooks/useGameActions.js
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setGamePhase, incrementStage } from '../redux/slices/gameSlice';
import { selectNode } from '../redux/slices/mapSlice';
import {
  dealHand,
  toggleCardSelection,
  evaluateSelectedHand,
  discardCards,
  toggleDiscardMode,
} from '../redux/slices/combatSlice';
import {
  equipCard,
  unequipCard,
  useCard,
  resetCardUses,
} from '../redux/slices/bonusCardsSlice';
import { setActionFeedback } from '../redux/slices/uiSlice';
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
  resetEntireGame,
} from '../redux/thunks/saveThunks';

/**
 * Hook personnalisé qui regroupe les actions courantes du jeu
 * pour faciliter la migration depuis l'ancien contexte
 */
export function useGameActions() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  return {
    // Actions de jeu générales
    setGamePhase: (phase) => dispatch(setGamePhase(phase)),
    incrementStage: () => dispatch(incrementStage()),
    nextStage: () => dispatch(continueAfterVictory()),

    // Navigation et carte
    navigateTo: (path) => navigate(path),
    generateMap: (options) => dispatch(generateNewMap(options)),
    selectNode: (nodeId) => dispatch(handleNodeSelection(nodeId)),

    // Combat
    startCombat: (options) => dispatch(startNewCombat(options)),
    dealHand: () => dispatch(dealHand()),
    toggleCardSelection: (index) => dispatch(toggleCardSelection(index)),
    evaluateSelectedHand: () => dispatch(attackEnemy()),
    discardCards: (indices) => dispatch(discardCards(indices)),
    toggleDiscardMode: () => dispatch(toggleDiscardMode()),

    // Cartes bonus
    equipBonusCard: (cardId) => dispatch(equipCard(cardId)),
    unequipBonusCard: (cardId) => dispatch(unequipCard(cardId)),
    useBonus: (index) => dispatch(useCard(index)),
    resetCardUses: () => dispatch(resetCardUses()),

    // Feedback
    setActionFeedback: (message, type = 'info', duration = 2000) =>
      dispatch(setActionFeedback({ message, type, duration })),

    // Sauvegarde
    saveGame: () => dispatch(saveGame()),
    loadGame: () => dispatch(loadGame()),
    deleteSave: () => dispatch(deleteSave()),
    resetGame: () => dispatch(resetEntireGame()),
    hasSave: () => localStorage.getItem('pokerSoloRpgSave') !== null,
  };
}

/**
 * Hook pour obtenir les données courantes du jeu
 */
export function useGameData() {
  return {
    gamePhase: useSelector((state) => state.game.gamePhase),
    isGameOver: useSelector(
      (state) => state.game.isGameOver || state.game.gamePhase === 'gameOver'
    ),
    player: useSelector((state) => state.player),
    enemy: useSelector((state) => state.combat.enemy),
    hand: useSelector((state) => state.combat.hand),
    selectedCards: useSelector((state) => state.combat.selectedCards),
    turnPhase: useSelector((state) => state.combat.turnPhase),
    discardMode: useSelector((state) => state.combat.discardMode),
    discardUsed: useSelector((state) => state.combat.discardUsed),
    discardLimit: useSelector((state) => state.combat.discardLimit),
    bonusCardCollection: useSelector((state) => state.bonusCards.collection),
    activeBonusCards: useSelector((state) => state.bonusCards.active),
    maxBonusCardSlots: useSelector((state) => state.bonusCards.maxSlots),
    handResult: useSelector((state) => state.combat.handResult),
    combatLog: useSelector((state) => state.combat.combatLog),
    map: useSelector((state) => state.map),
    stage: useSelector((state) => state.game.stage),
    stats: useSelector((state) => state.game.stats),
  };
}

export default { useGameActions, useGameData };
