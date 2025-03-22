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
      state.health = Math.max(0, state.health - action.payload);
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
      state.experience = 0; // Ou réduire de l'XP nécessaire
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
      state.inventory = state.inventory.filter(
        (item, index) => index !== action.payload
      );
    },
    resetPlayer: () => initialState,
    // Ajouter le handler pour charger les données sauvegardées
    LOAD_SAVED_DATA: (state, action) => {
      // Récupérer les données du joueur depuis le payload
      const savedData = action.payload;

      // Appliquer toutes les propriétés sauvegardées
      if (savedData) {
        Object.keys(savedData).forEach((key) => {
          // Ne copier que les propriétés qui existent dans l'état
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
  LOAD_SAVED_DATA, // Exporter la nouvelle action
} = playerSlice.actions;

export default playerSlice.reducer;
