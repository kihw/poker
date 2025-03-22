// src/redux/middleware/bonusEffectsMiddleware.js
/**
 * Middleware Redux pour gérer les effets des cartes bonus
 * Ce middleware intercepte les actions spécifiques et applique les effets des cartes bonus
 */

import {
  setPendingDamageBonus,
  setPendingDamageMultiplier,
  setInvulnerableNextTurn,
} from '../slices/combatSlice';
import { heal, addShield } from '../slices/playerSlice';
import { setActionFeedback } from '../slices/uiSlice';

// Configuration des types d'effet de carte bonus et leur mapping avec les actions Redux
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
    // Géré dans la thunk discardCards
    return `${card.name} vous permet de défausser jusqu'à ${value} cartes`;
  },
  damageReduction: () => {
    // Géré dans le reducer de l'action enemyAction
    return null;
  },
};

/**
 * Applique les effets d'une carte bonus active
 * @param {Object} store - Le store Redux
 * @param {Object} card - La carte bonus à utiliser
 * @returns {String|null} - Message de feedback ou null
 */
export function applyCardEffect(store, card) {
  if (!card || !card.bonus || !card.bonus.type) {
    return null;
  }

  const handler = BONUS_EFFECT_HANDLERS[card.bonus.type];
  if (!handler) {
    console.warn(`Handler non défini pour le type d'effet: ${card.bonus.type}`);
    return null;
  }

  return handler(store, card, card.bonus.value);
}

// Le middleware proprement dit
const bonusEffectsMiddleware = (store) => (next) => (action) => {
  // Intercepter l'action d'utilisation de carte bonus
  if (action.type === 'bonusCards/useCard') {
    const state = store.getState();
    const cardIndex = action.payload;
    const card = state.bonusCards.active[cardIndex];

    // Vérifier que la carte existe et peut être utilisée
    if (card && card.effect === 'active' && card.usesRemaining > 0) {
      const effectMessage = applyCardEffect(store, card);

      // Afficher un feedback si nécessaire
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

  // Intercepter l'action d'attaque pour appliquer les bonus passifs
  if (action.type === 'combat/attackEnemy/pending') {
    const state = store.getState();
    const activeBonusCards = state.bonusCards.active;
    const currentHandName = state.combat.handResult?.handName;
    const playerDamagedLastTurn = state.combat.playerDamagedLastTurn;

    let bonusMessages = [];

    // Appliquer les effets passifs conditionnels
    activeBonusCards.forEach((card) => {
      if (card.effect === 'passive') {
        let shouldApply = false;

        // Vérifier la condition
        if (card.condition === 'always') {
          shouldApply = true;
        } else if (card.condition === 'damageTaken' && playerDamagedLastTurn) {
          shouldApply = true;
        } else if (card.condition === currentHandName) {
          shouldApply = true;
        } else if (card.condition === 'lowHealth') {
          const player = state.player;
          shouldApply = player.health < player.maxHealth * 0.25;
        }

        // Appliquer l'effet si la condition est remplie
        if (shouldApply) {
          const effectMessage = applyCardEffect(store, card);
          if (effectMessage) {
            bonusMessages.push(effectMessage);
          }
        }
      }
    });

    // Envoyer un feedback global si plusieurs effets ont été appliqués
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
