// src/redux/slices/gameSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  stage: 1,
  currentFloor: 1,
  maxFloors: 10,
  gamePhase: 'exploration', // combat, reward, shop, rest, event, gameOver, exploration
  previousPhase: null,
  exploreEnabled: true,
  collectionAccessLevel: 'full', // 'full', 'readonly', 'disabled'
  shopAccessible: true,
  isGameOver: false,
  timestamp: Date.now(),
  tutorialStep: 0,
  showTutorial: true,
  stats: {
    enemiesDefeated: 0,
    totalDamageDealt: 0,
    highestDamage: 0,
    goldEarned: 0,
    cardsPlayed: 0,
  },
};

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    setGamePhase: (state, action) => {
      // Store previous phase before changing
      state.previousPhase = state.gamePhase;
      state.gamePhase = action.payload;

      // Update access levels based on game phase
      switch (action.payload) {
        case 'combat':
          state.exploreEnabled = false;
          state.collectionAccessLevel = 'readonly';
          state.shopAccessible = false;
          break;
        case 'exploration':
          state.exploreEnabled = true;
          state.collectionAccessLevel = 'full';
          state.shopAccessible = true;
          break;
        case 'gameOver':
          state.isGameOver = true;
          state.exploreEnabled = false;
          state.collectionAccessLevel = 'disabled';
          state.shopAccessible = false;
          break;
        default:
          // For shop, rest, event phases
          state.exploreEnabled = false;
          state.collectionAccessLevel = 'full';
          state.shopAccessible = false;
      }
    },
    // ... (other existing reducers)
  },
});

export const {
  setGamePhase,
  incrementStage,
  incrementFloor,
  updateStats,
  setTutorialStep,
  completeTutorial,
  resetGame,
  LOAD_SAVED_DATA, // Exporter la nouvelle action
} = gameSlice.actions;

export default gameSlice.reducer;
