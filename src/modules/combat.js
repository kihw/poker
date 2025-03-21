// src/modules/combat.js
import { getRandomEnemyName, getRandomEnemyImage } from '../utils/random.js';

export class CombatSystem {
  constructor(gameState) {
    this.gameState = gameState;

    // Initialiser avec un ennemi de départ
    if (!this.gameState.enemy || !this.gameState.enemy.health) {
      this.gameState.enemy = this.generateEnemy();
    }

    // Initialiser le deck
    if (!this.gameState.deck || this.gameState.deck.length === 0) {
      this.gameState.initializeDeck();
    }
  }

  /**
   * Démarre un combat et distribue automatiquement la première main
   * @param {Object} enemyOverride - Ennemi spécifique à utiliser (optionnel)
   * @returns {Object} L'ennemi créé
   */
  startCombatAndDeal(enemyOverride = null) {
    // Crée l'ennemi et initialise le combat
    const enemy = this.startCombat(enemyOverride);

    // Distribue automatiquement la première main
    if (this.gameState.dealHand) {
      console.log('Distribution automatique de la première main');
      this.gameState.dealHand();
      this.gameState.turnPhase = 'select';
    }

    return enemy;
  }
  /**
   * Cette fonction doit être appelée après chaque attaque pour s'assurer que
   * les cartes jouées sont correctement marquées avant la prochaine distribution
   */
  prepareCombatTransition() {
    if (!this.gameState) return;

    console.log('Préparation de la transition de combat');

    // S'assurer que les cartes sélectionnées pour l'attaque sont correctement marquées
    // avant la distribution de la prochaine main
    if (
      this.gameState.hand &&
      Array.isArray(this.gameState.hand) &&
      this.gameState.selectedCards &&
      Array.isArray(this.gameState.selectedCards)
    ) {
      console.log(
        'Cartes sélectionnées avant transition:',
        this.gameState.selectedCards
      );

      // Vérifier que les propriétés isSelected des cartes correspondent à selectedCards
      this.gameState.hand.forEach((card, index) => {
        const isSelected = this.gameState.selectedCards.includes(index);

        // Mettre à jour seulement si nécessaire pour éviter des rendus inutiles
        if (card.isSelected !== isSelected) {
          card.isSelected = isSelected;
          console.log(
            `Mise à jour de isSelected pour carte ${index}: ${isSelected}`
          );
        }
      });
    }
  }
  // Generate an enemy with scaling difficulty
  generateEnemy(isElite = false, isBoss = false) {
    const baseEnemies = [
      { name: 'Goblin', health: 40, attack: 8, image: '👺' },
      { name: 'Orc', health: 50, attack: 10, image: '👹' },
      { name: 'Skeleton', health: 35, attack: 7, image: '💀' },
    ];

    const eliteEnemies = [
      {
        name: 'Dark Knight',
        health: 80,
        attack: 14,
        image: '🧟',
        abilities: ['armor', 'doublestrike'],
      },
    ];

    const bossEnemies = [
      {
        name: 'Dragon',
        health: 150,
        attack: 18,
        image: '🐉',
        abilities: ['firebreath', 'tailswipe'],
      },
    ];

    let enemyPool, baseMultiplier;

    if (isBoss) {
      enemyPool = bossEnemies;
      baseMultiplier = 1 + this.gameState.stage * 0.3;
    } else if (isElite) {
      enemyPool = eliteEnemies;
      baseMultiplier = 1 + this.gameState.stage * 0.2;
    } else {
      enemyPool = baseEnemies;
      baseMultiplier = 1 + this.gameState.stage * 0.1;
    }

    // Select a random enemy
    const selectedEnemy = {
      ...enemyPool[Math.floor(Math.random() * enemyPool.length)],
    };

    // Adjust stats based on stage
    selectedEnemy.health = Math.floor(selectedEnemy.health * baseMultiplier);
    selectedEnemy.maxHealth = selectedEnemy.health;
    selectedEnemy.attack = Math.floor(selectedEnemy.attack * baseMultiplier);

    return selectedEnemy;
  }

  // Start a new combat
  startCombat(enemyOverride = null) {
    // Create enemy if not provided
    const enemy = enemyOverride || this.generateEnemy();
    this.gameState.enemy = enemy;

    // Reset combat-related state
    this.gameState.gamePhase = 'combat';
    this.gameState.turnPhase = 'select'; // Directement en phase select
    this.gameState.heldCards = [];
    this.gameState.bestHandCards = [];
    this.gameState.handResult = null;
    this.gameState.discardUsed = false;
    this.gameState.playerDamagedLastTurn = false;
    this.gameState.invulnerableNextTurn = false;
    this.gameState.pendingDamageBonus = 0;
    this.gameState.pendingDamageMultiplier = 1;

    // Reset uses for active bonus cards
    this.gameState.activeBonusCards.forEach((card) => {
      if (card.effect === 'active' && card.uses) {
        card.usesRemaining = card.uses;
      }
    });

    // Initialize combat log
    this.gameState.combatLog = [
      `Combat début! Vous affrontez un ${enemy.name}.`,
    ];

    // Distribuons IMMÉDIATEMENT les cartes au début du combat
    // Soit en utilisant la méthode existante
    if (typeof this.gameState.dealHand === 'function') {
      this.gameState.dealHand();
      console.log('Cartes distribuées automatiquement via dealHand');
    }
    // Soit en implémentant la logique directement ici
    else if (this.gameState.initializeDeck && this.gameState.deck) {
      // S'assurer que le deck est initialisé
      if (this.gameState.deck.length === 0) {
        this.gameState.initializeDeck();
      }

      // Tirer 7 cartes
      if (this.gameState.deck.length >= 7) {
        this.gameState.hand = this.gameState.deck.slice(0, 7);
        this.gameState.deck = this.gameState.deck.slice(7);

        // S'assurer que isSelected est false pour toutes les cartes
        this.gameState.hand.forEach((card) => {
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
   * Vérifie et applique les gains de niveau du joueur
   * Cette version utilise une boucle while au lieu de la récursion
   * pour éviter les risques de débordement de pile
   */
  checkLevelUp() {
    if (!this.gameState || !this.gameState.player) {
      console.error('État du jeu ou joueur non défini');
      return;
    }

    // Nombre maximum de niveaux pour éviter les boucles infinies
    const MAX_LEVELS = 100;
    let levelsGained = 0;

    // Utiliser une boucle while au lieu de la récursion
    while (
      levelsGained < MAX_LEVELS &&
      this.gameState.player.level < MAX_LEVELS
    ) {
      const currentLevel = this.gameState.player.level;
      const nextLevel = currentLevel + 1;
      const xpForNextLevel = nextLevel * 100; // Formule simple: niveau * 100

      // Vérifier si le joueur a assez d'XP pour monter de niveau
      if (this.gameState.player.experience >= xpForNextLevel) {
        // Montée de niveau
        this.gameState.player.level = nextLevel;
        this.gameState.player.experience -= xpForNextLevel;
        levelsGained++;

        // Augmentation des stats
        this.gameState.player.maxHealth += 10;
        this.gameState.player.health += 10;

        // Bonus d'emplacement de carte tous les 3 niveaux
        if (nextLevel % 3 === 0) {
          this.gameState.maxBonusCardSlots += 1;
        }

        // Ajouter au journal de combat
        if (this.gameState.combatLog) {
          this.gameState.combatLog.unshift(
            `Niveau supérieur! Vous êtes maintenant niveau ${nextLevel}.`
          );
        }

        // Feedback visuel si disponible
        if (this.gameState.setActionFeedback) {
          this.gameState.setActionFeedback(
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

  // Enemy's turn
  enemyAction() {
    if (!this.gameState.enemy || this.gameState.enemy.health <= 0) return;

    // Check for invulnerability first
    if (this.gameState.invulnerableNextTurn) {
      this.gameState.combatLog.unshift(
        `Vous êtes invulnérable à l'attaque de ${this.gameState.enemy.name}.`
      );
      this.gameState.invulnerableNextTurn = false;
      this.gameState.playerDamagedLastTurn = false;
      return;
    }

    // Calculate base enemy damage
    let enemyDamage = this.gameState.enemy.attack;

    // Apply damage reduction
    const { damage: reducedDamage, reductionEffects } =
      this.applyDamageReduction(enemyDamage);

    // Apply damage to player
    if (reducedDamage > 0) {
      this.gameState.player.health = Math.max(
        0,
        this.gameState.player.health - reducedDamage
      );
      this.gameState.playerDamagedLastTurn = true;
    } else {
      this.gameState.playerDamagedLastTurn = false;
    }

    // Combat log
    let logEntry = `${this.gameState.enemy.name} attaque et inflige ${enemyDamage} dégâts`;
    if (reductionEffects.length > 0) {
      logEntry += `. ${reductionEffects.join('. ')}`;
    }
    if (reducedDamage !== enemyDamage) {
      logEntry += `. Vous ne subissez que ${reducedDamage} dégâts`;
    }
    this.gameState.combatLog.unshift(logEntry);
  }

  // Damage reduction logic
  applyDamageReduction(incomingDamage) {
    let reducedDamage = incomingDamage;
    let reductionEffects = [];

    // Apply shield first
    if (this.gameState.player.shield && this.gameState.player.shield > 0) {
      const absorbedDamage = Math.min(
        this.gameState.player.shield,
        reducedDamage
      );
      reducedDamage -= absorbedDamage;
      this.gameState.player.shield -= absorbedDamage;

      if (absorbedDamage > 0) {
        reductionEffects.push(
          `Votre bouclier absorbe ${absorbedDamage} dégâts`
        );
      }

      if (this.gameState.player.shield <= 0) {
        this.gameState.player.shield = 0;
      }
    }

    // Apply damage reduction from bonus cards
    for (const bonusCard of this.gameState.activeBonusCards) {
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

    return {
      damage: reducedDamage,
      reductionEffects,
    };
  }

  // Check if combat has ended
  checkCombatEnd() {
    if (this.gameState.player.health <= 0) {
      this.gameState.combatLog.unshift('Game Over! Vous avez été vaincu.');
      this.gameState.gamePhase = 'gameOver';
      return false;
    } else if (this.gameState.enemy && this.gameState.enemy.health <= 0) {
      this.gameState.combatLog.unshift(
        `Vous avez vaincu ${this.gameState.enemy.name}!`
      );
      this.gameState.gamePhase = 'reward';
      this.processCombatRewards();
      return true;
    }
    return null;
  }

  // Calculate and grant rewards for winning combat
  processCombatRewards() {
    // Base gold based on difficulty and stage
    const goldBase = 10 + this.gameState.stage * 5;
    const xpBase = 5 + this.gameState.stage * 2;

    // Adjust based on enemy type
    let goldMultiplier = 1.0;
    let xpMultiplier = 1.0;

    if (this.gameState.enemy.abilities) {
      // Elite or boss enemies give better rewards
      if (this.gameState.enemy.abilities.includes('doublestrike')) {
        goldMultiplier = 1.5;
        xpMultiplier = 1.5;
      }
      if (this.gameState.enemy.abilities.includes('firebreath')) {
        goldMultiplier = 2.0;
        xpMultiplier = 2.0;
      }
    }

    // Calculate final rewards
    const goldReward = Math.floor(goldBase * goldMultiplier);
    const xpReward = Math.floor(xpBase * xpMultiplier);

    // Add to player stats
    this.gameState.player.gold += goldReward;
    this.gameState.player.experience += xpReward;

    // Add to combat log
    this.gameState.combatLog.unshift(
      `Vous gagnez ${goldReward} or et ${xpReward} XP.`
    );

    // Check for a random bonus card reward (approximately 30% chance)
    if (Math.random() < 0.3) {
      const cardId = this.gameState.bonusCardSystem.generateBonusCardReward();
      if (cardId) {
        this.gameState.bonusCardSystem.addBonusCardToCollection(cardId);
        const card = this.gameState.bonusCardSystem.allBonusCards.find(
          (card) => card.id === cardId
        );
        this.gameState.combatLog.unshift(
          `Vous avez trouvé une carte bonus: ${card.name}!`
        );
      }
    }

    // Check for level up
    this.checkLevelUp();

    return {
      gold: goldReward,
      xp: xpReward,
    };
  }

  // Progress to the next stage
  nextStage() {
    if (this.gameState.gamePhase !== 'reward') return;

    // Ne pas générer automatiquement un nouvel ennemi ou shop
    // Simplement revenir au mode exploration pour permettre la sélection via la carte
    this.gameState.gamePhase = 'exploration';

    // Pour le debug
    console.log("Combat terminé, retour à l'exploration (carte)");

    if (this.gameState.combatLog) {
      this.gameState.combatLog.unshift(`Combat terminé! Retour à la carte.`);
    }

    // Augmenter l'étage si nécessaire
    this.gameState.stage++;

    // Soins légers entre les étages (conserver cette fonctionnalité)
    const healAmount = Math.floor(this.gameState.player.maxHealth * 0.2);
    this.gameState.player.health = Math.min(
      this.gameState.player.maxHealth,
      this.gameState.player.health + healAmount
    );

    // Message de journal
    if (this.gameState.combatLog) {
      this.gameState.combatLog.unshift(`Vous avez récupéré ${healAmount} PV.`);
    }
  }
}
