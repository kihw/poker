// src/redux/thunks/eventThunks.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import { setActionFeedback } from '../slices/uiSlice';
import { setGamePhase } from '../slices/gameSlice';
import {
  addGold,
  heal,
  takeDamage,
  addExperience,
  addShield,
} from '../slices/playerSlice';
import { addCard } from '../slices/bonusCardsSlice';
import { addToCombatLog } from '../slices/combatSlice';
import {
  generateRandomEvent,
  processEventChoice,
} from '../../modules/event-system';

// Action pour créer un événement aléatoire
export const generateNewEvent = createAsyncThunk(
  'event/generateNewEvent',
  async (_, { dispatch, getState }) => {
    try {
      const state = getState();
      const stage = state.game.stage;

      // Générer un événement aléatoire basé sur le niveau actuel
      const newEvent = generateRandomEvent(stage);

      // Définir l'événement comme événement actuel
      dispatch({
        type: 'event/setCurrentEvent',
        payload: newEvent,
      });

      // Changer la phase du jeu
      dispatch(setGamePhase('event'));

      return newEvent;
    } catch (error) {
      console.error('Error generating event:', error);
      dispatch(
        setActionFeedback({
          message: "Erreur lors de la génération de l'événement",
          type: 'error',
        })
      );
      return null;
    }
  }
);

// Action pour gérer le choix de l'utilisateur dans un événement
export const makeEventChoice = createAsyncThunk(
  'event/makeChoice',
  async ({ choiceIndex }, { dispatch, getState }) => {
    try {
      const state = getState();
      const event = state.game.currentEvent;

      if (!event) {
        throw new Error('Aucun événement actif');
      }

      // Traiter le choix de l'utilisateur
      const result = processEventChoice(event, choiceIndex, {
        player: state.player,
        bonusCardSystem: {
          addBonusCardToCollection: (cardId) => dispatch(addCard(cardId)),
        },
      });

      // Appliquer les effets au joueur
      if (result.details) {
        // Gestion de l'or
        if (result.details.gold) {
          dispatch(addGold(result.details.gold));
        }

        // Gestion des soins
        if (result.details.healing && result.details.healing > 0) {
          dispatch(heal(result.details.healing));
        }

        // Gestion des dégâts
        if (result.details.healthCost && result.details.healthCost > 0) {
          dispatch(takeDamage(result.details.healthCost));
        }

        // Gestion des cartes bonus
        if (result.details.card && result.details.card.id) {
          dispatch(addCard(result.details.card.id));
        }

        // Gestion de l'expérience
        if (result.details.experience) {
          dispatch(addExperience(result.details.experience));
        }

        // Gestion du bouclier
        if (result.details.shield) {
          dispatch(addShield(result.details.shield));
        }
      }

      // Ajouter un message au journal de combat si disponible
      if (state.combat.combatLog) {
        dispatch(addToCombatLog(result.message));
      }

      // Notification à l'utilisateur
      dispatch(
        setActionFeedback({
          message: result.message,
          type: result.success ? 'success' : 'warning',
        })
      );

      // Sauvegarder le résultat de l'événement
      dispatch({
        type: 'event/setEventResult',
        payload: result,
      });

      return result;
    } catch (error) {
      console.error('Error processing event choice:', error);
      dispatch(
        setActionFeedback({
          message: "Erreur lors du traitement du choix d'événement",
          type: 'error',
        })
      );
      return { success: false, error: error.message };
    }
  }
);

// Action pour terminer un événement et revenir à l'exploration
export const completeEvent = createAsyncThunk(
  'event/completeEvent',
  async (_, { dispatch }) => {
    try {
      // Réinitialiser l'événement actuel
      dispatch({ type: 'event/setCurrentEvent', payload: null });
      dispatch({ type: 'event/setEventResult', payload: null });

      // Revenir à l'exploration
      dispatch(setGamePhase('exploration'));

      return { success: true };
    } catch (error) {
      console.error('Error completing event:', error);
      return { success: false, error: error.message };
    }
  }
);
