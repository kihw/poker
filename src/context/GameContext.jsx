// src/context/GameContext.jsx
<<<<<<< HEAD
import React, {
  createContext,
  useReducer,
  useContext,
  useEffect,
  useCallback,
} from 'react';
=======
import React, { createContext, useReducer, useContext, useEffect } from 'react';
>>>>>>> 0057e418c4c4321fe4644761f151a2c134a2087c
import { GameState } from '../core/game-state';
import { BonusCardSystem } from '../modules/bonus-cards';
import { CombatSystem } from '../modules/combat';
import { ProgressionSystem } from '../modules/progression';

// Initial state
const initialGameState = {
  game: null,
  combatSystem: null,
  bonusCardSystem: null,
  progressionSystem: null,
  loading: true,
  error: null,
<<<<<<< HEAD
  lastUpdate: Date.now(), // Horodatage pour suivre les mises à jour
=======
>>>>>>> 0057e418c4c4321fe4644761f151a2c134a2087c
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
<<<<<<< HEAD
  SET_ACTION_FEEDBACK: 'SET_ACTION_FEEDBACK',
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

      case ACTIONS.DEAL_HAND:
        if (!state.game) {
          throw new Error('Game state is not initialized');
        }
        state.game.dealHand();
        return {
          ...state,
          lastUpdate: Date.now(),
        };

      case ACTIONS.TOGGLE_CARD_SELECTION:
        console.log(
          `GameContext: TOGGLE_CARD_SELECTION action received with index ${action.payload.index}`
        );
        if (state.game) {
          // Appeler directement la méthode sans vérification supplémentaire
          state.game.toggleCardSelection(action.payload.index);
        } else {
          console.error('Game state is not initialized');
        }
        return { ...state };

      case ACTIONS.EVALUATE_SELECTED_HAND:
        if (!state.game) {
          throw new Error('Game state is not initialized');
        }

        try {
          state.game.evaluateSelectedHand();
          state.combatSystem.enemyAction();
          state.combatSystem.checkCombatEnd();
        } catch (error) {
          console.error('Error evaluating hand:', error);
          // Ajouter un feedback d'erreur à l'état du jeu
          if (state.game.setActionFeedback) {
            state.game.setActionFeedback(
              error.message || "Erreur lors de l'évaluation de la main",
              'error'
            );
          }
        }

        return {
          ...state,
          lastUpdate: Date.now(),
        };

      case ACTIONS.DISCARD_CARDS:
        if (!state.game) {
          throw new Error('Game state is not initialized');
        }
        state.game.discardCards(action.payload.indices);
        return {
          ...state,
          lastUpdate: Date.now(),
        };

      case ACTIONS.USE_BONUS:
        if (!state.bonusCardSystem) {
          throw new Error('Bonus card system is not initialized');
        }
        const bonusResult = state.bonusCardSystem.useActiveBonus(
          action.payload.index
        );

        // Ajouter un feedback du résultat
        if (state.game.setActionFeedback && bonusResult) {
          state.game.setActionFeedback(
            bonusResult.message,
            bonusResult.success ? 'success' : 'error'
          );
        }

        return {
          ...state,
          lastUpdate: Date.now(),
        };

      case ACTIONS.NEXT_STAGE:
        if (!state.combatSystem) {
          throw new Error('Combat system is not initialized');
        }
        state.combatSystem.nextStage();
        return {
          ...state,
          lastUpdate: Date.now(),
        };

      case ACTIONS.EQUIP_BONUS_CARD:
        if (state.bonusCardSystem) {
          const result = state.bonusCardSystem.equipBonusCard(
            action.payload.cardId
          );
          console.log(
            'Equipping card',
            action.payload.cardId,
            'Result:',
            result
          );
          // Force un rafraîchissement du state
          return { ...state };
        }
        return state;

      case ACTIONS.UNEQUIP_BONUS_CARD:
        if (state.bonusCardSystem) {
          const result = state.bonusCardSystem.unequipBonusCard(
            action.payload.cardId
          );
          console.log(
            'Unequipping card',
            action.payload.cardId,
            'Result:',
            result
          );
          // Force un rafraîchissement du state
          return { ...state };
        }
        return state;

      case ACTIONS.SELECT_NODE:
        if (!state.game) {
          throw new Error('Game state is not initialized');
        }

        // Mise à jour du nœud actuel
=======
};

// Reducer function
function gameReducer(state, action) {
  switch (action.type) {
    case ACTIONS.INIT_GAME:
      return {
        ...state,
        game: action.payload.game,
        combatSystem: action.payload.combatSystem,
        bonusCardSystem: action.payload.bonusCardSystem,
        progressionSystem: action.payload.progressionSystem,
        loading: false,
      };

    case ACTIONS.DEAL_HAND:
      state.game.dealHand();
      return { ...state };

    case ACTIONS.TOGGLE_CARD_SELECTION:
      console.log(
        `GameContext: TOGGLE_CARD_SELECTION action received with index ${action.payload.index}`
      );
      if (state.game) {
        state.game.toggleCardSelection(action.payload.index);
      } else {
        console.error('Game state is not initialized');
      }
      return { ...state };

    case ACTIONS.EVALUATE_SELECTED_HAND:
      try {
        state.game.evaluateSelectedHand();
        state.combatSystem.enemyAction();
        state.combatSystem.checkCombatEnd();
      } catch (error) {
        console.error('Error evaluating hand:', error);
      }
      return { ...state };

    case ACTIONS.DISCARD_CARDS:
      state.game.discardCards(action.payload.indices);
      return { ...state };

    case ACTIONS.USE_BONUS:
      if (state.bonusCardSystem) {
        state.bonusCardSystem.useActiveBonus(action.payload.index);
      }
      return { ...state };

    case ACTIONS.NEXT_STAGE:
      state.combatSystem.nextStage();
      return { ...state };

    case ACTIONS.EQUIP_BONUS_CARD:
      state.bonusCardSystem.equipBonusCard(action.payload.cardId);
      return { ...state };

    case ACTIONS.UNEQUIP_BONUS_CARD:
      state.bonusCardSystem.unequipBonusCard(action.payload.cardId);
      return { ...state };

    case ACTIONS.SELECT_NODE:
      // Nouvelle implémentation
      if (state.game && action.payload.nodeId) {
        // Supposons qu'il y a une méthode selectNode dans l'état du jeu
>>>>>>> 0057e418c4c4321fe4644761f151a2c134a2087c
        state.game.currentNodeId = action.payload.nodeId;

        // Déterminer le type de nœud et changer l'état du jeu en conséquence
        const selectedNode = state.game.path?.find(
          (node) => node.id === action.payload.nodeId
        );
<<<<<<< HEAD

=======
>>>>>>> 0057e418c4c4321fe4644761f151a2c134a2087c
        if (selectedNode) {
          switch (selectedNode.type) {
            case 'combat':
              state.combatSystem.startCombat();
              break;
            case 'shop':
              state.progressionSystem.initShop();
              state.game.gamePhase = 'shop';
              break;
            case 'rest':
              state.game.gamePhase = 'rest';
              break;
            case 'event':
              state.game.gamePhase = 'event';
              state.game.currentEvent = selectedNode.event;
              break;
          }
<<<<<<< HEAD

          // Feedback sur le type de nœud sélectionné
          if (state.game.setActionFeedback) {
            let feedbackMsg = '';
            switch (selectedNode.type) {
              case 'combat':
                feedbackMsg = 'Préparation au combat!';
                break;
              case 'shop':
                feedbackMsg = 'Bienvenue à la boutique!';
                break;
              case 'rest':
                feedbackMsg = 'Site de repos trouvé';
                break;
              case 'event':
                feedbackMsg = 'Événement découvert!';
                break;
            }

            if (feedbackMsg) {
              state.game.setActionFeedback(feedbackMsg, 'info');
            }
          }
        }

        return {
          ...state,
          lastUpdate: Date.now(),
        };

      case ACTIONS.MAKE_EVENT_CHOICE:
        if (!state.game || !state.game.currentEvent) {
          throw new Error('No active event found');
        }

        const event = state.game.currentEvent;
        const choiceIndex = action.payload.choiceIndex;

        if (choiceIndex < 0 || choiceIndex >= event.choices.length) {
          throw new Error('Invalid choice index');
        }

        const choice = event.choices[choiceIndex];

        // Appliquer les coûts du choix
        if (choice.goldCost) {
          state.game.player.gold -= choice.goldCost;
        }
        if (choice.healthCost) {
          state.game.player.health -= choice.healthCost;
        }

        // Vérifier si le joueur est mort suite au coût en santé
        if (state.game.player.health <= 0) {
          state.game.player.health = 0;
          state.game.gamePhase = 'gameOver';

          if (state.game.setActionFeedback) {
            state.game.setActionFeedback('Vous avez succombé!', 'error');
          }

          return {
            ...state,
            lastUpdate: Date.now(),
          };
        }

        // Appliquer les récompenses
        if (choice.rewards) {
          if (choice.rewards.gold) {
            state.game.player.gold += choice.rewards.gold;
          }
          if (choice.rewards.health) {
            state.game.player.health = Math.min(
              state.game.player.health + choice.rewards.health,
              state.game.player.maxHealth
            );
          }
          if (choice.rewards.bonusCard && state.bonusCardSystem) {
            state.bonusCardSystem.addBonusCardToCollection(
              choice.rewards.bonusCard
            );
          }
        }

        // Générer un résultat
        const result = {
          message: choice.resultText || 'Votre choix a été pris en compte.',
          details: choice.resultDetails || {},
        };

        // Stocker le résultat dans l'état
        state.game.eventResult = result;

        return {
          ...state,
          lastUpdate: Date.now(),
        };

      case ACTIONS.REST_COMPLETE:
        if (!state.game) {
          throw new Error('Game state is not initialized');
        }

        const restResult = action.payload.result;

        if (restResult && restResult.effect) {
          switch (restResult.effect.type) {
            case 'heal':
              state.game.player.health = Math.min(
                state.game.player.health + restResult.effect.value,
=======
        }
      }
      return { ...state };

    case ACTIONS.MAKE_EVENT_CHOICE:
      // Nouvelle implémentation
      if (
        state.game &&
        state.game.currentEvent &&
        typeof action.payload.choiceIndex === 'number'
      ) {
        // Traiter le choix de l'événement
        const event = state.game.currentEvent;
        const choice = event.choices[action.payload.choiceIndex];

        // Appliquer les effets du choix (ceci est un exemple simplifié)
        if (choice) {
          // Appliquer les coûts du choix
          if (choice.goldCost) {
            state.game.player.gold -= choice.goldCost;
          }
          if (choice.healthCost) {
            state.game.player.health -= choice.healthCost;
          }

          // Générer un résultat basé sur le choix
          // Note: Vous devrez implémenter une logique plus complète selon votre jeu
          const result = {
            message: choice.resultText || 'Votre choix a été pris en compte.',
            details: choice.resultDetails || {},
          };

          // Stocker le résultat dans l'état
          state.game.eventResult = result;
        }
      }
      return { ...state };

    case ACTIONS.REST_COMPLETE:
      // Nouvelle implémentation
      if (state.game && action.payload.result) {
        const result = action.payload.result;

        // Appliquer les effets du repos
        if (result.effect) {
          switch (result.effect.type) {
            case 'heal':
              state.game.player.health = Math.min(
                state.game.player.health + result.effect.value,
>>>>>>> 0057e418c4c4321fe4644761f151a2c134a2087c
                state.game.player.maxHealth
              );
              break;
            case 'upgrade':
<<<<<<< HEAD
              if (restResult.effect.card && state.bonusCardSystem) {
                // Mettre à jour la carte améliorée dans la collection
                const cardIndex = state.game.bonusCardCollection.findIndex(
                  (card) => card.id === restResult.effect.card.id
                );
                if (cardIndex >= 0) {
                  state.game.bonusCardCollection[cardIndex] =
                    restResult.effect.card;
=======
              if (result.effect.card && state.bonusCardSystem) {
                // Mettre à jour la carte améliorée dans la collection
                const cardIndex = state.game.bonusCardCollection.findIndex(
                  (card) => card.id === result.effect.card.id
                );
                if (cardIndex >= 0) {
                  state.game.bonusCardCollection[cardIndex] =
                    result.effect.card;
>>>>>>> 0057e418c4c4321fe4644761f151a2c134a2087c
                }
              }
              break;
            case 'buff':
<<<<<<< HEAD
              if (restResult.effect.buff) {
=======
              if (result.effect.buff) {
>>>>>>> 0057e418c4c4321fe4644761f151a2c134a2087c
                // Ajouter un buff temporaire au joueur
                if (!state.game.playerBuffs) {
                  state.game.playerBuffs = [];
                }
<<<<<<< HEAD
                state.game.playerBuffs.push(restResult.effect.buff);
=======
                state.game.playerBuffs.push(result.effect.buff);
>>>>>>> 0057e418c4c4321fe4644761f151a2c134a2087c
              }
              break;
          }
        }

        // Continuer le jeu
        state.game.gamePhase = 'map'; // Retour à la carte après le repos
<<<<<<< HEAD

        return {
          ...state,
          lastUpdate: Date.now(),
        };

      case ACTIONS.SET_ERROR:
        return {
          ...state,
          error: action.payload.error,
          loading: false,
          lastUpdate: Date.now(),
        };

      case ACTIONS.SET_ACTION_FEEDBACK:
        if (!state.game) {
          throw new Error('Game state is not initialized');
        }

        state.game.setActionFeedback(
          action.payload.message,
          action.payload.type,
          action.payload.duration
        );

        return {
          ...state,
          lastUpdate: Date.now(),
        };

      default:
        return state;
    }
  } catch (error) {
    console.error(`Error in gameReducer (${action.type}):`, error);

    // Si l'état du jeu existe, ajouter un feedback d'erreur
    if (state.game && state.game.setActionFeedback) {
      state.game.setActionFeedback(
        error.message || "Une erreur s'est produite",
        'error'
      );
    }

    return {
      ...state,
      error: error.message || "Une erreur s'est produite",
      lastUpdate: Date.now(),
    };
=======
      }
      return { ...state };

    case ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload.error,
        loading: false,
      };

    default:
      return state;
>>>>>>> 0057e418c4c4321fe4644761f151a2c134a2087c
  }
}

// Create context
const GameContext = createContext();

// Context provider
function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);

<<<<<<< HEAD
  // Initialize game on component mount
  useEffect(() => {
    let isMounted = true; // Flag pour gérer le cas où le composant est démonté
=======
  // Initialize game on component mount - VERSION CORRIGÉE
  useEffect(() => {
    let isMounted = true; // Flag pour gérer le cas où le composant est démonté avant la fin de l'initialisation
>>>>>>> 0057e418c4c4321fe4644761f151a2c134a2087c

    const initGame = async () => {
      try {
        // Create instances of game systems
        const gameState = new GameState();
        const combatSystem = new CombatSystem(gameState);
        const bonusCardSystem = new BonusCardSystem(gameState);
        const progressionSystem = new ProgressionSystem(gameState);

<<<<<<< HEAD
        // Generate a simple map for the first level
        if (!gameState.path) {
          // Exemple simplifié de génération de carte
          gameState.path = [
            { id: '1', type: 'combat', parentIds: [], childIds: ['2', '3'] },
            { id: '2', type: 'event', parentIds: ['1'], childIds: ['4'] },
            { id: '3', type: 'rest', parentIds: ['1'], childIds: ['4'] },
            { id: '4', type: 'shop', parentIds: ['2', '3'], childIds: ['5'] },
            { id: '5', type: 'combat', parentIds: ['4'], childIds: [] },
          ];
          gameState.currentNodeId = '1';
        }

=======
>>>>>>> 0057e418c4c4321fe4644761f151a2c134a2087c
        // Start the first combat to set up initial state
        combatSystem.startCombat();

        // Initialize bonus cards
        bonusCardSystem.initBonusCardCollection();

        // Vérifier si le composant est toujours monté avant de mettre à jour l'état
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

<<<<<<< HEAD
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
        'Combat state check: Enemy defeated but phase not updated, triggering check'
      );
      state.combatSystem.checkCombatEnd();
    }
  }, [state.game, state.combatSystem, state.lastUpdate]);

  // Optimisation avec useCallback pour les actions fréquentes
  const gameActions = {
    dealHand: useCallback(() => {
      dispatch({ type: ACTIONS.DEAL_HAND });
    }, []),

    toggleCardSelection: useCallback(
      (index) => {
        dispatch({ type: ACTIONS.TOGGLE_CARD_SELECTION, payload: { index } });
        // Renvoyer le résultat de la sélection
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

    equipBonusCard: (cardId) => {
      console.log('Action: equipBonusCard', cardId);
      dispatch({ type: ACTIONS.EQUIP_BONUS_CARD, payload: { cardId } });
    },

    unequipBonusCard: (cardId) => {
      console.log('Action: unequipBonusCard', cardId);
      dispatch({ type: ACTIONS.UNEQUIP_BONUS_CARD, payload: { cardId } });
    },

    selectNode: useCallback((nodeId) => {
      dispatch({ type: ACTIONS.SELECT_NODE, payload: { nodeId } });
    }, []),

    makeEventChoice: useCallback(
      (choiceIndex) => {
        dispatch({ type: ACTIONS.MAKE_EVENT_CHOICE, payload: { choiceIndex } });
        // Renvoyer le résultat pour l'affichage
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
      // Logic to transition from shop to the map or next stage
      dispatch({ type: ACTIONS.NEXT_STAGE });
    }, []),

    purchaseShopItem: useCallback(
      (itemIndex) => {
        const progressionSystem = state.progressionSystem;
        if (progressionSystem) {
          const result = progressionSystem.purchaseShopItem(itemIndex);

          // Feedback d'achat
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
  };

  // Context value with additional derived state
=======
  const gameActions = {
    dealHand: () => {
      dispatch({ type: ACTIONS.DEAL_HAND });
    },
    toggleCardSelection: (index) => {
      dispatch({ type: ACTIONS.TOGGLE_CARD_SELECTION, payload: { index } });
    },
    evaluateSelectedHand: () => {
      dispatch({ type: ACTIONS.EVALUATE_SELECTED_HAND });
    },
    discardCards: (indices) => {
      dispatch({ type: ACTIONS.DISCARD_CARDS, payload: { indices } });
    },
    useBonus: (index) => {
      dispatch({ type: ACTIONS.USE_BONUS, payload: { index } });
    },
    nextStage: () => {
      dispatch({ type: ACTIONS.NEXT_STAGE });
    },
    equipBonusCard: (cardId) => {
      dispatch({ type: ACTIONS.EQUIP_BONUS_CARD, payload: { cardId } });
    },
    unequipBonusCard: (cardId) => {
      dispatch({ type: ACTIONS.UNEQUIP_BONUS_CARD, payload: { cardId } });
    },
    selectNode: (nodeId) => {
      dispatch({ type: ACTIONS.SELECT_NODE, payload: { nodeId } });
    },
    makeEventChoice: (choiceIndex) => {
      dispatch({ type: ACTIONS.MAKE_EVENT_CHOICE, payload: { choiceIndex } });
    },
    completeRest: (result) => {
      dispatch({ type: ACTIONS.REST_COMPLETE, payload: { result } });
    },
    leaveShop: () => {
      // Logic to transition from shop to the map or next stage
      dispatch({ type: ACTIONS.NEXT_STAGE });
    },
    purchaseShopItem: (itemIndex) => {
      const progressionSystem = state.progressionSystem;
      if (progressionSystem) {
        const result = progressionSystem.purchaseShopItem(itemIndex);
        // You might want to handle the result, e.g., show a message or update UI
        return result;
      }
    },
  };

  // Context value
>>>>>>> 0057e418c4c4321fe4644761f151a2c134a2087c
  const value = {
    gameState: state.game,
    combatSystem: state.combatSystem,
    bonusCardSystem: state.bonusCardSystem,
    progressionSystem: state.progressionSystem,
    loading: state.loading,
    error: state.error,
<<<<<<< HEAD
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
      // Statistiques supplémentaires pour le jeu
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

      {/* Ajouter un gestionnaire global d'erreurs de sauvegarde */}
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

// Composant pour gérer la sauvegarde automatique
const AutoSaveHandler = ({ gameState, saveInterval, lastUpdate }) => {
  useEffect(() => {
    // Fonction pour sauvegarder l'état du jeu
    const saveGame = () => {
      try {
        // Créer une version simplifiée pour la sauvegarde
        const saveData = {
          player: gameState.player,
          stage: gameState.stage,
          bonusCardCollection: gameState.bonusCardCollection,
          activeBonusCards: gameState.activeBonusCards,
          stats: gameState.stats,
          timestamp: Date.now(),
        };

        // Sauvegarder dans le localStorage
        localStorage.setItem('cardRoguelikeSave', JSON.stringify(saveData));
        console.log(
          'Jeu sauvegardé avec succès',
          new Date().toLocaleTimeString()
        );
      } catch (error) {
        console.error('Erreur lors de la sauvegarde du jeu:', error);
      }
    };

    // Configurer la sauvegarde périodique
    const saveTimer = setInterval(saveGame, saveInterval);

    // Sauvegarder lors des changements importants
    if (lastUpdate) {
      saveGame();
    }

    // Nettoyage
    return () => clearInterval(saveTimer);
  }, [gameState, saveInterval, lastUpdate]);

  // Ce composant ne rend rien visuellement
  return null;
};

// Function pour charger une sauvegarde
const loadSavedGame = () => {
  try {
    const savedData = localStorage.getItem('cardRoguelikeSave');
    if (savedData) {
      return JSON.parse(savedData);
    }
  } catch (error) {
    console.error('Erreur lors du chargement de la sauvegarde:', error);
  }
  return null;
};

// Hook personnalisé pour utiliser le contexte de jeu
=======
    ...gameActions,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

// Custom hook to use the game context
>>>>>>> 0057e418c4c4321fe4644761f151a2c134a2087c
function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

<<<<<<< HEAD
// Hook pour accéder uniquement aux statistiques du jeu
function useGameStats() {
  const { gameStatus } = useGame();
  return gameStatus.stats;
}

// Hook pour accéder aux fonctions de gestion des cartes bonus
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

// Hook pour gérer la sauvegarde et le chargement manuel
function useSaveGame() {
  const { gameState } = useGame();

  const saveGame = useCallback(() => {
    try {
      const saveData = {
        player: gameState.player,
        stage: gameState.stage,
        bonusCardCollection: gameState.bonusCardCollection,
        activeBonusCards: gameState.activeBonusCards,
        stats: gameState.stats,
        timestamp: Date.now(),
      };

      localStorage.setItem('cardRoguelikeSave', JSON.stringify(saveData));
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde manuelle:', error);
      return false;
    }
  }, [gameState]);

  const loadGame = useCallback(() => {
    const savedData = loadSavedGame();
    if (savedData && gameState) {
      // Appliquer les données sauvegardées à l'état actuel
      // Notez que ceci est simplifié et nécessiterait une implémentation
      // plus complète dans une application réelle
      gameState.player = savedData.player;
      gameState.stage = savedData.stage;
      gameState.bonusCardCollection = savedData.bonusCardCollection;
      gameState.activeBonusCards = savedData.activeBonusCards;
      gameState.stats = savedData.stats || {};
      return true;
    }
    return false;
  }, [gameState]);

  const hasSavedGame = useCallback(() => {
    return localStorage.getItem('cardRoguelikeSave') !== null;
  }, []);

  const deleteSavedGame = useCallback(() => {
    localStorage.removeItem('cardRoguelikeSave');
  }, []);

  return { saveGame, loadGame, hasSavedGame, deleteSavedGame };
}

export {
  GameProvider,
  useGame,
  useGameStats,
  useBonusCards,
  useSaveGame,
  ACTIONS,
  loadSavedGame,
};
=======
export { GameProvider, useGame, ACTIONS };
>>>>>>> 0057e418c4c4321fe4644761f151a2c134a2087c
