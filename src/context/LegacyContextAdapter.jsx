// src/context/LegacyContextAdapter.jsx
/**
 * Ce composant sert de pont entre l'ancien système de contexte et le nouveau système Redux.
 * Il permet aux composants qui utilisent encore l'ancien contexte de fonctionner pendant la migration.
 * Une fois la migration terminée, ce composant pourra être supprimé.
 */
import React, { createContext, useContext } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useGameActions, useGameData } from '../hooks/useGameActions';

// Création du contexte
export const GameContext = createContext();

export function GameProvider({ children }) {
  // Utiliser les hooks Redux pour récupérer les données et actions
  const gameData = useGameData();
  const gameActions = useGameActions();
  const dispatch = useDispatch();

  // Créer un objet de contexte compatible avec l'ancien système
  const contextValue = {
    gameState: {
      ...gameData,
      player: useSelector((state) => state.player),
      enemy: useSelector((state) => state.combat.enemy),
      activeBonusCards: useSelector((state) => state.bonusCards.active),
      bonusCardCollection: useSelector((state) => state.bonusCards.collection),
      maxBonusCardSlots: useSelector((state) => state.bonusCards.maxSlots),
      path: useSelector((state) => state.map.path),
      currentNodeId: useSelector((state) => state.map.currentNodeId),
      hand: useSelector((state) => state.combat.hand),
      selectedCards: useSelector((state) => state.combat.selectedCards),
      turnPhase: useSelector((state) => state.combat.turnPhase),
      stage: useSelector((state) => state.game.stage),
      gamePhase: useSelector((state) => state.game.gamePhase),
      setActionFeedback: (message, type, duration) =>
        dispatch({
          type: 'ui/setActionFeedback',
          payload: { message, type, duration },
        }),
    },
    // Inclure toutes les actions de l'ancien système
    ...gameActions,
    // Objet vide pour les systèmes qui n'ont plus d'équivalent direct
    bonusCardSystem: {},
    combatSystem: {},
    progressionSystem: {},
    eventBus: {
      subscribe: () => () => {},
      unsubscribe: () => {},
      emit: () => {},
    },
  };

  return (
    <GameContext.Provider value={contextValue}>{children}</GameContext.Provider>
  );
}

// Hooks pour rester compatible avec l'ancien code
export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

export default GameProvider;
