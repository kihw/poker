// src/redux/middlewares/errorMiddleware.js
export const errorMiddleware = (store) => (next) => (action) => {
  try {
    return next(action);
  } catch (error) {
    console.error('Caught an exception in reducer!', error);
    store.dispatch({
      type: 'ui/setError',
      payload: error.message || 'Une erreur est survenue',
    });
    store.dispatch({
      type: 'ui/setActionFeedback',
      payload: {
        message: 'Une erreur inattendue est survenue',
        type: 'error',
        duration: 5000,
      },
    });
    return error;
  }
};

// Ajoutez ce middleware dans src/redux/store.js
