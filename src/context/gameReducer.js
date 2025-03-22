// src/context/gameReducer.js
import { ACTIONS } from './gameActions';
import { generateRoguelikeMap, validateMap } from '../modules/map-generator';
import {
  generateRandomEvent,
  processEventChoice,
} from '../modules/event-system';
import {
  saveGame,
  loadGame,
  applySaveData,
  deleteSave,
} from '../modules/save-system';

// Add the RESET_GAME action to the imported ACTIONS
// Instead of redeclaring ACTIONS, we'll add our new action
const RESET_GAME = 'RESET_GAME';

// Initial state
export const initialGameState = {
  game: null,
  combatSystem: null,
  bonusCardSystem: null,
  progressionSystem: null,
  loading: true,
  error: null,
  lastUpdate: Date.now(), // Timestamp to track updates
  toggleResult: false, // Flag to track the result of toggle operations
};
export function debugState(message, state) {
  if (process.env.NODE_ENV !== 'production') {
    console.group(`ÉTAT DU JEU - ${message}`);
    console.log('Phase actuelle:', state.game?.gamePhase);
    console.log('Phase du tour:', state.game?.turnPhase);
    console.log(
      'Ennemi:',
      state.game?.enemy
        ? {
            nom: state.game.enemy.name,
            pv: state.game.enemy.health,
            pvMax: state.game.enemy.maxHealth,
          }
        : 'Aucun'
    );
    console.log(
      'Joueur:',
      state.game?.player
        ? {
            pv: state.game.player.health,
            pvMax: state.game.player.maxHealth,
            or: state.game.player.gold,
          }
        : 'Non initialisé'
    );
    console.log(
      'Main:',
      state.game?.hand
        ? state.game.hand.map(
            (card) =>
              `${card.value} de ${card.suit} ${card.isSelected ? '(Sélectionnée)' : ''}`
          )
        : 'Aucune carte'
    );
    console.log('Sélection:', state.game?.selectedCards);
    console.groupEnd();
  }
}
export function gameReducer(state, action) {
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
      case RESET_GAME:
        // Supprimer la sauvegarde si elle existe
        if (typeof deleteSave === 'function') {
          deleteSave();
        }

        // Retourner un état initial frais
        return {
          ...initialGameState,
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
        if (!state.game) {
          throw new Error('Game state is not initialized');
        }
        const result = state.game.toggleCardSelection(action.payload.index);
        return {
          ...state,
          lastUpdate: Date.now(),
          toggleResult: result,
        };

      case ACTIONS.EVALUATE_SELECTED_HAND:
        if (!state.game) {
          throw new Error('Game state is not initialized');
        }
        state.game.evaluateSelectedHand();

        // Check if enemy is still alive
        if (state.game.enemy && state.game.enemy.health > 0) {
          // Only apply enemy action if enemy is alive
          if (state.combatSystem) {
            state.combatSystem.enemyAction();
          }
        }

        return {
          ...state,
          lastUpdate: Date.now(),
        };
      case ACTIONS.EVALUATE_SELECTED_HAND:
        if (!state.game) {
          throw new Error('Game state is not initialized');
        }
        state.game.evaluateSelectedHand();

        // Ajouter le débogage ici
        debugState('Après évaluation de la main', state);

        return {
          ...state,
          lastUpdate: Date.now(),
        };

      case ACTIONS.NEXT_STAGE:
        if (!state.game || !state.combatSystem) {
          throw new Error('Combat system is not initialized');
        }

        console.log(
          'NEXT_STAGE action appelée, phase actuelle:',
          state.game.gamePhase
        );

        // Si nous sommes en phase de récompense, forcer le passage à l'exploration
        if (state.game.gamePhase === 'reward') {
          state.game.gamePhase = 'exploration';
          console.log(
            "Phase changée de 'reward' à 'exploration' via le reducer"
          );
        } else {
          // Appeler la méthode normale pour les autres transitions
          state.combatSystem.nextStage();
        }
        debugState('Après nextStage', state);

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
        if (!state.game || !state.game.bonusCardSystem) {
          throw new Error('Bonus card system is not initialized');
        }
        state.game.bonusCardSystem.useActiveBonus(action.payload.index);
        return {
          ...state,
          lastUpdate: Date.now(),
        };

      case ACTIONS.NEXT_STAGE:
        if (!state.game || !state.combatSystem) {
          throw new Error('Combat system is not initialized');
        }

        console.log(
          'NEXT_STAGE action appelée, phase actuelle:',
          state.game.gamePhase
        );

        // Si nous sommes en phase de récompense, forcer le passage à l'exploration
        if (state.game.gamePhase === 'reward') {
          state.game.gamePhase = 'exploration';
          console.log(
            "Phase changée de 'reward' à 'exploration' via le reducer"
          );
        } else {
          // Appeler la méthode normale pour les autres transitions
          state.combatSystem.nextStage();
        }

        return {
          ...state,
          lastUpdate: Date.now(),
        };

      case ACTIONS.UNEQUIP_BONUS_CARD:
        if (!state.game || !state.bonusCardSystem) {
          throw new Error('Bonus card system is not initialized');
        }
        const unequipResult = state.bonusCardSystem.unequipBonusCard(
          action.payload.cardId
        );
        if (unequipResult && state.game.setActionFeedback) {
          state.game.setActionFeedback('Carte retirée', 'info');
        }
        return {
          ...state,
          lastUpdate: Date.now(),
        };

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

        // Générer une nouvelle carte
        const mapNodes = generateRoguelikeMap(state.game.stage, width, depth);

        // Valider la carte
        if (!validateMap(mapNodes)) {
          throw new Error('Carte générée invalide');
        }

        // Mettre à jour la carte dans l'état du jeu
        state.game.path = mapNodes;

        // Définir le nœud de départ comme nœud courant
        const startNode = mapNodes.find((node) => node.type === 'start');
        if (startNode) {
          state.game.currentNodeId = startNode.id;
        }

        console.log(
          `Carte roguelike générée avec ${mapNodes.length} nœuds pour l'étage ${state.game.currentFloor}`
        );

        return {
          ...state,
          lastUpdate: Date.now(),
        };

      case ACTIONS.GENERATE_EVENT:
        if (!state.game) {
          throw new Error('Game state is not initialized');
        }

        // Générer un événement aléatoire
        const newEvent = generateRandomEvent(state.game.stage, state.game);

        // Mettre à jour l'événement courant
        state.game.currentEvent = newEvent;
        state.game.gamePhase = 'event';

        console.log(`Événement généré : ${newEvent.title}`);

        return {
          ...state,
          lastUpdate: Date.now(),
        };

      case ACTIONS.SELECT_NODE:
        if (!state.game) {
          throw new Error('Game state is not initialized');
        }

        const nodeId = action.payload.nodeId;
        const nodes = state.game.path;

        // Trouver le nœud sélectionné
        const selectedNode = nodes.find((node) => node.id === nodeId);

        if (!selectedNode) {
          throw new Error(`Node with ID ${nodeId} not found`);
        }

        // Mettre à jour le nœud courant
        state.game.currentNodeId = nodeId;

        console.log(`Nœud sélectionné: ${selectedNode.type} (ID: ${nodeId})`);

        // Déterminer l'action en fonction du type de nœud
        switch (selectedNode.type) {
          case 'combat':
            // Générer un ennemi standard et démarrer le combat
            if (state.combatSystem) {
              state.combatSystem.startCombat();
            }
            state.game.gamePhase = 'combat';
            state.game.turnPhase = 'draw';
            break;

          case 'elite':
            // Générer un ennemi élite et démarrer le combat
            if (state.combatSystem) {
              const eliteEnemy = state.combatSystem.generateEnemy(true, false);
              state.combatSystem.startCombat(eliteEnemy);
            }
            state.game.gamePhase = 'combat';
            state.game.turnPhase = 'draw';
            break;

          case 'boss':
            // Générer un boss et démarrer le combat
            if (state.combatSystem) {
              const bossEnemy = state.combatSystem.generateEnemy(false, true);
              state.combatSystem.startCombat(bossEnemy);
            }
            state.game.gamePhase = 'combat';
            state.game.turnPhase = 'draw';
            break;

          case 'event':
            // Générer un événement aléatoire
            if (state.game.generateEvent) {
              state.game.generateEvent();
            } else {
              const {
                generateRandomEvent,
              } = require('../modules/event-system');
              const newEvent = generateRandomEvent(
                state.game.stage,
                state.game
              );
              state.game.currentEvent = newEvent;
            }
            state.game.gamePhase = 'event';
            break;

          case 'shop':
            // Initialiser la boutique
            if (state.progressionSystem) {
              state.progressionSystem.initShop();
            }
            state.game.gamePhase = 'shop';
            break;

          case 'rest':
            // Préparer le site de repos
            state.game.gamePhase = 'rest';
            break;

          default:
            console.log(`Nœud de type ${selectedNode.type} sélectionné`);
            // Rester en exploration pour les autres types de nœuds (start, etc.)
            break;
        }

        // Feedback après la sélection du nœud
        if (state.game.setActionFeedback) {
          let feedbackMessage = '';
          switch (selectedNode.type) {
            case 'combat':
              feedbackMessage = `Combat contre un ${state.game.enemy ? state.game.enemy.name : 'ennemi'}`;
              break;
            case 'elite':
              feedbackMessage = `Combat contre un ennemi d'élite!`;
              break;
            case 'boss':
              feedbackMessage = `Combat contre le boss de l'étage!`;
              break;
            case 'event':
              feedbackMessage = `Vous avez trouvé un événement`;
              break;
            case 'shop':
              feedbackMessage = `Bienvenue dans la boutique`;
              break;
            case 'rest':
              feedbackMessage = `Vous vous reposez au campement`;
              break;
            default:
              feedbackMessage = `Lieu sélectionné: ${selectedNode.type}`;
              break;
          }

          state.game.setActionFeedback(feedbackMessage, 'info');
        }

        return {
          ...state,
          lastUpdate: Date.now(),
        };
        if (!state.game) {
          throw new Error('Game state is not initialized');
        }
      case ACTIONS.SAVE_GAME:
        if (!state.game) {
          throw new Error('Cannot save: game state is not initialized');
        }

        // Use the imported saveGame function
        const saveSuccess = saveGame(state.game);

        if (saveSuccess && state.game.setActionFeedback) {
          state.game.setActionFeedback('Partie sauvegardée', 'success');
        } else if (!saveSuccess && state.game.setActionFeedback) {
          state.game.setActionFeedback('Erreur lors de la sauvegarde', 'error');
        }

        return {
          ...state,
          lastUpdate: Date.now(),
        };

      case ACTIONS.LOAD_GAME:
        const savedData = loadGame();

        if (!savedData) {
          if (state.game && state.game.setActionFeedback) {
            state.game.setActionFeedback('Aucune sauvegarde trouvée', 'error');
          }
          return state;
        }

        if (!state.game) {
          console.error('Cannot load: game state is not initialized');
          return {
            ...state,
            error: 'Cannot load: game state is not initialized',
          };
        }

        // Apply saved data to the current game state
        applySaveData(state.game, savedData);

        if (state.game.setActionFeedback) {
          state.game.setActionFeedback('Partie chargée', 'success');
        }

        return {
          ...state,
          lastUpdate: Date.now(),
        };

      case ACTIONS.DELETE_SAVE:
        deleteSave();

        if (state.game && state.game.setActionFeedback) {
          state.game.setActionFeedback('Sauvegarde supprimée', 'info');
        }

        return {
          ...state,
          lastUpdate: Date.now(),
        };

      case ACTIONS.SET_ERROR:
        return {
          ...state,
          error: action.payload.error,
          lastUpdate: Date.now(),
        };

      case ACTIONS.SET_ACTION_FEEDBACK:
        if (!state.game) {
          return state;
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
    console.error(`Erreur dans gameReducer (${action.type}):`, error);

    // Ajouter un retour d'action si l'état du jeu existe
    if (state.game && state.game.setActionFeedback) {
      state.game.setActionFeedback(
        error.message || 'Une erreur est survenue',
        'error'
      );
    }

    return {
      ...state,
      error: error.message || 'Une erreur est survenue',
      lastUpdate: Date.now(),
    };
  }
}
