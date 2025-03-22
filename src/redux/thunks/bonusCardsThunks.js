// src/redux/thunks/bonusCardsThunks.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import { ALL_BONUS_CARDS } from '../../data/bonus-cards';

import { spendGold } from '../slices/playerSlice';
import { updateStats } from '../slices/gameSlice';

import {
  addCard,
  equipCard,
  unequipCard,
  upgradeCard,
  resetCardUses,
} from '../slices/bonusCardsSlice';
import { setActionFeedback } from '../slices/uiSlice';

/**
 * Thunk pour initialiser la collection de cartes bonus
 */
export const initBonusCardCollection = createAsyncThunk(
  'bonusCards/initCollection',
  async (_, { dispatch }) => {
    try {
      // Dispatch l'action d'initialisation de la collection
      dispatch({ type: 'bonusCards/initCollection' });

      return { success: true };
    } catch (error) {
      console.error('Error initializing bonus card collection:', error);
      dispatch(
        setActionFeedback({
          message: "Erreur lors de l'initialisation des cartes bonus",
          type: 'error',
        })
      );
      return { success: false, error: error.message };
    }
  }
);

/**
 * Thunk pour générer une carte bonus de récompense
 */

/**
 * Thunk pour ajouter une carte bonus à la collection
 */
export const generateBonusCardReward = createAsyncThunk(
  'bonusCards/generateReward',
  async (_, { dispatch, getState }) => {
    try {
      const state = getState();
      const stage = state.game.stage;
      const stageMultiplier = Math.min(stage / 10, 1);
      const collection = state.bonusCards.collection;

      // Vérifier si la carte existe déjà dans la collection
      const cardExists = collection.some((card) => card.id === cardId);

      if (cardExists) {
        dispatch(
          setActionFeedback({
            message: 'Cette carte est déjà dans votre collection',
            type: 'info',
          })
        );
        return { success: false, reason: 'already_owned' };
      }

      // Vérifier si la carte existe dans la liste complète
      const cardTemplate = ALL_BONUS_CARDS.find((card) => card.id === cardId);
      if (!cardTemplate) {
        dispatch(
          setActionFeedback({
            message: 'Carte non valide',
            type: 'error',
          })
        );
        return { success: false, reason: 'invalid_card' };
      }

      // Ajouter la carte à la collection
      dispatch(addCard(cardId));

      // Notification visuelle
      dispatch(
        setActionFeedback({
          message: `Nouvelle carte obtenue: ${cardTemplate.name}!`,
          type: 'success',
          duration: 3000,
        })
      );

      // Mettre à jour les statistiques
      dispatch(updateStats({ type: 'bonusCardsCollected', value: 1 }));

      return cardId; // ID de la carte générée
    } catch (error) {
      console.error('Error generating bonus card reward:', error);
      return null;
    }
  }
);

/**
 * Thunk pour améliorer une carte bonus
 */
export const upgradeBonusCard = createAsyncThunk(
  'bonusCards/upgrade',
  async ({ cardId, goldCost = 50 }, { dispatch, getState }) => {
    try {
      const state = getState();
      const card = state.bonusCards.collection.find((c) => c.id === cardId);

      if (!card) {
        dispatch(
          setActionFeedback({
            message: 'Carte non trouvée',
            type: 'error',
          })
        );
        return { success: false, reason: 'card_not_found' };
      }

      // Vérifier si la carte peut être améliorée (max niveau 3)
      if (card.level && card.level >= 3) {
        dispatch(
          setActionFeedback({
            message: 'Cette carte est déjà au niveau maximum',
            type: 'info',
          })
        );
        return { success: false, reason: 'max_level' };
      }

      // Vérifier si le joueur a assez d'or
      if (state.player.gold < goldCost) {
        dispatch(
          setActionFeedback({
            message: "Pas assez d'or pour améliorer cette carte",
            type: 'warning',
          })
        );
        return { success: false, reason: 'not_enough_gold' };
      }

      // Dépenser l'or
      dispatch(spendGold(goldCost));

      // Améliorer la carte
      dispatch(upgradeCard({ cardId }));

      // Notification visuelle
      const newLevel = (card.level || 1) + 1;
      dispatch(
        setActionFeedback({
          message: `${card.name} améliorée au niveau ${newLevel}!`,
          type: 'success',
          duration: 3000,
        })
      );

      return {
        success: true,
        card: {
          ...card,
          level: newLevel,
        },
      };
    } catch (error) {
      console.error('Error upgrading bonus card:', error);
      dispatch(
        setActionFeedback({
          message: "Erreur lors de l'amélioration de la carte",
          type: 'error',
        })
      );
      return { success: false, error: error.message };
    }
  }
);

/**
 * Thunk pour appliquer l'effet d'une carte bonus sur une main
 * @param {Object} handResult - Résultat de l'évaluation d'une main
 * @returns {Object} - Résultat modifié avec les bonus appliqués
 */
export const applyBonusCardEffects = createAsyncThunk(
  'bonusCards/applyEffects',
  async (handResult, { getState }) => {
    try {
      const state = getState();
      const activeBonusCards = state.bonusCards.active;
      const combatState = state.combat;

      // Valeurs par défaut
      const result = {
        ...handResult,
        totalDamage: handResult.baseDamage,
        bonusEffects: [],
      };

      // Appliquer le bonus de dégâts en attente
      if (combatState.pendingDamageBonus) {
        result.totalDamage += combatState.pendingDamageBonus;
        result.bonusEffects.push(
          `Bonus de dégâts: +${combatState.pendingDamageBonus}`
        );
      }

      // Appliquer le multiplicateur de dégâts en attente
      if (combatState.pendingDamageMultiplier > 1) {
        const baseValue = result.totalDamage;
        result.totalDamage = Math.floor(
          result.totalDamage * combatState.pendingDamageMultiplier
        );
        result.bonusEffects.push(
          `Multiplicateur: ×${combatState.pendingDamageMultiplier} (${baseValue} → ${result.totalDamage})`
        );
      }

      // Appliquer les effets des cartes bonus actives
      for (const card of activeBonusCards) {
        if (card.effect === 'passive') {
          // Bonus pour certains types de mains
          if (
            card.condition === handResult.handName &&
            card.bonus?.type === 'damage'
          ) {
            result.totalDamage += card.bonus.value;
            result.bonusEffects.push(
              `${card.name} added ${card.bonus.value} damage`
            );
          }
          // Bonus constant
          else if (
            card.condition === 'always' &&
            card.bonus?.type === 'damage'
          ) {
            result.totalDamage += card.bonus.value;
            result.bonusEffects.push(
              `${card.name} added ${card.bonus.value} damage`
            );
          }
          // Bonus après avoir subi des dégâts
          else if (
            card.condition === 'damageTaken' &&
            combatState.playerDamagedLastTurn &&
            card.bonus?.type === 'damage'
          ) {
            result.totalDamage += card.bonus.value;
            result.bonusEffects.push(
              `${card.name} added ${card.bonus.value} damage (after taking damage)`
            );
          }
          // Bonus en cas de PV bas
          else if (
            card.condition === 'lowHealth' &&
            state.player.health <= state.player.maxHealth * 0.25 &&
            card.bonus?.type === 'damageMultiplier'
          ) {
            const beforeMultiplier = result.totalDamage;
            result.totalDamage = Math.floor(
              result.totalDamage * card.bonus.value
            );
            result.bonusEffects.push(
              `${card.name} multiplied damage by ${card.bonus.value} (${beforeMultiplier} → ${result.totalDamage})`
            );
          }
        }
      }

      return result;
    } catch (error) {
      console.error('Error applying bonus card effects:', error);
      return {
        ...handResult,
        totalDamage: handResult.baseDamage,
        bonusEffects: [],
      };
    }
  }
);

/**
 * Thunk pour utiliser une carte bonus active
 */
export const useBonusCard = createAsyncThunk(
  'bonusCards/useCard',
  async (index, { dispatch, getState }) => {
    try {
      const state = getState();
      const bonusCards = state.bonusCards.active;

      if (index < 0 || index >= bonusCards.length) {
        dispatch(
          setActionFeedback({
            message: 'Carte bonus invalide',
            type: 'error',
          })
        );
        return { success: false, reason: 'invalid_index' };
      }

      const bonusCard = bonusCards[index];

      // Vérifier que la carte est active et a des utilisations restantes
      if (bonusCard.effect !== 'active') {
        dispatch(
          setActionFeedback({
            message: 'Cette carte a un effet passif',
            type: 'info',
          })
        );
        return { success: false, reason: 'passive_card' };
      }

      if (bonusCard.usesRemaining <= 0) {
        dispatch(
          setActionFeedback({
            message: 'Cette carte a déjà été utilisée',
            type: 'warning',
          })
        );
        return { success: false, reason: 'no_uses_remaining' };
      }

      // Vérifier que la carte a un bonus valide
      if (!bonusCard.bonus) {
        dispatch(
          setActionFeedback({
            message: 'Carte bonus mal configurée',
            type: 'error',
          })
        );
        return { success: false, reason: 'invalid_bonus' };
      }

      // Utiliser la carte
      dispatch(useCard(index));

      // Appliquer l'effet selon le type de carte
      let result = {
        success: true,
        message: `${bonusCard.name} utilisée`,
      };

      switch (bonusCard.bonus.type) {
        case 'damage':
          // Ajouter des dégâts pour la prochaine attaque
          dispatch({
            type: 'combat/setPendingDamageBonus',
            payload: bonusCard.bonus.value,
          });

          result.message = `Ajouté ${bonusCard.bonus.value} dégâts à votre prochaine attaque`;
          break;

        case 'damageMultiplier':
          // Multiplier les dégâts de la prochaine attaque
          dispatch({
            type: 'combat/setPendingDamageMultiplier',
            payload: bonusCard.bonus.value,
          });

          result.message = `Votre prochaine attaque infligera ${bonusCard.bonus.value}x dégâts`;
          break;

        case 'heal':
          // Soin
          dispatch({
            type: 'player/heal',
            payload: bonusCard.bonus.value,
          });

          result.message = `Récupéré ${bonusCard.bonus.value} PV`;
          break;

        case 'shield':
          // Bouclier
          dispatch({
            type: 'player/addShield',
            payload: bonusCard.bonus.value,
          });

          result.message = `Gagné ${bonusCard.bonus.value} points de bouclier`;
          break;

        case 'discard':
          // Permettre de défausser plus de cartes
          dispatch({
            type: 'combat/setDiscardLimit',
            payload: bonusCard.bonus.value,
          });
          dispatch({
            type: 'combat/toggleDiscardMode',
          });

          result.message = `Vous pouvez maintenant défausser jusqu'à ${bonusCard.bonus.value} cartes`;
          break;

        case 'invulnerable':
          // Invulnérable au prochain tour
          dispatch({
            type: 'combat/setInvulnerableNextTurn',
            payload: true,
          });

          result.message = `Vous serez invulnérable à la prochaine attaque ennemie`;
          break;

        default:
          result.success = false;
          result.message = 'Effet de carte bonus inconnu';
          break;
      }

      // Notification visuelle
      dispatch(
        setActionFeedback({
          message: result.message,
          type: 'success',
          duration: 2000,
        })
      );

      // Ajouter au journal de combat si disponible
      dispatch({
        type: 'combat/addToCombatLog',
        payload: result.message,
      });

      // Mettre à jour les statistiques
      dispatch(updateStats({ type: 'bonusCardsUsed', value: 1 }));

      return result;
    } catch (error) {
      console.error('Error using bonus card:', error);
      dispatch(
        setActionFeedback({
          message: "Erreur lors de l'utilisation de la carte bonus",
          type: 'error',
        })
      );
      return { success: false, error: error.message };
    }
  }
);
