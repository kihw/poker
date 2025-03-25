// src/redux/store.js - Mise à jour pour inclure les nouveaux middlewares
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
          'bonusCards/evaluateDeck/pending',
          'bonusCards/resetDeckEffects/pending',
        ],
        // Ignorer certains chemins d'état non-sérialisables
        ignoredPaths: [
          'combat.enemyAnimation',
          'bonusCards.active.bonus.effect',
          'bonusCards.deckCombination.effect',
        ],
      },
    }).concat(errorMiddleware, bonusEffectsMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
});

export default store;
