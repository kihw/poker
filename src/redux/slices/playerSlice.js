// src/redux/slices/playerSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  health: 50,
  maxHealth: 50,
  gold: 100,
  level: 1,
  experience: 0,
  shield: 0,
  inventory: [],
};

const playerSlice = createSlice({
  name: 'player',
  initialState,
  reducers: {
    takeDamage: (state, action) => {
      const damageAmount = action.payload;
      let remainingDamage = damageAmount;

      // Apply shield damage first
      if (state.shield > 0) {
        if (state.shield >= remainingDamage) {
          state.shield -= remainingDamage;
          remainingDamage = 0;
        } else {
          remainingDamage -= state.shield;
          state.shield = 0;
        }
      }

      // Apply remaining damage to health
      if (remainingDamage > 0) {
        state.health = Math.max(0, state.health - remainingDamage);
      }
    },
    heal: (state, action) => {
      state.health = Math.min(state.maxHealth, state.health + action.payload);
    },
    addGold: (state, action) => {
      state.gold += action.payload;
    },
    spendGold: (state, action) => {
      state.gold = Math.max(0, state.gold - action.payload);
    },
    addExperience: (state, action) => {
      state.experience += action.payload;
    },
    levelUp: (state) => {
      state.level += 1;
      state.maxHealth += 10;
      state.health += 10;
      state.experience = 0; // Reset experience for next level
    },
    addShield: (state, action) => {
      state.shield += action.payload;
    },
    removeShield: (state, action) => {
      state.shield = Math.max(0, state.shield - action.payload);
    },
    addToInventory: (state, action) => {
      state.inventory.push(action.payload);
    },
    removeFromInventory: (state, action) => {
      state.inventory = state.inventory.filter((item, index) => index !== action.payload);
    },
    resetPlayer: () => initialState,
    // Action to load saved data
    LOAD_SAVED_DATA: (state, action) => {
      // Get player data from payload
      const savedData = action.payload;

      // Apply all saved properties
      if (savedData) {
        Object.keys(savedData).forEach((key) => {
          // Only copy properties that exist in state
          if (state.hasOwnProperty(key)) {
            state[key] = savedData[key];
          }
        });
      }
    },
  },
});

export const {
  takeDamage,
  heal,
  addGold,
  spendGold,
  addExperience,
  levelUp,
  addShield,
  removeShield,
  addToInventory,
  removeFromInventory,
  resetPlayer,
  LOAD_SAVED_DATA,
} = playerSlice.actions;

export default playerSlice.reducer;
