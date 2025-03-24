// src/redux/middleware/errorMiddleware.js - Enhanced error handling
import { setError, setActionFeedback } from '../slices/uiSlice';

/**
 * Middleware to catch and handle errors throughout the Redux system
 * Provides centralized error handling with feedback
 */
export const errorMiddleware = (store) => (next) => (action) => {
  try {
    // For async thunks that might fail
    if (action.type && action.type.endsWith('/rejected')) {
      const errorMessage = action.error?.message || 'Une erreur est survenue';

      // Log the error for debugging
      console.error(`Redux error in action ${action.type}:`, action.error);

      // Dispatch UI feedback actions
      store.dispatch(setError(errorMessage));
      store.dispatch(
        setActionFeedback({
          message: errorMessage,
          type: 'error',
          duration: 5000,
        })
      );
    }

    // Continue with normal action processing
    return next(action);
  } catch (error) {
    // Handle synchronous errors in reducers
    console.error('Caught an exception in reducer!', error);

    // Set application error state
    store.dispatch(setError(error.message || 'Une erreur est survenue'));

    // Provide user feedback
    store.dispatch(
      setActionFeedback({
        message: 'Une erreur inattendue est survenue',
        type: 'error',
        duration: 5000,
      })
    );

    return error;
  }
};

export default errorMiddleware;
