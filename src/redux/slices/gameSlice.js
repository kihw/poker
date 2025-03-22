// src/redux/slices/gameSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  stage: 1,
  currentFloor: 1,
  maxFloors: 10,
  gamePhase: 'exploration', // combat, reward, shop, rest, event, gameOver, exploration
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
      state.gamePhase = action.payload;
      // Gérer les transitions de phase ici
      if (action.payload === 'gameOver') {
        state.isGameOver = true;
      }
    },
    incrementStage: (state) => {
      state.stage += 1;
    },
    incrementFloor: (state) => {
      state.currentFloor += 1;
      if (state.currentFloor > state.maxFloors) {
        state.currentFloor = state.maxFloors;
      }
    },
    updateStats: (state, action) => {
      const { type, value } = action.payload;
      if (state.stats[type] !== undefined) {
        state.stats[type] += value;
      }
    },
    setTutorialStep: (state, action) => {
      state.tutorialStep = action.payload;
    },
    completeTutorial: (state) => {
      state.showTutorial = false;
      localStorage.setItem('tutorialCompleted', 'true');
    },
    resetGame: () => initialState,
    // Ajouter le handler pour charger les données sauvegardées
    LOAD_SAVED_DATA: (state, action) => {
      const savedData = action.payload;

      if (savedData) {
        // Mettre à jour les propriétés de base
        if (savedData.stage) state.stage = savedData.stage;
        if (savedData.currentFloor) state.currentFloor = savedData.currentFloor;
        if (savedData.maxFloors) state.maxFloors = savedData.maxFloors;
        if (savedData.gamePhase) state.gamePhase = savedData.gamePhase;
        state.timestamp = Date.now(); // Toujours utiliser la date actuelle

        // Mettre à jour les statistiques si elles existent
        if (savedData.stats) {
          Object.keys(savedData.stats).forEach((statKey) => {
            if (state.stats.hasOwnProperty(statKey)) {
              state.stats[statKey] = savedData.stats[statKey];
            }
          });
        }
      }
    },
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
