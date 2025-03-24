// src/redux/middleware/bonusFusionMiddleware.js
import {
  setPendingDamageBonus,
  setPendingDamageMultiplier,
  setInvulnerableNextTurn,
  addToCombatLog,
} from '../slices/combatSlice';
import { heal, addShield } from '../slices/playerSlice';
import { setActionFeedback } from '../slices/uiSlice';

/**
 * Middleware pour gérer la fusion des cartes bonus et appliquer les effets
 * qui en résultent
 */
const bonusFusionMiddleware = (store) => (next) => (action) => {
  // Gestion de l'action de fusion des cartes bonus
  if (action.type === 'bonusCards/fuseBonusCards') {
    const { cardIds, effect } = action.payload;
    const state = store.getState();

    // Vérifier si les cartes existent et sont actives
    if (!state.bonusCards || !Array.isArray(state.bonusCards.active)) {
      return next(action);
    }

    // Marquer les cartes comme utilisées pour la fusion
    // (pour éventuellement limiter l'utilisation répétée)

    // Appliquer l'effet de la fusion
    if (effect) {
      // Log l'effet pour débogage
      console.log(`Applying fusion effect: ${effect.type} ${effect.value}`);

      // Appliquer l'effet selon son type
      switch (effect.type) {
        case 'damage':
          store.dispatch(setPendingDamageBonus(effect.value));
          store.dispatch(addToCombatLog(`Fusion de cartes bonus: +${effect.value} dégâts`));
          break;

        case 'damageMultiplier':
          store.dispatch(setPendingDamageMultiplier(effect.value));
          store.dispatch(
            addToCombatLog(`Fusion de cartes bonus: Dégâts multipliés par ${effect.value}`)
          );
          break;

        case 'heal':
          store.dispatch(heal(effect.value));
          store.dispatch(
            addToCombatLog(`Fusion de cartes bonus: Récupération de ${effect.value} PV`)
          );
          break;

        case 'shield':
          store.dispatch(addShield(effect.value));
          store.dispatch(
            addToCombatLog(`Fusion de cartes bonus: +${effect.value} points de bouclier`)
          );
          break;

        case 'invulnerable':
          store.dispatch(setInvulnerableNextTurn(true));
          store.dispatch(
            addToCombatLog(`Fusion de cartes bonus: Invulnérabilité au prochain tour`)
          );
          break;

        default:
          // En cas de type inconnu, log un avertissement
          console.warn(`Unknown fusion effect type: ${effect.type}`);
      }

      // Notification à l'utilisateur
      store.dispatch(
        setActionFeedback({
          message: effect.description || `Effet de fusion de cartes appliqué`,
          type: 'success',
        })
      );
    }
  }

  return next(action);
};

export default bonusFusionMiddleware;
