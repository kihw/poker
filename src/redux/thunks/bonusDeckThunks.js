// src/redux/thunks/bonusDeckThunks.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import { evaluateBonusDeckCombination } from '../../utils/bonusDeckEvaluator';
import { setActionFeedback } from '../slices/uiSlice';
import { addToCombatLog } from '../slices/combatSlice';

/**
 * Le state de bonusDeck pour stocker le résultat de l'évaluation
 * sera ajouté dans bonusCardsSlice.js
 */

/**
 * Thunk pour évaluer la combinaison de cartes bonus et appliquer les effets
 */
export const evaluateBonusDeck = createAsyncThunk(
  'bonusCards/evaluateDeck',
  async (_, { dispatch, getState }) => {
    try {
      const state = getState();
      const activeBonusCards = state.bonusCards.active || [];

      // Évaluer la combinaison des cartes bonus équipées
      const evaluationResult = evaluateBonusDeckCombination(activeBonusCards);

      console.log('Évaluation du deck bonus:', evaluationResult);

      // Si aucune combinaison n'est trouvée, ne rien faire
      if (!evaluationResult.combination || !evaluationResult.effect) {
        return { success: false, reason: 'no_combination' };
      }

      // Ajouter au journal de combat
      const combinationMessage = `Combinaison de cartes bonus: ${evaluationResult.combination.name}`;
      const effectMessage = `Effet activé: ${evaluationResult.description}`;

      dispatch(addToCombatLog(combinationMessage));
      dispatch(addToCombatLog(effectMessage));

      // Notification à l'utilisateur
      dispatch(
        setActionFeedback({
          message: `${combinationMessage} - ${evaluationResult.description}`,
          type: 'success',
          duration: 4000,
        })
      );

      // Appliquer les effets de la combinaison en fonction du type
      switch (evaluationResult.effect.type) {
        case 'criticalChance':
          dispatch({
            type: 'combat/setCriticalChanceBonus',
            payload: evaluationResult.effect.value,
          });
          break;

        case 'defense':
          dispatch({
            type: 'player/setDefenseBonus',
            payload: evaluationResult.effect.value,
          });
          break;

        case 'nextSkillDamage':
          dispatch({
            type: 'combat/setNextSkillBonus',
            payload: evaluationResult.effect.value,
          });
          break;

        case 'actionSpeed':
          dispatch({
            type: 'combat/setActionSpeedBonus',
            payload: evaluationResult.effect.value,
          });
          break;

        case 'globalDamage':
          dispatch({
            type: 'combat/setGlobalDamageBonus',
            payload: evaluationResult.effect.value,
          });
          break;

        case 'specialEffect':
          // Gérer les effets spéciaux comme l'invulnérabilité
          if (evaluationResult.effect.details === 'Invulnérabilité pendant un tour') {
            dispatch({
              type: 'combat/setInvulnerableNextTurn',
              payload: true,
            });
          }
          break;

        case 'ultimateSkill':
        case 'ultimate':
          // Ces effets puissants pourraient être gérés par des actions spéciales
          dispatch({
            type: 'combat/triggerUltimateEffect',
            payload: evaluationResult.effect,
          });
          break;

        case 'multistat':
          // Effet avec plusieurs bonus
          if (evaluationResult.effect.values) {
            if (evaluationResult.effect.values.damage) {
              dispatch({
                type: 'combat/setGlobalDamageBonus',
                payload: evaluationResult.effect.values.damage,
              });
            }

            if (evaluationResult.effect.values.defense) {
              dispatch({
                type: 'player/setDefenseBonus',
                payload: evaluationResult.effect.values.defense,
              });
            }
          }
          break;
      }

      return {
        success: true,
        evaluation: evaluationResult,
      };
    } catch (error) {
      console.error("Erreur lors de l'évaluation du deck bonus:", error);

      dispatch(
        setActionFeedback({
          message: "Erreur lors de l'évaluation des cartes bonus",
          type: 'error',
        })
      );

      return {
        success: false,
        error: error.message,
      };
    }
  }
);

/**
 * Thunk pour réinitialiser les bonus du deck à la fin d'un combat
 */
export const resetBonusDeckEffects = createAsyncThunk(
  'bonusCards/resetDeckEffects',
  async (_, { dispatch }) => {
    try {
      // Réinitialiser tous les types de bonus possibles
      dispatch({ type: 'combat/setCriticalChanceBonus', payload: 0 });
      dispatch({ type: 'player/setDefenseBonus', payload: 0 });
      dispatch({ type: 'combat/setNextSkillBonus', payload: 0 });
      dispatch({ type: 'combat/setActionSpeedBonus', payload: 0 });
      dispatch({ type: 'combat/setGlobalDamageBonus', payload: 0 });
      dispatch({ type: 'combat/setInvulnerableNextTurn', payload: false });

      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la réinitialisation des effets du deck bonus:', error);
      return { success: false, error: error.message };
    }
  }
);

export default {
  evaluateBonusDeck,
  resetBonusDeckEffects,
};
