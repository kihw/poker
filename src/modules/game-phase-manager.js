// src/modules/game-phase-manager.js
// Ce module centralise la gestion des transitions entre les différentes phases du jeu

/**
 * Types de phases du jeu
 */
export const GAME_PHASES = {
  EXPLORATION: 'exploration', // Navigation sur la carte
  COMBAT: 'combat', // Combat en cours
  SHOP: 'shop', // Boutique
  REST: 'rest', // Site de repos
  EVENT: 'event', // Événement aléatoire
  REWARD: 'reward', // Écran de récompense après combat
  GAME_OVER: 'gameOver', // Fin de partie
};

/**
 * Types de phases de tour en combat
 */
export const TURN_PHASES = {
  DRAW: 'draw', // Phase de pioche des cartes
  SELECT: 'select', // Phase de sélection des cartes
  RESULT: 'result', // Phase d'affichage des résultats
};

/**
 * Classe qui gère les transitions entre les phases du jeu
 */
export class GamePhaseManager {
  constructor(gameState) {
    this.gameState = gameState;
  }

  /**
   * Change la phase du jeu et effectue les actions associées
   * @param {string} newPhase - Nouvelle phase du jeu (utiliser GAME_PHASES)
   * @param {Object} options - Options supplémentaires pour la transition
   * @returns {boolean} - true si la transition a réussi, false sinon
   */
  changeGamePhase(newPhase, options = {}) {
    if (!this.gameState) {
      console.error('GameState non initialisé');
      return false;
    }

    const currentPhase = this.gameState.gamePhase;

    // Enregistrer l'historique de la transition
    const phaseTransition = {
      from: currentPhase,
      to: newPhase,
      timestamp: Date.now(),
    };

    if (!this.gameState.phaseHistory) {
      this.gameState.phaseHistory = [];
    }
    this.gameState.phaseHistory.push(phaseTransition);

    // Limiter la taille de l'historique
    if (this.gameState.phaseHistory.length > 10) {
      this.gameState.phaseHistory.shift();
    }

    // Logger la transition pour débogage
    console.log(
      `Transition de phase: ${currentPhase || 'undefined'} -> ${newPhase}`
    );

    // Exécuter les actions de sortie de la phase actuelle
    this._executeExitActions(currentPhase);

    // Mettre à jour la phase du jeu
    this.gameState.gamePhase = newPhase;

    // Exécuter les actions d'entrée dans la nouvelle phase
    const success = this._executeEnterActions(newPhase, options);

    // Informer du résultat
    return success;
  }

  /**
   * Change la phase du tour de combat
   * @param {string} newTurnPhase - Nouvelle phase du tour (utiliser TURN_PHASES)
   * @returns {boolean} - true si la transition a réussi, false sinon
   */
  changeTurnPhase(newTurnPhase) {
    if (!this.gameState) {
      console.error('GameState non initialisé');
      return false;
    }

    if (this.gameState.gamePhase !== GAME_PHASES.COMBAT) {
      console.error(
        `Impossible de changer la phase du tour en dehors d'un combat. Phase actuelle: ${this.gameState.gamePhase}`
      );
      return false;
    }

    const currentTurnPhase = this.gameState.turnPhase;

    // Logger la transition pour débogage
    console.log(
      `Transition de phase de tour: ${currentTurnPhase || 'undefined'} -> ${newTurnPhase}`
    );

    // Mettre à jour la phase du tour
    this.gameState.turnPhase = newTurnPhase;

    // Actions spécifiques selon la nouvelle phase
    switch (newTurnPhase) {
      case TURN_PHASES.DRAW:
        // Réinitialiser les cartes sélectionnées
        this.gameState.selectedCards = [];
        if (this.gameState.hand) {
          this.gameState.hand.forEach((card) => {
            card.isSelected = false;
          });
        }
        break;

      case TURN_PHASES.SELECT:
        // Rien de spécial pour le moment
        break;

      case TURN_PHASES.RESULT:
        // Vérifier si l'ennemi est vaincu
        if (this.gameState.enemy && this.gameState.enemy.health <= 0) {
          // Délai avant de passer à la phase de récompense
          setTimeout(() => {
            this.changeGamePhase(GAME_PHASES.REWARD);
          }, 1000);
        }
        break;
    }

    return true;
  }

  /**
   * Actions à exécuter lors de la sortie d'une phase
   * @param {string} phase - Phase dont on sort
   * @private
   */
  _executeExitActions(phase) {
    switch (phase) {
      case GAME_PHASES.COMBAT:
        // Nettoyage des états spécifiques au combat
        this.gameState.discardMode = false;
        this.gameState.discardUsed = false;
        break;

      case GAME_PHASES.SHOP:
        // Réinitialiser les items du shop pour la prochaine visite
        this.gameState.shopItems = [];
        break;

      case GAME_PHASES.EVENT:
        // Réinitialiser les états d'événement
        this.gameState.currentEvent = null;
        this.gameState.eventResult = null;
        break;
    }
  }

  /**
   * Actions à exécuter lors de l'entrée dans une phase
   * @param {string} phase - Phase dans laquelle on entre
   * @param {Object} options - Options supplémentaires
   * @returns {boolean} - true si les actions ont réussi, false sinon
   * @private
   */
  _executeEnterActions(phase, options) {
    try {
      switch (phase) {
        case GAME_PHASES.EXPLORATION:
          // Vérifier que la carte est disponible
          if (!this.gameState.path || this.gameState.path.length === 0) {
            console.warn('Passage en mode exploration sans carte disponible');
            if (this.gameState.generateMap) {
              this.gameState.generateMap();
            }
          }
          break;

        case GAME_PHASES.COMBAT:
          // Initialiser un combat
          if (options.enemy) {
            this.gameState.enemy = options.enemy;
          } else if (this.gameState.combatSystem) {
            const isElite = options.isElite || false;
            const isBoss = options.isBoss || false;
            this.gameState.enemy = this.gameState.combatSystem.generateEnemy(
              isElite,
              isBoss
            );
          }

          // Initialiser les phases du tour
          this.gameState.turnPhase = TURN_PHASES.DRAW;

          // Réinitialiser les buff/debuff de combat
          this.gameState.invulnerableNextTurn = false;
          this.gameState.pendingDamageBonus = 0;
          this.gameState.pendingDamageMultiplier = 1;
          this.gameState.playerDamagedLastTurn = false;

          // Réinitialiser les utilisation des cartes bonus
          if (this.gameState.activeBonusCards) {
            this.gameState.activeBonusCards.forEach((card) => {
              if (card.effect === 'active' && card.uses) {
                card.usesRemaining = card.uses;
              }
            });
          }

          // Journal de combat
          if (!this.gameState.combatLog) {
            this.gameState.combatLog = [];
          }
          this.gameState.combatLog = [];
          this.gameState.combatLog.push(
            `Début du combat contre ${this.gameState.enemy.name}!`
          );
          break;

        case GAME_PHASES.SHOP:
          // Initialiser la boutique si nécessaire
          if (
            this.gameState.progressionSystem &&
            (!this.gameState.shopItems || this.gameState.shopItems.length === 0)
          ) {
            this.gameState.progressionSystem.initShop();
          }
          break;

        case GAME_PHASES.REST:
          // Rien de spécial pour le moment
          break;

        case GAME_PHASES.EVENT:
          // Générer un événement si nécessaire
          if (!this.gameState.currentEvent && options.generateEvent) {
            // Logique pour générer un événement aléatoire
            const { generateRandomEvent } = require('./event-system.js');
            this.gameState.currentEvent = generateRandomEvent(
              this.gameState.stage,
              this.gameState
            );
          }
          break;

        case GAME_PHASES.REWARD:
          // Traiter les récompenses de combat
          if (this.gameState.combatSystem) {
            this.gameState.combatSystem.processCombatRewards();
          }
          break;

        case GAME_PHASES.GAME_OVER:
          // Actions de fin de partie
          if (this.gameState.setActionFeedback) {
            this.gameState.setActionFeedback(
              'Game Over! Votre aventure est terminée.',
              'error',
              3000
            );
          }
          break;
      }

      return true;
    } catch (error) {
      console.error(`Erreur lors de l'entrée dans la phase ${phase}:`, error);
      return false;
    }
  }

  /**
   * Exécute les actions associées à la sélection d'un nœud sur la carte
   * @param {string} nodeId - ID du nœud sélectionné
   * @returns {boolean} - true si les actions ont réussi, false sinon
   */
  handleNodeSelection(nodeId) {
    if (!this.gameState || !this.gameState.path) {
      console.error('GameState ou chemin non initialisé');
      return false;
    }

    // Trouver le nœud sélectionné
    const selectedNode = this.gameState.path.find((node) => node.id === nodeId);
    if (!selectedNode) {
      console.error(`Nœud avec ID ${nodeId} non trouvé`);
      return false;
    }

    // Vérifier si le nœud est accessible
    const isAccessible = this._isNodeAccessible(nodeId);
    if (!isAccessible) {
      console.warn(`Nœud ${nodeId} inaccessible depuis la position actuelle`);
      if (this.gameState.setActionFeedback) {
        this.gameState.setActionFeedback(
          "Ce lieu n'est pas accessible depuis votre position actuelle",
          'warning'
        );
      }
      return false;
    }

    // Mettre à jour le nœud courant
    this.gameState.currentNodeId = nodeId;

    // Déterminer l'action en fonction du type de nœud
    switch (selectedNode.type) {
      case 'combat':
        this.changeGamePhase(GAME_PHASES.COMBAT, {
          isElite: false,
          isBoss: false,
        });
        break;

      case 'elite':
        this.changeGamePhase(GAME_PHASES.COMBAT, {
          isElite: true,
          isBoss: false,
        });
        break;

      case 'boss':
        this.changeGamePhase(GAME_PHASES.COMBAT, {
          isElite: false,
          isBoss: true,
        });
        break;

      case 'event':
        this.changeGamePhase(GAME_PHASES.EVENT, { generateEvent: true });
        break;

      case 'shop':
        this.changeGamePhase(GAME_PHASES.SHOP);
        break;

      case 'rest':
        this.changeGamePhase(GAME_PHASES.REST);
        break;

      default:
        console.log(
          `Nœud de type ${selectedNode.type} sélectionné, restant en exploration`
        );
        break;
    }

    return true;
  }

  /**
   * Vérifie si un nœud est accessible depuis la position actuelle
   * @param {string} nodeId - ID du nœud à vérifier
   * @returns {boolean} - true si le nœud est accessible, false sinon
   * @private
   */
  _isNodeAccessible(nodeId) {
    // Si aucun nœud n'est sélectionné (début de jeu), seul le nœud de départ est accessible
    if (!this.gameState.currentNodeId) {
      const startNode = this.gameState.path.find(
        (node) => node.type === 'start'
      );
      return startNode && startNode.id === nodeId;
    }

    // Trouver le nœud actuel
    const currentNode = this.gameState.path.find(
      (node) => node.id === this.gameState.currentNodeId
    );

    // Un nœud est accessible s'il est un enfant du nœud actuel
    return (
      currentNode &&
      currentNode.childIds &&
      currentNode.childIds.includes(nodeId)
    );
  }
}

/**
 * Crée et retourne une instance de GamePhaseManager pour le gameState fourni
 * @param {Object} gameState - L'état du jeu
 * @returns {GamePhaseManager} - Un gestionnaire de phases de jeu
 */
export function createGamePhaseManager(gameState) {
  return new GamePhaseManager(gameState);
}
