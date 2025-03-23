// src/redux/thunks/mapThunks.js
import { createAsyncThunk } from '@reduxjs/toolkit';
import { generateRoguelikeMap, validateMap } from '../../modules/map-generator';
import {
  startGeneratingMap,
  mapGenerationSuccess,
  mapGenerationFailure,
  selectNode,
} from '../slices/mapSlice';
import { setGamePhase } from '../slices/gameSlice';
import { setActionFeedback } from '../slices/uiSlice';
import { startNewCombat } from './combatThunks';

// Thunk pour générer une nouvelle carte
export const generateNewMap = createAsyncThunk(
  'map/generateNewMap',
  async ({ width, depth }, { dispatch, getState }) => {
    try {
      // Indiquer que la génération de carte commence
      dispatch(startGeneratingMap());

      const state = getState();
      const stage = state.game.stage || 1;

      // Déterminer les dimensions de la carte en fonction du niveau
      const mapWidth = width || Math.min(3 + Math.floor(stage / 3), 6);
      const mapDepth = depth || Math.min(5 + Math.floor(stage / 2), 8);

      // Générer la carte (avec un délai simulé pour montrer le chargement)
      await new Promise((resolve) => setTimeout(resolve, 500));
      const nodes = generateRoguelikeMap(stage, mapWidth, mapDepth);

      // Valider la carte
      if (!validateMap(nodes)) {
        throw new Error('Carte générée invalide');
      }

      // Mettre à jour l'état avec la nouvelle carte
      dispatch(mapGenerationSuccess(nodes));

      // Feedback pour l'utilisateur
      dispatch(
        setActionFeedback({
          message: 'Carte générée avec succès',
          type: 'success',
        })
      );

      return nodes;
    } catch (error) {
      console.error('Error generating map:', error);

      // Mettre à jour l'état avec l'erreur
      dispatch(mapGenerationFailure(error.message));

      // Feedback pour l'utilisateur
      dispatch(
        setActionFeedback({
          message: 'Erreur lors de la génération de la carte',
          type: 'error',
        })
      );

      return null;
    }
  }
);

// Fonction utilitaire pour vérifier si un nœud est accessible
function isNodeAccessible(currentNodeId, targetNodeId, nodes) {
  // Si pas de nœud actuel (début de jeu), seul le nœud de départ est accessible
  if (!currentNodeId) {
    const startNode = nodes.find((node) => node.type === 'start');
    return startNode && startNode.id === targetNodeId;
  }

  // Trouver le nœud actuel
  const currentNode = nodes.find((node) => node.id === currentNodeId);

  // Un nœud est accessible s'il est un enfant du nœud actuel
  return (
    currentNode &&
    currentNode.childIds &&
    currentNode.childIds.includes(targetNodeId)
  );
}

// Thunk pour gérer la sélection d'un nœud et les actions correspondantes
export const handleNodeSelection = createAsyncThunk(
  'map/handleNodeSelection',
  async (nodeId, { dispatch, getState }) => {
    try {
      const state = getState();
      const nodes = state.map.path;

      // Trouver le nœud sélectionné
      const selectedNode = nodes.find((node) => node.id === nodeId);
      if (!selectedNode) {
        throw new Error(`Nœud avec ID ${nodeId} non trouvé`);
      }

      // Vérifier si le nœud est accessible depuis la position actuelle
      const isAccessible = isNodeAccessible(
        state.map.currentNodeId,
        nodeId,
        nodes
      );
      if (!isAccessible) {
        dispatch(
          setActionFeedback({
            message:
              "Ce lieu n'est pas accessible depuis votre position actuelle",
            type: 'warning',
          })
        );
        return { success: false, reason: 'inaccessible' };
      }

      // Mettre à jour le nœud courant
      dispatch(selectNode(nodeId));

      // Déterminer l'action en fonction du type de nœud
      switch (selectedNode.type) {
        case 'combat':
          dispatch(startNewCombat({ isElite: false, isBoss: false }));
          break;

        case 'elite':
          dispatch(startNewCombat({ isElite: true, isBoss: false }));
          break;

        case 'boss':
          dispatch(startNewCombat({ isElite: false, isBoss: true }));
          break;

        case 'shop':
          dispatch(setGamePhase('shop'));
          break;

        case 'rest':
          dispatch(setGamePhase('rest'));
          break;

        case 'event':
          dispatch(setGamePhase('event'));
          break;

        default:
          // Pour les nœuds de type 'start' ou autres, rester en exploration
          dispatch(setGamePhase('exploration'));
          break;
      }

      return {
        success: true,
        nodeType: selectedNode.type,
      };
    } catch (error) {
      console.error('Error selecting node:', error);

      dispatch(
        setActionFeedback({
          message: 'Erreur lors de la sélection du nœud',
          type: 'error',
        })
      );

      return {
        success: false,
        reason: 'error',
        error: error.message,
      };
    }
  }
);
