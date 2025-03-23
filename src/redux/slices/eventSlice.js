// src/redux/slices/eventSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentEvent: null,
  eventResult: null,
  eventHistory: [], // Historique des événements rencontrés
  loading: false,
  error: null,
};

const eventSlice = createSlice({
  name: 'event',
  initialState,
  reducers: {
    setCurrentEvent: (state, action) => {
      state.currentEvent = action.payload;

      // Si on définit un nouvel événement, le stocker dans l'historique
      if (action.payload) {
        state.eventHistory.push({
          id: action.payload.id || action.payload.uniqueId,
          title: action.payload.title,
          timestamp: Date.now(),
        });

        // Limiter la taille de l'historique
        if (state.eventHistory.length > 10) {
          state.eventHistory.shift();
        }
      }
    },
    setEventResult: (state, action) => {
      state.eventResult = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    resetEvent: (state) => {
      state.currentEvent = null;
      state.eventResult = null;
      state.loading = false;
      state.error = null;
    },
    resetAllEvents: () => initialState,

    // Reducer for loading saved data
    LOAD_SAVED_DATA: (state, action) => {
      const savedData = action.payload;
      if (savedData && savedData.eventHistory) {
        state.eventHistory = savedData.eventHistory;
      }
    },
  },
});

export const {
  setCurrentEvent,
  setEventResult,
  setLoading,
  setError,
  resetEvent,
  resetAllEvents,
  LOAD_SAVED_DATA,
} = eventSlice.actions;

export default eventSlice.reducer;
