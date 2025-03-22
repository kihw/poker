// src/redux/thunks/restThunks.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import { setActionFeedback } from '../slices/uiSlice';
import { setGamePhase } from '../slices/gameSlice';
import { heal, addShield, spendGold } from '../slices/playerSlice';
import { upgradeCard } from '../slices/bonusCardsSlice';
import { addToCombatLog } from '../slices/combatSlice';

// Action pour appliquer les effets d'une option de repos (soin, amélioration, etc.)
export const applyRestOption = createAsyncThunk(
  'rest/applyRestOption',
  async ({ option, cardId }, { dispatch, getState }) => {
    try {
      const state = getState();
      const player = state.player;

      // Objet pour stocker le résultat
      let result = {
        success: true,
        message: '',
        effect: null,
      };

      // Switch sur l'ID de l'option pour déterminer l'effet à appliquer
      switch (option.id) {
        case 'heal':
          // Calculer le montant de soin (30% des PV max)
          const healAmount = Math.floor(player.maxHealth * 0.3);

          // Appliquer le soin
          dispatch(heal(healAmount));

          // Définir le résultat
          result.message = `Vous vous reposez et récupérez ${healAmount} points de vie.`;
          result.effect = {
            type: 'heal',
            value: healAmount,
          };
          break;

        case 'upgrade':
          // Vérifier que la carte et l'ID sont fournis
          if (!cardId) {
            return {
              success: false,
              message: "Aucune carte sélectionnée pour l'amélioration.",
            };
          }

          // Améliorer la carte
          dispatch(upgradeCard({ cardId }));

          // Trouver la carte pour obtenir son niveau actuel
          const card = state.bonusCards.collection.find((c) => c.id === cardId);
          const newLevel = card ? (card.level || 1) + 1 : 2;

          // Définir le résultat
          result.message = `Vous avez amélioré la carte au niveau ${newLevel}.`;
          result.effect = {
            type: 'upgrade',
            card: {
              id: cardId,
              level: newLevel,
            },
          };
          break;

        case 'remove_weakness':
          // Ajouter un buff pour la prochaine main
          result.message =
            'Vous méditez et vous sentez plus concentré pour le prochain combat.';
          result.effect = {
            type: 'buff',
            buff: {
              id: 'betterHand',
              duration: 1,
              description: 'Meilleures chances à la prochaine main',
            },
          };

          // Noter le buff (pour le moment, c'est juste visuel, nous n'implémentons pas la logique complète)
          dispatch(
            setActionFeedback({
              message: 'Vous êtes plus concentré pour le prochain combat',
              type: 'success',
            })
          );
          break;

        case 'shield':
          // Ajouter un bouclier
          const shieldAmount = 10;
          dispatch(addShield(shieldAmount));

          result.message = `Vous obtenez ${shieldAmount} points de bouclier.`;
          result.effect = {
            type: 'shield',
            value: shieldAmount,
          };
          break;

        default:
          return {
            success: false,
            message: 'Option de repos inconnue.',
          };
      }

      // Payer le coût en or si nécessaire
      if (option.goldCost && option.goldCost > 0) {
        dispatch(spendGold(option.goldCost));
      }

      // Ajouter un message au journal de combat si disponible
      if (state.combat.combatLog) {
        dispatch(addToCombatLog(result.message));
      }

      // Notification à l'utilisateur
      dispatch(
        setActionFeedback({
          message: result.message,
          type: 'success',
        })
      );

      return result;
    } catch (error) {
      console.error('Error applying rest option:', error);
      dispatch(
        setActionFeedback({
          message: "Erreur lors de l'application de l'option de repos",
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

// Action pour terminer le repos et revenir à l'exploration
export const completeRest = createAsyncThunk(
  'rest/completeRest',
  async (_, { dispatch }) => {
    try {
      // Revenir à l'exploration
      dispatch(setGamePhase('exploration'));

      return { success: true };
    } catch (error) {
      console.error('Error completing rest:', error);
      return { success: false, error: error.message };
    }
  }
);
