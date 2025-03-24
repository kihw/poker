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
  async ({ width, depth } = {}, { dispatch, getState }) => {
    try {
      // Indiquer que la génération de carte commence
      dispatch(startGeneratingMap());

      const state = getState();
      const stage = state.game.stage || 1;

      // Déterminer les dimensions de la carte en fonction du niveau
      const mapWidth = width || Math.min(3 + Math.floor(stage / 3), 6);
      const mapDepth = depth || Math.min(5 + Math.floor(stage / 2), 8);

      console.log(
        `Génération de la carte - Niveau: ${stage}, Largeur: ${mapWidth}, Profondeur: ${mapDepth}`
      );

      // Générer la carte
      const nodes = generateRoguelikeMap(stage, mapWidth, mapDepth);

      console.log('Carte générée:', nodes);

      // Valider la carte
      if (!validateMap(nodes)) {
        console.error('Carte générée invalide');
        throw new Error('Carte générée invalide');
      }

      // Mettre à jour l'état avec la nouvelle carte
      dispatch(mapGenerationSuccess(nodes));

      // Sélectionner automatiquement le nœud de départ
      const startNode = nodes.find((node) => node.type === 'start');
      if (startNode) {
        dispatch(selectNode(startNode.id));
      }

      // Feedback pour l'utilisateur
      dispatch(
        setActionFeedback({
          message: 'Carte générée avec succès',
          type: 'success',
        })
      );

      return nodes;
    } catch (error) {
      console.error('Erreur lors de la génération de la carte:', error);

      // Mettre à jour l'état avec l'erreur
      dispatch(mapGenerationFailure(error.message));

      // Feedback pour l'utilisateur
      dispatch(
        setActionFeedback({
          message: 'Erreur lors de la génération de la carte',
          type: 'error',
        })
      );

      // Tenter de générer une carte par défaut en cas d'échec
      try {
        const fallbackNodes = generateRoguelikeMap(1, 3, 5);
        dispatch(mapGenerationSuccess(fallbackNodes));

        const startNode = fallbackNodes.find((node) => node.type === 'start');
        if (startNode) {
          dispatch(selectNode(startNode.id));
        }

        return fallbackNodes;
      } catch (fallbackError) {
        console.error('Erreur lors de la génération de la carte de secours:', fallbackError);
        return null;
      }
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
  return currentNode && currentNode.childIds && currentNode.childIds.includes(targetNodeId);
}

// Thunk pour gérer la sélection d'un nœud et les actions correspondantes
export const handleNodeSelection = createAsyncThunk(
  'map/handleNodeSelection',
  async (nodeId, { dispatch, getState }) => {
    console.log('handleNodeSelection - Début', { nodeId });

    try {
      const state = getState();
      const nodes = state.map.path;
      const currentGamePhase = state.game.gamePhase;

      console.log('handleNodeSelection - État actuel', {
        gamePhase: currentGamePhase,
        currentNodeId: state.map.currentNodeId,
      });

      // Vérifier que nous sommes bien en phase d'exploration
      if (currentGamePhase !== 'exploration') {
        console.warn('Tentative de sélection de nœud hors phase exploration');

        // Feedback pour l'utilisateur
        dispatch(
          setActionFeedback({
            message: 'Navigation impossible dans la phase actuelle',
            type: 'warning',
          })
        );
        return { success: false, reason: 'wrong_phase' };
      }

      // Trouver le nœud sélectionné
      const selectedNode = nodes.find((node) => node.id === nodeId);
      if (!selectedNode) {
        throw new Error(`Nœud avec ID ${nodeId} non trouvé`);
      }

      // Vérifier si le nœud est accessible depuis la position actuelle
      const isAccessible = isNodeAccessible(state.map.currentNodeId, nodeId, nodes);

      if (!isAccessible) {
        console.warn(`Nœud ${nodeId} inaccessible`);

        dispatch(
          setActionFeedback({
            message: "Ce lieu n'est pas accessible depuis votre position actuelle",
            type: 'warning',
          })
        );
        return { success: false, reason: 'inaccessible' };
      }

      // Mettre à jour le nœud courant
      dispatch(selectNode(nodeId));

      // Déterminer l'action en fonction du type de nœud
      console.log('Type de nœud:', selectedNode.type);
      switch (selectedNode.type) {
        case 'combat':
          console.log("Démarrage d'un combat standard");
          await dispatch(startNewCombat({ isElite: false, isBoss: false }));
          break;

        case 'elite':
          console.log("Démarrage d'un combat d'élite");
          await dispatch(startNewCombat({ isElite: true, isBoss: false }));
          break;

        case 'boss':
          console.log("Démarrage d'un combat de boss");
          await dispatch(startNewCombat({ isElite: false, isBoss: true }));
          break;

        case 'shop':
          console.log('Accès à la boutique');
          dispatch(setGamePhase('shop'));
          break;

        case 'rest':
          console.log('Accès au site de repos');
          dispatch(setGamePhase('rest'));
          break;

        case 'event':
          console.log("Déclenchement d'un événement");
          dispatch(setGamePhase('event'));
          break;

        default:
          console.log("Nœud de type non géré, retour à l'exploration");
          dispatch(setGamePhase('exploration'));
          break;
      }

      return {
        success: true,
        nodeType: selectedNode.type,
      };
    } catch (error) {
      console.error('Erreur lors de la sélection du nœud:', error);

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

// Exporter tous les thunks pour utilisation
export default {
  generateNewMap,
  handleNodeSelection,
};
