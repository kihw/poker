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

    this.gameState.bonusCardCollection = startingCardIds
      .map((id) => {
        const card = this.allBonusCards.find((card) => card.id === id);
        return card ? { ...card, owned: true, level: 1 } : null;
      })
      .filter((card) => card !== null);

    // Initially equip first 3 cards
    this.gameState.activeBonusCards = this.gameState.bonusCardCollection
      .slice(0, Math.min(3, this.gameState.maxBonusCardSlots))
      .map((card) => ({ ...card, usesRemaining: card.uses || 0 }));
  }

  // Get owned bonus cards
  getOwnedBonusCards() {
    return this.gameState.bonusCardCollection.filter((card) => card.owned);
  }

  // Add a bonus card to the collection
  addBonusCardToCollection(cardId) {
    // Check if the card exists
    const newCardTemplate = this.allBonusCards.find(
      (card) => card.id === cardId
    );
    if (!newCardTemplate) {
      console.error(`Card with ID ${cardId} not found in allBonusCards`);
      return false;
    }

    const cardIndex = this.gameState.bonusCardCollection.findIndex(
      (card) => card.id === cardId
    );

    if (cardIndex === -1) {
      // If the card is not in the collection, add it
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

      return true;
    }

    return false;
  }

  // Méthode equipBonusCard corrigée
  equipBonusCard(cardId) {
    console.log('BonusCardSystem.equipBonusCard', cardId);

    // Vérifications préliminaires
    if (!this.gameState || !this.gameState.bonusCardCollection) {
      console.error('GameState ou collection de cartes non initialisé');
      return false;
    }

    // Check if the player owns this card
    const card = this.gameState.bonusCardCollection.find(
      (card) => card.id === cardId && card.owned !== false
    );

    if (!card) {
      console.error('Card not found or not owned:', cardId);
      return false;
    }

    // S'assurer que activeBonusCards existe
    if (!this.gameState.activeBonusCards) {
      this.gameState.activeBonusCards = [];
    }

    // Check if the card is already equipped
    const isAlreadyEquipped = this.gameState.activeBonusCards.some(
      (activeCard) => activeCard.id === cardId
    );

    if (isAlreadyEquipped) {
      console.warn('Card is already equipped:', cardId);
      return false;
    }

    // Check if there's space in the active bonus card slots
    if (
      this.gameState.activeBonusCards.length >= this.gameState.maxBonusCardSlots
    ) {
      console.warn('No space for more cards');
      return false;
    }

    // Add the card to active bonus cards
    this.gameState.activeBonusCards.push({
      ...card,
      usesRemaining: card.uses || 0,
    });

    console.log('Card equipped successfully', card.name);
    return true;
  }

  // Méthode unequipBonusCard corrigée
  unequipBonusCard(cardId) {
    console.log('BonusCardSystem.unequipBonusCard', cardId);

    // Vérifications préliminaires
    if (!this.gameState || !this.gameState.activeBonusCards) {
      console.error('GameState ou cartes actives non initialisé');
      return false;
    }

    const cardIndex = this.gameState.activeBonusCards.findIndex(
      (card) => card.id === cardId
    );

    if (cardIndex !== -1) {
      // Récupère la carte pour le log
      const removedCard = this.gameState.activeBonusCards[cardIndex];

      // Supprime la carte des cartes actives
      this.gameState.activeBonusCards.splice(cardIndex, 1);

      console.log('Card unequipped successfully', removedCard.name);
      return true;
    }

    console.warn('Card not found in active cards:', cardId);
    return false;
  }

  // Generate a bonus card reward after combat
  generateBonusCardReward() {
    const stage = this.gameState.stage || 1;
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
      return null;
    }

    // Select a random card
    const randomCard =
      possibleCards[Math.floor(Math.random() * possibleCards.length)];
    return randomCard.id;
  }

  // Maps hand types to bonus card conditions
  mapHandTypeToCondition(handName) {
    // Vérifier que handName est une chaîne valide
    if (!handName || typeof handName !== 'string') {
      console.warn('handName invalide:', handName);
      return 'unknown';
    }

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
    if (handRank === undefined || handRank === null) {
      console.warn('handRank non spécifié:', handRank);
      handRank = 0;
    }

    if (!handName) {
      console.warn('handName non spécifié');
      handName = 'High Card';
    }

    // Calcul de base des dégâts - 2^rang
    let damage = Math.pow(2, handRank);
    let bonusEffects = [];

    // Map the hand name to the bonus card condition
    const condition = this.mapHandTypeToCondition(handName);

    // Vérifier que activeBonusCards existe et est un tableau
    if (
      !this.gameState.activeBonusCards ||
      !Array.isArray(this.gameState.activeBonusCards)
    ) {
      console.warn('activeBonusCards non initialisé ou invalide');
      return { damage, bonusEffects };
    }

    // Apply effects from active bonus cards
    for (const bonusCard of this.gameState.activeBonusCards) {
      // Skip invalid cards
      if (!bonusCard) continue;

      // Check for passive effects that apply to this hand or always
      if (
        bonusCard.effect === 'passive' &&
        (bonusCard.condition === condition || bonusCard.condition === 'always')
      ) {
        switch (bonusCard.bonus?.type) {
          case 'damage':
            damage += bonusCard.bonus.value;
            bonusEffects.push(
              `${bonusCard.name} added ${bonusCard.bonus.value} damage`
            );
            break;
          case 'heal':
            if (!this.gameState.player) continue;

            const healAmount = Math.min(
              bonusCard.bonus.value,
              this.gameState.player.maxHealth - this.gameState.player.health
            );
            this.gameState.player.health += healAmount;
            bonusEffects.push(`${bonusCard.name} healed ${healAmount} HP`);
            break;
          case 'shield':
            if (!this.gameState.player) continue;

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
        this.gameState.playerDamagedLastTurn &&
        bonusCard.bonus?.type === 'damage'
      ) {
        damage += bonusCard.bonus.value;
        bonusEffects.push(
          `${bonusCard.name} added ${bonusCard.bonus.value} damage from last turn's damage`
        );
      }

      // Check for low health effects
      if (
        bonusCard.effect === 'passive' &&
        bonusCard.condition === 'lowHealth' &&
        this.gameState.player &&
        this.gameState.player.health <=
          this.gameState.player.maxHealth * 0.25 &&
        bonusCard.bonus?.type === 'damageMultiplier'
      ) {
        const additionalDamage = Math.floor(
          damage * (bonusCard.bonus.value - 1)
        );
        damage = Math.floor(damage * bonusCard.bonus.value);
        bonusEffects.push(
          `${bonusCard.name} increased damage by ${additionalDamage} (low health bonus)`
        );
      }
    }

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

    return { damage, bonusEffects };
  }

  // Use an active bonus card
  useActiveBonus(index) {
    // Vérifications préliminaires
    if (!this.gameState || !this.gameState.activeBonusCards) {
      return {
        success: false,
        message: 'État du jeu non initialisé',
      };
    }

    if (index < 0 || index >= this.gameState.activeBonusCards.length) {
      return {
        success: false,
        message: 'Carte bonus invalide',
      };
    }

    const bonusCard = this.gameState.activeBonusCards[index];
    if (!bonusCard) {
      return {
        success: false,
        message: 'Carte bonus non trouvée',
      };
    }

    // Check if the card is active and has uses left
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
      };
    }

    // Apply the effect based on the card type
    let result = {
      success: true,
      message: `${bonusCard.name} utilisée`,
    };

    if (!bonusCard.bonus) {
      return {
        success: false,
        message: 'Carte bonus mal configurée',
      };
    }

    switch (bonusCard.bonus.type) {
      case 'damage':
        // Add damage to the current or next attack
        this.gameState.pendingDamageBonus =
          (this.gameState.pendingDamageBonus || 0) + bonusCard.bonus.value;
        result.message = `Ajouté ${bonusCard.bonus.value} dégâts à votre prochaine attaque`;
        break;

      case 'damageMultiplier':
        // Will multiply the damage of the next attack
        this.gameState.pendingDamageMultiplier = bonusCard.bonus.value;
        result.message = `Votre prochaine attaque infligera ${bonusCard.bonus.value}x dégâts`;
        break;

      case 'heal':
        // Healing effect
        if (!this.gameState.player) {
          result.success = false;
          result.message = 'Joueur non initialisé';
          return result;
        }

        const healAmount = Math.min(
          bonusCard.bonus.value,
          this.gameState.player.maxHealth - this.gameState.player.health
        );
        this.gameState.player.health += healAmount;
        result.message = `Récupéré ${healAmount} PV`;
        break;

      case 'discard':
        // Allow player to discard more cards
        this.gameState.discardLimit = bonusCard.bonus.value;
        result.message = `Vous pouvez maintenant défausser jusqu'à ${bonusCard.bonus.value} cartes ce tour`;
        break;

      case 'invulnerable':
        // Set invulnerability for the next enemy attack
        this.gameState.invulnerableNextTurn = true;
        result.message = `Vous serez invulnérable à la prochaine attaque ennemie`;
        break;

      default:
        result.success = false;
        result.message = 'Effet de carte bonus inconnu';
        return result;
    }

    // Reduce the remaining uses
    bonusCard.usesRemaining--;

    // Add to combat log
    if (this.gameState.combatLog) {
      this.gameState.combatLog.unshift(result.message);
    }

    return result;
  }

  // Upgrade a bonus card
  upgradeCard(cardId, upgradeMaterials = { goldCost: 50 }) {
    // Vérifications préliminaires
    if (!this.gameState || !this.gameState.bonusCardCollection) {
      return {
        success: false,
        message: 'État du jeu non initialisé',
      };
    }

    // Find the card to upgrade
    const cardIndex = this.gameState.bonusCardCollection.findIndex(
      (card) => card && card.id === cardId && card.owned
    );

    if (cardIndex === -1) {
      return {
        success: false,
        message: 'Carte introuvable.',
      };
    }

    const card = this.gameState.bonusCardCollection[cardIndex];

    // Check if the card can be upgraded
    if (card.level && card.level >= 3) {
      return {
        success: false,
        message: 'Cette carte est déjà au niveau maximum.',
      };
    }

    // Check upgrade materials (gold cost)
    if (this.gameState.player.gold < upgradeMaterials.goldCost) {
      return {
        success: false,
        message: "Pas assez d'or pour l'amélioration.",
      };
    }

    // Upgrade the card
    if (!card.level) card.level = 1;
    card.level += 1;

    // Reduce player's gold
    this.gameState.player.gold -= upgradeMaterials.goldCost;

    // Improve card bonus
    if (card.bonus) {
      // Store original value if not already saved
      if (!card.bonus.originalValue) {
        card.bonus.originalValue = card.bonus.value;
      }

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

    // Update active card if equipped
    const activeCardIndex = this.gameState.activeBonusCards.findIndex(
      (activeCard) => activeCard && activeCard.id === cardId
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
      upgradedCard: card,
    };
  }
}
