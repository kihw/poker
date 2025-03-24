// src/redux/selectors/bonusCardSelectors.js
import { createSelector } from '@reduxjs/toolkit';

// Sélecteurs de base
const selectBonusCardsState = (state) => state.bonusCards;
const selectCombatState = (state) => state.combat;
const selectPlayerState = (state) => state.player;

// Sélecteurs mémorisés pour l'état des cartes bonus
export const selectBonusCardCollection = createSelector(
  [selectBonusCardsState],
  (bonusCardsState) => bonusCardsState.collection
);

export const selectActiveBonusCards = createSelector(
  [selectBonusCardsState],
  (bonusCardsState) => bonusCardsState.active
);

export const selectMaxBonusCardSlots = createSelector(
  [selectBonusCardsState],
  (bonusCardsState) => bonusCardsState.maxSlots
);

// Filtrer les cartes par rareté
export const makeSelectCardsByRarity = () => {
  return createSelector([selectBonusCardCollection, (_, rarity) => rarity], (collection, rarity) =>
    collection.filter((card) => card.rarity === rarity)
  );
};

// Filtrer les cartes par type d'effet
export const makeSelectCardsByEffect = () => {
  return createSelector(
    [selectBonusCardCollection, (_, effectType) => effectType],
    (collection, effectType) => collection.filter((card) => card.bonus?.type === effectType)
  );
};

// Sélecteur pour les cartes améliorables
export const selectUpgradeableCards = createSelector([selectBonusCardCollection], (collection) =>
  collection.filter((card) => card.owned && (!card.level || card.level < 3))
);

// Sélecteur pour vérifier si une carte est équipée
export const makeSelectIsCardEquipped = () => {
  return createSelector([selectActiveBonusCards, (_, cardId) => cardId], (activeCards, cardId) =>
    activeCards.some((card) => card.id === cardId)
  );
};

// Sélecteur pour vérifier si une carte a des utilisations restantes
export const makeSelectCardRemainingUses = () => {
  return createSelector([selectActiveBonusCards, (_, cardId) => cardId], (activeCards, cardId) => {
    const card = activeCards.find((c) => c.id === cardId);
    return card ? card.usesRemaining : 0;
  });
};

// Sélecteur pour les cartes actives utilisables
export const selectUsableActiveCards = createSelector(
  [selectActiveBonusCards, selectCombatState],
  (activeCards, combatState) =>
    activeCards.filter(
      (card) =>
        card.effect === 'active' && card.usesRemaining > 0 && combatState.turnPhase !== 'draw'
    )
);

// Sélecteur pour les cartes passives actuellement actives
export const selectActivePassiveEffects = createSelector(
  [selectActiveBonusCards, selectCombatState, selectPlayerState],
  (activeCards, combatState, playerState) => {
    return activeCards
      .filter((card) => card.effect === 'passive')
      .map((card) => {
        let isActive = false;

        // Vérifier la condition
        if (card.condition === 'always') {
          isActive = true;
        } else if (card.condition === 'damageTaken' && combatState.playerDamagedLastTurn) {
          isActive = true;
        } else if (card.condition === combatState.handResult?.handName) {
          isActive = true;
        } else if (card.condition === 'lowHealth') {
          isActive = playerState.health < playerState.maxHealth * 0.25;
        }

        return {
          ...card,
          isActive,
        };
      });
  }
);

// Sélecteur pour les cartes disponibles à équiper
export const selectCardsAvailableToEquip = createSelector(
  [selectBonusCardCollection, selectActiveBonusCards, selectMaxBonusCardSlots],
  (collection, activeCards, maxSlots) => {
    // Si tous les emplacements sont occupés, aucune carte ne peut être équipée
    if (activeCards.length >= maxSlots) {
      return [];
    }

    // IDs des cartes déjà équipées
    const equippedIds = activeCards.map((card) => card.id);

    // Renvoyer les cartes possédées qui ne sont pas déjà équipées
    return collection.filter((card) => card.owned && !equippedIds.includes(card.id));
  }
);

// Sélecteur pour calculer les bonus totaux par type
export const selectTotalBonusValues = createSelector([selectActiveBonusCards], (activeCards) => {
  const bonusValues = {
    damage: 0,
    damageReduction: 0,
    heal: 0,
    shield: 0,
  };

  activeCards.forEach((card) => {
    if (card.bonus && card.bonus.type in bonusValues && card.bonus.value) {
      bonusValues[card.bonus.type] += card.bonus.value;
    }
  });

  return bonusValues;
});

// Sélecteur pour les cartes que le joueur n'a pas encore
export const selectUnownedCards = createSelector(
  [selectBonusCardCollection, (_, allCardsData) => allCardsData],
  (collection, allCardsData) => {
    const ownedIds = collection.map((card) => card.id);
    return allCardsData.filter((card) => !ownedIds.includes(card.id));
  }
);
