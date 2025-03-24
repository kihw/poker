// src/redux/middleware/bonusEffectsMiddleware.js
import {
  setPendingDamageBonus,
  setPendingDamageMultiplier,
  setInvulnerableNextTurn,
} from '../slices/combatSlice';
import { heal, addShield } from '../slices/playerSlice';
import { setActionFeedback } from '../slices/uiSlice';

// Configuration des types d'effets de cartes et leur mappage vers les actions Redux
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
    // Nous ne modifions pas directement l'état ici, juste retourner un message
    // Le comportement est géré par le thunk discardCards
    return `${card.name} vous permet de défausser jusqu'à ${value} cartes`;
  },
  damageReduction: (store, card, value) => {
    // Ceci est géré dans le reducer enemyAction
    return `${card.name} réduira les dégâts de ${value} points`;
  },
};

/**
 * Applique les effets d'une carte bonus active
 * Cette fonction est exportée pour être utilisable par les thunks sans créer de dépendances circulaires
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
    console.warn(`Handler not defined for effect type: ${card.bonus.type}`);
    return null;
  }

  return handler(store, card, card.bonus.value);
}

/**
 * Middleware qui intercepte les actions liées aux cartes bonus
 * et applique leurs effets à l'état du jeu
 */
const bonusEffectsMiddleware = (store) => (next) => (action) => {
  // Gestion de l'utilisation d'une carte bonus
  if (action.type === 'bonusCards/useCard') {
    const state = store.getState();
    const cardIndex = action.payload;

    // Vérifier si state.bonusCards et state.bonusCards.active existent avant d'y accéder
    if (state.bonusCards && Array.isArray(state.bonusCards.active)) {
      const card = state.bonusCards.active[cardIndex];

      // Vérifier si la carte peut être utilisée
      if (card && card.effect === 'active' && card.usesRemaining > 0) {
        const effectMessage = applyCardEffect(store, card);

        // Afficher le feedback si nécessaire
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

  // Gestion de l'attaque du joueur pour appliquer les bonus passifs
  if (action.type === 'combat/attackEnemy/pending') {
    const state = store.getState();

    // Vérifier si les propriétés d'état requises existent
    if (!state.bonusCards || !state.combat) {
      return next(action);
    }

    const activeBonusCards = state.bonusCards.active || [];
    const currentHandName = state.combat.handResult?.handName;
    const playerDamagedLastTurn = state.combat.playerDamagedLastTurn;

    const bonusMessages = [];

    // Appliquer les effets passifs conditionnels
    activeBonusCards.forEach((card) => {
      if (!card || card.effect !== 'passive') return;

      let shouldApply = false;

      // Vérifier la condition
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

      // Appliquer l'effet si la condition est remplie
      if (shouldApply) {
        const effectMessage = applyCardEffect(store, card);
        if (effectMessage) {
          bonusMessages.push(effectMessage);
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
