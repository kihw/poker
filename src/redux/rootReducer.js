// src/redux/rootReducer.js
import { combineReducers } from '@reduxjs/toolkit';
import gameReducer from './slices/gameSlice';
import playerReducer from './slices/playerSlice';
import combatReducer from './slices/combatSlice';
import bonusCardsReducer from './slices/bonusCardsSlice';
import mapReducer from './slices/mapSlice';
import shopReducer from './slices/shopSlice';
import uiReducer from './slices/uiSlice';

const rootReducer = combineReducers({
  game: gameReducer,
  player: playerReducer,
  combat: combatReducer,
  bonusCards: bonusCardsReducer,
  map: mapReducer,
  shop: shopReducer,
  ui: uiReducer,
});

export default rootReducer;
