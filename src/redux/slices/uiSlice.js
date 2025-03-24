// src/redux/slices/uiSlice.js - Enhanced with better state management
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  actionFeedback: null,
  loading: false,
  error: null,
  modals: {
    save: false,
    settings: false,
    tutorial: false,
  },
  notifications: [],
};

/**
 * UI Slice for managing global UI state
 * - Loading indicators
 * - Error messages
 * - Feedback messages and notifications
 * - Modal visibility
 */
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Feedback message handling
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

    // Loading state management
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    // Error handling
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },

    // Modal management
    showModal: (state, action) => {
      const modalName = action.payload;
      if (modalName in state.modals) {
        state.modals[modalName] = true;
      }
    },
    hideModal: (state, action) => {
      const modalName = action.payload;
      if (modalName in state.modals) {
        state.modals[modalName] = false;
      }
    },

    // Notification management
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        message: action.payload.message,
        type: action.payload.type || 'info',
        duration: action.payload.duration || 5000,
        timestamp: Date.now(),
      });

      // Limit the number of notifications to prevent memory issues
      if (state.notifications.length > 10) {
        state.notifications.shift();
      }
    },
    removeNotification: (state, action) => {
      const notificationId = action.payload;
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== notificationId
      );
    },
    clearAllNotifications: (state) => {
      state.notifications = [];
    },

    // Reset all UI state
    resetUi: () => initialState,
  },

  // Handle loading states from async actions
  extraReducers: (builder) => {
    builder
      // Set loading true for any pending action
      .addMatcher(
        (action) => action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
        }
      )
      // Set loading false for any fulfilled action
      .addMatcher(
        (action) => action.type.endsWith('/fulfilled'),
        (state) => {
          state.loading = false;
        }
      )
      // Set loading false for any rejected action
      .addMatcher(
        (action) => action.type.endsWith('/rejected'),
        (state) => {
          state.loading = false;
        }
      );
  },
});

export const {
  setActionFeedback,
  clearActionFeedback,
  setLoading,
  setError,
  clearError,
  showModal,
  hideModal,
  addNotification,
  removeNotification,
  clearAllNotifications,
  resetUi,
} = uiSlice.actions;

export default uiSlice.reducer;
