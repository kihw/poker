// src/redux/slices/mapSlice.js
import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  path: [],
  currentNodeId: null,
  isGenerating: false,
  error: null,
};

const mapSlice = createSlice({
  name: 'map',
  initialState,
  reducers: {
    setPath: (state, action) => {
      state.path = action.payload;
    },
    selectNode: (state, action) => {
      state.currentNodeId = action.payload;
    },
    startGeneratingMap: (state) => {
      state.isGenerating = true;
      state.error = null;
    },
    mapGenerationSuccess: (state, action) => {
      state.path = action.payload;
      state.isGenerating = false;
      state.error = null;

      // Trouver le nœud de départ et le définir comme nœud actuel
      const startNode = action.payload.find((node) => node.type === 'start');
      if (startNode) {
        state.currentNodeId = startNode.id;
      }
    },
    mapGenerationFailure: (state, action) => {
      state.isGenerating = false;
      state.error = action.payload;
    },
    resetMap: () => initialState,
    // Ajouter le handler pour charger les données sauvegardées
    LOAD_SAVED_DATA: (state, action) => {
      const savedData = action.payload;

      if (savedData) {
        // Charger le chemin s'il existe
        if (savedData.path && Array.isArray(savedData.path)) {
          state.path = savedData.path;
        }

        // Charger le nœud actuel
        if (savedData.currentNodeId) {
          state.currentNodeId = savedData.currentNodeId;
        }

        // Réinitialiser l'état d'erreur
        state.isGenerating = false;
        state.error = null;
      }
    },
  },
});

export const {
  setPath,
  selectNode,
  startGeneratingMap,
  mapGenerationSuccess,
  mapGenerationFailure,
  resetMap,
  LOAD_SAVED_DATA, // Exporter la nouvelle action
} = mapSlice.actions;

export default mapSlice.reducer;
