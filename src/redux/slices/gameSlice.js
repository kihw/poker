// src/redux/slices/gameSlice.js - Amélioration de la gestion des restrictions d'accès

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  stage: 1,
  currentFloor: 1,
  maxFloors: 10,
  gamePhase: 'exploration',
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
      state.previousPhase = state.gamePhase;
      state.gamePhase = action.payload;

      // Configurer les restrictions d'accès en fonction de la phase
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
        case 'shop':
          state.exploreEnabled = false;
          state.collectionAccessLevel = 'full';
          state.shopAccessible = true;
          break;
        case 'rest':
          state.exploreEnabled = false;
          state.collectionAccessLevel = 'full';
          state.shopAccessible = false;
          break;
        case 'event':
          state.exploreEnabled = false;
          state.collectionAccessLevel = 'full';
          state.shopAccessible = false;
          break;
        default:
          state.exploreEnabled = true;
          state.collectionAccessLevel = 'full';
          state.shopAccessible = true;
      }
    },
    incrementStage: (state) => {
      state.stage += 1;
    },
    incrementFloor: (state) => {
      state.currentFloor += 1;
    },
    updateStats: (state, action) => {
      const { type, value } = action.payload;
      if (type in state.stats) {
        state.stats[type] += value;
      }
    },
    setTutorialStep: (state, action) => {
      state.tutorialStep = action.payload;
    },
    completeTutorial: (state) => {
      state.showTutorial = false;
    },
    resetGame: () => initialState,

    // Action for setting access levels directly
    setAccessLevels: (state, action) => {
      const { exploreEnabled, collectionAccessLevel, shopAccessible } = action.payload;

      if (exploreEnabled !== undefined) {
        state.exploreEnabled = exploreEnabled;
      }

      if (collectionAccessLevel) {
        state.collectionAccessLevel = collectionAccessLevel;
      }

      if (shopAccessible !== undefined) {
        state.shopAccessible = shopAccessible;
      }
    },

    // Action to load saved data
    LOAD_SAVED_DATA: (state, action) => {
      const savedData = action.payload || {};

      // Merge saved data with existing state, prioritizing saved data
      Object.keys(savedData).forEach((key) => {
        if (key in state) {
          state[key] = savedData[key];
        }
      });

      // Make sure the access levels are properly set based on loaded gamePhase
      // This ensures consistency in case saved access levels are out of sync
      if (savedData.gamePhase) {
        switch (savedData.gamePhase) {
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
          case 'shop':
            state.exploreEnabled = false;
            state.collectionAccessLevel = 'full';
            state.shopAccessible = true;
            break;
          case 'rest':
          case 'event':
            state.exploreEnabled = false;
            state.collectionAccessLevel = 'full';
            state.shopAccessible = false;
            break;
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
  setAccessLevels,
  resetGame,
  LOAD_SAVED_DATA,
} = gameSlice.actions;

export default gameSlice.reducer;
