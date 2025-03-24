// src/redux/middleware/bonusEffectsMiddleware.js - Fixed version
import {
  setPendingDamageBonus,
  setPendingDamageMultiplier,
  setInvulnerableNextTurn,
} from '../slices/combatSlice';
import { heal, addShield } from '../slices/playerSlice';
import { setActionFeedback } from '../slices/uiSlice';

// Configuration of card bonus effect types and their mapping to Redux actions
const BONUS_EFFECT_HANDLERS = {
  damage: (store, card, value) => {
    store.dispatch(setPendingDamageBonus(value));
    return `${card.name} a ajouté ${value} dégâts`;
  },
  damageMultiplier: (store, card, value) => {
    store.dispatch(setPendingDamageMultiplier(value));
    return `${card.name} a multiplié les dégâts par ${value}`;
  },
  heal: (store, card, value) => {
    store.dispatch(heal(value));
    return `${card.name} a restauré ${value} PV`;
  },
  shield: (store, card, value) => {
    store.dispatch(addShield(value));
    return `${card.name} a ajouté ${value} points de bouclier`;
  },
  invulnerable: (store, card) => {
    store.dispatch(setInvulnerableNextTurn(true));
    return `${card.name} vous rend invulnérable au prochain tour`;
  },
  discard: (store, card, value) => {
    // We don't directly modify state here, just return a message
    // The behavior is handled by the discardCards thunk
    return `${card.name} vous permet de défausser jusqu'à ${value} cartes`;
  },
  damageReduction: (store, card, value) => {
    // This is handled in the enemyAction reducer
    return `${card.name} réduira les dégâts de ${value} points`;
  },
};

/**
 * Applies effects of an active bonus card
 * This function is exported to be usable by thunks without creating circular dependencies
 * @param {Object} store - The Redux store
 * @param {Object} card - The bonus card to use
 * @returns {String|null} - Feedback message or null
 */
export function applyCardEffect(store, card) {
  if (!card || !card.bonus || !card.bonus.type) {
    return null;
  }

  const handler = BONUS_EFFECT_HANDLERS[card.bonus.type];
  if (!handler) {
    console.warn(`Handler not defined for effect type: ${card.bonus.type}`);
    return null;
  }

  return handler(store, card, card.bonus.value);
}

/**
 * Middleware that intercepts bonus card related actions
 * and applies their effects to the game state
 */
const bonusEffectsMiddleware = (store) => (next) => (action) => {
  // Handle use of bonus card
  if (action.type === 'bonusCards/useCard') {
    const state = store.getState();
    const cardIndex = action.payload;

    // Check if state.bonusCards and state.bonusCards.active exist before accessing
    if (state.bonusCards && Array.isArray(state.bonusCards.active)) {
      const card = state.bonusCards.active[cardIndex];

      // Check if card can be used
      if (card && card.effect === 'active' && card.usesRemaining > 0) {
        const effectMessage = applyCardEffect(store, card);

        // Show feedback if necessary
        if (effectMessage) {
          store.dispatch(
            setActionFeedback({
              message: effectMessage,
              type: 'success',
            })
          );
        }
      }
    }
  }

  // Handle player attack to apply passive bonuses
  if (action.type === 'combat/attackEnemy/pending') {
    const state = store.getState();

    // Check if required state properties exist
    if (!state.bonusCards || !state.combat) {
      return next(action);
    }

    const activeBonusCards = state.bonusCards.active || [];
    const currentHandName = state.combat.handResult?.handName;
    const playerDamagedLastTurn = state.combat.playerDamagedLastTurn;

    const bonusMessages = [];

    // Apply conditional passive effects
    activeBonusCards.forEach((card) => {
      if (!card || card.effect !== 'passive') return;

      let shouldApply = false;

      // Check condition
      if (card.condition === 'always') {
        shouldApply = true;
      } else if (card.condition === 'damageTaken' && playerDamagedLastTurn) {
        shouldApply = true;
      } else if (card.condition === currentHandName) {
        shouldApply = true;
      } else if (card.condition === 'lowHealth' && state.player) {
        const player = state.player;
        shouldApply = player.health < player.maxHealth * 0.25;
      }

      // Apply effect if condition is met
      if (shouldApply) {
        const effectMessage = applyCardEffect(store, card);
        if (effectMessage) {
          bonusMessages.push(effectMessage);
        }
      }
    });

    // Send global feedback if multiple effects were applied
    if (bonusMessages.length > 0) {
      store.dispatch(
        setActionFeedback({
          message: `Effets bonus appliqués: ${bonusMessages.length}`,
          type: 'info',
        })
      );
    }
  }

  return next(action);
};

export default bonusEffectsMiddleware;
