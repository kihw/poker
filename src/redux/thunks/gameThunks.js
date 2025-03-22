// src/redux/thunks/gameThunks.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  setGamePhase,
  incrementStage,
  incrementFloor,
} from '../slices/gameSlice';

// Thunk pour traiter le passage au niveau suivant
export const advanceToNextStage = createAsyncThunk(
  'game/advanceToNextStage',
  async (_, { dispatch, getState }) => {
    const state = getState();
    const currentFloor = state.game.currentFloor;
    const bossDefeated = state.game.bossDefeated;

    // Incrémenter l'étage
    dispatch(incrementStage());

    // Si le boss a été vaincu, passer à l'étage suivant
    if (bossDefeated) {
      dispatch(incrementFloor());
      // Générer une nouvelle carte pour le nouvel étage
      dispatch(
        generateNewMap({
          width: 3 + Math.min(2, Math.floor(currentFloor / 3)),
          depth: 5 + Math.min(3, Math.floor(currentFloor / 2)),
        })
      );
    }

    // Retourner à l'exploration
    dispatch(setGamePhase('exploration'));

    return { success: true };
  }
);
