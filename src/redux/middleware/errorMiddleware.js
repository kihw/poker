// src/redux/middleware/errorMiddleware.js
import { setError, setActionFeedback } from '../slices/uiSlice';

export const errorMiddleware = (store) => (next) => (action) => {
  try {
    return next(action);
  } catch (error) {
    console.error('Caught an exception in reducer!', error);
    store.dispatch(setError(error.message || 'Une erreur est survenue'));
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
