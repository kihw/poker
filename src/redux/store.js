// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';
import bonusEffectsMiddleware from './middleware/bonusEffectsMiddleware';

import { errorMiddleware } from './middlewares/errorMiddleware';

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignorer certaines actions non-sérialisables
        ignoredActions: ['save/saveGame'],
        // Ignorer certains chemins d'état non-sérialisables
        ignoredPaths: ['combat.enemyAnimation'],
      },
    }).concat(errorMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
