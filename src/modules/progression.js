// src/modules/progression.js
import { LEVEL_XP_REQUIREMENTS, LEVEL_REWARDS, SHOP_ITEMS } from '../data/progression.js';

export class ProgressionSystem {
  constructor(gameState) {
    this.gameState = gameState;
  }

  // Previous methods (addExperience, levelUp, applyLevelReward, generateCombatRewards) remain the same

  // Initialize shop with random items
  initShop() {
    const availableItems = [];
    const eligibleItems = SHOP_ITEMS.filter(item => {
      // Check if item has purchase limit and hasn't exceeded it
      if (item.maxPurchases) {
        const purchases = this.gameState.itemsPurchased?.[item.id] || 0;
        return purchases < item.maxPurchases;
      }
      return true;
    });

    // Select 4 random items
    while (
      availableItems.length < 4 &&
      eligibleItems.length > availableItems.length
    ) {
      const randomItem = eligibleItems[
        Math.floor(Math.random() * eligibleItems.length)
      ];

      if (!availableItems.some(item => item.id === randomItem.id)) {
        availableItems.push(randomItem);
      }
    }

    // Ensure game state has necessary properties
    if (!this.gameState.itemsPurchased) {
      this.gameState.itemsPurchased = {};
    }
    this.gameState.shopItems = availableItems;

    return availableItems;
  }

  // Purchase an item from the shop
  purchaseShopItem(itemIndex) {
    // Validate shop and item index
    if (!this.gameState.shopItems || 
        itemIndex < 0 || 
        itemIndex >= this.gameState.shopItems.length) {
      return { 
        success: false, 
        message: "Item not available." 
      };
    }

    const item = this.gameState.shopItems[itemIndex];

    // Check if player has enough gold
    if (this.gameState.player.gold < item.price) {
      return { 
        success: false, 
        message: "Not enough gold." 
      };
    }

    // Deduct gold
    this.gameState.player.gold -= item.price;

    // Track item purchases
    if (!this.gameState.itemsPurchased) {
      this.gameState.itemsPurchased = {};
    }
    this.gameState.itemsPurchased[item.id] = 
      (this.gameState.itemsPurchased[item.id] || 0) + 1;

    // Process item based on type
    let result = { 
      success: true, 
      message: `Purchased ${item.name}.` 
    };

    switch (item.type) {
      case "bonus_card_pack":
        // Bonus card pack logic
        this.purchaseBonusCardPack(item);
        break;

      case "consumable":
        this.addItemToInventory(item);
        break;

      case "permanent":
        this.applyPermanentEffect(item);
        break;
    }

    // Remove item from shop
    this.gameState.shopItems.splice(itemIndex, 1);

    return result;
  }

  // Add a bonus card pack to the player's collection
  purchaseBonusCardPack(packItem) {
    const bonusCardSystem = this.gameState.bonusCardSystem;
    
    for (let i = 0; i < packItem.count; i++) {
      const cardId = bonusCardSystem.generateBonusCardReward();
      if (cardId) {
        bonusCardSystem.addBonusCardToCollection(cardId);
      }
    }
  }

  // Add an item to player's inventory
  addItemToInventory(item) {
    // Ensure inventory exists
    if (!this.gameState.inventory) {
      this.gameState.inventory = [];
    }

    // Add item to inventory
    this.gameState.inventory.push({
      id: item.id,
      name: item.name,
      description: item.description,
      effect: item.effect,
      usableInCombat: item.usableInCombat
    });
  }

  // Apply a permanent effect (like max health boost)
  applyPermanentEffect(item) {
    switch (item.effect.type) {
      case "maxHealth":
        this.gameState.player.maxHealth += item.effect.value;
        this.gameState.player.health += item.effect.value;
        break;

      case "bonusCardSlot":
        this.gameState.maxBonusCardSlots += item.effect.value;
        break;
    }
  }

  // Use an item from inventory
  useInventoryItem(itemIndex) {
    // Validate inventory and item index
    if (!this.gameState.inventory || 
        itemIndex < 0 || 
        itemIndex >= this.gameState.inventory.length) {
      return { 
        success: false, 
        message: "Item not available." 
      };
    }

    const item = this.gameState.inventory[itemIndex];

    // Check if item can be used in current game phase
    if (this.gameState.gamePhase === "combat" && !item.usableInCombat) {
      return { 
        success: false, 
        message: "This item cannot be used in combat." 
      };
    }

    // Process item effect
    let result = { 
      success: true, 
      message: `Used ${item.name}.` 
    };

    switch (item.effect.type) {
      case "heal":
        const healAmount = Math.min(
          item.effect.value,
          this.gameState.player.maxHealth - this.gameState.player.health
        );
        this.gameState.player.health += healAmount;
        result.message = `Healed ${healAmount} HP.`;
        break;

      case "shield":
        this.gameState.player.shield = 
          (this.gameState.player.shield || 0) + item.effect.value;
        result.message = `Gained ${item.effect.value} shield.`;
        break;
    }

    // Remove used item from inventory
    this.gameState.inventory.splice(itemIndex, 1);

    return result;
  }
}