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
import {
  setCurrentEvent,
  setEventResult,
  setLoading,
  resetEvent,
} from '../slices/eventSlice';
import { fetchData } from '../../utils/apiUtils';

// Action pour créer un événement aléatoire
export const generateNewEvent = createAsyncThunk(
  'event/generateNewEvent',
  async (_, { dispatch, getState }) => {
    dispatch(setLoading(true));

    try {
      const state = getState();
      const stage = state.game.stage;

      // Utilisation de l'utilitaire fetchData pour générer un événement avec gestion d'erreurs
      const newEvent = await fetchData(
        () => generateRandomEvent(stage),
        {
          errorMessage: "Erreur lors de la génération de l'événement",
          successMessage: 'Nouvel événement découvert !',
        },
        dispatch
      );

      // Définir l'événement comme événement actuel
      dispatch(setCurrentEvent(newEvent));

      // Changer la phase du jeu
      dispatch(setGamePhase('event'));

      dispatch(setLoading(false));
      return newEvent;
    } catch (error) {
      console.error('Error generating event:', error);
      dispatch(setLoading(false));
      
      // Redirection vers exploration en cas d'erreur grave
      dispatch(setGamePhase('exploration'));
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
      // Récupérer l'événement directement depuis le state
      const event = state.event.currentEvent;

      if (!event) {
        throw new Error('Aucun événement actif');
      }

      // Utilisation de l'utilitaire fetchData pour traiter le choix
      const result = await fetchData(
        () => processEventChoice(event, choiceIndex, {
          player: state.player,
          bonusCardSystem: {
            addBonusCardToCollection: (cardId) => dispatch(addCard(cardId)),
          },
        }),
        {
          errorMessage: "Erreur lors du traitement du choix",
        },
        dispatch
      );

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
      dispatch(setEventResult(result));

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
      dispatch(resetEvent());

      // Revenir à l'exploration
      dispatch(setGamePhase('exploration'));

      return { success: true };
    } catch (error) {
      console.error('Error completing event:', error);
      // Malgré l'erreur, on essaie quand même de revenir à l'exploration
      dispatch(setGamePhase('exploration'));
      
      dispatch(
        setActionFeedback({
          message: "Erreur lors de la fin de l'événement",
          type: 'error',
        })
      );
      
      return { success: false, error: error.message };
    }
  }
);
