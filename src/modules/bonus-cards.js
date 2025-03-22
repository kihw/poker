// src/modules/bonus-cards.js
import { ALL_BONUS_CARDS } from '../data/bonus-cards.js';
import { CARD_RARITIES } from '../data/bonus-cards.js';
import { HAND_TYPES } from '../core/hand-evaluation.js';

export class BonusCardSystem {
  constructor(gameState) {
    this.gameState = gameState;
    this.allBonusCards = ALL_BONUS_CARDS;

    // Attacher le système de cartes bonus à l'état du jeu
    this.gameState.bonusCardSystem = this;
  }

  // Initialize bonus card collection for a new game
  initBonusCardCollection() {
    // Starting bonus cards - can be customized later
    const startingCardIds = [1, 2, 10, 14, 18];

<<<<<<< HEAD
    this.gameState.bonusCardCollection = startingCardIds
      .map((id) => {
        const card = this.allBonusCards.find((card) => card.id === id);
        return card ? { ...card, owned: true, level: 1 } : null;
      })
      .filter((card) => card !== null);

    // Initially equip first 3 cards
    this.gameState.activeBonusCards = this.gameState.bonusCardCollection
      .slice(0, Math.min(3, this.gameState.maxBonusCardSlots))
=======
    this.gameState.bonusCardCollection = startingCardIds.map((id) => {
      const card = this.allBonusCards.find((card) => card.id === id);
      return { ...card, owned: true };
    });

    // Initially equip first 3 cards
    this.gameState.activeBonusCards = this.gameState.bonusCardCollection
      .slice(0, 3)
>>>>>>> 0057e418c4c4321fe4644761f151a2c134a2087c
      .map((card) => ({ ...card, usesRemaining: card.uses || 0 }));
  }

  // Get owned bonus cards
  getOwnedBonusCards() {
    return this.gameState.bonusCardCollection.filter((card) => card.owned);
  }

  // Add a bonus card to the collection
  addBonusCardToCollection(cardId) {
<<<<<<< HEAD
    // Check if the card exists
    const newCardTemplate = this.allBonusCards.find(
      (card) => card.id === cardId
    );
    if (!newCardTemplate) {
      console.error(`Card with ID ${cardId} not found in allBonusCards`);
      return false;
    }

=======
>>>>>>> 0057e418c4c4321fe4644761f151a2c134a2087c
    const cardIndex = this.gameState.bonusCardCollection.findIndex(
      (card) => card.id === cardId
    );

    if (cardIndex === -1) {
      // If the card is not in the collection, add it
<<<<<<< HEAD
      const newCard = { ...newCardTemplate, owned: true, level: 1 };
      this.gameState.bonusCardCollection.push(newCard);

      if (this.gameState.combatLog) {
        this.gameState.combatLog.unshift(
          `Nouvelle carte bonus obtenue: ${newCard.name}!`
        );
      }

      // Feedback visuel
      if (this.gameState.setActionFeedback) {
        this.gameState.setActionFeedback(
          `Nouvelle carte obtenue: ${newCard.name}!`,
          'success',
          3000
        );
      }

      return true;
    } else if (!this.gameState.bonusCardCollection[cardIndex].owned) {
      // If the card exists but is not owned, mark it as owned
      this.gameState.bonusCardCollection[cardIndex].owned = true;

      if (this.gameState.combatLog) {
        this.gameState.combatLog.unshift(
          `Nouvelle carte bonus obtenue: ${this.gameState.bonusCardCollection[cardIndex].name}!`
        );
      }

      // Feedback visuel
      if (this.gameState.setActionFeedback) {
        this.gameState.setActionFeedback(
          `Nouvelle carte obtenue: ${this.gameState.bonusCardCollection[cardIndex].name}!`,
          'success',
          3000
        );
      }

=======
      const newCard = this.allBonusCards.find((card) => card.id === cardId);
      if (newCard) {
        this.gameState.bonusCardCollection.push({ ...newCard, owned: true });
        this.gameState.combatLog.unshift(
          `New bonus card obtained: ${newCard.name}!`
        );
        return true;
      }
    } else if (!this.gameState.bonusCardCollection[cardIndex].owned) {
      // If the card exists but is not owned, mark it as owned
      this.gameState.bonusCardCollection[cardIndex].owned = true;
      this.gameState.combatLog.unshift(
        `New bonus card obtained: ${this.gameState.bonusCardCollection[cardIndex].name}!`
      );
>>>>>>> 0057e418c4c4321fe4644761f151a2c134a2087c
      return true;
    }

    return false;
  }

<<<<<<< HEAD
  // Méthodes updatées de src/modules/bonus-cards.js

  // Méthode equipBonusCard corrigée
  equipBonusCard(cardId) {
    console.log('BonusCardSystem.equipBonusCard', cardId);

    // Check if the player owns this card
    const card = this.gameState.bonusCardCollection.find(
      (card) => card.id === cardId && card.owned !== false
    );

    if (!card) {
      console.error('Card not found or not owned:', cardId);
      return false;
    }

    // Check if the card is already equipped
    const isAlreadyEquipped = this.gameState.activeBonusCards.some(
      (activeCard) => activeCard.id === cardId
    );

    if (isAlreadyEquipped) {
      console.warn('Card is already equipped:', cardId);
=======
  // Equip a bonus card
  equipBonusCard(cardId) {
    // Check if the player owns this card
    const card = this.gameState.bonusCardCollection.find(
      (card) => card.id === cardId && card.owned
    );

    if (!card) {
>>>>>>> 0057e418c4c4321fe4644761f151a2c134a2087c
      return false;
    }

    // Check if there's space in the active bonus card slots
    if (
      this.gameState.activeBonusCards.length >= this.gameState.maxBonusCardSlots
    ) {
<<<<<<< HEAD
      console.warn('No space for more cards');
=======
>>>>>>> 0057e418c4c4321fe4644761f151a2c134a2087c
      return false;
    }

    // Add the card to active bonus cards
    this.gameState.activeBonusCards.push({
      ...card,
      usesRemaining: card.uses || 0,
    });
<<<<<<< HEAD

    console.log('Card equipped successfully', card.name);
    return true;
  }

  // Méthode unequipBonusCard corrigée
  unequipBonusCard(cardId) {
    console.log('BonusCardSystem.unequipBonusCard', cardId);

=======
    return true;
  }

  // Unequip a bonus card
  unequipBonusCard(cardId) {
>>>>>>> 0057e418c4c4321fe4644761f151a2c134a2087c
    const cardIndex = this.gameState.activeBonusCards.findIndex(
      (card) => card.id === cardId
    );

    if (cardIndex !== -1) {
<<<<<<< HEAD
      // Récupère la carte pour le log
      const removedCard = this.gameState.activeBonusCards[cardIndex];

      // Supprime la carte des cartes actives
      this.gameState.activeBonusCards.splice(cardIndex, 1);

      console.log('Card unequipped successfully', removedCard.name);
      return true;
    }

    console.warn('Card not found in active cards:', cardId);
=======
      this.gameState.activeBonusCards.splice(cardIndex, 1);
      return true;
    }
>>>>>>> 0057e418c4c4321fe4644761f151a2c134a2087c
    return false;
  }

  // Generate a bonus card reward after combat
  generateBonusCardReward() {
<<<<<<< HEAD
    const stage = this.gameState.stage || 1;
=======
    const stage = this.gameState.stage;
>>>>>>> 0057e418c4c4321fe4644761f151a2c134a2087c
    const stageMultiplier = Math.min(stage / 10, 1);

    // Determine card rarity based on stage progression
    const rarityRoll = Math.random();
    let rarity;

    if (rarityRoll < 0.6 - 0.2 * stageMultiplier) {
      rarity = CARD_RARITIES.COMMON;
    } else if (rarityRoll < 0.9 - 0.1 * stageMultiplier) {
      rarity = CARD_RARITIES.UNCOMMON;
    } else if (rarityRoll < 0.99 - 0.04 * stageMultiplier) {
      rarity = CARD_RARITIES.RARE;
    } else {
      rarity = CARD_RARITIES.EPIC;
    }

    // Filter cards of the selected rarity that the player doesn't own
    const possibleCards = this.allBonusCards.filter((card) => {
      const isOwned = this.gameState.bonusCardCollection.some(
        (playerCard) => playerCard.id === card.id && playerCard.owned
      );
      return card.rarity === rarity && !isOwned;
    });

<<<<<<< HEAD
    // If no unowned cards of this rarity, try a different rarity
    if (possibleCards.length === 0) {
      // Try all rarities in order of increasing rarity
      const allRarities = [
        CARD_RARITIES.COMMON,
        CARD_RARITIES.UNCOMMON,
        CARD_RARITIES.RARE,
        CARD_RARITIES.EPIC,
        CARD_RARITIES.LEGENDARY,
      ];

      for (const tryRarity of allRarities) {
        if (tryRarity === rarity) continue; // Skip the one we already tried

        const fallbackCards = this.allBonusCards.filter((card) => {
          const isOwned = this.gameState.bonusCardCollection.some(
            (playerCard) => playerCard.id === card.id && playerCard.owned
          );
          return card.rarity === tryRarity && !isOwned;
        });

        if (fallbackCards.length > 0) {
          // Select a random card
          const randomCard =
            fallbackCards[Math.floor(Math.random() * fallbackCards.length)];
          return randomCard.id;
        }
      }

      // If still no cards available, return null
=======
    // If no unowned cards of this rarity, return null
    if (possibleCards.length === 0) {
>>>>>>> 0057e418c4c4321fe4644761f151a2c134a2087c
      return null;
    }

    // Select a random card
    const randomCard =
      possibleCards[Math.floor(Math.random() * possibleCards.length)];
    return randomCard.id;
  }

<<<<<<< HEAD
  // Maps hand types to bonus card conditions
=======
  // Maps hand types to bonus card conditions - VERSION CORRIGÉE
>>>>>>> 0057e418c4c4321fe4644761f151a2c134a2087c
  mapHandTypeToCondition(handName) {
    const conditionMap = {
      // Noms anglais
      'Royal Flush': 'Royal Flush',
      'Straight Flush': 'Straight Flush',
      'Four of a Kind': 'Four of a Kind',
      'Full House': 'Full House',
      Flush: 'Flush',
      Straight: 'Straight',
      'Three of a Kind': 'Three of a Kind',
      'Two Pair': 'Two Pair',
      Pair: 'Pair',
      'High Card': 'High Card',
      // Traductions françaises qui pourraient être utilisées dans l'interface
      'Quinte Flush Royale': 'Royal Flush',
      'Quinte Flush': 'Straight Flush',
      Carré: 'Four of a Kind',
      Full: 'Full House',
      Couleur: 'Flush',
      Suite: 'Straight',
      Brelan: 'Three of a Kind',
      'Double Paire': 'Two Pair',
      Paire: 'Pair',
      'Carte Haute': 'High Card',
      // Cas spéciaux pour les attaques avec moins de 5 cartes
      '1 Carte': 'single',
      '2 Cartes': 'double',
      '3 Cartes': 'triple',
      '4 Cartes': 'quadruple',
    };

    return conditionMap[handName] || handName;
  }

  // Apply bonus card effects to a hand
  applyBonusCardEffects(handRank, handName) {
    let damage = Math.pow(2, handRank);
    let bonusEffects = [];

    // Map the hand name to the bonus card condition
    const condition = this.mapHandTypeToCondition(handName);

    // Apply effects from active bonus cards
    for (const bonusCard of this.gameState.activeBonusCards) {
      // Check for passive effects that apply to this hand or always
      if (
        bonusCard.effect === 'passive' &&
        (bonusCard.condition === condition || bonusCard.condition === 'always')
      ) {
        switch (bonusCard.bonus.type) {
          case 'damage':
            damage += bonusCard.bonus.value;
            bonusEffects.push(
              `${bonusCard.name} added ${bonusCard.bonus.value} damage`
            );
            break;
          case 'heal':
            const healAmount = Math.min(
              bonusCard.bonus.value,
              this.gameState.player.maxHealth - this.gameState.player.health
            );
            this.gameState.player.health += healAmount;
            bonusEffects.push(`${bonusCard.name} healed ${healAmount} HP`);
            break;
          case 'shield':
            this.gameState.player.shield =
              (this.gameState.player.shield || 0) + bonusCard.bonus.value;
            bonusEffects.push(
              `${bonusCard.name} gave ${bonusCard.bonus.value} shield`
            );
            break;
        }
      }

      // Check for passive effects that apply when player took damage last turn
      if (
        bonusCard.effect === 'passive' &&
        bonusCard.condition === 'damageTaken' &&
        this.gameState.playerDamagedLastTurn
      ) {
        if (bonusCard.bonus.type === 'damage') {
          damage += bonusCard.bonus.value;
          bonusEffects.push(
            `${bonusCard.name} added ${bonusCard.bonus.value} damage from last turn's damage`
          );
        }
      }

      // Check for low health effects
      if (
        bonusCard.effect === 'passive' &&
        bonusCard.condition === 'lowHealth' &&
        this.gameState.player.health <= this.gameState.player.maxHealth * 0.25
      ) {
        if (bonusCard.bonus.type === 'damageMultiplier') {
          const additionalDamage = Math.floor(
            damage * (bonusCard.bonus.value - 1)
          );
          damage = Math.floor(damage * bonusCard.bonus.value);
          bonusEffects.push(
            `${bonusCard.name} increased damage by ${additionalDamage} (low health bonus)`
          );
        }
      }
    }

<<<<<<< HEAD
    // Apply pending damage bonus if any
    if (this.gameState.pendingDamageBonus) {
      damage += this.gameState.pendingDamageBonus;
      bonusEffects.push(`Bonus damage: +${this.gameState.pendingDamageBonus}`);
      this.gameState.pendingDamageBonus = 0;
    }

    // Apply pending damage multiplier if any
    if (
      this.gameState.pendingDamageMultiplier &&
      this.gameState.pendingDamageMultiplier !== 1
    ) {
      const baseValue = damage;
      damage = Math.floor(damage * this.gameState.pendingDamageMultiplier);
      bonusEffects.push(
        `Damage multiplier: x${this.gameState.pendingDamageMultiplier} (${baseValue} → ${damage})`
      );
      this.gameState.pendingDamageMultiplier = 1;
    }

=======
>>>>>>> 0057e418c4c4321fe4644761f151a2c134a2087c
    return { damage, bonusEffects };
  }

  // Use an active bonus card
  useActiveBonus(index) {
    if (index < 0 || index >= this.gameState.activeBonusCards.length) {
      return {
        success: false,
<<<<<<< HEAD
        message: 'Carte bonus invalide',
=======
        message: 'Invalid bonus card index',
>>>>>>> 0057e418c4c4321fe4644761f151a2c134a2087c
      };
    }

    const bonusCard = this.gameState.activeBonusCards[index];

    // Check if the card is active and has uses left
<<<<<<< HEAD
    if (bonusCard.effect !== 'active') {
      return {
        success: false,
        message: 'Cette carte a un effet passif',
      };
    }

    if (bonusCard.usesRemaining <= 0) {
      return {
        success: false,
        message: 'Cette carte a déjà été utilisée',
=======
    if (bonusCard.effect !== 'active' || bonusCard.usesRemaining <= 0) {
      return {
        success: false,
        message: 'This bonus card cannot be used',
>>>>>>> 0057e418c4c4321fe4644761f151a2c134a2087c
      };
    }

    // Apply the effect based on the card type
    let result = {
      success: true,
<<<<<<< HEAD
      message: `${bonusCard.name} utilisée`,
=======
      message: `Used ${bonusCard.name}`,
>>>>>>> 0057e418c4c4321fe4644761f151a2c134a2087c
    };

    switch (bonusCard.bonus.type) {
      case 'damage':
        // Add damage to the current or next attack
        this.gameState.pendingDamageBonus =
          (this.gameState.pendingDamageBonus || 0) + bonusCard.bonus.value;
<<<<<<< HEAD
        result.message = `Ajouté ${bonusCard.bonus.value} dégâts à votre prochaine attaque`;
=======
        result.message = `Added ${bonusCard.bonus.value} damage to your next attack`;
>>>>>>> 0057e418c4c4321fe4644761f151a2c134a2087c
        break;

      case 'damageMultiplier':
        // Will multiply the damage of the next attack
        this.gameState.pendingDamageMultiplier = bonusCard.bonus.value;
<<<<<<< HEAD
        result.message = `Votre prochaine attaque infligera ${bonusCard.bonus.value}x dégâts`;
=======
        result.message = `Your next attack will deal ${bonusCard.bonus.value}x damage`;
>>>>>>> 0057e418c4c4321fe4644761f151a2c134a2087c
        break;

      case 'heal':
        // Healing effect
        const healAmount = Math.min(
          bonusCard.bonus.value,
          this.gameState.player.maxHealth - this.gameState.player.health
        );
        this.gameState.player.health += healAmount;
<<<<<<< HEAD
        result.message = `Récupéré ${healAmount} PV`;
=======
        result.message = `Recovered ${healAmount} HP`;
>>>>>>> 0057e418c4c4321fe4644761f151a2c134a2087c
        break;

      case 'discard':
        // Allow player to discard more cards
        this.gameState.discardLimit = bonusCard.bonus.value;
<<<<<<< HEAD
        result.message = `Vous pouvez maintenant défausser jusqu'à ${bonusCard.bonus.value} cartes ce tour`;
=======
        result.message = `You can now discard up to ${bonusCard.bonus.value} cards this turn`;
>>>>>>> 0057e418c4c4321fe4644761f151a2c134a2087c
        break;

      case 'invulnerable':
        // Set invulnerability for the next enemy attack
        this.gameState.invulnerableNextTurn = true;
<<<<<<< HEAD
        result.message = `Vous serez invulnérable à la prochaine attaque ennemie`;
=======
        result.message = `You will be invulnerable to the next enemy attack`;
>>>>>>> 0057e418c4c4321fe4644761f151a2c134a2087c
        break;

      default:
        result.success = false;
<<<<<<< HEAD
        result.message = 'Effet de carte bonus inconnu';
=======
        result.message = 'Unknown bonus card effect';
>>>>>>> 0057e418c4c4321fe4644761f151a2c134a2087c
        return result;
    }

    // Reduce the remaining uses
    bonusCard.usesRemaining--;

    // Add to combat log
<<<<<<< HEAD
    if (this.gameState.combatLog) {
      this.gameState.combatLog.unshift(result.message);
    }
=======
    this.gameState.combatLog.unshift(result.message);
>>>>>>> 0057e418c4c4321fe4644761f151a2c134a2087c

    return result;
  }

  // Upgrade a bonus card
<<<<<<< HEAD
  upgradeCard(cardId, upgradeMaterials = { goldCost: 50 }) {
=======
  upgradeCard(cardId, upgradeMaterials) {
>>>>>>> 0057e418c4c4321fe4644761f151a2c134a2087c
    // Find the card to upgrade
    const cardIndex = this.gameState.bonusCardCollection.findIndex(
      (card) => card.id === cardId && card.owned
    );

    if (cardIndex === -1) {
      return {
        success: false,
<<<<<<< HEAD
        message: 'Carte introuvable.',
=======
        message: 'Card not found.',
>>>>>>> 0057e418c4c4321fe4644761f151a2c134a2087c
      };
    }

    const card = this.gameState.bonusCardCollection[cardIndex];

    // Check if the card can be upgraded
    if (card.level && card.level >= 3) {
      return {
        success: false,
<<<<<<< HEAD
        message: 'Cette carte est déjà au niveau maximum.',
=======
        message: 'Card is already at maximum level.',
>>>>>>> 0057e418c4c4321fe4644761f151a2c134a2087c
      };
    }

    // Check upgrade materials (gold cost)
    if (this.gameState.player.gold < upgradeMaterials.goldCost) {
      return {
        success: false,
<<<<<<< HEAD
        message: "Pas assez d'or pour l'amélioration.",
=======
        message: 'Not enough gold for upgrade.',
>>>>>>> 0057e418c4c4321fe4644761f151a2c134a2087c
      };
    }

    // Upgrade the card
    if (!card.level) card.level = 1;
    card.level += 1;

    // Reduce player's gold
    this.gameState.player.gold -= upgradeMaterials.goldCost;

    // Improve card bonus
    if (card.bonus) {
      // Increase bonus value by 20% per level
      card.bonus.value = Math.floor(
        card.bonus.originalValue * (1 + 0.2 * (card.level - 1))
      );

      // Update description
      card.description = card.description.replace(
        /\d+/,
        card.bonus.value.toString()
      );
    }

<<<<<<< HEAD
    // Update active card if equipped
    const activeCardIndex = this.gameState.activeBonusCards.findIndex(
      (activeCard) => activeCard.id === cardId
    );

    if (activeCardIndex !== -1) {
      this.gameState.activeBonusCards[activeCardIndex] = {
        ...card,
        usesRemaining: card.uses || 0,
      };
    }

    return {
      success: true,
      message: `${card.name} améliorée au niveau ${card.level}!`,
=======
    return {
      success: true,
      message: `${card.name} upgraded to level ${card.level}!`,
>>>>>>> 0057e418c4c4321fe4644761f151a2c134a2087c
      upgradedCard: card,
    };
  }
}
