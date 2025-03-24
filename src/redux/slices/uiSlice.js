// src/redux/slices/uiSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  actionFeedback: null,
  loading: false,
  error: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActionFeedback: (state, action) => {
      state.actionFeedback = {
        message: action.payload.message,
        type: action.payload.type || 'info',
        timestamp: Date.now(),
        duration: action.payload.duration || 2000,
      };
    },
    clearActionFeedback: (state) => {
      state.actionFeedback = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetUi: () => initialState,
  },
});

export const { setActionFeedback, clearActionFeedback, setLoading, setError, clearError, resetUi } =
  uiSlice.actions;

export default uiSlice.reducer;
