// src/redux/rootReducer.js - Combines all Redux slices
import { combineReducers } from '@reduxjs/toolkit';
import gameReducer from './slices/gameSlice';
import playerReducer from './slices/playerSlice';
import combatReducer from './slices/combatSlice';
import bonusCardsReducer from './slices/bonusCardsSlice';
import mapReducer from './slices/mapSlice';
import shopReducer from './slices/shopSlice';
import eventReducer from './slices/eventSlice';
import uiReducer from './slices/uiSlice';

const rootReducer = combineReducers({
  game: gameReducer,
  player: playerReducer,
  combat: combatReducer,
  bonusCards: bonusCardsReducer,
  map: mapReducer,
  shop: shopReducer,
  event: eventReducer,
  ui: uiReducer,
});

export default rootReducer;
