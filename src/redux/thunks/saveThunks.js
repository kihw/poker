// src/redux/thunks/saveThunks.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import { setLoading, setError, setActionFeedback } from '../slices/uiSlice';
import { resetPlayer, LOAD_SAVED_DATA as LOAD_PLAYER_DATA } from '../slices/playerSlice';
import { resetGame, LOAD_SAVED_DATA as LOAD_GAME_DATA } from '../slices/gameSlice';
import { resetCombatState } from '../slices/combatSlice';
import {
  resetBonusCards,
  LOAD_SAVED_DATA as LOAD_BONUS_CARDS_DATA,
  initCollection,
} from '../slices/bonusCardsSlice';
import { resetMap, LOAD_SAVED_DATA as LOAD_MAP_DATA } from '../slices/mapSlice';
import { resetShop, LOAD_SAVED_DATA as LOAD_SHOP_DATA } from '../slices/shopSlice';
import { resetUi } from '../slices/uiSlice';
import { resetAllEvents, LOAD_SAVED_DATA as LOAD_EVENT_DATA } from '../slices/eventSlice';
import { generateNewMap } from './mapThunks';

const SAVE_KEY = 'pokerSoloRpgSave';

export const loadGame = createAsyncThunk('save/loadGame', async (_, { dispatch }) => {
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

      // Initialize a new game if no save exists
      dispatch(initCollection());
      await dispatch(generateNewMap({ width: 3, depth: 5 }));

      return { success: false, reason: 'no_save' };
    }

    const saveData = JSON.parse(savedData);

    // Reset all states first
    dispatch(resetPlayer());
    dispatch(resetCombatState());
    dispatch(resetBonusCards());
    dispatch(resetMap());
    dispatch(resetShop());
    dispatch(resetUi());
    dispatch(resetAllEvents());
    dispatch(resetGame());

    // Load each slice's saved data
    if (saveData.player) {
      dispatch(LOAD_PLAYER_DATA(saveData.player));
    }

    if (saveData.game) {
      dispatch(LOAD_GAME_DATA(saveData.game));
    }

    if (saveData.map && saveData.map.path && saveData.map.path.length) {
      dispatch(LOAD_MAP_DATA(saveData.map));
    } else {
      // Generate a new map if no map in save
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

    // Initialize a new game in case of loading error
    dispatch(initCollection());
    await dispatch(generateNewMap({ width: 3, depth: 5 }));

    return { success: false, error: error.message };
  }
});

// Other save-related thunks remain the same
// ...
