// src/redux/thunks/saveThunks.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import { setLoading, setError, setActionFeedback } from '../slices/uiSlice';
import {
  resetPlayer,
  LOAD_SAVED_DATA as LOAD_PLAYER_DATA,
} from '../slices/playerSlice';
import {
  resetGame,
  LOAD_SAVED_DATA as LOAD_GAME_DATA,
} from '../slices/gameSlice';
import { resetCombatState } from '../slices/combatSlice';
import {
  resetBonusCards,
  LOAD_SAVED_DATA as LOAD_BONUS_CARDS_DATA,
  initCollection
} from '../slices/bonusCardsSlice';
import { resetMap, LOAD_SAVED_DATA as LOAD_MAP_DATA } from '../slices/mapSlice';
import {
  resetShop,
  LOAD_SAVED_DATA as LOAD_SHOP_DATA,
} from '../slices/shopSlice';
import { resetUi } from '../slices/uiSlice';
import { resetAllEvents, LOAD_SAVED_DATA as LOAD_EVENT_DATA } from '../slices/eventSlice';
import { generateNewMap } from './mapThunks';

const SAVE_KEY = 'pokerSoloRpgSave';

export const saveGame = createAsyncThunk(
  'save/saveGame',
  async (_, { dispatch, getState }) => {
    try {
      dispatch(setLoading(true));

      const state = getState();

      const saveData = {
        version: '1.1',
        timestamp: Date.now(),
        player: { ...state.player },
        game: {
          stage: state.game.stage,
          currentFloor: state.game.currentFloor,
          maxFloors: state.game.maxFloors,
          gamePhase: state.game.gamePhase,
          stats: { ...state.game.stats },
        },
        map: {
          path: state.map.path,
          currentNodeId: state.map.currentNodeId,
        },
        bonusCards: {
          collection: state.bonusCards.collection?.map((card) => ({
            id: card.id,
            owned: card.owned !== false,
            level: card.level || 1,
          })) || [],
          active: state.bonusCards.active?.map((card) => ({
            id: card.id,
            usesRemaining: card.usesRemaining || 0,
          })) || [],
          maxSlots: state.bonusCards.maxSlots || 3,
        },
        shop: {
          itemsPurchased: state.shop.itemsPurchased || {},
        },
        event: {
          eventHistory: state.event.eventHistory || [],
        },
      };

      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));

      dispatch(setLoading(false));
      dispatch(
        setActionFeedback({
          message: 'Partie sauvegardée avec succès',
          type: 'success',
        })
      );

      return { success: true };
    } catch (error) {
      console.error('Error saving game:', error);

      dispatch(setLoading(false));
      dispatch(setError('Erreur lors de la sauvegarde'));
      dispatch(
        setActionFeedback({
          message: 'Erreur lors de la sauvegarde',
          type: 'error',
        })
      );

      return { success: false, error: error.message };
    }
  }
);

export const loadGame = createAsyncThunk(
  'save/loadGame',
  async (_, { dispatch }) => {
    try {
      dispatch(setLoading(true));

      const savedData = localStorage.getItem(SAVE_KEY);
      if (!savedData) {
        dispatch(
          setActionFeedback({
            message: 'Aucune sauvegarde trouvée',
            type: 'warning',
          })
        );
        dispatch(setLoading(false));
        
        // If no save exists, initialize a new game
        dispatch(initCollection());
        await dispatch(generateNewMap({ width: 3, depth: 5 }));
        
        return { success: false, reason: 'no_save' };
      }

      const saveData = JSON.parse(savedData);

      // Reset all states to avoid conflicts
      dispatch(resetPlayer());
      dispatch(resetCombatState());
      dispatch(resetBonusCards());
      dispatch(resetMap());
      dispatch(resetShop());
      dispatch(resetUi());
      dispatch(resetAllEvents());

      // Load data using LOAD_SAVED_DATA actions
      if (saveData.player) {
        dispatch(LOAD_PLAYER_DATA(saveData.player));
      }

      if (saveData.game) {
        dispatch(LOAD_GAME_DATA(saveData.game));
      }

      if (saveData.map && saveData.map.path && saveData.map.path.length > 0) {
        dispatch(LOAD_MAP_DATA(saveData.map));
      } else {
        console.log("Missing map in save data, generating new map");
        await dispatch(generateNewMap({ width: 3, depth: 5 }));
      }

      if (saveData.bonusCards) {
        dispatch(LOAD_BONUS_CARDS_DATA(saveData.bonusCards));
      } else {
        dispatch(initCollection());
      }

      if (saveData.shop) {
        dispatch(LOAD_SHOP_DATA(saveData.shop));
      }

      if (saveData.event) {
        dispatch(LOAD_EVENT_DATA(saveData.event));
      }

      dispatch(setLoading(false));
      dispatch(
        setActionFeedback({
          message: 'Partie chargée avec succès',
          type: 'success',
        })
      );

      return { success: true };
    } catch (error) {
      console.error('Error loading game:', error);

      dispatch(setLoading(false));
      dispatch(setError('Erreur lors du chargement'));
      dispatch(
        setActionFeedback({
          message: 'Erreur lors du chargement de la sauvegarde',
          type: 'error',
        })
      );

      // If error, initialize a new game
      dispatch(initCollection());
      await dispatch(generateNewMap({ width: 3, depth: 5 }));

      return { success: false, error: error.message };
    }
  }
);

export const deleteSave = createAsyncThunk(
  'save/deleteSave',
  async (_, { dispatch }) => {
    try {
      localStorage.removeItem(SAVE_KEY);

      dispatch(
        setActionFeedback({
          message: 'Sauvegarde supprimée',
          type: 'info',
        })
      );

      return { success: true };
    } catch (error) {
      console.error('Error deleting save:', error);

      dispatch(
        setActionFeedback({
          message: 'Erreur lors de la suppression de la sauvegarde',
          type: 'error',
        })
      );

      return { success: false, error: error.message };
    }
  }
);

export const resetEntireGame = createAsyncThunk(
  'save/resetEntireGame',
  async (_, { dispatch }) => {
    try {
      localStorage.removeItem(SAVE_KEY);

      dispatch(resetPlayer());
      dispatch(resetGame());
      dispatch(resetCombatState());
      dispatch(resetBonusCards());
      dispatch(resetMap());
      dispatch(resetShop());
      dispatch(resetUi());
      dispatch(resetAllEvents());

      dispatch(generateNewMap({ width: 3, depth: 5 }));
      dispatch(initCollection());

      dispatch(
        setActionFeedback({
          message: 'Jeu réinitialisé avec succès',
          type: 'success',
        })
      );

      return { success: true };
    } catch (error) {
      console.error('Error resetting game:', error);

      dispatch(
        setActionFeedback({
          message: 'Erreur lors de la réinitialisation du jeu',
          type: 'error',
        })
      );

      return { success: false, error: error.message };
    }
  }
);

export const hasSave = () => {
  return localStorage.getItem(SAVE_KEY) !== null;
};
