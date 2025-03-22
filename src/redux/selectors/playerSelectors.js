// src/redux/selectors/playerSelectors.js
import { createSelector } from '@reduxjs/toolkit';

// Sélecteur de base pour l'état du joueur
const selectPlayerState = (state) => state.player;

// Sélecteurs simples pour des propriétés spécifiques du joueur
export const selectPlayerHealth = createSelector(
  [selectPlayerState],
  (playerState) => playerState.health
);

export const selectPlayerMaxHealth = createSelector(
  [selectPlayerState],
  (playerState) => playerState.maxHealth
);

export const selectPlayerGold = createSelector(
  [selectPlayerState],
  (playerState) => playerState.gold
);

export const selectPlayerLevel = createSelector(
  [selectPlayerState],
  (playerState) => playerState.level
);

export const selectPlayerExperience = createSelector(
  [selectPlayerState],
  (playerState) => playerState.experience
);

export const selectPlayerShield = createSelector(
  [selectPlayerState],
  (playerState) => playerState.shield
);

export const selectPlayerInventory = createSelector(
  [selectPlayerState],
  (playerState) => playerState.inventory
);

// Sélecteurs dérivés plus complexes
export const selectPlayerHealthPercentage = createSelector(
  [selectPlayerHealth, selectPlayerMaxHealth],
  (health, maxHealth) =>
    maxHealth > 0 ? Math.floor((health / maxHealth) * 100) : 0
);

export const selectPlayerExperienceToNextLevel = createSelector(
  [selectPlayerLevel, selectPlayerExperience],
  (level, experience) => {
    const requiredXP = level * 100; // Formule simple: niveau * 100
    return {
      current: experience,
      required: requiredXP,
      percentage: Math.floor((experience / requiredXP) * 100),
      remaining: requiredXP - experience,
    };
  }
);

export const selectPlayerCanLevelUp = createSelector(
  [selectPlayerLevel, selectPlayerExperience],
  (level, experience) => {
    const requiredXP = level * 100;
    return experience >= requiredXP;
  }
);

export const selectPlayerStrength = createSelector(
  [selectPlayerLevel, selectPlayerState],
  (level, playerState) => {
    // Calcul de base de la force (peut être ajusté selon votre logique de jeu)
    let baseStrength = 10 + (level - 1) * 2;

    // Ajouter des bonus d'items si applicable
    const strengthItems = playerState.inventory.filter(
      (item) => item.type === 'strength'
    );
    const strengthBonus = strengthItems.reduce(
      (sum, item) => sum + (item.value || 0),
      0
    );

    return baseStrength + strengthBonus;
  }
);

export const selectPlayerIsDead = createSelector(
  [selectPlayerHealth],
  (health) => health <= 0
);

export const selectPlayerHasItems = createSelector(
  [selectPlayerInventory],
  (inventory) => inventory.length > 0
);

export const selectPlayerHasMoney = createSelector(
  [selectPlayerGold],
  (gold) => gold > 0
);

// Sélecteur pour vérifier si le joueur peut acheter un item
export const makeSelectPlayerCanBuyItem = () => {
  return createSelector(
    [selectPlayerGold, (_, itemPrice) => itemPrice],
    (gold, itemPrice) => gold >= itemPrice
  );
};

// Sélecteur pour les informations du joueur à sauvegarder
export const selectPlayerSaveData = createSelector(
  [selectPlayerState],
  (playerState) => ({
    health: playerState.health,
    maxHealth: playerState.maxHealth,
    gold: playerState.gold,
    level: playerState.level,
    experience: playerState.experience,
    inventory: playerState.inventory || [],
    shield: playerState.shield || 0,
  })
);
