// src/context/GameContext.jsx
import React, {
  createContext,
  useReducer,
  useEffect,
  useCallback,
} from 'react';

import { GameState } from '../core/game-state';
import { BonusCardSystem } from '../modules/bonus-cards';
import { CombatSystem } from '../modules/combat';
import { ProgressionSystem } from '../modules/progression';
import {
  saveGame,
  loadGame,
  applySaveData,
  hasSave,
} from '../modules/save-system';
import { ACTIONS } from './gameActions';
import { gameReducer, initialGameState } from './gameReducer';
import { AutoSaveHandler } from '../modules/save-system';
import { applyCombatFixes } from '../modules/combat-fixes';
import { generateRoguelikeMap, validateMap } from '../modules/map-generator.js';
// Création du contexte
export const GameContext = createContext();

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);

  // Initialisation du jeu au montage du composant
  useEffect(() => {
    let isMounted = true;

    const initGame = async () => {
      try {
        console.log('Initialisation du jeu en cours...');

        // Créer les instances des systèmes de jeu
        const gameState = new GameState();
        const combatSystem = new CombatSystem(gameState);
        const bonusCardSystem = new BonusCardSystem(gameState);
        const progressionSystem = new ProgressionSystem(gameState);

        // Attacher les systèmes à l'état du jeu
        gameState.combatSystem = combatSystem;
        gameState.bonusCardSystem = bonusCardSystem;
        gameState.progressionSystem = progressionSystem;

        // Initialiser les emplacements de cartes bonus
        gameState.maxBonusCardSlots = 3;

        // Appliquer les correctifs au système de combat
        applyCombatFixes(gameState);
        if (gameState.discardCards) {
          // Importer la fonction améliorée de défausse depuis le module
          const { improvedDiscardCards } = await import(
            '../modules/combat-fixes'
          );
          gameState.discardCards = improvedDiscardCards.bind(gameState);
        }

        // Appliquer les correctifs de gestion de la mort
        if (combatSystem && combatSystem.checkCombatEnd) {
          // Importer les fonctions améliorées
          const { improvedCheckCombatEnd, applyDeathHandlingFixes } =
            await import('../modules/combat-fixes');

          // Appliquer les correctifs
          applyDeathHandlingFixes(gameState, combatSystem);
        }

        console.log('Correctifs améliorés appliqués avec succès');
        // Vérifier si une sauvegarde existe
        if (hasSave()) {
          const saveData = loadGame();
          if (saveData) {
            console.log('Chargement de la partie sauvegardée...');
            applySaveData(gameState, saveData);
          }
        } else {
          console.log("Aucune sauvegarde trouvée, début d'une nouvelle partie");

          // Initialiser le mode exploration plutôt que combat
          gameState.gamePhase = 'exploration';

          // Initialiser les cartes bonus
          bonusCardSystem.initBonusCardCollection();

          // Générer la carte pour la nouvelle partie
          const mapOptions = {
            width: 3 + Math.min(2, Math.floor(gameState.currentFloor / 3)),
            depth: 5 + Math.min(3, Math.floor(gameState.currentFloor / 2)),
          };

          const mapNodes = generateRoguelikeMap(
            gameState.stage,
            mapOptions.width,
            mapOptions.depth
          );

          // Valider la carte
          if (!validateMap(mapNodes)) {
            throw new Error('Carte générée invalide');
          }

          // Mettre à jour l'état du jeu avec la carte
          gameState.path = mapNodes;

          // Définir le nœud de départ
          const startNode = mapNodes.find((node) => node.type === 'start');
          if (startNode) {
            gameState.currentNodeId = startNode.id;
          }
        }

        // Journal de débogage
        console.log('Génération de carte terminée');
        console.log('Nœud actuel:', gameState.currentNodeId);
        console.log('Détails du chemin:', gameState.path);

        // Mettre à jour l'état si le composant est toujours monté
        if (isMounted) {
          dispatch({
            type: ACTIONS.INIT_GAME,
            payload: {
              game: gameState,
              combatSystem,
              bonusCardSystem,
              progressionSystem,
            },
          });
        }
      } catch (error) {
        console.error(
          "Erreur critique lors de l'initialisation du jeu:",
          error
        );
        if (isMounted) {
          dispatch({
            type: ACTIONS.SET_ERROR,
            payload: {
              error: error.message || "Échec de l'initialisation du jeu",
            },
          });
        }
      }
    };

    initGame();

    // Fonction de nettoyage
    return () => {
      isMounted = false;
    };
  }, []);

  // Système d'événements pour la communication entre composants
  const gameEventBus = {
    listeners: {},

    subscribe(event, callback) {
      if (!this.listeners[event]) {
        this.listeners[event] = [];
      }
      this.listeners[event].push(callback);
      return () => this.unsubscribe(event, callback);
    },

    unsubscribe(event, callback) {
      if (!this.listeners[event]) return;
      this.listeners[event] = this.listeners[event].filter(
        (cb) => cb !== callback
      );
    },

    emit(event, data) {
      if (!this.listeners[event]) return;
      this.listeners[event].forEach((callback) => callback(data));
    },
  };

  // Vérification périodique de l'état du combat
  useEffect(() => {
    if (!state.game || !state.combatSystem) return;

    // Si l'ennemi est vaincu mais que la phase de combat n'a pas changé
    if (
      state.game.gamePhase === 'combat' &&
      state.game.enemy &&
      state.game.enemy.health <= 0 &&
      state.game.turnPhase === 'result'
    ) {
      console.log(
        "Vérification de l'état du combat : Ennemi vaincu mais phase non mise à jour"
      );
      state.combatSystem.checkCombatEnd();
    }
  }, [state.game, state.combatSystem, state.lastUpdate]);

  // Actions de jeu optimisées
  const gameActions = {
    dealHand: useCallback(() => {
      dispatch({ type: ACTIONS.DEAL_HAND });
    }, []),

    toggleCardSelection: useCallback(
      (index) => {
        dispatch({ type: ACTIONS.TOGGLE_CARD_SELECTION, payload: { index } });
        return state.toggleResult;
      },
      [state.toggleResult]
    ),

    resetGame: useCallback(() => {
      console.log('Réinitialisation complète du jeu');

      // 1. Supprimer la sauvegarde
      try {
        if (typeof deleteSave === 'function') {
          deleteSave();
          console.log('Sauvegarde supprimée avec succès');
        }
      } catch (error) {
        console.error('Erreur lors de la suppression de la sauvegarde:', error);
      }

      // 2. Dispatch l'action RESET_GAME
      dispatch({ type: ACTIONS.RESET_GAME });

      // 3. Vider le localStorage complètement - solution radicale mais efficace
      try {
        localStorage.removeItem('pokerSoloRpgSave');
        console.log('Sauvegarde supprimée du localStorage');
      } catch (error) {
        console.error('Erreur lors de la suppression du localStorage:', error);
      }

      // 4. Forcer un rechargement complet de la page
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }, [dispatch]),

    evaluateSelectedHand: useCallback(() => {
      dispatch({ type: ACTIONS.EVALUATE_SELECTED_HAND });
    }, []),

    discardCards: useCallback((indices) => {
      dispatch({ type: ACTIONS.DISCARD_CARDS, payload: { indices } });
    }, []),

    useBonus: useCallback((index) => {
      dispatch({ type: ACTIONS.USE_BONUS, payload: { index } });
    }, []),

    nextStage: useCallback(() => {
      dispatch({ type: ACTIONS.NEXT_STAGE });
    }, []),

    equipBonusCard: useCallback((cardId) => {
      console.log('Action: equipBonusCard', cardId);
      dispatch({ type: ACTIONS.EQUIP_BONUS_CARD, payload: { cardId } });
    }, []),

    unequipBonusCard: useCallback((cardId) => {
      console.log('Action: unequipBonusCard', cardId);
      dispatch({ type: ACTIONS.UNEQUIP_BONUS_CARD, payload: { cardId } });
    }, []),

    selectNode: useCallback((nodeId) => {
      dispatch({ type: ACTIONS.SELECT_NODE, payload: { nodeId } });
    }, []),

    makeEventChoice: useCallback(
      (choiceIndex) => {
        dispatch({ type: ACTIONS.MAKE_EVENT_CHOICE, payload: { choiceIndex } });
        return state.game?.eventResult;
      },
      [state.game?.eventResult]
    ),

    completeRest: useCallback((result) => {
      dispatch({ type: ACTIONS.REST_COMPLETE, payload: { result } });
    }, []),

    setActionFeedback: useCallback(
      (message, type = 'info', duration = 2000) => {
        dispatch({
          type: ACTIONS.SET_ACTION_FEEDBACK,
          payload: { message, type, duration },
        });
      },
      []
    ),

    leaveShop: useCallback(() => {
      dispatch({ type: ACTIONS.NEXT_STAGE });
    }, []),

    purchaseShopItem: useCallback(
      (itemIndex) => {
        const progressionSystem = state.progressionSystem;
        if (progressionSystem) {
          const result = progressionSystem.purchaseShopItem(itemIndex);

          // Retour d'action pour l'achat
          if (state.game && state.game.setActionFeedback) {
            if (result.success) {
              state.game.setActionFeedback(result.message, 'success');
            } else {
              state.game.setActionFeedback(result.message, 'error');
            }
          }

          return result;
        }
        return null;
      },
      [state.progressionSystem, state.game]
    ),

    // Actions de génération de carte roguelike
    generateMap: useCallback((options = {}) => {
      dispatch({
        type: ACTIONS.GENERATE_MAP,
        payload: options,
      });
    }, []),

    completeFloor: useCallback(() => {
      dispatch({ type: ACTIONS.COMPLETE_FLOOR });
    }, []),

    generateEvent: useCallback(() => {
      dispatch({ type: ACTIONS.GENERATE_EVENT });
    }, []),

    processEventChoice: useCallback(
      (choiceIndex) => {
        dispatch({
          type: ACTIONS.PROCESS_EVENT_CHOICE,
          payload: { choiceIndex },
        });

        return state.game?.eventResult;
      },
      [state.game?.eventResult]
    ),

    completeEvent: useCallback(() => {
      dispatch({ type: ACTIONS.COMPLETE_EVENT });
    }, []),

    // Actions de sauvegarde
    saveGame: useCallback(() => {
      dispatch({ type: ACTIONS.SAVE_GAME });
    }, []),

    loadGame: useCallback(() => {
      dispatch({ type: ACTIONS.LOAD_GAME });
    }, []),

    deleteSave: useCallback(() => {
      dispatch({ type: ACTIONS.DELETE_SAVE });
    }, []),

    hasSave: useCallback(() => {
      return hasSave();
    }, []),
  };

  // Valeur du contexte avec état dérivé supplémentaire
  const value = {
    eventBus: gameEventBus,
    gameState: state.game,
    combatSystem: state.combatSystem,
    bonusCardSystem: state.bonusCardSystem,
    progressionSystem: state.progressionSystem,
    loading: state.loading,
    error: state.error,
    lastUpdate: state.lastUpdate,
    gameStatus: {
      isInCombat: state.game?.gamePhase === 'combat',
      isInShop: state.game?.gamePhase === 'shop',
      isInRest: state.game?.gamePhase === 'rest',
      isInEvent: state.game?.gamePhase === 'event',
      isGameOver: state.game?.gamePhase === 'gameOver',
      currentTurnPhase: state.game?.turnPhase,
      playerHealth: state.game?.player?.health || 0,
      playerMaxHealth: state.game?.player?.maxHealth || 0,
      playerHealthPercentage: state.game?.player
        ? Math.floor(
            (state.game.player.health / state.game.player.maxHealth) * 100
          )
        : 0,
      enemyHealthPercentage: state.game?.enemy
        ? Math.floor(
            (state.game.enemy.health / state.game.enemy.maxHealth) * 100
          )
        : 0,
      stage: state.game?.stage || 1,
      stats: {
        cardsPlayed: state.game?.stats?.cardsPlayed || 0,
        damageDealt: state.game?.stats?.damageDealt || 0,
        enemiesDefeated: state.game?.stats?.enemiesDefeated || 0,
        bonusCardsUsed: state.game?.stats?.bonusCardsUsed || 0,
        goldEarned: state.game?.stats?.goldEarned || 0,
      },
    },
    ...gameActions,
  };

  return (
    <GameContext.Provider value={value}>
      {children}

      {/* Gestionnaire de sauvegarde global */}
      {state.game && (
        <AutoSaveHandler
          gameState={state.game}
          saveInterval={60000} // Sauvegarde automatique toutes les minutes
          lastUpdate={state.lastUpdate}
        />
      )}
    </GameContext.Provider>
  );
}

export default GameProvider;
