// src/redux/store.js - Fixed middleware configuration
import { configureStore } from '@reduxjs/toolkit';
import rootReducer from './rootReducer';
import bonusEffectsMiddleware from './middleware/bonusEffectsMiddleware';
import { errorMiddleware } from './middleware/errorMiddleware';

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignorer certaines actions non-sérialisables
        ignoredActions: [
          'save/saveGame',
          'bonusCards/useCard',
          'combat/attackEnemy/pending',
          'combat/processEnemyAttack/pending',
          'combat/checkCombatEnd/pending',
        ],
        // Ignorer certains chemins d'état non-sérialisables
        ignoredPaths: ['combat.enemyAnimation', 'bonusCards.active.bonus.effect'],
      },
    }).concat(errorMiddleware, bonusEffectsMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
