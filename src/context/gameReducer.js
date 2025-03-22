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

// Initial state
export const initialGameState = {
  game: null,
  combatSystem: null,
  bonusCardSystem: null,
  progressionSystem: null,
  loading: true,
  error: null,
  lastUpdate: Date.now(), // Timestamp to track updates
};

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

        // Déterminer l'action en fonction du type de nœud
        switch (selectedNode.type) {
          case 'combat':
            // Initialiser un nouveau combat avec un ennemi standard
            if (state.combatSystem) {
              const enemy = state.combatSystem.generateEnemy(false, false);
              state.combatSystem.startCombat(enemy);

              // Phase de jeu: combat, phase de tour: select (le dealHand est déjà fait dans startCombat)
              state.game.gamePhase = 'combat';
              state.game.turnPhase = 'select';

              // Ajoutez un message au journal de combat
              if (state.game.combatLog) {
                state.game.combatLog.unshift(
                  `Début du combat contre ${enemy.name}!`
                );
              }

              console.log('Combat démarré contre:', enemy);
            }
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
            const newEvent = generateRandomEvent(state.game.stage, state.game);
            state.game.currentEvent = newEvent;
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
            // Ne rien faire pour les autres types de nœuds (start, etc.)
            break;
        }

        console.log(`Nœud ${nodeId} (${selectedNode.type}) sélectionné`);
        return {
          ...state,
          lastUpdate: Date.now(),
        };
      case ACTIONS.PROCESS_EVENT_CHOICE:
        if (!state.game || !state.game.currentEvent) {
          throw new Error('Aucun événement actif trouvé');
        }

        const choiceIndex = action.payload.choiceIndex;

        if (
          choiceIndex < 0 ||
          choiceIndex >= state.game.currentEvent.choices.length
        ) {
          throw new Error('Index de choix invalide');
        }

        // Traiter le choix de l'événement
        const eventResult = processEventChoice(
          state.game.currentEvent,
          choiceIndex,
          state.game
        );

        // Stocker le résultat
        state.game.eventResult = eventResult;

        return {
          ...state,
          lastUpdate: Date.now(),
        };

      // Les autres cas de réduction resteraient similaires
      // J'ai montré les principaux pour ne pas surcharger le message

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
