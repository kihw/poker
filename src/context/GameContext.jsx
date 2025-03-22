// src/context/GameContext.jsx
import React, {
  createContext,
  useReducer,
  useContext,
  useEffect,
  useCallback,
} from 'react';
import { GameState } from '../core/game-state';
import { BonusCardSystem } from '../modules/bonus-cards';
import { CombatSystem } from '../modules/combat';
import { ProgressionSystem } from '../modules/progression';
import {
  generateRandomEvent,
  processEventChoice,
} from '../modules/event-system';
import { generateRoguelikeMap, validateMap } from '../modules/map-generator';
import {
  saveGame,
  loadGame,
  applySaveData,
  deleteSave,
  hasSave,
  AutoSaveHandler,
} from '../modules/save-system';
// Initial state
const initialGameState = {
  game: null,
  combatSystem: null,
  bonusCardSystem: null,
  progressionSystem: null,
  loading: true,
  error: null,
  lastUpdate: Date.now(), // Timestamp to track updates
};

// Actions
const ACTIONS = {
  INIT_GAME: 'INIT_GAME',
  DEAL_HAND: 'DEAL_HAND',
  TOGGLE_CARD_SELECTION: 'TOGGLE_CARD_SELECTION',
  EVALUATE_SELECTED_HAND: 'EVALUATE_SELECTED_HAND',
  DISCARD_CARDS: 'DISCARD_CARDS',
  USE_BONUS: 'USE_BONUS',
  NEXT_STAGE: 'NEXT_STAGE',
  EQUIP_BONUS_CARD: 'EQUIP_BONUS_CARD',
  UNEQUIP_BONUS_CARD: 'UNEQUIP_BONUS_CARD',
  SELECT_NODE: 'SELECT_NODE',
  MAKE_EVENT_CHOICE: 'MAKE_EVENT_CHOICE',
  REST_COMPLETE: 'REST_COMPLETE',
  SET_ERROR: 'SET_ERROR',
  SET_ACTION_FEEDBACK: 'SET_ACTION_FEEDBACK',
  GENERATE_MAP: 'GENERATE_MAP',
  COMPLETE_FLOOR: 'COMPLETE_FLOOR',
  GENERATE_EVENT: 'GENERATE_EVENT',
  PROCESS_EVENT_CHOICE: 'PROCESS_EVENT_CHOICE',
  COMPLETE_EVENT: 'COMPLETE_EVENT',
  SAVE_GAME: 'SAVE_GAME',
  LOAD_GAME: 'LOAD_GAME',
  DELETE_SAVE: 'DELETE_SAVE',
};

// Reducer function with improved error handling and immutability
function gameReducer(state, action) {
  try {
    switch (action.type) {
      case ACTIONS.INIT_GAME:
        return {
          ...state,
          game: action.payload.game,
          combatSystem: action.payload.combatSystem,
          bonusCardSystem: action.payload.bonusCardSystem,
          progressionSystem: action.payload.progressionSystem,
          loading: false,
          lastUpdate: Date.now(),
        };

      // ... [other existing action cases from the previous implementation]

      case ACTIONS.GENERATE_MAP:
        if (!state.game) {
          throw new Error('Game state is not initialized');
        }

        const mapOptions = action.payload || {};
        const width =
          mapOptions.width ||
          3 + Math.min(2, Math.floor(state.game.currentFloor / 3));
        const depth =
          mapOptions.depth ||
          5 + Math.min(3, Math.floor(state.game.currentFloor / 2));

        // Generate new map
        let mapNodes = generateRoguelikeMap(state.game.stage, width, depth);

        // Validate map - regenerate if necessary
        let attempts = 0;
        while (!validateMap(mapNodes) && attempts < 5) {
          console.log(`Map generation attempt ${attempts + 1}`);
          mapNodes = generateRoguelikeMap(state.game.stage, width, depth);
          attempts++;
        }

        // Update map in game state
        state.game.path = mapNodes;

        // Set start node as current node
        const startNode = mapNodes.find((node) => node.type === 'start');
        if (startNode) {
          state.game.currentNodeId = startNode.id;
        }

        console.log(
          `Roguelike map generated with ${mapNodes.length} nodes for floor ${state.game.currentFloor}`
        );

        if (state.game.setActionFeedback) {
          state.game.setActionFeedback(
            `New map generated for floor ${state.game.currentFloor}`,
            'info'
          );
        }

        return {
          ...state,
          lastUpdate: Date.now(),
        };

      case ACTIONS.GENERATE_EVENT:
        if (!state.game) {
          throw new Error('Game state is not initialized');
        }

        // Generate random event
        const newEvent = generateRandomEvent(state.game.stage, state.game);

        // Update current event
        state.game.currentEvent = newEvent;
        state.game.gamePhase = 'event';

        console.log(`Event generated: ${newEvent.title}`);

        return {
          ...state,
          lastUpdate: Date.now(),
        };

      case ACTIONS.PROCESS_EVENT_CHOICE:
        if (!state.game || !state.game.currentEvent) {
          throw new Error('No active event found');
        }

        const choiceIndex = action.payload.choiceIndex;

        if (
          choiceIndex < 0 ||
          choiceIndex >= state.game.currentEvent.choices.length
        ) {
          throw new Error('Invalid choice index');
        }

        // Process event choice with event system
        const eventResult = processEventChoice(
          state.game.currentEvent,
          choiceIndex,
          state.game
        );

        // Store the result
        state.game.eventResult = eventResult;

        return {
          ...state,
          lastUpdate: Date.now(),
        };

      case ACTIONS.COMPLETE_EVENT:
        if (!state.game) {
          throw new Error('Game state is not initialized');
        }

        // Clean up event and return to map
        state.game.currentEvent = null;
        state.game.eventResult = null;
        state.game.gamePhase = 'map';

        return {
          ...state,
          lastUpdate: Date.now(),
        };

      case ACTIONS.COMPLETE_FLOOR:
        if (!state.game) {
          throw new Error('Game state is not initialized');
        }

        // Increment current floor
        state.game.currentFloor++;

        // Floor completion rewards
        state.game.player.gold += 50 * state.game.currentFloor;
        state.game.player.health = Math.min(
          state.game.player.maxHealth,
          state.game.player.health +
            Math.floor(state.game.player.maxHealth * 0.3)
        );

        // Reset map
        state.game.path = null;
        state.game.currentNodeId = null;

        // Generate new map
        if (state.game.path === null) {
          const width =
            3 + Math.min(2, Math.floor(state.game.currentFloor / 3));
          const depth =
            5 + Math.min(3, Math.floor(state.game.currentFloor / 2));

          let mapNodes = generateRoguelikeMap(state.game.stage, width, depth);

          let attempts = 0;
          while (!validateMap(mapNodes) && attempts < 5) {
            mapNodes = generateRoguelikeMap(state.game.stage, width, depth);
            attempts++;
          }

          state.game.path = mapNodes;

          const startNode = mapNodes.find((node) => node.type === 'start');
          if (startNode) {
            state.game.currentNodeId = startNode.id;
          }
        }

        // Add combat log messages
        if (state.game.combatLog) {
          state.game.combatLog.unshift(
            `Congratulations! You completed floor ${state.game.currentFloor - 1}.`
          );
          state.game.combatLog.unshift(
            `Welcome to floor ${state.game.currentFloor}!`
          );
        }

        if (state.game.setActionFeedback) {
          state.game.setActionFeedback(
            `New floor ${state.game.currentFloor} reached!`,
            'success'
          );
        }

        return {
          ...state,
          lastUpdate: Date.now(),
        };

      case ACTIONS.SAVE_GAME:
        if (!state.game) {
          throw new Error('Game state is not initialized');
        }

        const saveResult = saveGame(state.game);

        if (saveResult && state.game.setActionFeedback) {
          state.game.setActionFeedback('Game saved successfully', 'success');
        } else if (!saveResult && state.game.setActionFeedback) {
          state.game.setActionFeedback('Error saving game', 'error');
        }

        return {
          ...state,
          lastUpdate: Date.now(),
        };

      case ACTIONS.LOAD_GAME:
        if (!state.game) {
          throw new Error('Game state is not initialized');
        }

        const saveData = loadGame();

        if (saveData) {
          const loadResult = applySaveData(state.game, saveData);

          if (loadResult && state.game.setActionFeedback) {
            state.game.setActionFeedback('Game loaded successfully', 'success');
          } else if (!loadResult && state.game.setActionFeedback) {
            state.game.setActionFeedback('Error loading game', 'error');
          }
        } else if (state.game.setActionFeedback) {
          state.game.setActionFeedback('No save found', 'error');
        }

        return {
          ...state,
          lastUpdate: Date.now(),
        };

      case ACTIONS.DELETE_SAVE:
        const deleteResult = deleteSave();

        if (deleteResult && state.game && state.game.setActionFeedback) {
          state.game.setActionFeedback('Save deleted', 'info');
        }

        return {
          ...state,
          lastUpdate: Date.now(),
        };

      // Default case
      default:
        return state;
    }
  } catch (error) {
    console.error(`Error in gameReducer (${action.type}):`, error);

    // If game state exists, add error feedback
    if (state.game && state.game.setActionFeedback) {
      state.game.setActionFeedback(
        error.message || 'An error occurred',
        'error'
      );
    }

    return {
      ...state,
      error: error.message || 'An error occurred',
      lastUpdate: Date.now(),
    };
  }
}

// Create context
const GameContext = createContext();

// Context provider
function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);

  // Initialize game on component mount
  useEffect(() => {
    let isMounted = true;

    const initGame = async () => {
      try {
        console.log('Starting game initialization...');

        // Create instances of game systems
        const gameState = new GameState();
        const combatSystem = new CombatSystem(gameState);
        const bonusCardSystem = new BonusCardSystem(gameState);
        const progressionSystem = new ProgressionSystem(gameState);

        // Attach systems to game state
        gameState.combatSystem = combatSystem;
        gameState.bonusCardSystem = bonusCardSystem;
        gameState.progressionSystem = progressionSystem;

        // Initialiser les emplacements de cartes bonus
        gameState.maxBonusCardSlots = 3;

        // Check if a save exists and load it if so
        if (hasSave()) {
          const saveData = loadGame();
          if (saveData) {
            console.log('Loading saved game...');
            applySaveData(gameState, saveData);
          }
        } else {
          console.log('No save found, starting new game');
          
          // Initialiser le deck et le premier combat
          combatSystem.startCombat();

          // Initialiser les cartes bonus
          bonusCardSystem.initBonusCardCollection();
        }

        // Génération de la carte avec validation
        let mapNodes;
        let attempts = 0;
        const maxAttempts = 5;

        do {
          const mapOptions = {
            width: 3 + Math.min(2, Math.floor(gameState.currentFloor / 3)),
            depth: 5 + Math.min(3, Math.floor(gameState.currentFloor / 2))
          };

          mapNodes = generateRoguelikeMap(gameState.stage, mapOptions.width, mapOptions.depth);
          
          console.log(`Map generation attempt ${attempts + 1}`);
          console.log('Generated nodes:', mapNodes.map(node => ({
            id: node.id, 
            type: node.type, 
            parentIds: node.parentIds, 
            childIds: node.childIds
          })));

          attempts++;
        } while (!validateMap(mapNodes) && attempts < maxAttempts);

        if (!validateMap(mapNodes)) {
          throw new Error('Impossible de générer une carte valide après plusieurs tentatives');
        }

        // Mettre à jour l'état du jeu avec la carte
        gameState.path = mapNodes;

        // Définir le nœud de départ
        const startNode = mapNodes.find(node => node.type === 'start');
        if (startNode) {
          gameState.currentNodeId = startNode.id;
        }

        console.log('Map generation complete');
        console.log('Current node:', gameState.currentNodeId);
        console.log('Path details:', gameState.path);

        // Check if component is still mounted before updating state
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
        console.error('Critical Error initializing game:', error);
        if (isMounted) {
          dispatch({
            type: ACTIONS.SET_ERROR,
            payload: { error: error.message || 'Failed to initialize game' },
          });
        }
      }
    };// Generate a map for the first level if needed
        if (!gameState.path) {
          // Use generateMap method with current floor and game state parameters
          const mapOptions = {
            width: 3 + Math.min(2, Math.floor(gameState.currentFloor / 3)),
            depth: 5 + Math.min(3, Math.floor(gameState.currentFloor / 2))
          };
          const mapNodes = generateRoguelikeMap(gameState.stage, mapOptions.width, mapOptions.depth);
          gameState.path = mapNodes;

          // Set start node as current node
          const startNode = mapNodes.find((node) => node.type === 'start');
          if (startNode) {
            gameState.currentNodeId = startNode.id;
          }
        }
        // Start the first combat to set up initial state
        combatSystem.startCombat();

        // Initialize bonus cards
        bonusCardSystem.initBonusCardCollection();

        // Check if component is still mounted before updating state
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
        console.error('Error initializing game:', error);
        if (isMounted) {
          dispatch({
            type: ACTIONS.SET_ERROR,
            payload: { error: error.message || 'Failed to initialize game' },
          });
        }
      }
    };

    initGame();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, []);

  
  // Periodic combat state check
  useEffect(() => {
    if (!state.game || !state.combatSystem) return;

    // If enemy is defeated but combat phase hasn't changed
    if (
      state.game.gamePhase === 'combat' &&
      state.game.enemy &&
      state.game.enemy.health <= 0 &&
      state.game.turnPhase === 'result'
    ) {
      console.log(
        'Combat state check: Enemy defeated but phase not updated, triggering check'
      );
      state.combatSystem.checkCombatEnd();
    }
  }, [state.game, state.combatSystem, state.lastUpdate]);

  // Optimized action callbacks
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

          // Purchase feedback
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

    // New roguelike map generation actions
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

    // Save game actions
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

  // Context value with additional derived state
  const value = {
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

      {/* Global save handler */}
      {state.game && (
        <AutoSaveHandler
          gameState={state.game}
          saveInterval={60000} // Auto-save every minute
          lastUpdate={state.lastUpdate}
        />
      )}
    </GameContext.Provider>
  );
}

// Custom hook to use the game context
function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

// Custom hook for game stats
function useGameStats() {
  const { gameStatus } = useGame();
  return gameStatus.stats;
}

// Custom hook for bonus cards management
function useBonusCards() {
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
function useSaveGame() {
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

export {
  GameProvider,
  useGame,
  useGameStats,
  useBonusCards,
  ACTIONS,
  useSaveGame, // Add this export
};
