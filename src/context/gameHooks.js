// src/context/gameHooks.js
import { useContext, useCallback } from 'react';
import { GameContext } from './GameContext';
import {
  saveGame,
  loadGame,
  deleteSave,
  hasSave,
} from '../modules/save-system';

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

export function useGameStats() {
  const { gameStatus } = useGame();
  return gameStatus.stats;
}

export function useBonusCards() {
  const { bonusCardSystem, gameState } = useGame();

  return {
    collection: gameState?.bonusCardCollection || [],
    activeCards: gameState?.activeBonusCards || [],
    equip: useCallback(
      (cardId) => {
        return bonusCardSystem?.equipBonusCard(cardId);
      },
      [bonusCardSystem]
    ),
    unequip: useCallback(
      (cardId) => {
        return bonusCardSystem?.unequipBonusCard(cardId);
      },
      [bonusCardSystem]
    ),
    upgrade: useCallback(
      (cardId, materials) => {
        return bonusCardSystem?.upgradeCard(cardId, materials);
      },
      [bonusCardSystem]
    ),
    maxSlots: gameState?.maxBonusCardSlots || 3,
  };
}

export function useSaveGame() {
  const {
    saveGame: contextSaveGame,
    loadGame: contextLoadGame,
    deleteSave: contextDeleteSave,
    hasSave: contextHasSave,
  } = useGame();

  return {
    saveGame: contextSaveGame,
    loadGame: contextLoadGame,
    deleteSave: contextDeleteSave,
    hasSave: contextHasSave,
  };
}

// Export par défaut pour la cohérence
export default {
  useGame,
  useGameStats,
  useBonusCards,
  useSaveGame,
};
