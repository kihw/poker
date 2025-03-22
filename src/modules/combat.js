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
    this.gameState.turnPhase = 'draw';
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

    return enemy;
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

  // Check and process level up - VERSION CORRIGÉE
  checkLevelUp() {
    // Simple level up logic - 100 XP per level
    const currentLevel = this.gameState.player.level;
    const nextLevel = currentLevel + 1;
    const xpForNextLevel = nextLevel * 100;

    if (this.gameState.player.experience >= xpForNextLevel) {
      // Level up!
      this.gameState.player.level = nextLevel;
      this.gameState.player.experience -= xpForNextLevel;

      // Stat boosts
      this.gameState.player.maxHealth += 10;
      this.gameState.player.health += 10;

      // Bonus card slot on some levels
      if (nextLevel % 3 === 0) {
        this.gameState.maxBonusCardSlots += 1;
      }

      // Add to combat log
      this.gameState.combatLog.unshift(
        `Niveau supérieur! Vous êtes maintenant niveau ${nextLevel}.`
      );

      // Check for another level up (multiple can happen at once)
      // Limit recursion depth to avoid infinite loops
      if (this.gameState.player.level < 100) {
        // Safety check
        this.checkLevelUp();
      }
    }
  }

  // Progress to the next stage
  nextStage() {
    if (this.gameState.gamePhase !== 'reward') return;

    // Progress to next stage
    this.gameState.stage++;

    // Decide if next screen will be a shop
    const goToShop = Math.random() < 0.3;

    if (goToShop) {
      // Initialize shop
      this.gameState.gamePhase = 'shop';
      this.gameState.combatLog.unshift(
        `Vous avez trouvé un marchand itinérant.`
      );
    } else {
      // Create a new enemy with increasing difficulty
      this.gameState.enemy = this.generateEnemy(
        false,
        this.gameState.stage % 5 === 0 // Boss every 5 levels
      );

      // Reset for next combat
      this.gameState.gamePhase = 'combat';
      this.gameState.turnPhase = 'draw';
      this.gameState.combatLog = [
        `Niveau ${this.gameState.stage}: Vous rencontrez un ${this.gameState.enemy.name}!`,
      ];

      // Heal player slightly between stages
      const healAmount = Math.floor(this.gameState.player.maxHealth * 0.2);
      this.gameState.player.health = Math.min(
        this.gameState.player.maxHealth,
        this.gameState.player.health + healAmount
      );
      this.gameState.combatLog.unshift(`Vous avez récupéré ${healAmount} PV.`);
    }
  }
}
