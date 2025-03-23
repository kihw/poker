// src/modules/combat-system-factory.js
/**
 * Version refactorisée du système de combat qui évite les références circulaires
 * grâce au pattern d'inversion de dépendances
 *
 * Ce fichier remplace l'ancien modules/combat.js et utilise le module-resolver
 */

import { createDeck, shuffleDeck, drawCards } from '../core/deck.js';
import {
  evaluateHand,
  calculateDamage,
  findBestHand,
} from '../core/hand-evaluation.js';

/**
 * Factory de système de combat
 * Cette fonction est appelée par le module-resolver avec les dépendances injectées
 *
 * @param {Object} bonusCardSystem - Instance du système de cartes bonus
 * @returns {Object} - Le système de combat configuré
 */
export function createCombatSystem(bonusCardSystem) {
  // Référence à l'état du jeu - sera définie lors de l'initialisation
  let gameState = null;

  /**
   * Configure le système avec l'état du jeu
   * @param {Object} state - État global du jeu
   */
  function init(state) {
    gameState = state;

    // Initialiser avec un ennemi de départ si nécessaire
    if (!gameState.enemy || !gameState.enemy.health) {
      gameState.enemy = generateEnemy();
    }

    // Initialiser le deck
    if (!gameState.deck || gameState.deck.length === 0) {
      gameState.initializeDeck();
    }

    return combatSystem; // Pour le chaînage
  }

  /**
   * Démarre un combat et distribue automatiquement la première main
   * @param {Object} enemyOverride - Ennemi spécifique à utiliser (optionnel)
   * @returns {Object} L'ennemi créé
   */
  function startCombatAndDeal(enemyOverride = null) {
    // Vérifier que le système est initialisé
    if (!gameState) {
      throw new Error('Combat system not initialized');
    }

    // Crée l'ennemi et initialise le combat
    const enemy = startCombat(enemyOverride);

    // Distribue automatiquement la première main
    if (gameState.dealHand) {
      console.log('Distribution automatique de la première main');
      gameState.dealHand();
      gameState.turnPhase = 'select';
    }

    return enemy;
  }

  /**
   * Génère un ennemi avec une difficulté adaptée au niveau
   * @param {number} stage - Le niveau actuel du jeu
   * @param {boolean} isElite - Si vrai, génère un ennemi d'élite plus puissant
   * @param {boolean} isBoss - Si vrai, génère un boss encore plus puissant
   * @returns {Object} L'ennemi généré
   */
  function generateEnemy(stage = 1, isElite = false, isBoss = false) {
    // Scaling basé sur le niveau
    const healthMultiplier = 1 + stage * 0.1;
    const damageMultiplier = 1 + stage * 0.1;

    // Base enemies pool
    const baseEnemies = [
      {
        name: 'Goblin',
        health: Math.floor(40 * healthMultiplier),
        maxHealth: Math.floor(40 * healthMultiplier),
        attack: Math.floor(8 * damageMultiplier),
        image: '👺',
      },
      {
        name: 'Orc',
        health: Math.floor(50 * healthMultiplier),
        maxHealth: Math.floor(50 * healthMultiplier),
        attack: Math.floor(10 * damageMultiplier),
        image: '👹',
      },
      {
        name: 'Skeleton',
        health: Math.floor(35 * healthMultiplier),
        maxHealth: Math.floor(35 * healthMultiplier),
        attack: Math.floor(7 * damageMultiplier),
        image: '💀',
      },
    ];

    // Elite enemies pool
    const eliteEnemies = [
      {
        name: 'Dark Knight',
        health: Math.floor(80 * healthMultiplier),
        maxHealth: Math.floor(80 * healthMultiplier),
        attack: Math.floor(14 * damageMultiplier),
        image: '🧟',
        abilities: ['armor'],
      },
      {
        name: 'Troll Berserker',
        health: Math.floor(90 * healthMultiplier),
        maxHealth: Math.floor(90 * healthMultiplier),
        attack: Math.floor(16 * damageMultiplier),
        image: '👹',
        abilities: ['rage'],
      },
    ];

    // Boss enemies pool
    const bossEnemies = [
      {
        name: 'Dragon',
        health: Math.floor(150 * healthMultiplier),
        maxHealth: Math.floor(150 * healthMultiplier),
        attack: Math.floor(18 * damageMultiplier),
        image: '🐉',
        abilities: ['firebreath'],
      },
      {
        name: 'Demon Lord',
        health: Math.floor(180 * healthMultiplier),
        maxHealth: Math.floor(180 * healthMultiplier),
        attack: Math.floor(20 * damageMultiplier),
        image: '👿',
        abilities: ['darkmagic'],
      },
    ];

    // Sélectionner l'ennemi en fonction du type
    let enemyPool;
    if (isBoss) {
      enemyPool = bossEnemies;
    } else if (isElite) {
      enemyPool = eliteEnemies;
    } else {
      enemyPool = baseEnemies;
    }

    // Sélectionner un ennemi aléatoire de la piscine
    const randomIndex = Math.floor(Math.random() * enemyPool.length);
    return enemyPool[randomIndex];
  }
  /**
   * Démarre un nouveau combat
   * @param {Object} enemyOverride - Ennemi personnalisé (optionnel)
   * @returns {Object} L'ennemi du combat
   */
  function startCombat(enemyOverride = null) {
    if (!gameState) {
      throw new Error('Combat system not initialized');
    }

    // Create enemy if not provided
    const enemy = enemyOverride || generateEnemy();
    gameState.enemy = enemy;

    // Reset combat-related state
    gameState.gamePhase = 'combat';
    gameState.turnPhase = 'select'; // Directement en phase select
    gameState.heldCards = [];
    gameState.bestHandCards = [];
    gameState.handResult = null;
    gameState.discardUsed = false;
    gameState.playerDamagedLastTurn = false;
    gameState.invulnerableNextTurn = false;
    gameState.pendingDamageBonus = 0;
    gameState.pendingDamageMultiplier = 1;

    // Reset uses for active bonus cards
    if (
      bonusCardSystem &&
      typeof bonusCardSystem.resetActiveCardsUses === 'function'
    ) {
      bonusCardSystem.resetActiveCardsUses();
    } else if (gameState.activeBonusCards) {
      gameState.activeBonusCards.forEach((card) => {
        if (card.effect === 'active' && card.uses) {
          card.usesRemaining = card.uses;
        }
      });
    }

    // Initialize combat log
    gameState.combatLog = [`Combat début! Vous affrontez un ${enemy.name}.`];

    // Distribuons IMMÉDIATEMENT les cartes au début du combat
    if (typeof gameState.dealHand === 'function') {
      gameState.dealHand();
      console.log('Cartes distribuées automatiquement via dealHand');
    }
    // Soit en implémentant la logique directement ici
    else if (gameState.initializeDeck && gameState.deck) {
      // S'assurer que le deck est initialisé
      if (gameState.deck.length === 0) {
        gameState.initializeDeck();
      }

      // Tirer 7 cartes
      if (gameState.deck.length >= 7) {
        gameState.hand = gameState.deck.slice(0, 7);
        gameState.deck = gameState.deck.slice(7);

        // S'assurer que isSelected est false pour toutes les cartes
        gameState.hand.forEach((card) => {
          card.isSelected = false;
        });

        console.log('Cartes distribuées automatiquement via logique directe');
      } else {
        console.error(
          'Pas assez de cartes dans le deck pour distribuer la main'
        );
      }
    }

    return enemy;
  }

  /**
   * Action de l'ennemi (attaque du joueur)
   */
  function enemyAction() {
    if (!gameState || !gameState.enemy || gameState.enemy.health <= 0) return;

    // Check for invulnerability first
    if (gameState.invulnerableNextTurn) {
      gameState.combatLog.unshift(
        `Vous êtes invulnérable à l'attaque de ${gameState.enemy.name}.`
      );
      gameState.invulnerableNextTurn = false;
      gameState.playerDamagedLastTurn = false;
      return;
    }

    // Calculate base enemy damage
    let enemyDamage = gameState.enemy.attack;

    // Apply damage reduction
    const { damage: reducedDamage, reductionEffects } =
      applyDamageReduction(enemyDamage);

    // Apply damage to player
    if (reducedDamage > 0) {
      gameState.player.health = Math.max(
        0,
        gameState.player.health - reducedDamage
      );
      gameState.playerDamagedLastTurn = true;
    } else {
      gameState.playerDamagedLastTurn = false;
    }

    // Combat log
    let logEntry = `${gameState.enemy.name} attaque et inflige ${enemyDamage} dégâts`;
    if (reductionEffects.length > 0) {
      logEntry += `. ${reductionEffects.join('. ')}`;
    }
    if (reducedDamage !== enemyDamage) {
      logEntry += `. Vous ne subissez que ${reducedDamage} dégâts`;
    }
    gameState.combatLog.unshift(logEntry);
  }

  /**
   * Réduit les dégâts entrants selon les mécanismes de protection du joueur
   * @param {number} incomingDamage - Dégâts bruts de l'ennemi
   * @returns {Object} Informations sur la réduction des dégâts
   */
  function applyDamageReduction(incomingDamage) {
    let reducedDamage = incomingDamage;
    let reductionEffects = [];

    // Apply shield first
    if (gameState.player.shield && gameState.player.shield > 0) {
      const absorbedDamage = Math.min(gameState.player.shield, reducedDamage);
      reducedDamage -= absorbedDamage;
      gameState.player.shield -= absorbedDamage;

      if (absorbedDamage > 0) {
        reductionEffects.push(
          `Votre bouclier absorbe ${absorbedDamage} dégâts`
        );
      }

      if (gameState.player.shield <= 0) {
        gameState.player.shield = 0;
      }
    }

    // Apply damage reduction from bonus cards
    if (gameState.activeBonusCards) {
      for (const bonusCard of gameState.activeBonusCards) {
        if (
          bonusCard.effect === 'passive' &&
          bonusCard.condition === 'always' &&
          bonusCard.bonus?.type === 'damageReduction'
        ) {
          const reduction = Math.min(reducedDamage, bonusCard.bonus.value);
          if (reduction > 0) {
            reducedDamage -= reduction;
            reductionEffects.push(
              `${bonusCard.name} a réduit les dégâts de ${reduction}`
            );
          }
        }
      }
    }

    return {
      damage: reducedDamage,
      reductionEffects,
    };
  }

  /**
   * Vérifie si le combat est terminé (victoire ou défaite)
   * @returns {boolean|null} true pour victoire, false pour défaite, null si le combat continue
   */
  function checkCombatEnd() {
    if (!gameState) {
      throw new Error('Combat system not initialized');
    }

    if (gameState.player.health <= 0) {
      gameState.combatLog.unshift('Game Over! Vous avez été vaincu.');
      gameState.gamePhase = 'gameOver';
      return false;
    } else if (gameState.enemy && gameState.enemy.health <= 0) {
      gameState.combatLog.unshift(`Vous avez vaincu ${gameState.enemy.name}!`);
      gameState.gamePhase = 'reward';
      processCombatRewards();
      return true;
    }
    return null;
  }

  /**
   * Calcule et attribue les récompenses pour une victoire en combat
   * @returns {Object} Informations sur les récompenses obtenues
   */
  function processCombatRewards() {
    // Base gold based on difficulty and stage
    const goldBase = 10 + gameState.stage * 5;
    const xpBase = 5 + gameState.stage * 2;

    // Adjust based on enemy type
    let goldMultiplier = 1.0;
    let xpMultiplier = 1.0;

    if (gameState.enemy.abilities) {
      // Elite or boss enemies give better rewards
      if (gameState.enemy.abilities.includes('doublestrike')) {
        goldMultiplier = 1.5;
        xpMultiplier = 1.5;
      }
      if (gameState.enemy.abilities.includes('firebreath')) {
        goldMultiplier = 2.0;
        xpMultiplier = 2.0;
      }
    }

    // Calculate final rewards
    const goldReward = Math.floor(goldBase * goldMultiplier);
    const xpReward = Math.floor(xpBase * xpMultiplier);

    // Add to player stats
    gameState.player.gold += goldReward;
    gameState.player.experience += xpReward;

    // Add to combat log
    gameState.combatLog.unshift(
      `Vous gagnez ${goldReward} or et ${xpReward} XP.`
    );

    // Check for a random bonus card reward (approximately 30% chance)
    if (Math.random() < 0.3 && bonusCardSystem) {
      // Utiliser la méthode du système de cartes bonus si elle est disponible
      if (typeof bonusCardSystem.generateBonusCardReward === 'function') {
        const cardId = bonusCardSystem.generateBonusCardReward();
        if (cardId) {
          bonusCardSystem.addBonusCardToCollection(cardId);

          // Rechercher les informations de la carte pour le journal
          let cardName = 'nouvelle carte bonus';
          if (bonusCardSystem.allBonusCards) {
            const card = bonusCardSystem.allBonusCards.find(
              (card) => card.id === cardId
            );
            if (card) cardName = card.name;
          }

          gameState.combatLog.unshift(
            `Vous avez trouvé une carte bonus: ${cardName}!`
          );
        }
      }
    }

    // Check for level up
    checkLevelUp();

    return {
      gold: goldReward,
      xp: xpReward,
    };
  }

  /**
   * Vérifie et applique les montées de niveau du joueur
   * @returns {number} Nombre de niveaux gagnés
   */
  function checkLevelUp() {
    // Nombre maximum de niveaux pour éviter les boucles infinies
    const MAX_LEVELS = 100;
    let levelsGained = 0;

    // Utiliser une boucle while au lieu de la récursion
    while (levelsGained < MAX_LEVELS && gameState.player.level < MAX_LEVELS) {
      const currentLevel = gameState.player.level;
      const nextLevel = currentLevel + 1;
      const xpForNextLevel = nextLevel * 100; // Formule simple: niveau * 100

      // Vérifier si le joueur a assez d'XP pour monter de niveau
      if (gameState.player.experience >= xpForNextLevel) {
        // Montée de niveau
        gameState.player.level = nextLevel;
        gameState.player.experience -= xpForNextLevel;
        levelsGained++;

        // Augmentation des stats
        gameState.player.maxHealth += 10;
        gameState.player.health += 10;

        // Bonus d'emplacement de carte tous les 3 niveaux
        if (nextLevel % 3 === 0) {
          gameState.maxBonusCardSlots += 1;
        }

        // Ajouter au journal de combat
        if (gameState.combatLog) {
          gameState.combatLog.unshift(
            `Niveau supérieur! Vous êtes maintenant niveau ${nextLevel}.`
          );
        }

        // Feedback visuel
        if (gameState.setActionFeedback) {
          gameState.setActionFeedback(
            `Niveau supérieur! Vous êtes maintenant niveau ${nextLevel}.`,
            'success',
            3000
          );
        }
      } else {
        // Pas assez d'XP pour un autre niveau, sortir de la boucle
        break;
      }
    }

    // Si des niveaux ont été gagnés, logger le résultat
    if (levelsGained > 0) {
      console.log(`Le joueur a gagné ${levelsGained} niveau(x)!`);
    }

    return levelsGained;
  }

  /**
   * Passe à l'étape suivante du jeu après un combat
   * @returns {boolean} true si la transition a réussi, false sinon
   */
  function nextStage() {
    console.log('nextStage appelé, phase actuelle:', gameState.gamePhase);

    if (gameState.gamePhase !== 'reward') return false;

    // Forcer le passage à l'exploration
    gameState.gamePhase = 'exploration';
    console.log("Phase changée à 'exploration' depuis 'reward'");

    // Augmenter l'étage
    gameState.stage++;

    // Message de journal pour déboguer
    if (gameState.combatLog) {
      gameState.combatLog.unshift(`Combat terminé ! Retour à l'exploration.`);
    }

    return true;
  }

  // Exposer l'API publique du système de combat
  const combatSystem = {
    init,
    startCombat,
    startCombatAndDeal,
    generateEnemy,
    enemyAction,
    checkCombatEnd,
    processCombatRewards,
    nextStage,

    // Méthodes utilitaires
    getGameState: () => gameState,
  };

  return combatSystem;
}

// Exporter la factory pour utilisation avec le module-resolver
export default createCombatSystem;
